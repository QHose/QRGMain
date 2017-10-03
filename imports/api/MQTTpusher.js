/* Pusher.js
Description
Server side node.js script that pushes real-time websocket requests
to MQTT broker and vise versa. This script allows websocket connections to both subscribe and publish to MQTT topics

Writer: Daniel Lumkeman

Based on / credits to:
name
site:
www
*/

var sys = require('util');
var net = require('net');
var mqtt = require('mqtt');

// create a socket object that listens on port 5000
var io = require('socket.io').listen(5000);
// console.log('io', io)

// create an mqtt client object and connect to the mqtt broker
var client = mqtt.connect('mqtt://' + Meteor.settings.public.MQTThost);
console.log('------------------------------------');
console.log('We expect the MQTT host to be at:', Meteor.settings.public.MQTThost);
console.log('------------------------------------');
// console.log('MQTT client', client)
try {
    check(Meteor.settings.public.MQTThost, String);
} catch (error) {
    console.error('You did not specify a MQTT in your settings.json');
}

io.sockets.on('connection', function(socket) {
    //    socket.join('game');
    //    client.subscribe('game');

    // socket connection indicates what mqtt topic to subscribe to in data.topic
    socket.on('subscribe', function(data) {
        console.log('TEST -----------------------------------------   joining room ', data.room);
        socket.join(data.room);
        client.subscribe(data.room);
    });

    socket.on('unsubscribe', function(data) {
        console.log('unsubscribing room ', data.room);
        socket.leave(data.room);
        client.unsubscribe(data.room);
    });

    // when socket connection publishes a message, forward that message
    // the the mqtt broker (and back to socket)
    socket.on('publish', function(data) {
        console.log('Publishing to ' + data.room + ' - ' + data.message);
        client.publish(data.room, data.message);
        // sockets.in(data.room).emit('message',data);
    });

});

// listen to messages coming from the mqtt broker
client.on('message', function(room, message) {
    console.log('Sending MQTT -> Socket: ' + room + ' ' + message);
    var mqttMssg = String(message);
    io.sockets.in(room).emit('message', { room: room, message: mqttMssg });
});



//client.on('message', function (topic, payload, packet) {
//    console.log(topic+'='+payload);
//    io.sockets.emit('mqtt',{'topic':String(topic),
//                            'payload':String(payload)});
//});