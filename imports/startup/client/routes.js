// import { FlowRouter } from 'meteor/kadira:flow-router';
// import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/layouts/body/body.js';
import '../../ui/pages/rta/rta.js';
import '../../ui/pages/not-found/not-found.js';

//http://iron-meteor.github.io/iron-router/
// //map paths to blaze templates
// Router.route('/', function() {
//     Router.go('rta');
// });

// Router.route('/rta', function() {
//     this.render('rta');
// });



Router.route('/', function() {
    this.render('admin');
})

Router.route('/rta');
Router.route('/admin');
Router.route('/landinPage');

Router.route('/quiz01', function() {
    this.render('quiz');
})

Router.route('/quiz02', function() {
    this.render('quiz');
})