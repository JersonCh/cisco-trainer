class CiscoTrainerExercise25 {
    constructor() {
        this.score = 0;
        this.totalQuestions = 10;
        this.correctAnswers = {};
        this.isHardMode = false;
        
        this.forceScrollToTop();
        this.initializeAnswers();
        this.setupEventListeners();
        this.updateProgress();
    }

    forceScrollToTop() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 50);
    }

    initializeAnswers() {
        // Respuestas para modo fácil
        this.easyAnswers = {
            'input-1': 'ccna.local',
            'input-2': 'admin',
            'input-3': '15',
            'input-4': 'cisco123',
            'input-5': 'rsa',
            'input-6': '2',
            'input-7': '0',
            'input-8': '4',
            'input-9': 'local',
            'input-10': 'ssh'
        };

        // Respuestas para modo difícil
        this.hardAnswers = {
            'input-1': 'ip domain-name ccna.local',
            'input-2': 'username admin privilege 15 secret cisco123',
            'input-5': 'crypto key generate rsa',
            'input-6': 'ip ssh version 2',
            'input-7': 'line vty 0 4',
            'input-9': 'login local',
            'input-10': 'transport input ssh'
        };

        this.correctAnswers = this.easyAnswers;
    }

    setupEventListeners() {
        document.getElementById('checkAnswers').addEventListener('click', () => this.checkAllAnswers());
        document.getElementById('showHints').addEventListener('click', () => this.toggleHints());
        document.getElementById('reset').addEventListener('click', () => this.resetExercise());
        document.getElementById('easyMode').addEventListener('click', () => this.setEasyMode());
        document.getElementById('hardMode').addEventListener('click', () => this.setHardMode());

        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach((input, index) => {
            input.addEventListener('input', () => this.updateProgress());
        });
    }

    setEasyMode() {
        this.isHardMode = false;
        this.correctAnswers = this.easyAnswers;
        this.totalQuestions = 10;
        
        document.getElementById('easyMode').classList.add('active');
        document.getElementById('hardMode').classList.remove('active');
        
        // Mostrar textos de ayuda
        const easyTexts = document.querySelectorAll('.easy-text');
        const easyFields = document.querySelectorAll('.easy-text-field');
        
        easyTexts.forEach(text => text.style.display = 'inline');
        easyFields.forEach(field => field.style.display = 'inline');
        
        this.updateScoreDisplay();
        this.resetExercise();
    }

    setHardMode() {
        this.isHardMode = true;
        this.correctAnswers = this.hardAnswers;
        this.totalQuestions = 7;
        
        document.getElementById('hardMode').classList.add('active');
        document.getElementById('easyMode').classList.remove('active');
        
        // Ocultar textos de ayuda
        const easyTexts = document.querySelectorAll('.easy-text');
        const easyFields = document.querySelectorAll('.easy-text-field');
        
        easyTexts.forEach(text => text.style.display = 'none');
        easyFields.forEach(field => field.style.display = 'none');
        
        this.updateScoreDisplay();
        this.resetExercise();
    }

    updateScoreDisplay() {
        const scoreElement = document.querySelector('.score');
        if (scoreElement) {
            scoreElement.innerHTML = `Puntuación: <span id="score">0</span>/${this.totalQuestions}`;
        }
    }

    checkAllAnswers() {
        this.score = 0;
        const mistakes = [];
        
        Object.keys(this.correctAnswers).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            // En modo difícil, saltar campos ocultos
            if (this.isHardMode && !this.correctAnswers[inputId]) return;
            
            const userAnswer = input.value.trim();
            const correctAnswer = this.correctAnswers[inputId];
            
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                this.score++;
                input.classList.remove('incorrect');
                input.classList.add('correct');
                
                const feedback = document.getElementById(`feedback-${inputId.split('-')[1]}`);
                if (feedback) {
                    feedback.textContent = '✓ Correcto';
                    feedback.className = 'feedback correct';
                }
            } else {
                input.classList.remove('correct');
                input.classList.add('incorrect');
                
                const feedback = document.getElementById(`feedback-${inputId.split('-')[1]}`);
                if (feedback) {
                    feedback.textContent = '✗ Incorrecto';
                    feedback.className = 'feedback incorrect';
                }
                
                mistakes.push({
                    question: inputId,
                    userAnswer: userAnswer || '(vacío)',
                    correctAnswer: correctAnswer
                });
            }
        });
        
        this.updateProgress();
        this.showResults(mistakes);
    }

    showResults(mistakes) {
        const resultsDiv = document.getElementById('results');
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        
        let html = `<h3>🎉 ¡Resultados!</h3>`;
        html += `<p>Puntuación: ${this.score}/${this.totalQuestions} (${percentage}%)</p>`;
        
        if (mistakes.length > 0) {
            html += `<h4>❌ Respuestas incorrectas:</h4><ul>`;
            mistakes.forEach(mistake => {
                html += `<li><strong>${mistake.question}:</strong> "${mistake.userAnswer}" → "${mistake.correctAnswer}"</li>`;
            });
            html += `</ul>`;
        } else {
            html += `<p>🎉 ¡Perfecto! Todas las respuestas son correctas.</p>`;
        }
        
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    }

    updateProgress() {
        let correctCount = 0;
        
        Object.keys(this.correctAnswers).forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;
            
            if (this.isHardMode && !this.correctAnswers[inputId]) return;
            
            const userAnswer = input.value.trim();
            const correctAnswer = this.correctAnswers[inputId];
            
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                correctCount++;
            }
        });
        
        const percentage = (correctCount / this.totalQuestions) * 100;
        const progressBar = document.getElementById('progress');
        const scoreSpan = document.getElementById('score');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (scoreSpan) {
            scoreSpan.textContent = correctCount;
        }
    }

    toggleHints() {
        const hintsDiv = document.getElementById('hints');
        if (hintsDiv.style.display === 'none') {
            hintsDiv.style.display = 'block';
        } else {
            hintsDiv.style.display = 'none';
        }
    }

    resetExercise() {
        const inputs = document.querySelectorAll('.command-input');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        });
        
        const feedbacks = document.querySelectorAll('.feedback');
        feedbacks.forEach(feedback => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        });
        
        const resultsDiv = document.getElementById('results');
        resultsDiv.style.display = 'none';
        
        const hintsDiv = document.getElementById('hints');
        hintsDiv.style.display = 'none';
        
        this.score = 0;
        this.updateProgress();
        this.forceScrollToTop();
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new CiscoTrainerExercise25();
});
