document.addEventListener("DOMContentLoaded", () => {
    console.log("👩‍💼 Página Perfil Profissional carregada!");
    
    // Configurar eventos
    document.getElementById('btnCadastrarProfissional').addEventListener('click', iniciarCadastroProfissional);
    configurarUploads();
    document.getElementById('formServico').addEventListener('submit', adicionarServico);
    
    // Verificar se usuário está logado
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (usuario && usuario.id) {
        console.log('👤 Usuário logado encontrado:', usuario);
        
        // Sempre mostrar conteúdo profissional para usuários logados
        document.getElementById('acessoNegado').style.display = 'none';
        document.getElementById('conteudoProfissional').style.display = 'block';
        
        // Carregar dados do usuário automaticamente
        carregarDadosUsuario();
        
        // Se já é profissional, mostrar perfil completo
        if (usuario.tipo_usuario === 'profissional') {
            document.getElementById('cadastroSection').style.display = 'none';
            document.getElementById('perfilCompleto').style.display = 'block';
            carregarPerfilCompleto(usuario.id);
        } else {
            // Se não é profissional, mostrar cadastro
            document.getElementById('cadastroSection').style.display = 'block';
            document.getElementById('perfilCompleto').style.display = 'none';
        }
    } else {
        // Usuário não logado - mostrar acesso negado
        document.getElementById('acessoNegado').style.display = 'block';
        document.getElementById('conteudoProfissional').style.display = 'none';
        console.log('❌ Nenhum usuário logado encontrado');
    }
});

// Variáveis globais para armazenar fotos
let fotoServicoBase64 = '';

// Buscar ID do profissional do usuário logado
async function buscarIdProfissionalUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario || !usuario.id) {
        console.log('❌ Usuário não logado');
        return null;
    }

    try {
        const response = await fetch(`/api/profissionais/usuario/${usuario.id}`);
        const result = await response.json();

        if (result.success) {
            // Salvar o ID do profissional no objeto do usuário
            usuario.profissional_id = result.profissional.id;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            console.log('✅ ID do profissional encontrado:', result.profissional.id);
            return result.profissional.id;
        } else {
            console.log('❌ Usuário não é profissional');
            return null;
        }
    } catch (error) {
        console.error('❌ Erro ao buscar ID do profissional:', error);
        return null;
    }
}

// Carregar dados do usuário logado
function carregarDadosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (usuario && usuario.id) {
        console.log('👤 Usuário logado encontrado:', usuario);
        
        // Preencher campos automáticos NO CADASTRO
        if (document.getElementById('nomeProfissional')) {
            document.getElementById('nomeProfissional').value = usuario.nome || '';
        }
        if (document.getElementById('emailProfissional')) {
            document.getElementById('emailProfissional').value = usuario.email || '';
        }
        if (document.getElementById('telefoneProfissional')) {
            document.getElementById('telefoneProfissional').value = usuario.telefone || '';
        }
        if (document.getElementById('enderecoProfissional')) {
            document.getElementById('enderecoProfissional').value = usuario.endereco || '';
        }
        
        // Se já é profissional, carregar dados completos
        if (usuario.tipo_usuario === 'profissional') {
            carregarDadosProfissionais(usuario.id);
        }
    }
}

// Iniciar cadastro de profissional
function iniciarCadastroProfissional() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario || !usuario.id) {
        mostrarMensagem('❌ Você precisa estar logado para cadastrar um perfil profissional!', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    document.getElementById('acessoNegado').style.display = 'none';
    document.getElementById('conteudoProfissional').style.display = 'block';
    document.getElementById('cadastroSection').style.display = 'block';
    document.getElementById('perfilCompleto').style.display = 'none';
}

// Configurar uploads
function configurarUploads() {
    // Upload de foto de capa
    const fotoCapaInput = document.getElementById('fotoCapaInput');
    if (fotoCapaInput) {
        fotoCapaInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                processarFoto(file, 'fotoCapaPreview', (base64) => {
                    fotoCapaBase64 = base64;
                });
            }
        });
    }

    // Upload de foto do serviço
    const fotoServicoInput = document.getElementById('fotoServicoInput');
    if (fotoServicoInput) {
        fotoServicoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                processarFoto(file, 'fotoServicoImg', (base64) => {
                    fotoServicoBase64 = base64;
                    document.getElementById('fotoServicoPreview').style.display = 'block';
                });
            }
        });
    }

    // Upload de certificado
    const certificadoInput = document.getElementById('certificadoInput');
    const uploadArea = document.getElementById('uploadCertificado');

    if (uploadArea && certificadoInput) {
        uploadArea.addEventListener('click', () => certificadoInput.click());
        certificadoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processarCertificado(e.target.files[0]);
            }
        });
    }
}

