document.addEventListener('DOMContentLoaded', () => {
    const btnCadastrar = document.getElementById('btnCadastrar');
    const checkboxProfissional = document.getElementById('tipoProfissional');
    const infoProfissional = document.getElementById('infoProfissional');

    // Mostrar/ocultar informações do profissional
    checkboxProfissional.addEventListener('change', function() {
        if (this.checked) {
            infoProfissional.style.display = 'block';
        } else {
            infoProfissional.style.display = 'none';
        }
    });

    btnCadastrar.addEventListener('click', async () => {
        const nome = document.getElementById('nome').value.trim();
        const idade = document.getElementById('idade').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();
        const confirmar = document.getElementById('confirmar').value.trim();
        const isProfissional = checkboxProfissional.checked;

        // Validações
        if (!nome || !idade || !telefone || !endereco || !email || !senha || !confirmar) {
            mostrarMensagem('❌ Preencha todos os campos!', 'error');
            return;
        }

        if (senha !== confirmar) {
            mostrarMensagem('❌ As senhas não coincidem!', 'error');
            return;
        }

        if (senha.length < 6) {
            mostrarMensagem('❌ A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        if (idade < 1 || idade > 120) {
            mostrarMensagem('❌ Idade inválida! Digite uma idade entre 1 e 120 anos.', 'error');
            return;
        }

        if (!validateEmail(email)) {
            mostrarMensagem('❌ Email inválido! Digite um email válido.', 'error');
            return;
        }

        const telefoneFormatado = telefone.replace(/\D/g, '');
        
        // Determinar tipo de usuário baseado na checkbox
        const tipoUsuario = isProfissional ? 'profissional' : 'cliente';

        // Loading no botão
        btnCadastrar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando...';
        btnCadastrar.disabled = true;

        try {
            const resposta = await fetch('/api/cadastrar', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    nome, 
                    idade: parseInt(idade), 
                    telefone: telefoneFormatado, 
                    endereco, 
                    email, 
                    senha,
                    tipo_usuario: tipoUsuario
                })
            });

            const dados = await resposta.json();

            if (dados.success) {
                const usuarioId = dados.userId;
                
                // Salvar informações do usuário no localStorage
                const usuarioInfo = {
                    id: usuarioId,
                    nome: nome,
                    email: email,
                    tipo_usuario: tipoUsuario,
                    isProfissional: tipoUsuario === 'profissional',
                    profissional_id: dados.profissional_id || null
                };
                localStorage.setItem('usuario', JSON.stringify(usuarioInfo));
                
                if (tipoUsuario === 'profissional') {
                    mostrarMensagem('🎉 Cadastro profissional realizado com sucesso!', 'success');
                    
                    // Redirecionar para o menu
                    setTimeout(() => {
                        window.location.href = '/menu';
                    }, 2000);
                } else {
                    mostrarMensagem('✅ Cadastro realizado com sucesso!', 'success');
                    
                    // Redirecionar para o menu
                    setTimeout(() => {
                        window.location.href = '/menu';
                    }, 1500);
                }
                
                // Limpa o formulário
                document.getElementById('nome').value = '';
                document.getElementById('idade').value = '';
                document.getElementById('telefone').value = '';
                document.getElementById('endereco').value = '';
                document.getElementById('email').value = '';
                document.getElementById('senha').value = '';
                document.getElementById('confirmar').value = '';
                checkboxProfissional.checked = false;
                infoProfissional.style.display = 'none';
                
            } else {
                let mensagemErro = dados.message || 'Erro desconhecido no cadastro';
                
                if (mensagemErro.includes('ER_DUP_ENTRY') || mensagemErro.includes('Email já cadastrado')) {
                    mensagemErro = '❌ Este email já está cadastrado! Tente fazer login ou use outro email.';
                }
                
                mostrarMensagem(mensagemErro, 'error');
            }

        } catch (erro) {
            console.error("🔴 Erro completo:", erro);
            
            let mensagemErro = "🔴 Erro ao conectar com o servidor! ";
            
            if (erro.message.includes('Failed to fetch')) {
                mensagemErro += "Servidor indisponível. Verifique se o servidor está rodando.";
            } else if (erro.message.includes('NetworkError')) {
                mensagemErro += "Problema de conexão. Verifique sua internet.";
            } else {
                mensagemErro += erro.message;
            }
            
            mostrarMensagem(mensagemErro, 'error');
        } finally {
            // Restaura botão cadastrar
            btnCadastrar.innerHTML = '📝 Cadastrar';
            btnCadastrar.disabled = false;
        }
    });

    // Enter submete o formulário
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnCadastrar.click();
        }
    });

    // Função para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Efeitos visuais nos inputs
    const inputs = document.querySelectorAll('.input-box input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.boxShadow = '0 0 10px rgba(169, 79, 119, 0.3)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
            this.parentElement.style.boxShadow = 'none';
        });
    });

    // Efeito na checkbox
    checkboxProfissional.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.style.boxShadow = '0 0 10px rgba(169, 79, 119, 0.3)';
    });
    
    checkboxProfissional.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
        this.parentElement.style.boxShadow = 'none';
    });

    console.log('✅ cadastro.js carregado com sucesso!');
});

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