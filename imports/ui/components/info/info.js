import { RaceDB } from '/imports/api/RaceDB/RaceDB.js';
import { Meteor } from 'meteor/meteor';

Template.info.onCreated(function() {
    Meteor.subscribe('RaceDB.all');
});

Template.info.helpers({
    RaceDB() {
        return RaceDB.find({});
    },
});

// Template.info.events({
//     'submit .info-link-add' (event) {
//         event.preventDefault();

//         const target = event.target;
//         const title = target.title;
//         const url = target.url;

//         Meteor.call('RaceDB.insert', title.value, url.value, (error) => {
//             if (error) {
//                 alert(error.error);
//             } else {
//                 title.value = '';
//                 url.value = '';
//             }
//         });
//     },
// });