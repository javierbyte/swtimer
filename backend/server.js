var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var _ = require('lodash')

var STORE = {}

var PORT = process.env.PORT || 4007

io.on('connection', function(socket){
  socket.on('REQUEST_EVENT', function(eventName, callback) {
    console.log('\nREQUEST_EVENT', eventName)

     socket.join('EVENT_ROOM_' + eventName)

    if (STORE[eventName]) {
      callback(null, STORE[eventName])
    } else {
      callback({ERR: 'No such event'}, null)
    }
  })

  socket.on('POST_EVENT', function(eventData, callback) {
    console.log('\POST REQUEST', eventData.eventName)

    var eventName = eventData.eventName

    while (STORE[eventName]) {
      eventName = eventName + '(1)'
    }

    STORE[eventName] = _.assign({}, eventData, {
      status: {
        active: 0
      }
    })

    callback(null, {
      key: eventName,
      token: 3
    })
  })
});


http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});
