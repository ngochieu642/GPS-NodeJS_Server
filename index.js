var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);

//Set up Server and SerialPort
server.listen(process.env.PORT || 3000);
console.log("GPS Server is Running");

//Display html
app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});

//List of clients
var androidClients = [];

 //Listen to Socket.io Client
 io.sockets.on('connection',function(socket){
     
     //Say hi to client!
     socket.emit('news',{hello: 'world'});

     console.log("Device connected to the server");
     
     //Listen to Client respond
     socket.on('android-client-connected',function(hi_message){
        //Add Android Clients to androidClients array
        androidClients.push(socket.id);

        //log
        console.log('Android Client Connected!\nID: '+socket.id);
        console.log(hi_message);
        
        socket.on('disconnect',function(){
            //Remove from the list if disconnect
            androidClients.splice(androidClients.indexOf(socket.id),1);

            console.log('\n\nID: '+ socket.id);
            console.log('Android Client got disconnect');
        });
     });

     socket.on('base-send-GPS-message',function(myObj){
        
        //Check data
        var data = myObj.GPS;
        console.log('\n\nReceive '+data.length +' bytes from Base');
        console.log('ID: ' + socket.id);
        console.log(data);
        console.log(myObj.count + " times");

         //Log list of Android Devices and send to them
        console.log("\nSending to list of Android devices:")
        androidClients.forEach(function(entry){
            console.log(entry);
            io.sockets.connected[entry].emit('server-send-GPS-message',myObj);
         });
        console.log('------------------------------------')
     })
 });
