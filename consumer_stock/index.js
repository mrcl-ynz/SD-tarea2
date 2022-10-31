const fs = require('fs/promises');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'consumer_stock',
    brokers: [process.env.KAFKA_HOST],
})

const consumer = kafka.consumer({ groupId: 'stock' });

const logPath = __dirname + '/.log'

let entries = [];

const service = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'stock' });

    await consumer.run({
        eachMessage: async ({message}) => {
            entries.push(message);

            if (entries.length != 5) return;

            entries.forEach(async (x) => {
                let data = JSON.parse(x.value.toString());
                
                if (data.stock >= 20) return;

                let msg = `El carrito ${data.patente} tiene ${data.stock} sopaipillas restantes!`

                console.log(msg);
                await fs.appendFile(logPath, msg + '\n');
            })

            entries = [];
        }
    });
}

service();