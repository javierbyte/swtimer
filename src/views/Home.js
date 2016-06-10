const React = require('react')
const _ = require('lodash')
const io = require('socket.io-client')

const {Link} = require('react-router')

const socket = io(`http://${document.location.hostname}:4007`)

const TeamList = require('../components/TeamList')

const Home = React.createClass({
  propTypes: {
    history: React.PropTypes.object
  },

  getInitialState () {
    return {
      eventList: [],

      pitchTime: 5,
      qaTime: 3,
      eventName: 'Startupweekend',
      teams: [{
        name: 'EBC'
      }, {
        name: 'Skycatch'
      }, {
        name: 'H/F'
      }, {
        name: 'Piggo'
      }, {
        name: 'GBM'
      }]
    }
  },

  componentDidMount () {
    socket.emit('REQUEST_EVENT_LIST', (err, res) => {
      if (err) return console.error(err)
      this.setState({
        eventList: res
      })
    })

    socket.on('EVENT_LIST_UPDATE', eventList => {
      this.setState({
        eventList: eventList
      })
    })
  },

  onChangeTeams (newTeams) {
    this.setState({
      teams: newTeams
    })
  },

  onCreate () {
    console.warn('\nPOST_EVENT', this.state)
    socket.emit('POST_EVENT', this.state, (err, res) => {
      if (err) {
        return console.error(err)
      }
      window.scrollTo(0, 0)
      this.props.history.push(`/admin/${res.key}?token=${res.token}`)
    })
  },

  componentWillUnmount () {
    socket.removeAllListeners('EVENT_LIST_UPDATE')
  },

  render () {
    const {pitchTime, qaTime, teams, eventName, eventList} = this.state

    return (
      <div className='swtimer padding-1'>
        <div className='padding-2 flex flex-align-center'>
          <h4 className='padding-right-1 no-margin'>
            Event name
          </h4>
          <input
            type='text'
            placeholder="Don't forget to name your event!"
            value={eventName}
            className='no-margin flex-1' onChange={(evt) => {
              this.setState({
                eventName: evt.target.value
              })
            }}/>
        </div>

        <div className='flex'>
          <div className='padding-2 flex-1'>
            <TeamList value={teams} onChange={this.onChangeTeams} />
          </div>

          <div className='sidebar padding-2'>
            <h4 className='padding-bottom-1'>Event Config</h4>

            <div className='capital-text'>
              Pitch time (in minutes)
            </div>
            <input type='text' value={pitchTime} onChange={(evt) => {
              this.setState({
                pitchTime: evt.target.value
              })
            }} />

            <div className='capital-text'>
              QA time (in minutes)
            </div>
            <input type='text' value={qaTime} onChange={(evt) => {
              this.setState({
                qaTime: evt.target.value
              })
            }} />
          </div>
        </div>

        <div className='padding-bottom-2 padding-left-2 padding-right-2 flex flex-justify-center'>
          <a className={`button -primary -big margin-left-1 ${eventName.length ? '' : '-disabled'}`} onClick={this.onCreate}>
            Create event!
          </a>
        </div>

        <div className='event-list txt-center'>
          {eventList.length !== 0 && <div><b>Active events: </b></div>}
          {_.map(eventList, event => {
            return <Link to={`/event/${event.eventName}`} key={event.eventName}>
              {event.status.running ? <i className='fa fa-play' /> : <i className='fa fa-pause' />}
              {event.eventName}
            </Link>
          })}
        </div>
      </div>
    )
  }
})

module.exports = Home
