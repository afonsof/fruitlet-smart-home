const path = require('path');
const publish = require('../publish');

module.exports = function (deviceSettings, generalSettings) {
    const powerTopic = path.join(generalSettings.place, deviceSettings.topic, 'light/cmnd/power');

    return {
        type: deviceSettings.type,
        allTopics: [powerTopic],
        powerOn: function (client) {
            return publish(client, powerTopic, 'ON');
        },
        powerOff: function (client) {
            return publish(client, powerTopic, 'OFF');
        }
    }
};