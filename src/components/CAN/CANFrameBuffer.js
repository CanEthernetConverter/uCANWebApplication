import { CANFrame } from './CANFrame';
import UCANDevicesOnNetwork from './../../uCAN_Network/UCANDeviesOnNetwork';

export default class CANFrameBuffer {
  static canData = [];
  static canDataDiff = [];
  static isReciving = false;
  static isConnected = false;
  static RawCANData = true;
  static DiffArrayId = 0;
  static rxCANFrameCallback = function () { };
  static connectionCallback = function () { };
  static UCANDevicesOnNetworkCallback = function () { };
  static CANFrameClearCallback = function () { };
  static SetReceptionCallback = function () { }; // place it in array you lazy developer
  static SetReceptionCallback2 = function () { };

  //static socket = new WebSocket(`ws://${window.location.host}`);
  static socket = new WebSocket(`ws://localhost:8080`);
  
  static SetReception(flag) {
    CANFrameBuffer.isReciving = flag;
    CANFrameBuffer.SetReceptionCallback(flag);
    CANFrameBuffer.SetReceptionCallback2(flag);
  }

  static GetData(diffType) {
    if (diffType) {
      return Object.keys(CANFrameBuffer.canDataDiff).map(key => CANFrameBuffer.canDataDiff[key].Frame);
    }
    return CANFrameBuffer.canData;
  }


  static AddCanFrame(tmpCanFrame) {
    if (CANFrameBuffer.isReciving === true) {
      if (tmpCanFrame instanceof CANFrame) {
        const currentId = tmpCanFrame.id;
        var previousDiffArrayId = -1;
        const previousDataDiff = CANFrameBuffer.canDataDiff[currentId];

        if (CANFrameBuffer.canData.length > 450) {
          CANFrameBuffer.canData = [];
        }

        if (typeof previousDataDiff !== 'undefined') {
          tmpCanFrame.timestamp_diff = tmpCanFrame.timestamp - previousDataDiff.Frame.timestamp;
          previousDiffArrayId = previousDataDiff.Id;
        } else {
          previousDiffArrayId = CANFrameBuffer.DiffArrayId; // if there was no frame in diff buffer add new id
          CANFrameBuffer.DiffArrayId++;
        }

        CANFrameBuffer.canDataDiff[currentId] = { 'Frame': tmpCanFrame, 'Id': previousDiffArrayId };
        CANFrameBuffer.canData.push(tmpCanFrame);

        CANFrameBuffer.rxCANFrameCallback(tmpCanFrame, previousDiffArrayId); // pass recived frame to CANLogger
      }
    }
  }

  
  static sendBufferStatus()
  {    
    try {
      if (CANFrameBuffer.RawCANData)
        CANFrameBuffer.socket.send("CANApplication"); 
      else 
        CANFrameBuffer.socket.send("uCANItemBoard"); 
      }
    catch (err) { 
    }
  }
  static ClearBuffers() {
    CANFrameBuffer.DiffArrayId = 0;
    CANFrameBuffer.canData = [];
    CANFrameBuffer.canDataDiff = [];
    CANFrameBuffer.CANFrameClearCallback();
  }

  static InitReception() {
    CANFrameBuffer.socket.onerror = function () {
      console.log('Socket disconnected');
      CANFrameBuffer.isConnected = false;
      CANFrameBuffer.connectionCallback(CANFrameBuffer.isConnected);
    };

    CANFrameBuffer.socket.onopen = function () {
      console.log('Socket connected!!');
      CANFrameBuffer.isConnected = true;
      CANFrameBuffer.connectionCallback(CANFrameBuffer.isConnected);
    };

    CANFrameBuffer.socket.onmessage = function (frame) {
      if (CANFrameBuffer.RawCANData) {
        JSON.parse(frame.data).map((f) => {
          CANFrameBuffer.AddCanFrame(CANFrame.fromSocketCANData(f));
        });
      } else {
        console.log(frame.data);
        UCANDevicesOnNetwork.UpdateData(frame.data);
        CANFrameBuffer.UCANDevicesOnNetworkCallback();
        
      }
    };
  }
  static SendFrame(c) {
    CANFrameBuffer.socket.send(c.toSocketCAN());
    if (c.type === 'E') {
      c.type = 'T';
    } else {
      c.type = 't';
    }
    CANFrameBuffer.AddCanFrame(c);
  }

  static GenerateRandomFrame(_id) {
    // console.log('S');
    const rid = Math.floor(Math.random() * _id);
    const rty = ((((Math.floor(Math.random() * 16)) % 2) === 1) ? 'E' : 'S');
    const rln = Math.floor(Math.random() * 8);
    const rda = (Math.floor(Math.random() * 0xFFFFFFFFFFFF)).toString(16).substring(0, rln * 2);
    const frame = new CANFrame(new Date().getTime(), 0, rid, rty, rda, rln);
    CANFrameBuffer.SendFrame(frame);
  }
  static trafficGeneratorTimer;
  static TrafficGenerator(state, _id, interval) {
    if (state) {
      console.log(`Traffic generator start ${_id} ${interval}`);
      CANFrameBuffer.trafficGeneratorTimer = setInterval(() => { CANFrameBuffer.GenerateRandomFrame(_id); }, interval);
    } else {
      console.log('Traffic generator stop');
      clearInterval(CANFrameBuffer.trafficGeneratorTimer);
    }
  }

}

setInterval(CANFrameBuffer.sendBufferStatus, 1000);
// CANFrameBuffer.TrafficGenerator(true, 3, 120);
