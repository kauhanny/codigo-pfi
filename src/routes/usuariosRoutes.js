const express = require('express');
const router = express.Router();
const db = require('../config/db');

// === ROTA DE CADASTRO DE USUÁRIO ===
router.post('/cadastro', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  const sql = 'INSERT INTO usuarios (nome_completo, email, senha) VALUES (?, ?, SHA2(?, 256))';
  db.query(sql, [nome, email, senha], (err, result) => {
    if (err) {
      console.error(' Erro ao cadastrar usuário:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }

    console.log(' Usuário cadastrado com sucesso!');
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  });
});

module.exports = router;

