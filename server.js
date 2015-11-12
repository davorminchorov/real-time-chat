'use strict';

var PORT = process.env.port || 3000;
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var moment = require("moment");

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

function sendAllUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];

    if(typeof info === 'undefined') {
        return;
    }

    Object.keys(clientInfo).forEach(function (socketId) {
       var userInfo = clientInfo[socketId];

        if(info.room === userInfo.room) {
            users.push(userInfo.name);
        }

    });

    socket.emit('message', {
        name: 'System',
        text: 'List of all users: ' + users.join(', '),
        timestamp: moment().valueOf()

    });

}

io.on('connection', function (socket) {

    socket.on('disconnect', function () {
        var userData = clientInfo[socket.id];
        if(typeof userData !== 'undefined') {
            socket.leave(userData.room);
            io.to(userData.room).emit('message', {
                name: 'System',
                text: userData.name + ' has left the room.',
                timestamp: moment().valueOf()
            });

            delete clientInfo[socket.id];
        }
    });

    socket.on('join-room', function (request) {

        clientInfo[socket.id] = request;
        socket.join(request.room);
        socket.broadcast.to(request.room).emit('message', {
            name: 'System',
            text: request.name + ' has joined the room!',
            timestamp: moment().valueOf()
        });
    });

    socket.on('message', function (message) {

        if(message.text === '@currentUsers') {
            sendAllUsers(socket);
        } else {
            message.timestamp = moment().valueOf();
            io.to(clientInfo[socket.id].room).emit('message', message);
        }

    });

    socket.emit('message', {
        name: 'System',
        text: 'Welcome to the chat application!',
        timestamp: moment().valueOf()
    });

});

http.listen(PORT, function () {
    console.log('Server started at port ' + PORT);
})
