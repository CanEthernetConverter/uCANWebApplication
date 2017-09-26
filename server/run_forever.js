var forever = require('forever-monitor');
var config = require('./../config.json');

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("interceptty /dev/ttyACM0 /dev/" + config.CANPort + " -q", puts);
exec("slcand -s" + getSLCANSpeed(config.CANSpeed) + " -o /dev/" + config.CANPort + " " + config.CANDevice, puts);
exec("ifconfig " + config.CANDevice + " up", puts);
//exec("cd /root/uCANWebApplication/server/logs/ && candump -l any", puts); //enable logging
exec("socketcand -p " + config.SocketPort, puts); //enable logging
exec("mosquitto -p " + config.MQTTPort, puts); //start mqqt borker
exec("node-red -p " + config.NodeRedPort, puts); //start node-red borker



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



var child = new (forever.Monitor)('server.js', {
    silent: true,
    args: []
  });

  child.on('exit', function () {
    console.log('serwer.js has exited');
  });

  child.on('restart', function() {
      console.error('Forever restarting script for ' + child.times + ' time');
  });


  child.start(); 

