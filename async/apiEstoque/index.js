const amqp = require('amqplib');
const express = require('express');
const app = express();
const port = 3003;

app.use(express.json());

const produtos = [
    { id: 1, nome: 'Pão francês', quantidade: 50 },
    { id: 2, nome: 'Croissant', quantidade: 30 },
];

async function connectRabbitMQ() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('estoque.atualizar', { durable: true });

    console.log('Aguardando mensagens na fila "estoque.atualizar"...');

    channel.consume(
        'estoque.atualizar',
        async (msg) => {
            const compra = JSON.parse(msg.content.toString());
            console.log('Processando compra:', compra);

            const produto = produtos.find((p) => p.id === compra.produtoId);

            if (!produto) {
                console.log('Produto não encontrado:', compra.produtoId);
            } else {
                produto.quantidade += compra.novaQuantidade;
                console.log(
                    `Estoque atualizado: Produto ${produto.nome}, Nova quantidade: ${produto.quantidade}`
                );
            }

            // Confirma o processamento da mensagem
            channel.ack(msg);
        },
        { noAck: false }
    );
}

connectRabbitMQ();

app.get('/estoque/:id', (req, res) => {
    const produto = produtos.find((p) => p.id === parseInt(req.params.id));
    if (produto) {
        res.json(produto);
    } else {
        res.status(404).send('Produto não encontrado');
    }
});

app.listen(port, () =>
    console.log(`API Estoque iniciada na porta ${port}`)
);
