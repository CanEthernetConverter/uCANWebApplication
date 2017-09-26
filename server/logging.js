var fs = require('fs');
var os = require("os");
var config = require('./../config.json');
var moment = require('moment');

console.logCopy = console.log.bind(console);

console.log = function(data)
{
//      var currentDate = moment().format("hh:mm:ss.SSS");	
	var currentDate = '';
      fs.appendFileSync(config.CANLogDir +  config.CANLogPath, currentDate + data + os.EOL);
      console.logCopy(currentDate +  data);
};

