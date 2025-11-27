document.addEventListener("DOMContentLoaded", () => {
    const stars = document.querySelectorAll(".star");
    const ratingValue = document.getElementById("rating-value");
    const form = document.getElementById("formAvaliacao");

    // Sistema de estrelas
    stars.forEach((star, index) => {
        star.addEventListener("mouseover", () => {
            for (let i = 0; i <= index; i++) stars[i].classList.add("hover");
        });

        star.addEventListener("mouseout", () => {
            stars.forEach(s => s.classList.remove("hover"));
        });

        star.addEventListener("click", () => {
            ratingValue.value = star.getAttribute("data-value");
            stars.forEach(s => s.classList.remove("selected"));
            for (let i = 0; i <= index; i++) stars[i].classList.add("selected");
            
            console.log('⭐ Nota selecionada:', ratingValue.value);
        });
    });

    // Envio do formulário de avaliação
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Pega os valores dos campos
        const nome = form.querySelector('input[type="text"]').value;
        const profissional = form.querySelectorAll('input[type="text"]')[1].value;
        const servico = form.querySelectorAll('input[type="text"]')[2].value;
        const data = form.querySelector('input[type="date"]').value;
        const nota = ratingValue.value;
        const comentario = form.querySelector('textarea').value;

        console.log('📝 Dados capturados:', { nome, profissional, servico, data, nota, comentario });

        // Validações
        if (!nome || !profissional || !servico || !data || !nota || nota === "0") {
            alert('❌ Preencha todos os campos obrigatórios!');
            return;
        }

        try {
            const button = form.querySelector('button');
            button.innerHTML = 'Enviando...';
            button.disabled = true;

            console.log('📤 Enviando dados para o servidor...');
            
            const resposta = await fetch('/api/avaliacoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    profissional: profissional,
                    servico: servico,
                    data: data,
                    nota: parseInt(nota),
                    comentario: comentario
                })
            });

            const dados = await resposta.json();
            console.log('📥 Resposta do servidor:', dados);

            if (dados.success) {
                alert('✅ Avaliação salva com sucesso!');
                form.reset();
                
                // Limpa as estrelas
                stars.forEach(star => star.classList.remove("selected"));
                ratingValue.value = "0";
                
                console.log('⭐ Avaliação salva no banco de dados!');
            } else {
                alert('❌ Erro: ' + dados.message);
            }

        } catch (erro) {
            console.error("❌ Erro ao enviar avaliação:", erro);
            alert("🔴 Erro ao conectar com o servidor! Verifique o console.");
        } finally {
            const button = form.querySelector('button');
            button.innerHTML = 'Enviar Avaliação';
            button.disabled = false;
        }
    });

    // Adiciona estilo inicial para as estrelas
    stars.forEach(star => {
        star.style.cursor = 'pointer';
        star.style.transition = 'color 0.2s';
    });
});