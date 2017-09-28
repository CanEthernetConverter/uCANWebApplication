import React from "react";
import Masonry from 'react-masonry-component';
import UCANDevicesOnNetwork from "./UCANDeviesOnNetwork.js"
import UCANItemTransmit from "./UCANItemTransmit.js"

export default class UCANItem extends React.Component {
  constructor (props) {
    super (props);

    this.data = this.props.value;
    
    this.state = {
      windowsStatus: false,
      uCANId: this.data.id.id,
      uCANSensorSpeed: this.data.data.speed,
      uCANSensorPositon: this.data.data.positon,
      uCANLineDir: this.data.data.dir,
      uCANLinePwmValue: this.data.data.pwm_value,
      uCANStepperNowStepping: this.data.data.nowStepping,
      uCANStepperStepCount: this.data.data.StepCount,
      uCANType: UCANDevicesOnNetwork.type_to_string(this.data.id.device_type),
      uCANTimestamp: this.data.timestamp,
      uCANStatus: UCANDevicesOnNetwork.calculate_status(this.data.id.whole)
    };

    this.allertStyle = {
      color: 'red'
    };

    setTimeout(() => this.setState({ windowsStatus: "CONNECTION LOST"}), 5000);
  }
 
  

  getTimeString(unix_timestamp)
  {
     var date = new Date(unix_timestamp * 1000);
     var hours = date.getHours();
     var minutes = "0" + date.getMinutes();
     var seconds = "0" + date.getSeconds();
     return  (hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2));
  }

  
  render(){
    return (
      <div className="container itemframeback">
        <div className="row itemheader">
          <div className="col-xs-6">
           {this.state.uCANType}  id:{this.state.uCANId}
          </div>
          
          <div className="col-xs-4">
            {this.getTimeString(this.state.uCANTimestamp)}
          </div>
          <div className="col-xs-2">
              {this.state.windowsStatus === 'CONNECTION LOST' ? <i style={this.allertStyle} className="pull-right glyphicon glyphicon-download-alt glyphicon-alert " /> : null  }
          </div>
        </div>
        <div className="row">
        <table className="table-striped" width="100%">
            <tbody>
                <tr><td>Speed </td><td>{this.state.uCANSensorSpeed}</td></tr>
                <tr><td>Position</td><td>{this.state.uCANSensorPositon}</td></tr>
                <tr><td>Status</td><td>{this.state.uCANStatus}</td></tr>
                {(typeof this.state.uCANLineDir === 'undefined') ?  <b/>
                  : <tr><td>Direction </td><td>{this.state.uCANLineDir}</td></tr> }
                {(typeof this.state.uCANLinePwmValue === 'undefined') ?  <b/>
                  : <tr><td>PWM Value </td><td>{this.state.uCANLinePwmValue}</td></tr> }
                {(typeof this.state.uCANStepperNowStepping === 'undefined') ?  <b/>
                  : <tr><td>Now Stepping </td><td>{this.state.uCANStepperNowStepping}</td></tr> }
                {(typeof this.state.uCANStepperStepCount === 'undefined') ?  <b/>
                  : <tr><td>Step Count </td><td>{this.state.uCANStepperStepCount}</td></tr> }
            </tbody>
          </table >
        </div>
        <div className="row">

        </div>
      </div>
    );
  }

}



