var mqtt = require('mqtt');
var config = require('./../config.json');
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)

let cmd_1 = 
{
    "type": "relay",
    "id": 6,
    "signals":
    {
        "relay_open": true,
    }
    
}

let cmd_2 = 
{
    "type": "line_motor",
    "id": 3,
    "signals":
    {
        "direction": 1,
        "speed": 123,
    }    
}

mqtt_client.publish('ucan_sender', JSON.stringify(cmd_2))
