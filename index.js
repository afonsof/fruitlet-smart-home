const mosca = require('mosca');
const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');

const batch = require('./batch');

const mqttServer = new mosca.Server({port: 1883});

mqttServer.on('clientConnected', client =>
    console.log('client connected', client.id));

mqttServer.on('published', function(packet, client) {
    //console.log('Published', JSON.stringify(packet));
    console.log('');
    console.log('Published');
    console.log('=========');
    console.log('Topic:', packet.topic);
    console.log('Payload:', packet.payload.toString());
});

mqttServer.on('ready', () => {
    console.log('MQTT server is running');
    onServerReady();
});

function onServerReady() {

    const client = mqtt.connect('mqtt://127.0.0.1');

    client.on('connect', function () {
        client.subscribe('home/batch/cmnd/run')
    });

    client.on('message', function (topic, payload) {
        if (topic === 'home/batch/cmnd/run') {
            batch(client, payload)
                .catch(err => console.log(err));
        }
    });

    const app = express();
    app.use(bodyParser.json());

    app.post('/publish', function (req, res) {
        let message = {
            topic: req.body.topic,
            payload: req.body.message, // or a Buffer
            qos: 2, // 0, 1, or 2
            retain: false // or true
        };
        console.log('http call:');
        console.log(JSON.stringify(message));

        mqttServer.publish(message, function () {
            res.status(200).send(JSON.stringify(message));
        });
    });

    app.listen(3000, function () {
        console.log('Web Server is running');
    });
}





