import React, { Component } from 'react';
import Tooltip from './components/Tooltip';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Tooltip content="what">
          {({ref}) => <div ref={ref}>HELLO</div>}
          </Tooltip>
        </header>
      </div>
    );
  }
}

export default App;
