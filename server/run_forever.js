var forever = require('forever-monitor');
var config = require('./../config.json');
var common_tools = require('./common_tools');

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }

exec("ip link set " + config.CANDevice + " type can bitrate " + config.CANSpeed , puts);
ifup = require('child_process').exec("ifconfig " + config.CANDevice + " up");
ifup.stderr.on('data', (data) => {
    setTimeout(() => {
        console.log("can device not detected");
       // require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
    },15000,'force reboot task');
});

//exec("cd /root/uCANWebApplication/server/logs/ && candump -l any", puts); //enable logging
exec("socketcand -p " + config.SocketPort, puts); //enable logging
exec("mosquitto -p " + config.MQTTPort, puts); //start mqqt borker
exec("node-red -p " + config.NodeRedPort, puts); //start node-red borker

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

