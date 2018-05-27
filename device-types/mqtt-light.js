const path = require('path');
const publish = require('../publish');
const deviceTypes = require('../device-types');

module.exports = {
    commands: ['power-on', 'power-off'],
    type: deviceTypes.enum.light,
    driver: 'mqtt-light',
    build: (deviceSettings, generalSettings) => {
        const topics = {
            power: path.join(generalSettings.place, deviceSettings.topic, 'light/cmnd/power'),
        };

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            topics: Object.keys(topics),
            powerOn: (client) => publish(client, topics.power, 'ON'),
            powerOff: (client) => publish(client, topics.power, 'OFF'),
        }
    }
};