/* =========================================================
   CRONÔMETRO DA TELA 1
========================================================= */

function timer() {

    return {

        remainingTime: 300,
        isRunning: false,
        interval: null,

        alarmSound: null,
        canEditScore: false,
        audioCtx: null,


        /* =====================================================
           INICIALIZAÇÃO
        ===================================================== */

        initTimer() {

            const savedTime = localStorage.getItem('remainingTime');

            if (savedTime !== null) {

                this.remainingTime = Number(savedTime);

            } else {

                this.remainingTime = 300;

                localStorage.setItem(
                    'remainingTime',
                    this.remainingTime
                );

            }


            // Sempre começa pausado ao abrir o programa

            this.isRunning = false;


            /*
             * Garante que o relógio da Tela 2 tenha
             * o mesmo tempo inicial.
             */

            const displayTime =
                localStorage.getItem('displayRemainingTime');

            if (displayTime === null) {

                localStorage.setItem(
                    'displayRemainingTime',
                    this.remainingTime
                );

            }


            /*
             * Escuta alterações feitas externamente.
             */

            window.addEventListener('storage', (event) => {

                if (
                    event.key === 'remainingTime' &&
                    event.newValue !== null
                ) {

                    this.remainingTime =
                        Number(event.newValue);

                }

            });

        },


        /* =====================================================
           ENVIA COMANDO PARA A TELA 2
        ===================================================== */

        sendDisplayCommand(action, minutes = null) {

            const command = {

                action: action,

                minutes: minutes,

                timestamp: Date.now()

            };


            localStorage.setItem(
                'displayTimerCommand',
                JSON.stringify(command)
            );

        },


        /* =====================================================
           INICIAR
        ===================================================== */

        startTimer() {

            if (this.isRunning) {
                return;
            }


            if (this.remainingTime <= 0) {
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


            // Avisa o sistema que a luta começou

            this.$dispatch('match-started');


            /*
             * ===============================================
             * MANDA A TELA 2 COMEÇAR
             * ===============================================
             */

            this.sendDisplayCommand('start');


            /*
             * Salva o tempo atual
             */

            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );


            /*
             * CRONÔMETRO DA TELA 1
             */

            this.interval = setInterval(() => {

                if (this.remainingTime > 0) {

                    this.remainingTime--;


                    localStorage.setItem(
                        'remainingTime',
                        this.remainingTime
                    );


                    /*
                     * FIM DA LUTA
                     */

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


        /* =====================================================
           PAUSAR
        ===================================================== */

        pauseTimer() {

            if (this.interval !== null) {

                clearInterval(this.interval);

                this.interval = null;

            }


            this.isRunning = false;


            /*
             * Salva o tempo da Tela 1
             */

            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );


            /*
             * ===============================================
             * MANDA A TELA 2 PAUSAR
             * ===============================================
             */

            this.sendDisplayCommand('pause');

        },


        /* =====================================================
           PLAY / PAUSE
        ===================================================== */

        toggleTimer() {

            if (this.isRunning) {

                this.pauseTimer();

            } else {

                if (this.remainingTime > 0) {

                    this.startTimer();

                }

            }

        },


        /* =====================================================
           DEFINIR 2 / 3 / 5 MINUTOS
        ===================================================== */

        setTime(minutes) {

            /*
             * Para o cronômetro da Tela 1
             */

            this.pauseTimer();


            /*
             * Define o tempo da Tela 1
             */

            this.remainingTime =
                minutes * 60;


            localStorage.setItem(
                'remainingTime',
                this.remainingTime
            );


            /*
             * ===============================================
             * DEFINE O MESMO TEMPO NA TELA 2
             * ===============================================
             */

            localStorage.setItem(
                'displayRemainingTime',
                this.remainingTime
            );


            /*
             * Envia comando específico para a Tela 2
             */

            this.sendDisplayCommand(
                'setTime',
                minutes
            );


            /*
             * Reseta o placar
             */

            this.$dispatch('reset-score');

        },


        /* =====================================================
           FORMATAR TEMPO
        ===================================================== */

        formatTime(time) {

            const minutes =
                Math.floor(time / 60);

            const seconds =
                time % 60;


            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        },


        /* =====================================================
           ALARME
        ===================================================== */

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

    };

}



/* =========================================================
   CRONÔMETRO DA TELA 2
========================================================= */

function displayTimer() {

    return {

        /*
         * TEMPO EXCLUSIVO DA TELA 2
         */

        remainingTime: 300,

        isRunning: false,

        interval: null,


        /* =====================================================
           INICIALIZAÇÃO
        ===================================================== */

        initTimer() {

            /*
             * Recupera o último tempo salvo
             */

            const savedTime =
                localStorage.getItem(
                    'displayRemainingTime'
                );


            if (savedTime !== null) {

                this.remainingTime =
                    Number(savedTime);

            } else {

                this.remainingTime = 300;

                localStorage.setItem(
                    'displayRemainingTime',
                    this.remainingTime
                );

            }


            /*
             * Sempre inicia pausado.
             */

            this.isRunning = false;


            /*
             * Escuta os comandos enviados pela Tela 1.
             */

            window.addEventListener(
                'storage',
                (event) => {

                    if (
                        event.key ===
                        'displayTimerCommand'
                    ) {

                        if (
                            !event.newValue
                        ) {
                            return;
                        }


                        const command =
                            JSON.parse(
                                event.newValue
                            );


                        /*
                         * =================================
                         * PLAY
                         * =================================
                         */

                        if (
                            command.action ===
                            'start'
                        ) {

                            this.startTimer();

                        }


                        /*
                         * =================================
                         * PAUSE
                         * =================================
                         */

                        if (
                            command.action ===
                            'pause'
                        ) {

                            this.pauseTimer();

                        }


                        /*
                         * =================================
                         * DEFINIR TEMPO
                         * =================================
                         */

                        if (
                            command.action ===
                            'setTime'
                        ) {

                            this.setTime(
                                command.minutes
                            );

                        }

                    }

                }
            );

        },


        /* =====================================================
           INICIAR TELA 2
        ===================================================== */

        startTimer() {

            if (this.isRunning) {
                return;
            }


            if (this.remainingTime <= 0) {
                return;
            }


            this.isRunning = true;


            /*
             * Cronômetro próprio da Tela 2
             */

            this.interval = setInterval(() => {

                if (this.remainingTime > 0) {

                    this.remainingTime--;


                    localStorage.setItem(
                        'displayRemainingTime',
                        this.remainingTime
                    );


                    /*
                     * Chegou em zero
                     */

                    if (
                        this.remainingTime === 0
                    ) {

                        this.pauseTimer();

                    }

                } else {

                    this.pauseTimer();

                }

            }, 1000);

        },


        /* =====================================================
           PAUSAR TELA 2
        ===================================================== */

        pauseTimer() {

            if (
                this.interval !== null
            ) {

                clearInterval(
                    this.interval
                );

                this.interval = null;

            }


            this.isRunning = false;


            localStorage.setItem(
                'displayRemainingTime',
                this.remainingTime
            );

        },


        /* =====================================================
           DEFINIR TEMPO TELA 2
        ===================================================== */

        setTime(minutes) {

            this.pauseTimer();


            this.remainingTime =
                minutes * 60;


            localStorage.setItem(
                'displayRemainingTime',
                this.remainingTime
            );

        },


        /* =====================================================
           FORMATAR TEMPO
        ===================================================== */

        formatTime(time) {

            const minutes =
                Math.floor(time / 60);

            const seconds =
                time % 60;


            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        }

    };

}



/* =========================================================
   TELA CHEIA
========================================================= */

function toggleFullScreen() {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    } else {

        if (document.exitFullscreen) {

            document.exitFullscreen();

        }

    }

}



/* =========================================================
   TUTORIAL
========================================================= */

const tutorialButton =
    document.getElementById('tutorial');


if (tutorialButton) {

    tutorialButton.addEventListener(
        'click',
        function () {

            Swal.fire({

                title: "Dicas legais:",

                html:
                    "Use <strong>Ctrl + ou Ctrl -</strong> " +
                    "para ajustar o tamanho da tela. " +
                    "<br> Tecle F11 para usar tela cheia " +
                    "e ESC para sair. " +
                    "<br><br> Veja mais dicas em: " +
                    "BJJCOMPETIDOR.COM.BR",

                icon: "info"

            });

        }
    );

}



/* =========================================================
   PIX
========================================================= */

const pixButton =
    document.getElementById('pix');


if (pixButton) {

    pixButton.addEventListener(
        'click',
        function () {

            Swal.fire({

                html:
                    '<img src="./img/pix/donation.jpeg">'

            });

        }
    );

}
