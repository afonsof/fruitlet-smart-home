const fs = require("fs");
const path = require("path");
const devicesTypes = require("./device-types");

const loadDevicesDefinitions = async () => {
    return new Promise((resolve, reject) => {
        const folder = path.join(__dirname, 'device-types');
        fs.readdir(folder, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files.map(file => require(path.join(folder, file))));
        });
    })
};

module.exports.DeviceListFactory = class DeviceListFactory {
    static hyphenCaseToCamelCase(str) {
        return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }

    static async create(config) {
        const devicesDefinitions = await loadDevicesDefinitions();
        const devices = config.devices.map(device => {
            const definition = devicesDefinitions.find(d => d.type === device.type && d.driver === device.driver);
            if (definition) {
                return definition.build(device, config.general);
            }
            return {};
        });

        Object.keys(devicesTypes.enum).forEach(key => {
            key = devicesTypes.enum[key];
            const commands = devicesTypes.commands[key];
            let item = {
                type: key,
                deviceId: 'all-' + key + 's'
            };
            commands.forEach(command => {
                command = DeviceListFactory.hyphenCaseToCamelCase(command);
                const filteredDevices = devices
                    .filter(device => device.type === key);
                item[command] = async (client) => {
                    const promises = filteredDevices
                        .map(device => device[command](client));
                    return Promise.all(promises);
                }
            });
            devices.push(item)
        });
        return devices;
    };
};