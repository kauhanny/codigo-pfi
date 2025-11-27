const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// CORS configurado para aceitar todas as origens
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos corretamente
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Rotas estáticas específicas
app.use('/css', express.static(path.join(__dirname, 'src', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'src', 'public', 'js')));
app.use('/img', express.static(path.join(__dirname, 'src', 'public', 'img')));
app.use('/html', express.static(path.join(__dirname, 'src', 'public', 'html')));

// Servir arquivos diretamente da pasta public
app.use('/servicos.js', express.static(path.join(__dirname, 'src', 'public', 'js', 'servicos.js')));
app.use('/perfilprofissional.js', express.static(path.join(__dirname, 'src', 'public', 'js', 'perfilprofissional.js')));
app.use('/avatar-default.png', express.static(path.join(__dirname, 'src', 'public', 'img', 'avatar-default.png')));
app.use('/capa-default.jpg', express.static(path.join(__dirname, 'src', 'public', 'img', 'capa-default.jpg')));
app.use('/servico-default.jpg', express.static(path.join(__dirname, 'src', 'public', 'img', 'servico-default.jpg')));

// Ignorar favicon se não existir
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

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

// ================== SISTEMA DE SESSÃO SIMPLES ==================

// Armazenar sessões em memória 
const sessoes = new Map();

// Middleware para verificar sessão
const verificarSessao = (req, res, next) => {
    const sessionId = req.headers.authorization || req.query.sessionid;
    
    if (!sessionId || !sessoes.has(sessionId)) {
        return res.status(401).json({ 
            success: false, 
            message: 'Sessão inválida ou expirada' 
        });
    }
    
    req.usuario = sessoes.get(sessionId);
    next();
};

// ================== TESTE DE CONEXÃO ==================
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ ERRO ao conectar ao MySQL:', err.message);
        console.error('🔍 Detalhes:', err);
    } else {
        console.log('✅ Conectado ao banco de dados MySQL com sucesso!');
        
        // Verificar tabelas
        connection.query('SHOW TABLES', (err, results) => {
            if (err) {
                console.error('❌ Erro ao verificar tabelas:', err);
            } else {
                console.log('📊 Tabelas disponíveis:', results.map(r => Object.values(r)[0]));
            }
        });
        
        connection.release();
    }
});

// ================== ROTAS DAS PÁGINAS ==================

// Tela Inicial (Index)
app.get('/', (req, res) => {
  console.log('🏠 Página INICIAL solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'index.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    const altPath = path.join(__dirname, 'public', 'html', 'index.html');
    if (fs.existsSync(altPath)) {
      res.sendFile(altPath);
    } else {
      console.log('❌ index.html não encontrado em:', filePath);
      res.status(404).send('Página não encontrada');
    }
  }
});

