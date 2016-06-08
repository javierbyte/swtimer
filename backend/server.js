var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var _ = require('lodash')

var STORE = {}

const TICK_SPEED = 500

var PORT = process.env.PORT || 4007

io.on('connection', function(socket){
  socket.on('REQUEST_EVENT', function(eventName, callback) {
    console.log('\nREQUEST_EVENT', eventName, 'EVENT_ROOM_' + eventName)

     socket.join('EVENT_ROOM_' + eventName)

    if (STORE[eventName]) {
      callback(null, STORE[eventName])
    } else {
      console.log('ERR NO SUCH EVENT', {
        req: {eventName},
        STORE
      })
      callback({ERR: 'No such event'}, null)
    }
  })

  socket.on('POST_EVENT', function(eventData, callback) {
    console.log('\POST REQUEST', eventData.eventName)

    var eventName = eventData.eventName

    while (STORE[eventName]) {
      eventName = eventName + '(1)'
    }
    eventData.eventName = eventName

    STORE[eventName] = _.assign({}, eventData, {
      status: {
        active: 0,
        phase: 'PITCH',
        remainingTime: eventData.pitchTime * 1000,
        running: true
      }
    })

    callback(null, {
      key: eventName,
      token: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    })
  })

  socket.on('UPDATE_EVENT', function(eventData, callback) {
    console.log('\UPDATE REQUEST', eventData.eventName, 'EVENT_ROOM_' + eventData.eventName)

    STORE[eventData.eventName]

    _.merge(STORE, {
      [eventData.eventName]: eventData.data
    })

    dispatchEventUpdate(eventData.eventName)
  })


});

function dispatchEventUpdate(eventName) {
  console.warn('DISPATCH', eventName)
  io.to('EVENT_ROOM_' + eventName).emit('EVENT_UPDATE', STORE[eventName])
}

setInterval(function() {
  _.forEach(STORE, event => {
    var eventStatus = event.status

    if (eventStatus.running === true)  {
      // the event is running!

      eventStatus.remainingTime = eventStatus.remainingTime - TICK_SPEED

      if (eventStatus.remainingTime < 0)
        // we finished a phase!

        if (eventStatus.phase === 'PITCH') {
          // we finished PITCH!
          eventStatus.remainingTime = event.qaTime * 1000
          eventStatus.phase = 'QA'
        } else {
          // we finish WA
          eventStatus.remainingTime = event.pitchTime * 1000
          eventStatus.phase = 'PITCH'
          eventStatus.active += 1
        }

        if (eventStatus.active >= event.teams.length) {
          // we finallized!
          eventStatus.active = -1
          eventStatus.running = false
        }

      dispatchEventUpdate(event.eventName)
    }
  })
}, TICK_SPEED)


http.listen(PORT, function(){
  console.log('listening on *:' + PORT);
});
