const mqtt = require('mqtt');
const path = require('path');
const fs = require('fs');
const config = require('./config')();
const devices = require('./devices')(config);
var robot = require("robotjs");

const client = mqtt.connect('mqtt://' + config.general.remoteServer);

client.on('connect', function () {
  client.subscribe('home/office/computer/cmnd/screen');
  console.log('Client connected.');
});

client.on('message', function (topic, payload) {
    payload = payload.toString();
    console.log(`Received message: ${payload}`);
    if(topic === 'home/office/computer/cmnd/screen' && payload.toLowerCase() === 'lock') {
        var screenSize = robot.getScreenSize();
        var height = (screenSize.height / 2) - 10;
        var width = screenSize.width;

        robot.moveMouse(width-150, 10);
        robot.mouseClick();
        setTimeout(()=>{
            robot.moveMouse(width-150, 80);
            robot.mouseClick();
        }, 1000);
    }
});