// Menu (Pós-login)
app.get('/menu', (req, res) => {
  console.log('📱 Página MENU solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'menu.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ menu.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Login
app.get('/login', (req, res) => {
  console.log('🔐 Página de login solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'login.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ login.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Cadastro
app.get('/cadastro', (req, res) => {
  console.log('📝 Página de cadastro solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'cadastro.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ cadastro.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Serviços
app.get('/servicos', (req, res) => {
  console.log('💼 Página de serviços solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'servicos.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ servicos.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Agenda
app.get('/agenda', (req, res) => {
  console.log('📅 Página de agenda solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'agenda.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ agenda.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Avaliação
app.get('/avaliacao', (req, res) => {
  console.log('⭐ Página de avaliação solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'avaliacao.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ avaliacao.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Calendário
app.get('/calendario', (req, res) => {
  console.log('📅 Página de calendário solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'calendario.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ calendario.html não encontrado em:', filePath);
    res.status(404).send('Página não encontrada');
  }
});

// Minha Agenda
app.get('/minhaagenda', (req, res) => {
  console.log('📅 Página Minha Agenda solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'minhaagenda.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ minhaagenda.html não encontrado');
    res.status(404).send('Página não encontrada');
  }
});

// Perfil Profissional - ACESSO LIVRE PARA USUÁRIOS LOGADOS
app.get('/perfilprofissional', (req, res) => {
  console.log('👩‍💼 Página Perfil Profissional solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'perfilprofissional.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ perfilprofissional.html não encontrado');
    res.status(404).send('Página não encontrada');
  }
});

// Agenda Profissional
app.get('/agendaprofissional', (req, res) => {
  console.log('📊 Página Agenda Profissional solicitada');
  const filePath = path.join(__dirname, 'src', 'public', 'html', 'agendaprofissional.html');
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log('❌ agendaprofissional.html não encontrado');
    res.status(404).send('Página não encontrada');
  }
});

// ================== ROTAS DA API ==================

// ================== SISTEMA DE SESSÃO ==================

// Login e criação de sessão
app.post('/api/login-sessao', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos!' 
        });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    pool.query(sql, [email], (err, resultados) => {
        if (err) {
            console.error('❌ Erro no login:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro no servidor.' 
            });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado!' 
            });
        }

        const usuario = resultados[0];
        
        // Comparação direta de texto puro
        if (senha !== usuario.senha) {
            return res.status(401).json({ 
                success: false,
                message: 'Senha incorreta!' 
            });
        }

        // Buscar profissional_id se for profissional
        let profissional_id = null;
        if (usuario.tipo_usuario === 'profissional') {
            const sqlProfissional = 'SELECT id FROM profissionais WHERE usuario_id = ?';
            pool.query(sqlProfissional, [usuario.id], (err, resultadosProfissional) => {
                if (err) {
                    console.error('❌ Erro ao buscar profissional:', err);
                } else if (resultadosProfissional.length > 0) {
                    profissional_id = resultadosProfissional[0].id;
                }
                
                criarSessao(usuario, profissional_id, res);
            });
        } else {
            criarSessao(usuario, profissional_id, res);
        }
    });
});

// Função para criar sessão
function criarSessao(usuario, profissional_id, res) {
    const sessionId = 'sessao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    sessoes.set(sessionId, {
        id: usuario.id,
        nome: usuario.nome_completo,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario || 'cliente',
        profissional_id: profissional_id
    });

    console.log('✅ Sessão criada para:', usuario.nome_completo, 'Profissional ID:', profissional_id);

    res.json({ 
        success: true,
        message: `Bem-vindo(a), ${usuario.nome_completo}!`,
        sessionId: sessionId,
        usuario: {
            id: usuario.id,
            nome: usuario.nome_completo,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario || 'cliente',
            profissional_id: profissional_id
        }
    });
}

// Verificar sessão
app.get('/api/verificar-sessao', (req, res) => {
    const sessionId = req.headers.authorization || req.query.sessionid;
    
    if (!sessionId || !sessoes.has(sessionId)) {
        return res.json({ 
            success: false, 
            message: 'Sessão inválida' 
        });
    }
    
    res.json({ 
        success: true, 
        usuario: sessoes.get(sessionId) 
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    const sessionId = req.headers.authorization || req.body.sessionid;
    
    if (sessionId && sessoes.has(sessionId)) {
        sessoes.delete(sessionId);
        console.log('✅ Sessão removida');
    }
    
    res.json({ 
        success: true, 
        message: 'Logout realizado com sucesso!' 
    });
});

// ================== CADASTRO DE USUÁRIO ==================

app.post('/api/cadastrar', async (req, res) => {
    console.log('📝 Tentativa de cadastro recebida');
    const { nome, idade, telefone, endereco, email, senha, tipo_usuario } = req.body;

    if (!nome || !idade || !telefone || !endereco || !email || !senha) {
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos!' 
        });
    }

    try {
        // SENHA EM TEXTO PURO (SEM CRIPTOGRAFIA)
        const sql = 'INSERT INTO usuarios (nome_completo, idade, telefone, endereco, email, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const valores = [nome, idade, telefone, endereco, email, senha, tipo_usuario || 'cliente'];

        console.log('🔍 Executando SQL:', sql);
        console.log('📦 Valores:', valores);
        console.log('🔓 SENHA SALVA EM TEXTO PURO:', senha);

        pool.query(sql, valores, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        success: false,
                        message: 'Email já cadastrado! Tente fazer login.' 
                    });
                }
                
                // Se deu erro por causa da coluna tipo_usuario, funcao para tentar sem ela
                if (err.code === 'ER_BAD_FIELD_ERROR') {
                    console.log('⚠️ Coluna tipo_usuario não existe, tentando cadastro sem ela...');
                    const sqlSemTipo = 'INSERT INTO usuarios (nome_completo, idade, telefone, endereco, email, senha) VALUES (?, ?, ?, ?, ?, ?)';
                    pool.query(sqlSemTipo, [nome, idade, telefone, endereco, email, senha], (err2, result2) => {
                        if (err2) {
                            console.error('❌ Erro definitivo no cadastro:', err2);
                            return res.status(500).json({ 
                                success: false,
                                message: 'Erro ao cadastrar usuário: ' + err2.message 
                            });
                        }
                        
                        finalizarCadastro(result2, tipo_usuario, res);
                    });
                } else {
                    console.error('❌ Erro no cadastro:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Erro ao cadastrar usuário: ' + err.message 
                    });
                }
            } else {
                // SUCESSO no cadastro
                finalizarCadastro(result, tipo_usuario, res);
            }
        });
        
    } catch (erro) {
        console.error('❌ Erro no servidor:', erro);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno no servidor.' 
        });
    }
});

// Função auxiliar para finalizar o cadastro
function finalizarCadastro(result, tipo_usuario, res) {
    console.log('✅ Usuário cadastrado com ID:', result.insertId);
    
    // Se é profissional, cria registro na tabela profissionais
    if (tipo_usuario === 'profissional') {
        const sqlProfissional = 'INSERT INTO profissionais (usuario_id, especialidades) VALUES (?, ?)';
        pool.query(sqlProfissional, [result.insertId, 'Profissional de beleza'], (profErr, profResult) => {
            if (profErr) {
                console.error('❌ Erro ao criar perfil profissional:', profErr);
                // Continua mesmo com erro na tabela profissionais
                enviarRespostaCadastro(result, tipo_usuario, null, res);
            } else {
                console.log('✅ Perfil profissional criado para usuário:', result.insertId, 'ID Profissional:', profResult.insertId);
                enviarRespostaCadastro(result, tipo_usuario, profResult.insertId, res);
            }
        });
    } else {
        enviarRespostaCadastro(result, tipo_usuario, null, res);
    }
}

// Função para enviar resposta do cadastro
function enviarRespostaCadastro(result, tipo_usuario, profissional_id, res) {
    res.json({ 
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        userId: result.insertId,
        isProfissional: tipo_usuario === 'profissional',
        profissional_id: profissional_id
    });
}

// ================== SISTEMA PROFISSIONAL ==================

// API - Cadastrar profissional completo
app.post('/api/profissionais/completo', (req, res) => {
    console.log('👩‍💼 Cadastrando profissional completo');
    const { usuario_id, especialidades, descricao, chave_pix, tipo_chave_pix } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ 
            success: false, 
            message: 'ID do usuário não informado' 
        });
    }

    if (!especialidades) {
        return res.status(400).json({ 
            success: false, 
            message: 'Informe suas especialidades!' 
        });
    }

    // Primeiro verifica se já existe um profissional para este usuário
    const sqlVerificar = 'SELECT id FROM profissionais WHERE usuario_id = ?';
    pool.query(sqlVerificar, [usuario_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao verificar profissional:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro no banco de dados: ' + err.message 
            });
        }

        if (resultados.length > 0) {
            // Atualiza profissional existente
            const sqlUpdate = `
                UPDATE profissionais 
                SET especialidades = ?, descricao = ?, chave_pix = ?, tipo_chave_pix = ?
                WHERE usuario_id = ?
            `;
            
            const valoresUpdate = [especialidades, descricao || '', chave_pix || '', tipo_chave_pix || 'cpf', usuario_id];
            
            pool.query(sqlUpdate, valoresUpdate, (err, result) => {
                if (err) {
                    console.error('❌ Erro ao atualizar profissional:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao atualizar profissional: ' + err.message 
                    });
                }
                
                console.log('✅ Perfil profissional atualizado com sucesso!');
                
                // Atualiza o tipo do usuário para profissional
                const sqlUpdateUsuario = 'UPDATE usuarios SET tipo_usuario = ? WHERE id = ?';
                pool.query(sqlUpdateUsuario, ['profissional', usuario_id], (err) => {
                    if (err) {
                        console.error('❌ Erro ao atualizar tipo do usuário:', err);
                    }
                    
                    res.json({ 
                        success: true,
                        message: 'Perfil profissional atualizado com sucesso!',
                        profissionalId: resultados[0].id
                    });
                });
            });
        } else {
            // Cria novo profissional
            const sqlInsert = `
                INSERT INTO profissionais (usuario_id, especialidades, descricao, chave_pix, tipo_chave_pix) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            const valoresInsert = [
                usuario_id, 
                especialidades, 
                descricao || 'Profissional de beleza', 
                chave_pix || '', 
                tipo_chave_pix || 'cpf'
            ];

            pool.query(sqlInsert, valoresInsert, (err, result) => {
                if (err) {
                    console.error('❌ Erro ao salvar profissional:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro no banco de dados: ' + err.message 
                    });
                }
                
                console.log('✅ Perfil profissional criado com sucesso! ID:', result.insertId);
                
                // Atualiza o tipo do usuário para profissional
                const sqlUpdateUsuario = 'UPDATE usuarios SET tipo_usuario = ? WHERE id = ?';
                pool.query(sqlUpdateUsuario, ['profissional', usuario_id], (err) => {
                    if (err) {
                        console.error('❌ Erro ao atualizar tipo do usuário:', err);
                    }
                    
                    res.json({ 
                        success: true,
                        message: 'Perfil profissional criado com sucesso!',
                        profissionalId: result.insertId
                    });
                });
            });
        }
    });
});

// API - Buscar profissional por usuário
app.get('/api/profissionais/usuario/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;
    console.log(`👩‍💼 Buscando profissional do usuário ${usuario_id}`);
    
    const sql = `
        SELECT p.*, u.nome_completo, u.email, u.telefone, u.endereco
        FROM profissionais p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.usuario_id = ?
    `;
    
    pool.query(sql, [usuario_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar profissional:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar profissional' 
            });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Profissional não encontrado' 
            });
        }
        
        console.log('✅ Profissional encontrado:', resultados[0].nome_completo);
        res.json({ 
            success: true,
            profissional: resultados[0] 
        });
    });
});

// ================== SISTEMA DE SERVIÇOS ==================

// API - Salvar serviço do profissional
app.post('/api/servicos-profissional', (req, res) => {
    console.log('💅 Salvando serviço profissional no banco');
    const { profissional_id, nome_servico, descricao, preco, duracao_minutos, categoria, foto_servico } = req.body;

    if (!profissional_id || !nome_servico || !preco || !duracao_minutos) {
        return res.status(400).json({ 
            success: false, 
            message: 'Preencha todos os campos obrigatórios!' 
        });
    }

    const sql = `INSERT INTO servicos_profissionais 
                (profissional_id, nome_servico, descricao, preco, duracao_minutos, categoria, foto_servico) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    pool.query(sql, [profissional_id, nome_servico, descricao, preco, duracao_minutos, categoria, foto_servico || '../img/servico-default.jpg'], (err, result) => {
        if (err) {
            console.error('❌ Erro ao salvar serviço:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao salvar serviço: ' + err.message 
            });
        }
        
        console.log('✅ Serviço salvo com ID:', result.insertId);
        res.json({ 
            success: true,
            message: 'Serviço cadastrado com sucesso!',
            servicoId: result.insertId
        });
    });
});

