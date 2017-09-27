import React from 'react'
import { Button } from 'react-bootstrap'
import { input } from 'react-bootstrap'
import UCANItem from './UCANItem.js'
import Masonry from 'react-masonry-component';
import CANFrameBuffer from './../components/CAN/CANFrameBuffer'
import UCANDevicesOnNetwork from "./UCANDeviesOnNetwork.js"

var masonryOptions = {
  columnWidth: 50,
  columnHight: 100,
};

export default class ItemBoard extends React.Component {

  constructor (props) {
    super (props);
    CANFrameBuffer.UCANDevicesOnNetworkCallback = this.onCANFrameRx.bind(this);
    this.state = {
      UCANDevicesOnNetwork : UCANDevicesOnNetwork.data,
    };
  }

  
  onCANFrameRx() {
      this.forceUpdate();
  }

  createNew(e) {
    if (e.which === 13) {
      this.props.store.createTodo(e.target.value)
      e.target.value = ''
    }
  }

  filter(e) {
    this.props.store.filter = e.target.value
  }

  toggleComplete(todo) {
    todo.complete = !todo.complete
  }
  
  componentDidMount()
  {
    console.log('uCANItemBoard mount');
    CANFrameBuffer.RawCANData = false;
  }


  renderValidItem (item)
  {
    if (typeof(item.id) == 'undefined') { return false;}
    if (typeof(item.id.id) == 'undefined') { return false;}
    if (typeof(item.id.device_type) == 'undefined') { return false;}
    // nie wiem czemu z key-em id.whole nie odswierza sie ... szkoda slow...
    {return <UCANItem key={item.timestamp.toString()} value={item}></UCANItem>;}
  }

  render() {
    const uCANList = this.state.UCANDevicesOnNetwork.map(item => (
      <div>
        {this.renderValidItem(item)}
      </div>
    ))

    

    return <div>
      <Masonry
        className={'my-gallery-class'}
        elementType={'div'}
        options={masonryOptions}
      >
              {this.state.UCANDevicesOnNetwork.length > 0 ? uCANList : <h2 className="statusinfo col-xs-9"> No uCAN devices found in network. </h2>}
      </Masonry>
    </div>
  }
}
