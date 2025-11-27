const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Conexão MySQL 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ ERRO CRÍTICO ao conectar ao MySQL:', err.message);
    console.error('Código do erro:', err.code);
    
    // Dicas para diagnóstico
    if (err.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o MySQL está rodando');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Dica: Banco de dados não existe');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Dica: Usuário ou senha incorretos');
    }
  } else {
    console.log('✅ Conectado ao banco de dados MySQL com sucesso!');
    connection.release();
  }
});

// === CADASTRO ===
app.post('/usuarios/cadastro', async (req, res) => {
  const { nome, idade, telefone, endereco, email, senha } = req.body;

  if (!nome || !idade || !telefone || !endereco || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome_completo, idade, telefone, endereco, email, senha) VALUES (?, ?, ?, ?, ?, ?)';
    
    pool.query(sql, [nome, idade, telefone, endereco, email, hash], (err, result) => {
      if (err) {
        console.error('Erro no cadastro:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ mensagem: 'Email já cadastrado!' });
        }
        
        return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário!' });
      }
      res.json({ mensagem: 'Usuário cadastrado com sucesso!', id: result.insertId });
    });
  } catch (erro) {
    console.error('Erro no servidor:', erro);
    res.status(500).json({ mensagem: 'Erro interno no servidor.' });
  }
});

// === LOGIN ===
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos!' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  pool.query(sql, [email], async (err, resultados) => {
    if (err) {
      console.error('Erro no login:', err);
      return res.status(500).json({ mensagem: 'Erro no servidor.' });
    }
    
    if (resultados.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado!' });
    }

    const usuario = resultados[0];
    try {
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ mensagem: 'Senha incorreta!' });
      }

      res.json({ 
        mensagem: `Bem-vindo(a), ${usuario.nome_completo}!`,
        usuario: {
          id: usuario.id,
          nome: usuario.nome_completo,
          email: usuario.email
        }
      });
    } catch (erro) {
      console.error('Erro ao comparar senhas:', erro);
      res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
  });
});

// Rota para verificar status da conexão
app.get('/status', (req, res) => {
  pool.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed',
        error: err.message
      });
    }
    res.json({ 
      status: 'success',
      message: 'Database connected successfully',
      result: results[0].result
    });
  });
});

// Página inicial (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT}`);
});

