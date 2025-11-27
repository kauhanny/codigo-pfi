document.addEventListener("DOMContentLoaded", () => {
    console.log("💼 Página de Serviços carregada!");
    carregarServicosPublicos();
    verificarEExibirLixeiraProfissional();
});

// ========== SISTEMA DE AVALIAÇÕES ==========

// Função para carregar e exibir avaliações nos serviços
async function carregarAvaliacoesNosServicos(servicos) {
    console.log('⭐ Carregando avaliações para os serviços...');
    
    // Para cada serviço, buscar as avaliações do profissional
    for (let servico of servicos) {
        try {
            //  usa profissional_id em vez do nome
            const response = await fetch(`/api/avaliacoes-media/${encodeURIComponent(servico.nome_profissional)}`);
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    servico.avaliacoes = {
                        total: result.total_avaliacoes,
                        media: result.media_nota,
                        ultima: result.ultima_avaliacao
                    };
                    console.log(`✅ Avaliações carregadas para ${servico.nome_profissional}: ${result.media_nota} ⭐`);
                }
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar avaliações para ${servico.nome_profissional}:`, error);
        }
    }
    
    return servicos;
}

// Função para criar HTML das estrelas
function criarEstrelasAvaliacao(media, totalAvaliacoes) {
    const nota = parseFloat(media) || 0;
    const estrelasCheias = Math.floor(nota);
    const temMeiaEstrela = nota % 1 >= 0.5;
    const estrelasVazias = 5 - estrelasCheias - (temMeiaEstrela ? 1 : 0);
    
    let html = '<div class="avaliacao-estrelas">';
    
    // Estrelas cheias
    for (let i = 0; i < estrelasCheias; i++) {
        html += '<i class="fas fa-star estrela-cheia"></i>';
    }
    
    // Meia estrela
    if (temMeiaEstrela) {
        html += '<i class="fas fa-star-half-alt estrela-meia"></i>';
    }
    
    // Estrelas vazias
    for (let i = 0; i < estrelasVazias; i++) {
        html += '<i class="far fa-star estrela-vazia"></i>';
    }
    
    // Texto com a média e quantidade
    html += `<span class="avaliacao-texto">${nota.toFixed(1)} (${totalAvaliacoes || 0})</span>`;
    html += '</div>';
    
    return html;
}

// ========== FUNÇÕES PRINCIPAIS ==========

// Carregar serviços públicos
async function carregarServicosPublicos() {
    try {
        console.log('🌐 Buscando serviços públicos...');
        const response = await fetch('/api/servicos-publicos');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📨 Resposta da API:', result);

        if (result.success) {
            exibirServicosPublicos(result.servicos);
        } else {
            console.error('❌ Erro ao carregar serviços:', result.message);
            mostrarErro('Erro ao carregar serviços: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar serviços:', error);
        mostrarErro('Erro de conexão. Verifique sua internet e tente novamente.');
    }
}

// Verificar se é profissional e exibir lixeira
async function verificarEExibirLixeiraProfissional() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    console.log('👤 Verificando usuário:', usuario);
    
    if (usuario && usuario.tipo_usuario === 'profissional' && usuario.profissional_id) {
        console.log('✅ Usuário é profissional, exibindo lixeira...');
        document.getElementById('lixeiraProfissional').style.display = 'block';
        await carregarServicosDoProfissional(usuario.profissional_id);
    } else {
        console.log('❌ Usuário não é profissional ou não tem profissional_id');
        document.getElementById('lixeiraProfissional').style.display = 'none';
    }
}

// Carregar serviços do profissional específico
async function carregarServicosDoProfissional(profissional_id) {
    try {
        console.log(`🔍 Buscando serviços do profissional ${profissional_id}...`);
        
        const response = await fetch(`/api/servicos-profissional/${profissional_id}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📨 Serviços do profissional:', result);

        if (result.success) {
            exibirServicosDoProfissional(result.servicos);
        } else {
            document.getElementById('servicosProfissionalContainer').innerHTML = `
                <div class="empty-state" style="padding: 30px; text-align: center;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #6c757d; margin-bottom: 15px;"></i>
                    <p style="color: #6c757d;">Erro ao carregar seus serviços</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar serviços do profissional:', error);
        document.getElementById('servicosProfissionalContainer').innerHTML = `
            <div class="empty-state" style="padding: 30px; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 15px;"></i>
                <p style="color: #dc3545;">Erro de conexão ao carregar serviços</p>
            </div>
        `;
    }
}

// Exibir serviços públicos (todos os serviços) COM AVALIAÇÕES
async function exibirServicosPublicos(servicos) {
    const container = document.getElementById('servicosContainer');
    
    console.log(`📊 Exibindo ${servicos.length} serviços públicos`);
    
    if (!servicos || servicos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cut"></i>
                <h3>Nenhum serviço disponível</h3>
                <p>Os profissionais ainda não cadastraram serviços.</p>
                <p><small>Se você é um profissional, cadastre seus serviços no <a href="/perfilprofissional" style="color: #a94f77;">Perfil Profissional</a></small></p>
            </div>
        `;
        return;
    }

    // Carregar avaliações antes de exibir
    const servicosComAvaliacoes = await carregarAvaliacoesNosServicos(servicos);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const html = servicosComAvaliacoes.map(servico => {
        const avaliacaoHTML = servico.avaliacoes ? 
            criarEstrelasAvaliacao(servico.avaliacoes.media, servico.avaliacoes.total) : 
            '<div class="avaliacao-estrelas"><span class="sem-avaliacao">Sem avaliações</span></div>';
        
        return `
        <div class="servico-card">
            <div class="servico-imagem">
                <img src="${servico.foto_servico || '../img/servico-default.jpg'}" 
                     alt="${servico.nome_servico}" 
                     onerror="this.src='../img/servico-default.jpg'">
            </div>
            <div class="servico-info">
                <h3 class="servico-nome">${servico.nome_servico || 'Serviço'}</h3>
                <p class="servico-descricao">${servico.descricao || 'Descrição não disponível'}</p>
                
                <!-- AVALIAÇÃO ADICIONADA AQUI -->
                <div class="servico-avaliacao">
                    ${avaliacaoHTML}
                </div>
                
                <div class="servico-detalhes">
                    <span class="servico-categoria">${obterIconeCategoria(servico.categoria)} ${formatarCategoria(servico.categoria)}</span>
                    <span class="servico-duracao">⏱️ ${servico.duracao_minutos || 0}min</span>
                </div>
                <div class="servico-profissional">
                    <i class="fas fa-user"></i>
                    <span>${servico.nome_profissional || 'Profissional'}</span>
                </div>
                <div class="servico-preco">
                    R$ ${servico.preco ? parseFloat(servico.preco).toFixed(2) : '0.00'}
                </div>
                <button class="btn-agendar" onclick="agendarServico('${servico.nome_servico}', '${servico.nome_profissional}')">
                    Agendar Agora
                </button>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Exibir serviços do profissional na lixeira
function exibirServicosDoProfissional(servicos) {
    const container = document.getElementById('servicosProfissionalContainer');
    
    if (!servicos || servicos.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center;">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #a94f77; margin-bottom: 15px;"></i>
                <h4 style="color: #495057; margin-bottom: 10px;">Nenhum serviço cadastrado</h4>
                <p style="color: #6c757d; margin-bottom: 20px;">Você ainda não cadastrou nenhum serviço.</p>
                <button onclick="window.location.href='/perfilprofissional'" 
                        style="background: #a94f77; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 600;">
                    📝 Cadastrar Primeiro Serviço
                </button>
            </div>
        `;
        return;
    }

    const html = servicos.map(servico => `
        <div class="servico-item-profissional" 
             style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e9ecef;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <strong style="color: #495057; font-size: 1.1rem;">${servico.nome_servico}</strong>
                    <span style="background: #a94f77; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                        R$ ${parseFloat(servico.preco).toFixed(2)}
                    </span>
                </div>
                <div style="color: #6c757d; font-size: 0.9rem;">
                    <span>⏱️ ${servico.duracao_minutos}min</span>
                    <span style="margin: 0 10px;">•</span>
                    <span>${formatarCategoria(servico.categoria)}</span>
                </div>
                ${servico.descricao ? `
                <div style="color: #6c757d; font-size: 0.85rem; margin-top: 5px; font-style: italic;">
                    "${servico.descricao}"
                </div>
                ` : ''}
            </div>
            <button class="btn-deletar-servico" 
                    onclick="deletarServicoDaLista(${servico.id})" 
                    title="Deletar serviço"
                    style="background: #dc3545; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: all 0.3s ease;">
                🗑️
            </button>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Deletar serviço 
async function deletarServicoDaLista(servicoId) {
    console.log(`🗑️  Tentando deletar serviço ${servicoId}`);
    
    if (!confirm('Tem certeza que deseja deletar este serviço?\nEsta ação não pode ser desfeita.')) {
        return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    console.log('👤 Verificando permissões:', usuario);

    // Verificar se o usuário está logado e é um profissional
    if (!usuario || !usuario.id || !usuario.profissional_id) {
        mostrarMensagem('❌ Você precisa estar logado como profissional para deletar serviços!', 'error');
        return;
    }

    try {
        console.log(`🗑️  Enviando requisição para deletar serviço ${servicoId}`);
        
        const response = await fetch(`/api/servicos-profissional/${servicoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('📨 Resposta do servidor:', result);

        if (result.success) {
            mostrarMensagem('✅ Serviço deletado com sucesso!', 'success');
            // Recarregar ambos: serviços públicos e serviços do profissional
            setTimeout(() => {
                carregarServicosPublicos();
                carregarServicosDoProfissional(usuario.profissional_id);
            }, 1000);
        } else {
            mostrarMensagem('❌ Erro ao deletar serviço: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao deletar serviço:', error);
        mostrarMensagem('❌ Erro ao conectar com o servidor!', 'error');
    }
}

// Agendar serviço
function agendarServico(servicoNome, profissionalNome) {
    // Verificar se usuário está logado
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!usuario || !usuario.id) {
        mostrarMensagem('❌ Você precisa estar logado para agendar um serviço!', 'error');
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
        return;
    }
    
    // Redirecionar para página de agendamento com dados do serviço
    window.location.href = `/agenda?servico_nome=${encodeURIComponent(servicoNome)}&profissional_nome=${encodeURIComponent(profissionalNome)}`;
}

// Mostrar erro
function mostrarErro(mensagem) {
    const container = document.getElementById('servicosContainer');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro ao carregar serviços</h3>
            <p>${mensagem}</p>
            <button onclick="carregarServicosPublicos()" style="
                background: #a94f77;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">
                Tentar Novamente
            </button>
        </div>
    `;
}

// Obter ícone da categoria
function obterIconeCategoria(categoria) {
    const icones = {
        'cabelo': '💇',
        'unhas': '💅',
        'estetica': '✨',
        'corporal': '🏃',
        'maquiagem': '💄',
        'outros': '🌟'
    };
    return icones[categoria] || '🌟';
}

// Formatar categoria
function formatarCategoria(categoria) {
    const categorias = {
        'cabelo': 'Cabelo',
        'unhas': 'Unhas',
        'estetica': 'Estética Facial',
        'corporal': 'Estética Corporal',
        'maquiagem': 'Maquiagem',
        'outros': 'Outros'
    };
    return categorias[categoria] || categoria;
}

// Função para mostrar mensagens
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

    setTimeout(() => {
        if (mensagemDiv.parentElement) {
            mensagemDiv.remove();
        }
    }, 5000);
}

// Atualizar lista quando serviços forem adicionados
window.addEventListener('servicosAtualizados', () => {
    console.log('🔄 Atualizando lista de serviços...');
    carregarServicosPublicos();
    verificarEExibirLixeiraProfissional();
});