// API - Buscar serviços do profissional
app.get('/api/servicos-profissional/:profissional_id', (req, res) => {
    const { profissional_id } = req.params;
    console.log(`💼 Buscando serviços do profissional ${profissional_id}`);
    
    const sql = 'SELECT * FROM servicos_profissionais WHERE profissional_id = ? ORDER BY nome_servico';
    
    pool.query(sql, [profissional_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar serviços:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar serviços' 
            });
        }
        
        console.log(`✅ ${resultados.length} serviços encontrados`);
        res.json({ 
            success: true,
            servicos: resultados 
        });
    });
});

// API - Deletar serviço do profissional
app.delete('/api/servicos-profissional/:servico_id', (req, res) => {
    const { servico_id } = req.params;
    console.log(`🗑️  Tentando deletar serviço ${servico_id}`);
    
    const sql = 'DELETE FROM servicos_profissionais WHERE id = ?';
    
    pool.query(sql, [servico_id], (err, result) => {
        if (err) {
            console.error('❌ Erro ao deletar serviço:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar serviço: ' + err.message 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Serviço não encontrado' 
            });
        }
        
        console.log('✅ Serviço deletado com sucesso!');
        res.json({ 
            success: true,
            message: 'Serviço deletado com sucesso!'
        });
    });
});

