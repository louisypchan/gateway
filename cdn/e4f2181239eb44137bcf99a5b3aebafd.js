/****************************************************************************
 Copyright (c) 2014 Louis Y P Chen.
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
 * Created by Louis Y P Chen on 2014/10/23.
 */
$.add("bl/core/kernel", ["lang", "bl/extensions/string", "bl/extensions/array"], function(lang){
    var result = {};
    result = lang.mixin(result, lang);
    var op = Object.prototype;
    //exclude the following css properties to add px 以下属性是否要加 px
    var exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
        FN_ARG =  /^\s*(_?)(\S+?)\1\s*$/,
        FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
        eventSupport = {},
        FN_ARG_SPLIT = /,/;
    /**
     * A internal plugin to fix the accuracy of float number calculation
     */
    function roundTo(num, unit){
        if(0 > unit) return num;
        unit = Math.pow(10, unit);
        return Math.round(num * unit) / unit;
    }
    function addZeros(){
        var num = arguments[0], decimalSeparator = arguments[1], precision = arguments[2];
        num = num.split(decimalSeparator);
        void 0 == num[1] && precision > 0 && (num[1] == "0");
        return num[1].length < precision ? (num[1] += "0", addZeros(num[0] + decimalSeparator + num[1], decimalSeparator, precision)) : void 0 != num[1] ? num[0] + decimalSeparator + num[1] : num[0];
    }

    lang.mixin(result, {
        /**
         * similar to isArray() but more permissive
         * Doesn't strongly test for "arrayness". Instead, settles for "isn't
         * a string or number and has a length property". Arguments objects
         * and DOM collections will return true when passed to
         * isArrayLike(), but will return false when passed to
         * isArray().
         * @param it
         */
        isArrayLike : function(it){
            return it && it !== undefined &&
                // keep out built-in constructors (Number, String, ...) which have length
                !lang.isString(it) && !lang.isFunction(it) &&
                !(it.tagName && it.tagName.toLowerCase() == "form") &&
                (lang.isArray(it) || isFinite(it.length));
        },
        /**
         * A alias method to mixin
         */
        extend : function(){
            return lang.mixin.apply(lang, arguments);
        },
        /**
         * Returns true if it is a built-in function
         */
        isNative : function(it){
            return /^[^{]+\{\s*\[native code/.test(it + "");
        },

        isNumber : function(it){
            return lang.type(it) === "number";
        },
        /**
         * Acoording to the format passing in to adjust the accuracy of float number
         * @param number
         * @param format
         * precision : the float precision, for this function, we will set 2 to precision
         * decimalSeparator : in some country, the float indicates by ",", by defalut is "."
         * thousandsSeparator :
         */
        sanitize : function(number, format){
            format = format || {precision : 2, decimalSeparator : ",", thousandsSeparator : "."};
            number = roundTo(number,format.precision);
            var decimalSeparator = format.decimalSeparator,
                thousandsSeparator = format.thousandsSeparator,
                isMinus = 0 > number ? '-' : '',
                number = Math.abs(number),
                numStr = number.toString();
            if(numStr.indexOf('e') == -1){
                for(var numArr = numStr.split(decimalSeparator), i = "", k = numArr[0].toString(), j = k.length; 0 <= j; j -= 3){
                    i = j != k.length ? 0 != j ? k.substring(j - 3, j) + thousandsSeparator + i : k.substring(j - 3, j) + i : k.substring(j - 3, j);
                }
                numArr[1] && (i = i + decimalSeparator + numArr[1]);
                format.precision > 0 && "0" != i && (i = addZeros(i,decimalSeparator,format.precision));
            }else{
                i = h;
            }
            i = isMinus + i;
            return i - 0;
        },
        /**
         * Clones objects (including DOM nodes) and all children.
         * Warning: do not clone cyclic structures.
         * @param src The object to clone
         */
        clone : function(src){
            if(!src || typeof src != "object" || lang.isFunction(src)){
                // null, undefined, any non-object, or function
                return src;
            }

            if(src instanceof Date){
                // Date
                return new Date(src.getTime()); // Date
            }
            if(src instanceof RegExp){
                // RegExp
                return new RegExp(src); // RegExp
            }
            var r, i, l;
            if(lang.isArray(src)){
                return Array.prototype.slice.call(src);
            }else{
                // generic objects
                r = src.constructor ? new src.constructor() : {};
            }
            return lang.mixin(true, {} , r, src);
        },
        /**
         * Add zero to number
         * @param num
         * @param digits
         */
        pad : function(num, digits){
            var pre = "",
                negative = (num < 0),
                string = String(Math.abs(num));
            if (string.length < digits) {
                pre = (new Array(digits - string.length + 1)).join('0');
            }
            return (negative ? "-" : "") + pre + string;
        },
        /**
         * 检查一个元素是否是XML的document
         * @param{Object} elem
         */
        isXMLDoc: function (elem) {
            // documentElement is verified for cases where it doesn't yet exist
            // (such as loading iframes in IE - #4833)
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        },
        /**
         * 判断一个元素的nodeName是不是给定的name
         *
         * elem - 要判定的元素
         * name - 看看elem.nodeName是不是这个name
         */
        nodeName: function(elem, name) {
            return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
        },
        /*
         * 对属性值进行处理.取得正确的属性值.如,这个属性值是否要加上单位"px", 等等.
         *
         * elem - dom元素对象
         * value - 属性值
         * type - 如果有值就代表是样式属性名
         * i - dom元素在jQuery对象匹配元素集合中的索引
         * name - 属性名
         */
        prop: function(elem, value, type, i, name) {
            if (lang.isFunction(value))
                value = value.call(elem, i);
            return value && value.constructor == Number && type == "curCSS" && !exclude.test(name) ?
                value + "px" :
                value;
        },
        /*
         * 判断是否一个对象
         *
         * unknow
         */
        isObject: function (unknow) {
            return typeof unknow === "function" || (typeof unknow === "object" && unknow != null);
        },

        /**
         * To see if the method exists in the specific object or not
         * @param object
         * @param method
         */
        objectHasMethod : function(object, method){
            return object != null && object[method] !== undefined && lang.isFunction(object[method]);
        },

        isNotObjectProperty : function(obj, name){
            return (obj !== op[name] || !(name in op));
        },
        set : function(name, value, context){
            var parts = name.split("."), p = parts.pop(), obj = lang.getProp(parts, true, context);
            return obj && p ? (obj[p] = value) : undefined;
        },
        trim : function(it){
            return it == null ? "" : (it + "").trim();
        },

        contains : $.doc.compareDocumentPosition ? function (container, contained) {
            return !!(container.compareDocumentPosition(contained) & 16);
        }: function (container, contained) {
            if (container === contained) {
                return false;
            }
            if (container.contains && contained.contains) {
                return container.contains(contained);
            }else {
                while (contained = contained.parentNode) {
                    if (contained === container) {
                        return true;
                    }
                }
                return false;
            }
        },
        camelCase : function(str){
            return str.replace( /^-ms-/, "ms-" ).replace( /-([\da-z])/gi, function($0, $1){
                return $1.toUpperCase();
            });
        },
        sortedKeys : function(it){
            return Object.keys(it).sort();
        },
        isUndefined : function(it){
            return typeof value === 'undefined';
        },
        // Copied from:
        // http://docs.closure-library.googlecode.com/git/local_closure_goog_string_string.js.source.html#line1021
        // Prereq: s is a string.
        escapeForRegexp : function(){
            return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
                replace(/\x08/g, '\\x08');
        },
        /**
         * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
         *  http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
         * @param val
         * @returns {*}
         */
        encodeUriSegment : function(val){
            return this.encodeUriQuery(val, true).replace(/%26/gi, '&').
                replace(/%3D/gi, '=').replace(/%2B/gi, '+');
        },
        /**
         * This method is intended for encoding *key* or *value* parts of query component. We need a custom
         * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
         * encoded per http://tools.ietf.org/html/rfc3986:
         * @param val
         * @param pctEncodeSpaces
         */
        encodeUriQuery : function(val, pctEncodeSpaces){
            return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').
                replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%3B/gi, ';').
                replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
        },
        annotate : function(fn){
            var result = [];
            if(!this.isFunction(fn)) return result;
            var fnText = fn.toString().replace(STRIP_COMMENTS, ""),
            argDecl = fnText.match(FN_ARGS);
            if(argDecl&& argDecl[1]){
                argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
                    arg.replace(FN_ARG, function(all, underscore, name){
                        result.push(name);
                    });
                });
            }
        },
        hasEvent : function(eventName){
            if(eventName === "input" && ($.browser.ie && $.browser.ie <= 11)) return false;
            if(this.isUndefined(eventSupport[eventName])){
                var divElm = $.doc.createElement('div');
                eventSupport[eventName] = 'on' + eventName in divElm;
                divElm = null;
            }
            return eventSupport[eventName];
        }
    });

    (function(){
        /**
         // IE8 not all JavaScript Objects can use Object.defineProperty. This is so werid
         // We have to chose another solution to support IE7 and IE8
         // Here we consider that to use watch solution to simulate setter method
         // That means when there is an asignment there will notify the specific method to be executed
         // And consider that if we don't change to use function to minitor watching callbacks
         // Here we go
         */
        result.watcher = (function(){
            var observedprops = {}, PROPERTY_CHANGED = "handlePropertyChange";
            //to check whether is an obeserved property
            function isPropertyObserved(prop){
                return observedprops[prop] !== undefined;
            }
            //add the property into observation pool
            function addPropertyObserver(context, prop, methodName){
                var obj = observedprops[prop];
                if(isPropertyObserved(prop)){
                    if(obj.targets.indexOf(context) > -1){
                        return;
                    }
                }else{
                    obj = observedprops[prop] = {
                        targets : [],
                        methodNames : []
                    };
                    methodName = methodName||PROPERTY_CHANGED;
                    if(result.objectHasMethod(context, methodName)){
                        obj.targets.push(context);
                        obj.methodNames.push(methodName);
                    }
                }
            }
            function removePropertyObserver(context, prop){
                if(!isPropertyObserved(prop)) return false;
                var obj = observedprops[prop],
                    index = obj.targets.indexOf(context);
                if(index){
                    obj.targets.splice(index, 1);
                    obj.methodNames.splice(index, 1);
                    obj.targets.length == 0 && delete observedprops[prop];
                }
                return index;
            }

            function notifyPropertyChange(prop, context){
                if(isPropertyObserved(prop)){
                    var obj = observedprops[prop],
                        c = obj.targets.slice(),
                        m = obj.methodNames.slice();
                    for(var i = 0, l = c.length; i < l; i++){
                        //syn up the real property's value
                        //c[i]["_"+prop] = c[i][prop];
                        if(context && c[i] === context){
                            context[m[i]].call(context, context[prop]);
                            break;
                        }
                        c[i][m[i]].call(c[i], context[prop]);
                    }
                }
            }
            //open APIs
            return {
                add : addPropertyObserver,
                remove : removePropertyObserver,
                notify : notifyPropertyChange
            };
        })();
    })();
    //open up
    return result;
});/****************************************************************************
 Copyright (c) 2014 Louis Y P Chen.

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
 * Created by Louis Y P Chen on 2014/10/31.
 */
