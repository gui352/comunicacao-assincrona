const express = require('express');
const amqp = require('amqplib');
const app = express();
const port = 3004;

app.use(express.json());

let channel;
let connection;

// Conectar ao RabbitMQ
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect('amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('estoque.atualizar', { durable: true });
        console.log('Conectado ao RabbitMQ');
    } catch (error) {
        console.error('Erro ao conectar ao RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000); // Tentar reconectar após 5 segundos
    }
}
connectRabbitMQ();

app.post('/comprasEstoque', async (req, res) => {
    const compra = req.body;

    try {
        if (!channel) throw new Error('Canal RabbitMQ não está conectado.');

        // Adicionar compra à fila
        channel.sendToQueue(
            'estoque.atualizar',
            Buffer.from(JSON.stringify(compra)),
            { persistent: true }
        );

        console.log('Compra enviada para a fila:', compra);

        res.json({
            status: 'pendente',
            mensagem: 'Compra registrada e enviada para processamento.',
        });
    } catch (error) {
        console.error('Erro ao processar compra:', error);
        res.status(500).json({ mensagem: 'Erro ao processar a solicitação' });
    }
});

app.listen(port, () => console.log(`API Compras Estoque iniciada na porta ${port}`));
