var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var mysql = require('mysql')

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(4000);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

var obj = {}
app.get('/data', function(req,res){
	con.query('SELECT * FROM `users`', function(err, result){

		if (err) {
			throw err;
		} else {
			obj = {print: result};
			res.render('print', obj);
		}
	})
})