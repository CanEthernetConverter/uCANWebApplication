import React from 'react';
import ReactDOM from 'react-dom';
import { CANFrame } from './CANFrame';

it('creates valid CANFrame from socket can data', () => {
  const frame = JSON.stringify({ ts_sec: 1497707876, ts_usec: 176234, id: 1478, data: { type: 'Buffer', data: [75, 235, 113, 55, 58] } });

  const canFrame = CANFrame.fromSocketCANData(frame);
  expect(canFrame.toSLCANString()).toEqual('t5c654beb71373a');
});

it('creates valid frame with no data', () => {
  const frame = JSON.stringify({ ts_sec: 1497736121, ts_usec: 644083, id: 1813, data: { type: 'Buffer' } });

  const canFrame = CANFrame.fromSocketCANData(frame);
  expect(canFrame.toSLCANString()).toEqual('t71500');
});
