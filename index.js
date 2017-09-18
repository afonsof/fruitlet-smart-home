
const mosca = require('mosca');
const mqtt = require('mqtt');
const express = require('express')
const bodyParser = require('body-parser');


var mqttServer = new mosca.Server({port: 1883});

mqttServer.on('clientConnected', client =>
  console.log('client connected', client.id));

mqttServer.on('ready', () => {
  console.log('MQTT server is running');
  startHttpBridge();
});

function startHttpBridge(){
  const app = express()
  app.use(bodyParser.json())

  app.post('/publish', function (req, res) {
      var message = {
        topic: req.body.topic,
        payload: req.body.message, // or a Buffer
        qos: 2, // 0, 1, or 2
        retain: false // or true
      };
      console.log('http call:')
      console.log(JSON.stringify(message));

      mqttServer.publish(message, function() {
        res.status(200).send(JSON.stringify(message));
      });
  });

  app.listen(3000, function () {
    console.log('Web Server is running');
  });
}





