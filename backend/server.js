const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const slug = require('slug')

const _ = require('lodash')

const TICK_SPEED = 334
const EXPIRE_TIME = 60 * 60 * 1000

const PORT = process.env.PORT || 4007

var STORE = {}

io.on('connection', function (socket) {
  socket.on('REQUEST_EVENT', function (eventName, callback) {
    console.log('\nREQUEST_EVENT', eventName, 'EVENT_ROOM_' + eventName)

    socket.join('EVENT_ROOM_' + eventName)

    if (STORE[eventName]) {
      callback && callback(null, STORE[eventName])
    } else {
      console.log('\nERR NO SUCH EVENT', {
        req: {
          eventName
        },
        STORE
      })
      callback && callback({ERR: 'No such event'}, null)
    }
  })

  socket.on('REQUEST_EVENT_LIST', function (callback) {
    console.log('\nREQUEST_EVENT_LIST')

    callback(null, getEventList())
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

    var token = '' + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

    STORE[eventName] = _.assign({}, eventData, {
      pitchTime: parseInt(eventData.pitchTime * 60 * 1000, 10) || 5 * 60 * 1000,
      qaTime: parseInt(eventData.qaTime * 60 * 1000, 10) || 3 * 60 * 1000,
      status: {
        active: 0,
        phase: 'PITCH',
        remainingTime: parseInt(eventData.pitchTime * 60 * 1000, 10) || 5 * 60 * 1000,
        running: false
      },
      _token: token,
      _updatedAt: new Date().getTime()
    })

    dispatchEventListUpdate()

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
      [eventData.eventName]: _.merge(eventData.data, {_updatedAt: new Date().getTime()})
    })

    if (_.has(eventData, ['status', 'running'])) {
      dispatchEventListUpdate()
    }

    dispatchEventUpdate(eventData.eventName)
  })
})

function dispatchEventUpdate (eventName, force) {
  if (force) {
    io.to('EVENT_ROOM_' + eventName).emit('EVENT_UPDATE', _.omit(STORE[eventName], '_token'))
  } else {
    io.to('EVENT_ROOM_' + eventName).volatile.emit('EVENT_UPDATE', _.omit(STORE[eventName], '_token'))
  }
}

function dispatchEventListUpdate () {
  console.log('\nEVENT_LIST_UPDATE')
  io.volatile.emit('EVENT_LIST_UPDATE', getEventList())
}

function getEventList () {
  return _(STORE).filter(event => {
    if (event.status.running) {
      return true
    }
    if (event.status.active < event.teams.length && event.status.active !== -1) {
      return true
    }
    if (event.status.remainingTime > 0) {
      return true
    }

    return false
  }).map(event => {
    return {
      eventName: event.eventName,
      status: {
        running: event.status.running
      }
    }
  }).sortBy(event => {
    return !event.status.running
  }).value()
}

setInterval(function () {
  _.forEach(STORE, (event, eventIdx) => {
    var force = false
    if (new Date().getTime() - event._updatedAt > EXPIRE_TIME) {
      console.log('\nEVENT EXPIRED', eventIdx)
      delete STORE[eventIdx]
      dispatchEventListUpdate()
      return
    }

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
          dispatchEventListUpdate()

          // force the socket message
          force = true
        }
      }
      dispatchEventUpdate(event.eventName, force)
    }
  })
}, TICK_SPEED)

http.listen(PORT, function () {
  console.log('listening on *:' + PORT)
})
