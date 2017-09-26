import React from 'react';
import ReactDOM from 'react-dom';
import UCANDevicesOnNetwork from './UCANDeviesOnNetwork';

it('should update data', () => {

  const test_data = "[\n    {\n        \"id\": {\n            \"device_type\": 5,\n            \"group\": 0,\n            \"id\": 15,\n            \"whole\": 2148467981\n        },\n        \"timestamp\": 1505222195\n    }\n]\n";
  const test_data2 = "[\n    {\n        \"id\": {\n            \"device_type\": 5,\n            \"group\": 0,\n            \"id\": 15,\n            \"whole\": 2148467981\n        },\n        \"timestamp\": 1605222195\n    }\n]\n";
  const test_data3 = "[\n    {\n        \"id\": {\n            \"device_type\": 6,\n            \"group\": 0,\n            \"id\": 15,\n            \"whole\": 2148457981\n        },\n        \"timestamp\": 1605222195\n    }\n]\n";
  

  UCANDevicesOnNetwork.UpdateData(test_data);
  
  console.log(UCANDevicesOnNetwork.data);

  UCANDevicesOnNetwork.UpdateData(test_data2);
  
  console.log(UCANDevicesOnNetwork.data);

  UCANDevicesOnNetwork.UpdateData(test_data3);
  console.log(UCANDevicesOnNetwork.data);

});

