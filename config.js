const path = require('path');
const yaml = require('js-yaml');
const fs = require("fs");

module.exports = function () {
    let config = {};

    try {
        const file = path.join(__dirname, 'config.yml');
        config = yaml.safeLoad(fs.readFileSync(file), 'utf8');
    } catch (e) {
    }
    return config;
};