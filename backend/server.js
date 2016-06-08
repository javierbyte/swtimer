var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var slug = require('slug')

var _ = require('lodash')

var STORE = {}

var TICK_SPEED = 334

var PORT = process.env.PORT || 4007

io.on('connection', function (socket) {
  socket.on('REQUEST_EVENT', function (eventName, callback) {
    console.log('\nREQUEST_EVENT', eventName, 'EVENT_ROOM_' + eventName)

    socket.join('EVENT_ROOM_' + eventName)

    if (STORE[eventName]) {
      callback(null, STORE[eventName])
    } else {
      console.log('\nERR NO SUCH EVENT', {
        req: {
          eventName
        },
        STORE
      })
      callback({ERR: 'No such event'}, null)
    }
  })

  socket.on('POST_EVENT', function (eventData, callback) {
    console.log('\nPOST_EVENT', eventData.eventName)

    var eventName = slug(eventData.eventName)
    while (STORE[eventName]) {
      eventName = slug(eventName + '-1')
    }
    eventData.eventName = eventName

    eventData.teams = _.filter(eventData.teams, team => {
      return team.name.length
    })

    var token = '' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) + '' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    STORE[eventName] = _.assign({}, eventData, {
      pitchTime: parseInt(eventData.pitchTime * 60 * 1000, 10) || 5 * 60 * 1000,
      qaTime: parseInt(eventData.qaTime * 60 * 1000, 10) || 3 * 60 * 1000,
      status: {
        active: 0,
        phase: 'PITCH',
        remainingTime: parseInt(eventData.pitchTime * 60 * 1000, 10) || 5 * 60 * 1000,
        running: false
      },
      _token: token
    })

    callback(null, {
      key: eventName,
      token: token
    })
  })

  socket.on('UPDATE_EVENT', function (eventData, callback) {
    console.log('\nUPDATE_EVENT', eventData)

    if (!STORE[eventData.eventName] || ('' + STORE[eventData.eventName]._token !== '' + eventData.token)) {
      console.log('\nINVALID TOKEN')
      return
    }

    _.merge(STORE, {
      [eventData.eventName]: eventData.data
    })

    dispatchEventUpdate(eventData.eventName)
  })
})

function dispatchEventUpdate (eventName) {
  console.warn('\nDISPATCHING', eventName)
  io.to('EVENT_ROOM_' + eventName).volatile.emit('EVENT_UPDATE', _.omit(STORE[eventName], '_token'))
}

setInterval(function () {
  _.forEach(STORE, event => {
    var eventStatus = event.status

    if (eventStatus.running === true) {
      // the event is running!

      eventStatus.remainingTime = eventStatus.remainingTime - TICK_SPEED

      if (eventStatus.remainingTime < 0) {
        // we finished a phase!

        if (eventStatus.phase === 'PITCH') {
          // we finished PITCH!
          eventStatus.remainingTime = event.qaTime
          eventStatus.phase = 'QA'
        } else {
          // we finish WA
          eventStatus.remainingTime = event.pitchTime
          eventStatus.phase = 'PITCH'
          eventStatus.active += 1
        }

        if (eventStatus.active >= event.teams.length) {
          // we finallized!
          eventStatus.active = -1
          eventStatus.running = false
        }
      }
      dispatchEventUpdate(event.eventName)
    }
  })
}, TICK_SPEED)

http.listen(PORT, function () {
  console.log('listening on *:' + PORT)
})
