
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
var mqtt = require('./mqtt.js');

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
//                console.log('CANApplication request ');
                sendRawFrames = true;
                break;
            case 'uCANItemBoard':
//              console.log('uCANItemBoard request ');
                sendRawFrames = false;
                break;
            default:// handling ucan_scan
            require('child_process').exec('ucan_discover vcan0 1', 
                function (msg) {
                     console.log(msg) 
                });
                console.log('C<' + message.toString());
                exec('cansend ' + config.CANDevice + ' ' + message.toString())
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

var ucan_scan_network = require('child_process').execFile('ucan_scan_network', [ 
    'vcan0', '10']); 

ucan_scan_network.stdout.on('data', function(ucan_stdout) {
    ucan_stdout.split("]").forEach(function(element) {
        if (element.length > 2)
        {
            element += "]";      
            console.log("-- ucan_scan_network -- ")  
            console.log(element);
            mqtt.mqtt_send_status_frame(element);
            if ((ws_connection != null) && (sendRawFrames == false)) 
            {                
                ws_connection.send((element));
            }
        }
    }, this);
});


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
