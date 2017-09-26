import Form from 'react-jsonschema-form';
import React, { Component } from 'react';
import { render } from 'react-dom';
import './css/CANToolbox.css';


export default class CANDownloadLogs extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      status: 'idle',
      loaded: false,
    };
    this.schema = {
      title: 'Logs',
      type: 'object',
      required: ['FileSelect'],
      properties: {
        FileSelect: { type: 'string',
          title: 'Select File to download',
          enum: ['click to refresh'] },
      },
    };

    this.formData = {};

    fetch('/CAN/log_files.json')
    .then(response => response.json())
    .then((json) => {
      console.log(`log files ${json}`);
      this.schema.properties.FileSelect.enum = json;
      this.setState({ loaded: true });
    });

    this.log = type => console.log.bind(console, type);
  }


  renderStatus() {
    if (this.state.loaded === true) {
      return (<Form
        schema={this.schema}
        formData={this.formData}
        onSubmit={this.onSubmit}
        onError={this.log('errors')}
      >
        <button className="pull-right glyphicon glyphicon-download-alt glyphicon-transmit" type="submit" />
      </Form>);
    }

    return <div> Logs not found, plug USB pendrive.</div>;
  }
  render() {
    return (
      <div>{this.renderStatus()}</div>
    );
  }
}

CANDownloadLogs.schema = '';
CANDownloadLogs.log = '';
CANDownloadLogs.formData = '';

CANDownloadLogs.onSubmit = ({ formData }) => {
  console.log(`Download ${formData.FileSelect}`);
  window.open(`logs/${formData.FileSelect}`);
};
