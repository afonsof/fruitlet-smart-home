const Promise = require('bluebird');

module.exports = function (client, topic, payload, options) {
    return new Promise(function (resolve, reject) {
        client.publish(topic, payload, options, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};