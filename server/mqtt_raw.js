var can = require('socketcan');
var config = require('./../config.json');
var mqtt = require('mqtt')
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var exec = require('child_process').exec;
var socket_can = require('./socket_can.js');
var ucan_json_parser = require('ucan_json_parser');

mqtt_client.on('connect', function () {
  mqtt_client.subscribe('ucan_sender/#');
  mqtt_client.publish('uCAN', 'client connected');
})

mqtt_client.on('message', function (topic, message) {
    console.log("MQTT>");
    let canmsg = ucan_json_parser.JSONCommandToByteStream(message);
    if (canmsg != undefined)
        socket_can.sendCANPacket(canmsg);            
});

module.exports.sendMqttPacket = function (json_data) {
    console.log("MQTT< " + json_data);
    mqtt_client.publish('ucan_sender', json_data);
}

