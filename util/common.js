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
var Header_fields = ["Content-Type", "Cookie", "Accept-Language", "Cache-Control",  "User-Agent", "Referer", "Pragma", "Host", "Origin"];

var util = {
    /**
     *
     * @param url
     * @returns {*}
     */
    proxyURL : function(url){
        if(!url) return null;
        url = url.replace(/\/?proxy\//im, "");
        url = url.split('/');
        //url - 0 : serviceName, 1 : interface Name
        //for test only
        //TODO:
        return "http://tt.ve.cn" + "/index.php?ctl=" + url[0] + "&act=" + url[1];
    },
    /**
     *
     * @param req
     * @returns {{}}
     */
    customizeHeaders : function(req){
        var headers = {};
        Header_fields.forEach(function(filed){
            if(req.get(filed)){
                headers[filed] = req.get(filed);
            }
        });

        return headers;
    }
};

module.exports = util;