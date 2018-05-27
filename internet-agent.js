const mosca = require('mosca');
const mqtt = require('mqtt');

const { BatchRunner } = require('./BatchRunner');
const constants = require('./constants.js');
const httpBridge = require('./http-bridge');
const config = require('./config')();
const { DeviceListFactory } = require('./DeviceListFactory');

(async () => {
    const devices = await DeviceListFactory.create(config);
    const batchRunner = await BatchRunner.create(config, devices);

    const mqttServer = new mosca.Server({ port: 1883 });

    mqttServer.on('clientConnected', client =>
        console.log('client connected', client.id));

    mqttServer.on('published', (packet) => {
        console.log('=========');
        console.log('Topic:', packet.topic);
        console.log('Payload:', packet.payload.toString());
    });

    mqttServer.on('ready', () => {
        console.log('MQTT server is running');

        const client = mqtt.connect('mqtt://127.0.0.1');

        client.on('connect', () => client.subscribe(constants.batchTopic));

        client.on('message', (topic, payload) => {
            if (topic === constants.batchTopic) {
                try {
                    batchRunner.run(client, payload);
                }
                catch (err) {
                    console.log(err);
                }
            }
        });

        httpBridge.start(mqttServer, () =>
            console.log('HTTP Bridge Server is running'));
    });
})();





