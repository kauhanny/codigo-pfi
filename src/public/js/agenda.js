document.addEventListener("DOMContentLoaded", () => {
    console.log("📅 Página de Agendamento carregada!");
    
    // Elementos da página
    const nomeInput = document.getElementById("nomeCliente");
    const profissionalInput = document.getElementById("profissional");
    const servicoInput = document.getElementById("servico");
    const valorInput = document.getElementById("valorInput");
    const btnUsarPrecoOriginal = document.getElementById("btnUsarPrecoOriginal");
    const pixContainer = document.getElementById("pixContainer");
    const msgPagamento = document.getElementById("msgPagamento");
    const btnAgendar = document.getElementById("btnAgendar");
    const btnPix = document.getElementById("btnPix");
    const pixModal = document.getElementById("pixModal");
    const btnConfirmarPix = document.getElementById("btnConfirmarPix");
    const dataInput = document.getElementById("data");
    const horaInput = document.getElementById("hora");
    const listaServicos = document.getElementById("listaServicos");

    // Variáveis globais
    let servicosDoProfissional = [];
    let precoOriginal = 0;
    let valorModificado = false;

    // Preencher campos da URL se existirem
    const urlParams = new URLSearchParams(window.location.search);
    const servicoNome = urlParams.get('servico_nome');
    const profissionalNome = urlParams.get('profissional_nome');
    
    if (servicoNome) {
        servicoInput.value = decodeURIComponent(servicoNome);
    }
    if (profissionalNome) {
        profissionalInput.value = decodeURIComponent(profissionalNome);
        setTimeout(() => carregarServicosProfissional(profissionalInput.value), 500);
    }

    // Configurar data mínima para hoje
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.min = hoje;

    // Event Listeners
    profissionalInput.addEventListener("input", () => {
        const nomeProfissional = profissionalInput.value.trim();
        if (nomeProfissional) {
            carregarServicosProfissional(nomeProfissional);
        } else {
            limparServicos();
            resetarValor();
        }
    });

    servicoInput.addEventListener("input", function() {
        buscarPrecoLocal(this.value);
    });

    // Permitir edição manual do valor
    valorInput.addEventListener("input", function() {
        valorModificado = true;
        verificarCamposPreenchidos();
        
        // Mostrar botão "Usar Preço Original" se o valor for diferente do original
        if (parseFloat(this.value) !== precoOriginal && precoOriginal > 0) {
            btnUsarPrecoOriginal.style.display = 'block';
        } else {
            btnUsarPrecoOriginal.style.display = 'none';
        }
    });

    valorInput.addEventListener("focus", function() {
        this.style.borderColor = '#a94f77';
        this.style.background = 'rgba(255, 255, 255, 0.95)';
    });

    valorInput.addEventListener("blur", function() {
        if (this.value && parseFloat(this.value) > 0) {
            this.style.borderColor = '#28a745';
        } else {
            this.style.borderColor = 'rgba(160, 155, 155, 0.2)';
        }
    });

    // Botão para usar preço original
    btnUsarPrecoOriginal.addEventListener("click", function() {
        valorInput.value = precoOriginal.toFixed(2);
        valorModificado = false;
        this.style.display = 'none';
        valorInput.style.borderColor = '#28a745';
        mostrarMensagem('✅ Valor original restaurado!', 'success');
    });

    // Modal PIX
    btnPix.addEventListener("click", () => {
        if (servicoInput.value && valorInput.value && parseFloat(valorInput.value) > 0) {
            pixModal.style.display = "flex";
        } else {
            mostrarMensagem('❌ Preencha o serviço e valor primeiro!', 'error');
        }
    });

    // Confirmar pagamento PIX
    btnConfirmarPix.addEventListener("click", () => {
        pixModal.style.display = "none";
        msgPagamento.style.display = "block";
        btnAgendar.disabled = false;
        mostrarMensagem('✅ Pagamento PIX confirmado! Agora clique em "Agendar".', 'success');
    });

    // Fechar modal clicando fora
    window.addEventListener("click", (e) => {
        if (e.target === pixModal) {
            pixModal.style.display = "none";
        }
    });

    // AGENDAMENTO
    document.getElementById("formAgendamento").addEventListener("submit", async (e) => {
        e.preventDefault();

        const nomeCliente = nomeInput.value.trim();
        const profissional = profissionalInput.value.trim();
        const servico = servicoInput.value.trim();
        const valor = parseFloat(valorInput.value);
        const data = dataInput.value;
        const hora = horaInput.value;

        // Validações
        if (!nomeCliente || !profissional || !servico || !valor || !data || !hora) {
            mostrarMensagem('❌ Preencha todos os campos!', 'error');
            return;
        }

        if (valor <= 0) {
            mostrarMensagem('❌ O valor deve ser maior que zero!', 'error');
            return;
        }

        if (msgPagamento.style.display === "none") {
            mostrarMensagem('❌ Confirme o pagamento PIX primeiro!', 'error');
            return;
        }

        try {
            btnAgendar.innerHTML = 'Agendando...';
            btnAgendar.disabled = true;

            console.log('📤 Enviando agendamento:', {
                nome_cliente: nomeCliente,
                profissional_nome: profissional,
                servico_nome: servico,
                valor: valor,
                data: data,
                hora: hora
            });

            // Simular envio para API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Criar novo agendamento
            const novoAgendamento = {
                id: Date.now(), // ID único baseado no timestamp
                servico: servico,
                profissional: profissional,
                data: data,
                hora: hora,
                valor: valor,
                status: 'pending',
                duracao: calcularDuracao(servico),
                dataCriacao: new Date().toISOString()
            };

            // SALVAR NO LOCALSTORAGE
            salvarAgendamentoNoLocalStorage(novoAgendamento);

            const valorFormatado = valor.toFixed(2);
            mostrarMensagem(`✅ Agendamento realizado com sucesso! Valor: R$ ${valorFormatado}`, 'success');
            
            // Redirecionar para Minha Agenda após 2 segundos
            setTimeout(() => {
                window.location.href = '/minhaagenda';
            }, 2000);
            
        } catch (erro) {
            console.error("❌ Erro completo:", erro);
            mostrarMensagem("🔴 Erro ao realizar agendamento!", 'error');
            btnAgendar.innerHTML = 'Agendar';
            btnAgendar.disabled = false;
        }
    });

    // FUNÇÃO: Salvar agendamento no localStorage
    function salvarAgendamentoNoLocalStorage(novoAgendamento) {
        try {
            // Buscar agendamentos existentes
            const agendamentosExistentes = JSON.parse(localStorage.getItem('meusAgendamentos') || '[]');
            
            // Adicionar novo agendamento
            agendamentosExistentes.push(novoAgendamento);
            
            // Salvar no localStorage
            localStorage.setItem('meusAgendamentos', JSON.stringify(agendamentosExistentes));
            
            console.log('💾 Agendamento salvo no localStorage:', novoAgendamento);
            console.log(`📊 Total de agendamentos: ${agendamentosExistentes.length}`);
            
        } catch (error) {
            console.error('❌ Erro ao salvar no localStorage:', error);
        }
    }

    // FUNÇÃO: Calcular duração baseada no serviço
    function calcularDuracao(servico) {
        const duracaoMap = {
            'corte': '45min',
            'corte e escova': '1h30min',
            'coloração': '2h30min',
            'manicure': '1h',
            'pedicure': '1h',
            'manicure e pedicure': '1h30min',
            'progressiva': '2h',
            'escova': '1h',
            'relaxamento': '2h',
            'botox': '2h30min'
        };

        const servicoLower = servico.toLowerCase();
        for (const [key, value] of Object.entries(duracaoMap)) {
            if (servicoLower.includes(key)) {
                return value;
            }
        }
        
        return '2h'; // Duração padrão
    }

    // FUNÇÃO: Carregar serviços do profissional
    async function carregarServicosProfissional(nomeProfissional) {
        try {
            console.log(`🔍 Carregando serviços para: ${nomeProfissional}`);
            
            const response = await fetch(`/api/servicos-por-profissional/${encodeURIComponent(nomeProfissional)}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📨 Serviços encontrados:', result);

            if (result.success) {
                servicosDoProfissional = result.servicos;
                atualizarListaServicos();
                console.log(`✅ ${servicosDoProfissional.length} serviços carregados`);
            } else {
                console.log('❌ Nenhum serviço encontrado');
                servicosDoProfissional = [];
                limparServicos();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar serviços:', error);
            servicosDoProfissional = [];
            limparServicos();
        }
    }

    // FUNÇÃO: Atualizar lista de serviços no datalist
    function atualizarListaServicos() {
        listaServicos.innerHTML = '';
        servicosDoProfissional.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.nome_servico;
            option.dataset.preco = servico.preco;
            listaServicos.appendChild(option);
        });
    }

    // FUNÇÃO: Buscar preço localmente e preencher automaticamente
    function buscarPrecoLocal(servicoNome) {
        const servicoDigitado = servicoNome.trim();
        
        if (servicoDigitado && servicosDoProfissional.length > 0) {
            // Encontrar o serviço que mais se parece com o digitado
            const servicoEncontrado = servicosDoProfissional.find(s => 
                s.nome_servico.toLowerCase().includes(servicoDigitado.toLowerCase())
            );
            
            if (servicoEncontrado) {
                precoOriginal = parseFloat(servicoEncontrado.preco);
                
                // Só preenche automaticamente se o usuário não tiver editado manualmente
                if (!valorModificado) {
                    valorInput.value = precoOriginal.toFixed(2);
                    valorInput.style.borderColor = '#28a745';
                    valorInput.style.background = 'rgba(40, 167, 69, 0.1)';
                }
                
                // Auto-completar o nome exato do serviço
                if (servicoInput.value !== servicoEncontrado.nome_servico) {
                    servicoInput.value = servicoEncontrado.nome_servico;
                }
                
                // Mostrar botão PIX
                pixContainer.style.display = "block";
                verificarCamposPreenchidos();
                
            } else {
                resetarValor();
                pixContainer.style.display = "none";
            }
        } else {
            resetarValor();
            pixContainer.style.display = "none";
        }
    }

    // FUNÇÃO: Verificar se todos os campos estão preenchidos
    function verificarCamposPreenchidos() {
        const nomePreenchido = nomeInput.value.trim();
        const profissionalPreenchido = profissionalInput.value.trim();
        const servicoPreenchido = servicoInput.value.trim();
        const valorPreenchido = valorInput.value && parseFloat(valorInput.value) > 0;
        const dataPreenchida = dataInput.value;
        const horaPreenchida = horaInput.value;

        // Habilita o PIX se serviço e valor estiverem preenchidos
        if (servicoPreenchido && valorPreenchido) {
            pixContainer.style.display = "block";
        } else {
            pixContainer.style.display = "none";
        }

        // Desabilita o agendamento até o PIX ser confirmado
        btnAgendar.disabled = msgPagamento.style.display === "none";
    }

    // FUNÇÃO: Resetar valor
    function resetarValor() {
        if (!valorModificado) {
            valorInput.value = '';
            valorInput.style.borderColor = 'rgba(160, 155, 155, 0.2)';
            valorInput.style.background = 'rgba(255, 255, 255, 0.8)';
        }
        precoOriginal = 0;
        btnUsarPrecoOriginal.style.display = 'none';
    }

    // FUNÇÃO: Limpar serviços
    function limparServicos() {
        listaServicos.innerHTML = '';
        servicosDoProfissional = [];
        resetarValor();
    }

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

    // Adicionar event listeners para os outros campos
    nomeInput.addEventListener("input", verificarCamposPreenchidos);
    dataInput.addEventListener("input", verificarCamposPreenchidos);
    horaInput.addEventListener("input", verificarCamposPreenchidos);
});


