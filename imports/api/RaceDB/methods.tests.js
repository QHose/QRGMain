// Tests for RaceDB methods
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { RaceDB } from './RaceDB.js';
import './methods.js';

if (Meteor.isServer) {
    describe('RaceDB methods', function() {
        beforeEach(function() {
            RaceDB.remove({});
        });

        it('can add a new link', function() {
            const addLink = Meteor.server.method_handlers['RaceDB.insert'];

            addLink.apply({}, ['meteor.com', 'https://www.meteor.com']);

            assert.equal(RaceDB.find().count(), 1);
        });
    });
}