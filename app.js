// Imports
const fs = require("fs");
const path = require("path");
const http = require("http");
const Mustache = require('mustache');
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
var crypto = require("crypto");


const app = express();

// Environment variables
const hostname = "127.0.0.1";
const port = 8000;

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
  description: "description"
};

app.use(express.static("static"));
app.use(express.urlencoded());

app.get("/", (req, res) => {
  let data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  data.hero_image1 = "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg";
  data.hero_image2 = "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg";
  data.hobby_name = "Programming";
  data.description = "Computer programming is the process of performing a particular computation, usually by designing and building an executable computer program. Programming involves tasks such as analysis, generating algorithms, profiling algorithms' accuracy and resource consumption, and the implementation of algorithms. Video games, apps, websites, or anything else done with a computer or phone requires some one or even teams of people to design and build them through programming. If you can program, you could build your own website, application, video game, or anything else you can think of!";
  
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
  // Check if form was submitted
    // Attempt to load userinfo from database ("hey, does this username exist")
      // For the sake of testing, always authenticate
      // Set a cookie 

  // If no data was submitted, just render default page
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
