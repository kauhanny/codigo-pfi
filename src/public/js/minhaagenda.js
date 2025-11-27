document.addEventListener("DOMContentLoaded", () => {
    console.log("📅 Página Minha Agenda carregada!");
    
    // Elementos da página
    const agendamentosList = document.getElementById('agendamentos-list');
    const noAgendamentos = document.getElementById('no-agendamentos');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Estatísticas
    const totalAgendamentos = document.getElementById('total-agendamentos');
    const proximosAgendamentos = document.getElementById('proximos-agendamentos');
    const realizadosAgendamentos = document.getElementById('realizados-agendamentos');

    let todosAgendamentos = [];
    let filtroAtual = 'all';

    // Carregar agendamentos
    carregarAgendamentos();

    // Configurar filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            filterBtns.forEach(b => b.classList.remove('active'));
            // Adiciona active no clicado
            btn.classList.add('active');
            
            filtroAtual = btn.dataset.filter;
            filtrarAgendamentos();
        });
    });

    function carregarAgendamentos() {
        try {
            console.log('🔄 Carregando agendamentos do localStorage...');
            
            // Mostrar loading
            agendamentosList.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando seus agendamentos...</p>
                </div>
            `;

            // Buscar agendamentos do localStorage
            const agendamentosSalvos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
            
            console.log(`📊 ${agendamentosSalvos.length} agendamentos encontrados no localStorage`);

            // Ordenar por data (mais recentes primeiro)
            agendamentosSalvos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

            // Adicionar alguns agendamentos de exemplo se não houver nenhum
            if (agendamentosSalvos.length === 0) {
                console.log('📝 Nenhum agendamento encontrado, adicionando exemplos...');
                adicionarAgendamentosExemplo();
                // Recarregar após adicionar exemplos
                setTimeout(() => {
                    carregarAgendamentos();
                }, 500);
                return;
            }

            todosAgendamentos = agendamentosSalvos;
            atualizarEstatisticas();
            filtrarAgendamentos();
            atualizarHistoricoServicos();
            
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            agendamentosList.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Erro ao carregar agendamentos</h3>
                    <p>Tente recarregar a página</p>
                    <button onclick="carregarAgendamentos()" class="btn-primary">🔄 Tentar Novamente</button>
                </div>
            `;
        }
    }

    // FUNÇÃO: Adicionar agendamentos de exemplo
    function adicionarAgendamentosExemplo() {
        const agendamentosExemplo = [
            {
                id: 1,
                servico: "Corte e Escova",
                profissional: "Ana Silva",
                data: "2024-11-20",
                hora: "14:00",
                valor: 80.00,
                status: "pending",
                duracao: "1h30min",
                dataCriacao: "2024-01-15T10:00:00"
            },
            {
                id: 2,
                servico: "Coloração Completa",
                profissional: "Maria Santos",
                data: "2024-11-15",
                hora: "10:00",
                valor: 120.00,
                status: "completed",
                duracao: "2h30min",
                dataCriacao: "2024-01-10T09:30:00"
            }
        ];

        localStorage.setItem('meusAgendamentos', JSON.stringify(agendamentosExemplo));
        console.log('✅ Agendamentos de exemplo adicionados');
    }

    function atualizarEstatisticas() {
        const total = todosAgendamentos.length;
        const proximos = todosAgendamentos.filter(a => a.status === 'pending').length;
        const realizados = todosAgendamentos.filter(a => a.status === 'completed').length;

        totalAgendamentos.textContent = total;
        proximosAgendamentos.textContent = proximos;
        realizadosAgendamentos.textContent = realizados;
    }

    function filtrarAgendamentos() {
        let agendamentosFiltrados = todosAgendamentos;

        if (filtroAtual !== 'all') {
            agendamentosFiltrados = todosAgendamentos.filter(a => a.status === filtroAtual);
        }

        exibirAgendamentos(agendamentosFiltrados);
    }

    function exibirAgendamentos(agendamentos) {
        if (agendamentos.length === 0) {
            agendamentosList.style.display = 'none';
            noAgendamentos.style.display = 'block';
            return;
        }

        noAgendamentos.style.display = 'none';
        agendamentosList.style.display = 'block';

        agendamentosList.innerHTML = agendamentos.map(agendamento => `
            <div class="agendamento-card" data-status="${agendamento.status}">
                <div class="agendamento-header">
                    <div class="agendamento-servico">${agendamento.servico}</div>
                    <div class="agendamento-status status-${agendamento.status}">
                        ${getStatusText(agendamento.status)}
                    </div>
                </div>
                
                <div class="agendamento-details">
                    <div class="detail-item">
                        <span class="detail-label">👩‍💼 Profissional</span>
                        <span class="detail-value">${agendamento.profissional}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📅 Data</span>
                        <span class="detail-value">${formatarData(agendamento.data)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏰ Horário</span>
                        <span class="detail-value">${agendamento.hora}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⏱️ Duração</span>
                        <span class="detail-value">${agendamento.duracao}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">💰 Valor</span>
                        <span class="detail-value">R$ ${agendamento.valor.toFixed(2)}</span>
                    </div>
                </div>

                ${agendamento.status === 'pending' ? `
                <div class="agendamento-actions">
                    <button class="btn btn-cancel" onclick="cancelarAgendamento(${agendamento.id})">
                        ❌ Cancelar
                    </button>
                    <button class="btn btn-reschedule" onclick="reagendar(${agendamento.id})">
                        🔄 Reagendar
                    </button>
                </div>
                ` : ''}
            </div>
        `).join('');
    }

    function getStatusText(status) {
        const statusMap = {
            'pending': 'Agendado',
            'completed': 'Realizado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    function formatarData(dataString) {
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    }

    // Atualizar histórico de serviços
    function atualizarHistoricoServicos() {
        const servicosStats = {};
        
        // Contar serviços realizados
        todosAgendamentos.forEach(agendamento => {
            if (agendamento.status === 'completed') {
                if (!servicosStats[agendamento.servico]) {
                    servicosStats[agendamento.servico] = 0;
                }
                servicosStats[agendamento.servico]++;
            }
        });

        // Atualizar a seção de histórico
        const servicosStatsContainer = document.querySelector('.servicos-stats');
        if (servicosStatsContainer) {
            // Serviços padrão para demonstração (apenas se não houver dados reais)
            const servicosPadrao = {
                "Corte de Cabelo": 0,
                "Coloração": 0,
                "Manicure": 0,
                "Pedicure": 0
            };

            // Combinar com dados reais
            const todosServicos = { ...servicosPadrao, ...servicosStats };
            
            // Filtrar apenas serviços que foram realizados pelo menos uma vez
            const servicosRealizados = Object.entries(todosServicos)
                .filter(([servico, count]) => count > 0)
                .reduce((acc, [servico, count]) => {
                    acc[servico] = count;
                    return acc;
                }, {});

            // Se não há serviços realizados, mostrar mensagem
            if (Object.keys(servicosRealizados).length === 0) {
                servicosStatsContainer.innerHTML = `
                    <div class="servico-stat">
                        <span class="servico-name">Nenhum serviço realizado ainda</span>
                        <span class="servico-count">0 vezes</span>
                    </div>
                `;
            } else {
                servicosStatsContainer.innerHTML = Object.entries(servicosRealizados)
                    .map(([servico, count]) => `
                        <div class="servico-stat">
                            <span class="servico-name">${servico}</span>
                            <span class="servico-count">${count} vez${count !== 1 ? 'es' : ''}</span>
                        </div>
                    `).join('');
            }
        }
    }

    // Funções globais para os botões
    window.cancelarAgendamento = function(id) {
        if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
            console.log(`Cancelando agendamento ${id}`);
            
            // Atualizar status localmente
            const agendamentoIndex = todosAgendamentos.findIndex(a => a.id === id);
            if (agendamentoIndex !== -1) {
                todosAgendamentos[agendamentoIndex].status = 'cancelled';
                
                // Atualizar localStorage
                localStorage.setItem('meusAgendamentos', JSON.stringify(todosAgendamentos));
                
                mostrarMensagem('✅ Agendamento cancelado com sucesso!', 'success');
                atualizarEstatisticas();
                filtrarAgendamentos();
            }
        }
    };

    window.reagendar = function(id) {
        console.log(`Reagendando ${id}`);
        // Buscar dados do agendamento
        const agendamento = todosAgendamentos.find(a => a.id === id);
        if (agendamento) {
            // Redirecionar para a página de agendamento com os dados pré-preenchidos
            const params = new URLSearchParams({
                servico_nome: encodeURIComponent(agendamento.servico),
                profissional_nome: encodeURIComponent(agendamento.profissional)
            });
            window.location.href = `/agenda?${params.toString()}`;
        } else {
            window.location.href = '/agenda';
        }
    };

    // FUNÇÃO: Mostrar mensagens
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

    // Botão para limpar todos os agendamentos (apenas para desenvolvimento)
    window.limparAgendamentos = function() {
        if (confirm('Tem certeza que deseja limpar TODOS os agendamentos? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('meusAgendamentos');
            mostrarMensagem('🗑️ Todos os agendamentos foram removidos!', 'success');
            setTimeout(() => {
                location.reload();
            }, 1500);
        }
    };
});