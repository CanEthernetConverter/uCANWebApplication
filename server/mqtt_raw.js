var can = require('socketcan');
var config = require('./../config.json');
var mqtt = require('mqtt')
var mqtt_client  = mqtt.connect('mqtt://localhost:' + config.MQTTPort)
var channel = can.createRawChannel(config.CANDevice, true);
var exec = require('child_process').exec;

mqtt_client.on('connect', function () {
    mqtt_client.subscribe('ucan_send_raw/#')
    mqtt_client.publish('uCAN', 'client connected')
})

channel.addListener("onMessage", function(msg) {
    mqtt_client.publish(msg.id.toString(16), msg.data.toString('hex'));
} );

mqtt_client.on('message', function (topic, message) {
    let id = (topic.split("/")[1]);
    let data = (message.toString());
    
    if (data.length%2 != 0) data += '0';
    console.log("mqtt>" + id +'#' + data);
    
    exec('cansend ' + config.CANDevice + ' ' + id + "#" + data, function (msg) {
        if (msg != null)
            console.log(msg) 
        else 
            console.log("CAN send OK") 
    });
});

channel.start();
