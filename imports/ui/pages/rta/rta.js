import './rta.html';

import {
    RaceDB,
    StopWatch
} from '/imports/api/RaceDB/RaceDB.js';
import {
    Meteor
} from 'meteor/meteor';
// var stopwatch = null;

//
// ─── START LANDING PAGE ─────────────────────────────────────────────────────────
//


Template.rta.onCreated(function() {
    Meteor.subscribe('RaceDB.all');
    Meteor.subscribe('StopWatch');

});

Template.rta.events({
    'contextmenu *': function(e, t) {
        e.stopPropagation();
        console.log('template instance:\n', t);
        console.log('data context:\n', Blaze.getData(e.currentTarget));
    }
});
Template.rta.helpers({ 
    fastestLapCar: function(selectedCarId) { 
        console.log('rta helper selectedCarId', selectedCarId)
        var fastestLap = RaceDB.findOne({carId: selectedCarId}, {sort: {"lapTime": 1}});
        console.log('fastestLap', fastestLap);
        return fastestLap        
    }, 
    raceFinishTime: function(selectedCarId) { 
        console.log('rta.helpers -> selectedCarId', selectedCarId);
        
        // var fastestLap = RaceDB.findOne({carId: selectedCarId}, {sort: {"lapTime": 1}});
        var raceFinishTime = RaceDB.find({carId: selectedCarId}).map(function(doc) {
            total += doc.lapTime;
          });
          console.log('raceFinishTime', raceFinishTime)
          
        return raceFinishTime
    }    
}); 

//
// ─── STOPWATCH ──────────────────────────────────────────────────────────────────
//

Template.stopwatch.onCreated(function() {
    Session.set('stoppedTime', null);
    Session.set('startTime', null);

    try {
        this.autorun(function() {
            var stopWatchStatus = StopWatch.findOne({})
                // console.log('stopwatch from database', stopWatchStatus)
                // console.log('stopWatchStatus.action', stopWatchStatus.action)
            if (stopWatchStatus) {
                if (stopWatchStatus.action === 'start') {
                    Session.set('stoppedTime', null);
                    Session.set('startTime', new Date().getTime());
                    console.log('stopwatch started:');
                } else if (stopWatchStatus.action === 'stop') {
                    console.log('stopwatch stopped: ');
                    Session.set('stoppedTime', Date.now() - Session.get('startTime'));
                } else if (stopWatchStatus.action === 'reset') {
                    Session.set('startTime', null); // stops the timer                    
                }
            }
        });
    } catch (err) {
        console.error('autorun stopwatch error', err)
    }
})

Template.stopwatch.helpers({
    duration: function() {
        var start = Session.get('startTime');
        if (start && Session.get('stoppedTime')) {
            return Chronos.moment(Session.get('stoppedTime')).format('mm:ss:SSS');
            // return Session.get('stoppedTime')
        } else if (start) {
            // return numberWithCommas(Chronos.currentTime(10) - start); // updates every hundred milliseconds
            return Chronos.moment(Chronos.currentTime(10)-start).format('mm:ss:SSS'); // updates every hundred milliseconds
        } else {
            return '00:00:000';
        }

    },
    running: function() {
        return Session.get('startTime');
    }
});

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1:$2");
    return x;
}


//
// ─── TEAM TABLE ─────────────────────────────────────────────────────────────────
//



Template.teamTable.helpers({
    RaceDBTeam(carId) {
        return RaceDB.find({
            carId: carId,
        }, { sort: { lapNr: -1 }, limit: 10 });
    },
    log(lap) {
        console.log('helper teamTable, lap: ', lap)
    }
});


//
// ─── STOPWATCH CODE ─────────────────────────────────────────────────────────────
//