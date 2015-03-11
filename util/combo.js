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
 * Created by Louis Y P Chen on 2015/1/4.
 */
'use strict';

var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var sLopp = require('serial-loop');



var combo = {
    /**
     * Augment the the list to append the basePath into each item of the list
     * @param list
     * @param basePath
     * @returns {*}
     */
    augmentList : function(/*Array*/list, basePath){
        if(!list || !Array.isArray(list)){
            console.error('The list should be an array');
            return [];
        }
        list.forEach(function(f, idx){
            list[idx] = path.join(basePath, f);
        });
        return list;
    },
    /**
     * Generate a specific file name by the given list
     * @param list
     */
    generate : function(list){
        if(!list || !Array.isArray(list)){
            console.error('The list should be an array');
            return "";
        }
        return crypto.createHash('md5').update(list.join("")).digest("hex") + ".js";
    },
    /**
     * Combine the files
     * @param list
     * @param basePath
     * @param req
     * @param res
     */
    combine : function(list, basePath, req, res){
        list = this.augmentList(list, basePath);
        //vinylfs.src(list).pipe()
        var filename = this.generate(list), self = this;
        //filename = path.join("cdn", filename) + ".js";
        //look up cdn to see whether the file exists or not
//        var _path = path.join("cdn", filename),
//            exists = fs.existsSync(_path);
//        if(exists){
//            vinylfs.src(path.join("cdn", filename)).pipe(send(req, res));
//        }else{
//            vinylfs.src(list).pipe(concat(filename)).pipe(vinylfs.dest("cdn")).pipe(send(req, res));
//        }
        var _path = path.join("cdn", filename);
        fs.exists(_path, function(exists){
            if(exists){
                //vinylfs.src(_path).pipe(send(req, res));
                //fs.createReadStream(_path).pipe(res);
                fs.stat(_path, function(err, stats){
                    if(err){
                        res.status(404).end();
                        return;
                    }
                    var lastModified = stats.mtime.toUTCString();
                    res.append('Last-Modified',lastModified);
                    if(lastModified === req.get('If-Modified-Since')){
                        res.status(304).end();
                    }else{
                        fs.createReadStream(_path).pipe(res);
                    }
                });
            }else{
                self.concat(list, _path, function(error){
                    if(error){
                        res.status(404).end();
                    }
                    fs.createReadStream(_path).pipe(res);
                });
            }
        });
    },
    /**
     *
     * @param list
     * @param dest
     * @param done
     */
    concat : function(list, dest, done){

        fs.writeFile(dest, '', function(error){
            if(error) return done(error);

            sLopp(list.length, function(fn, idx){
                fs.readFile(list[idx], function(err, buffer){
                    if (err) return fn(err);
                    fs.appendFile(dest, buffer, fn);
                });
            }, done);
        });
    },

    findDeps : function(){

    }
};

module.exports = combo;