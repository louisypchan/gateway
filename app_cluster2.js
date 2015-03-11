var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
//include cluster2 module
var Cluster = require('cluster2');
//var routes = require('./routes/index');
// numbers of CPUs
// use n-1, leave one to handle other things
var numCPUs = require('os').cpus().length - 1;

var gateway = require('./routes/gateway');

var image = require('./routes/image');

var combo = require('./routes/combo');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));

//app.engine('html', doT.compile);

app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(compression()); //turn on gzip TODO: add filter
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'cdn')));
app.use(express.static(path.join(__dirname, 'combo')));
//app.use('/', routes);

app.use('/proxy/*', gateway);

app.use('/image/*', image);

app.use('/combo/*', combo);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var c = new Cluster({
    cluster : true,
    port : 3000,
    noWorkers : numCPUs,
    host : '127.0.0.1'
});

c.on('died', function(pid) {
    console.log('Worker ' + pid + ' died');
});

c.on('forked', function(pid) {
    console.log('Worker ' + pid + ' forked');
});

c.on('SIGKILL', function() {
    console.log('Got SIGKILL');
});

c.on('SIGTERM', function(event) {
    console.log('Got SIGTERM - shutting down');
});

c.on('SIGINT', function() {
    console.log('Got SIGINT');
});

c.listen(function(cb){
   cb(app);
});
//module.exports = app;
