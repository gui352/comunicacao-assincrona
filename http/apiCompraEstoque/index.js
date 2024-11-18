const express = require('express');
const axios = require('axios');
const app = express();
const port = 3004

app.use(express.json());

let compras = [];

app.get('/comprasEstoque', (req, res) => {
    res.json(compras);
})

app.post('/comprasEstoque', async (req, res) => {
  const compra = req.body;


  try {
    const response = await axios.get(`http://localhost:3003/estoque/${compra.produtoId}`);
    if (response.status === 200) {
        const produto = response.data;

        produto.quantidade = produto.quantidade + compra.novaQuantidade;

        try {
          const response = await axios.put(`http://localhost:3003/estoque/${compra.produtoId}`, produto);
          if(response.status === 200) {
            compra.id = compras.length + 1;

            res.json(compra);
          }
        } catch (error) {
          res.status(500).json({ mensagem: 'Erro ao realizar a solicitação de compra' });
        }
    }
  } catch (error) {
    res.status(404).send('Produto not found');
  }

})

app.get('/comprasEstoque/:id', (req, res) => {
    const compra = compras.find(m => m.id === parseInt(req.params.id));
    if (compra) {
      res.json(compra);
    } else {
      res.status(404).send('Compra not found');
    }
  });
  
  app.put('/comprasEstoque/:id', (req, res) => {
    const compra = compras.find(m => m.id === parseInt(req.params.id));
    if (compra) {
      Object.assign(compra, req.body);
      res.json(compra);
    }
      res.status(404).send('Compra not found');
    
  });
  
  app.delete('/comprasEstoque/:id', (req, res) => {
    const compraIndex = compras.findIndex(m => m.id === parseInt(req.params.id));
    if (compraIndex !== -1) {
      compras.splice(compraIndex, 1);
      res.status(204).send();
    }
      res.status(404).send('Compra not found');
    
  });

app.listen(port, () => 
    console.log('Servidor iniciado na porta: ' + port)
);