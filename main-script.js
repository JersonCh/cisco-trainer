class CiscoTrainerApp {
    constructor() {
        this.exercises = {
            16: { title: 'SSH Básico', completed: false, score: 0 },
            21: { title: 'SSH Avanzado', completed: false, score: 0 }
        };
        
        this.loadProgress();
        this.setupEventListeners();
        this.updateStats();
    }

    setupEventListeners() {
        // Toggle sidebar en móvil
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

        // Manejar resize de ventana
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
            }
        });

        // Interceptar clicks en ejercicios para control de scroll
        const exerciseLinks = document.querySelectorAll('.exercise-link');
        exerciseLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Forzar scroll al inicio antes de navegar
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            });
        });
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('ciscoTrainerProgress');
        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);
                this.exercises = { ...this.exercises, ...progress };
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    }

    saveProgress() {
        localStorage.setItem('ciscoTrainerProgress', JSON.stringify(this.exercises));
    }

    updateExerciseProgress(exerciseNumber, completed, score) {
        this.exercises[exerciseNumber] = {
            ...this.exercises[exerciseNumber],
            completed,
            score
        };
        this.saveProgress();
        this.updateStats();
    }

    updateStats() {
        const completedCount = Object.values(this.exercises).filter(ex => ex.completed).length;
        const totalExercises = Object.keys(this.exercises).length;
        const averageScore = this.calculateAverageScore();

        const completedElement = document.getElementById('completedCount');
        const averageElement = document.getElementById('averageScore');

        if (completedElement) {
            completedElement.textContent = `${completedCount}/${totalExercises}`;
        }

        if (averageElement) {
            averageElement.textContent = `${averageScore}%`;
        }

        // Actualizar visual de ejercicios completados
        this.updateExerciseLinks();
    }

    calculateAverageScore() {
        const completedExercises = Object.values(this.exercises).filter(ex => ex.completed);
        if (completedExercises.length === 0) return 0;
        
        const totalScore = completedExercises.reduce((sum, ex) => sum + ex.score, 0);
        return Math.round(totalScore / completedExercises.length);
    }

    updateExerciseLinks() {
        const exerciseLinks = document.querySelectorAll('.exercise-link');
        exerciseLinks.forEach(link => {
            const exerciseNumber = parseInt(link.dataset.exercise);
            const exercise = this.exercises[exerciseNumber];
            
            if (exercise && exercise.completed) {
                link.classList.add('completed');
            } else {
                link.classList.remove('completed');
            }
        });
    }

    // Método para ser llamado desde las páginas de ejercicios
    static updateProgress(exerciseNumber, completed, score) {
        const app = new CiscoTrainerApp();
        app.updateExerciseProgress(exerciseNumber, completed, score);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new CiscoTrainerApp();
});

// Exportar para uso en otras páginas
window.CiscoTrainerApp = CiscoTrainerApp;
