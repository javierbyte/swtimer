const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io('http://localhost:4007')

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
        window.alert('Looks like you got the wrong link...')
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

    return (
      <div className='swtimer padding-1'>
        <div className='padding-1 txt-center'>
          <h3>{event.eventName}</h3>
          <div className='capital-text'>Pitch time</div>
        </div>

        <div className='flex'>
          <div className='padding-1 flex-1'>
            {_.map(event.teams, (team, teamIdx) => {
              return <div key={teamIdx}>
                {team.name}
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
