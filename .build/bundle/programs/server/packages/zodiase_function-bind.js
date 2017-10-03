(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-server'].Symbol;
var Map = Package['ecmascript-runtime-server'].Map;
var Set = Package['ecmascript-runtime-server'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"zodiase:function-bind":{"function-bind.js":function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/zodiase_function-bind/function-bind.js                                                                    //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill.   // 1
if (!Function.prototype.bind) {                                                                                       // 2
  Function.prototype.bind = function (oThis) {                                                                        // 3
    if (typeof this !== 'function') {                                                                                 // 4
      // closest thing possible to the ECMAScript 5                                                                   // 5
      // internal IsCallable function                                                                                 // 6
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');                    // 7
    }                                                                                                                 // 8
                                                                                                                      //
    var aArgs = Array.prototype.slice.call(arguments, 1),                                                             // 10
        fToBind = this,                                                                                               // 10
        fNOP = function () {},                                                                                        // 10
        fBound = function () {                                                                                        // 10
      return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };                                                                                                                // 18
                                                                                                                      //
    if (this.prototype) {                                                                                             // 20
      // Function.prototype don't have a prototype property                                                           // 21
      fNOP.prototype = this.prototype;                                                                                // 22
    }                                                                                                                 // 23
                                                                                                                      //
    fBound.prototype = new fNOP();                                                                                    // 24
    return fBound;                                                                                                    // 26
  };                                                                                                                  // 27
}                                                                                                                     // 28
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("./node_modules/meteor/zodiase:function-bind/function-bind.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['zodiase:function-bind'] = {};

})();

//# sourceMappingURL=zodiase_function-bind.js.map
