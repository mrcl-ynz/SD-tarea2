const fs = require('fs/promises');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'consumer_miembros',
    brokers: [process.env.KAFKA_HOST],
})

const consumer = kafka.consumer({ groupId: 'miembros' });

const logPath = __dirname + '/.log'

const service = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'miembros'});

    await consumer.run({
        eachMessage: async ({message}) => {
            await fs.appendFile(logPath, message.value.toString() + '\n');   
        }
    });
}

service();