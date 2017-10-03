import './admin.html';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

var io = require('socket.io-client');
try {
    var socket = io.connect(Meteor.settings.public.socketIO);
} catch (error) {
    console.error('cant connect to websocket pusher.', error);
}

var moment = require('moment');

////communication to RTA REST API
//var rp = require('request-promise');
//var RTAServer = "http://192.168.0.108:3000";

var sessionStage = 0;

var logging = 0;
var startstop = 0;

// define all topics/rooms centrally for better overview
// topic owner:
var adminRaceStart = "/game/app/ui/admin/race/start";
var adminRaceStop = "/game/app/ui/admin/race/stop";
var adminSettings = "/game/app/ui/admin/settings";
var adminSettingsUser = "/game/app/ui/admin/settings/user";
var adminSettingsEPMax = "/game/app/ui/admin/settings/epmax"; //engine power

// topic subscribed to
var landingPageUser = "/game/app/ui/landingPage/user/";
var car01Online = "/game/device/ESP/car01";
var car02Online = "/game/device/ESP/car02";
var carEP = "/game/device/ESP/car/currEP";


// TODO MAKE INTO METEOR WAY
$(document).ready(function() {

    $("#startStopLog").click(function(event) {

        if (logging === 0) {
            socket.emit('subscribe', { room: adminSettings });
            socket.emit('subscribe', { room: landingPageUser });

            socket.emit('subscribe', { room: car01Online });
            socket.emit('subscribe', { room: car02Online });
            console.log("subscribed to: " + adminSettings);
            logging = 1;

        } else if (logging === 1) {
            socket.emit('unsubscribe', { room: adminSettings });
            socket.emit('unsubscribe', { room: landingPageUser });
            socket.emit('unsubscribe', { room: car01Online });
            socket.emit('unsubscribe', { room: car02Online });
            console.log("unsubscribed to: " + adminSettings);
            logging = 0;
        }

    });

    $("#setGame").click(function(event) {
        if (sessionStage != 0) {
            alert("Game is already set. Please reset if needed");
        } else {

            // if(!$('#sessionId').val() ||
            // !$('#racer01').val() ||
            // !$('#racer02').val() ||
            // !$('#numLaps').val() ||
            // !$('#maxEP').val()){
            //     alert('missing value. default value used in one of input fields.');
            // }
            
            $("#sessionId").val(moment().format('YYYYMMDDHHmmss'));
            
            // if(!$('#sessionId').val()){
                
            // }
            
            if(!$('#racer01').val()){
                $('#racer01').val('Driver01');
            }
            if(!$('#racer02').val()){
                $('#racer02').val('Driver02');
            }
            if(!$('#numLaps').val()){
                $('#numLaps').val(12);
            }
            if(!$('#maxTime').val()){
                $('#maxTime').val(300);
            }
            if(!$('#maxEP').val()){
                $('#maxEP').val(45);
            }
            
            socket.emit('subscribe', { room: '/game/settings' });

            var gameInput = 'sessionID,' + $('#sessionId').val(); //[0]
            gameInput += ';racer01,' + $('#racer01').val(); //[1]
            gameInput += ';racer02,' + $('#racer02').val(); //[2]
            gameInput += ';racer03,' + '', // $('#racer03').val(); //[3]
            gameInput += ';racer04,' + '', // $('#racer04').val(); //[4]
            gameInput += ';numLaps,' + $('#numLaps').val(); //[5]
            gameInput += ';maxTime,' + $('#maxTime').val(); //[6]
            gameInput += ';maxEP,' + $('#maxEP').val(); //[7]

            var setGameValue = {
                room: adminSettings,
                message: gameInput
            };

            var setPower = $('#maxEP').val(); // Changed to whole value. "0;0;0;0;" + $('#maxEP').val();
            var setEPMaxValue = {
                room: adminSettingsEPMax,
                message: setPower
            }

            socket.emit('publish', setGameValue);
            socket.emit('publish', setEPMaxValue);

            $('.list-group-item').css('background', '#f8c252');
            console.log("Game values set: ", setGameValue);

            sessionStage = 1;
            }
        
    });

    $("#enginePowerOverride").click(function(event) {

        var EnginPowerOverride = $('#overrideEP').val();
        console.log(EnginPowerOverride);

        socket.emit('publish', { room: adminSettingsEPMax, message: EnginPowerOverride });

        //        socket.emit('publish', {room: carEP, message: "car01," + EnginPowerOverride});
        //        
        //        socket.emit('publish', {room: carEP, message: "car02," + EnginPowerOverride});
        //        

    });


    $("#startstop").click(function(event) {

        if (sessionStage != 1) {
            alert("Please 'Set Game' first");
        } else {
            if (startstop === 0) {
                socket.emit('publish', { room: adminRaceStart, message: "start" });
                startstop = 1;
                $('.list-group-item').css('background', '#00cc99');
            } else if (startstop === 1) {
                socket.emit('publish', { room: adminRaceStop, message: "stop" });
                startstop = 0;
                $('.list-group-item').css('background', '#ff6666');
            }
        }

    });


    $("#resetSession").click(function(event) {

        socket.emit('publish', { room: adminRaceStop, message: "stop" });
        startstop = 0;
        socket.emit('publish', { room: adminRaceStop, message: "clear" });


        //        //SEND RESET TO RTA APP
        //        var options = {
        //            method: 'POST',
        //            uri: RTAServer + '/reset_stopwatch',
        //            body: {},
        //            json: true // Automatically stringifies the body to JSON
        //        };
        //
        //        rp(options)
        //            .then(function(parsedBody) {
        //                console.log('start stopwatch success');
        //            })
        //            .catch(function(err) {
        //                console.error('start stopwatch', err);
        //            });        


        $('.list-group-item').css('background', '#ffffff');
        sessionStage = 0;
    });

    $("#clearSession").click(function(event) {

        socket.emit('publish', { room: adminRaceStop, message: "stop" });
        startstop = 0;
        socket.emit('publish', { room: adminRaceStop, message: "clear" });

        $('#sessionId').val('');
        $('#racer01').val('');
        $('#racer02').val('');
        $('#numLaps').val('');
        $('#maxTime').val('');     
        $('#maxEP').val('');

        $('.list-group-item').css('background', '#ffffff');
        sessionStage = 0;
    });

    socket.on('message', function(data) {
        console.log('message received by "message": ');
        console.log(data);

        if (data.room === landingPageUser) {
            console.log("USER INFO RECEIVED - ACTION TO BE PROGRAMMED");
        }
        $("#log").append(data.message + "<br>");
    });

});