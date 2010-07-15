/*
 *    def.js: Simple Ruby-style inheritance for JavaScript
 *
 *    Copyright (c) 2010 Tobias Schneider
 *    This script is freely distributable under the terms of the MIT license.
 *
 *    Original author: Tobias Schneider
 *    Edition of Dmitry A. Soshnikov
 */

(function (global) {
    // used to defer setup of superclass and properties
    var deferred;

    // dummy subclass
    function Subclass() {}

    function extend(source) {
        var
            property,
            target = this.prototype;

        for (var key in source) if (source.hasOwnProperty(key)) {
            property = target[key] = source[key];
            if (typeof property == "function") {
                property._name = key;
                property._class = this;
            }
        }

        return this;
    }

    function def(context, klassName) {
        klassName || (klassName = context, context = global);
        // create class on given context (defaults to global object)
        var Klass = context[klassName] = function Klass() {
            // called as a constructor
            if (this.constructor === Klass) { // TODO:
                // allow the constructor to return a different class/object
                return this.init && this.init.apply(this, arguments);
            }
            // called as a function - defer setup of superclass and properties
            deferred._super = Klass;
            deferred._props = arguments[0] || {};
        };

        // add static helper method
        Klass.extend = extend;

        // called as function when not, inheriting from a superclass
        deferred = function (props) {
            return Klass.extend(props);
        };

        // valueOf is called to setup inheritance from a superclass
        deferred.valueOf = function () {
            var Superclass = deferred._super;

            if (!Superclass) {
                return Klass;
            }
            // inherit from superclass
            Subclass.prototype = Superclass.prototype;
            Klass.prototype = new Subclass;

            Klass._super = Superclass;
            Klass.prototype.constructor = Klass;
            Klass.prototype.base = base;
            Klass.extend(deferred._props);
            // return actual value
            return Klass.valueOf();
        };

        return deferred;
    }

    // calls the same method as its caller but in the superclass
    // based on http://github.com/shergin/legacy by shergin
    function base() {
        var caller = base.caller;
        return caller._class._super.prototype[caller._name].apply(this, arguments);
    }

    // expose
    global.def = def;
}(this));
