// Tests for the RaceDB publications
//
// https://guide.meteor.com/testing.html

import { assert } from 'meteor/practicalmeteor:chai';
import { RaceDB } from '../RaceDB.js';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import './publications.js';

describe('RaceDB publications', function() {
    beforeEach(function() {
        RaceDB.remove({});
        RaceDB.insert({
            title: 'meteor homepage',
            url: 'https://www.meteor.com',
        });
    });

    describe('RaceDB.all', function() {
        it('sends all RaceDB', function(done) {
            const collector = new PublicationCollector();
            collector.collect('RaceDB.all', (collections) => {
                assert.equal(collections.RaceDB.length, 1);
                done();
            });
        });
    });
});