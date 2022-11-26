/*
setup express server for basic routes
then worry about grabbing data from db
*/
// Imports
const fs = require("fs");
const path = require("path");
const http = require("http");
const Mustache = require('mustache');
const express = require("express");
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Environment variables
const hostname = "127.0.0.1";
const port = 8000;

let db = new sqlite3.Database('data.sqlite', (err) => {  //Remember to eventually close the database with db.close();
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

let sql = 'SELECT DISTINCT hobby_name FROM hobby'; //select column_name FROM table_name

db.all('SELECT DISTINCT hobby_name FROM hobby', [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.hobby_name);
  });
});

const index_template = fs.readFileSync(path.join(__dirname, "templates/index.mustache"), 'utf8') + "";  //empty string concatenated forces conversion to string. Template is now a string and songs are sung
const profile_template = fs.readFileSync(path.join(__dirname, "templates/profile.mustache"), 'utf8') + "";
const help_template = fs.readFileSync(path.join(__dirname, "templates/help.mustache"), 'utf8') + "";
const search_template = fs.readFileSync(path.join(__dirname, "templates/search.mustache"), 'utf8') + "";
const login_template = fs.readFileSync(path.join(__dirname, "templates/login.mustache"), 'utf8') + "";
const settings_template = fs.readFileSync(path.join(__dirname, "templates/settings.mustache"), 'utf8') + "";
const navbar_html = fs.readFileSync(path.join(__dirname, "templates/navbar.mustache"), 'utf8') + "";
const policies_template = fs.readFileSync(path.join(__dirname, "templates/policies.mustache"), 'utf8') + "";
const suggest_template = fs.readFileSync(path.join(__dirname, "templates/suggest.mustache"), 'utf8') + "";
const report_template = fs.readFileSync(path.join(__dirname, "templates/report.mustache"), 'utf8') + "";
const footer_html = fs.readFileSync(path.join(__dirname, "templates/footer.mustache"), 'utf8') + "";

let data = {
  hero_image1: "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg",
  hero_image2: "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg",
  hobby_title: "Programming",
  hobby_picture1: "Programming",
  hobby_picture2: "Programming",
  hobby_description: "hobby_description"
};

app.use(express.static("static"));
app.use(express.urlencoded());

/*
SELECT hobby_name FROM hobby
LIMIT 1;                            <- Selects just one hobby_name from hobby

SELECT hobby_name FROM hobby
WHERE int_social_non_social = 0;    <- that selects all non social hobbies

SELECT hobby_name FROM hobby
WHERE int_social_non_social = 1
AND int_indoor_outdoor = 3;         <- selects all social hobbies that are ALSO outdoor hobbies
})

SELECT hobby_name FROM hobby
WHERE int_social_non_social = 0
OR int_indoor_outdoor = 3;          <- selects all hobbies that are non-social OR are outdoor (all non-social hobbies plus all outdoor social hobbies)


app.post('http://localhost:8000/api/', (req, res) => {
  const accepted = req.body.accepted
  //mark hobby as liked or disliked
  db.all(`SELECT hobby_name FROM hobby LIMIT 1`, [], (err, rows) => {
    //refresh the page and display new hobby information
    res.json(index_template);
  });
})
*/

app.get("/", (req, res) => {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  data.hero_image1 = "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg";
  data.hero_image2 = "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg";
  data.hobby_name = "Programming";
  data.hobby_description = "Computer programming is the process of performing a particular computation, usually by designing and building an executable computer program. Programming involves tasks such as analysis, generating algorithms, profiling algorithms' accuracy and resource consumption, and the implementation of algorithms. Video games, apps, websites, or anything else done with a computer or phone requires some one or even teams of people to design and build them through programming. If you can program, you could build your own website, application, video game, or anything else you can think of!";
  
  let rendered_response = Mustache.render(index_template, data);
  res.send(rendered_response);
});

app.post("/", (req, res) => {
  let action = req.body.action;
  let hobby_name = req.body.hobby_name;

  if (action == "like") {
    //flag hobby as liked
  } else {
    //flag hobby as disliked
  }

  let template_data = {};
  
  db.all('SELECT DISTINCT hobby_name, primary_category FROM hobby ORDER BY Random() LIMIT 1', [], (err, rows) => {
    if (err) {
      console.log("Database error");
      throw err;
    }

    template_data.hobby_name = rows[0].hobby_name;
    template_data.hobby_id = rows[0].hobby_id;
    template_data.primary_category = rows[0].primary_category;

    console.log(rows);

    res.send(Mustache.render(index_template, template_data));
  });
});

app.get("/profile", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(profile_template, data);
  res.send(rendered_request);
});

app.get("/settings", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(settings_template, data);
  res.send(rendered_request);
});

app.get("/help", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(help_template, data);
  res.send(rendered_request);
});

app.get("/search", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(search_template, data);
  res.send(rendered_request);
});

app.get("/login", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(login_template, data);
  res.send(rendered_request);
});

app.get("/policies", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(policies_template, data);
  res.send(rendered_request);
});

app.get("/suggest", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(suggest_template, data);
  res.send(rendered_request);
});

app.get("/report", function (req, res) {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(report_template, data);
  res.send(rendered_request);
});


app.listen(port, function() {
    console.log('Server running at http://${hostname}:${port}/');
});
