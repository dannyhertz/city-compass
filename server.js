'use strict';

// Module dependencies
var express = require('express'),
    http = require('http'),
    path = require('path'),
    Citibike = require('citibike');

// Create server
var app = express(),
    citiClient;

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
  var updateOnly = req.query.update;

  if (!citiClient) {
    citiClient = new Citibike();
  }

  citiClient.getStations({ updateOnly: updateOnly }, function(data) {
    var stationList, updateTime;

    if (!data.ok || data.ok === false) {
      res.json(null);
    } else {
      updateTime = data.lastUpdate;
      stationList = data.results;

      stationList = stationList.map(function (st) {
        st.updatedAt = updateTime;
        return st;
      });

      res.json(stationList);
    }
  });
});

// Start server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
