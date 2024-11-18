const amqp = require('amqplib');
const express = require('express');

const app = express();
const PORT = 3006;

const produtos = [
    { id: 1, nome: 'Pão-francês', estoque: 100 },
    { id: 2, nome: 'Bolo', estoque: 50 },
    { id: 3, nome: 'Torta', estoque: 30 },
];

async function startServer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'registrarVenda';

    await channel.assertQueue(queue, { durable: true });

    console.log('Aguardando mensagens na fila:', queue);

    channel.consume(
        queue,
        (msg) => {
            const venda = JSON.parse(msg.content.toString());
            const { produto, quantidade } = venda;

            const item = produtos.find((p) => p.nome === produto);

            let response;
            if (!item) {
                response = { status: 'Erro', mensagem: `Produto "${produto}" não encontrado.` };
            } else if (item.estoque < quantidade) {
                response = { status: 'Erro', mensagem: 'Estoque insuficiente para a venda.' };
            } else {
                item.estoque -= quantidade;
                response = {
                    status: 'Sucesso',
                    mensagem: `Venda registrada: Produto - ${produto}, Quantidade: ${quantidade}, Estoque restante: ${item.estoque}`,
                };
                console.log(response.mensagem);
            }

            channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify(response)),
                { correlationId: msg.properties.correlationId, persistent: true }
            );

            channel.ack(msg);
        },
        { noAck: false }
    );
}

app.get('/status', (req, res) => {
    res.json({ status: 'Servidor RPC-AMQP está funcionando!' });
});

app.listen(PORT, () => {
    console.log(`Servidor Express iniciado na porta ${PORT}`);
    startServer().then(() => console.log('Servidor RPC-AMQP iniciado!'));
});
