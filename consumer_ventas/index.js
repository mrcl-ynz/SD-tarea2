const fs = require('fs/promises');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'consumer_ventas',
    brokers: [process.env.KAFKA_HOST],
})

const consumer = kafka.consumer({ groupId: 'ventas' });

const logPath = __dirname + '/.log'

let total_ventas = {}

const service = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'ventas'});

    await consumer.run({
        eachMessage: async ({message}) => {
            let data = JSON.parse(message.value.toString());

            if (total_ventas[data.patente] === undefined) {
                total_ventas[data.patente] = 0;
            }

            total_ventas[data.patente] += data.cantidad;

            await fs.writeFile(logPath, '');

            for (let x in total_ventas) {
                await fs.appendFile(logPath, JSON.stringify({
                    patente: x,
                    total: total_ventas[x]
                }) + '\n');
            }
        }
    });
}

service();