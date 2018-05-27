const Promise = require('bluebird');

module.exports = (client, topic, payload, options) => {
    return new Promise((resolve, reject) => {
        client.publish(topic, payload, options, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};