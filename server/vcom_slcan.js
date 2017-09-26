//VCOM SLCAN HANDLING
var config = require('./../config.json');
var SerialPort = require("serialport");

var sendPacketTimeout = false;
var port = new SerialPort(config.CANPort, {baudRate: 115200});
var dataStore = [];

function getSLCANSpeed(speedValue)
{
  switch(speedValue) {
    case 1000000:
        return '8'
        break;
    case 800000:
        return '7'
        break;
    case 500000:
        return '6'
        break;
    case 250000:
        return '5'
        break;
    case 125000:
        return '4'
        break;
    case 100000:
        return '3'
        break;
    default:
        return '8';
    }
	return '8';
}

var initSpeed = false;

port.on('open', function() {
    console.log('C<S'+getSLCANSpeed(config.CANSpeed));
    port.write('S' + getSLCANSpeed(config.CANSpeed) + '\r');
});

port.on('error', function(err) {
  console.log('Error: ', err.message);
});

var broadcast;
var emitData;

port.on('data', function (data) {
  if (initSpeed == false)
  {
      console.log('C<O');
      port.write('O' + '\r');
      initSpeed = true;
  } else
  {
      data.toString().split("\n").map(map_data => {
	  console.log('C>' + map_data.toString()); //log to file
	  broadcast(map_data.toString()+'\n\r'); //send to SOCKETs
      });
      dataStore.push(data.toString());
      if (sendPacketTimeout == false){
	 sendPacketTimeout = true;
	 setTimeout(() => {
         emitData('CANrx',dataStore)
	     sendPacketTimeout = false;
	     dataStore = [];
	 },300);
      }
  }
});

module.exports.onCOMDataRx = function(handler)
{
  broadcast =  handler;
};
module.exports.onPacketRx = function(handler)
{
  emitData =  handler;
};

module.exports.port = port;