// API - Buscar TODOS os serviços públicos
app.get('/api/servicos-publicos', (req, res) => {
    console.log('🌐 Buscando todos os serviços públicos');
    
    const sql = `
        SELECT 
        sp.*, 
        u.nome_completo as nome_profissional,
        u.id as usuario_id,
        p.id as profissional_id
        FROM servicos_profissionais sp
        JOIN profissionais p ON sp.profissional_id = p.id
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY sp.data_criacao DESC
    `;
    
    pool.query(sql, (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar serviços públicos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar serviços' 
            });
        }
        
        console.log(`✅ ${resultados.length} serviços públicos encontrados`);
        
        // Garante que todos os serviços tenham uma foto
        const servicosComFoto = resultados.map(servico => {
            if (!servico.foto_servico || servico.foto_servico === '') {
                servico.foto_servico = '../img/servico-default.jpg';
            }
            return servico;
        });
        
        res.json({ 
            success: true,
            servicos: servicosComFoto 
        });
    });
});

// ================== SISTEMA DE AVALIAÇÕES ==================

// API - Buscar avaliações por profissional
app.get('/api/avaliacoes-profissional/:profissional_id', (req, res) => {
    const { profissional_id } = req.params;
    console.log(`⭐ Buscando avaliações para profissional ID: ${profissional_id}`);
    
    const sql = `
        SELECT av.*, u.nome_completo as nome_cliente, sp.nome_servico
        FROM avaliacoes av
        JOIN usuarios u ON av.usuario_id = u.id
        JOIN servicos_profissionais sp ON av.servico_id = sp.id
        WHERE av.profissional_id = ? 
        ORDER BY av.data_avaliacao DESC
    `;
    
    pool.query(sql, [profissional_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar avaliações:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar avaliações' 
            });
        }
        
        console.log(`✅ ${resultados.length} avaliações encontradas para profissional ${profissional_id}`);
        res.json({ 
            success: true,
            avaliacoes: resultados 
        });
    });
});

// API - Buscar média de avaliações por profissional 
app.get('/api/avaliacoes-media/:profissional_nome', (req, res) => {
    const { profissional_nome } = req.params;
    console.log(`📊 Buscando média de avaliações para: ${profissional_nome}`);
    
    // SQL  - usa 'profissional' em vez de 'profissional_id' e 'data_criacao' em vez de 'data_avaliacao'
    const sql = `
        SELECT 
            COUNT(*) as total_avaliacoes,
            AVG(nota) as media_nota,
            MAX(data_criacao) as ultima_avaliacao
        FROM avaliacoes 
        WHERE profissional = ?
    `;
    
    pool.query(sql, [profissional_nome], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar média de avaliações:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar avaliações' 
            });
        }
        
        const stats = resultados[0] || {};
        const media = stats.media_nota ? parseFloat(stats.media_nota).toFixed(1) : '0.0';
        
        console.log(`✅ Média encontrada: ${media} (${stats.total_avaliacoes || 0} avaliações)`);
        res.json({ 
            success: true,
            total_avaliacoes: stats.total_avaliacoes || 0,
            media_nota: media,
            ultima_avaliacao: stats.ultima_avaliacao
        });
    });
});

// API - Buscar avaliações por profissional - VERSÃO CORRIGIDA
app.get('/api/avaliacoes-profissional/:profissional_nome', (req, res) => {
    const { profissional_nome } = req.params;
    console.log(`⭐ Buscando avaliações para: ${profissional_nome}`);
    
    // SQL  - usa 'profissional' em vez de 'profissional_id'
    const sql = `
        SELECT * FROM avaliacoes 
        WHERE profissional = ? 
        ORDER BY data_criacao DESC
    `;
    
    pool.query(sql, [profissional_nome], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar avaliações:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar avaliações' 
            });
        }
        
        console.log(`✅ ${resultados.length} avaliações encontradas para ${profissional_nome}`);
        res.json({ 
            success: true,
            avaliacoes: resultados 
        });
    });
});

