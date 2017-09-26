import React from 'react';
import { input } from 'react-bootstrap';
import { Column, Table, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once
import './css/CANLogger.css';
import CANFrameBuffer from './CANFrameBuffer';

export default class CANLogger extends React.Component {

  // events definition
  onSetReception(flag) {
    this.setState({ isReciving: flag });
      // better just add clering filer inputs @TODO
    if (flag === true) { this.setState({ filteredDataList: CANFrameBuffer.GetData(this.display_diff_time_format) }); }
  }

  onCANFrameClear() {
    this.setState({ filteredDataList: [] });
  }


  onCANFrameRx(canFrame, currentDiffIndex) {
    if (this.display_diff_time_format) {
      if (currentDiffIndex === -1) {
        this.setState({ filteredDataList: this.state.filteredDataList.concat([canFrame]) });
      } else {
        const filteredDataList = this.state.filteredDataList;
        filteredDataList[currentDiffIndex] = canFrame;
        this.setState({
          filteredDataList,
        });
      }
    } else {
      if (this.state.filteredDataList.length > 450) { this.setState({ filteredDataList: [] }); }
      this.setState({ filteredDataList: this.state.filteredDataList.concat([canFrame]) });
    }
    //ll not working ?
    this.blockRerender = true;
    setTimeout(() => {
      this.blockRerender = false;
      this.forceUpdate();
    }, 300);
  }

  shouldComponentUpdate() {
    if (this.blockRerender === true) {
      return false;
    }
    return true;
  }


  constructor(props) {
    super(props);
    this.state = {
      filteredDataList: CANFrameBuffer.GetData(this.display_diff_time_format),
      isReciving: CANFrameBuffer.isReciving,
    };

    CANFrameBuffer.rxCANFrameCallback = this.onCANFrameRx.bind(this);
    CANFrameBuffer.CANFrameClearCallback = this.onCANFrameClear.bind(this);
    CANFrameBuffer.SetReceptionCallback2 = this.onSetReception.bind(this);
  }

  _onFilterChange(filterParam, arg, event) {
    CANFrameBuffer.SetReception(false);
    let val = event.target.value;
    if (filterParam === 'type') {
      val = arg;
    }

    if (!val) {
      CANFrameBuffer.SetReception(true);
      this.setState({ filteredDataList: CANFrameBuffer.GetData(this.display_diff_time_format) });
      return;
    }

    const filterBy = val.toString().toLowerCase();
    const filteredList = [];

    for (let index = 0; index < this.state.filteredDataList.length; index++) {
      const v = this.state.filteredDataList[index][filterParam];
      if (v.toString().toLowerCase().indexOf(filterBy) !== -1) {
        filteredList.push(this.state.filteredDataList[index]);
      }
    }
    this.setState({ filteredDataList: filteredList });
  }
// -------------- render ----------------------------
  render() {
    return (<div> {this.state.isReciving ? null : <div className="statusinfo col-xs-9"><h2>RECEPTION IS OFF</h2></div> }
      <AutoSizer disableHeight>
        {({ width }) => (
          <Table
            width={width}
            height={800}
            headerHeight={50}
            rowHeight={30}
            rowCount={this.state.filteredDataList.length}
            rowGetter={({ index }) => this.state.filteredDataList[index]}
          >

            <Column
              width={150}
              flexGrow={1}
              label={'Delta Time,ms'}
              dataKey={this.display_diff_time_format ? 'timestamp_diff' : 'formattedTime'}
              headerRenderer={() => (<div>
                <a
                  href="#"
                  onClick={() => {
                    this.display_diff_time_format = !this.display_diff_time_format;
                    this.setState({ filteredDataList: CANFrameBuffer.GetData(this.display_diff_time_format) });
                  }}
                >
                  {this.display_diff_time_format ? 'Delta Time,ms' : 'Timestamp'} </a>
              </div>)}
            />
            <Column
              width={200}
              flexGrow={1}
              label="id"
              dataKey="id"
              headerRenderer={() => (<div>
              ID <input
                size="8"
                onChange={this._onFilterChange.bind(this, 'id', '')}
                placeholder="Filter by ID"
              />
              </div>)}
            />
            <Column
              width={50}
              flexGrow={1}
              label="type"
              dataKey="type"
              headerRenderer={() => (<div>
                <a href="#" onClick={this._onFilterChange.bind(this, 'type', 'E')}>E</a>
              \ <a href="#" onClick={this._onFilterChange.bind(this, 'type', 'S')}>S</a>
              </div>)}
            />
            <Column
              width={50}
              flexGrow={1}
              label="len"
              dataKey="len"
            />
            <Column
              width={200}
              flexGrow={1}
              label="data"
              dataKey="data"
              headerRenderer={() => (<div>
              DATA<input
                size="10"
                onChange={this._onFilterChange.bind(this, 'data', '')}
                placeholder="Filter by Data"
              />
              </div>)}
            />
          </Table>
        )}
      </AutoSizer>

    </div>);
  }

}

CANLogger.display_diff_time_format = true;
CANLogger.blockRerender = false;
