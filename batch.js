//const Promise = require('bluebird');

const config = require('./config')();

if (!config || !config.devices) {
    console.log('The key "devices" was not found at "config.yml"');
    process.exit(1);
}
const constants = require('./constants.js');
const place = config['place-name'];

config.batch = config.batch || [];

const batchPromises = {};

require('./devices.js')(config).then(devices => {
    config.batch.forEach(batchItem => {
        let actionsPromises = [];
        batchItem.actions.forEach(action => {
            /*if (action.deviceId && action.command) {
                const device = devices.find(d => d.deviceId === action.deviceId);
                const params = action.command.split(':');
                actionsPromises.push(device[params[0]]);
            }*/
            /*else if (action.sleep) {
                actionsPromises.push(new Promise(resolve => {
                    setTimeout(() => resolve(), parseInt(action.sleep));
                }));
            }*/
            //(client, params.length>1?params[1]:null);
        });
        batchPromises[batchItem.trigger] = Promise.each(actionsPromises);
    });
});

module.exports = function (client, payload) {
    let type = payload.toString();

    const batch = batchPromises[type];

    return batch(client);

    /*switch (type) {
        case payloads.powerOffLights:
            return devices.lights.powerOff(client);
        case payloads.powerOnLights:
            return devices.lights.powerOn(client);
        case payloads.netflixMode:
            return devices.lights.powerOff(client)
                .then(() => devices.tv.powerOn(client))
                .delay(8000)
                .then(() => devices.tv.setSource(client, 'netflix'));

        case payloads.sleepMode:
            return devices.lights.powerOff(client)
                .then(() => devices.tv.powerOff(client));
        case payloads.silentMode:
            return devices.tv.setVolume(client, 5);
    }
    return Promise.resolve();*/
};



