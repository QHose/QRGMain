// Tests for the behavior of the RaceDB collection
//
// https://guide.meteor.com/testing.html

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { RaceDB } from './RaceDB.js';

if (Meteor.isServer) {
    describe('RaceDB collection', function() {
        it('insert correctly', function() {
            const linkId = RaceDB.insert({
                title: 'meteor homepage',
                url: 'https://www.meteor.com',
            });
            const added = RaceDB.find({ _id: linkId });
            const collectionName = added._getCollectionName();
            const count = added.count();

            assert.equal(collectionName, 'RaceDB');
            assert.equal(count, 1);
        });
    });
}