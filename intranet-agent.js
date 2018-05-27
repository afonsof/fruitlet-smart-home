const mqtt = require('mqtt');
const { DeviceListFactory } = require('./DeviceListFactory');

(async () => {
    const config = require('./config')();
    const devices = await DeviceListFactory.create(config);

    const client = mqtt.connect('mqtt://' + config.general.remoteServer);

    client.on('connect', () => {
        const bridgedDevices = devices
            .filter(devices => devices.bridge);

        bridgedDevices.forEach(device => {
            device.topics.forEach(topic => client.subscribe(topic));
        });
    });

    client.on('message', async (topic, payload) => {
        payload = payload.toString();
        const device = devices.find(d=>d.topics.includes(topic));
        if(device){
            const res = await device.bridge[topic](payload);
            console.log(res);
        }
    });
})();