const path = require('path');
const hue = require("node-hue-api");
const publish = require('../publish');

const deviceTypes = require('../device-types');

module.exports = {
    commands: ['power-on', 'power-off'],
    type: deviceTypes.enum.light,
    driver: 'mqtt-hue-light',
    build: (deviceSettings, generalSettings) => {
        const topics = {
            power: path.join(generalSettings.place, deviceSettings.topic, 'light/cmnd/power'),
        };

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            topics: Object.values(topics),
            powerOn: (client) => publish(client, topics.power, 'ON'),
            powerOff: (client) => publish(client, topics.power, 'OFF'),

            bridge: {
                [topics.power]: async (payload) => {
                    const api = new hue.HueApi(deviceSettings.driver.host, deviceSettings.driver.username);
                    const lightState = hue.lightState;
                    const state = lightState.create();

                    if (payload.toLowerCase() === 'on') {
                        await api.setLightState(deviceSettings.driver.lightId, state.on());
                    } else if (payload.toLowerCase() === 'off') {
                        await api.setLightState(deviceSettings.driver.lightId, state.off());
                    }
                }
            }
        }
    }
};