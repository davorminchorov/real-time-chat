(function () {
    'use strict';

    var socket = io();


    var $form = $('#message_form');
    var $messageInput = $('#message');
    var name = getQueryVariable('name') || 'Anonymous';
    var room = getQueryVariable('room') || 'Public';
    var $roomTitle = $('.room-title');

    $roomTitle.text(room);

    socket.on('connect', function () {
        console.log('Connected to socket.io server!');
        socket.emit('join-room', {
            name: name,
            room: room
        });
    });
    
    socket.on('message', function (message) {
        var momentTimestamp = moment.utc(message.timestamp);
        var $messages = $('.messages');
        var $message = $('<li class="list-group-item"></li>');

        $message.append('<p><strong>' + message.name + ' - ' + momentTimestamp.local().format('hh:mm a') + ':</strong></p>');
        $message.append('<p>' + message.text + '</p>');
        $messages.append($message);

    });


    $form.on('submit', function (event) {
       event.preventDefault();

        socket.emit('message', {
            name: name,
            text: $messageInput.val()
        });

        $messageInput.val('');

    });

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]).replace(/\+/g, ' ');
            }
        }

        return undefined;
    }

})();