$.add("bl/extensions/string",[], function(){

    // ES5 15.9.4.4 Date.now ( )
    // From https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/now
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return String(this).replace(/^\s+/, '').replace(/\s+$/, '');
        };
    }

    // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
    // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
    // with correct but slower alternatives.
    if('i' !== "I".toLowerCase()){
        String.prototype.toLowerCase = function(){
            return this.replace(/[A-Z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) | 32);});
        };

        String.prototype.toUpperCase = function(){
            return this.replace(/[a-z]/g, function(ch) {return String.fromCharCode(ch.charCodeAt(0) & ~32);});
        };
    }
});/****************************************************************************
 Copyright (c) 2014 Louis Y P Chen.

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
 * Created by Louis Y P Chen on 2014/10/23.
 */
$.add("bl/extensions/array", ["lang"], function(lang){
    // module:
    //		bl/extensions/array
    //      an extension of Array

    // indexOf, lastIndexOf
    function index(up){
        var delta = 1, lOver = 0, uOver = 0, u;
        if(!up){
            delta = lOver = uOver = -1;
        }
        var __index = function(a, x, from, last){
            if(last && delta > 0){
                return __index(a, x, from);
            }
            var l = a && a.length || 0, end = up ? l + uOver : lOver, i;
            if(from === u){
                i = up ? lOver : l + uOver;
            }else{
                if(from < 0){
                    i = l + from;
                    if(i < 0){
                        i = lOver;
                    }
                }else{
                    i = from >= l ? l + uOver : from;
                }
            }
            if(l && typeof a == "string") a = a.split("");
            for(; i != end; i += delta){
                if(a[i] == x){
                    return i; // Number
                }
            }
            return -1; // Number
        };
        return __index;
    }

    var arr = Array.prototype;

    lang.mixin(Array.prototype, {

        indexOf : arr.indexOf || function(){
            return index(true).apply(this, arguments);
        },
        contains : arr.contains || function(){
            return this.indexOf.apply(this, arguments) != -1
        },
        lastIndexOf : arr.indexOf || function(){
            return index(false).apply(this, arguments);
        },
        /**
         * only support number or string array now
         * TODO:
         */
        unique : arr.unique || function(){
            var result = [], hash = {};
            for(var i = 0, elem , l = this.length; i < l; ){
                elem = this[i++];
                if(!hash[elem]){
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            return result;
        },
        /**
         * Returns a new Array with those items from arr that match the condition implemented by callback.
         * example:
         *      filter([1, 2, 3, 4], function(item){ return item>1; });
         *      ->
         *          [2,3,4]
         */
        filter : arr.filter || function(/*Function*/rule){
            var i = 0, l = this.length, out = [], value;
            for(; i < l; ++i){
                value = this[i];
                if(rule(value, i, this)){
                    out.push(value);
                }
            }
            return out;
        },
        /**
         *  for every item in arr, callback is invoked. Return values are ignored.
         */
        forEach : arr.forEach || function(cb){
            var i = 0, l = this.length;
            for(; i < l; ++i){
                cb.apply(this, [this[i], i]);
            }
        },
        /**
         * applies callback to each element of arr and returns an Array with the results
         * example:
         *      map([1, 2, 3, 4], function(item){ return item + 1; });
         *      ->
         *          [2,3,4, 5]
         */
        map : arr.map || function(cb){
            var i = 0, l = this.length, out = [];
            for(; i < l; ++i){
                out[i] = cb.apply(this, [this[i], i]);
            }
            return out;
        },

        //TODO: move to phase2
        /**
         * Determines whether or not every item in arr satisfies the condition implemented by callback.
         * // ES5 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
         // From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
         */
        every : arr.every || function(fun /*, thisp */){
            if (this === void 0 || this === null) { throw TypeError(); }
            var t = Object(this);
            var len = t.length >>> 0;
            if (!kernel.isFunction(fun)) { throw TypeError(); }
            var thisp = arguments[1], i;
            for (i = 0; i < len; i++) {
                if (i in t && !fun.call(thisp, t[i], i, t)) {
                    return false;
                }
            }
            return true;
        },
        /**
         * Determines whether or not any item in arr satisfies the condition implemented by callback.
         *
         // ES5 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
         // From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
         */
        some : arr.some || function(fun /*, thisp */){
            if (this === void 0 || this === null) { throw TypeError(); }
            var t = Object(this);
            var len = t.length >>> 0;
            if (!kernel.isFunction(fun)) { throw TypeError(); }
            var thisp = arguments[1], i;
            for (i = 0; i < len; i++) {
                if (i in t && fun.call(thisp, t[i], i, t)) {
                    return true;
                }
            }
            return false;
        },
        /**
         * // ES5 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
         // From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
         */
        redue : arr.redue || function (fun /*, initialValue */) {
            if (this === void 0 || this === null) { throw TypeError(); }
            var t = Object(this);
            var len = t.length >>> 0;
            if (!kernel.isFunction(fun)) { throw TypeError(); }
            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length === 1) { throw TypeError(); }
            var k = 0;
            var accumulator;
            if (arguments.length >= 2) {
                accumulator = arguments[1];
            } else {
                do {
                    if (k in t) {
                        accumulator = t[k++];
                        break;
                    }
                    // if array contains no values, no initial value to return
                    if (++k >= len) { throw TypeError(); }
                }
                while (true);
            }
            while (k < len) {
                if (k in t) {
                    accumulator = fun.call(undefined, accumulator, t[k], k, t);
                }
                k++;
            }
            return accumulator;
        },
        // ES5 15.4.4.22 Array.prototype.reduceRight ( callbackfn [, initialValue ] )
        // From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
        reduceRight : arr.reduceRight || function(callbackfn /*, initialValue */){
            if (this === void 0 || this === null) { throw TypeError(); }
            var t = Object(this);
            var len = t.length >>> 0;
            if (!kernel.isFunction(callbackfn)) { throw TypeError(); }
            // no value to return if no initial value, empty array
            if (len === 0 && arguments.length === 1) { throw TypeError(); }
            var k = len - 1;
            var accumulator;
            if (arguments.length >= 2) {
                accumulator = arguments[1];
            } else {
                do {
                    if (k in this) {
                        accumulator = this[k--];
                        break;
                    }
                    // if array contains no values, no initial value to return
                    if (--k < 0) { throw TypeError(); }
                }
                while (true);
            }
            while (k >= 0) {
                if (k in t) {
                    accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
                }
                k--;
            }
            return accumulator;
        }
    });
});