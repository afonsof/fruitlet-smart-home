const mqtt = require('mqtt');
const config = require('./config')();
const robot = require("robotjs");

const client = mqtt.connect('mqtt://' + config.general.remoteServer);

client.on('connect', () => {
    client.subscribe('home/office/computer/cmnd/screen');
    console.log('Client connected.');
});

client.on('message', (topic, payload) => {
    payload = payload.toString();
    console.log(`Received message: ${payload}`);
    if (topic === 'home/office/computer/cmnd/screen' && payload.toLowerCase() === 'lock') {
        const screenSize = robot.getScreenSize();
        const width = screenSize.width;

        robot.moveMouse(width - 150, 10);
        robot.mouseClick();
        setTimeout(() => {
            robot.moveMouse(width - 150, 80);
            robot.mouseClick();
        }, 1000);
    }
});