const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io('http://localhost:4007')

const Admin = React.createClass({
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

        <div className='padding-1'>
          <b>Active team</b>
          <h3>{activeTeam.name}</h3>
        </div>

        <div className='padding-1'>
          <a className='button -primary'>Start</a>
          {' '}
          <a className='button'>Pause</a>
          {' '}
          <a className='button'>Send to the bottom</a>
        </div>

        <div className='flex'>
          <div className='padding-1 flex-1 team-list'>
            {_.map(event.teams, (team, teamIdx) => {
              return <div key={teamIdx} className={`team-element ${teamIdx === activeTeamIdx ? '-active' : ''}`}>
                {team.name}
              </div>
            })}
          </div>

          <div className='sidebar padding-1'>
            <div className='capital-text'>
              Share the <b>PUBLIC</b> Url
            </div>
            <input type='text' value={document.URL.replace('admin', 'event').split('?token')[0]} disabled />

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
