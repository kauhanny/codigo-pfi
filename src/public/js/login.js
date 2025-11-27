document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Página de login carregada!');
    
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();

        console.log('🔄 Tentando login com:', { email, senha });

        if (!email || !senha) {
            mostrarMensagem('❌ Preencha todos os campos!', 'error');
            return;
        }

        // Loading no botão
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';
        submitBtn.disabled = true;

        try {
            console.log('📤 Enviando requisição para /api/login...');
            
            const resposta = await fetch('/api/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha })
            });

            console.log('📥 Resposta recebida, status:', resposta.status);
            
            const dados = await resposta.json();
            console.log('📊 Dados da resposta:', dados);

            if (dados.success) {
                // Salvar informações do usuário no localStorage
                if (dados.usuario) {
                    localStorage.setItem('usuario', JSON.stringify(dados.usuario));
                    console.log('💾 Usuário salvo no localStorage:', dados.usuario.nome);
                }
                
                mostrarMensagem('✅ ' + dados.message, 'success');
                
                // REDIRECIONAMENTO AUTOMÁTICO
                setTimeout(() => {
                    console.log('🔄 Redirecionando para /menu...');
                    window.location.href = '/menu';
                }, 1000);
            } else {
                console.log('❌ Login falhou:', dados.message);
                mostrarMensagem('❌ ' + dados.message, 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }

        } catch (erro) {
            console.error("❌ Erro na requisição:", erro);
            mostrarMensagem("🔴 Erro ao conectar com o servidor!", 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
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