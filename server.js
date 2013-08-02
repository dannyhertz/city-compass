'use strict';

// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    rest = require('restler');

// Create server
var app = express();

// Configure server
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'app')));

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function (req, res) {
  res.render('index.html.ejs');
});

app.get('/api/stations', function (req, res) {
  rest.get('https://citibikenyc.com/stations/json', {
    parser: rest.parsers.json
  }).on('complete', function(data) {
    var stationList = data.stationBeanList,
        updateTime = data.executionTime;

    stationList.forEach(function (s) {
      s.updatedAt = updateTime;

      delete s.stAddress1;
      delete s.stAddress2;
      delete s.city;
      delete s.postalCode;
      delete s.location;
      delete s.altitude;
      delete s.lastCommunicationTime;
    });

    res.json(stationList);
  });
});

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