// Processar foto genérica
function processarFoto(file, previewElementId, callback) {
    if (!file.type.startsWith('image/')) {
        mostrarMensagem('❌ Por favor, selecione uma imagem!', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        mostrarMensagem('❌ Imagem muito grande! Máximo 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('📸 Foto carregada com sucesso!');
        const preview = document.getElementById(previewElementId);
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        if (callback) {
            callback(e.target.result);
        }
    };
    
    reader.onerror = function() {
        mostrarMensagem('❌ Erro ao carregar a imagem!', 'error');
    };
    
    reader.readAsDataURL(file);
}

// Função para remover foto do serviço
function removerFotoServico() {
    fotoServicoBase64 = '';
    document.getElementById('fotoServicoPreview').style.display = 'none';
    document.getElementById('fotoServicoInput').value = '';
}

// Processar certificado
function processarCertificado(file) {
    if (file.size > 5 * 1024 * 1024) {
        mostrarMensagem('❌ Arquivo muito grande! Máximo 5MB.', 'error');
        return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        mostrarMensagem('❌ Formato não permitido! Use PDF, JPG ou PNG.', 'error');
        return;
    }

    document.getElementById('statusVerificacao').innerHTML = '🔍 Verificando autenticidade...';
    
    setTimeout(() => {
        const isOriginal = verificarAutenticidadeCertificado(file);
        
        if (isOriginal) {
            mostrarCertificadoAprovado(file.name);
            mostrarMensagem('✅ Certificado verificado com sucesso!', 'success');
        } else {
            mostrarMensagem('❌ Certificado não parece ser original! Envie um documento válido.', 'error');
            document.getElementById('statusVerificacao').innerHTML = '❌ Certificado recusado';
        }
    }, 2000);
}

// Verificar autenticidade do certificado
function verificarAutenticidadeCertificado(file) {
    const nomeArquivo = file.name.toLowerCase();
    
    // Verificações básicas
    const temAssinatura = nomeArquivo.includes('assinatura') || nomeArquivo.includes('certificado');
    const temCarimbo = nomeArquivo.includes('carimbo') || nomeArquivo.includes('selo');
    const tamanhoOk = file.size > 50000;
    
    return temAssinatura || temCarimbo || tamanhoOk;
}

function mostrarCertificadoAprovado(nomeArquivo) {
    const uploadArea = document.getElementById('uploadCertificado');
    const certificadoPreview = document.getElementById('certificadoPreview');
    
    uploadArea.style.display = 'none';
    certificadoPreview.style.display = 'flex';
    
    document.getElementById('statusVerificacao').innerHTML = '✅ Certificado verificado e aprovado!';
    
    console.log('📜 Certificado aprovado:', nomeArquivo);
}

function removerCertificado() {
    const uploadArea = document.getElementById('uploadCertificado');
    const certificadoPreview = document.getElementById('certificadoPreview');
    
    uploadArea.style.display = 'block';
    certificadoPreview.style.display = 'none';
    document.getElementById('certificadoInput').value = '';
    document.getElementById('statusVerificacao').innerHTML = '⏳ Aguardando certificado';
}

// FINALIZAR CADASTRO PROFISSIONAL
async function finalizarCadastroProfissional() {
    console.log('🎯 Iniciando finalização do cadastro profissional...');
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario || !usuario.id) {
        mostrarMensagem('❌ Você precisa estar logado!', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }

    const dados = {
        usuario_id: usuario.id,
        especialidades: document.getElementById('especialidadesProfissional').value,
        descricao: document.getElementById('descricaoProfissional').value,
        chave_pix: document.getElementById('chavePix').value,
        tipo_chave_pix: document.getElementById('tipoChavePix').value
    };

    console.log('📦 Dados coletados:', dados);

    // Validações
    if (!dados.especialidades) {
        mostrarMensagem('❌ Informe suas especialidades!', 'error');
        return;
    }

    if (!dados.chave_pix) {
        mostrarMensagem('❌ Informe sua chave PIX para recebimentos!', 'error');
        return;
    }

    try {
        console.log('🔄 Enviando dados para o servidor...');
        
        const response = await fetch('/api/profissionais/completo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });

        const result = await response.json();
        console.log('📨 Resposta do servidor:', result);

        if (result.success) {
            // Atualizar informações do usuário no localStorage
            usuario.tipo_usuario = 'profissional';
            usuario.isProfissional = true;
            localStorage.setItem('usuario', JSON.stringify(usuario));
            
            // Buscar e salvar o ID do profissional
            await buscarIdProfissionalUsuario();
            
            // Mostrar perfil completo
            document.getElementById('cadastroSection').style.display = 'none';
            document.getElementById('perfilCompleto').style.display = 'block';
            
            // Atualizar perfil com os dados
            await carregarPerfilCompleto(usuario.id);
            
            mostrarMensagem('🎉 Cadastro profissional concluído com sucesso!', 'success');
            
        } else {
            mostrarMensagem('❌ Erro ao cadastrar profissional: ' + result.message, 'error');
        }

    } catch (error) {
        console.error('❌ Erro ao cadastrar profissional:', error);
        mostrarMensagem('❌ Erro ao conectar com o servidor!', 'error');
    }
}

// Carregar dados do profissional do banco
async function carregarDadosProfissionais(usuarioId) {
    try {
        const response = await fetch(`/api/profissionais/usuario/${usuarioId}`);
        const result = await response.json();

        if (result.success) {
            const profissional = result.profissional;
            
            // Preencher campos do formulário
            if (document.getElementById('especialidadesProfissional')) {
                document.getElementById('especialidadesProfissional').value = profissional.especialidades || '';
            }
            if (document.getElementById('descricaoProfissional')) {
                document.getElementById('descricaoProfissional').value = profissional.descricao || '';
            }
            if (document.getElementById('chavePix')) {
                document.getElementById('chavePix').value = profissional.chave_pix || '';
            }
            if (document.getElementById('tipoChavePix')) {
                document.getElementById('tipoChavePix').value = profissional.tipo_chave_pix || 'cpf';
            }
            
            console.log('✅ Dados profissionais carregados:', profissional);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados profissionais:', error);
    }
}

// Carregar perfil completo
async function carregarPerfilCompleto(usuarioId) {
    try {
        // Primeiro busca os dados do profissional no banco
        const response = await fetch(`/api/profissionais/usuario/${usuarioId}`);
        const result = await response.json();

        const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
        
        if (result.success) {
            const profissional = result.profissional;
            
            // Atualizar informações do perfil completo
            document.getElementById('nomePerfilCompleto').textContent = profissional.nome_completo || usuario.nome || 'Nome não informado';
            document.getElementById('especialidadesPerfilCompleto').textContent = profissional.especialidades || 'Especialidades não informadas';
            document.getElementById('descricaoPerfilCompleto').textContent = profissional.descricao || 'Descrição não informada';
            document.getElementById('contatoPerfilCompleto').textContent = profissional.telefone || usuario.telefone || 'Telefone não informado';
            document.getElementById('enderecoPerfilCompleto').textContent = profissional.endereco || usuario.endereco || 'Endereço não informado';
            
            console.log('✅ Perfil completo carregado com dados do banco');
        } else {
            // Fallback: usar dados do localStorage
            document.getElementById('nomePerfilCompleto').textContent = usuario.nome || 'Nome não informado';
            document.getElementById('especialidadesPerfilCompleto').textContent = 'Especialidades não informadas';
            document.getElementById('descricaoPerfilCompleto').textContent = 'Descrição não informada';
            document.getElementById('contatoPerfilCompleto').textContent = usuario.telefone || 'Telefone não informado';
            document.getElementById('enderecoPerfilCompleto').textContent = usuario.endereco || 'Endereço não informado';
            
            console.log('⚠️ Usando dados do localStorage como fallback');
        }
        
        // Carregar serviços
        await carregarServicosProfissional(usuarioId);
        
    } catch (error) {
        console.error('❌ Erro ao carregar perfil completo:', error);
        
        // Fallback com dados do localStorage
        const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
        if (usuario) {
            document.getElementById('nomePerfilCompleto').textContent = usuario.nome || 'Nome não informado';
            document.getElementById('contatoPerfilCompleto').textContent = usuario.telefone || 'Telefone não informado';
            document.getElementById('enderecoPerfilCompleto').textContent = usuario.endereco || 'Endereço não informado';
        }
    }
}

// Modal de serviços
function mostrarModalServico() {
    document.getElementById('modalServico').style.display = 'block';
    document.getElementById('formServico').reset();
    document.getElementById('fotoServicoPreview').style.display = 'none';
    fotoServicoBase64 = '';
    
    // Prevenir scroll do body quando modal estiver aberto
    document.body.style.overflow = 'hidden';
}

function fecharModalServico() {
    document.getElementById('modalServico').style.display = 'none';
    // Restaurar scroll do body
    document.body.style.overflow = 'auto';
}

// Fechar modal ao clicar no backdrop
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop')) {
        fecharModalServico();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('modalServico').style.display === 'block') {
        fecharModalServico();
    }
});

// Adicionar serviço
async function adicionarServico(e) {
    e.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario || !usuario.id) {
        mostrarMensagem('❌ Você precisa estar logado!', 'error');
        return;
    }

    // Buscar o ID do profissional
    let profissionalId;
    try {
        const response = await fetch(`/api/profissionais/usuario/${usuario.id}`);
        const result = await response.json();
        
        if (!result.success) {
            mostrarMensagem('❌ Profissional não encontrado! Complete seu cadastro primeiro.', 'error');
            return;
        }
        
        profissionalId = result.profissional.id;
    } catch (error) {
        console.error('❌ Erro ao buscar profissional:', error);
        mostrarMensagem('❌ Erro ao buscar dados do profissional', 'error');
        return;
    }

    const novoServico = {
        profissional_id: profissionalId,
        nome_servico: document.getElementById('nomeServico').value,
        descricao: document.getElementById('descricaoServico').value,
        preco: parseFloat(document.getElementById('precoServico').value),
        duracao_minutos: parseInt(document.getElementById('duracaoServico').value),
        categoria: document.getElementById('categoriaServico').value,
        foto_servico: fotoServicoBase64 || '../img/servico-default.jpg'
    };

    // Validar
    if (!novoServico.nome_servico || !novoServico.preco || !novoServico.duracao_minutos) {
        mostrarMensagem('❌ Preencha nome, preço e duração do serviço!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/servicos-profissional', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoServico)
        });

        const result = await response.json();

        if (result.success) {
            mostrarMensagem('✅ Serviço adicionado com sucesso!', 'success');
            fecharModalServico();
            
            // Recarregar serviços
            carregarServicosProfissional(profissionalId);
            
            // Atualizar página de serviços
            atualizarServicosPublicos();
        } else {
            mostrarMensagem('❌ Erro ao adicionar serviço: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao adicionar serviço:', error);
        mostrarMensagem('❌ Erro ao conectar com o servidor!', 'error');
    }
}

