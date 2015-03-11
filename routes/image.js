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
var express = require('express');
var router = express.Router();
var request = require("request");
var util = require('../util/common');

function  reviseURL(url){
    if(!url) return null;
    url = url.replace(/\/?image/im, "");
    //test only
    return "http://tt.ve.cn" + url + ".php";
}

router.get('/*', function(req, res, next) {
    var url = reviseURL(req.baseUrl);
    var headers = util.customizeHeaders(req);
    headers.Host = "tt.ve.cn";
    headers.Orgiin = "http://tt.ve.cn";
    request({url : url, headers : headers, encoding : null}, function(error, response, body){
        if(response.headers['set-cookie']){
            //res.set('Set-Cookie', httpResponse.headers['set-cookie']);
            res.append('Set-Cookie', response.headers['set-cookie']);
        }
        res.set("Content-Type", response.headers['content-type']);
        res.end(body,'binary');
    });
});


module.exports = router;