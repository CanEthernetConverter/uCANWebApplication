import React from 'react';
import './css/CANToolbox.css';
import CANFrameBuffer from './CANFrameBuffer';
import CANTransmitContents from './CANTransmitContents';
import CANConfig from './CANConfig';
import CANDownloadLogs from './CANDownloadLogs';

export default class CANToolbox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      windowsStatus: false,
      isReciving: true,
      isTransmitting: false,
    };

    CANFrameBuffer.InitReception();
    CANFrameBuffer.SetReception(this.state.isReciving);
    CANFrameBuffer.SetReceptionCallback = this.onSetReception.bind(this);
  }

  onSetReception(flag) {
    this.setState({ isReciving: flag });
  }


  toogleStatus(status) {
    if (this.state.windowsStatus !== status) { this.setState({ windowsStatus: status }); } else { this.setState({ windowsStatus: false }); }
  }
    // <div className="col-xs-3 pull-right">  </div>
    // -------------- render ----------------------------
  render() {
    return (<div className={this.state.windowsStatus ? 'transmitsidebar ' : 'transmitsidebar minimize'}>
      <div className="container-fluid">
        <div className="row">
          {this.state.windowsStatus ? <div className="col-xs-4"><h4>{this.state.windowsStatus}</h4></div> : null }

          <div className={this.state.windowsStatus ? 'col-xs-8 pull-right toolbar' : 'col-xs-12 pull-right toolbar'}>
            <button
              className="glyphicon glyphicon-cog pull-right glyphicon-transmit"
              onClick={this.toogleStatus.bind(this, 'CONFIG')}
            />
            <button
              className="glyphicon glyphicon-log-in pull-right glyphicon-transmit"
              onClick={this.toogleStatus.bind(this, 'TRANSMIT')}
            />
            <button
              className="glyphicon glyphicon-download-alt pull-right glyphicon-transmit"
              onClick={this.toogleStatus.bind(this, 'DOWNLOAD')}
            />
            <button
              className={this.state.isReciving ? 'glyphicon-stop glyphicon pull-right glyphicon-rxstop' : 'glyphicon-play blink glyphicon pull-right glyphicon-rxstart'}
              onClick={() => { CANFrameBuffer.SetReception(!this.state.isReciving); }}
            />
            <button
              className="glyphicon glyphicon-refresh pull-right glyphicon-transmit"
              onClick={() => { CANFrameBuffer.ClearBuffers(); }}
            />
          </div>
        </div>
        {this.state.windowsStatus === 'TRANSMIT' ? <CANTransmitContents /> : null }
        {this.state.windowsStatus === 'CONFIG' ? <CANConfig /> : null }
        {this.state.windowsStatus === 'DOWNLOAD' ? <CANDownloadLogs /> : null }
      </div>
    </div>);
  }
}

