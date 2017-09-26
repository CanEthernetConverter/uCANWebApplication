  import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import './css/creative.css'
import './css/itemframe.css'  
import 'fixed-data-table/dist/fixed-data-table.css'
import ItemBoard from './uCAN_Network/ItemBoard'
import Header from './Header'
import CANApplication from './components/CAN/CANApplication'
class App extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      toolsSelect: 'CANApplication',
    };
  }

  changeDisplay(selectedKey){
     switch (selectedKey)
     {
       case 1:
        this.setState({ toolsSelect: 'CANApplication' });
        break;
       case 2:
        this.setState({ toolsSelect: 'uCANTools' });
        break;
     }
    //  alert('selected ' + selectedKey);
  }

  displayTool()
  {
    switch (this.state.toolsSelect)
    {
      case  'CANApplication' : 
        return <CANApplication/>;
      case 'uCANTools':
        return <ItemBoard/>;
    }
  }
  
  render() {
    return (
	<div>
	    <Header itemSelectCallback={this.changeDisplay.bind(this)}/>
	    {this.displayTool()}
	</div>
    );
  }

  
}

export default App;
