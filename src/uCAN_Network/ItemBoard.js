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
    // console.log("callback !!");
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



  render() {
    const uCANList = this.state.UCANDevicesOnNetwork.map(item => (
      <div>
        <UCANItem item={item}></UCANItem>
      </div>
    ))

    return <div>
      <Masonry
        className={'my-gallery-class'}
        elementType={'div'}
        options={masonryOptions}
      >
              {uCANList}
      </Masonry>
    </div>
  }
}
