const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');
const app = express();
const port = 3004;

app.use(express.json());

let compras = [];

let channel;
async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('estoque.atualizar', {durable: true});
}
connectRabbitMQ();

app.get('/comprasEstoque', (req, res) => {
    res.json(compras);
});

app.post('/comprasEstoque', async (req, res) => {
    const compra = req.body;

    try {
        const response = await axios.get(`http://localhost:3003/estoque/${compra.produtoId}`);
        if (response.status === 200) {
            const produto = response.data;

            produto.quantidade = produto.quantidade + compra.novaQuantidade;

            compra.id = compras.length + 1;
            compras.push(compra);

            channel.sendToQueue(
                'estoque.atualizar',
                Buffer.from(
                    JSON.stringify({ produtoId: compra.produtoId, novaQuantidade: produto.quantidade })
                ),
                {persistent: true}
            );
            console.log('Mensagem enviada para o RabbitMQ:', { produtoId: compra.produtoId, novaQuantidade: produto.quantidade });

            res.json(compra);

            setTimeout(() => {
                channel.close();
                connection.close();
            })
        }
    } catch (error) {
        console.error("Erro ao enviar a mensagem", error)
    }
});

app.get('/comprasEstoque/:id', (req, res) => {
    const compra = compras.find((m) => m.id === parseInt(req.params.id));
    if (compra) {
        res.json(compra);
    } else {
        res.status(404).send('Compra not found');
    }
});

app.listen(port, () => console.log(`Servidor Compras Estoque iniciado na porta ${port}`));
