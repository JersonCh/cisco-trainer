// Script universal para controlar el scroll en todas las páginas
(function() {
    'use strict';
    
    // Función para ir al inicio
    function forceScrollToTop() {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
    }
    
    // Ejecutar inmediatamente
    forceScrollToTop();
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceScrollToTop);
    } else {
        forceScrollToTop();
    }
    
    // Ejecutar cuando la página esté completamente cargada
    window.addEventListener('load', function() {
        setTimeout(forceScrollToTop, 100);
    });
    
    // Interceptar navegación del historial
    window.addEventListener('popstate', function() {
        setTimeout(forceScrollToTop, 50);
    });
    
    // Para asegurar que los formularios no causen scroll
    document.addEventListener('submit', function(e) {
        setTimeout(forceScrollToTop, 100);
    });
    
    // Interceptar clicks en enlaces de ejercicios
    document.addEventListener('click', function(e) {
        if (e.target.closest('.exercise-link')) {
            setTimeout(forceScrollToTop, 50);
        }
    });
    
})();
