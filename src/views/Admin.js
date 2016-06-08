const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io(`http://${document.location.hostname}:4007`)

const Timer = require('../components/Timer')

const Admin = React.createClass({
  getInitialState() {
    return {
      event: null
    }
  },

  componentDidMount() {
    const eventId = _.get(this.props, ['params', 'id'])

    socket.emit('REQUEST_EVENT', eventId, (err, res) => {
      console.warn('\nREQUEST_EVENT', {err, res})
      if (err) {
        this.props.history.push('/');
      }

      this.setState({
        event: res
      })
    })

    socket.on('EVENT_UPDATE', updatedEvent => {
      console.warn('\nEVENT_UPDATE', updatedEvent)

      this.setState({
        event: updatedEvent
      })
    })
  },

  componentWillUnmount() {
    socket.removeAllListeners('EVENT_UPDATE')
  },

  onStart() {
    this._sendUpdate({
      status: {
        running: true
      }
    })
  },

  onRestart() {
    const {event} = this.state

    this._sendUpdate({
      status: {
        remainingTime: event.status.phase === 'PITCH' ? event.pitchTime * 1000 : event.qaTime * 1000,
        running: false
      }
    })
  },

  onPause() {
    this._sendUpdate({
      status: {
        running: false
      }
    })
  },

  _sendUpdate(data) {
    const eventName = _.get(this.props, ['params', 'id'])
    const token = _.get(this.props, ['location', 'query', 'token'])

    socket.emit('UPDATE_EVENT', {
      eventName: eventName,
      token: token,
      data: data
    })
  },

  render() {
    const {event} = this.state

    if (!event) {
      return <div className='swtimer padding-1'>
        ...Loading
      </div>
    }

    const activeTeamIdx = event.status.active
    const activeTeam = event.teams[activeTeamIdx] || {}

    const publicUrl = document.URL.replace('admin', 'event').split('?token')[0]

    return (
      <div className='swtimer padding-1'>
        <div className='padding-1 txt-center'>
          <h3>{event.eventName}</h3>
          <div className='capital-text'>Pitch time</div>
        </div>

        <div className='flex'>
          <div className='padding-1 flex-1 team-list'>
            <div className='padding-1'>
              <Timer value={event} />
            </div>

            <div className='padding-1'>
              {event.status.running ? (
                <a className='button -primary' onClick={this.onPause}>Pause</a>
              ) : (
                <a className='button -primary' onClick={this.onStart}>Start</a>
              )}
              {' '}
              <a className='button -primary' onClick={this.onRestart}>Restart this phase</a>
            </div>

            {_.map(event.teams, (team, teamIdx) => {
              return <div key={teamIdx} className={`team-element ${teamIdx === activeTeamIdx ? '-active' : ''}`}>
                {team.name}
              </div>
            })}
          </div>

          <div className='sidebar padding-1'>
            <div className='capital-text'>
              Share the <b>PUBLIC</b> Url, <a href={publicUrl} target='_blank'>[open]</a>
            </div>
            <input type='text' value={publicUrl} disabled />

            <div className='capital-text'>
              Share the <b>ADMIN</b> Url (Be careful!)
            </div>
            <input type='text' value={document.URL} disabled />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Admin;
