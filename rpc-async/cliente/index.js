const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = 3007;
app.use(express.json());

async function sendVenda(venda) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'registrarVenda';
    const correlationId = Math.random().toString();
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    return new Promise((resolve) => {
        channel.consume(
            responseQueue.queue,
            (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    resolve(JSON.parse(msg.content.toString()));
                    connection.close();
                }
            },
            { noAck: true }
        );

        channel.sendToQueue(queue, Buffer.from(JSON.stringify(venda)), {
            correlationId,
            replyTo: responseQueue.queue,
        });
    });
}

app.post('/venda', async (req, res) => {
    const venda = req.body;

    try {
        const response = await sendVenda(venda);
        res.json(response);
    } catch (error) {
        console.error('Erro ao enviar venda:', error);
        res.status(500).json({ mensagem: 'Erro ao processar a venda.' });
    }
});

app.listen(PORT, () => {
    console.log(`Cliente iniciado na porta ${PORT}`);
});
