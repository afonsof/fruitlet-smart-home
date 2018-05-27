const fs = require("fs");
const path = require("path");
const devicesTypes = require("./device-types");

const loadDevicesDrivers = async () => {
    return new Promise((resolve, reject) => {
        const folder = path.join(__dirname, 'device-drivers');
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
        const devicesDrivers = await loadDevicesDrivers();

        const devices = config.devices.map(device => {
            if (device.driver && device.driver.profile) {
                const profile = config.driverProfiles
                    .find(p => p.id === device.driver.profile);
                const cleanProfile = { ...profile };
                delete cleanProfile.id;
                device.driver = { ...device.driver, ...cleanProfile };
            }
            const driver = devicesDrivers.find(d => d.type === device.type && d.driver === device.driver.id);
            if (driver) {
                return driver.build(device, config.general);
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