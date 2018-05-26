const mqtt = require('mqtt');
const path = require('path');
const fs = require('fs');
const config = require('./config')();
const devices = require('./devices')(config);

const client = mqtt.connect('mqtt://' + config.general['remote-server']);

client.on('connect', function () {
    devices.tv.allTopics.forEach(topic=> {
        client.subscribe(topic);
    });
});

client.on('message', function (topic, payload) {
    payload = payload.toString();
    devices.tv.bridge[topic](payload, (err,res)=> {
        if(err){
            console.error(err);
        }
        console.log(res);
    });
});