const React = require('react')
const io = require('socket.io-client')
const _ = require('lodash')

const socket = io(`http://${document.location.hostname}:4007`)

const Timer = require('../components/Timer')
const TeamListDisplay = require('../components/TeamListDisplay')

const Event = React.createClass({
  propTypes: {
    history: React.PropTypes.object
  },

  getInitialState () {
    return {
      event: null
    }
  },

  componentDidMount () {
    const eventId = _.get(this.props, ['params', 'id'])

    socket.emit('REQUEST_EVENT', eventId, (err, res) => {
      if (err) {
        this.props.history.push('/')
      }

      this.setState({
        event: res
      })
    })

    socket.on('EVENT_UPDATE', updatedEvent => {
      if (eventId !== updatedEvent.eventName) return

      this.setState({
        event: updatedEvent
      })
    })
  },

  componentWillUnmount () {
    socket.removeAllListeners('EVENT_UPDATE')
  },

  render () {
    const {event} = this.state

    if (!event) {
      return <div className='swtimer padding-1'>
        ...Loading
      </div>
    }

    return (
      <div className='swtimer padding-1'>
        <div className='flex'>
          <div className='flex-1 padding-1'>
            <Timer value={event} />
          </div>

          <div className='padding-1 sidebar'>
            <h3>Team List</h3>
            <TeamListDisplay value={event} />
          </div>
        </div>
      </div>
    )
  }
})

module.exports = Event
