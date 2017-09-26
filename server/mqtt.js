var mqtt = require('mqtt')
var config = require('./../config.json');
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var config = require('./../config.json');


mqtt_client.on('connect', function () {
  mqtt_client.subscribe('ucan_sender/#')
  mqtt_client.publish('uCAN', 'client connected')
})
 
module.exports.mqtt_send_status_frame = function(frame)
{
    var data_json = JSON.parse(frame)[0];
    json_to_mqtt(data_json,"ucan/"+ data_json.id.device_type + "/" + data_json.id.id);
}

json_to_mqtt = function(data_json, mqtt_topic)
{
    for(attributename in data_json){
        if (typeof(data_json[attributename]) === 'object'){
            json_to_mqtt(data_json[attributename], mqtt_topic + '/' + attributename);
        } else 
        {
            // console.log(mqtt_topic + '/' + attributename + " : " + data_json[attributename]);
            mqtt_client.publish(mqtt_topic + '/'+ attributename, data_json[attributename].toString());
        }
    }
}

var exec = require('child_process').exec;

mqtt_client.on('message', function (topic, message) {
    // console.log(message.toString());
  message = message.toString().replace(/"/g,"\\\"");
  message = message.toString().replace(/ /g,"");
  message = message.toString().replace(/{/g,"\\{");
  message = message.toString().replace(/}/g,"\\}");

  //vcan0 \{\"id\":22,\"device_type\":\"STEPPER_MOTOR\",\"dir\":\"CLOCKWISE\",\"step_count\":123,\"step_size\":1\}
//   console.log(message.toString());
//   console.log(config.CANDevice);
  exec('ucan_sender ' + config.CANDevice + ' ' + message.toString(),function (msg) {
                    if (msg != null)
                        console.log(msg) 
                    else 
                        console.log("send OK") 
                });
//   client.end()
});