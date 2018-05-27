const express = require('express');
const bodyParser = require('body-parser');

module.exports = {
    start: (mqttServer, callback) => {
        const app = express();
        app.use(bodyParser.json());
        app.post('/publish', (req, res) => {
            let message = {
                topic: req.body.topic.replace(/\s/g, ''),
                payload: req.body.message, // or a Buffer
                qos: 2, // 0, 1, or 2
                retain: false // or true
            };
            console.log('http call:');
            console.log(JSON.stringify(message));

            mqttServer.publish(message, () =>
                res.status(200).send(JSON.stringify(message)));
        });

        app.listen(3000, (err) => callback(err));
    }
};