const React = require('react')

var DoughnutChart = require('react-chartjs').Doughnut;

const Timer = React.createClass({
  propTypes: {
    value: React.PropTypes.object
  },

  render() {
    const event = this.props.value
    const {status} = event

    const {remainingTime, phase} = status
    const totalTime = phase === 'PITCH' ? event.pitchTime * 1000 : event.qaTime * 1000

    const activeTeamIdx = event.status.active
    const activeTeam = event.teams[activeTeamIdx]
    const activeTeamName = activeTeam ? activeTeam.name : 'DONE!'

    var chartData = [{
      value: totalTime - remainingTime,
      color:'#ECF0F1'
    }, {
      value: remainingTime,
      color: '#27AE60'
    }]

    var chartDataQA = [
      chartData[0],
      _.assign({}, chartData[1], {color: '#F39C12'})
    ]

    var chartOptions = {
      percentageInnerCutout: 90,
      animateRotate: false,
      segmentShowStroke : false,
      animationEasing: 'easeInOutQuart',
      animationSteps: 12,
      responsive: true,
      showTooltips: false
    }

    return <div className='timer'>
      <div className='padding-bottom-1'>
        {activeTeam ? <div className='capital-text'>Active team - {phase}</div> : <div className='capital-text'>-</div>}
        <h3>{activeTeamName}</h3>
      </div>

      <div className='chart'>
        <DoughnutChart
          key={phase + activeTeamName}
          data={phase === 'PITCH' ? chartData : chartDataQA}
          options={chartOptions} />

        {activeTeam ? (
          <div className='chart-content'>
            <div className='chart-content-title'>
              {remainingTime > 60000 ? Math.floor(remainingTime / 60000) + 'm ' : ''}
              {Math.floor((remainingTime % 60000) / 1000) + 's'}
            </div>
            <div>
              {phase}
            </div>
          </div>
        ) : (
          <div className='chart-content'>
            <div className='chart-content-title'>
              -
            </div>
          </div>
        )}
      </div>

    </div>
  }
});

module.exports = Timer;
