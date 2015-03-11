/****************************************************************************
 Copyright (c) 2014 Louis Y P CHEN.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * The main namespace of bl, all engine core class, functions, properties and constants are defined in this namespace
 * private :
 *         __*
 * otherwise are public
 */
(function(win){
    var bl = win["bl"]||{}, doc = win.document,
        ie_event_behavior = doc.attachEvent && typeof Windows === "undefined" && (typeof opera === "undefined" || opera.toString() != "[object Opera]"),
        noop = function(){},
        toString =  {}.toString,
        hasOwn = {}.hasOwnProperty;
    //the version of bl
    //will be replaced from moduleCfg
    bl.version = "${version}";
    //store document
    bl.doc = doc;
    //user configurations for bl
    bl.Cfg = win.BLCfg ||{
        pkgs : [
            {name : "template", path : "../cfg/templates"}
        ],
        debug : false //by default, turn off the debug mode
    };

    bl.PARENT = "_$_$_parent_$_$_";

    bl.global = win;

    //Currently now it is browser-base framework
    bl.isNative = false;

    //AMD namespace
    bl.__AMD = {};

    bl.__types = {};

    bl.__uidSeed = 1;

    bl.__uid = 0;

    bl.noop = noop;

    bl.directives = {};

    bl.majorEvent = !!doc.addEventListener;

    //Returns a unique identifier
    bl.uid = function() {
        return "_" + bl.__uidSeed++;
    };
    //A consistent way of creating unique IDs
    bl.nextUid = function(){
        return ++bl.__uid;
    };
    //The locale to assume for loading localized resources in this page,
    //specified according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt).
    //Must be specified entirely in lowercase,e.g. `en-us` and `zh-cn`.
    bl.locale = "zh-cn";
    //prefix of directive
    (function(){
        //populate into types
        var arr = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
        for(var i = 0, l = arr.length; i < l; i++){
            bl.__types["[object " + arr[i] + "]"] = arr[i].toLowerCase();
        }
    })();
    //Node Type
    bl.DOM = {
        NODE_TYPE_ELEMENT : 1,
        NODE_TYPE_TEXT : 3,
        NODE_TYPE_COMMENT : 8,
        NODE_TYPE_DOCUMENT : 9,
        NODE_TYPE_DOCUMENT_FRAGMENT : 11
    };

    bl.restrict = {
        ELEMENT : 0,
        ATTR : 1,
        CLASS : 2
    };
    //check supportive
    //Test support is borrowed from jQuery
    bl.support = {};
    (function(support){
        var a, b, c, d,e;
        d = bl.doc.createElement("div");
        d.setAttribute("className", "v");
        d.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        a = d.getElementsByTagName("a")[0];
        c = bl.doc.createElement("select");
        e = c.appendChild(bl.doc.createElement("option"));
        b = d.getElementsByTagName("input")[0];
        if(!a || !a.style){
            // Finish early in limited (non-browser) environments
            a = b = c = d = e = null;
            return;
        }
        a.style.cssText = "top:1px;float:left;opacity:.5";
        d.style.backgroundClip = "content-box";
        d.cloneNode(true).style.backgroundClip = "";
        // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
        support.getSetAttribute = d.className !== "v";
        // Get the style information from getAttribute
        // (IE uses .cssText instead)
        support.style = /top/.test( a.getAttribute("style") );

        support.clearCloneStyle = d.style.backgroundClip === "content-box";
        // Support: Firefox<29, Android 2.3
        // Vendor-prefix box-sizing
        support.boxSizing = a.style.boxSizing === "" || a.style.MozBoxSizing === "" ||
            a.style.WebkitBoxSizing === "";
        // Support: IE<9
        // Make sure that element opacity exists (as opposed to filter)
        support.opacity = a.style.opacity === "0.5";
        // Verify style float existence
        // (IE uses styleFloat instead of cssFloat)
        support.cssFloat = !!a.style.cssFloat;
        // Make sure that URLs aren't manipulated
        // (IE normalizes it by default)
        support.hrefNormalized = a.getAttribute("href") === "/a";
        // Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
        support.checkOn = !!b.value;
        // Make sure that a selected-by-default option has a working selected property.
        // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
        support.optSelected = e.selected;
        // Tests for enctype support on a form
        support.enctype = !!bl.doc.createElement("form").enctype;
        // Make sure that the options inside disabled selects aren't marked as disabled
        // (WebKit marks them as disabled)
        c.disabled = true;
        support.optDisabled = !e.disabled;
        // Support: IE8 only
        // Check if we can trust getAttribute("value")
        b = document.createElement( "input" );
        b.setAttribute( "value", "" );
        support.input = b.getAttribute( "value" ) === "";
        // Check if an input maintains its value after becoming a radio
        b.value = "v";
        b.setAttribute( "type", "radio" );
        support.radioValue = b.value === "v";
        //avoid memory leak
        a = b = c = d = e = null;

        var pixelPositionVal = null, boxSizingReliableVal = null, reliableMarginRightVal = null,
            reliableHiddenOffsetsVal = null;
        function computeStyleTests() {
            var b,c,d,j;
            b = bl.doc.getElementsByTagName( "body" )[ 0 ];
            if ( !b || !b.style ) {
                // Test fired too early or in an unsupported environment, exit.
                return;
            }
            // Setup
            d = bl.doc.createElement( "div" );
            c = document.createElement( "div" );
            c.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
            b.appendChild( c ).appendChild( d );
            d.style.cssText =
                // Support: Firefox<29, Android 2.3
                // Vendor-prefix box-sizing
                "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
                "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
                "border:1px;padding:1px;width:4px;position:absolute";
            // Support: IE<9
            // Assume reasonable values in the absence of getComputedStyle
            pixelPositionVal = boxSizingReliableVal = false;
            reliableMarginRightVal = true;
            // Check for getComputedStyle so that this code is not run in IE<9.
            if(win.getComputedStyle){
                pixelPositionVal = ( win.getComputedStyle( d, null ) || {} ).top !== "1%";
                boxSizingReliableVal = ( win.getComputedStyle( d, null ) || { width: "4px" } ).width === "4px";
                // Support: Android 2.3
                // Div with explicit width and no margin-right incorrectly
                // gets computed margin-right based on width of container
                // WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
                j = d.appendChild( bl.doc.createElement( "div" ) );
                // Reset CSS: box-sizing; display; margin; border; padding
                j.style.cssText = d.style.cssText =
                    // Support: Firefox<29, Android 2.3
                    // Vendor-prefix box-sizing
                    "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
                    "box-sizing:content-box;display:block;margin:0;border:0;padding:0";
                j.style.marginRight = j.style.width = "0";
                d.style.width = "1px";
                reliableMarginRightVal = !parseFloat( ( win.getComputedStyle( j, null ) || {} ).marginRight );
            }
            // Support: IE8
            // Check if table cells still have offsetWidth/Height when they are set
            // to display:none and there are still other visible table cells in a
            // table row; if so, offsetWidth/Height are not reliable for use when
            // determining if an element has been hidden directly using
            // display:none (it is still safe to use offsets if a parent element is
            // hidden; don safety goggles and see bug #4512 for more information).
            d.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
            j = d.getElementsByTagName( "td" );
            j[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
            reliableHiddenOffsetsVal = j[ 0 ].offsetHeight === 0;
            if ( reliableHiddenOffsetsVal ) {
                j[ 0 ].style.display = "";
                j[ 1 ].style.display = "none";
                reliableHiddenOffsetsVal = j[ 0 ].offsetHeight === 0;
            }
            b.removeChild(c);

            b = c = d = j = null;
        }
        support.reliableHiddenOffsets = function(){
            if ( reliableHiddenOffsetsVal == null ) {
                computeStyleTests();
            }
            return reliableHiddenOffsetsVal;
        };
        support.boxSizingReliable = function(){
            if ( boxSizingReliableVal == null ) {
                computeStyleTests();
            }
            return boxSizingReliableVal;
        };
        support.pixelPosition = function(){
            if ( pixelPositionVal == null ) {
                computeStyleTests();
            }
            return pixelPositionVal;
        };
        support.reliableMarginRight = function(){
            if ( reliableMarginRightVal  == null ) {
                computeStyleTests();
            }
            return reliableMarginRightVal;
        };
    })(bl.support);
    bl.support.advanceEvent = !!doc.addEventListener;

    //This is a temporary function to  handler the diff event across the browsers
    //The event control will be moved to be an individual module
    var domOn = function (node, eventName, ieEventName, handler){
        // Add an event listener to a DOM node using the API appropriate for the current browser;
        // return a function that will disconnect the listener.
        if(ie_event_behavior){
            node.attachEvent(ieEventName, handler);
            return function(){
                node.detachEvent(ieEventName, handler);
            }
        }else{
            node.addEventListener(eventName, handler, false);
            return function(){
                node.removeEventListener(eventName, handler, false);
            }
        }
    };
    bl.monitor = domOn;
    //+++++++++++++++++++++++++define a minimal library to help build the loader+++++++++++++++++++++++++++
    (function(v){
        //internal, can be reused in kernel.js
        v.__lang = {

            type : function(it){
                return it == null ? it + "" : (typeof it === "object" || typeof it === "function" ) ? v.__types[toString.call(it)]||"object" : typeof it;
            },

            isEmpty : function(it){

                for(var p in it){
                    return 0;
                }
                return 1;
            },

            isFunction : function(it){
                return this.type(it) === "function";
            },

            isString : function(it){
                return this.type(it) == "string";
            },

            isArray : function(it) {
                return this.type(it) === "array";
            },

            isPlainObject : function(it){
                if(this.type(it) !== "object" || (it && it.nodeType) || (it != null && it === it.window)){
                    return false;
                }
                try{
                    if(it && it.constructor && !hasOwn.call(it.constructor.prototype, "isPrototypeOf")){
                        return false;
                    }
                }catch(e){return false;}
                return true;
            },

            forEach : function(it, callback){
                if(it){
                    for(var i = 0; i < it.length;){
                        if(callback(it[i++]) === false){
                            break;
                        }
                    }
                }
            },
            _rideArgs : function(scope, method){
                var pre = Array.prototype.slice.call(arguments, 2);
                var named = this.isString(method);
                return function(){
                    var args = Array.prototype.slice.call(arguments);
                    var f = named ? (scope||bl.global)[method] : method;
                    return f && f.apply(scope || this, pre.concat(args)); // mixed
                };
            },
            /**
             * Allows for easy use of object member functions in callbacks and other places
             * in which the "this" keyword
             * @param scope
             * @param method
             */
            ride : function (scope, method){
                if(arguments.length > 2){
                    return this._rideArgs.apply(this, arguments);
                }
                if(!method){
                    method = scope;
                    scope = null;
                }
                if(this.isString(method)){
                    scope = scope || window;
                    if(!scope[method]){
                        throw new Error('bl.__lang.ride: scope["', method, '"] is null (scope="', scope, '")');
                    }
                    return function() { return scope[method].apply(scope, arguments || []);};
                }
                return !scope ? method : function() { return method.apply(scope, arguments || []); };
            },
            /**
             * simple copy function from src to dest
             * it is not for a deep copy
             * @param dest
             * @param src
             */
            mix : function(dest, src){
                for(var p in src){
                    dest[p] = src[p];
                }
                return dest;
            },

            safeMix : function(dest, src){
                for(var p in src){
                    if(p && p.indexOf("__") == 0){
                        continue;
                    }
                    dest[p] = src[p];
                }
                return dest;
            },
            /**
             * The function refer to the implementation of jQuery to copy properties from source to target
             * https://github.com/jquery/jquery/tree/2.1.1-rc2
             * @returns {*|{}}
             */
            mixin : function(){
                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;
                //Handle a deep copy situation
                if ( typeof target === "boolean" ) {
                    deep = target;
                    //skip the boolean and the target
                    target = arguments[ i ] || {};
                    i++;
                }

                if(typeof target !== "object" && !this.isFunction(target)){
                    target = {};
                }
                //extend jQuery itself if only one argument is passed
                if(i === length){
                    target = this;
                    i--;
                }

                for(; i < length; i++){
                    //Only deal with non-null/undefined values
                    if ( (options = arguments[ i ]) != null ) {
                        for ( name in options ) {
                            src = target[name];
                            copy = options[name];
                            if ( target === copy ) {
                                continue;
                            }
                            // Recurse if we're merging plain objects or arrays
                            if ( deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)) ) ) {
                                if ( copyIsArray ) {
                                    copyIsArray = false;
                                    clone = src && this.isArray(src) ? src : [];
                                }else{
                                    clone = src && this.isPlainObject(src) ? src : {};
                                }

                                // Never move original objects, clone them
                                target[name] = bl.__lang.mixin(deep, clone, copy);
                            }else if(copy !== undefined){
                                // Don't bring in undefined values
                                target[name] = copy;
                            }
                        }
                    }
                }

                return target;
            },
            getProp : function(parts, create, context, defaultValue){
                var p, i = 0, rs = context;
                if(!rs){
                    if(!parts.length){
                        return window;
                    }else{
                        p = parts[i++];
                        rs = window[p] || (create ? window[p] = {} : undefined);
                    }
                }
                while(rs && (p = parts[i++])){
                    rs = (p in rs ? rs[p] : (create ? rs[p] = {} : undefined));
                }
                return rs;
            }
        };
    })(bl);
    //+++++++++++++++++++++++++define a minimal library to help build the loader+++++++++++++++++++++++++++

    //non-UA-based IE version check by James Padolsey, modified by jdalton - from http://gist.github.com/527683
    bl.browser = {};

    bl.browser.ie = (function(){
        var v = 3,
            div = doc.createElement("div"),
            a = div.all||[];
        do{
            div.innerHTML = "<!--[if gt IE " + ( ++v ) + "]><br><![endif]-->";
        }while(a[0]);

        return v > 4 ? v : !v;
    })();
    //in case the detection doesn't work in
    if(!bl.browser.ie && doc.attachEvent){
        //use userAgent to check IE's version
        bl.browser.ie = win.navigator.userAgent.match(/msie\s*(\d+)/i);
        if(bl.browser.ie){
            bl.browser.ie = bl.browser.ie[1];
        }else{
            bl.browser.ie = false;
        }
    }
    bl.browser.msie = bl.doc.documentMode;
    bl.browser.opera = typeof window.opera !== "undefined";

    //+++++++++++++++++++++++++something about JSON start+++++++++++++++++++++++++++
    (function(v){
        /**
         * Functions to parse and serialize JSON
         * to support JSON on IE6,7
         */
        var json = v.json = {},
            hasJSON = typeof JSON != "undefined";

        /**
         * check stringify property
         * Firefox 3.5/Gecko 1.9 fails to use replacer in stringify properly
         * refer to : https://bugzilla.mozilla.org/show_bug.cgi?id=509184
         */
        var __stringify = hasJSON && JSON.stringify({v:0},function(i,j){return j||1;}) == '{"v" : 0}';

        //use the function constructor to reduce the pollution
        v.eval = new Function('return eval(arguments[0]);');

        if(__stringify){
            v.json = JSON;
        }else{
            /**
             * form a valid string maybe with non-visual characters, double qutoe and backslash, surrounds with double quotes
             * @param str
             */
            var formString = function(str){
                return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').
                    replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
                    replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
            };
            v.json = {
                /**
                 * This is a temporay solution, will be revised in phase2
                 * TODO: eval to be removed
                 */
                parse : hasJSON ? JSON.parse : function (str, strict){
                    if(strict && !/^([\s\[\{]*(?:"(?:\\.|[^"])*"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/.test(str)){
                        throw new SyntaxError("Invalid characters in JSON");
                    }
                    return v.eval('(' + str + ')');
                },
                stringify : function (value, replacer, spacer){
                    var undef;
                    if(typeof replacer == "string"){
                        spacer = replacer;
                        replacer = null;
                    }
                    function stringify(it, indent, key){
                        if(replacer){
                            it = replacer(key, it);
                        }
                        var val, objtype = typeof it;
                        if(objtype == "number"){
                            return isFinite(it) ? it + "" : "null";
                        }
                        if(objtype == "boolean"){
                            return it + "";
                        }
                        if(it === null){
                            return "null";
                        }
                        if(typeof it == "string"){
                            return formString(it);
                        }
                        if(objtype == "function" || objtype == "undefined"){
                            return undef; // undefined
                        }
                        // short-circuit for objects that support "json" serialization
                        // if they return "self" then just pass-through...
                        if(typeof it.toJSON == "function"){
                            return stringify(it.toJSON(key), indent, key);
                        }
                        if(it instanceof Date){
                            return '"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z"'.replace(/\{(\w+)(\+)?\}/g, function(t, prop, plus){
                                var num = it["getUTC" + prop]() + (plus ? 1 : 0);
                                return num < 10 ? "0" + num : num;
                            });
                        }
                        if(it.valueOf() !== it){
                            // primitive wrapper, try again unwrapped:
                            return stringify(it.valueOf(), indent, key);
                        }
                        var nextIndent= spacer ? (indent + spacer) : "";
                        /* we used to test for DOM nodes and throw, but FF serializes them as {}, so cross-browser consistency is probably not efficiently attainable */

                        var sep = spacer ? " " : "";
                        var newLine = spacer ? "\n" : "";

                        // array
                        if(it instanceof Array){
                            var itl = it.length, res = [];
                            for(key = 0; key < itl; key++){
                                var obj = it[key];
                                val = stringify(obj, nextIndent, key);
                                if(typeof val != "string"){
                                    val = "null";
                                }
                                res.push(newLine + nextIndent + val);
                            }
                            return "[" + res.join(",") + newLine + indent + "]";
                        }
                        // generic object code path
                        var output = [];
                        for(key in it){
                            var keyStr;
                            if(it.hasOwnProperty(key)){
                                if(typeof key == "number"){
                                    keyStr = '"' + key + '"';
                                }else if(typeof key == "string"){
                                    keyStr = formString(key);
                                }else{
                                    // skip non-string or number keys
                                    continue;
                                }
                                val = stringify(it[key], nextIndent, key);
                                if(typeof val != "string"){
                                    // skip non-serializable values
                                    continue;
                                }
                                // At this point, the most non-IE browsers don't get in this branch
                                // (they have native JSON), so push is definitely the way to
                                output.push(newLine + nextIndent + keyStr + ":" + sep + val);
                            }
                        }
                        return "{" + output.join(",") + newLine + indent + "}"; // String
                    }
                    return stringify(value, "", "");
                }
            };
        }
    })(bl);
    //+++++++++++++++++++++++++something about JSON end+++++++++++++++++++++++++++
    //+++++++++++++++++++++++++something about AMD start+++++++++++++++++++++++++++
    (function(v){
        /**
         *
         * @type {{state: {ERROR: number, ABANDON: number, INIT: number, REQUESTED: number, ARRIVED: number, EXECUTING: number, EXECUTED: number}}}
         * @private
         */
        v.__AMD = {
            //the states of module
            state : {
                "ERROR"     : 23, //error happens
                "ABANDON"   : 110, //not a module
                "INIT"      : 0,
                "REQUESTED" : 1, //appending a script element inito the document
                "ARRIVED"   : 2, //the script that contatined the module arrived
                "EXECUTING" : 3, //in process of traversing dependencies and ruinning factory
                "EXECUTED"  : 4 //factory has been exectued
            }
        };
        /**
         * @param cfg
         *      pid     : the package identifier to which the module belongs (e.g., "bl"); "" indicates the system or default package
         *      mid     : the fully-resolved (i.e., mappings have been applied) module identifier without the package identifier (eg:bl/dom/selector)
         *      url     : the URL from which the module was retrieved
         *      pack    : the package object of the package to which the module belongs
         *      executed: the state of the package object has been executed
         *      deps    : the dependency vector for this module (vector of modules objects)
         *      factory : the factory for this module
         *      result  : the result of the running the factory for this module
         *      plugin  : TODO:
         * @constructor
         */
        var Module = function(cfg){
            this.context = v.__AMD;
            this.pid = "";
            this.mid = "";
            this.url = "";
            this.pack = null;
            this.executed =  this.context.state.INIT;
            this.deps = {}; //
            this.factory = noop;
            this.result = null;
            this.attached =  this.context.state.INIT;
            this.plugin = null;
            bl.__lang.mix(this, cfg);
        };
        /**
         *
         * @param name
         * @param refMod
         * @param packs
         * @param mods
         * @param aliases
         * @returns {*}
         */
        function getModInfo(name, refMod, packs, mods, aliases){
            var isRelative = /^\./.test(name), match, pid, pack, rs, url, midInPackage;
            if(/(^\/)|(\:)|(\.js$)/.test(name) || (isRelative && !refMod)){
                //not a module but just a URL of some sort
                return  new Module({
                    pid : 0,
                    mid : name,
                    pack : 0,
                    url : /\.js$/.test(name) ? name : name + ".js"
                });
            }else{
                //relative to reference module
                //get rid of any dots
                name = v.__AMD.pkg.redress(isRelative ? (refMod.mid + "/../" + name) : name);
                //make sure is that a relatvei path
                if(/^\./.test(name)){
                    throw new Error("irrationalPath", name);
                }
                //map the name
                //a1/a2 --> $0:a1/a2, $1:a1, $2:/a2, $3:a2
                match = name.match(/^([^\/]+)(\/(.+))?$/);
                pid = match ? match[1] : "";
                pack = v.__AMD.packs[pid];
                if(pack){
                    name = pid + "/" + (midInPackage = match[3] || pack.m);
                }else{
                    pid = "";
                }
                //search aliases
                //TODO:
                var hit = false;
                v.__lang.forEach(v.__AMD.aliases, function(aliasMap){
                    match = name.match(aliasMap[0]);
                    if(match && match.length > 0){
                        hit = v.__lang.isFunction(aliasMap[1]) ? name.replace(aliasMap[0], aliasMap[1]) : aliasMap[1];
                        return false;
                    }
                });
                if(hit){
                    return getModInfo(hit, 0, packs, mods, aliases);
                }
                rs = v.__AMD.mods[name];
                if(rs){
                    return v.__AMD.mods[name];
                }
            }
            if(pid){
                url = pack.path + "/" + midInPackage;
            }else{
                url = name;
            }
            // if result is not absolute, add baseUrl
            if(!(/(^\/)|(\:)/.test(url))){
                if(pid ){
                    url = pack.baseUrl ?  pack.baseUrl + url : v.__AMD.baseUrl + url;
                }else{
                    url = v.__AMD.baseUrl + url;
                }
            }
            url += ".js";
            return new Module({
                pid : pid,
                mid : name,
                pack : pack,
                url : v.__AMD.pkg.redress(url)
            });
        }
        /**
         * Internal function only use by AMD
         * @param event
         * @param a1
         * @param a2
         * @param a3
         */
        function injectOnLoad(event, a1, a2, a3){
            event = event||window.event;
            var node = event.target||event.srcElement;
            if(event.type === "load" || /complete|loaded/.test(node.readyState)){
                a1 && a1();
                a2 && a2();
                a3 && a3();
            }
        }
        /**
         * A loader engine
         *
         * example:
         *          {
     *              pkgs : [{
     *                  name : "myapp",
        *               path : "/js/myapp",
        *               baseUrl : ""  //baseUrl to repleace the top parent baseUrl
     *              }]
     *          }
         *
         * @type {{}}
         */
        v.__lang.mixin(v.__AMD, {

            baseUrl : "./",

            timeout : 15000,

            cache : false,

            cacheMaps : {}, //TODO

            checkCompleteGuard : 0,

            defOrder : 0, //

            defQ : [], // The queue of define arguments sent to loader.

            execQ : [], //The list of modules that need to be attacthed.

            hangQ : {}, // The set of modules upon which the loader is waiting for definition to arrive

            abortExec : {},

            injectingMod : 0,

            //the nodes used to locate where scripts are injected into the document
            insertPointSibling : 0,

            defaultCfg : {

                cache : false, //dev mode : false

                pkgs : [],
                async : true,  //do we need it????

                timeout : 7000  //by default is 7 seconds
            },

            sniffCfg : {}, //give vecfg as sniffed from script tag

            packs : {}, //a map from packageId to package configuration object

            aliases : [], //a vetor of pairs of [regexs or string, replacement] = > (alias, actual)


            /**
             *A hash:(mid) --> (module-object) the module namespace
             *The module-object can refer to Module class
             */
            mods : {
                "lang" : new Module({mid:"lang", executed : 4}),
                "public" : new Module({mid:"public", executed : 4}),
                "module"  :  new Module({mid:"module", executed : 4})
            },
            /**
             * Stores the modules which will be initialized at the end of laoder initialization
             */
            deferMods : [],

            guard : {
                checkComplete : function(/*Function*/process){
                    try{
                        v.__AMD.checkCompleteGuard++;
                        process();
                    }finally{
                        v.__AMD.checkCompleteGuard--;
                    }
                    //!v.__AMD.defQ.length && v.__lang.isEmpty(v.__AMD.hangQ)&& !v.__AMD.execQ.length && !v.__AMD.checkCompleteGuard
                },
                monitor : function(){
                    //keep going
                    if(v.__AMD.checkCompleteGuard) return;
                    this.checkComplete(function(){
                        for(var currentDefOrder, module, i = 0; i < v.__AMD.execQ.length;){
                            currentDefOrder = v.__AMD.defOrder;
                            module =  v.__AMD.execQ[i];
                            module.execute();
                            if(currentDefOrder != v.__AMD.defOrder){
                                // defOrder was bumped one or more times indicating something was executed
                                i = 0;
                            }else{
                                //nothing haapend; check the next module in the exec queue
                                i++;
                            }
                        }
                    });
                }
            },

            timer : {
                tId : 0,
                start : function(){
                    this.clear();
                    if(v.__AMD.timeout){
                        this.tId = win.setTimeout(v.__lang.ride(this, function(){
                            this.clear();
                            throw new Error("request timeout");
                        }), v.__AMD.timeout);
                    }
                },
                clear : function(){
                    this.tId && win.clearTimeout(this.tId);
                    this.tId = 0;
                }
            },

            pkg : {
                /**
                 * redress the path
                 * @param path
                 * @returns {string}
                 */
                redress : function(path){
                    //console.log(path);
                    if(!path) return "";
                    //reform the string
                    path = path.replace(/\\/g, '/').replace(/[^\/]+(?=\/)\//g, function($0){
                        return $0 == "./" ? "" : $0;
                    });
                    var cRegx = /[^\/]+\/\.\.\//g,
                        startWithRelative = (path.indexOf("../") === 0), prefix = "";
                    if(startWithRelative){
                        prefix = "../";
                        path = path.substr(prefix.length);
                    }
                    while(/\.\.\//.test(path) && path.indexOf("../") != 0){
                        path = path.replace(cRegx, function(){ return "" });
                    }
                    return prefix + path;
                },


                /**
                 *
                 * @param name
                 * @param refMod
                 */
                getModule : function(name, refMod){
                    if(!name) return null;
                    var match = name.match(/^(.+?)\>(.*)$/);
                    if(match){
                        //match[1] plugin module
                        //match[2] plulgin
                        //TODO: won't handle plugin here
                        //TODO: move to phase 2
                        //name was {plugin-module}>{plugin-resource}
                        //var plugin = this.getModule(match[1], refMod);
                    }else{
                        var rs = getModInfo(name, refMod, v.__AMD.packs, v.__AMD.mods, v.__AMD.aliases);
                        var mod = v.__AMD.mods[rs.mid];
                        if(mod) return mod;
                        return v.__AMD.mods[rs.mid] = rs;
                    }
                },
                /**
                 * agument package info
                 * @param pkg
                 */
                aumentPkgInfo : function(pkg){
                    //assumpation the package object passed in is full-resolved
                    var name = pkg.name;
                    pkg = v.__lang.mix({m:"m"}, pkg);
                    pkg.path = pkg.path ? pkg.path : name;
                    //
                    if(!pkg.m.indexOf("./")){
                        pkg.m = pkg.m.substr(2);
                    }
                    //put agumented pkg info in packs
                    v.__AMD.packs[name] = pkg;
                },


                /**
                 *
                 * Spring 1: we won't handle any cache mechanism here
                 * Spring 2: Add a configure attribute to handle a set of resources which forced to refresh by version
                 * Spring 3: TODO:
                 * @param cfg
                 * @param boot
                 * @param refMod
                 */
                configure : function(cfg, boot, refMod){
                    if(!cfg || cfg.length == 0) return;
                    //timeout timer
                    v.__AMD.timeout = cfg['timeout']|| v.__AMD.defaultCfg.timeout;
                    //if true, will generate a random number along with module to flush the cache
                    v.__AMD.cache = cfg['cache'] ||v.__AMD.defaultCfg.cache;
                    //augment the package info
                    v.__lang.forEach(cfg.pkgs, v.__lang.ride(this, function(pkg){
                        this.aumentPkgInfo(pkg);
                    }));
                    //map aliases
                    //override will happen if the key name is the same
                    //key name has to be unique
                    v.__lang.forEach(cfg.aliases, function(aliase){
                        if(v.__lang.isString(aliase[0])){
                            aliase[0] = aliase[0].replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(str) { return "\\" + str });
                        }
                        v.__AMD.aliases.push([new RegExp("^" + aliase[0] + "$"), aliase[1]]);
                    });
					if(cfg['debug']){
						v.__lang.getProp(["__debug"], true, v).state = cfg['debug'];
					}
                },

                context : {
                    init : function(name, dependencies, factory, refMod){
                        var mod, syntheticMid;
                        if(v.__lang.isArray(name)){
                            syntheticMid = "use*" + bl.uid();
                            //resolve the request list with respect to the reference module
                            for(var mid, deps = [], i = 0, l = name.length; i <l;){
                                mid = name[i++];
                                deps.push(v.__AMD.pkg.getModule(mid, refMod));
                            }
                            //construct a synthetic module to control execution of the request list
                            mod = v.__lang.mix(new Module({pid:"", mid:syntheticMid, pack:0, url:""}), {
                                attached : v.__AMD.state.ARRIVED,
                                deps : deps,
                                factory : factory||dependencies||noop
                            });
                            v.__AMD.mods[mod.mid] = mod;
                            //attach the module
                            mod.attachDeps();
                            //
                            var strict = v.__AMD.checkCompleteGuard;
                            v.__AMD.guard.checkComplete(function(){
                               mod.execute(strict);
                            });
                            if(!mod.executed){
                                // some deps weren't on board or circular dependency detected and strict; therefore, push into the execQ
                                v.__AMD.execQ.push(mod);
                            }
                            v.__AMD.guard.monitor();
                        }
                    },
                    exposeLang : function(){
                        return v.__lang;
                    }
                },
                /**
                 * insert a script element to the insert-point element with src=url;
                 * apply callback upon detecting the script has loaded.
                 * @param url
                 * @param cb
                 * @param module
                 */
                inject : function(url, cb, module){
                    var node = module.script = doc.createElement("script");
                    var loadHandler = domOn(node, "load", "onreadystatechange", function(e){
                        injectOnLoad(e, loadHandler, errorHandler, cb);
                    });
                    var errorHandler = domOn(node, "error", "onerror", function(e){
                        injectOnLoad(e, loadHandler, errorHandler, function(){
                            throw new Error("Inject script error from : " + url);
                        });
                    });
                    node.type = "text/javascript";
                    node.charset = "utf-8";
                    node.src = url;
                    v.__AMD.insertPointSibling.parentNode.insertBefore(node, v.__AMD.insertPointSibling);
                    return node;
                },
                /**
                 *
                 * @param refMod
                 */
                runDefQ : function(refMod){
                    // defQ is an array of [id, dependencies, factory]
                    var definedModules = [],
                        module, args;
                    while(v.__AMD.defQ.length){
                        args = v.__AMD.defQ.shift();
                        module = (args[0] && this.getModule(args[0]))||refMod;
                        definedModules.push([module, args[1], args[2]]);
                    }
                    v.__lang.forEach(definedModules, v.__lang.ride(this, function(args){
                        var module = this.defineModule.apply(this, args);
                        module.attachDeps();
                    }));
                },
                /**
                 *
                 * @param module
                 * @param deps
                 * @param factory
                 */
                defineModule : function(module, deps, factory){
                    if(module.attached == v.__AMD.state.ARRIVED){
                        //TODO:
                        throw new Error("module multiple define");
                        return module;
                    }
                    //mix
                    v.__lang.mix(module,{
                        deps : deps,
                        factory : factory,
                        //common js module identifier
                        cjs : {
                            "id" : module.mid,
                            "uri" : module.url,
                            "public" : (module.result = {}),
                            //
                            "config" : function(){
                                return module.config;
                            }
                        }
                    });
                    //resolve deps with respect to this module
                    for(var i = 0; deps[i]; i++){
                        deps[i] = this.getModule(deps[i], module);
                    }
                    module.arrived();
                    if(!v.__lang.isFunction(factory) && !deps.length){
                        module.result = factory;
                        module.done();
                    }
                    return module;
                }
            }
        });

        /**
         * properties of Module
         */
        v.__lang.mix(Module.prototype, {
            /**
             * when appending a script element inito the document
             */
            requested : function(){
                this.attached = this.context.state.REQUESTED;
                this.context.hangQ[this.mid] = 1;
                if(this.url){
                    this.context.hangQ[this.url] = this.pack||1;
                }
                this.context.timer.start();
            },
            /**
             * the script that contatined the module arrived
             */
            arrived : function(){
                this.attached = this.context.state.ARRIVED;
                delete this.context.hangQ[this.mid];
                if(this.url){
                    delete this.context.hangQ[this.url];
                }
                if(v.__lang.isEmpty(this.context.hangQ)){
                    this.context.timer.clear();
                }
            },
            /**
             *Attach the dependencies of the module
             */
            attachDeps : function(){
                var that = this;
                this.context.guard.checkComplete(v.__lang.ride(this, function(){
                    v.__lang.forEach(that.deps, function(dep){
                        dep.attach();
                    });
                }));
            },
            /**
             * Attach the module
             */
            attach : function(){
                var mid = this.mid, url = this.url;
                if(this.executed || this.attached || this.context.hangQ[mid]||
                    (this.url && (this.pack && this.context.hangQ[this.url] === this.pack) ||
                        this.context.hangQ[this.url] == 1)){
                    return;
                }
                this.requested();
                //all we done is only to support AMD mode
                //so in this mode, the module will be attached by script injection
                this.context.injectingMod = this;
                this.context.pkg.inject(url, v.__lang.ride(this, function(){
                    var context = this.context;
                    context.pkg.runDefQ(this);
                    if(this.attached !== context.state.ARRIVED){
                        this.arrived();

                        //TODO:is it necessary ????
                        v.__lang.mix(this, {
                            attached : context.state.ARRIVED,
                            executed : context.state.EXECUTED
                        });
                    }
                    context.guard.monitor();
                }), this);
                this.context.injectingMod = 0;
            },
            /**
             * Attach the module
             * @param strict : execute in strict mode or not
             */
            execute : function(strict){
                if(this.executed === this.context.state.EXECUTING){
                    // run the dependency vector, then run the factory for module
                    // TODO:
                    return this.context.abortExec;
                }
                if(!this.executed){
                    if(this.factory === noop){
                        return this.context.abortExec;
                    }
                    var deps = this.deps||[],
                        arg, argRS, args = [], i = 0;
                    this.executed = this.context.state.EXECUTING;
                    while((arg = deps[i++])){
                        // for circular dependencies, assume the first module encountered was executed OK
                        // modules that circularly depend on a module that has not run its factory will get
                        // an empty object(module.result = {}). They can take a reference to this object and/or
                        // add properties to it. When the module finally runs its factory, the factory can
                        // read/write/replace this object. Notice that so long as the object isn't replaced, any
                        // reference taken earlier while walking the deps list is still valid.
                        argRS = (arg === this.context.mods["lang"]) ? this.context.pkg.context.exposeLang() :
                                (arg === this.context.mods["public"]) ? (this.cjs && this.cjs.public) :
                                (arg === this.context.mods["module"]) ? this.cjs : arg.execute(strict);

                        //
                        if(argRS === this.context.abortExec){
                            this.executed = this.context.state.INIT;
                            return this.context.abortExec;
                        }
                        args.push(argRS);
                    }
                    //
                    this.runFactory(args);
                    this.done();
                }
                return this.result;
            },
            /**
             *
             * @param args
             */
            runFactory : function(args){
                var result = v.__lang.isFunction(this.factory) ? this.factory.apply(null, args) : this.factory;
                this.result = result ? result : (this.cjs ? this.cjs["public"] : {});
            },

            done : function(){
                this.executed = this.context.state.EXECUTED;
                this.defOrder = this.context.defOrder++;
                //TODO: plugin
                //remove all occurrences of this module from the execQ
                for(var i = 0; i < this.context.execQ.length;){
                    if(this.context.execQ[i] === this){
                        this.context.execQ.splice(i,1);
                    }else{
                        i++;
                    }
                }
                //delete references to sythentic modules
                if(/^use\*/.test(this.mid)){
                    delete this.context.mods[this.mid];
                }
            }
        });

        //var logger = v.logger("Bolin/AMD");
        /**
         *
         * @type {{defalutDeps: string[], use: use, add: add}}
         */
        v.__AMD.BoLin = {

            defalutDeps : ["lang", "public", "module"],

            /**
             * Summary:
             *      Won't support synchronize mode here
             *      So we assume that all the modules have been well-defined before calling use method
             *
             * Description:
             *
             * @param name(Array) an array of module names
             * @param deps
             * @param factory
             */
            use : function(name, deps, factory){
                v.__AMD.pkg.context.init(name, deps, factory);
            },
            /**
             *
             * @param name
             * @param deps
             * @param factory
             *
             * eg: def("lang");
             */
            add : function(name, deps, factory){
                var l = arguments.length,
                    args = [0, name, deps];
                if(l == 1){
                    args = [0, bl.__lang.isFunction(name) ? this.defalutDeps :[], name];
                }else if(l == 2 && bl.__lang.isString(name)){
                    args = [name, bl.__lang.isFunction(deps) ? this.defalutDeps :[], deps];
                }else if(l == 3){
                    args = [name, deps, factory];
                }

                if(args[1] === this.defalutDeps){
                    //Remove comments from the callback string,
                    //look for use calls, and pull them into the dependencies,
                    //but only if there are function args.
                    args[2].toString().replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, "").replace(/[^.]\s*use\s*\(\s*["']([^'"\s]+)["']\s*\)/g, function(match, dep){
                        //
                        args[1].push(dep);
                    });
                }
                var targetModule = args[0] && v.__AMD.pkg.getModule(args[0]), mod;
                if(targetModule && !v.__AMD.hangQ[targetModule.mid]){
                   mod = v.__AMD.pkg.defineModule(targetModule, args[1], args[2]);
                    mod.attachDeps();
                }else if(!ie_event_behavior){
                    v.__AMD.defQ.push(args);
                }else{
                    //add IE support
                    //TODO: re-build  in next version
                    targetModule = targetModule || v.__AMD.injectingMod;
                    if(!targetModule){
                        for(name in v.__AMD.hangQ){
                            var module = v.__AMD.mods[name];
                            if(module && module.script && module.script.readyState === "interactive"){
                                targetModule = module;
                                break;
                            }
                        }
                    }
                    if(targetModule){
                        mod = v.__AMD.pkg.defineModule(targetModule, args[1], args[2]);
                        mod.attachDeps();
                    }
                    v.__AMD.guard.monitor();
                }
            }
        };

        //only for easy use
        bl.use = bl.__AMD.BoLin.use;
        bl.add = bl.__AMD.BoLin.add;
        bl.config = bl.__AMD.pkg.configure;
    })(bl);
    //+++++++++++++++++++++++++something about AMD end+++++++++++++++++++++++++++


    //looks for a src attribute ending in bl.js
    (function(v){
        //
        var scripts = doc.getElementsByTagName("script"),
            i = 0, l = scripts.length, script,src, match;
        while(i < l){
            script = scripts[i++];
            if((src = script.getAttribute("src")) && (match = src.match(/(((.*)\/)|^)bl\.js(\W|$)/i))){
                //sniff bl dir and baseUrl
                //v.__loader.baseUrl = (match[3] + "/") ||"./";
                v.__AMD.baseUrl = (match[3] + "/") || "./";
                //remember an inster point sibling
                v.__AMD.insertPointSibling = script;
            }
            if(src = script.getAttribute("vecfg")){
                v.__AMD.sniffCfg = v.eval("({ " + src + " })");
                //remember an inster point sibling
                v.__AMD.insertPointSibling = script;
            }

        }
    })(bl);
    /**
     * An engine to boot the framework
     */
    bl.boot = {
        start : function(config){
            bl.__AMD.pkg.configure(bl.__AMD.defaultCfg);
            bl.__AMD.pkg.configure(config);
            bl.__AMD.pkg.configure(bl.__AMD.sniffCfg);
        }
    };
//    bl.Cfg = {
//        pkgs : [
//            {
//                name : "uu",
//                path : "tests/amd"
//            }
//        ]
//    };
    //before booting, set AMD user config
    bl.boot.start(bl.Cfg);
    //+++++++++++++++++++++++++something about logger start+++++++++++++++++++++++++++
    (function(v){
        typeof console !== "undefined" || (win.console = {});
        var mds = [
            "assert", "count", "debug", "dir", "dirxml", "error", "group",
            "groupEnd", "info", "profile", "profileEnd", "time", "timeEnd",
            "trace", "warn", "log"
        ];
        var tn, i = 0;
        while((tn = mds[i++])){
            if(!console[tn]){
                (function(method){
                    console[method] = ("log" in console) && v.__debug.state ? function(){
                        var a = Array.prototype.slice.call(arguments);
                        a.unshift(method + ":");
                        console["log"](a.join(" "));
                    } : noop;

                })(tn);
            }else{
               if(!v.__debug.state){
                   console[tn] = noop;
               }
            }
        }
    })(bl);
    //+++++++++++++++++++++++++something about logger end+++++++++++++++++++++++++++
    //expose to public
    win.$ = win.veeb = bl.__lang.safeMix(win.$||{}, bl);

})(window);