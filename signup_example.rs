/*

// signup.hbs

<div class="login-box">
    <form class="login-box__form" method="POST" action="/signup">
        <h1 class="login-box__form__heading">Sign Up</h1>
        <p class="login-box__form__error">{{error_msg}}</p>

        <label class="login-box__form__label" for="email">Email</label>
        <input class="login-box__form__text-box" type="email" name="email" required>

        <label class="login-box__form__label" for="username">Username</label>
        <input class="login-box__form__text-box" id="username" type="text" name="username" minlength="3" maxlength="20" required>

        <label class="login-box__form__label" for="password">Password</label>
        <input class="login-box__form__text-box" type="password" name="password" minlength="12" maxlength="64" required>
        <p class="login-box__form__detail">Use at least 12 characters</p>

        <div class="login-box__form__checkbox-container">
            <input class="login-box__form__checkbox" type="checkbox" name="agree" required>
            <label class="login-box__form__checkbox-label" for="agree">I have read and agree to the <a class="login-box__form__extra__link" href="/tos">Terms of Service.</a></label>
        </div>

        <input class="login-box__form__button" type="submit" value="Sign Up">
        <p class="login-box__form__extra">Already have an account? <a class="login-box__form__extra__link" href="/login">Log In</a></p>
    </form>
</div>
<script>
    window.onload = () => {
        document.getElementById("username").onchange = checkUsername;
    }

    function checkUsername() {
        const username = document.getElementById("username");
        const constraint = new RegExp("^[a-zA-Z0-9.]*$");
    
        if (constraint.test(username.value)) {
            username.setCustomValidity("");
        } else {
            username.setCustomValidity("You can use letters, numbers, and periods");
        }
    }
</script>

*/

enum SignupError {
    Email,
    Username,
    Password,
    Agree,
    Server,
}

#[derive(Debug, Deserialize)]
struct SignupForm {
    email: String,
    username: String,
    password: String,
    agree: Option<String>,
}

impl SignupForm {
    fn validate(&self) -> Result<(), SignupError> {
        // An email must contain an @ symbol. Any further verification potentially rejects valid emails.
        // The best way to validate an email is to send it something.
        if !Regex::new(r"^.+@.+$").unwrap().is_match(&self.email) {
            return Err(SignupError::Email);
        }

        if !Regex::new(r"^[a-zA-Z0-9.]{3,20}$").unwrap().is_match(&self.username) {
            return Err(SignupError::Username);
        }

        if !(12..=64).contains(&self.password.len()) {
            return Err(SignupError::Password);
        }

        let Some(agree) = &self.agree else {
            return Err(SignupError::Agree);
        };
        
        if !agree.eq("on") {
            return Err(SignupError::Agree);
        }

        Ok(())
    }
}

