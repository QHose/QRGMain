/*
description
*/
import {
    RaceDB,
    StopWatch,
    WinnerRace,
    EnginePower,
    Player
} from '/imports/api/RaceDB/RaceDB.js';


var sys = require('util');
var net = require('net');
var moment = require('moment');

//communication to RTA REST API
var rp = require('request-promise');
var RTAServer = "http://192.168.0.124:3000";

var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://192.168.0.124'); //DLR-501

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.0.124:27017/game";
var collection = "laps";
var collectionQuiz = "quizStats";
var collectionCar = "carStats";
var collectionSession = "session";


// define all topics/rooms centrally for better overview
// topic owner:
var lapTrackStart = "/game/app/serverAps/lapTrackRec/start";
var lapTrackStop = "/game/app/serverAps/lapTrackRec/stop";
var lapTrackRecCar01 = "/game/app/serverAps/lapTrackRec/car01";
var lapTrackRecCar02 = "/game/app/serverAps/lapTrackRec/car02";


// topic subscribed to
var adminSettingsStop = "/game/app/ui/admin/race/stop";
var lightCountDown = "/game/device/ESP/lightCountDown";
var lapTrackSensorCar01 = "/game/device/ESP/lapTrackSensor/car01";
var lapTrackSensorCar02 = "/game/device/ESP/lapTrackSensor/car02";
var adminSettings = "/game/app/ui/admin/settings";
var quizRoom = "/game/app/ui/quiz";
var carEP = "/game/device/ESP/car/currEP";


//car01
//car02
//trackRecAll

client.subscribe(adminSettingsStop);
client.subscribe(lightCountDown);
client.subscribe(lapTrackSensorCar01);
client.subscribe(lapTrackSensorCar02);
client.subscribe(adminSettings);
client.subscribe(quizRoom);
client.subscribe(carEP);


var lapTimeCar01;
var lapTimeCar02;
var lapNoCar01;
var lapNoCar02;


var start;
var startFlag = 0; // if 0 - message 'lap' will NOT insert record into db. Will become one at receiving 'start' message', 0 at 'stop' message.

//received from Admin -> settings
var sessionId;
var racer01;
var racer02;
var numLapsMax;
var lapTimeMax;
var lapEPMaxStart;

var quiz_carNo;
var quiz_teamName;
var quiz_questionId;
var quiz_answer;
var quiz_points;
var quiz_answerValue;
var quiz_lapCar;
var quiz_timeStamp;
var quiz_start;

var winner=0;

