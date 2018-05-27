const Promise = require('bluebird');

const createBatchActions = (config, devices) => {
    const batchActions = {};
    config.batch.forEach(batchItem => {
        batchActions[batchItem.trigger] = async (client) => {
            return Promise.each(batchItem.actions, async (action) => {
                if (action.deviceId && action.command) {
                    const device = devices.find(d => d.deviceId === action.deviceId);
                    const params = action.command.split(':');
                    await device[params[0]](client, params[1]);
                }
                else if (action.sleep) {
                    await new Promise(resolve => {
                        setTimeout(() => resolve(), parseInt(action.sleep));
                    });
                }
            });
        }
    });
    return batchActions;
};

module.exports.BatchRunner = class BatchRunner {
    constructor(devices) {
        this.devices = devices;
        this.batchActions = [];
    }

    static async create(config, devices) {
        const obj = new BatchRunner(devices);
        obj.batchActions = await createBatchActions(config, devices);
        return obj;
    }


    run(client, payload) {
        let type = payload.toString();
        const batch = this.batchActions[type];
        if (!batch) {
            throw new Error('Batch command not found');
        }
        return batch(client);
    }
};



