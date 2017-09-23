const Promise = require('bluebird');

const config = require('./config')();
const constants = require('./constants.js');
const devices = require('./devices.js')(config);
const place = config['place-name'];

const payloads = {
    powerOnLights: 'POWER-ON-LIGHTS',
    powerOffLights: 'POWER-OFF-LIGHTS',
    netflixMode: 'NETFLIX-MODE',
    sleepMode: 'SLEEP-MODE',
    silentMode: 'SILENT-MODE'
};


module.exports = function (client, payload) {
    let type = payload.toString();

    switch (type) {
        case payloads.powerOffLights:
            return devices.lights.powerOff(client);
        case payloads.powerOnLights:
            return devices.lights().powerOn(client);
        case payloads.netflixMode:
            return devices.lights.powerOff(client)
                .then(()=> devices.tv.powerOn(client))
                .delay(8000)
                .then(()=>devices.tv.setSource(client, 'netflix'));

        case payloads.sleepMode:
            return devices.lights.powerOff(client)
                .then(()=>devices.tv.powerOff(client));
        case payloads.silentMode:
            return devices.tv.setVolume(client, 5);
    }
    return Promise.resolve();
};