client.on('message', Meteor.bindEnvironment(function(room, message) {
    console.log("----------------------------------------------------------------------");
    if (String(message) === "clear") {
        
        console.log("sending CLEAR to RTA");
        //SEND TO RTA APP
        var options = {
            method: 'POST',
            uri: RTAServer + '/reset_stopwatch',
            body: {},
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function(parsedBody) {
                console.log('CLEAR stopwatch success');
            })
            .catch(function(err) {
                console.error('CLEAR stopwatch error: ', err);
            });
            
            
            
    }
    if (startFlag === 1) {

        if (room === quizRoom) {
            console.log('Quiz input received: ');

            var settings = new Array();

            var sett = String(message).split(";");
            for (i = 0; i < sett.length; i++) {
                settings[i] = sett[i].split(",");
            }

            quiz_carNo = settings[0][1];
            quiz_teamName = settings[1][1];
            quiz_questionId = parseInt(settings[2][1]);
            quiz_answer = parseInt(settings[3][1]);
            quiz_points = parseInt(settings[4][1]);
            quiz_answerValue = settings[5][1];

            quiz_start = moment(start);
            //.format('YYYY-DD-MM HH:mm:ss:SSS');
            //            console.log(quiz_start);

            quiz_timeStamp = moment.duration(moment() - quiz_start)._data.minutes + ":" + moment.duration(moment() - quiz_start)._data.seconds + ":" + moment.duration(moment() - quiz_start)._data.milliseconds;

            if (quiz_carNo === "car01") {
                quiz_lapCar = lapNoCar01;
            } else if (quiz_carNo === "car02") {
                quiz_lapCar = lapNoCar02;
            }

            //        console.log("SessionId: "+ sessionId);
            //        console.log("quiz_lapCar: "+ quiz_lapCar);
            //        console.log("quiz_carNo: "+ quiz_carNo);
            //        console.log("quiz_teamName: "+ quiz_teamName);
            //        console.log("quiz_questionId: "+ quiz_questionId);
            //        console.log("quiz_answer: "+ quiz_answer);
            //        console.log("quiz_points: "+ quiz_points);
            //        console.log("quiz_answerValue: "+ quiz_answerValue);
            //        console.log("quiz_timeStamp: "+quiz_timeStamp);

            var quizInput = {
                sessionId: sessionId,
                quiz_lapCar: quiz_lapCar,
                quiz_carNo: quiz_carNo,
                quiz_teamName: quiz_teamName,
                quiz_questionId: quiz_questionId,
                quiz_answer: quiz_answer,
                quiz_points: quiz_points,
                quiz_answerValue: quiz_answerValue,
                quiz_timeStamp: quiz_timeStamp
            };

            console.log(quizInput);
            mongodbInsertOne(collectionQuiz, quizInput);

        }

        if (room === carEP) {
            //console.log("Engine Power change: ");

            var sett = String(message).split(",");

            quiz_start = moment(start);
            //.format('YYYY-DD-MM HH:mm:ss:SSS');
            //            console.log(quiz_start);

            quiz_timeStamp = moment.duration(moment() - quiz_start)._data.minutes + ":" + moment.duration(moment() - quiz_start)._data.seconds + ":" + moment.duration(moment() - quiz_start)._data.milliseconds;

            if (sett[0] === "car01") {
                quiz_lapCar = lapNoCar01;
            } else if (sett[0] === "car02") {
                quiz_lapCar = lapNoCar02;
            }

            var currEP = sett[1];

            var currEPInput = {
                sessionId: sessionId,
                quiz_carNo: sett[0],
                currentEnginePower: currEP,
                quiz_lapCar: quiz_lapCar,
                quiz_timeStamp: quiz_timeStamp
            };

            console.log("Engine Power change: "+quiz_carNo + "-" + currEP);

            //collectionCar
            mongodbInsertOne(collectionCar, currEPInput);

        }
        if (String(message) === "lap") {
            console.log("laptime from: " + room);

            if (room === lapTrackSensorCar01) {
                
                // Lap number
                
                if (lapNoCar01 < numLapsMax + 1) {
                    // + 1 to account for "smaller than" numLapsMax
                    // lapNoCar01++; //-------------------------------------------------------------------------

                    if(lapNoCar01 != 0 ){
                            
                            // do nothing->because of track layout first round should be ingnored; cars are right in front of sensor at start
                        
                        if(lapNoCar01 === numLapsMax && winner===0){
                            console.log("Car01 is the winner -* * * * ** * ** *  * * * * * * * * *----------------------------");
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "car01RaceCompleted": 1 });
                            winner=1;
                            
                            // TO DO -> FORMAT WINNING TIME
                            insertWinner('car01',racer01);

                            var now = moment()
                            var raceDuration = moment.duration(now - start)._data.minutes + ":" + moment.duration(now - start)._data.seconds + ":" + moment.duration(now - start)._data.milliseconds;
                            insertPlayers('car01',racer01, raceDuration,'WINNER RACE');

                        }
                        else if(lapNoCar01 === numLapsMax && winner===1){
                            console.log("Car01 did not wine the race------------8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8-8--8");
                            console.log("stopped @ " + moment().format());
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "sessionStopTime": moment().format('YYYY-DD-MM HH:mm:ss:SSS') });
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "car01RaceCompleted": 1 });

                            var now = moment()
                            var raceDuration = moment.duration(now - start)._data.minutes + ":" + moment.duration(now - start)._data.seconds + ":" + moment.duration(now - start)._data.milliseconds;
                            insertPlayers('car01',racer01, raceDuration,'');
                
                            //SEND TO RTA APP
                            var options = {
                                method: 'POST',
                                uri: RTAServer + '/stop_stopwatch',
                                body: {},
                                json: true // Automatically stringifies the body to JSON
                            };
                
                            rp(options)
                                .then(function(parsedBody) {
                                    console.log('stop stopwatch success');
                                })
                                .catch(function(err) {
                                    console.error('stop stopwatch', err);
                                });
                
                            client.publish(lapTrackStop, "stop");
                            startFlag = 0;
                            console.log("startFlag = 0");
                        }                            
                        
                        console.log("lapNo: " + lapNoCar01);
                        var now = moment();
                        var currentLap = moment.duration(now - lapTimeCar01)._data.minutes + ":" + moment.duration(now - lapTimeCar01)._data.seconds + ":" + moment.duration(now - lapTimeCar01)._data.milliseconds;
                                            
                        var obj = {
                            "sessionId": sessionId,
                            "carNo": "car01",
                            "lapNo": lapNoCar01,
                            "timeStampPreviousLap": moment(lapTimeCar01).format(),
                            "timeStampCurrentLap": moment(now).format(),
                            "timeCurrentLap": currentLap

                        };
                        console.log(currentLap);
                        
                        mongodbInsertOne(collection, obj);

                        //SEND TO RTA APP 01
                        var options = {
                            method: 'POST',
                            uri: RTAServer + '/lapTimes',
                            body: { 
                                carId: "car01",
                                lapNr: lapNoCar01,
                                lapTime: currentLap},
                            json: true // Automatically stringifies the body to JSON
                        };

                        rp(options)
                            .then(function(parsedBody) {
                                console.log('laptime-car01>>RTA success');
                            })
                            .catch(function(err) {
                                console.error('laptime-car01>>RTA error: ', err);
                            });

                        // send to rta (realtime analytics - app)
                        currentLap = lapNoCar01 + ";" + currentLap;
                        client.publish(lapTrackRecCar01, currentLap);

                        // set var to now to calc next lap message.
                    
                        lapTimeCar01 = now;
                 
                    }
                    else{
                        console.log("Car01 has crossed the finish for the first time. Lap 0 will not be registered.");
                    }
                }
                else{
                    console.log("Car01 has reached max. laps of " + numLapsMax);
                }
                
                lapNoCar01++; //------------------------------------------
            }
            else if (room === lapTrackSensorCar02) {
                
                // Lap number
                
                if (lapNoCar02 < numLapsMax + 1) {
                    // + 1 to account for "smaller than" numLapsMax
                    // lapNoCar01++; //-------------------------------------------------------------------------

                    if(lapNoCar02 != 0 ){
                            
                            // do nothing->because of track layout first round should be ingnored; cars are right in front of sensor at start
                        
                        if(lapNoCar02 === numLapsMax && winner===0){
                            
                            console.log("Car02 is the winner x");
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "car02RaceCompleted": 1 });
                            winner=1;
    
                            console.log("updating database");
                            // INSERT INTO DATABASE - CAR02 HAS WON RACE
                            insertWinner('car02',racer02);

                            var now = moment()
                            var raceDuration = moment.duration(now - start)._data.minutes + ":" + moment.duration(now - start)._data.seconds + ":" + moment.duration(now - start)._data.milliseconds;
                            insertPlayers('car02',racer02, raceDuration,'WINNER RACE');
                            
                                                        
                        }
                        else if(lapNoCar02 === numLapsMax && winner===1){
                            console.log("----------------------------------------------------------------------");
                            console.log("Car02 did not wine the race");
                            console.log("stopped @ " + moment().format());
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "sessionStopTime": moment().format('YYYY-DD-MM HH:mm:ss:SSS') });
                            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "car02RaceCompleted": 1 });
                
                            var now = moment()
                            var raceDuration = moment.duration(now - start)._data.minutes + ":" + moment.duration(now - start)._data.seconds + ":" + moment.duration(now - start)._data.milliseconds;
                            insertPlayers('car02',racer02, raceDuration,'');

                            //SEND TO RTA APP
                            var options = {
                                method: 'POST',
                                uri: RTAServer + '/stop_stopwatch',
                                body: {},
                                json: true // Automatically stringifies the body to JSON
                            };
                
                            rp(options)
                                .then(function(parsedBody) {
                                    console.log('stop stopwatch success');
                                })
                                .catch(function(err) {
                                    console.error('stop stopwatch', err);
                                });
                
                            client.publish(lapTrackStop, "stop");
                            startFlag = 0;
                            console.log("startFlag = 0");
                        }                            
                        
                        console.log("lapNo: " + lapNoCar02);
                        var now = moment();
                        var currentLap = moment.duration(now - lapTimeCar02)._data.minutes + ":" + moment.duration(now - lapTimeCar02)._data.seconds + ":" + moment.duration(now - lapTimeCar02)._data.milliseconds;

                        var obj = {
                            "sessionId": sessionId,
                            "carNo": "car02",
                            "lapNo": lapNoCar02,
                            "timeStampPreviousLap": moment(lapTimeCar02).format(),
                            "timeStampCurrentLap": moment(now).format(),
                            "timeCurrentLap": currentLap

                        };
                        console.log(currentLap);
                        
                        mongodbInsertOne(collection, obj);

                        //SEND TO RTA APP 01
                        var options = {
                            method: 'POST',
                            uri: RTAServer + '/lapTimes',
                            body: { 
                                carId: "car02",
                                lapNr: lapNoCar02,
                                lapTime: currentLap},
                            json: true // Automatically stringifies the body to JSON
                        };

                        rp(options)
                            .then(function(parsedBody) {
                                console.log('laptime-car02>>RTA success');
                            })
                            .catch(function(err) {
                                console.error('laptime-car02>>RTA error: ', err);
                            });

                        // send to rta (realtime analytics - app)
                        currentLap = lapNoCar02 + ";" + currentLap;
                        client.publish(lapTrackRecCar02, currentLap);

                        // set var to now to calc next lap message.
                    
                        lapTimeCar02 = now;
                    
                    }
                    else{
                        console.log("Car02 has crossed the finish for the first time. Lap 0 will not be registered.");
                    }
                }
                else{
                    console.log("Car02 has reached max. laps of " + numLapsMax);
                }
                
                lapNoCar02++; //------------------------------------------
            }
        }               
        // no 'room' if-statement needed. Stop can only come from admin.
        else if (String(message) === "stop") {
            console.log("stopped @ " + moment().format());
            mongodbUpdate(collectionSession, { "sessionId": sessionId }, { "sessionStopTime": moment().format('YYYY-DD-MM HH:mm:ss:SSS') });

            //SEND TO RTA APP
            var options = {
                method: 'POST',
                uri: RTAServer + '/stop_stopwatch',
                body: {},
                json: true // Automatically stringifies the body to JSON
            };

            rp(options)
                .then(function(parsedBody) {
                    console.log('stop stopwatch success');
                })
                .catch(function(err) {
                    console.error('stop stopwatch', err);
                });

            client.publish(lapTrackStop, "stop");
            startFlag = 0;
            console.log("startFlag = 0");
        }
    }
    // START: first listen to start message    
    else if (room === lightCountDown && String(message) === "start" && startFlag === 2) {
        /* 'start' message will come from countdown-lights-arduino hardware. 
        'start' will be sent from admin -> countdown-lights-arduino. This will count up to 5 lights and then send 'start' to node_trackRec (ntr). ntr will register start time. 
        */
        start = moment();
        winner=0;
        console.log("started game @ " + moment(start).format());

        mongodbUpdate("session", { "sessionId": sessionId }, { "sessionStartTime": moment(start).format('YYYY-DD-MM HH:mm:ss:SSS') });

        //SEND TO RTA APP
        var options = {
            method: 'POST',
            uri: RTAServer + '/start_stopwatch',
            body: {},
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function(parsedBody) {
                console.log('start stopwatch success');
            })
            .catch(function(err) {
                console.error('start stopwatch', err);
            });

        client.publish(lapTrackStart, "start");

        lapTimeCar01 = start;
        lapTimeCar02 = start;
        console.log(moment(lapTimeCar01).format());

        lapNoCar01 = 0;
        lapNoCar02 = 0;

        startFlag = 1;
        console.log("startFlag = 1");

    } 
    else if (room === adminSettings) {
        var settings = new Array();
        var sett = String(message).split(";");

        for (i = 0; i < sett.length; i++) {
            settings[i] = sett[i].split(",");
        }
        if(settings){
            sessionId = parseInt(settings[0][1]);
            racer01 = settings[1][1];
            racer02 = settings[2][1];
            numLapsMax = parseInt(settings[5][1]);
            lapTimeMax = parseInt(settings[6][1]);
            lapEPMaxStart = parseInt(settings[7][1]);            
            

            console.log("SessionId: " + sessionId);
            console.log("racer01: " + racer01);
            console.log("racer02: " + racer02);
            console.log("numLapsMax: " + numLapsMax);
            console.log("lapTimeMax: " + lapTimeMax);
            console.log("lapEPMaxStart: " + lapEPMaxStart);

            var settingsinput = {
                "sessionId": sessionId,
                "racer01": racer01,
                "racer02": racer02,
                "numLapsMax": numLapsMax,
                "lapTimeMax": lapTimeMax,
                "lapEPMaxStart": lapEPMaxStart
            };

            mongodbInsertOne("session", settingsinput);

            numLapsMax = numLapsMax; // plus 1 (?) AFTER insert to database because of 'less than' statement in lapcounter -------------------------
            startFlag = 2;
        }
    }
    else {
        console.log("startFlag not set -> No action. Message received:  " + message);
    }
}));

