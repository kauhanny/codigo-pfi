const mysql = require('mysql2');
require('dotenv').config();

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

conexao.connect((erro) => {
    if (erro) {
        console.log(' Erro ao conectar ao MySQL:', erro);
    } else {
        console.log('Conectado ao MySQL com sucesso!');
    }
});

module.exports = conexao;


