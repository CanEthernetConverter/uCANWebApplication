import 'react-virtualized/styles.css'; // only needs to be imported once
import React from 'react';
import './css/CANLogger.css';
import CANLogger from './CANLogger';
import CANToolbox from './CANToolbox';
import CANFrameBuffer from './CANFrameBuffer';

export default class CANApplication extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isConnected: CANFrameBuffer.isConnected,
    };
    CANFrameBuffer.connectionCallback = this.onConnection.bind(this);
  }

  onConnection(connected) {
    this.setState({ isConnected: connected });
  }

  componentDidMount()
  {
    console.log('CANApplication mount');
    CANFrameBuffer.RawCANData = true;
  }

  // 

    // -------------- render ----------------------------
  render() {
    return (<div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs-12">
            <CANToolbox />
            {this.state.isConnected ?
              <CANLogger /> :
              <div className="statusinfo col-xs-9"><h2>CONNECTION LOST</h2></div> }
          </div>
        </div>
      </div>
    </div>);
  }

}

