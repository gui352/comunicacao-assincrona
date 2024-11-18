const jayson = require("jayson");

const client = jayson.client.http({ port: 3000 });

const venda = {
  produto: "Pão-francês",
  quantidade: 10,
  preco: 8.0,
};

client.request("registrarVenda", venda, (err, response) => {
  if (err) throw err;
  console.log(response.result);
});
