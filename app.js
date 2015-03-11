var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
//include cluster module
var cluster = require('cluster');
//var routes = require('./routes/index');
// numbers of CPUs
// use n-1, leave one to handle other things
var numCPUs = require('os').cpus().length - 1;

var gateway = require('./routes/gateway');

var image = require('./routes/image');

var combo = require('./routes/combo');

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Create a worker for each CPU
    for (var i = 0; i < numCPUs; i++) {
        var wk = cluster.fork();
        wk.send('[master] ' + 'hi worker' + wk.id);
    }

    cluster.on('fork', function (worker) {
        console.log('[master] ' + 'fork: worker' + worker.id);
    });

    cluster.on('online', function (worker) {
        console.log('[master] ' + 'online: worker' + worker.id);
    });

    cluster.on('listening',function(worker,address){
        console.log('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
    });

    cluster.on('disconnect', function (worker) {
        console.log('[master] ' + 'disconnect: worker' + worker.id);
    });

    cluster.on('exit', function(worker, code, signal) {
        // Replace the dead worker,
        // we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();
    });

} else {
    // Code to run if we're in a worker process
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

    app.listen(3000);
    console.log("GateWay Application Listening...");
}

//module.exports = app;
