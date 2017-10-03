// Methods related to RaceDB

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { RaceDB } from './RaceDB.js';

// Meteor.methods({
//     'RaceDB.insert' (title, url) {
//         check(url, String);
//         check(title, String);

//         return RaceDB.insert({
//             url,
//             title,
//             createdAt: new Date(),
//         });
//     },
// });