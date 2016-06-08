const React = require('react')

const TeamList = require('../components/TeamList')

var io = require('socket.io-client')
const socket = io(`http://${document.location.hostname}:4007`)

const Home = React.createClass({
  getInitialState () {
    return {
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
      window.scrollTo(0, 0);
      this.props.history.push(`/admin/${res.key}?token=${res.token}`)
    })
  },

  render () {
    const {pitchTime, qaTime, teams, eventName} = this.state

    return (
      <div className='swtimer padding-1'>
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

        <div className='padding-2 flex flex-align-center'>
          <div className='padding-right-1'>
            Event name
          </div>
          <input
            type='text'
            placeholder="Don't forget to name your event!"
            value={eventName}
            className='no-margin flex-1' onChange={(evt) => {
              this.setState({
                eventName: evt.target.value
              })
            }}/>

          <a className={`button -primary margin-left-1 ${eventName.length ? '' : '-disabled'}`} onClick={this.onCreate}>
            Create!
          </a>
        </div>
      </div>
    )
  }
})

module.exports = Home
