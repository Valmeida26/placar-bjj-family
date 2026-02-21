function timer() {
    return {
        remainingTime: 300, // valor inicial 5 minutos
        isRunning: false,
        interval: null,
        audioCtx: null, // contexto de áudio, inicializado só após clique do usuário

        startTimer() {
            if (!this.isRunning) {

                // cria AudioContext após a primeira interação do usuário
                if (!this.audioCtx) {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }

                this.isRunning = true;

                this.interval = setInterval(() => {
                    if (this.remainingTime > 0) {
                        this.remainingTime--;

                        if (this.remainingTime === 0) {
                            this.pauseTimer();
                            this.playBeepMultiple(1, 300); // 3 beeps de 0.3s cada
                        }

                    } else {
                        this.pauseTimer();
                    }
                }, 1000);
            }
        },

        pauseTimer() {
            clearInterval(this.interval);
            this.isRunning = false;
        },

        toggleTimer() {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        },

        setTime(minutes) {
            this.remainingTime = minutes * 60;
            this.pauseTimer();

            //dispara evento global para zerar placar
            this.$dispatch('reset-score');
        },

        formatTime(time) {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
        },

        playBeep() {
            if (!this.audioCtx) return;

            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();

            // Som mais "redondo" e menos agudo
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(1300, this.audioCtx.currentTime);


            oscillator.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            // Volume forte mas controlado
            gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

            oscillator.start();

            // Agora bem mais longo (5 segundos)
            oscillator.stop(this.audioCtx.currentTime + 2);
        },

        // toca múltiplos beeps em sequência
        playBeepMultiple(times = 1, interval = 300) {
            for (let i = 0; i < times; i++) {
                setTimeout(() => this.playBeep(), i * interval);
            }
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