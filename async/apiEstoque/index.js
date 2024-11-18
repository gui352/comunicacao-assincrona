const express = require('express');
const amqp = require('amqplib');
const app = express();
const port = 3003;

app.use(express.json());

const produtos = [
    { id: 1, nome: 'Produto A', quantidade: 10 },
    { id: 2, nome: 'Produto B', quantidade: 20 },
];

async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('estoque.atualizar');

    channel.consume('estoque.atualizar', (message) => {
        if (message !== null) {
            const { produtoId, novaQuantidade } = JSON.parse(message.content.toString());
            console.log('Mensagem recebida do RabbitMQ:', { produtoId, novaQuantidade });

            const produto = produtos.find((p) => p.id === produtoId);
            if (produto) {
                produto.quantidade = novaQuantidade;
                console.log(`Estoque atualizado para o produto ${produtoId}: ${novaQuantidade}`);
            }

            channel.ack(message);
        }
    });
}
connectRabbitMQ();

app.get('/estoque', (req, res) => {
    res.json(produtos);
});

app.get('/estoque/:id', (req, res) => {
    const id = req.params.id;
    const produto = produtos.find((p) => p.id === parseInt(id));

    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    res.json(produto);
});

app.listen(port, () => console.log(`Servidor Estoque iniciado na porta ${port}`));