// API - Buscar TODAS as avaliações (para debug)
app.get('/api/avaliacoes-todas', (req, res) => {
    console.log('⭐ Buscando TODAS as avaliações');
    
    const sql = 'SELECT * FROM avaliacoes ORDER BY data_criacao DESC';
    pool.query(sql, (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar avaliações:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar avaliações' 
            });
        }
        
        console.log(`✅ ${resultados.length} avaliações encontradas no total`);
        res.json({ 
            success: true,
            avaliacoes: resultados 
        });
    });
});

// SALVAR AVALIAÇÃO - 
app.post('/api/avaliacoes', (req, res) => {
    console.log('⭐ Tentativa de salvar avaliação recebida');
    console.log('📝 Dados recebidos:', req.body);
    
    //  USA OS NOMES CORRETOS DA TABELA
    const { nome, profissional, servico, data, nota, comentario } = req.body;

    console.log('🔍 Validando campos:', { 
        nome: nome, 
        profissional: profissional, 
        servico: servico, 
        data: data, 
        nota: nota 
    });

    // Validação
    if (!nome || !profissional || !servico || !data || !nota) {
        console.log('❌ Campos incompletos');
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos obrigatórios!' 
        });
    }

    try {
        const notaNumero = parseInt(nota);
        
        if (isNaN(notaNumero) || notaNumero < 1 || notaNumero > 5) {
            return res.status(400).json({ 
                success: false,
                message: 'Nota deve ser entre 1 e 5 estrelas!' 
            });
        }

        //sql
        const sql = `INSERT INTO avaliacoes 
                    (nome_cliente, profissional, servico, data_atendimento, nota, comentario) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        
        const valores = [nome, profissional, servico, data, notaNumero, comentario || ''];

        console.log('💾 Executando SQL:', sql);
        console.log('📦 Valores:', valores);

        pool.query(sql, valores, (err, result) => {
            if (err) {
                console.error('❌ Erro ao salvar avaliação:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro ao salvar avaliação: ' + err.message 
                });
            }
            console.log('✅ Avaliação salva com ID:', result.insertId);
            res.json({ 
                success: true,
                message: 'Avaliação salva com sucesso!',
                avaliacaoId: result.insertId
            });
        });

    } catch (error) {
        console.error('❌ Erro geral:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor' 
        });
    }
});
// ================== SISTEMA DE AGENDAMENTO ==================

// AGENDAMENTO - Versão com sessão
app.post('/api/agendar-com-sessao', verificarSessao, (req, res) => {
    console.log('📅 Tentativa de agendamento com sessão recebida');
    const { profissional_nome, servico_nome, valor, data, hora } = req.body;
    const usuario_id = req.usuario.id;

    if (!profissional_nome || !servico_nome || !valor || !data || !hora) {
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos do agendamento!' 
        });
    }

    // Busca o ID do profissional pelo nome
    const sqlBuscarProfissional = `
      SELECT p.id as profissional_id
      FROM profissionais p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE u.nome_completo = ?
    `;
    
    pool.query(sqlBuscarProfissional, [profissional_nome], (err, resultadosProfissional) => {
        if (err) {
            console.error('❌ Erro ao buscar profissional:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao buscar profissional: ' + err.message 
            });
        }
        
        if (resultadosProfissional.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Profissional não encontrado! Verifique o nome digitado.' 
            });
        }
        
        const profissional_id = resultadosProfissional[0].profissional_id;
        
        // Agora salva o agendamento com o valor fornecido
        const sqlAgendar = `INSERT INTO agendamentos 
                    (usuario_id, profissional_id, servico, data, hora, valor, status) 
                    VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
        
        const valores = [usuario_id, profissional_id, servico_nome, data, hora, valor];

        pool.query(sqlAgendar, valores, (err, result) => {
            if (err) {
                console.error('❌ Erro no agendamento:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro ao realizar agendamento: ' + err.message 
                });
            }
            console.log('✅ Agendamento realizado com ID:', result.insertId);
            res.json({ 
                success: true,
                message: 'Agendamento realizado com sucesso!',
                agendamentoId: result.insertId,
                valor: valor
            });
        });
    });
});

