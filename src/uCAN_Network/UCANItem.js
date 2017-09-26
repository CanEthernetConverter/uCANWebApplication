import React from "react";
import Masonry from 'react-masonry-component';
import UCANDevicesOnNetwork from "./UCANDeviesOnNetwork.js"
import UCANItemTransmit from "./UCANItemTransmit.js"

export default class UCANItem extends React.Component {
  constructor (props) {
    super (props);

    this.data = this.props.item;

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
      uCANStatus: UCANDevicesOnNetwork.calculate_status(this.data.id.whole)
    };
  }
 
  toogleStatus(status) {
    if (this.state.windowsStatus !== status) { this.setState({ windowsStatus: status }); } else { this.setState({ windowsStatus: false }); }
  }

  render(){
    return (
      <div className="container itemframeback">
        <div className="row itemheader">
          <div className="col-xs-6">
           {this.state.uCANType}  id:{this.state.uCANId}
          </div>
          <div className="col-xs-2">

          </div>
          <div className="col-xs-4">
            {/* <button
              className="glyphicon glyphicon-cog pull-right"
              onClick={this.toogleStatus.bind(this, 'TRANSMIT')}
            /> */}
          </div>
        </div>
        <div className="row">
        {this.state.windowsStatus === 'TRANSMIT' ? <UCANItemTransmit /> : null }
        <table className="table-striped" width="100%">
            <tbody>
                <tr><th>Data</th><th>Value</th></tr>
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



