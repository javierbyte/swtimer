const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io(`http://${document.location.hostname}:4007`)

const Timer = require('../components/Timer')
const TeamListDisplay = require('../components/TeamListDisplay')

const Admin = React.createClass({
  getInitialState () {
    return {
      event: null
    }
  },

  componentDidMount () {
    const eventId = _.get(this.props, ['params', 'id'])

    socket.emit('REQUEST_EVENT', eventId, (err, res) => {
      console.warn('\nREQUEST_EVENT', {err, res})
      if (err) {
        this.props.history.push('/')
      }

      this.setState({
        event: res
      })
    })

    socket.on('EVENT_UPDATE', updatedEvent => {
      this.setState({
        event: updatedEvent
      })
    })
  },

  componentWillUnmount () {
    socket.removeAllListeners('EVENT_UPDATE')
  },

  onStart () {
    this._sendUpdate({
      status: {
        running: true
      }
    })
  },

  onReturnHandle () {
    const {event} = this.state

    if (event.status.remainingTime % 1000 === 0) {
      this.onReturn()
    } else {
      this.onRestart()
    }
  },

  onRestart () {
    const {event} = this.state

    this._sendUpdate({
      status: {
        remainingTime: event.status.phase === 'PITCH' ? event.pitchTime : event.qaTime,
        running: false
      }
    })
  },

  onReturn () {
    const {event} = this.state
    var phase = event.status.phase

    if (event.status.active <= -1) {
      // we have finished! let's return!
      this._sendUpdate({
        status: {
          remainingTime: event.qaTime,
          running: false,
          phase: 'QA',
          active: event.teams.length - 1
        }
      })
      return
    }

    if (phase === 'QA') {
      // we are in QA, lets return to pitch
      phase = 'PITCH'
      this._sendUpdate({
        status: {
          remainingTime: event.pitchTime,
          running: false,
          phase: phase
        }
      })
    } else {
      // we are in PITCH, let's return to the QA of the previous team
      phase = 'QA'
      this._sendUpdate({
        status: {
          remainingTime: event.qaTime,
          running: false,
          phase: phase,
          active: event.status.active - 1
        }
      })
    }
  },

  onPause () {
    this._sendUpdate({
      status: {
        running: false
      }
    })
  },

  onPostpone () {
    const {event} = this.state
    const activeTeamIdx = event.status.active

    const activeArray = event.teams.splice(activeTeamIdx, 1)

    this._sendUpdate({
      teams: [
        ...event.teams,
        ...activeArray
      ],
      status: {
        remainingTime: event.pitchTime,
        running: false,
        phase: 'PITCH'
      }
    })
  },

  _sendUpdate (data) {
    const eventName = _.get(this.props, ['params', 'id'])
    const token = _.get(this.props, ['location', 'query', 'token'])

    socket.emit('UPDATE_EVENT', {
      eventName: eventName,
      token: token,
      data: data
    })
  },

  render () {
    const {event} = this.state

    if (!event) {
      return <div className='swtimer padding-1'>
        ...Loading
      </div>
    }

    const activeTeamIdx = Math.max(event.status.active, -1)

    const publicUrl = document.URL.replace('admin', 'event').split('?token')[0]

    const canReturn = activeTeamIdx !== 0 || event.status.phase !== 'PITCH'

    return (
      <div className='swtimer'>
        <div className='flex'>
          <div className='padding-1 flex-1'>
            <Timer value={event} />
          </div>

          <div className='sidebar padding-1'>
            <h3>Team List</h3>
            <TeamListDisplay value={event} />
          </div>
        </div>

        <div className='padding-1 txt-center padding-top-3'>
          {event.status.running ? (
            <a className={`button -grayed ${activeTeamIdx === -1 ? '-disabled' : ''}`} onClick={this.onPause}>
              <i className='fa fa-pause' />
              Pause
            </a>
          ) : (
            <a className={`button -primary ${activeTeamIdx === -1 ? '-disabled' : ''}`} onClick={this.onStart}>
              <i className='fa fa-play' />
              Start
            </a>
          )}
          {' '}
          <a className={`button -grayed ${canReturn ? '' : '-disabled'}`} onClick={this.onReturnHandle}>
            <i className='fa fa-undo' />
            Return phase
          </a>
          {' '}
          <a className={`button -grayed ${activeTeamIdx === -1 ? '-disabled' : ''}`} onClick={this.onPostpone}>
            <i className='fa fa-arrow-down' />
            Postpone team
          </a>
        </div>

        <div className='padding-1 flex share'>
          <div className='flex-1 padding-1'>
            <div className='capital-text'>
              Share the <b>PUBLIC</b> Url, <a href={publicUrl} target='_blank'>[open]</a>
            </div>
            <input type='text' value={publicUrl} disabled />
          </div>

          <div className='flex-1 padding-1'>
            <div className='capital-text'>
              Share the <b>ADMIN</b> Url (Be careful!)
            </div>
            <input type='text' value={document.URL} disabled />
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Admin
