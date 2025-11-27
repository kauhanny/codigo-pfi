document.addEventListener("DOMContentLoaded", () => {
  console.log("🏡 Página Home carregada com sucesso!");
  
  // Efeito de digitação no título
  const welcomeTitle = document.querySelector('.welcome-title');
  const originalText = welcomeTitle.textContent;
  welcomeTitle.textContent = '';
  
  let i = 0;
  const typeWriter = () => {
    if (i < originalText.length) {
      welcomeTitle.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  };
  
  // Inicia o efeito de digitação após 1 segundo
  setTimeout(typeWriter, 1000);
  
  // Adiciona classe de animação aos cards
  const cards = document.querySelectorAll('.text-card, .access-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 500 + (index * 100));
  });
  
  // Verifica se o usuário está logado
  const checkLoginStatus = () => {
    // Aqui você pode adicionar lógica para verificar se o usuário está logado
    // Por enquanto, vamos apenas logar no console
    console.log('🔐 Status de login verificado');
  };
  
  checkLoginStatus();
});