
var http = require('http');
var serveStatic = require('serve-static');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var app = express();
var fs = require('fs');
var os = require("os");
var net = require('net');
var config = require('./../config.json');
require('./logging.js');
var socket_can = require('./socket_can.js');
var mqtt_raw = require('./mqtt_raw.js'); 
var ucan_json_parser = require('ucan_json_parser');


// HTTP SERVER AND WEB SOCKETS
var server = http.createServer(app);
server.listen(config.HTTPPort, function () {
    console.log('uCANToolWebSerwer app listening on port ' + config.HTTPPort)
})

// -------------------- web sockets -------------------------
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
let ws_connection = null;
let sendRawFrames = true;

var exec = require('child_process').exec;

wss.on('connection', function connection(ws) {
    ws_connection = ws;
    console.log('Connection accepted.');
    ws.on('message', function incoming(message) {
        switch (message) {
            case 'CANApplication':
                if (sendRawFrames == false)
                    console.log('CANApplication request ');
                sendRawFrames = true;
		break;
	   default:
		console.log('C<' + message.toString());
		exec('cansend ' + config.CANDevice + ' ' + message.toString());
                break;
        }
    });
    ws.on('close', () => {
        console.log('HTTP Client disconnected');
        ws_connection = null;
    });
});

try {
    socket_can.onPacketRx((endpoint, data) => {
        if ((ws_connection != null) && (sendRawFrames == true)) {
            ws_connection.send(JSON.stringify(data));
        }        
    });
} catch (err) { ; }

    socket_can.onPacketRxRaw((endpoint, data) => {
        let ucan_data = ucan_json_parser.ByteStreamToJSONData(data);        
        console.log(JSON.stringify(ucan_data));
    });


console.log("CANDevice is " + config.CANDevice);

// handling post request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(__dirname));
app.get("/", function (req, res) {
    res.sendFile('/root/uCANWebApplication/build/index.html')
});


function resetDevice() {
    console.log("--- Device Reset ---");
    require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
}

var CANConfigJSON = __dirname + '/../config.json';
app.put("/CAN/config.json", function (req, res) {
    jsonfile.writeFile(CANConfigJSON, req.body);
    console.log('New config');
    console.log(req.body);
    res.send(JSON.stringify("OK"));
    setTimeout(resetDevice, 3000);

});

app.get("/CAN/config.json", function (req, res) {
    obj = JSON.parse(fs.readFileSync(CANConfigJSON, 'utf8'));
    console.log("READ");
    console.log(obj);
    res.send(JSON.stringify(obj));
});


app.get("/CAN/log_files.json", function (req, res) {
    console.log("List dir ");
    fs.readdir(config.CANLogDir, function (err, items) {
        console.log(items);
        res.send(JSON.stringify(items));
    });
});
