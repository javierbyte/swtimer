const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io('http://localhost:4007')

const Timer = require('../components/Timer')

const Event = React.createClass({
  getInitialState() {
    return {
      event: null
    }
  },

  componentDidMount() {
    const eventId = _.get(this.props, ['params', 'id'])

    socket.emit('REQUEST_EVENT', eventId, (err, res) => {
      console.warn('\nREQUEST_EVENT', res)
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

  render() {
    const {event} = this.state

    if (!event) {
      return <div className='swtimer padding-1'>
        ...Loading
      </div>
    }

    const activeTeamIdx = event.status.active
    const activeTeam = event.teams[activeTeamIdx]

    return (
      <div className='swtimer padding-1'>
        <div className='padding-1 txt-center'>
          <h3>{event.eventName}</h3>
          <div className='capital-text'>Pitch time</div>
        </div>

        <div>
          <Timer value={event} />
        </div>

        <div className='flex'>
          <div className='padding-1 flex-1'>
            {_.map(event.teams, (team, teamIdx) => {
              const isActive = teamIdx === activeTeamIdx

              return <div key={teamIdx} className={`team-element ${isActive ? '-active' : ''}`}>
                {team.name} {isActive && `(${event.status.phase})`}
              </div>
            })}
          </div>

          <div className='sidebar padding-1'>
            tehehe
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Event;