// API - Buscar agendamentos do usuário logado
app.get('/api/meus-agendamentos', verificarSessao, (req, res) => {
    const usuario_id = req.usuario.id;
    console.log(`📅 Buscando agendamentos do usuário ${usuario_id}`);
    
    const sql = `
        SELECT 
            a.*,
            u.nome_completo as cliente_nome,
            p.usuario_id as profissional_usuario_id,
            prof_user.nome_completo as profissional_nome
        FROM agendamentos a
        JOIN usuarios u ON a.usuario_id = u.id
        JOIN profissionais p ON a.profissional_id = p.id
        JOIN usuarios prof_user ON p.usuario_id = prof_user.id
        WHERE a.usuario_id = ?
        ORDER BY a.data DESC, a.hora DESC
    `;
    
    pool.query(sql, [usuario_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar agendamentos do usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar agendamentos' 
            });
        }
        
        console.log(`✅ ${resultados.length} agendamentos encontrados para o usuário`);
        
        // Formatar os dados para o frontend
        const agendamentosFormatados = resultados.map(agendamento => {
            return {
                id: agendamento.id,
                servico: agendamento.servico,
                profissional: agendamento.profissional_nome,
                data: agendamento.data,
                hora: agendamento.hora,
                valor: agendamento.valor,
                status: agendamento.status || 'pending',
                duracao: agendamento.duracao || '1h'
            };
        });
        
        res.json({
            success: true,
            agendamentos: agendamentosFormatados
        });
    });
});

// ================== OUTRAS ROTAS DA API ==================

// LOGIN - COMPARAÇÃO DIRETA DE TEXTO PURO - VERSÃO COM DEBUG
app.post('/api/login', (req, res) => {
    console.log('🎯 ROTA /api/login CHAMADA!');
    console.log('📧 Email recebido:', req.body.email);
    console.log('🔑 Senha recebida:', req.body.senha);

    const { email, senha } = req.body;

    if (!email || !senha) {
        console.log('❌ Campos vazios no login');
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos!' 
        });
    }

    // DEBUG: Ver todos os usuários no banco
    const sqlDebug = 'SELECT id, email, nome_completo, senha FROM usuarios';
    pool.query(sqlDebug, (err, todosUsuarios) => {
        if (err) {
            console.error('❌ Erro ao buscar usuários:', err);
        } else {
            console.log('👥 TODOS os usuários no banco:', todosUsuarios);
        }

        // Busca específica do usuário
        const sql = 'SELECT * FROM usuarios WHERE email = ?';
        console.log('🔍 Buscando usuário com email:', email);
        
        pool.query(sql, [email], async (err, resultados) => {
            if (err) {
                console.error('❌ Erro no login:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro no servidor.' 
                });
            }
            
            console.log(`🔍 Resultados da busca: ${resultados.length} usuários encontrados`);
            
            if (resultados.length === 0) {
                console.log('❌ NENHUM usuário encontrado para:', email);
                return res.status(404).json({ 
                    success: false,
                    message: 'Usuário não encontrado!' 
                });
            }

            const usuario = resultados[0];
            console.log('✅ Usuário encontrado no banco:', {
                id: usuario.id,
                nome: usuario.nome_completo,
                email: usuario.email,
                senha_no_banco: usuario.senha,
                tipo_usuario: usuario.tipo_usuario
            });
            
            // Comparação de senha 
            console.log('🔐 Comparando senhas:');
            console.log('   Senha digitada:', senha);
            console.log('   Senha no banco:', usuario.senha);
            
            if (senha !== usuario.senha) {
                console.log('❌ SENHA NÃO CONFERE!');
                return res.status(401).json({ 
                    success: false,
                    message: 'Senha incorreta!' 
                });
            }

            console.log('✅ SENHA CORRETA! Login bem-sucedido');
            
            // Buscar profissional_id se for profissional
            let profissional_id = null;
            if (usuario.tipo_usuario === 'profissional') {
                const sqlProfissional = 'SELECT id FROM profissionais WHERE usuario_id = ?';
                pool.query(sqlProfissional, [usuario.id], (err, resultadosProfissional) => {
                    if (err) {
                        console.error('❌ Erro ao buscar profissional:', err);
                    } else if (resultadosProfissional.length > 0) {
                        profissional_id = resultadosProfissional[0].id;
                        console.log('👩‍💼 Profissional ID encontrado:', profissional_id);
                    } else {
                        console.log('ℹ️  Usuário é profissional mas não tem registro na tabela profissionais');
                    }
                    
                    finalizarLogin(usuario, profissional_id, res);
                });
            } else {
                console.log('👤 Usuário é cliente (não profissional)');
                finalizarLogin(usuario, profissional_id, res);
            }
        });
    });
});

// Função auxiliar para finalizar login
function finalizarLogin(usuario, profissional_id, res) {
    console.log('✅ Login realizado com sucesso para:', usuario.email);
    console.log('👤 Profissional ID:', profissional_id);
    
    res.json({ 
        success: true,
        message: `Bem-vindo(a), ${usuario.nome_completo}!`,
        usuario: {
            id: usuario.id,
            nome: usuario.nome_completo,
            email: usuario.email,
            telefone: usuario.telefone,
            endereco: usuario.endereco,
            tipo_usuario: usuario.tipo_usuario || 'cliente',
            profissional_id: profissional_id
        }
    });
}

