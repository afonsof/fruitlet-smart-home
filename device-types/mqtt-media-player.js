const path = require('path');
const publish = require('../publish');

module.exports = function (deviceSettings, generalSettings) {
    const mainTopic = path.join(generalSettings.place, deviceSettings.topic);
    const powerTopic = path.join(mainTopic, 'tv/cmnd/power');
    const setVolumeTopic = path.join(mainTopic, 'tv/cmnd/set-volume');
    const setSourceTopic = path.join(mainTopic, 'tv/cmnd/set-source');

    let bridge = {};
    bridge[powerTopic] = function (payload) {
        if (payload.toLowerCase() === 'off') {
            lgTvCommand(deviceSettings.host, 'ssap://system/turnOff', null, function (err, res) {
                console.log('TV Turned off');
            });
        }
        else if (payload.toLowerCase() === 'on') {
            var wol = require('wake_on_lan');
            wol.wake(deviceSettings.mac, function (error) {
                if (error) {
                    // handle error
                } else {
                    // done sending packets
                }
            });
        }
    };
    bridge[setSourceTopic] = function (payload) {
        lgTvCommand(deviceSettings.host, 'ssap://system.launcher/launch', {id: payload.toLowerCase()},
            function (err, res) {
                console.log('TV Source Changed');
            });
    };
    bridge[setVolumeTopic] = function (payload) {
        lgTvCommand(deviceSettings.host, 'ssap://audio/setVolume', {volume: parseInt(payload)},
            function (err, res) {
                console.log('TV Volume Changed');
            });
    };

    return {
        type: deviceSettings.type,
        allTopics: [powerTopic, setVolumeTopic, setSourceTopic],
        powerOn: function (client) {
            return publish(client, powerTopic, 'ON');
        },
        powerOff: function (client) {
            return publish(client, powerTopic, 'OFF');
        },
        setVolume: function (client, volume) {
            return publish(client, setVolumeTopic, volume);
        },
        setSource: function (client, source) {
            return publish(client, setSourceTopic, source);
        },
        bridge: bridge
    }
};

function lgTvCommand(host, command, payload, callback) {
    var lgtv = require("lgtv2")({
        url: 'ws://' + host + ':3000'
    });

    lgtv.on('error', function (err) {
        console.log(err);
    });

    lgtv.on('connect', function () {
        console.log('connected');
        lgtv.request(command, payload, function (err, res) {
            lgtv.disconnect();
            callback(err, res);
        });
    });
}


