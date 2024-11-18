const jayson = require("jayson");

const server = jayson.Server({
  registrarVenda: function (args, callback) {
    const { produto, quantidade, preco } = args;

    console.log(
      `Venda registrada: Produto - ${produto}, Quantidade: ${quantidade}, Preço: ${preco}`
    );

    callback(null, {
      status: `Sucesso! Venda registrada: Produto - ${produto}, Quantidade: ${quantidade}, Preço: ${preco}`,
    });
  },
});

server.http().listen(3000, () => {
  console.log("RPC server is running on port 3000");
});
