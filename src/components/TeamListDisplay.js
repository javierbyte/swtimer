const React = require('react');

const _ = require('lodash')

const TeamListDisplay = React.createClass({
  propTypes: {
    value: React.PropTypes.object
  },

  render() {
    const event = this.props.value

    const activeTeamIdx = event.status.active
    const activeTeam = event.teams[activeTeamIdx] || {}

    return (
      <div>
        {_.map(event.teams, (team, teamIdx) => {
          const isActive = teamIdx === activeTeamIdx

          return <div key={teamIdx} className={`team-element ${isActive ? '-active' : ''}`}>
            {isActive && <i className='fa fa-play' />} {team.name} {isActive && `(${event.status.phase})`}
          </div>
        })}
      </div>
    )
  }
});

module.exports = TeamListDisplay;
