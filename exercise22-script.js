class CiscoTrainerExercise22 {
    constructor() {
        this.score = 0;
        this.totalQuestions = 1;
        this.answers = new Map();
        this.mistakes = [];
        this.isHardMode = false;
        
        // Forzar scroll al inicio inmediatamente
        this.forceScrollToTop();
        
        this.initializeAnswers();
        this.setupEventListeners();
        this.updateProgress();
        this.initializeSidebar();
    }

    initializeAnswers() {
        // Respuestas para modo fácil
        this.correctAnswersEasy = {
            'input-1': 'www.google.com'
        };

        // Respuestas para modo difícil (comandos completos)
        this.correctAnswersHard = {
            'input-1': 'nslookup www.google.com'
        };

        // Usar respuestas fáciles por defecto
        this.correctAnswers = this.correctAnswersEasy;
    }

    setupEventListeners() {
        // Event listeners para los botones
        document.getElementById('checkAnswers').addEventListener('click', () => this.checkAllAnswers());
        document.getElementById('showHints').addEventListener('click', () => this.toggleHints());
        document.getElementById('reset').addEventListener('click', () => this.resetExercise());

        // Event listeners para botones de dificultad
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

        // Inicializar sidebar
        this.initializeSidebar();
    }

    initializeSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Cerrar sidebar al hacer click fuera en móvil
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    setEasyMode() {
        this.isHardMode = false;
        this.correctAnswers = this.correctAnswersEasy;
        
        // Actualizar interfaz
        document.getElementById('easyMode').classList.add('active');
        document.getElementById('hardMode').classList.remove('active');
        
        // Mostrar/ocultar textos de ayuda
        const easyTexts = document.querySelectorAll('.easy-text');
        
        easyTexts.forEach(text => text.style.display = 'inline');
        
        this.resetExercise();
    }

    setHardMode() {
        this.isHardMode = true;
        this.correctAnswers = this.correctAnswersHard;
        
        // Actualizar interfaz
        document.getElementById('hardMode').classList.add('active');
        document.getElementById('easyMode').classList.remove('active');
        
        // Ocultar textos de ayuda
        const easyTexts = document.querySelectorAll('.easy-text');
        
        easyTexts.forEach(text => text.style.display = 'none');
        
        this.resetExercise();
    }

    forceScrollToTop() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
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
        const feedbackId = `feedback-${input.id.split('-')[1]}`;
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
        const feedbackId = `feedback-${input.id.split('-')[1]}`;
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
            const isCorrect = this.isAnswerCorrect(inputId, userAnswer);
            
            if (isCorrect) {
                input.classList.remove('incorrect');
                input.classList.add('correct');
                this.score++;
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                this.mistakes.push({
                    question: inputId,
                    userAnswer: userAnswer,
                    correctAnswer: this.correctAnswers[inputId]
                });
            }
            
            this.showFeedback(input, isCorrect, userAnswer);
        });
        
        this.updateProgress();
        this.showResults();
        
        // Actualizar progreso global
        const percentage = (this.score / this.totalQuestions) * 100;
        const completed = percentage >= 70; // 70% para considerar completado
        
        if (window.CiscoTrainerApp) {
            window.CiscoTrainerApp.updateProgress(22, completed, Math.round(percentage));
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progress');
        const scoreElement = document.getElementById('score');
        const percentage = (this.score / this.totalQuestions) * 100;
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    showResults() {
        const resultsDiv = document.getElementById('results');
        const finalScoreElement = document.getElementById('finalScore');
        const mistakesElement = document.getElementById('mistakes');
        
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        
        finalScoreElement.innerHTML = `
            <strong>Puntuación Final: ${this.score}/${this.totalQuestions} (${percentage}%)</strong>
            ${percentage >= 90 ? '🏆 ¡Excelente!' : 
              percentage >= 70 ? '🎉 ¡Buen trabajo!' : 
              percentage >= 50 ? '👍 ¡Sigue practicando!' : 
              '📚 ¡Necesitas más práctica!'}
        `;
        
        if (this.mistakes.length > 0) {
            let mistakesHTML = '<h4>❌ Errores encontrados:</h4><ul>';
            this.mistakes.forEach(mistake => {
                const questionNumber = mistake.question.split('-')[1];
                mistakesHTML += `
                    <li>
                        <strong>Pregunta ${questionNumber}:</strong> 
                        Tu respuesta: "${mistake.userAnswer}" | 
                        Respuesta correcta: "${mistake.correctAnswer}"
                    </li>
                `;
            });
            mistakesHTML += '</ul>';
            mistakesElement.innerHTML = mistakesHTML;
        } else {
            mistakesElement.innerHTML = '<h4>🎉 ¡Perfecto! Sin errores.</h4>';
        }
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
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
        this.score = 0;
        this.mistakes = [];
        
        // Limpiar todos los inputs
        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
            this.clearFeedback(input);
        });
        
        // Ocultar resultados y pistas
        document.getElementById('results').style.display = 'none';
        document.getElementById('hints').style.display = 'none';
        document.getElementById('showHints').textContent = 'Mostrar Pistas';
        
        this.updateProgress();
        
        // Scroll al inicio
        this.forceScrollToTop();
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new CiscoTrainerExercise22();
});
