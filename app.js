//declare modules
var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var filename = path.join(__dirname, 'debug.log');
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':true}),
        new (winston.transports.File)({ filename: filename })
    ]
});
// // Database
// var PouchDB = require('pouchdb');
// // var db = new PouchDB('http://localhost:5984/trip');
// var db = new PouchDB('http://myoa.smileupps.com/trip');

var app = express();
var routes = require('./routes/index');

//set express environment
app.engine('.html', require('ejs').__express);
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// // Make our db accessible to our router
// app.use(function(req,res,next){
//     req.db = db;
//     next();
// });

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forwarding to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

//http server
var httpserver = http.createServer(app);
httpserver.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

//socket
var cardTouch = 0;
var mapDrag = 0;
var mapZoom = 0;
var filterHeart = 0;
var filterCard = 0;
var filterHotels = 0;
var filterAttractions = 0;
var io = require('socket.io')(httpserver);
io.on('connection', function (socket) {
    socket.emit('news', {hello: 'world'});

//        io.emit send message to all clients，socket.emit send message to particular client
    socket.on('start',function(){
        console.log('Experiment Starts!!!!');
        cardTouch = 0;
        mapDrag = 0;
        mapZoom = 0;
        filterHeart = 0;
        filterCard = 0;
        filterHotels = 0;
        filterAttractions = 0;
    });
    socket.on('chooselocation', function (data) {
        var txt = 'choose the location, player: '+data.player+', location: '+data.location;
        console.log(txt);
        var numLocation = data.location-1;
        io.emit('chooselocation', data);
    });

    socket.on('addnote', function(data){
        console.log('add note',data);
        io.emit('addnote', data);
    });
    socket.on('deletenote', function(data){
        console.log('delete note',data);
        io.emit('deletenote', data);
    });

    socket.on('vote', function(data){
        var txt = 'vote for location, id: '+data.id+', value: '+data.value;
        console.log(txt);
        io.emit('vote', data);
    });

    socket.on('filtrateLocation', function(data){
        var card = data.button;
        switch(card){
            case 'card':
                filterCard++;
                console.log('filter: ', card, filterCard);
                break;
            case 'heart':
                filterHeart++;
                console.log('filter: ', card, filterHeart);
                break;
            case 'hotels':
                filterHotels++;
                console.log('filter: ', card, filterHotels);
                break;
            case 'attractions':
                filterAttractions++;
                console.log('filter: ', card, filterAttractions);
                break;        
        }
    });

    socket.on('touchLocationCard', function(data){
        cardTouch++;
        console.log('touch a location card', data, cardTouch);
    });

    socket.on('validation', function(data){
        console.log('validation', data);
    });

    socket.on('changeZoom', function(){
        mapZoom++;
        console.log('change the zoom of the map',mapZoom);
    });

    socket.on('dragend', function(){
        mapDrag++;
        console.log('drag the map', mapDrag);
    });

    socket.on('end', function(){
        console.log('Experiment Ends!!!!');
    });
});
