var require = meteorInstall({"imports":{"api":{"RaceDB":{"server":{"publications.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/api/RaceDB/server/publications.js                                        //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
var Meteor = void 0;                                                                // 1
module.watch(require("meteor/meteor"), {                                            // 1
    Meteor: function (v) {                                                          // 1
        Meteor = v;                                                                 // 1
    }                                                                               // 1
}, 0);                                                                              // 1
var RaceDB = void 0;                                                                // 1
module.watch(require("../RaceDB.js"), {                                             // 1
    RaceDB: function (v) {                                                          // 1
        RaceDB = v;                                                                 // 1
    }                                                                               // 1
}, 1);                                                                              // 1
Meteor.publish('RaceDB.all', function () {                                          // 6
    return RaceDB.find();                                                           // 7
});                                                                                 // 8
//////////////////////////////////////////////////////////////////////////////////////

}},"RaceDB.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/api/RaceDB/RaceDB.js                                                     //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
module.export({                                                                     // 1
  RaceDB: function () {                                                             // 1
    return RaceDB;                                                                  // 1
  },                                                                                // 1
  StopWatch: function () {                                                          // 1
    return StopWatch;                                                               // 1
  }                                                                                 // 1
});                                                                                 // 1
var Mongo = void 0;                                                                 // 1
module.watch(require("meteor/mongo"), {                                             // 1
  Mongo: function (v) {                                                             // 1
    Mongo = v;                                                                      // 1
  }                                                                                 // 1
}, 0);                                                                              // 1
var RaceDB = new Mongo.Collection('RaceDB');                                        // 5
var StopWatch = new Mongo.Collection('StopWatch');                                  // 6
//////////////////////////////////////////////////////////////////////////////////////

},"methods.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/api/RaceDB/methods.js                                                    //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
var Meteor = void 0;                                                                // 1
module.watch(require("meteor/meteor"), {                                            // 1
  Meteor: function (v) {                                                            // 1
    Meteor = v;                                                                     // 1
  }                                                                                 // 1
}, 0);                                                                              // 1
var check = void 0;                                                                 // 1
module.watch(require("meteor/check"), {                                             // 1
  check: function (v) {                                                             // 1
    check = v;                                                                      // 1
  }                                                                                 // 1
}, 1);                                                                              // 1
var RaceDB = void 0;                                                                // 1
module.watch(require("./RaceDB.js"), {                                              // 1
  RaceDB: function (v) {                                                            // 1
    RaceDB = v;                                                                     // 1
  }                                                                                 // 1
}, 2);                                                                              // 1
//////////////////////////////////////////////////////////////////////////////////////

}}},"startup":{"both":{"index.js":function(){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/startup/both/index.js                                                    //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.                                            // 2
//////////////////////////////////////////////////////////////////////////////////////

}},"server":{"fixtures.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/startup/server/fixtures.js                                               //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
var Meteor = void 0;                                                                // 1
module.watch(require("meteor/meteor"), {                                            // 1
  Meteor: function (v) {                                                            // 1
    Meteor = v;                                                                     // 1
  }                                                                                 // 1
}, 0);                                                                              // 1
var RaceDB = void 0,                                                                // 1
    StopWatch = void 0;                                                             // 1
module.watch(require("../../api/RaceDB/RaceDB.js"), {                               // 1
  RaceDB: function (v) {                                                            // 1
    RaceDB = v;                                                                     // 1
  },                                                                                // 1
  StopWatch: function (v) {                                                         // 1
    StopWatch = v;                                                                  // 1
  }                                                                                 // 1
}, 1);                                                                              // 1
//////////////////////////////////////////////////////////////////////////////////////

},"index.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/startup/server/index.js                                                  //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
module.watch(require("./fixtures.js"));                                             // 1
module.watch(require("./register-api.js"));                                         // 1
module.watch(require("./routes.js"));                                               // 1
//////////////////////////////////////////////////////////////////////////////////////

},"register-api.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/startup/server/register-api.js                                           //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
module.watch(require("../../api/RaceDB/methods.js"));                               // 1
module.watch(require("../../api/RaceDB/server/publications.js"));                   // 1
//////////////////////////////////////////////////////////////////////////////////////

},"routes.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// imports/startup/server/routes.js                                                 //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
var RaceDB = void 0,                                                                // 1
    StopWatch = void 0;                                                             // 1
module.watch(require("/imports/api/RaceDB/RaceDB.js"), {                            // 1
    RaceDB: function (v) {                                                          // 1
        RaceDB = v;                                                                 // 1
    },                                                                              // 1
    StopWatch: function (v) {                                                       // 1
        StopWatch = v;                                                              // 1
    }                                                                               // 1
}, 0);                                                                              // 1
JsonRoutes.add("get", "/start_stopwatch", function (req, res, next) {               // 6
    console.log('start_stopwatch GET request: "', req.data);                        // 7
    JsonRoutes.sendResult(res, {                                                    // 9
        data: 'You should make a POST call'                                         // 10
    });                                                                             // 9
});                                                                                 // 12
JsonRoutes.add("post", "/start_stopwatch", function (req, res, next) {              // 14
    console.log('start_stopwatch POST request: "', req);                            // 15
    StopWatch.upsert({                                                              // 16
        name: "timer"                                                               // 17
    }, {                                                                            // 16
        name: "timer",                                                              // 19
        action: 'start'                                                             // 20
    }, {                                                                            // 18
        upsert: true                                                                // 22
    });                                                                             // 21
    JsonRoutes.sendResult(res, {                                                    // 24
        data: 'Started watch'                                                       // 25
    });                                                                             // 24
});                                                                                 // 27
JsonRoutes.add("post", "/stop_stopwatch", function (req, res, next) {               // 29
    console.log('start_stopwatch POST request: "', req.data);                       // 30
    StopWatch.upsert({                                                              // 31
        name: "timer"                                                               // 32
    }, {                                                                            // 31
        name: "timer",                                                              // 34
        action: 'stop'                                                              // 35
    }, {                                                                            // 33
        upsert: true                                                                // 37
    });                                                                             // 36
    JsonRoutes.sendResult(res, {                                                    // 39
        data: 'Started watch'                                                       // 40
    });                                                                             // 39
});                                                                                 // 42
JsonRoutes.add("post", "/reset_stopwatch", function (req, res, next) {              // 44
    console.log('RESET stopwatch POST request');                                    // 45
    RaceDB.remove({});                                                              // 47
    StopWatch.upsert({                                                              // 49
        name: "timer"                                                               // 50
    }, {                                                                            // 49
        name: "timer",                                                              // 52
        action: 'reset'                                                             // 53
    }, {                                                                            // 51
        upsert: true                                                                // 55
    });                                                                             // 54
}); //                                                                              // 57
// ─── LAPTIMES ───────────────────────────────────────────────────────────────────
//                                                                                  // 61
                                                                                    //
Router.route("/laptimes", function () {                                             // 63
    var req = this.request;                                                         // 64
    var res = this.response;                                                        // 65
    var data = this.request.body;                                                   // 67
    console.log('laptimes data', data);                                             // 68
    RaceDB.insert(data);                                                            // 69
    res.end('hello from the server\n');                                             // 70
}, {                                                                                // 72
    where: "server"                                                                 // 73
});                                                                                 // 72
//////////////////////////////////////////////////////////////////////////////////////

}}}},"server":{"main.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// server/main.js                                                                   //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
module.watch(require("/imports/startup/server"));                                   // 1
module.watch(require("/imports/startup/both"));                                     // 1
//////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("./server/main.js");
//# sourceMappingURL=app.js.map
