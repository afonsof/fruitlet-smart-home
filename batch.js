const Promise = require('bluebird');
const path = require('path');

//Topics
const place = 'home';

//Rooms
const room = {
    livingRoom: path.join(place, 'living-room'),
    bedroom: path.join(place, 'bedroom'),
    kitchen: path.join(place, 'kitchen'),
    batch: path.join(place, 'batch')
};

const device = {
    light: 'light',
    tv: 'tv',
    gate: 'gate'
};

const cmnd = {
    power: 'cmnd/power',
    setSource: 'cmnd/set-source',
    setVolume: 'cmnd/set-volume',
    run: 'cmnd/run'
};

const livingRoomLightPower = path.join(room.livingRoom, device.light, cmnd.power);
const kitchenLightPower = path.join(room.kitchen, device.light, cmnd.power);
const bedroomLightPower = path.join(room.bedroom, device.light, cmnd.power);
const batchRun = path.join(room.batch, cmnd.run);
const livingRoomTvPower = path.join(room.livingRoom, device.tv, cmnd.power);
const livingRoomTvSetSource = path.join(room.livingRoom, device.tv, cmnd.setSource);
const livingRoomTvSetVolume = path.join(room.livingRoom, device.tv, cmnd.setVolume);


const payloads = {
    on: 'ON',
    off: 'OFF',
    turnOffLights: 'TURN-OFF-LIGHTS',
    netflixMode: 'NETFLIX-MODE',
    sleepMode: 'SLEEP-MODE',
    silentMode: 'SILENT-MODE'
};


module.exports = function (client, payload) {
    let type = payload.toString();

    const options = {
        qos: 0,
        retain: false
    };

    switch (type) {
        case payloads.turnOffLights:
            return Promise.all([
                publish(client, livingRoomLightPower, payloads.off, options),
                publish(client, kitchenLightPower, payloads.off, options),
                publish(client, bedroomLightPower, payloads.off, options)
            ]);
        case payloads.netflixMode:
            return publish(client, batchRun, payloads.turnOffLights, options)
                .then(()=> publish(client, livingRoomTvPower, payloads.on))
                .delay(8000)
                .then(()=>publish(client, livingRoomTvSetSource, 'Netflix'));

        case payloads.sleepMode:
            return Promise.all([
                publish(client, batchRun, payloads.turnOffLights, options),
                publish(client, livingRoomTvPower, payloads.off, options)
            ]);
        case payloads.silentMode:
            return publish(client, livingRoomTvSetVolume, 0.5, options);
    }
    return Promise.resolve();
};


function publish(client, topic, payload, options) {
    return new Promise(function (resolve, reject) {
        client.publish(topic, payload, options, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}
