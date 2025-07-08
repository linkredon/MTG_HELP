// Arquivo para corrigir o comportamento dos dropdowns na página de coleção

// Função para corrigir o posicionamento dos dropdowns
export function fixDropdownPositioning() {
  // Seleciona todos os elementos de dropdown
  const dropdownTriggers = document.querySelectorAll('[data-radix-select-trigger]');
  
  // Para cada trigger, adiciona um evento de clique
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      // Pequeno timeout para garantir que o dropdown foi renderizado
      setTimeout(() => {
        const contentWrapper = document.querySelector('[data-radix-popper-content-wrapper]');
        if (contentWrapper) {
          // Obtém a posição do trigger
          const triggerRect = trigger.getBoundingClientRect();
          
          // Define a posição do dropdown
          contentWrapper.setAttribute('style', `
            position: absolute !important;
            top: ${triggerRect.bottom + window.scrollY}px !important;
            left: ${triggerRect.left}px !important;
            width: ${triggerRect.width}px !important;
            transform: none !important;
            z-index: 9999 !important;
          `);
        }
      }, 10);
    });
  });
}

// Exporta a função para uso em outros componentes
export default fixDropdownPositioning;