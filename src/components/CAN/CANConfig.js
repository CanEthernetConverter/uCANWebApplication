import React from 'react';
import Form from 'react-jsonschema-form';

export default class CANConfig extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      status: 'idle',
    };
    this.schema = {
      title: 'Config',
      type: 'object',
      required: ['CANPort', 'CANDevice', 'CANSpeed', 'HTTPPort', 'SocketPort', 'CANLogDir'],
      properties: {

        CANPort: { type: 'string', title: 'CAN Virtual COM Port', default: 'port name' },
        CANDevice: { type: 'string', title: 'Socket CAN Device name', default: 'device name' },
        CANSpeed: { type: 'number',
          title: 'CAN Speed bits/s',
          enum: [1000000, 800000, 500000, 250000, 125000, 100000] },
        HTTPPort: { type: 'number', title: 'WebApplication port', default: 'port value' },
        SocketPort: { type: 'number', title: 'Socket connection port', default: 'port value' },
        CANLogDir: { type: 'string', title: 'Path to logs directory', default: 'path' },
      },
    };

    fetch('/CAN/config.json')
    .then(response => response.json())
    .then((json) => {
      this.formData = json;
      this.forceUpdate();
    });

    this.log = type => console.log.bind(console, type);
  }

  onSubmit(formData) {
    console.log("Config Send: ");
    console.log(formData.formData);
    fetch('/CAN/config.json', {
      method: 'put',
      body: JSON.stringify(formData.formData, null, 4),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      console.log(response);
      if (response.ok === false) {
        this.setState({ status: 'error' });
      } else { this.setState({ status: 'ok' }); }
    }).catch((err) => {
      console.log(err);
      this.setState({ status: 'error' });
    });
  };

  renderStatus() {
    if (this.state.status === 'ok') { return <div> Send OK, device will restart</div>; }
    if (this.state.status === 'error') { return <div> Send error</div>; }
    return <div />;
  }

  render() {
    return (
      <Form
        schema={this.schema}
        formData={this.formData}
        onSubmit={this.onSubmit.bind(this)}
        onError={this.log('errors')}
      >
        <button className="pull-right" type="submit">Submit</button>
        {this.renderStatus()}
      </Form>
    );
  }
}

CANConfig.schema = '';
CANConfig.log = '';
CANConfig.formData = '';

