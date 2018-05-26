const path = require('path');
const publish = require('../publish');
const deviceTypes = require('../device-types');

module.exports = {
    type: deviceTypes.enum.mediaPlayer,
    driver: 'mqtt-media-player',
    build: function (deviceSettings, generalSettings) {
        const mainTopic = path.join(generalSettings.place, deviceSettings.topic);
        const powerTopic = path.join(mainTopic, 'tv/cmnd/power');
        const setVolumeTopic = path.join(mainTopic, 'tv/cmnd/set-volume');
        const setSourceTopic = path.join(mainTopic, 'tv/cmnd/set-source');

        let bridge = {};
        bridge[powerTopic] = function (payload, callback) {
            if (payload.toLowerCase() === 'off') {
                lgTvCommand(deviceSettings.host, 'ssap://system/turnOff', null,
                    function (err) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, { message: 'TV Turned off' });
                    });
            }
            else if (payload.toLowerCase() === 'on') {
                const wol = require('wake_on_lan');
                wol.wake(deviceSettings.mac,
                    function (err) {
                        if (err) {
                            return callback(err);
                        }
                        return callback(null, { message: 'TV Turned on' });
                    });
            }
        };
        bridge[setSourceTopic] = function (payload, callback) {
            lgTvCommand(deviceSettings.host, 'ssap://system.launcher/launch', { id: payload.toLowerCase() },
                function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, { message: 'TV Source changed to ' + payload });
                });
        };
        bridge[setVolumeTopic] = function (payload, callback) {
            lgTvCommand(deviceSettings.host, 'ssap://audio/setVolume', { volume: parseInt(payload) },
                function (err) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, { message: 'TV Volume changed to ' + payload });
                });
        };

        return {
            deviceId: deviceSettings.id,
            type: deviceSettings.type,
            allTopics: [powerTopic, setVolumeTopic, setSourceTopic],
            powerOn: function (client) {
                return publish(client, powerTopic, 'ON');
            },
            powerOff: function (client) {
                return publish(client, powerTopic, 'OFF');
            },
            setVolume: function (client, volume) {
                return publish(client, setVolumeTopic, volume.toString());
            },
            setSource: function (client, source) {
                return publish(client, setSourceTopic, source);
            },
            bridge: bridge
        }
    }
};

function lgTvCommand(host, command, payload, callback) {
    let timeout = payload === 'ssap://system/turnOff' ? 1000 : 15000;
    const lgtv = require("lgtv2")({
        url: 'ws://' + host + ':3000',
        timeout: timeout
    });

    lgtv.on('error', function (err) {
        callback(err);
    });

    lgtv.on('connect', function () {
        lgtv.request(command, payload, function (err, res) {
            lgtv.disconnect();
            callback(err, res);
        });
    });
}


