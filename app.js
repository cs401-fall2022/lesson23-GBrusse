const fs = require("fs");
const path = require("path");
const http = require("http");
const Mustache = require('mustache');
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const crypto = require("crypto");
const cookieParser = require('cookie-parser')

// Environment variables
const hostname = "127.0.0.1";
const port = 8000;

// ---------- Create Express App ----------
const app = express();
app.use(cookieParser());
app.use(express.static("static"));
app.use(express.urlencoded());

// ---------- Session Management ----------
let SESSIONS = {};

function create_session(user_id) {
  // randomly generate a session_id
  let session_id = crypto.randomBytes(20).toString('hex');

  SESSIONS[session_id] = user_id;

  return session_id;
}

function destroy_session(session_id) {
  delete SESSIONS[session_id];
}

function is_logged_in(req) {
  console.log(SESSIONS);
  return req.cookies.session !== undefined && SESSIONS[req.cookies.session] !== undefined;
}

// ---------- Connect to Database ----------
let db = new sqlite3.Database('data.sqlite', (err) => {  //Remember to eventually close the database with db.close();
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

/*
let sql = 'SELECT DISTINCT hobby_name FROM hobby'; //select column_name FROM table_name
db.all('SELECT DISTINCT hobby_name FROM hobby', [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.hobby_name);
  });
});
*/

// ---------- Load Templates ----------
const index_template = fs.readFileSync(path.join(__dirname, "templates/index.mustache"), 'utf8') + "";  //empty string concatenated forces conversion to string. Template is now a string and songs are sung
const profile_template = fs.readFileSync(path.join(__dirname, "templates/profile.mustache"), 'utf8') + "";
const help_template = fs.readFileSync(path.join(__dirname, "templates/help.mustache"), 'utf8') + "";
const search_template = fs.readFileSync(path.join(__dirname, "templates/search.mustache"), 'utf8') + "";
const login_template = fs.readFileSync(path.join(__dirname, "templates/login.mustache"), 'utf8') + "";
const settings_template = fs.readFileSync(path.join(__dirname, "templates/settings.mustache"), 'utf8') + "";
const navbar_template = fs.readFileSync(path.join(__dirname, "templates/navbar.mustache"), 'utf8') + "";
const policies_template = fs.readFileSync(path.join(__dirname, "templates/policies.mustache"), 'utf8') + "";
const suggest_template = fs.readFileSync(path.join(__dirname, "templates/suggest.mustache"), 'utf8') + "";
const report_template = fs.readFileSync(path.join(__dirname, "templates/report.mustache"), 'utf8') + "";

// html file
const footer_html = fs.readFileSync(path.join(__dirname, "templates/footer.mustache"), 'utf8') + "";
const login_error_html = fs.readFileSync(path.join(__dirname, "templates/login_error.mustache"), 'utf8') + "";

// ---------- Page Utils ----------
function common_page_data(req, page_num) {
  let common = {};
  common.footer_html = footer_html;

  // Render nav
  let nav_data = {};
  switch (page_num) {
    case 1:
      nav_data.nav_one = " nav-active";
      break;
    
    case 2:
      nav_data.nav_two = " nav-active";
      break;
      
    case 3:
      nav_data.nav_three = " nav-active";
      break;
      
    case 4:
      nav_data.nav_four = " nav-active";
      break;
      
    case 5:
      nav_data.nav_five = " nav-active";
      break;
    
    case 6:
      nav_data.nav_six = " nav-active";
      break;
    
    case 7:
      nav_data.nav_seven = " nav-active";
      break;

    default:
      break;
  }

  if (is_logged_in(req)) {
    // User is logged in
    nav_data.log_btn = "Log Out";
    common.navbar_html = Mustache.render(navbar_template, nav_data);
  } else {
    // User is not logged in
    nav_data.log_btn = "Log In";
    common.navbar_html = Mustache.render(navbar_template, nav_data);
  }

  return common;
}


// ---------- Create Routes ----------
app.get("/", (req, res) => {
  let template_data = common_page_data(req, 2);

  template_data.hero_image1 = "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg";
  template_data.hero_image2 = "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg";
  template_data.hobby_name = "Programming";
  template_data.description = "Computer programming is the process of performing a particular computation, usually by designing and building an executable computer program. Programming involves tasks such as analysis, generating algorithms, profiling algorithms' accuracy and resource consumption, and the implementation of algorithms. Video games, apps, websites, or anything else done with a computer or phone requires some one or even teams of people to design and build them through programming. If you can program, you could build your own website, application, video game, or anything else you can think of!";
  
  let rendered_response = Mustache.render(index_template, template_data);
  res.send(rendered_response);
});

app.post("/", (req, res) => {
  let template_data = common_page_data(req, 2);

  let action = req.body.action;
  let hobby_id = req.body.hobby_id;

  if (is_logged_in(req) && Number.isInteger(hobby_id)) {
    if (action == "like") { // flag hobby as liked

      // SQL: Get the likes field from the currently logged in user
      let stmt = db.prepare("SELECT liked FROM users WHERE uid = ?");
      stmt.get(SESSIONS[req.cookies.session], (err, row) => {
        if (row.liked != null) {
          row.liked += ","
        }
        row.liked += hobby_id.toString();
        let insertStmt = db.prepare("UPDATE users SET liked = ? WHERE uid = ?");
        insertStmt.run(row.liked, SESSIONS[req.cookies.session], (err) => {
          // handle error, if any
        });
        //add hobby to likes column in users table in data.sqlite
        let updateStmt = db.prepare("UPDATE users SET likes = likes + 1 WHERE uid = ?");
      });
      stmt.finalize();
         
    } else { // flag hobby as disliked
      
      let stmt = db.prepare("SELECT dislikes FROM users WHERE uid = ?");
      stmt.get(SESSIONS[req.cookies.session], (err, row) => {
        if (row.dislikes != null) {
          row.dislikes += ","
        }
        row.dislikes += hobby_id.toString();
        let insertStmt = db.prepare("UPDATE users SET dislikes = ? WHERE uid = ?");
        insertStmt.run(row.dislikes, SESSIONS[req.cookies.session], (err) => {
          // handle error, if any
        });
        //add hobby to dislikes column in users table in data.sqlite
        let updateStmt = db.prepare("UPDATE users SET dislikes = dislikes + 1 WHERE uid = ?");
      });
    }
  }
  
  db.all('SELECT DISTINCT hobby_name, primary_category, description FROM hobby ORDER BY Random() LIMIT 1', [], (err, rows) => {
    if (err) {
      console.log("Database error");
      throw err;
    }

    template_data.hobby_name = rows[0].hobby_name;
    template_data.hobby_id = rows[0].hobby_id;
    template_data.primary_category = rows[0].primary_category;
    template_data.description = rows[0].description;

    console.log(rows);

    res.send(Mustache.render(index_template, template_data));
  });
});

app.get("/profile", function (req, res) {
  let template_data = common_page_data(req, 1);
  let rendered_request = Mustache.render(profile_template, template_data);
  res.send(rendered_request);
});

app.get("/settings", function (req, res) {
  let template_data = common_page_data(req, 7);
  let rendered_request = Mustache.render(settings_template, template_data);
  res.send(rendered_request);
});

app.get("/help", function (req, res) {
  let template_data = common_page_data(req, 3);
  let rendered_request = Mustache.render(help_template, template_data);
  res.send(rendered_request);
});

app.get("/search", function (req, res) {
  let template_data = common_page_data(req, 5);
  let rendered_request = Mustache.render(search_template, template_data);
  res.send(rendered_request);
});

app.get("/login", function (req, res) {
  // If already logged in...
  // NOTE: logging out from a plain link is a bad idea
  if (is_logged_in(req)) {
    // destroy session and redirect to referer
    destroy_session(req.cookies.session);
    let ref = req.get('Referrer');
    res.redirect(303, ref);
  } else {
    let template_data = common_page_data(req, 6);
    let rendered_request = Mustache.render(login_template, template_data);
    res.send(rendered_request);
  }
});

app.post("/login", (req, res) => {
  let stmt = db.prepare("SELECT * FROM users WHERE uname = ?");
  stmt.get(req.body.uname, (err, row) => {
    if (row !== undefined && req.body.passwd == row.passwd) {  // TODO: not secure. demo only.
      let session_id = create_session(row.uid);
      res.cookie("session", session_id);
      res.redirect(303, "/"); 
    } else {
      let template_data = common_page_data(req, 6);
      template_data.login_error = login_error_html;
      let rendered_request = Mustache.render(login_template, template_data);
      res.send(rendered_request);
    }
  });
  stmt.finalize();
});

app.get("/policies", function (req, res) {
  let template_data = common_page_data(req, 3);
  let rendered_request = Mustache.render(policies_template, template_data);
  res.send(rendered_request);
});

app.get("/suggest", function (req, res) {
  let template_data = common_page_data(req, 3);
  let rendered_request = Mustache.render(suggest_template, template_data);
  res.send(rendered_request);
});

app.get("/report", function (req, res) {
  let template_data = common_page_data(req, 3);
  let rendered_request = Mustache.render(report_template, template_data);
  res.send(rendered_request);
});

// ---------- Start Server ----------
app.listen(port, function() {
    console.log('Server running at http://${hostname}:${port}/');
});
