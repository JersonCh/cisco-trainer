class CiscoTrainer {
    constructor() {
        this.score = 0;
        this.totalQuestions = 11;
        this.answers = new Map();
        this.mistakes = [];
        this.isHardMode = false; // Nueva propiedad para modo difícil
        
        this.initializeAnswers();
        this.setupEventListeners();
        this.updateProgress();
    }

    initializeAnswers() {
        // Respuestas para modo fácil
        this.correctAnswersEasy = {
            'input-1': 'enable',
            'input-2': 'terminal',
            'input-3': ['S1', 's1'],
            'input-4': 'domain-name',
            'input-5': 'crypto',
            'input-6': '1024',
            'input-7': 'secret',
            'input-8': '4',
            'input-9': 'input',
            'input-10': 'local',
            'input-11a': 'running-config',
            'input-11b': 'startup-config'
        };

        // Respuestas para modo difícil (comandos completos)
        this.correctAnswersHard = {
            'input-1': 'enable',
            'input-2': 'configure terminal',
            'input-3': 'hostname S1',
            'input-4': 'ip domain-name leyva.local',
            'input-5': 'crypto key generate rsa',
            'input-6': '1024',
            'input-7': 'username admin secret Adm1nP@55',
            'input-8': 'line vty 0 4',
            'input-9': 'transport input ssh',
            'input-10': 'login local',
            'input-11a': 'copy running-config startup-config',
            'input-11b': 'copy running-config startup-config' // En modo difícil, ambos inputs aceptan el comando completo
        };

        // Usar respuestas fáciles por defecto
        this.correctAnswers = this.correctAnswersEasy;
    }

    setupEventListeners() {
        // Event listeners para los botones
        document.getElementById('checkAnswers').addEventListener('click', () => this.checkAllAnswers());
        document.getElementById('showHints').addEventListener('click', () => this.toggleHints());
        document.getElementById('reset').addEventListener('click', () => this.resetExercise());

        // Nuevos event listeners para botones de dificultad
        document.getElementById('easyMode').addEventListener('click', () => this.setEasyMode());
        document.getElementById('hardMode').addEventListener('click', () => this.setHardMode());

        // Event listeners para los inputs
        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleInputChange(e));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkSingleAnswer(e.target);
                }
            });
        });
    }

    handleInputChange(event) {
        const input = event.target;
        const inputId = input.id;
        
        // Limpiar feedback anterior
        this.clearFeedback(input);
        
        // Verificar si la respuesta es correcta mientras escribe
        if (this.isAnswerCorrect(inputId, input.value.trim())) {
            input.classList.remove('incorrect');
            input.classList.add('correct');
        } else {
            input.classList.remove('correct', 'incorrect');
        }
    }

    checkSingleAnswer(input) {
        const inputId = input.id;
        const userAnswer = input.value.trim();
        const isCorrect = this.isAnswerCorrect(inputId, userAnswer);
        
        this.showFeedback(input, isCorrect, userAnswer);
        
        if (isCorrect) {
            input.classList.remove('incorrect');
            input.classList.add('correct');
        } else {
            input.classList.remove('correct');
            input.classList.add('incorrect');
        }
    }

    isAnswerCorrect(inputId, userAnswer) {
        const correctAnswer = this.correctAnswers[inputId];
        
        if (Array.isArray(correctAnswer)) {
            return correctAnswer.some(answer => 
                answer.toLowerCase() === userAnswer.toLowerCase()
            );
        }
        
        return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
    }

    showFeedback(input, isCorrect, userAnswer) {
        const feedbackId = input.id.includes('11') ? 'feedback-11' : `feedback-${input.id.split('-')[1]}`;
        const feedbackElement = document.getElementById(feedbackId);
        
        if (feedbackElement) {
            if (isCorrect) {
                feedbackElement.textContent = '✓';
                feedbackElement.className = 'feedback correct';
            } else {
                feedbackElement.textContent = '✗';
                feedbackElement.className = 'feedback incorrect';
            }
        }
    }

    clearFeedback(input) {
        const feedbackId = input.id.includes('11') ? 'feedback-11' : `feedback-${input.id.split('-')[1]}`;
        const feedbackElement = document.getElementById(feedbackId);
        
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.className = 'feedback';
        }
    }

    checkAllAnswers() {
        this.score = 0;
        this.mistakes = [];
        
        const inputs = document.querySelectorAll('.command-input');
        
        inputs.forEach(input => {
            const inputId = input.id;
            const userAnswer = input.value.trim();
            
            // En modo difícil, tratamos los campos de manera especial
            if (this.isHardMode && inputId === 'input-11b') {
                // En modo difícil, input-11b debe estar vacío para ser correcto
                const isCorrect = userAnswer === '';
                
                if (isCorrect) {
                    this.score++;
                    input.classList.remove('incorrect');
                    input.classList.add('correct');
                    this.showFeedback(input, true, '(vacío - correcto)');
                } else {
                    input.classList.remove('correct');
                    input.classList.add('incorrect');
                    this.showFeedback(input, false, userAnswer);
                    this.mistakes.push({
                        question: 'Campo adicional en modo difícil',
                        userAnswer: userAnswer || '(vacío)',
                        correctAnswer: '(debe estar vacío en modo difícil)'
                    });
                }
                return;
            }
            
            const isCorrect = this.isAnswerCorrect(inputId, userAnswer);
            
            if (isCorrect) {
                this.score++;
                input.classList.remove('incorrect');
                input.classList.add('correct');
                this.showFeedback(input, true, userAnswer);
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                this.showFeedback(input, false, userAnswer);
                
                // Registrar error
                const correctAnswer = this.correctAnswers[inputId];
                const correctAnswerText = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
                this.mistakes.push({
                    question: this.getQuestionDescription(inputId),
                    userAnswer: userAnswer || '(vacío)',
                    correctAnswer: correctAnswerText
                });
            }
        });
        
        this.updateProgress();
        this.showResults();
        
        // Efectos de celebración
        if (this.score === this.totalQuestions) {
            this.celebrateSuccess();
        }
    }

    getQuestionDescription(inputId) {
        if (this.isHardMode) {
            const descriptionsHard = {
                'input-1': 'Comando para modo privilegiado',
                'input-2': 'Comando completo para configuración',
                'input-3': 'Comando completo para nombre del switch',
                'input-4': 'Comando completo para dominio',
                'input-5': 'Comando completo para generar clave RSA',
                'input-6': 'Tamaño de clave RSA',
                'input-7': 'Comando completo para crear usuario',
                'input-8': 'Comando completo para líneas VTY',
                'input-9': 'Comando completo para protocolo SSH',
                'input-10': 'Comando completo para autenticación local',
                'input-11a': 'Comando completo para guardar configuración',
                'input-11b': 'Campo adicional (debe estar vacío en modo difícil)'
            };
            return descriptionsHard[inputId] || 'Comando desconocido';
        } else {
            const descriptions = {
                'input-1': 'Comando para modo privilegiado',
                'input-2': 'Parámetro para configuración global',
                'input-3': 'Nombre del switch',
                'input-4': 'Comando para dominio',
                'input-5': 'Comando para criptografía',
                'input-6': 'Tamaño de clave RSA',
                'input-7': 'Comando para contraseña segura',
                'input-8': 'Número de líneas VTY',
                'input-9': 'Parámetro de transporte',
                'input-10': 'Tipo de autenticación',
                'input-11a': 'Configuración origen',
                'input-11b': 'Configuración destino'
            };
            return descriptions[inputId] || 'Comando desconocido';
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progress');
        const scoreElement = document.getElementById('score');
        
        const percentage = (this.score / this.totalQuestions) * 100;
        progressBar.style.width = `${percentage}%`;
        scoreElement.textContent = this.score;
        
        // Cambiar color de la barra según el progreso
        if (percentage >= 80) {
            progressBar.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
        } else if (percentage >= 50) {
            progressBar.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        }
    }

    showResults() {
        const resultsDiv = document.getElementById('results');
        const finalScoreElement = document.getElementById('finalScore');
        const mistakesElement = document.getElementById('mistakes');
        
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        let message = '';
        let emoji = '';
        
        if (percentage === 100) {
            message = '¡Perfecto! Dominas la configuración SSH';
            emoji = '🏆';
        } else if (percentage >= 80) {
            message = '¡Muy bien! Solo algunos errores menores';
            emoji = '🌟';
        } else if (percentage >= 60) {
            message = 'Bien, pero necesitas repasar algunos conceptos';
            emoji = '👍';
        } else {
            message = 'Sigue practicando, puedes mejorar';
            emoji = '📚';
        }
        
        finalScoreElement.innerHTML = `
            <span style="font-size: 2em;">${emoji}</span><br>
            Puntuación final: ${this.score}/${this.totalQuestions} (${percentage}%)<br>
            ${message}
        `;
        
        // Mostrar errores si los hay
        if (this.mistakes.length > 0) {
            let mistakesHTML = '<h4>❌ Errores encontrados:</h4><ul>';
            this.mistakes.forEach(mistake => {
                mistakesHTML += `
                    <li>
                        <strong>${mistake.question}:</strong><br>
                        Tu respuesta: "${mistake.userAnswer}"<br>
                        Respuesta correcta: "${mistake.correctAnswer}"
                    </li>
                `;
            });
            mistakesHTML += '</ul>';
            mistakesElement.innerHTML = mistakesHTML;
        } else {
            mistakesElement.innerHTML = '<p style="color: #fff; text-align: center;">🎉 ¡Sin errores!</p>';
        }
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    celebrateSuccess() {
        // Animación de celebración
        const container = document.querySelector('.container');
        container.style.animation = 'pulse 0.5s ease-in-out 3';
        
        // Confetti simulado con CSS
        this.createConfetti();
        
        // Vibración si está disponible
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}%;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                z-index: 1000;
                border-radius: 50%;
                animation: confetti-fall 3s linear forwards;
                pointer-events: none;
            `;
            
            document.body.appendChild(confetti);
            
            // Remover confetti después de la animación
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }
        
        // Agregar CSS para la animación si no existe
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    toggleHints() {
        const hintsDiv = document.getElementById('hints');
        const button = document.getElementById('showHints');
        
        if (hintsDiv.style.display === 'none' || hintsDiv.style.display === '') {
            hintsDiv.style.display = 'block';
            button.textContent = 'Ocultar Pistas';
            hintsDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            hintsDiv.style.display = 'none';
            button.textContent = 'Mostrar Pistas';
        }
    }

    resetExercise() {
        // Confirmar reset
        if (!confirm('¿Estás seguro de que quieres reiniciar el ejercicio?')) {
            return;
        }
        
        this.resetExerciseInternal();
        
        // Enfocar primer input
        const firstInput = document.getElementById('input-1');
        if (firstInput) firstInput.focus();
        
        // Scroll al inicio
        const terminalWindow = document.querySelector('.terminal-window');
        if (terminalWindow) {
            terminalWindow.scrollIntoView({ behavior: 'smooth' });
        }
    }

    setEasyMode() {
        this.isHardMode = false;
        this.correctAnswers = this.correctAnswersEasy;
        this.totalQuestions = 11; // En modo fácil son 11 preguntas
        
        // Actualizar UI
        document.body.classList.remove('hard-mode');
        document.getElementById('easyMode').classList.add('active');
        document.getElementById('hardMode').classList.remove('active', 'hard-active');
        
        // Actualizar placeholders y limpiar inputs
        this.updatePlaceholders();
        this.resetExerciseInternal();
        
        // Mostrar mensaje
        this.showModeChangeMessage('🟢 Modo Fácil Activado', 'Completa las palabras faltantes en los comandos');
    }

    setHardMode() {
        this.isHardMode = true;
        this.correctAnswers = this.correctAnswersHard;
        this.totalQuestions = 11; // En modo difícil también son 11 preguntas
        
        // Actualizar UI
        document.body.classList.add('hard-mode');
        document.getElementById('hardMode').classList.add('active', 'hard-active');
        document.getElementById('easyMode').classList.remove('active');
        
        // Actualizar placeholders y limpiar inputs
        this.updatePlaceholders();
        this.resetExerciseInternal();
        
        // Mostrar mensaje
        this.showModeChangeMessage('🔴 Modo Difícil Activado', 'Escribe los comandos completos desde cero');
    }

    updatePlaceholders() {
        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach(input => {
            if (this.isHardMode) {
                if (input.id === 'input-11b') {
                    input.style.display = 'none'; // Ocultar segundo input en modo difícil
                } else {
                    input.style.display = 'inline-block';
                    input.placeholder = 'Escribe el comando completo...';
                }
            } else {
                input.style.display = 'inline-block';
                if (input.id === 'input-4') {
                    input.placeholder = '__-name';
                } else {
                    input.placeholder = '__';
                }
            }
        });
        
        // Actualizar score display
        const scoreElement = document.querySelector('.score');
        if (scoreElement) {
            scoreElement.innerHTML = `Puntuación: <span id="score">0</span>/${this.totalQuestions}`;
        }
    }

    showModeChangeMessage(title, description) {
        // Crear mensaje temporal
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.isHardMode ? 'linear-gradient(135deg, #e74c3c, #c0392b)' : 'linear-gradient(135deg, #27ae60, #2ecc71)'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            font-weight: bold;
            animation: slideInRight 0.3s ease-out;
        `;
        
        message.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 5px;">${title}</div>
            <div style="font-size: 12px; opacity: 0.9;">${description}</div>
        `;
        
        document.body.appendChild(message);
        
        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'slideOutRight 0.3s ease-in forwards';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }, 300);
            }
        }, 3000);
        
        // Agregar animaciones CSS si no existen
        if (!document.getElementById('mode-animations')) {
            const style = document.createElement('style');
            style.id = 'mode-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    resetExerciseInternal() {
        // Limpiar todos los inputs sin confirmación (para cambio de modo)
        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
            this.clearFeedback(input);
        });
        
        // Resetear variables
        this.score = 0;
        this.mistakes = [];
        
        // Ocultar resultados y pistas
        const resultsDiv = document.getElementById('results');
        const hintsDiv = document.getElementById('hints');
        const showHintsBtn = document.getElementById('showHints');
        
        if (resultsDiv) resultsDiv.style.display = 'none';
        if (hintsDiv) hintsDiv.style.display = 'none';
        if (showHintsBtn) showHintsBtn.textContent = 'Mostrar Pistas';
        
        // Actualizar progreso
        this.updateProgress();
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new CiscoTrainer();
    
    // Enfocar el primer input
    document.getElementById('input-1').focus();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        alert('¡Bienvenido al entrenador de comandos Cisco! 🚀\n\nCompleta los espacios en blanco para configurar SSH en el switch.\n\nConsejos:\n• Presiona Enter después de cada respuesta\n• Usa las pistas si necesitas ayuda\n• ¡La práctica hace al maestro!');
    }, 500);
});

// Agregar algunos atajos de teclado útiles
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter para verificar respuestas
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('checkAnswers').click();
    }
    
    // Ctrl/Cmd + H para mostrar/ocultar pistas
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        document.getElementById('showHints').click();
    }
    
    // Ctrl/Cmd + R para resetear (solo si no hay texto seleccionado)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && window.getSelection().toString() === '') {
        e.preventDefault();
        document.getElementById('reset').click();
    }
});
