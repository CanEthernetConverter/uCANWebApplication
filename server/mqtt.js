var mqtt = require('mqtt')
var config = require('./../config.json');
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var config = require('./../config.json');



let frames_table = [];
module.exports.filter_unique = function(slcanframe)
{
    let return_frame = false;
    let i = frames_table[slcanframe.id];
    if (typeof(i) !== 'undefined')
    {
        if (i.length==slcanframe.data.length && 
            i.every(function(v,i) { return v === slcanframe.data[i]}))
        {
            /* do nothing same frame as before */
        } else 
        {
            frames_table[slcanframe.id] = slcanframe.data;
            return_frame = slcanframe;
        }
    } else 
    {
        frames_table[slcanframe.id] = slcanframe.data;
        return_frame = slcanframe;        
    }

    return return_frame;
}


mqtt_client.on('connect', function () {
  mqtt_client.subscribe('ucan_sender/#')
  mqtt_client.publish('uCAN', 'client connected')
})

type_to_string = function(ucan_type){
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

module.exports.mqtt_send_status_frame = function(frame)
{
    var data_json = JSON.parse(frame)[0];
    json_to_mqtt(data_json,"ucan/"+ type_to_string(data_json.id.device_type) + "/" + data_json.id.id);
}

json_to_mqtt = function(data_json, mqtt_topic)
{
    for(attributename in data_json){
        if (typeof(data_json[attributename]) === 'object'){
            json_to_mqtt(data_json[attributename], mqtt_topic + '/' + attributename);
        } else 
        {
            mqtt_client.publish(mqtt_topic + '/'+ attributename, data_json[attributename].toString());
        }
    }
}

var exec = require('child_process').exec;

mqtt_client.on('message', function (topic, message) {
  message = message.toString().replace(/"/g,"\\\"");
  message = message.toString().replace(/ /g,"");
  message = message.toString().replace(/{/g,"\\{");
  message = message.toString().replace(/}/g,"\\}");

  exec('ucan_sender ' + config.CANDevice + ' ' + message.toString(),function (msg) {
                    if (msg != null)
                        console.log(msg) 
                    else 
                        console.log("send OK") 
                });
//   client.end()
});

