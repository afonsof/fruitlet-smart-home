const path = require('path');
const publish = require('../publish');
const deviceTypes = require('../device-types');

module.exports = {
    commands: ['power-on', 'power-off'],
    type: deviceTypes.enum.light,
    driver: 'mqtt-light',
    build: function (deviceSettings, generalSettings) {
        const powerTopic = path.join(generalSettings.place, deviceSettings.topic, 'light/cmnd/power');

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            allTopics: [powerTopic],
            powerOn: function (client) {
                return publish(client, powerTopic, 'ON');
            },
            powerOff: function (client) {
                return publish(client, powerTopic, 'OFF');
            }
        }
    }
};