const mosca = require('mosca');
const mqtt = require('mqtt');

const batch = require('./batch');
const constants = require('./constants.js');
const httpBridge = require('./http-bridge');

const mqttServer = new mosca.Server({port: 1883});

mqttServer.on('clientConnected', client =>
    console.log('client connected', client.id));

mqttServer.on('published', function(packet) {
    console.log('=========');
    console.log('Topic:', packet.topic);
    console.log('Payload:', packet.payload.toString());
});

mqttServer.on('ready', () => {
    console.log('MQTT server is running');

    const client = mqtt.connect('mqtt://127.0.0.1');

    client.on('connect', function () {
        client.subscribe(constants.batchTopic)
    });

    client.on('message', function (topic, payload) {
        if (topic === constants.batchTopic) {
            batch(client, payload)
                .catch(err => console.log(err));
        }
    });
    httpBridge.start(mqttServer, function(){
       console.log('HTTP Bridge Server is running');
    });
});





