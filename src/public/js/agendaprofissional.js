document.addEventListener("DOMContentLoaded", () => {
    console.log("📊 Agenda Profissional carregada!");
    
    // Inicializar a agenda profissional
    inicializarAgendaProfissional();
});

// Função principal de inicialização
function inicializarAgendaProfissional() {
    carregarEstatisticas();
    carregarCalendarioSemanal();
    carregarAgendamentos();
    carregarProximosAgendamentos();
    
    // Configurar atualização automática
    configurarAtualizacaoAutomatica();
}

// Carregar estatísticas
function carregarEstatisticas() {
    try {
        // Buscar agendamentos do localStorage
        const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
        
        // Contar agendamentos de hoje
        const hoje = new Date().toISOString().split('T')[0];
        const agendamentosHoje = todosAgendamentos.filter(agendamento => 
            agendamento.data === hoje && agendamento.status === 'pending'
        ).length;
        
        document.getElementById('agendamentosHoje').textContent = agendamentosHoje;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('agendamentosHoje').textContent = '0';
    }
}

// Carregar calendário semanal
function carregarCalendarioSemanal() {
    const calendario = document.getElementById('calendarioSemanal');
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const hoje = new Date();
    const semana = [];
    
    // Gerar próxima semana
    for (let i = 0; i < 7; i++) {
        const data = new Date();
        data.setDate(hoje.getDate() + i);
        semana.push(data);
    }
    
    // Buscar agendamentos do localStorage
    const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
    
    const html = semana.map((data, index) => {
        const diaNome = diasSemana[data.getDay()];
        const diaNumero = data.getDate();
        const isHoje = index === 0;
        
        // Formatar data para comparação (YYYY-MM-DD)
        const dataFormatada = data.toISOString().split('T')[0];
        
        // Contar agendamentos para este dia
        const agendamentosDia = todosAgendamentos.filter(agendamento => 
            agendamento.data === dataFormatada && agendamento.status === 'pending'
        ).length;
        
        const isOcupado = agendamentosDia > 0;
        
        return `
            <div class="dia-semana ${isHoje ? 'hoje' : ''} ${isOcupado ? 'ocupado' : 'disponivel'}">
                <div class="dia-nome">${diaNome}</div>
                <div class="dia-numero">${diaNumero}</div>
                <div class="dia-status">
                    ${isOcupado ? '🔴 ' + agendamentosDia + ' agendado(s)' : '🟢 Disponível'}
                </div>
            </div>
        `;
    }).join('');
    
    calendario.innerHTML = html;
}

