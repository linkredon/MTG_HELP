// Script para adicionar efeito de brilho que segue o mouse
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.quantum-card-dense');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    });
  });
});