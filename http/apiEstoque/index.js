const express = require('express');
const axios = require('axios');
const app = express();
const port = 3003

app.use(express.json());

const produtos = [
    { id: 1, nome: 'Produto A', quantidade: 10},
    { id: 2, nome: 'Produto B', quantidade: 20},
  ];

app.get('/estoque', (req, res) => {
    res.json(produtos);
})

app.post('/estoque', async (req, res) => {
    const produto = req.body;
    produto.id = produtos.length + 1;
    produtos.push(produto);
    res.status(201).json(produto);
})

app.get('/estoque/:id', (req, res) => {
    const id = req.params.id;
    const produto = produtos.find(p => p.id === parseInt(id));
  
    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }
  
    res.json(produto);
  });
  
  app.put('/estoque/:id', (req, res) => {
    const produto = produtos.find(m => m.id === parseInt(req.params.id));
    if (produto) {
      Object.assign(produto, req.body);
      res.json(produto);
    }
      res.status(404).send('produto not found');
  });
  
  app.delete('/estoque/:id', (req, res) => {
    const produtoIndex = produtos.findIndex(m => m.id === parseInt(req.params.id));
    if (produtoIndex !== -1) {
        produtos.splice(produtoIndex, 1);
      res.status(204).send();
    }
      res.status(404).send('Produto not found');
    
  });

app.listen(port, () => 
    console.log('Servidor iniciado na porta: ' + port)
);