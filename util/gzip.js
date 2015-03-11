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

var zlib = require('zlib');
var through = require('through2');
var Readable = require('stream').Readable;
var toArray  = require('stream-to-array');


function bufferGzip(contents, options, callback){
    // Create a readable stream out of the contents
    var rs = new Readable({ objectMode: true });
    rs._read = function() {
        rs.push(contents);
        rs.push(null);
    };

    // Compress the contents
    var gzipStream = zlib.createGzip(options.gzipOptions||{});
    rs.pipe(gzipStream);
    // Turn gzip stream back into a buffer
    toArray(gzipStream, function (err, chunks) {
        if (err) {
            callback(err, null, false);
            return;
        }
        callback(null, Buffer.concat(chunks), true);
        return;
    });
}

function streamGzip(contents, options, callback) {
    // Compress the file contents
    var gzipStream = zlib.createGzip(options.gzipOptions||{});
    callback(null, contents.pipe(gzipStream), true);
}


module.exports = function(opt){
    opt = opt || {};

    function compress(file, enc, cb) {
        var self = this;

        if(file.isNull()){
            //ignore and pass to next plugin
            this.push(file);
            return cb();
        }
        // Call when finished with compression
        var finished = function(err, contents, wasCompressed) {
            if (err) {
                self.emit('error', 'gzip failed!');
                cb();
                return;
            }

            if (opt.append && wasCompressed) file.path += '.gz';
            file.contents = contents;
            self.push(file);
            cb();
            return;
        };
        if(file.isBuffer()){
            bufferGzip(file.contents, opt, finished);
        }else{
            streamGzip(file.contents, opt, finished);
        }
    }

    return through.obj(compress);
};