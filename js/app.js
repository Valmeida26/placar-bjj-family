function timer() {
    return {
        remainingTime: 300,
        isRunning: false,
        interval: null,
        alarmSound: null,
        canEditScore: false,
        audioCtx: null,

        initTimer() {
            const savedTime = localStorage.getItem('remainingTime');

            if (savedTime !== null) {
                this.remainingTime = Number(savedTime);
            } else {
                this.remainingTime = 300;
                localStorage.setItem('remainingTime', this.remainingTime);
            }

            // O sistema sempre volta PAUSADO depois de abrir/reiniciar.
            this.isRunning = false;

            // Mantém o cronômetro sincronizado caso a outra janela altere.
            window.addEventListener('storage', (event) => {
                if (event.key === 'remainingTime' && event.newValue !== null) {
                    this.remainingTime = Number(event.newValue);

                    // Se outra janela alterar o tempo, não inicia
                    // automaticamente o cronômetro.
                    if (this.isRunning) {
                        this.pauseTimer();
                    }
                }
            });
        },

        startTimer() {
            if (this.isRunning) {
                return;
            }

            // Cria AudioContext após interação do usuário
            if (!this.audioCtx) {
                this.audioCtx = new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();
            }

            this.isRunning = true;

            this.$dispatch('match-started');

            // Salva imediatamente o estado atual
            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );

            this.interval = setInterval(() => {

                if (this.remainingTime > 0) {

                    this.remainingTime--;

                    // Salva a cada segundo
                    localStorage.setItem(
                        'remainingTime',
                        this.remainingTime
                    );

                    if (this.remainingTime === 0) {

                        this.pauseTimer();

                        this.$dispatch('match-ended');

                        this.playAlarm();
                    }

                } else {

                    this.pauseTimer();
                }

            }, 1000);
        },

        pauseTimer() {

            if (this.interval !== null) {
                clearInterval(this.interval);
                this.interval = null;
            }

            this.isRunning = false;

            // Salva imediatamente ao pausar
            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );
        },

        toggleTimer() {

            if (this.isRunning) {
                this.pauseTimer();
            } else {

                if (this.remainingTime > 0) {
                    this.startTimer();
                }

            }
        },

        setTime(minutes) {

            this.pauseTimer();

            this.remainingTime = minutes * 60;

            // Salva imediatamente
            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );

            // Reseta o placar
            this.$dispatch('reset-score');
        },

        formatTime(time) {

            const minutes = Math.floor(time / 60);
            const seconds = time % 60;

            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        },

        playAlarm() {

            if (!this.alarmSound) {

                this.alarmSound = new Audio(
                    './audio/alerta_fim_luta.mp3'
                );

                this.alarmSound.preload = "auto";
            }

            this.alarmSound.currentTime = 0;

            this.alarmSound.play();
        }
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

document.getElementById('tutorial').addEventListener('click', function () {
    Swal.fire({
        title: "Dicas legais:",
        html: "Use <strong>Ctrl + ou Ctrl -</strong> para ajustar o tamanho da tela. \<br> Tecle F11 para usar tela cheia e ESC para sair. \<br><br> Veja mais dicas em: BJJCOMPETIDOR.COM.BR",
        icon: "info"
    });
});

document.getElementById('pix').addEventListener('click', function () {
    Swal.fire({
        html: '<img src="./img/pix/donation.jpeg">'
    });
});