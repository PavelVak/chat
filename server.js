var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var path = require('path')

var users = [];
var connections = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('a user connected - amount of connections: ', connections.length);

    // Disconected
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUserNames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('a user disconnected - amount of connections: ', connections.length);
    });

    // Send Message
    socket.on('send message', function(data){
        console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    // Send Image
    socket.on('base64 file', function (data) {
        console.log('received base64 file from ' + socket.username);
        // socket.broadcast.emit('base64 image', //exclude sender
        console.log(data);
        io.sockets.emit('base64 file', {user: socket.username, file: data.file, fileName: data.fileName});
    });

    // New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUserNames();
    });

    function updateUserNames(){
        io.sockets.emit('get users', users)
    }
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});