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
$.add("bl/core/declare", ["./kernel", "bl/extensions/object", "bl/extensions/array"], function(kernel){
    /**
     * http://www.python.org/download/releases/2.3/mro/
     * class A(O)
     * class B(O)
     * class C(O)
     *
     * class E(A,B)
     *
     * mro(A) = [A,O]
     * mro(B) = [B,O]
     * mro(E) = [E] + merge(mro(A), mro(B), [A,B])
     * [E] + ([A,O], [B,O], [A,B])
     * [E,A]
     * [A,B]
     */
    function MRO(it){
        var t = it._meta._super, seqs = [it];
        if(t){
            if(!kernel.isArray(t)){
                return seqs.concat(t);
            }else{
                while(true){
                    seqs = seqs.concat(t);
                    t = t._meta._super;
                    if(!t){
                        break;
                    }
                }
                return seqs;
            }
        }
        return seqs;
    }
    /**
     * C3 Method Resolution Order (see http://www.python.org/download/releases/2.3/mro/)
     */
    function mro_c3(bases){
        var l = bases.length;
        if(l == 1){
            if(!bases[0]._meta._super){
                return bases;
            }else{
                return bases.concat(mro_c3([].concat(bases[0]._meta._super)));
            }
        }else{
            var seqs = [], res = [];
            for(var i = 0; i < l; i++){
                seqs.push(MRO(bases[i]));
            }
            seqs.push(bases);
            while(seqs.length){
                res = res.concat(merge(seqs));
            }
            return res;
        }
    }
    /**
     * Merge Impl
     */
    function merge(args){
        if(args){
            var t, l = args.length, top = 0, index, res = [];
            for(var i = 0; i < l; i++){
                t = args[i][0];
                top = 0;
                index = -1;
                //
                for(var j = i+1; j < l; j++){
                    index = args[j].indexOf(t);
                    top += index;
                    //find in the first
                    if(index == 0){
                        args[j].splice(index,1);
                        if(args[j].length == 0){
                            args.splice(j, 1);
                        }
                        //break;
                    }
                    //still can find it, but not in the first
                    //
                    if(index > -1){
                        top += index;
                    }
                }
                //
                if(top == 0 || top == -1){
                    res.push(t);
                    args[i].splice(0,1);
                    if(args[i].length == 0){
                        args.splice(i,1);
                    }
                    break;
                }
            }
            if(!res.length){
                throw new Error("can't build consistent linearization");
            }
            return res;
        }
    }
    /**
     * call parents' method implementation
     * [fix the OOM issue]
     */
    function callSuperImpl(){
        var caller = callSuperImpl.caller, name = caller._name,
            meta = this._class._meta, p, _super, f;
        while(meta){
            _super = meta._super;
            p = _super.prototype;
            // fix the OOM issue
            // to find out the inheritance relation ships
            if(p && p[name] && (kernel.isFunction(p[name]) && (meta.ctor === caller||meta.transparent[name] === caller))){
                f = p[name];
                break;
            }
            // go loop
            meta = _super._meta;
        }
        if(f){
            f.apply(this, arguments);
        }
    }

    var isStatic = function(it){
            return it.indexOf("+") == 0;
        },
        isNelectful  = function(it){
            return it.indexOf("~") == 0;
        },
        safeMixin = function(target, source, crackPrivate){
            var name, t, p = [];
            for(name in source){
                t = source[name];
                if(kernel.isNotObjectProperty(t, name) && !isNelectful(name)){
                    if(kernel.isFunction(t)){
                        //assign the name to a function
                        t._name = name;
                    }
                    target[name] = t;
                }
            }
            return p;
        },
        aF = new Function,

        crackStatic = function(it){
            var t = it.prototype, name, src;
            for(name in t){
                if(isStatic(name)){
                    src = t[name];
                    name = name.substr(1);
                    it[name] = src;
                    delete t["+" + name];
                }
            }
            t = name = src = null;
        },
       //
        declare = function(obj){
            var superclass = obj["~superclass"], proto = {}, clsName = obj["~name"], ctor = false, crackPrivate = false, privates = [];
            if(superclass){
                (function(supercls){
                    if(kernel.isFunction(supercls)){
                        //force new
                        aF.prototype = supercls.prototype;
                        proto = new aF;
                        //clean up
                        aF.prototype = null;
                    }else if(kernel.isArray(supercls)){
                        var t = supercls.slice(0);
                        t = mro_c3(t);
                        for(var i = 0, base, l = t.length; i < l; i++){
                            base = t[i];
                            aF.prototype = base.prototype;
                            privates = privates.concat(safeMixin(proto, new aF, false));
                            aF.prototype = null;
                        }
                    }
                    crackPrivate = true;
                })(superclass);
            }
            //clone the properties
            var rPorot = kernel.mixin(true, {}, proto);
            //add all properties
            privates = privates.concat(safeMixin(rPorot, obj, crackPrivate));
            //new constructor
            if(obj.ctor){
                ctor =  rPorot.ctor = obj.ctor;
            }
            var f = (function(ctor){
                return function(){
                    f.executed || processSynthesize(f, this);
                    if(ctor){
                        ctor.apply(this,arguments);
                    }
                    return this;
                }
            })(ctor);
            f.executed = false;
            //cache meta information
            f._meta = {ctor : obj.ctor, synthesize : obj["~synthesize"], _super : superclass, transparent : rPorot};
            rPorot._super = callSuperImpl;
            //constructor the prototype
            f.prototype = rPorot;
            f.privates = privates;
            //crack static
            crackStatic(f);
            //
            rPorot._class = f;
            //synthesize properties
            //__synthesizes.push(f);
            //add name if specified
            if(clsName){
                kernel.set(clsName, f);
                rPorot._class._name = clsName;
            }
            //return
            return f;
        },
        processSynthesize = function(it, ctx){
            if(it){
                it.executed || injectSynthesize(it, ctx);
            }
        },
        injectSynthesize = function (it, ctx){
            for(var i = 0 , synthesize = it._meta.synthesize, l = synthesize ? synthesize.length : 0; i < l; i++){
                synthesizeProperty(it.prototype, synthesize[i], ctx);
            }
            it.executed = true;
        },
        synthesizeProperty = function (proto, prop, ctx){
            var m = prop.charAt(0).toUpperCase() + prop.substr(1),
                //getter
                mGet = "get" + m,
                //setter
                mSet = "set" + m,
                //real variable in use
                _prop = "_" + prop;
            kernel.objectHasMethod(proto, mSet) || (proto[mSet] = function(value){
                this[_prop] = value;
            });
            //define setter
            var setter = function(value){
                this[mSet](value);
            };
            kernel.objectHasMethod(proto, mGet) || (proto[mGet] = function(){
                return this[_prop];
            });
            //define getter
            var getter = function(){
                return this[mGet]();
            };
            //to support IE7/IE8
            if($.browser.ie && $.browser.ie < 9){
                /**
                 // IE8 not all JavaScript Objects can use Object.defineProperty. This is so werid
                 // We have to chose another solution to support IE7 and IE8
                 // Here we consider that to use watch solution to simulate setter method
                 // That means when there is an asignment there will notify the specific method to be executed
                 // And consider that if we don't change to use function to minitor watching callbacks
                 // Here we go
                 */
                kernel.watcher.add(ctx, prop, mSet);
            }else{
                Object.defineProperty(proto, prop, {
                    get: getter,
                    set: setter
                });
            }
        };

    return declare;
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
$.add("bl/extensions/object", [], function(){

    // ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
    // Partial support for most common case - getters, setters, and values
    (function() {
        if (!Object.defineProperty ||
            !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
            var orig = Object.defineProperty;
            Object.defineProperty = function (o, prop, desc) {
                // In IE8 built-in implementation for defining properties on DOM prototypes.
                if (orig) { try { return orig(o, prop, desc); } catch (e) {} }
                if (o !== Object(o)) { throw TypeError("Object.defineProperty called on non-object"); }
                if (Object.prototype.__defineGetter__ && ('get' in desc)) {
                    Object.prototype.__defineGetter__.call(o, prop, desc.get);
                }
                if (Object.prototype.__defineSetter__ && ('set' in desc)) {
                    Object.prototype.__defineSetter__.call(o, prop, desc.set);
                }
                if ('value' in desc) {
                    o[prop] = desc.value;
                }
                return o;
            };
        }
    }());



});/**
 * Created by Administrator on 1/14/2015.
 */
$.add("bl/core/when", ["bl/core/kernel", "bl/core/deferred", "bl/extensions/array"], function(kernel, Deferred){
   //deferred list

    function _exec(a, done, fail){
        if(a instanceof Deferred){
            a.then(done, fail);
        }else{
            done(a);
        }
    }
    /**
     * Take one(multiple) promise(s) and return a new promise
     * when all promisees
     */
    var when = function(/*..*/){
        try{
            var arity = arguments.length, args;
            if(arity == 1){
                args = arguments[0];
            }else{
                args = arguments;
            }
            args = kernel.makeArray(args);
            var def = new Deferred(), waitCount = args.length, rs;
            if(!waitCount) {
                return def.resolve([]);
            }
            rs = [];
            //
            args.forEach(function(v, i){
                _exec(v, function(data){
                    if(!def.isFulfilled()){
                        rs[i] = data;
                        if(--waitCount === 0){
                            def.resolve(rs);
                        }
                    }
                }, def.reject);
            });
            return def.promise;
        }catch (e){
            throw  e;
        }

    };

    return when;
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
 * Created by Louis Y P Chen on 2014/11/6.
 */
$.add("bl/core/deferred", ["bl/core/declare", "bl/core/kernel"], function(declare, kernel){

    return declare({
        "~name" : "$.core.Deferred",
        "~synthesize" : ["canceler", "listener", "waiting"],
        "+STATE" : {
            PROGRESS : "progress",
            RESOLVED : "resolved",
            REJECTED : "rejected"
        },

        ctor : function(canceler){
            this.promise = this;
            this.canceler = canceler;
            //To be removed if IE7 and IE8 are not in the supportive list
            kernel.watcher.notify("canceler", this);
            this.fulfilled = false;
            this.promise.then = this.then;
            this.canceled = false;
            this._waiting = [];
            this.value = undefined;
        },

        isResolved : function(){
            return this.fulfilled === $.core.Deferred.STATE.RESOLVED;
        },
        isRejected : function(){
            return this.fulfilled === $.core.Deferred.STATE.REJECTED;
        },
        isFulfilled : function(){
            return !!this.fulfilled;
        },
        isCanceled : function(){
            return this.canceled;
        },
        /**
         * Resolve the deferred, putting it in a success state.
         * @param value
         *      The result of the deferred. Passed to resvoledCallBack.
         * @returns {promise}
         *      Returns the original promise for the deferred.
         */
        resolve : function(value){
            this.value = value;
            if(!this.fulfilled){
                this.fulfilled = $.core.Deferred.STATE.RESOLVED;
                this.waiting = [this._waiting, this.fulfilled, value];
                //To be removed if IE7 and IE8 are not in the supportive list
                kernel.watcher.notify("waiting", this);
                this._waiting = null;
            }
            return this.promise;
        },
        /**
         * Reject the deferred, putting it in an error state.
         * @returns {promise}
         */
        reject : function(value){
            this.value = value;
            if(!this.fulfilled){
                this.fulfilled = $.core.Deferred.STATE.REJECTED;
                this.waiting = [this._waiting, this.fulfilled, value];
                //To be removed if IE7 and IE8 are not in the supportive list
                kernel.watcher.notify("waiting", this);
                this._waiting = null;
            }
            return this.promise;
        },
        /**
         * Add new callbacks to the deferred. Callbacks can be added
         * before or after the deferred is fulfilled.
         */
        then : function(resolvedCallback, rejectedCallback, progressCallback){
            var promise = {};
            promise[$.core.Deferred.STATE.PROGRESS] = progressCallback;
            promise[$.core.Deferred.STATE.RESOLVED] = resolvedCallback;
            promise[$.core.Deferred.STATE.REJECTED] = rejectedCallback;

            promise.cancel = this.promise.cancel;
            promise.deferred = new $.core.Deferred(function(reason){
                return promise.canel && promise.cancel(reason);
            });
            if(this.fulfilled && !this._waiting){
                this.listener = [promise, this.fulfilled, this.value];
                //To be removed if IE7 and IE8 are not in the supportive list
                kernel.watcher.notify("listener", this);
            }else{
                this._waiting.push(promise);
            }
            return promise.deferred.promise;
        },
        /**
         * Emit a progress update on the deferred.
         * @param update
         */
        progress : function(update){
            if(!this.fulfilled){
                this.fulfilled = $.core.Deferred.STATE.PROGRESS;
                this.waiting = [this._waiting, this.fulfilled, update];
                //To be removed if IE7 and IE8 are not in the supportive list
                kernel.watcher.notify("waiting", this);
            }
            return this.promise;
        },

        "setCanceler" : function(canceler){
            this._canceler = canceler;
            this.promise.cancel = this.cancel = function(reason){
                if(!this.fulfilled){
                    if(!this._canceler){
                        var returnedReason = this._canceler(reason);
                        reason = returnedReason || reason;
                    }
                    this.canceled = true;
                }
                return reason;
            };
        },
        "getCanceler" : function(){
            return this._canceler;
        },

        "mkHandler" : function(deferred, type){
            return (function(context){
                return function(value){
                    context.handle(deferred, type, value);
                }
            })(this);
        },

        "setListener" : function(args){
            var promise = args[0], type = args[1], result = args[2],
                func = promise[type], deferred = promise.deferred;
            if(func){
                try{
                    var newResult = func(result);
                    if(type == $.core.Deferred.STATE.PROGRESS){
                        if(typeof newResult !== "undefined"){
                            this.handle(deferred, type, newResult);
                        }
                    }else{
                        if(newResult && kernel.isFunction(newResult.then)){
                            promise.cancel = newResult.cancel;
                            newResult.then(this.mkHandler(deferred,$.core.Deferred.STATE.RESOLVED),
                                this.mkHandler(deferred, $.core.Deferred.STATE.REJECTED),
                                this.mkHandler(deferred, $.core.Deferred.STATE.PROGRESS));
                            return;
                        }
                        this.handle(deferred, $.core.Deferred.STATE.RESOLVED, newResult);
                    }
                }catch(e){
                    this.handle(deferred, $.core.Deferred.STATE.REJECTED, e);
                }
            }else{
                this.handle(deferred, type, result);
            }
        },
        "setWaiting" : function(args){
            var waiting = args[0], type = args[1], result = args[2];
            this.value = result;
            for(var i = 0; i < waiting.length; i++){
                this.listener = [waiting[i], type, result];
                //To be removed if IE7 and IE8 are not in the supportive list
                kernel.watcher.notify("listener", this);
            }
        },

        "handle" : function(deferred, type, result){
            if(!deferred.isCanceled()){
                switch (type){
                    case $.core.Deferred.STATE.PROGRESS :
                        deferred.progress(result);
                        break;
                    case $.core.Deferred.STATE.RESOLVED :
                        deferred.resolve(result);
                        break;
                    case $.core.Deferred.STATE.REJECTED :
                        deferred.reject(result);
                        break;
                }
            }
        },

        "toString" : function(){
            return "[object Deferred]";
        }
    });
});