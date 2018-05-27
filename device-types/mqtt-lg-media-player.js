const path = require('path');
const wol = require('wake_on_lan');
const lgtv = require("lgtv2");

const publish = require('../publish');
const deviceTypes = require('../device-types');

const buildLgTvUri = (command) => `ssap://${command}`;

const lgTvCommand = async (host, command, payload) => new Promise((resolve, reject) => {
    let timeout = payload === 'ssap://system/turnOff' ? 1000 : 15000;
    const lgtvClient = lgtv({
        url: 'ws://' + host + ':3000',
        timeout: timeout
    });

    lgtvClient.on('error', (err) => reject(err));

    lgtvClient.on('connect', () => {
        lgtvClient.request(command, payload, (err, res) => {
            lgtvClient.disconnect();
            if (err) return reject(err);
            return resolve(res);
        });
    });
});

const wolCommand = (macAddress) => new Promise((resolve, reject) => {
    wol.wake(macAddress, (err) => {
        if (err) return reject(err);
        return resolve(null, { message: 'TV Turned on' });
    });
});

module.exports = {
    type: deviceTypes.enum.mediaPlayer,
    driver: 'mqtt-lg-media-player',
    build: (deviceSettings, generalSettings) => {
        const mainTopic = path.join(generalSettings.place, deviceSettings.topic);

        const topics = {
            power: path.join(mainTopic, 'tv/cmnd/power'),
            setVolume: path.join(mainTopic, 'tv/cmnd/set-volume'),
            setSource: path.join(mainTopic, 'tv/cmnd/set-source'),
        };

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            topics: Object.values(topics),

            powerOn: async (client) => publish(client, topics.power, 'ON'),
            powerOff: async (client) => publish(client, topics.power, 'OFF'),
            setVolume: async (client, volume) => publish(client, topics.setVolume, volume.toString()),
            setSource: async (client, source) => publish(client, topics.setSource, source),

            bridge: {
                [topics.power]: async (payload) => {
                    if (payload.toLowerCase() === 'off') {
                        const uri = buildLgTvUri('system/turnOff');
                        await lgTvCommand(deviceSettings.host, uri);
                        return { message: 'TV Turned off' };
                    }
                    else if (payload.toLowerCase() === 'on') {
                        await wolCommand(deviceSettings.mac);
                        return { message: 'TV Turned on' };
                    }
                },

                [topics.setSource]: async (payload) => {
                    const uri = buildLgTvUri('system.launcher/launch');
                    await lgTvCommand(deviceSettings.host, uri, { id: payload.toLowerCase() });
                    return { message: 'TV Source changed to ' + payload };
                },

                [topics.setVolume]: async (payload) => {
                    const uri = buildLgTvUri('audio/setVolume');
                    await lgTvCommand(deviceSettings.host, uri, { volume: parseInt(payload) });
                    return { message: 'TV Volume changed to ' + payload };
                }
            },
        }
    }
};




