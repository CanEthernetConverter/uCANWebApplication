import { input } from 'react-bootstrap';
import React from 'react';
import CANFrameBuffer from './CANFrameBuffer';
import './css/CANToolbox.css';
import { CANFrame } from './CANFrame';


export default class CANTransmitContents extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      validID: true,
      validData: true,
      validInterval: true,
      inputID: '',
      inputData: '',
      inputInterval: '',
    };
  }

  transmitFrame() {
    if (this.state.isTransmitting === true) {
      this.setState({ isTransmitting: false });
      CANFrameBuffer.TrafficGenerator(false, 0, 0);
      return;
    }
    if ((this.state.inputID.charAt(0) === 'X') && this.state.validInterval && this.state.validID) {
      const con_id = this.state.inputID.split('X')[1];
      this.setState({ isTransmitting: true });
      CANFrameBuffer.TrafficGenerator(true, con_id, this.state.inputInterval);

      return;
    }
    if (this.state.validInterval && this.state.validData && this.state.validID) {
     // console.log('Transmit');
     // console.log(`${this.state.inputID} ${this.state.inputData} ${this.state.inputInterval}`);
      const extendId = this.state.inputID.split('E')[1];
      const rtrData = this.state.inputData.split('R')[1];
      let id = this.state.inputID;

      let data = this.state.inputData;
      let type = 'S';
            // console.log(extendId);
      if (extendId !== undefined) {
        id = extendId;
        type = 'E';
      }
      if (rtrData !== undefined) {
        data = rtrData;
      }
      const tmpCanFrame = new CANFrame(new Date().getTime(), 0, id, type, data, Math.ceil(data.length / 2));
            // tmpCanFrame.toSLCANString();
      CANFrameBuffer.SendFrame(tmpCanFrame);
    }
  }
  setTransmitDisable() {
    if (this.state.isTransmitting) { return false; }
    if (!(this.state.validInterval && this.state.validData && this.state.validID)) { return true; }
    return false;
  }
  setTransmitClass() {
    if (this.state.isTransmitting) {
      return 'glyphicon glyphicon glyphicon-stop glyphicon-rxstop pull-right';
    }
    let tmpclass = 'glyphicon glyphicon glyphicon-log-in glyphicon-transmit pull-right ';
    if (this.state.validInterval && this.state.validData && this.state.validID) {
      tmpclass += ' btn-disabled';
    }
    return tmpclass;
  }
  render() {
    return (<div>
      <div className="row">
        <div className="col-xs-12">
          <input
            type="text"
            className="form-control"
            placeholder="ID in HEX, 'E' for Extended"
            onChange={(value) => {
              this.setState({ validID: /^(?:(E|X))?([0-9a-fA-F]){0,8}$/.test(value.target.value) });
              this.setState({ inputID: value.target.value });
            }}
          />
        </div>
      </div>
      {this.state.validID ? null : (<span className="invalid">Incorrect ID value</span>)}
      <div className="row">
        <div className="col-xs-12">
          <input
            type="text"
            className="form-control"
            placeholder="Data in HEX, 'R' for Retransmition"
            onChange={(value) => {
              this.setState({ validData: /^(?:R)?([0-9a-fA-F]){0,16}$/.test(value.target.value) });
              this.setState({ inputData: value.target.value });
            }}
          />
        </div>
      </div>
      {this.state.validData ? null : (<span className="invalid">Incorrect data value</span>)}
      <div className="row">
        <div className="col-xs-10"><input
          type="text"
          className="form-control pull-left"
          placeholder="Interval in ms"
          onChange={(value) => {
            this.setState({ validInterval: /^([0-9])+$/.test(value.target.value) });
            this.setState({ inputInterval: value.target.value });
          }}
        />
        </div>
        <div className="col-xs-2"><button
          onClick={this.transmitFrame.bind(this)}
          className={this.setTransmitClass()}
          disabled={this.setTransmitDisable()}
        />
        </div>
      </div>
      {this.state.validInterval ? null : (<span className="invalid">Incorrect interval</span>)}
    </div>
    );
  }
}
