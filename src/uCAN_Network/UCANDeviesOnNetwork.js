

export default class UCANDevicesOnNetwork {   
  
  static calculate_status()
  {
    return 'OK';
  }

  static type_to_string(ucan_type){
    switch (ucan_type) {
      case 5:
        return "Stepper";
        break;
      case 6: 
        return "Line";
      default:
        return "Unknown";
        break;
    }
  }
  static data = [];
  static update_flag = false;
  static UpdateRecord(json_element)
  {
    UCANDevicesOnNetwork.update_flag = false;
    UCANDevicesOnNetwork.data.forEach(function(data_element, data_index) {
      
      console.log("----");
      console.log(json_element);
      console.log("----");
      
      if (json_element.id.whole == data_element.id.whole)
      {
          UCANDevicesOnNetwork.update_flag = true;
          UCANDevicesOnNetwork.data[data_index] = json_element;// update data_element
      }
    }, this);
    if (UCANDevicesOnNetwork.update_flag == false)
      UCANDevicesOnNetwork.data.push(json_element);
  }
  static UpdateData(json_data){
    JSON.parse(json_data).forEach(function(json_element) {
      UCANDevicesOnNetwork.UpdateRecord(json_element);
    }, this);

  }
  
}

// const test_data = "[\n    {\n        \"id\": {\n            \"device_type\": 5,\n            \"group\": 0,\n            \"id\": 15,\n            \"whole\": 2148467981\n        },\n        \"timestamp\": 1505222195\n    }\n]\n";
// const test_data2 = "[\n    {\n        \"id\": {\n            \"device_type\": 5,\n            \"group\": 0,\n            \"id\": 16,\n            \"whole\": 2148467981\n        },\n        \"timestamp\": 1605222195\n    }\n]\n";
// const test_data3 = "[\n    {\n        \"id\": {\n            \"device_type\": 6,\n            \"group\": 0,\n            \"id\": 15,\n            \"whole\": 2148457981\n        },\n        \"timestamp\": 1605222195\n    }\n]\n";


// setInterval(() => { UCANDevicesOnNetwork.UpdateData(test_data); console.log(UCANDevicesOnNetwork.data);}, 10000);
// setInterval(() => { UCANDevicesOnNetwork.UpdateData(test_data2); console.log(UCANDevicesOnNetwork.data);}, 11000);
// setInterval(() => { UCANDevicesOnNetwork.UpdateData(test_data3); console.log(UCANDevicesOnNetwork.data);}, 11000);