function mongodbInsertOne(coll, arg) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection(coll).insertOne(arg, function(err, res) {
            if (err) throw err;
            console.log("1 record inserted");
            db.close();
        });
    });
};

function mongodbUpdate(coll, filter, newvalues) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection(coll).updateOne(filter, { $set: newvalues }, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
};


function insertWinner(carNo, player, duration) {
    console.log('insertWinner(carNo, player, duration)'+ carNo +' & '+ player +' & '+ duration);
    check(carNo, String);
    check(player, String);
    check(duration, String);
    
    WinnerRace.insert({winner: carNo, playerName: player, duration: duration})
    

}

function insertPlayers(carNo, player, duration, wonRace) {
    console.log('insertPlayers(carNo, player, duration, wonRace)'+ carNo +' & '+ player +' & '+ duration +' & '+ wonRace);
    check(carNo, String);
    check(player, String);
    check(duration, String);
    // check(wonRace, String);
    
    
    Players.insert({player: carNo, playerName: player, duration: duration, wonRace: wonRace});
    

}



/* ARCHIVE
//        var settingsSessionId = String(message).split(";");
//        settingsSessionId = settingsSessionId[0].split(",");
//        sessionId = settingsSessionId[1];
//        
        
//        var settings = String(message).split(";");
//        settings = settings[5].split(",");
//        numLapsMax = settings[1];
//        console.log("max laps are: "+ numLapsMax);


*/