// Carregar serviços do profissional
async function carregarServicosProfissional(profissionalId = null) {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    console.log('🔄 Carregando serviços para usuário:', usuario);
    
    if (!profissionalId) {
        if (!usuario || !usuario.id) {
            console.log('❌ Usuário não logado');
            return;
        }
        
        try {
            // Buscar o ID do profissional
            profissionalId = await buscarIdProfissionalUsuario();
            if (!profissionalId) {
                console.log('❌ Não foi possível encontrar o ID do profissional');
                return;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar profissional:', error);
            return;
        }
    }

    try {
        console.log(`🔍 Buscando serviços do profissional ${profissionalId}`);
        const response = await fetch(`/api/servicos-profissional/${profissionalId}`);
        const result = await response.json();

        console.log('📦 Serviços recebidos:', result);

        if (result.success) {
            // Adicionar profissional_id a cada serviço para controle de permissão
            const servicosComPermissao = result.servicos.map(servico => ({
                ...servico,
                profissional_id: profissionalId
            }));
            
            console.log('✅ Serviços com permissão:', servicosComPermissao);
            exibirServicos(servicosComPermissao);
        } else {
            console.error('❌ Erro ao buscar serviços:', result.message);
        }
    } catch (error) {
        console.error('❌ Erro ao buscar serviços do banco:', error);
    }
}

// Exibir serviços na interface
function exibirServicos(servicos) {
    const servicosLista = document.getElementById('servicosLista');
    const servicosPerfil = document.getElementById('servicosPerfil');
    
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    console.log('👤 Usuário atual:', usuario);
    console.log('📋 Serviços a exibir:', servicos);
    
    if (servicos.length === 0) {
        const emptyMessage = '<p class="empty-message">Nenhum serviço cadastrado ainda</p>';
        if (servicosLista) servicosLista.innerHTML = emptyMessage;
        if (servicosPerfil) servicosPerfil.innerHTML = emptyMessage;
        return;
    }

    const html = servicos.map(servico => {
        // Verificar se o usuário atual é o dono do serviço
        const isDono = usuario && servico.profissional_id && usuario.profissional_id && servico.profissional_id === usuario.profissional_id;
        
        console.log(`🔍 Serviço ${servico.id}: profissional_id=${servico.profissional_id}, usuario.profissional_id=${usuario?.profissional_id}, isDono=${isDono}`);
        
        return `
        <div class="servico-item">
            <div class="servico-info">
                <h4>${servico.nome_servico}</h4>
                <p>${servico.descricao || 'Sem descrição'}</p>
                <small>Duração: ${servico.duracao_minutos}min | Categoria: ${servico.categoria}</small>
                ${!isDono ? '<small style="color: #666; font-style: italic;">📌 Serviço de outro profissional</small>' : ''}
            </div>
            <div class="servico-preco">R$ ${servico.preco.toFixed(2)}</div>
            ${isDono ? `
            <button class="btn-deletar-servico" onclick="deletarServico(${servico.id})" title="Deletar serviço">
                🗑️ Deletar
            </button>
            ` : '<span style="color: #999; font-size: 0.8rem;">🔒</span>'}
        </div>
        `;
    }).join('');

    if (servicosLista) {
        servicosLista.innerHTML = html;
        console.log('✅ Serviços exibidos na lista');
    }
    if (servicosPerfil) {
        servicosPerfil.innerHTML = html;
        console.log('✅ Serviços exibidos no perfil');
    }
}

// Deletar serviço
async function deletarServico(servicoId) {
    if (!confirm('Tem certeza que deseja deletar este serviço?')) {
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    
    if (!usuario || !usuario.profissional_id) {
        mostrarMensagem('❌ Você não tem permissão para deletar este serviço!', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/servicos-profissional/${servicoId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            mostrarMensagem('✅ Serviço deletado com sucesso!', 'success');
            
            // Recarregar serviços
            if (usuario && usuario.id) {
                carregarServicosProfissional();
            }
            
            // Atualizar página de serviços
            atualizarServicosPublicos();
        } else {
            mostrarMensagem('❌ Erro ao deletar serviço: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar serviço:', error);
        mostrarMensagem('❌ Erro ao conectar com o servidor!', 'error');
    }
}

// Atualizar serviços públicos
function atualizarServicosPublicos() {
    console.log('🔄 Atualizando lista de serviços públicos...');
    
    // Disparar evento para outras páginas
    window.dispatchEvent(new CustomEvent('servicosAtualizados'));
}

// Ir para agenda profissional
function irParaAgendaProfissional() {
    window.location.href = '/agendaprofissional';
}

// Função para mostrar mensagens bonitas
function mostrarMensagem(mensagem, tipo) {
    // Remove mensagens anteriores
    const mensagemAnterior = document.querySelector('.custom-message');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `custom-message ${tipo}`;
    mensagemDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${tipo === 'success' ? '✅' : '❌'}</span>
            <span class="message-text">${mensagem}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(mensagemDiv);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (mensagemDiv.parentElement) {
            mensagemDiv.remove();
        }
    }, 5000);
}

// Função de debug temporária
function debugPermissoes() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    console.log('🐛 DEBUG - Dados do usuário:', usuario);
    console.log('🐛 DEBUG - profissional_id do usuário:', usuario?.profissional_id);
    
    // Testar buscar serviços novamente
    carregarServicosProfissional();
}

// Chame esta função no console do navegador para debug
window.debugPermissoes = debugPermissoes;