document.addEventListener("DOMContentLoaded", () => {
    console.log("📅 Calendário carregado!");
    carregarCalendarioComHorariosOcupados();
});

async function carregarCalendarioComHorariosOcupados() {
    try {
        console.log('🔄 Buscando horários ocupados...');
        
        const response = await fetch('/api/horarios-ocupados');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Dados recebidos da API:', data);
        
        let horariosOcupados = [];
        if (data.success) {
            horariosOcupados = data.horariosOcupados;
            console.log(`✅ ${horariosOcupados.length} horários ocupados carregados`);
        } else {
            console.error('❌ API retornou erro:', data.message);
        }

        // Gerar calendário
        gerarCalendario(horariosOcupados);

    } catch (error) {
        console.error('❌ Erro ao carregar horários ocupados:', error);
        // Fallback - calendário sem horários ocupados
        gerarCalendario([]);
    }
}

function gerarCalendario(horariosOcupados) {
    const gradeSemana = document.getElementById('gradeSemana');
    
    const diasSemana = [
        { nome: 'Segunda-feira', horarios: ['11:00', '14:30', '15:30', '17:30'] },
        { nome: 'Terça-feira', horarios: ['09:00', '13:30', '16:00', '18:30'] },
        { nome: 'Quarta-feira', horarios: ['10:00', '13:00', '14:30', '17:30'] },
        { nome: 'Quinta-feira', horarios: ['10:00', '11:00', '14:30', '16:00'] },
        { nome: 'Sexta-feira', horarios: ['11:00', '14:30', '15:30', '17:30'] },
        { nome: 'Sábado', horarios: ['09:00', '13:00', '16:00', '18:30'] }
    ];

    // Criar mapa de horários ocupados
    const horariosOcupadosMap = {};
    horariosOcupados.forEach(h => {
        const chave = `${h.dia_semana}-${h.hora}`;
        horariosOcupadosMap[chave] = true;
    });

    const html = diasSemana.map(dia => {
        const horariosHTML = dia.horarios.map(horario => {
            const chaveHorario = `${dia.nome}-${horario}`;
            const isOcupado = horariosOcupadosMap[chaveHorario];
            
            return `
                <div class="horario ${isOcupado ? 'ocupado' : 'disponivel'}" 
                     data-dia="${dia.nome}" 
                     data-hora="${horario}">
                    ${isOcupado ? '❌ ' : '✅ '}${horario}
                    ${isOcupado ? '<small>(Ocupado)</small>' : '<small>(Disponível)</small>'}
                </div>
            `;
        }).join('');

        return `
            <div class="dia">
                <h2>${dia.nome}</h2>
                <div class="horas">
                    ${horariosHTML}
                </div>
            </div>
        `;
    }).join('');

    gradeSemana.innerHTML = html;
    console.log('🎉 Calendário gerado com sucesso!');
}

// Atualizar a cada 30 segundos
setInterval(() => {
    console.log('🔄 Atualizando calendário...');
    carregarCalendarioComHorariosOcupados();
}, 30000);