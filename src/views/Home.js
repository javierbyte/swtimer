const React = require('react')

const TeamList = require('../components/TeamList')

var io = require('socket.io-client')
var socket = io('http://localhost:4007')

const Home = React.createClass({
  getInitialState() {
    return {
      pitchTime: 360,
      qaTime: 180,
      eventName: '3',
      teams: [{
        name: 'EBC'
      }, {
        name: 'Skycatch'
      }, {
        name: 'H/F'
      }, {
        name: 'SW Registro'
      }, {
        name: 'Piggo'
      }, {
        name: 'GBM'
      }]
    }
  },

  onChangeTeams(newTeams) {
    this.setState({
      teams: newTeams
    })
  },

  onCreate() {
    console.warn('\nCREATING EVENT', this.state);
    socket.emit('POST_EVENT', this.state, (err, res) => {
      this.props.history.push(`/admin/${res.key}?token=${res.token}`);
    })
  },

  render() {
    const {pitchTime, qaTime, teams, eventName} = this.state

    return (
      <div className='swtimer padding-1'>
        <div className='padding-1 txt-center'>
          <h1>Home</h1>
        </div>

        <div className='flex'>
          <div className='padding-1 flex-1'>
            <TeamList value={teams} onChange={this.onChangeTeams} />
          </div>

          <div className='sidebar padding-1'>
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

        <div className='padding-1 flex flex-align-center'>
          <div className='padding-right-1'>
            Event name
          </div>
          <input
            type='text'
            value={eventName}
            className='no-margin flex-1' onChange={(evt) => {
              this.setState({
                eventName: evt.target.value
              })
            }}/>

          <a className='button -primary margin-left-1' onClick={this.onCreate}>
            Create!
          </a>
        </div>
      </div>
    );
  }
});

module.exports = Home;
