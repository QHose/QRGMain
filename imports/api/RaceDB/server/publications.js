// All RaceDB-related publications

import { Meteor } from 'meteor/meteor';
import { RaceDB } from '../RaceDB.js';

Meteor.publish('RaceDB.all', function() {
    return RaceDB.find();
});