// API - Buscar serviços por profissional
app.get('/api/servicos-por-profissional/:profissional_nome', (req, res) => {
    const { profissional_nome } = req.params;
    
    console.log(`🔍 Buscando serviços para: ${profissional_nome}`);
    
    const sql = `
        SELECT 
        sp.id,
        sp.nome_servico,
        sp.descricao,
        sp.preco,
        sp.duracao_minutos,
        sp.categoria,
        sp.foto_servico,
        u.nome_completo as profissional_nome,
        u.telefone as profissional_telefone,
        p.especialidades
        FROM servicos_profissionais sp
        JOIN profissionais p ON sp.profissional_id = p.id
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.nome_completo = ?
        ORDER BY sp.nome_servico
    `;
    
    pool.query(sql, [profissional_nome], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar serviços:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar serviços' 
            });
        }
        
        console.log(`✅ ${resultados.length} serviços encontrados para ${profissional_nome}`);
        
        // Garantir que todas as fotos tenham valor padrão
        const servicosCompletos = resultados.map(servico => {
            return {
                ...servico,
                foto_servico: servico.foto_servico || '../img/servico-default.jpg',
                descricao: servico.descricao || 'Descrição não disponível',
                duracao_minutos: servico.duracao_minutos || 60,
                categoria: servico.categoria || 'outros'
            };
        });
        
        res.json({ 
            success: true,
            servicos: servicosCompletos 
        });
    });
});

// API - Buscar preço do serviço
app.get('/api/buscar-preco-servico', (req, res) => {
    const { servico_nome, profissional_nome } = req.query;
    
    console.log(`💰 Buscando preço para: "${servico_nome}" - Profissional: "${profissional_nome}"`);
    
    if (!servico_nome || !profissional_nome) {
        return res.status(400).json({ 
            success: false, 
            message: 'Serviço e profissional são obrigatórios' 
        });
    }

    // SQL direto que busca o preço
    const sql = `
        SELECT sp.preco 
        FROM servicos_profissionais sp
        JOIN profissionais p ON sp.profissional_id = p.id
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.nome_completo = ? 
        AND sp.nome_servico LIKE ?
        LIMIT 1
    `;
    
    // Usa LIKE para buscar serviços parecidos
    const servicoBusca = `%${servico_nome}%`;
    
    console.log('🔍 Executando SQL:', sql);
    console.log('📦 Parâmetros:', [profissional_nome, servicoBusca]);
    
    pool.query(sql, [profissional_nome, servicoBusca], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar preço:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro no banco de dados: ' + err.message 
            });
        }
        
        console.log('📊 Resultados encontrados:', resultados);
        
        if (resultados.length === 0) {
            console.log('❌ Nenhum serviço encontrado');
            return res.status(404).json({ 
                success: false, 
                message: `Serviço "${servico_nome}" não encontrado para ${profissional_nome}` 
            });
        }
        
        const preco = resultados[0].preco;
        console.log('✅ Preço encontrado:', preco);
        
        res.json({ 
            success: true,
            preco: preco
        });
    });
});

