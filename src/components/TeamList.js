const React = require('react');

const _ = require('lodash')

const TeamList = React.createClass({
  propTypes: {
    value: React.PropTypes.array,
    onChange: React.PropTypes.func
  },

  onChange(idx, property, value) {
    const teams = this.props.value

    this.props.onChange(
      _.set(teams, [idx, property], value.target.value)
    )
  },

  onNewTeam() {
    const teams = this.props.value

    this.props.onChange([...teams, {
      name: ''
    }])
  },

  onDelete(idx) {
    const teams = this.props.value

    var newTeams = [
      ...teams.slice(0, idx),
      ...teams.slice(idx + 1)
    ]

    this.props.onChange(newTeams)
  },

  render() {
    const teams = this.props.value

    return (
      <div>
        <h3>Team List</h3>
        {_.map(teams, (team, teamIdx) => {
          return <div key={teamIdx} className='flex flex-align-center padding-top-1'>
              <input
                type='text'
                value={team.name}
                className='no-margin flex-1'
                onChange={this.onChange.bind(null, teamIdx, 'name')} />

            <a className='button margin-left-1' onClick={this.onDelete.bind(null, teamIdx)}>Delete</a>
          </div>
        })}

        <div className='margin-top-1'>
          <a className='button' onClick={this.onNewTeam}>Add more</a>
        </div>
      </div>
    )
  }
});

module.exports = TeamList;
