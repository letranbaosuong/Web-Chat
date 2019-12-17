var socket = io("http://localhost:3000");

var s, hoten, msg

socket.on('svgtChat', function(data){
	var hoten = "<span class='hoten'>" + data.username + ": </span>"
	var msg = "<span class='msg'>" + data.message + "</span>"
	$('#dsMsg').append(hoten + msg + "<div class='block'></div>")
})

socket.on('server_gui_kqua', function(data){

	if (!data.ketqua) {
		alert('Đăng ký thành công Username: ' + data.user)
		$('#tenUserdaDK').show(1000)
		$('#txtMessage').show(1000)
		$('#btnSendChat').show(1000)
		$('#txtUser').hide(1000)
		$('#btnDangKy').hide(1000)
	} else {
		alert('Đã tồn tại Username: ' + data.user + '. Mời bạn đăng ký một tên khác nha...')
	}
})

socket.on('server_gui_ds_user_name', function(data){
	$('#danhsachUsersOnline').empty()
	for (var i = 0; i < data.danhsach.length; i++) {
		var dsuser = "<div class='motUser'>"+data.danhsach[i]+"</div>"
		$('#danhsachUsersOnline').append(dsuser);
	}
})

socket.on('server_gui_tenUserdaDK', function(data){
	$('#tenUserdaDK').text(data.tenUserDaDK)
})

$(document).ready(function(){

	// Demo Chat
	$('#tenUserdaDK').hide()
	$('#txtMessage').hide()
	$('#btnSendChat').hide()

	$('#btnchat').click(function(){
		$('#chat').show(2000);
		$('#btnchat').hide();
		$('#capnhat').hide()
		$('#dieukhien').hide(1000)
		$('#btnControl').show()
	})

	$('#btnDangKy').click(function(){
		socket.emit('client_dangky_user_name', $('#txtUser').val())
	})

	$("#btnSendChat").click(function(){
		socket.emit('client_gui_tinChat', $('#txtMessage').val())
		$('#txtMessage').val('')
	})

});