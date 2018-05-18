var mqtt = require('mqtt');
var config = require('./../config.json');
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var socket_can = require('./socket_can.js');

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
    console.log("MQTT>");

    let rx_json = JSON.parse(message);

    console.log(JSON.stringify(rx_json));

    let ucan_device_types_array = require('./ucan_device_types.json');
    
    let ucan_device_type = ucan_device_types_array.filter((x)=>{
        return x.type == rx_json.type;
    });

    if (ucan_device_type.length > 0)
    {
        let dd = ucan_device_type[0];
        // copose frame header part
        let frame_id = dd.id;        
        let buffer = Buffer.alloc(dd.frame_len + 1,0);
        buffer[0] = rx_json.id;
        // copose frame data part
        // 1. find param in device_definition
        let cmd_data = Object.keys(rx_json.signals).map((j) => {
            let mx = dd.signals[j]            
            return {"value":rx_json.signals[j],"sd":mx};
        });
        // 2. cast values to bytes
        cmd_data = cmd_data.map(x => {
            e = x.value;
            switch (typeof(e))
            {
                case 'boolean':
                    e  == true ? e = 1 : e = 0;
                    break;
                case 'number':
                    e = e;
                    break;
                default:
                    e = 0; 
            }
            x.value = e;
            return x;    
        });
        // 3. copose data part of the frame                
        cmd_data.forEach(e => {
            buffer[(e.sd.byte+1)] |= (e.value << e.sd.bit)
        })
        // 4. send frame        
        let canmsg = { id: frame_id, data: buffer };
        socket_can.sendCANPacket(canmsg);            
    }

});

