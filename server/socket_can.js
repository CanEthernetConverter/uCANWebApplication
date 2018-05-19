var can = require('socketcan');
var config = require('./../config.json');

var dataStore = [];
var sendPacketTimeout = false;


let frames_table = [];
filter_unique = function(slcanframe)
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
    emitDataRaw("CANrx_socketCAN", filter_unique(msg));
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

module.exports.onPacketRxRaw = function(handler)
{
  emitDataRaw =  handler;
};


module.exports.onPacketRx = function(handler)
{
  emitData =  handler;
};

}
catch (err)
{
	console.log("Error in creating socket CAN, probably no SocketCAN device: " + err);
}


module.exports.sendCANPacket = function(canMessage)
{
    console.log("LIN< " + canMessage.id + "#" + canMessage.data.toString('hex') );
    channel.send(canMessage);
};