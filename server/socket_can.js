var can = require('socketcan');
var config = require('./../config.json');

var dataStore = [];
var sendPacketTimeout = false;

try {

var channel = can.createRawChannel(config.CANDevice, true);

var emitData;
// Log any message
channel.addListener("onMessage", function(msg) {
    var msg_type = msg.ext ? " Ex " : " St ";
    if (typeof msg.data !== 'undefined')
    {
    //    console.log(" " + msg.ts_sec + ":" + msg.ts_usec + " " + msg.id.toString(16) + msg_type + "#" + msg.data.toString('hex'));
    } else 
    {
    //   console.log(" " + msg.ts_sec + ":" + msg.ts_usec + " " + msg.id.toString(16));
    }
    dataStore.push(JSON.stringify(msg));
    if (sendPacketTimeout == false){
	sendPacketTimeout = true;
	setTimeout(() => {
            emitData('CANrx_socketCAN',dataStore);
	    sendPacketTimeout = false;
	    dataStore = [];
	},300);
    }
//    emitData('CANrx_socketCAN',JSON.stringify(msg));
    
    
} );

// Reply any message
//channel.addListener("onMessage", channel.send, channel);

channel.start();

module.exports.onPacketRx = function(handler)
{
  emitData =  handler;
};

}
catch (err)
{
	console.log("Error in creating socket CAN, probably no SocketCAN device: " + err);
}
