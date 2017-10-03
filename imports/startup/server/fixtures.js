// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { RaceDB, StopWatch } from '../../api/RaceDB/RaceDB.js';

// Meteor.startup(() => {
//     console.log('Insert some dummy data if the RaceDB and stopwatch collection is empty');
//     if (StopWatch.find().count() === 0) {
//         StopWatch.insert({ action: 'start' });
//     }

//     if (RaceDB.find().count() === 0) {
//         const data = [
//             { carId: "car02", lapNr: 43, lapTime: "0:6:417" },
//             { carId: "car02", lapNr: 33, lapTime: "0:4:417" },
//             { carId: "car02", lapNr: 13, lapTime: "0:6:417" },
//             { carId: "car01", lapNr: 43, lapTime: "0:6:417" },
//             { carId: "car01", lapNr: 33, lapTime: "0:4:417" },
//             { carId: "car01", lapNr: 13, lapTime: "0:6:417" }
//         ];

//         data.forEach(lap => RaceDB.insert(lap));
//     }
// });