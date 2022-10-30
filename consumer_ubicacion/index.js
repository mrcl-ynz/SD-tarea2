const fs = require('fs/promises');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'consumer_ubicacion',
    brokers: [process.env.KAFKA_HOST],
})

const consumer = kafka.consumer({ groupId: 'ubicacion' });

const logPath = __dirname + '/.log'

let carritos = {};
let profugos = [];

const service = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'ubicacion'});

    await consumer.run({
        eachMessage: async ({partition, message}) => {
            let data = JSON.parse(message.value.toString());

            if (partition == 1) {
                profugos.push({
                    patente: data.patente || 'desconocida',
                    ubicacion: data.coord,
                });
            } else {
                carritos[data.patente] = {
                    ubicacion: data.coord,
                    timestamp: Date.now(),
                }
            }

            let currentTime = Date.now();
            
            await fs.writeFile(logPath, 'Ubicación de Carritos:\n\n');

            for (let x in carritos) {
                if ((currentTime - carritos[x].timestamp) > 60_000) {
                    delete carritos[x]
                } else {
                    await fs.appendFile(logPath, JSON.stringify({
                        patente: x,
                        ubicacion: carritos[x].ubicacion,
                    }) + '\n')
                }
            }

            await fs.appendFile(logPath, '\nReportes de Carritos Prófugos\n\n');

            profugos.forEach(async (x) => {
                await fs.appendFile(logPath, JSON.stringify(x) + '\n');
            })
        }
    });
}

service();