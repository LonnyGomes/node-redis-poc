const { promisify } = require('util');
const _ = require('lodash');
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
            const commands = ['get', 'set', 'end', 'hmset', 'hgetall'];

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

        // key/values
        await client.set('docker', 'testing123');
        const result = await client.get('docker');
        console.log('key/value result:', result);

        // hashes
        const obj = { a: 1, b: 2, c: 3, d: 4, hello: 'world' };
        // convert the object to key/value pairs
        const objPairs = _.chain(obj).toPairs().flatten().value();

        await client.hmset('hash', objPairs);
        const hashResult = await client.hgetall('hash');
        console.log('hash:', hashResult);

        client.end(true);
    } catch (error) {
        console.log('error encountered', error);
    }
};

init();
