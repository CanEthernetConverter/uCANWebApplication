import { input, FormControl, ControlLabel } from 'react-bootstrap';
import React from 'react';
// import CANFrameBuffer from './CANFrameBuffer';

export default class UCANItemTransmit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  transmitFrame() {
    console.log("PPPRRRR");
  }

  render() {
    return (<div>
      <div className="row">
        <div className="col-xs-12">
          <input
            type="text"
            className="form-control"
            placeholder="Steps"
            onChange={(value) => {
              this.setState({ validID: /^(?:(E|X))?([0-9]){0,8}$/.test(value.target.value) });
              this.setState({ inputID: value.target.value });
            }}
          />
        </div>
      </div>
      {this.state.validID ? null : (<span className="invalid">Incorrect step count</span>)}
      <div className="row">
        <div className="col-xs-10">    
        <FormControl componentClass="select" placeholder="select">
          <option value="Clockwise">Clockwise</option>
          <option value="AntiClockwise">AntiClockwise</option>
        </FormControl>
        </div>
        <div className="col-xs-2">
        <button className="glyphicon glyphicon glyphicon-play pull-right"
          onClick={this.transmitFrame.bind(this)}
        />
        </div>
      </div>
    </div>
    );
  }
}
