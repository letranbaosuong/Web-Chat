var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(3000);

var esp8266 = io.of('/esp8266')       //namespace của esp8266
var webapp = io.of('/webapp')       //namespace của webapp

var led = [true, true, true]

var stateLed = {"led": led}
// '{"ledDo" : "false", "ledXanh" : "false","ledVang" : "false"}'

// var middleware = require('socketio-wildcard')();    //Để có thể bắt toàn bộ lệnh!
// esp8266.use(middleware);                  //Khi esp8266 emit bất kỳ lệnh gì lên thì sẽ bị bắt
// webapp.use(middleware);                 //Khi webapp emit bất kỳ lệnh gì lên thì sẽ bị bắt

//giải nén chuỗi JSON thành các OBJECT
function ParseJson(jsondata) {
    try {
        return JSON.parse(jsondata);
    } catch (error) {
        return null;
    }
}

io.on('connection', function(socket){

  console.log('ket noi : ' + socket.id);

  socket.on('disconnect', function(){
    console.log('ngat ket noi : ' + socket.id);
  })

  var interval1 = setInterval(function() {
    //đảo trạng thái của mảng led, đảo cho vui để ở Arduino nó nhấp nháy cho vui.
    for (var i = 0; i < led.length; i++) {
      led[i] = !led[i]
    }
    
    //Cài đặt chuỗi JSON, tên biến JSON này là json 
    var json = {
      "led": led //có một phần tử là "led", phần tử này chứa giá trị của mảng led.
    }
    socket.emit('store_state_Led', json) //Gửi lệnh LED với các tham số của của chuỗi JSON
    console.log("send LED")//Ghi ra console.log là đã gửi lệnh LED
  }, 200)//200ms

})

//Bắt các sự kiện khi esp8266 kết nối
esp8266.on('connection', function(socket) {
  console.log('esp8266 connected')
  
  socket.on('disconnect', function() {
    console.log("Disconnect socket esp8266")
  })
  
  //nhận được bất cứ lệnh nào
  socket.on('*', function(packet) {
    console.log('esp8266 rev and send to webapp packet: ', packet.data) //in ra để debug
    var eventName = packet.data[0]
    var eventJson = packet.data[1] || {} //nếu gửi thêm json thì lấy json từ lệnh gửi, không thì gửi chuỗi json rỗng, {}
    // webapp.emit(eventName, eventJson) //gửi toàn bộ lệnh + json đến webapp
  })

  esp8266.emit('store_state_Led', stateLed)
})

//Bắt các sự kiện khi webapp kết nối
 
webapp.on('connection', function(socket) {
  
  console.log('webapp connected' + socket.id)
  
  //Khi webapp socket bị mất kết nối
  socket.on('disconnect', function() {
    console.log("Disconnect socket webapp")
  })
  
  socket.on('*', function(packet) {
    console.log("webapp rev and send to esp8266 packet: ", packet.data) //in ra để debug
    var eventName = packet.data[0]
    var eventJson = (packet.data[1]) || {} //nếu gửi thêm json thì lấy json từ lệnh gửi, không thì gửi chuỗi json rỗng, {}
    // esp8266.emit(eventName, eventJson) //gửi toàn bộ lệnh + json đến esp8266
    // webapp.emit(eventName, eventName)
  });

  socket.on('dieu_khien_led_tu_webapp', function(data){
    console.log(data);
    led[0] = data.led[0] ;
    led[1] = data.led[1] ;
    led[2] = data.led[2] ;
    webapp.emit('store_state_Led', stateLed)
    esp8266.emit('store_state_Led', stateLed)
  })

  // var stateLed_obj = JSON.parse(stateLed)
  // console.log('stateLed = ' + ParseJson(stateLed).ledDo + ',' + ParseJson(stateLed).ledXanh + ',' + ParseJson(stateLed).ledVang)
  webapp.emit('store_state_Led', stateLed)
})


app.get("/", function(req, res){
  res.render("trangchu");
});