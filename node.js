/*
setup express server for basic routes
then worry about grabbing data from db
*/
// Imports
const fs = require("fs");
const path = require("path");
const http = require("http");
const Mustache = require('mustache');

// Environment variables
const hostname = "127.0.0.1";
const port = 8000;

var index_template = fs.readFileSync(path.join(__dirname, "index.mustache"), 'utf8') + "";  //empty string concatenated forces conversion to string. Template is now a string and songs are sung

var data = {
  msg: "Hello, world!",
};


const server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    let rendered_request = Mustache.render(index_template, data);
    res.end(rendered_request);
});

server.listen(port, hostname, function() {
    console.log('Server running at http://${hostname}:${port}/');
});
