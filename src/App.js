const React = require('react')

require('!style!raw!less!../styles/main.less')

const App = React.createClass({
  childContextTypes: {
    contextState: React.PropTypes.object,
    updateContextState: React.PropTypes.func
  },

  getInitialState () {
    return {}
  },

  getChildContext () {
    return {
      contextState: this.state,
      updateContextState: this.updateContextState
    }
  },

  updateContextState (newState, callback) {
    console.warn('\nCONTEXT UPDATE', newState)
    this.setState(newState, callback)
  },

  render () {
    return <div>
      <div className='header flex padding-1 padding-left-2 padding-right-2'>
        <img src='http://flywheelcoworking.com/wp-content/uploads/2016/03/startup-weekend-logo.png' className='logo'/>
      </div>
      {this.props.children}
      <div className='footer padding-2'>
        <a href='http://javier.xyz/'>by javierbyte</a>
      </div>
    </div>
  }
})

module.exports = App