// AGENDAMENTO - VERSÃO QUE ACEITA VALOR PERSONALIZADO
app.post('/api/agendar', (req, res) => {
    console.log('📅 Tentativa de agendamento recebida');
    const { nome_cliente, profissional_nome, servico_nome, valor, data, hora } = req.body;

    if (!nome_cliente || !profissional_nome || !servico_nome || !valor || !data || !hora) {
        return res.status(400).json({ 
            success: false,
            message: 'Preencha todos os campos do agendamento!' 
        });
    }

    // Primeiro busca o ID do usuário pelo nome do cliente
    const sqlBuscarUsuario = 'SELECT id FROM usuarios WHERE nome_completo = ? LIMIT 1';
    
    pool.query(sqlBuscarUsuario, [nome_cliente], (err, resultadosUsuario) => {
        if (err) {
            console.error('❌ Erro ao buscar usuário:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao buscar usuário: ' + err.message 
            });
        }
        
        if (resultadosUsuario.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Cliente não encontrado! Verifique o nome digitado.' 
            });
        }
        
        const usuario_id = resultadosUsuario[0].id;
        
        // Busca o ID do profissional pelo nome
        const sqlBuscarProfissional = `
        SELECT p.id as profissional_id
        FROM profissionais p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.nome_completo = ?
        `;
        
        pool.query(sqlBuscarProfissional, [profissional_nome], (err, resultadosProfissional) => {
            if (err) {
                console.error('❌ Erro ao buscar profissional:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Erro ao buscar profissional: ' + err.message 
                });
            }
            
            if (resultadosProfissional.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Profissional não encontrado! Verifique o nome digitado.' 
                });
            }
            
            const profissional_id = resultadosProfissional[0].profissional_id;
            
            // Agora salva o agendamento com o valor fornecido 
            const sqlAgendar = `INSERT INTO agendamentos 
                        (usuario_id, profissional_id, servico, data, hora, valor, status) 
                        VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
            
            const valores = [usuario_id, profissional_id, servico_nome, data, hora, valor];

            pool.query(sqlAgendar, valores, (err, result) => {
                if (err) {
                    console.error('❌ Erro no agendamento:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Erro ao realizar agendamento: ' + err.message 
                    });
                }
                console.log('✅ Agendamento realizado com ID:', result.insertId);
                res.json({ 
                    success: true,
                    message: 'Agendamento realizado com sucesso!',
                    agendamentoId: result.insertId,
                    valor: valor
                });
            });
        });
    });
});

// HORÁRIOS OCUPADOS
app.get('/api/horarios-ocupados', (req, res) => {
    console.log('📅 Buscando horários ocupados para o calendário');
    
    const sql = `
        SELECT 
        CASE DAYOFWEEK(data)
            WHEN 2 THEN 'Segunda-feira'
            WHEN 3 THEN 'Terça-feira' 
            WHEN 4 THEN 'Quarta-feira'
            WHEN 5 THEN 'Quinta-feira'
            WHEN 6 THEN 'Sexta-feira'
            WHEN 7 THEN 'Sábado'
            ELSE 'Domingo'
        END as dia_semana,
        TIME_FORMAT(hora, '%H:%i') as hora
        FROM agendamentos 
        WHERE data >= CURDATE()
        AND data < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `;
    
    pool.query(sql, (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar horários ocupados:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar horários' });
        }
        
        console.log(`✅ ${resultados.length} horários ocupados encontrados para a semana`);
        res.json({ 
            success: true,
            horariosOcupados: resultados
        });
    });
});

// PRIMEIRO USUÁRIO
app.get('/api/primeiro-usuario', (req, res) => {
    console.log('👤 Buscando primeiro usuário');
    const sql = 'SELECT id, nome_completo, email FROM usuarios ORDER BY id LIMIT 1';
    pool.query(sql, (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar usuário' 
            });
        }
        if (resultados.length === 0) {
            console.log('❌ Nenhum usuário cadastrado');
            return res.status(404).json({ 
                success: false, 
                message: 'Nenhum usuário cadastrado' 
            });
        }
        console.log('✅ Usuário encontrado:', resultados[0].nome_completo);
        res.json({ 
            success: true, 
            usuario: resultados[0] 
        });
    });
});

// VERIFICAR AGENDAMENTOS
app.get('/api/agendamentos', (req, res) => {
    console.log('📋 Listando agendamentos');
    const sql = `
        SELECT a.*, u.nome_completo as usuario_nome, p.nome as profissional_nome
        FROM agendamentos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        LEFT JOIN profissionais p ON a.profissional_id = p.id
        ORDER BY a.data_criacao DESC
    `;
    pool.query(sql, (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar agendamentos:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao buscar agendamentos' 
            });
        }
        res.json({ 
            success: true,
            agendamentos: resultados 
        });
    });
});

// API - Estatísticas do profissional
app.get('/api/estatisticas-profissional/:profissional_id', (req, res) => {
    const { profissional_id } = req.params;
    console.log(`📈 Buscando estatísticas do profissional ${profissional_id}`);
    
    const sqlAgendamentos = `
        SELECT COUNT(*) as total_agendamentos,
            SUM(CASE WHEN DATE(data) = CURDATE() THEN 1 ELSE 0 END) as agendamentos_hoje,
            SUM(valor) as total_receber
        FROM agendamentos 
        WHERE profissional_id = ? AND status = 'confirmado'
    `;
    
    pool.query(sqlAgendamentos, [profissional_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar estatísticas:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar estatísticas' 
            });
        }
        
        const stats = resultados[0] || {};
        res.json({
            success: true,
            totalReceber: stats.total_receber || '0.00',
            totalRecebido: '0.00',
            agendamentosHoje: stats.agendamentos_hoje || 0,
            totalAgendamentos: stats.total_agendamentos || 0
        });
    });
});

// API - Agendamentos do profissional
app.get('/api/agendamentos-profissional/:profissional_id', (req, res) => {
    const { profissional_id } = req.params;
    console.log(`📅 Buscando agendamentos do profissional ${profissional_id}`);
    
    const sql = `
        SELECT a.*, u.nome_completo as cliente_nome, u.telefone as cliente_telefone
        FROM agendamentos a
        JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.profissional_id = ?
        ORDER BY a.data, a.hora
    `;
    
    pool.query(sql, [profissional_id], (err, resultados) => {
        if (err) {
            console.error('❌ Erro ao buscar agendamentos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar agendamentos' 
            });
        }
        
        console.log(`✅ ${resultados.length} agendamentos encontrados`);
        res.json({
            success: true,
            agendamentos: resultados
        });
    });
});

// Log de requisições
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
    next();
});

// Rota de fallback para páginas não encontradas
app.use((req, res) => {
    console.log('❌ Rota não encontrada:', req.path);
    res.status(404).send('Página não encontrada');
});

// ================== INICIALIZAÇÃO DO SERVIDOR ==================

// Função para obter o IP local automaticamente
function getLocalIP() {
    const interfaces = require('os').networkInterfaces();
    
    for (const interfaceName in interfaces) {
        for (const interface of interfaces[interfaceName]) {
            if (interface.family === 'IPv4' && 
                !interface.internal && 
                interface.address.startsWith('192.168.')) {
                return interface.address;
            }
        }
    }
    
    for (const interfaceName in interfaces) {
        for (const interface of interfaces[interfaceName]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    
    return 'localhost';
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    
    console.log('='.repeat(60));
    console.log(' Servidor iniciado com sucesso!');
    console.log('='.repeat(60));
    console.log(' Senhas sao salvas em texto puro!');
    console.log(` Acesse LOCALMENTE:  http://localhost:${PORT}`);      
    console.log(` Acesse pela REDE:   http://${localIP}:${PORT}`);    
    console.log('='.repeat(60));
    console.log(' Iniciado em:', new Date().toLocaleString());
    console.log('='.repeat(60));
});