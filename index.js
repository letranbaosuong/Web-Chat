
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var mysql = require('mysql')

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var arrayUser = ['Arduino']
var tonTai = true

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "status"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM led", function (err, result, fields) {
    if (err) throw err;
    console.log(result[0]);

    led = [Boolean(result[0].ledDo), Boolean(result[0].ledXanh), Boolean(result[0].ledVang)]
	json = {
		"led": led //có một phần tử là "led", phần tử này chứa giá trị của mảng led.
	}
  });

  var sql = "DELETE FROM `chat` WHERE 1";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Delete User and Message");
  });
});

//Khi có mệt kết nối được tạo giữa Socket Client và Socket Server
io.on('connection', function(socket) {	
	
    console.log("Connected : " + socket.id);

    io.sockets.emit('server_gui_ds_user_name', { danhsach : arrayUser })

    socket.on('client_xin_lay_dsUsersOnlineMessage', function(){
    	var sql = "SELECT * FROM `chat` WHERE 1";
	    con.query(sql, function (err,results, fields) {
	        if (err) throw err;
	        // console.log(results);
	        socket.emit('server_gui_dsNdMessage', results)
	    });
	    socket.emit('server_gui_dsUsersOnline', arrayUser)
    })

    socket.on('client_gui_tinChat', function(data){
    	console.log(socket.user + ' : ' + data)
    	io.sockets.emit('svgtChat', { chatContent : socket.user + ': ' + data, username : socket.user, message : data })

    	var sql = "INSERT INTO `chat`(`user`, `message`, `time`) VALUES (\""+ socket.user +"\",\""+ data +"\",\""+ String(Date()) +"\")";
		  con.query(sql, function (err, result) {
		    if (err) throw err;
		    console.log("Message updated");
		  });
    })

    socket.on('adnDKy', function(data){
    	console.log(data.user)
    	if (arrayUser.indexOf(data.user) == -1) {
    		// không tồn tại user được đăng ký
    		arrayUser.push(data.user)
    		tonTai = false
    		socket.user = data.user
    		console.log('Dang ky thanh cong : ' + data.user)
    		io.sockets.emit('server_gui_ds_user_name', { danhsach : arrayUser })
    		socket.emit('server_gui_tenUserdaDK', { tenUserDaDK : data.user })
    	} else {
    		console.log('Da ton tai: ' + data.user)
    		tonTai = true
    	}

    	// gửi kết quả đăng ký user
    	socket.emit('server_gui_kqua', { ketqua : tonTai, user : data.user })
    })

    socket.on('client_dangky_user_name', function(data){
    	console.log(data)
    	if (arrayUser.indexOf(data) == -1) {
    		// không tồn tại user được đăng ký
    		arrayUser.push(data)
    		tonTai = false
    		socket.user = data
    		console.log('Dang ky thanh cong : ' + data)
    		io.sockets.emit('server_gui_ds_user_name', { danhsach : arrayUser })
    		socket.emit('server_gui_tenUserdaDK', { tenUserDaDK : data })
    	} else {
    		console.log('Da ton tai: ' + data)
    		tonTai = true
    	}

    	// gửi kết quả đăng ký user
    	socket.emit('server_gui_kqua', { ketqua : tonTai, user : data })

    })

	//Khi socket client bị mất kết nối thì chạy hàm sau.
	socket.on('disconnect', function() {
		console.log("disconnect : " + socket.id + ', username: ' + socket.user) 	//in ra màn hình console cho vui
		// clearInterval(interval1)		//xóa chu kỳ nhiệm vụ đi, chứ không xóa là cái task kia cứ chạy mãi thôi đó!
		var i = arrayUser.indexOf(socket.user);
		if (i != -1) {
		    arrayUser.splice(i,1);
		}
		console.log('arrayUser con: ' + arrayUser.length)
		io.sockets.emit('server_gui_ds_user_name', { danhsach : arrayUser })
	})
});

app.get("/", function(req, res){
	var sql = "SELECT * FROM `chat` WHERE 1";
    con.query(sql, function (err,results, fields) {
        if (err) throw err;

        console.log('Message into Webapp')
        
        res.render("trangchu", { data : results });
    });
    
});

app.get("/chat", function(req, res){
	var sql = "SELECT * FROM `chat` WHERE 1";
    con.query(sql, function (err,results, fields) {
        if (err) throw err;
		console.log(results);
		
        res.render("chat", { data : results });
    });
    
});