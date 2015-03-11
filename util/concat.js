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
var through = require('through2');
var concat = require('concat-with-sourcemaps');
var path = require('path');

// filename should be a string
module.exports = function(/*String*/filename){
    if (!filename) {
        throw new Error('Missing filename option for concat');
    }

    var _concat;
    var _firstFile;

    function aggregateFiles(file, enc, callback) {

        // ignore empty files
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return callback();
        }
        if(file.isBuffer()){
            if(!_firstFile){
                _firstFile = file;
            }
            if(!_concat){
                _concat = new concat(false, filename, undefined);
            }
            // add file
            _concat.add(file.relative, file.contents, file.sourceMap);
        }
        return callback();
    }

    function renderFile(){
        if (!_firstFile) {
            return this.emit('end');
        }
        var joinedFile;
        if (typeof filename === 'string') {
            joinedFile = _firstFile.clone({contents: false});
            joinedFile.path = path.join(_firstFile.base, filename);
        } else {
            joinedFile = _firstFile;
        }

        joinedFile.contents = _concat.content;

        this.emit('data', joinedFile);
        this.emit('end');
    }

    return through.obj(aggregateFiles, renderFile);
};