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
  console.log('Connected to the in-memory SQlite database.');
});

var index_template = fs.readFileSync(path.join(__dirname, "templates/index.mustache"), 'utf8') + "";  //empty string concatenated forces conversion to string. Template is now a string and songs are sung
var profile_template = fs.readFileSync(path.join(__dirname, "templates/profile.mustache"), 'utf8') + "";
var help_template = fs.readFileSync(path.join(__dirname, "templates/help.mustache"), 'utf8') + "";
var search_template = fs.readFileSync(path.join(__dirname, "templates/search.mustache"), 'utf8') + "";
var login_template = fs.readFileSync(path.join(__dirname, "templates/login.mustache"), 'utf8') + "";
var settings_template = fs.readFileSync(path.join(__dirname, "templates/settings.mustache"), 'utf8') + "";
var navbar_html = fs.readFileSync(path.join(__dirname, "templates/navbar.mustache"), 'utf8') + "";
var policies_template = fs.readFileSync(path.join(__dirname, "templates/policies.mustache"), 'utf8') + "";
var suggest_template = fs.readFileSync(path.join(__dirname, "templates/suggest.mustache"), 'utf8') + "";
var report_template = fs.readFileSync(path.join(__dirname, "templates/report.mustache"), 'utf8') + "";
var footer_html = fs.readFileSync(path.join(__dirname, "templates/footer.mustache"), 'utf8') + "";

var data = {
  hero_image1: "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg",
  hero_image2: "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg",
  hobby_title: "Programming",
  hobby_picture1: "Programming",
  hobby_picture2: "Programming"
};

app.use(express.static("static"));

app.get("/", function (req, res) {
  var data = {};
  /*data.nav_one = " nav-active";
  navbar_html = Mustache.render(navbar_html, nav_data);*/
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  data.hero_image1 = "https://d2r55xnwy6nx47.cloudfront.net/uploads/2050/09/Interpolation-Applications_520x292.jpg";
  data.hero_image2 = "https://images2.content-hci.com/commimg/myhotcourses/blog/post/myhc_89683.jpg";
  let rendered_request = Mustache.render(index_template, data);
  res.send(rendered_request);
});

app.get("/profile", function (req, res) {
  var data = {};
  /*data.nav_two = " nav-active";
  navbar_html = Mustache.render(navbar_html, nav_data);*/
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(profile_template, data);
  res.send(rendered_request);
});

app.get("/settings", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(settings_template, data);
  res.send(rendered_request);
});

app.get("/help", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(help_template, data);
  res.send(rendered_request);
});

app.get("/search", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(search_template, data);
  res.send(rendered_request);
});

app.get("/login", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(login_template, data);
  res.send(rendered_request);
});

app.get("/policies", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(policies_template, data);
  res.send(rendered_request);
});

app.get("/suggest", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(suggest_template, data);
  res.send(rendered_request);
});

app.get("/report", function (req, res) {
  var data = {};
  data.navbar_html = navbar_html;
  data.footer_html = footer_html;
  let rendered_request = Mustache.render(report_template, data);
  res.send(rendered_request);
});


app.listen(port, function() {
    console.log('Server running at http://${hostname}:${port}/');
});