async fn signup_post(State(state): State<AppState>, Form(signup_form): Form<SignupForm>) -> impl IntoResponse {
    // NOTE: A user shouldn't be able to tell if an email has been used before
    let mut validation = signup_form.validate();

    if validation.is_ok() {
        // 1 - hash password
        // Unicode normalise the password before hashing
        let form_password = Cow::from(signup_form.password);
        let opaque_string = OpaqueString::new().prepare(form_password);
        if let Ok(normalized_password) = opaque_string {
            // Password hashing is slow and needs to be run in a background thread
            let hash_result: Result<Result<String, ArgonError>, tokio::task::JoinError> = tokio::task::spawn_blocking(move || {
                let salt = SaltString::generate(&mut OsRng_08);
                let hash = Argon2::default().hash_password(&normalized_password.as_bytes(), &salt);
                Ok(hash?.to_string())
            }).await;

            if let Ok(Ok(hash)) = hash_result {
                let user = User {
                    uid: ID::new_random().to_string(),
                    created: get_timestamp() as i64,
                    confirmed: false,
                    email: signup_form.email,
                    username: signup_form.username,
                    password: hash,
                    balance: 1000,
                    referrer: None
                };

                // 2 - attempt to create row in database
                let db_result = sqlx::query("INSERT INTO usersx (uid, created, confirmed, email, username, password, balance, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?);")
                    .bind(&user.uid)
                    .bind(&user.created)
                    .bind(&user.confirmed)
                    .bind(&user.email)
                    .bind(&user.username)
                    .bind(&user.password)
                    .bind(&user.balance)
                    .bind(&user.referrer)
                    .execute(&state.pool)
                    .await;
                
                // 3 - send confirmation email to user if insert was successful
                //     send different email if database said the email was already in use
                //     don't send an email for any other error message
                //     set `validation` to `SingupError::Username` if username was taken
                //     set `validation` to `SingupError::Server` for any other error
                match db_result {
                    Ok(_) => {
                        // Successfully insert into database!
                        // Send confirmation to user
                        if let Some(keypair) = get_keypair() {

                            // TODO - add confirmation code to database
                            //let confirm_link = format!("https://www.dirtcoin.lol/confirm?code={}", code);
                        
                            let mut email_data = BTreeMap::new();
                            email_data.insert("username".to_string(), user.username);
                            email_data.insert("confirm_link".to_string(), confirm_link);
                            let text = state.hbs.render("email_confirm", &email_data).unwrap();

                            EmailMessage {
                                from: dotenvy::var("EMAIL_FROM").unwrap(),
                                to: user.email,
                                subject: "Welcome to DirtCoin!".to_string(),
                                text,
                            }.send().await;
                        } else {
                            validation = Err(SignupError::Server);
                        }
                    },
                    Err(sqlx::Error::Database(e)) => {
                        let code: Cow<str> = e.code().unwrap(); // This unwrap should never fail
                        if code.eq("2067") && e.message().contains("usersx.email") {
                            // Email was taken, send different email to user
                            let email_data: BTreeMap<String, String> = BTreeMap::new();
                            let text = state.hbs.render("email_duplicate", &email_data).unwrap();

                            EmailMessage {
                                from: dotenvy::var("EMAIL_FROM").unwrap(),
                                to: user.email,
                                subject: "Welcome back to DirtCoin!".to_string(),
                                text,
                            }.send().await;

                        } else if code.eq("2067") && e.message().contains("usersx.username") {
                            // username was taken
                            validation = Err(SignupError::Username);

                        } else {
                            // some other database error
                            tracing::error!("Failed to insert new user: {:?}", e);
                            validation = Err(SignupError::Server);
                        }
                    },
                    Err(e) => {
                        // some other database error
                        tracing::error!("Failed to insert new user: {:?}", e);
                        validation = Err(SignupError::Server);
                    },
                }
            } else {
                tracing::error!("Failed to hash new user's password: {:?}", hash_result);
                validation = Err(SignupError::Server);
            }
        } else {
            tracing::error!("Failed to normalize new user's password: {:?}", opaque_string);
            validation = Err(SignupError::Password);
        }
    } else {
        tracing::info!("Registration form failed validation: {:?}", signup_form);
    }

    let error_message = match validation {
        Ok(_) => {
            // TODO - Render success page that tells user to check their email
            let mut body_data = BTreeMap::new();
            body_data.insert("error_msg", "SUCCESS");
            let body_html = state.hbs.render("signup", &body_data).unwrap();
        
            let mut data = BTreeMap::new();
            data.insert("title_ext".to_string(), " - Sign Up".to_string());
            data.insert("body_html".to_string(), body_html);
            let body = minify(&state.hbs.render("boilerplate", &data).unwrap().as_bytes(), &Cfg::spec_compliant());
        
            return Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "text/html")
                .body(body::boxed(Full::from(body)))
                .unwrap();
        },
        Err(SignupError::Email) => "Invalid email.",
        Err(SignupError::Username) => "Please choose a different username.",
        Err(SignupError::Password) => "Invalid password.",
        Err(SignupError::Agree) => "You must agree to the Terms of Service.",
        Err(SignupError::Server) => "Server error. Please try again.",
    };

    let mut body_data = BTreeMap::new();
    body_data.insert("error_msg", error_message);
    let body_html = state.hbs.render("signup", &body_data).unwrap();

    let mut data = BTreeMap::new();
    data.insert("title_ext".to_string(), " - Sign Up".to_string());
    data.insert("body_html".to_string(), body_html);
    let body = minify(&state.hbs.render("boilerplate", &data).unwrap().as_bytes(), &Cfg::spec_compliant());

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "text/html")
        .body(body::boxed(Full::from(body)))
        .unwrap()
}
