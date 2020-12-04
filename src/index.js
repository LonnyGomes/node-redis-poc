const { promisify } = require('util');
const redis = require('redis');
const connectionOps = {
    host: '127.0.0.1',
    port: 6379,
};

const connect = (options) => {
    return new Promise((resolve, reject) => {
        const client = redis.createClient(options);

        client.on('error', (error) => {
            console.error(error);
            reject(error);
        });

        client.on('connect', () => {
            console.log('connected');
            const commands = ['get', 'set', 'end'];

            const api = commands.reduce((finalObj, cmd) => {
                finalObj[cmd] = promisify(client[cmd]).bind(client);
                return finalObj;
            }, {});

            resolve(api);
        });
    });
};

const init = async () => {
    try {
        const client = await connect(connectionOps);
        await client.set('docker', 'testing123');
        const result = await client.get('docker');
        console.log('yes', result);

        client.end(true);
    } catch (error) {
        console.log('error encountered', error);
    }
};

init();
