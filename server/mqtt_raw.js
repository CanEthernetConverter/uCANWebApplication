var can = require('socketcan');
var config = require('./../config.json');
var mqtt = require('mqtt')
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var channel = can.createRawChannel(config.CANDevice, true);

mqtt_client.on('connect', function () {
    mqtt_client.subscribe('ucan_raw/#')
    mqtt_client.publish('uCAN', 'client connected')
})

channel.addListener("onMessage", function(msg) {

    // console.log(" " + msg.ts_sec + ":" + msg.ts_usec + " " + msg.id.toString(16) + msg_type + "#" + msg.data.toString('hex'));
    // msg = JSON.stringify(msg); 
    mqtt_client.publish(msg.id.toString(16), msg.data.toString('hex'));
} );

channel.start();