// Carregar agendamentos do localStorage
function carregarAgendamentos() {
    try {
        const lista = document.getElementById('agendamentosLista');
        
        // Buscar agendamentos do localStorage
        const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
        
        // Ordenar por data e hora (mais próximos primeiro)
        const agendamentosOrdenados = todosAgendamentos
            .filter(agendamento => agendamento.status === 'pending')
            .sort((a, b) => {
                const dataA = new Date(a.data + 'T' + a.hora);
                const dataB = new Date(b.data + 'T' + b.hora);
                return dataA - dataB;
            });
        
        if (agendamentosOrdenados.length > 0) {
            const html = agendamentosOrdenados.map(agendamento => `
                <div class="agendamento-item" data-id="${agendamento.id}">
                    <div class="agendamento-info">
                        <h4>${agendamento.servico}</h4>
                        <p><strong>Cliente:</strong> ${agendamento.nomeCliente || 'Cliente'}</p>
                        <p><strong>Data:</strong> ${formatarData(agendamento.data)} às ${agendamento.hora}</p>
                        <p><strong>Duração:</strong> ${agendamento.duracao}</p>
                        <p><strong>Valor:</strong> R$ ${agendamento.valor.toFixed(2)}</p>
                    </div>
                    <div class="agendamento-direita">
                        <div class="agendamento-status status-confirmado">
                            ✅ Agendado
                        </div>
                        <div class="agendamento-acoes">
                            <button class="btn-confirmar" onclick="confirmarAgendamento(${agendamento.id})">
                                ✅ Confirmar
                            </button>
                            <button class="btn-cancelar" onclick="cancelarAgendamentoProfissional(${agendamento.id})">
                                ❌ Cancelar
                            </button>
                            <button class="btn-finalizar" onclick="finalizarAgendamento(${agendamento.id})">
                                🏁 Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            lista.innerHTML = html;
        } else {
            mostrarAgendamentosDemonstracao();
        }
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        mostrarAgendamentosDemonstracao();
    }
}

// Mostrar agendamentos de demonstração (apenas se não houver agendamentos reais)
function mostrarAgendamentosDemonstracao() {
    const lista = document.getElementById('agendamentosLista');
    
    // Verificar se realmente não há agendamentos
    const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
    
    if (todosAgendamentos.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>Nenhum agendamento encontrado</h3>
                <p>Quando clientes agendarem serviços com você, eles aparecerão aqui automaticamente.</p>
                <p><strong>Dica:</strong> Compartilhe seu perfil com clientes para receber mais agendamentos!</p>
            </div>
        `;
    } else {
        // Se há agendamentos mas nenhum pendente
        lista.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <h3>Todos os agendamentos foram processados</h3>
                <p>Você não tem agendamentos pendentes no momento.</p>
                <p>Novos agendamentos aparecerão aqui automaticamente.</p>
            </div>
        `;
    }
}

// Carregar próximos agendamentos
function carregarProximosAgendamentos() {
    const container = document.getElementById('proximosAgendamentos');
    
    try {
        // Buscar agendamentos do localStorage
        const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
        
        // Filtrar próximos agendamentos (próximos 3 dias)
        const hoje = new Date();
        const tresDias = new Date();
        tresDias.setDate(hoje.getDate() + 3);
        
        const proximosAgendamentos = todosAgendamentos
            .filter(agendamento => {
                const dataAgendamento = new Date(agendamento.data);
                return dataAgendamento >= hoje && 
                       dataAgendamento <= tresDias && 
                       agendamento.status === 'pending';
            })
            .sort((a, b) => {
                const dataA = new Date(a.data + 'T' + a.hora);
                const dataB = new Date(b.data + 'T' + b.hora);
                return dataA - dataB;
            })
            .slice(0, 3); // Apenas os 3 próximos
        
        if (proximosAgendamentos.length > 0) {
            const html = proximosAgendamentos.map(agendamento => `
                <div class="proximo-agendamento">
                    <div class="proximo-info">
                        <h4>${agendamento.servico}</h4>
                        <p>${agendamento.nomeCliente || 'Cliente'}</p>
                        <small>${formatarData(agendamento.data)} - ${agendamento.hora}</small>
                    </div>
                    <div class="proximo-horario">${agendamento.duracao}</div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="empty-state-small">
                    <p>Nenhum agendamento próximo</p>
                    <small>Novos agendamentos aparecerão aqui</small>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar próximos agendamentos:', error);
        container.innerHTML = `
            <div class="empty-state-small">
                <p>Erro ao carregar agendamentos</p>
            </div>
        `;
    }
}

// ================== FUNÇÕES DE AÇÃO ==================

// Confirmar agendamento
function confirmarAgendamento(id) {
    if (confirm('Confirmar este agendamento?')) {
        atualizarStatusAgendamento(id, 'confirmed');
        mostrarMensagem('✅ Agendamento confirmado com sucesso!', 'success');
    }
}

// Cancelar agendamento (pela profissional)
function cancelarAgendamentoProfissional(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        atualizarStatusAgendamento(id, 'cancelled');
        mostrarMensagem('✅ Agendamento cancelado!', 'success');
    }
}

// Finalizar agendamento
function finalizarAgendamento(id) {
    if (confirm('Marcar este serviço como finalizado?')) {
        atualizarStatusAgendamento(id, 'completed');
        mostrarMensagem('✅ Serviço finalizado com sucesso!', 'success');
    }
}

// Atualizar status do agendamento no localStorage
function atualizarStatusAgendamento(id, novoStatus) {
    try {
        const todosAgendamentos = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
        const agendamentoIndex = todosAgendamentos.findIndex(a => a.id === id);
        
        if (agendamentoIndex !== -1) {
            todosAgendamentos[agendamentoIndex].status = novoStatus;
            localStorage.setItem('meusAgendamentos', JSON.stringify(todosAgendamentos));
            
            // Recarregar todas as seções
            recarregarTodasAsSecoes();
        }
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        mostrarMensagem('❌ Erro ao atualizar agendamento', 'error');
    }
}

// ================== FUNÇÕES AUXILIARES ==================

// Recarregar todas as seções
function recarregarTodasAsSecoes() {
    carregarEstatisticas();
    carregarCalendarioSemanal();
    carregarAgendamentos();
    carregarProximosAgendamentos();
}

// Configurar atualização automática
function configurarAtualizacaoAutomatica() {
    // Atualizar a cada 30 segundos
    setInterval(() => {
        carregarEstatisticas();
        carregarAgendamentos();
        carregarProximosAgendamentos();
    }, 30000);
}

// Função auxiliar para formatar data
function formatarData(dataString) {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
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

// ================== FUNÇÕES GLOBAIS ==================

// Função para forçar atualização (disponível globalmente)
window.recarregarAgendamentos = function() {
    recarregarTodasAsSecoes();
    mostrarMensagem('🔄 Agendamentos atualizados!', 'success');
};

// Função para limpar todos os agendamentos (apenas desenvolvimento)
window.limparAgendamentosProfissional = function() {
    if (confirm('Tem certeza que deseja limpar TODOS os agendamentos? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('meusAgendamentos');
        mostrarMensagem('🗑️ Todos os agendamentos foram removidos!', 'success');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
};