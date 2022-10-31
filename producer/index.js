const { Kafka } = require('kafkajs');
const express = require('express');

const kafka = new Kafka({
    clientId: 'producer',
    brokers: [process.env.KAFKA_HOST],
})

const producer = kafka.producer();

const app = express();

app.use(express.json());

app.post('/registro', async (req, res) => {
    await producer.connect();
    await producer.send({
        topic: 'miembros',
        messages: [{
            partition: req.body.premium ? 1 : 0,
            value: JSON.stringify(req.body),
        }]
    })

    await producer.disconnect();

    res.sendStatus(200);
});

app.post('/venta', async(req, res) => {
    await producer.connect();

    await producer.sendBatch({ topicMessages: [
        {
            topic: 'ventas',
            messages: [{   
                value: JSON.stringify({
                    patente: req.body.patente,
                    cantidad: req.body.cantidad,
                })
            }]
        },
        {
            topic: 'stock',
            messages: [{
                value: JSON.stringify({
                    patente: req.body.patente,
                    stock: req.body.stock,
                })
            }]
        },
        { 
            topic: 'ubicacion',
            messages: [{
                partition: 0,
                value: JSON.stringify({
                    patente: req.body.patente,
                    coord: req.body.coord,
                })
            }]
        }
    ]});

    await producer.disconnect();

    res.sendStatus(200);
});

app.post('/denuncia', async(req, res) => {
    await producer.connect();
    await producer.send({
        topic: 'ubicacion',
        messages: [{
            partition: 1,
            value: JSON.stringify({
                patente: req.body.patente,
                coord: req.body.coord,
            })
        }]
    })

    await producer.disconnect();

    res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log('API escuchando en puerto 3000');
});