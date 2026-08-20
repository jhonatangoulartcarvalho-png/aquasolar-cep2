/* =========================================================
   CEP AQUA SOLAR
   Projeto Integrador — Automação e Aquecimento Sustentável
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURAÇÕES GERAIS
    ===================================================== */

    const CONFIG = {
        temperaturaIdeal: 30,
        temperaturaMinima: 24,
        temperaturaMaxima: 35,
        capacidadePiscina: 50000, // litros
        eficienciaSolar: 0.78,
        intervaloDashboard: 3000,
        intervaloGrafico: 5000
    };

    let sistemaLigado = true;
    let modoAutomatico = true;
    let temperatura = 27.4;
    let temperaturaExterna = 23;
    let irradiacao = 720;
    let umidade = 64;
    let pressao = 1013;
    let fluxoAgua = 0;
    let potencia = 0;
    let energiaHoje = 0;
    let economia = 0;

    let historicoTemperatura = [];
    let historicoEnergia = [];

    /* =====================================================
       LOADER
       ===================================================== */

    const loader = document.getElementById("loader");

    if (loader) {
        window.addEventListener("load", () => {
            setTimeout(() => {
                loader.classList.add("hidden");

                setTimeout(() => {
                    loader.remove();
                }, 600);

            }, 800);
        });
    }


    /* =====================================================
       MENU RESPONSIVO
       ===================================================== */

    const menuButton =
        document.querySelector(".menu-toggle") ||
        document.querySelector("#menu-toggle");

    const menu =
        document.querySelector(".nav-menu") ||
        document.querySelector("nav ul") ||
        document.querySelector(".menu");

    if (menuButton && menu) {

        menuButton.addEventListener("click", () => {
            menu.classList.toggle("active");
            menuButton.classList.toggle("active");

            const aberto = menu.classList.contains("active");

            menuButton.setAttribute(
                "aria-expanded",
                aberto ? "true" : "false"
            );
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
                menuButton.classList.remove("active");
            });
        });
    }


    /* =====================================================
       NAVEGAÇÃO SUAVE
       ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const destino = link.getAttribute("href");

            if (!destino || destino === "#") return;

            const elemento = document.querySelector(destino);

            if (elemento) {
                event.preventDefault();

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    /* =====================================================
       DASHBOARD
       ===================================================== */

    function atualizarDashboard() {

        // Variação natural da temperatura
        if (sistemaLigado) {

            const ganhoSolar =
                (irradiacao / 1000) *
                CONFIG.eficienciaSolar *
                0.08;

            const perda =
                Math.max(0, (temperatura - temperaturaExterna) * 0.012);

            temperatura += ganhoSolar - perda;

            if (modoAutomatico && temperatura >= CONFIG.temperaturaIdeal) {
                potencia = Math.max(0, potencia - 100);
            } else {
                potencia = Math.min(
                    1000,
                    potencia + (irradiacao * 0.45)
                );
            }

        } else {

            temperatura -= 0.015;
            potencia = 0;
        }

        temperatura = Math.max(
            CONFIG.temperaturaMinima - 2,
            Math.min(CONFIG.temperaturaMaxima, temperatura)
        );


        // Fluxo da água
        fluxoAgua = sistemaLigado
            ? 12 + Math.random() * 4
            : 0;


        // Energia
        if (sistemaLigado) {
            energiaHoje += potencia / 1000 / 120;
        }


        // Economia estimada
        economia = energiaHoje * 0.82;


        // Histórico
        historicoTemperatura.push({
            hora: new Date(),
            valor: temperatura
        });

        historicoEnergia.push({
            hora: new Date(),
            valor: energiaHoje
        });


        if (historicoTemperatura.length > 20) {
            historicoTemperatura.shift();
        }

        if (historicoEnergia.length > 20) {
            historicoEnergia.shift();
        }


        atualizarElementosDashboard();
    }


    /* =====================================================
       ATUALIZAÇÃO DOS ELEMENTOS
       ===================================================== */

    function atualizarElemento(id, valor) {

        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }


    function atualizarElementosDashboard() {

        atualizarElemento(
            "pool-temperature",
            `${temperatura.toFixed(1)} °C`
        );

        atualizarElemento(
            "temperature",
            `${temperatura.toFixed(1)} °C`
        );

        atualizarElemento(
            "external-temperature",
            `${temperaturaExterna.toFixed(1)} °C`
        );

        atualizarElemento(
            "irradiance",
            `${Math.round(irradiacao)} W/m²`
        );

        atualizarElemento(
            "humidity",
            `${Math.round(umidade)}%`
        );

        atualizarElemento(
            "pressure",
            `${Math.round(pressao)} hPa`
        );

        atualizarElemento(
            "water-flow",
            `${fluxoAgua.toFixed(1)} L/min`
        );

        atualizarElemento(
            "power",
            `${Math.round(potencia)} W`
        );

        atualizarElemento(
            "energy-today",
            `${energiaHoje.toFixed(2)} kWh`
        );

        atualizarElemento(
            "economy",
            `R$ ${economia.toFixed(2)}`
        );


        // Status
        const status = document.getElementById("system-status");

        if (status) {

            if (!sistemaLigado) {

                status.textContent = "DESLIGADO";
                status.className = "status offline";

            } else if (temperatura >= CONFIG.temperaturaIdeal) {

                status.textContent = "TEMPERATURA IDEAL";
                status.className = "status online";

            } else {

                status.textContent = "AQUECENDO";
                status.className = "status heating";
            }
        }
    }


    /* =====================================================
       BOTÃO LIGA/DESLIGA
       ===================================================== */

    const systemButton =
        document.getElementById("system-toggle") ||
        document.getElementById("toggle-system");

    if (systemButton) {

        systemButton.addEventListener("click", () => {

            sistemaLigado = !sistemaLigado;

            systemButton.textContent =
                sistemaLigado
                    ? "Desligar sistema"
                    : "Ligar sistema";

            systemButton.classList.toggle(
                "active",
                sistemaLigado
            );

            atualizarElementosDashboard();
        });
    }


    /* =====================================================
       MODO AUTOMÁTICO
       ===================================================== */

    const automaticButton =
        document.getElementById("automatic-mode") ||
        document.getElementById("auto-mode");

    if (automaticButton) {

        automaticButton.addEventListener("click", () => {

            modoAutomatico = !modoAutomatico;

            automaticButton.textContent =
                modoAutomatico
                    ? "Modo automático: ON"
                    : "Modo automático: OFF";

            automaticButton.classList.toggle(
                "active",
                modoAutomatico
            );
        });
    }


    /* =====================================================
       SIMULAÇÃO DO CLIMA
       ===================================================== */

    function atualizarClima() {

        const hora = new Date().getHours();

        if (hora >= 6 && hora <= 18) {

            irradiacao += (Math.random() - 0.5) * 100;
            irradiacao = Math.max(
                100,
                Math.min(1000, irradiacao)
            );

            temperaturaExterna +=
                (Math.random() - 0.48) * 0.3;

        } else {

            irradiacao = Math.max(
                0,
                irradiacao - 80
            );

            temperaturaExterna -=
                Math.random() * 0.15;
        }


        umidade +=
            (Math.random() - 0.5) * 2;

        umidade = Math.max(
            35,
            Math.min(95, umidade)
        );


        pressao +=
            (Math.random() - 0.5) * 1.5;


        atualizarElemento(
            "weather-icon",
            irradiacao > 600 ? "☀️" :
            irradiacao > 250 ? "⛅" : "🌙"
        );

        atualizarElemento(
            "weather-condition",
            irradiacao > 600
                ? "Ensolarado"
                : irradiacao > 250
                    ? "Parcialmente nublado"
                    : "Baixa radiação"
        );
    }


    /* =====================================================
       GRÁFICO
       ===================================================== */

    const canvas =
        document.getElementById("temperature-chart");

    let chart;

    if (canvas && typeof Chart !== "undefined") {

        const ctx = canvas.getContext("2d");

        chart = new Chart(ctx, {

            type: "line",

            data: {

                labels: [],

                datasets: [{

                    label: "Temperatura da piscina",

                    data: [],

                    tension: 0.4,

                    fill: true,

                    borderWidth: 3
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                animation: {
                    duration: 500
                },

                scales: {

                    y: {
                        suggestedMin: 20,
                        suggestedMax: 35,
                        title: {
                            display: true,
                            text: "Temperatura (°C)"
                        }
                    },

                    x: {
                        title: {
                            display: true,
                            text: "Horário"
                        }
                    }
                },

                plugins: {

                    legend: {
                        display: true
                    }
                }
            }
        });
    }


    function atualizarGrafico() {

        if (!chart) return;

        chart.data.labels =
            historicoTemperatura.map(item =>
                item.hora.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                )
            );

        chart.data.datasets[0].data =
            historicoTemperatura.map(
                item => item.valor.toFixed(2)
            );

        chart.update();
    }


    /* =====================================================
       SIMULADOR AVANÇADO
       ===================================================== */

    const simulador = {
        volume: 50000,
        temperaturaInicial: 24,
        temperaturaAlvo: 30,
        areaPlacas: 40,
        eficiencia: 0.78,
        irradiacao: 800
    };


    function calcularSimulacao() {

        const energiaNecessaria =
            simulador.volume *
            4.186 *
            (simulador.temperaturaAlvo -
                simulador.temperaturaInicial);


        const energiaSolar =
            simulador.areaPlacas *
            simulador.irradiacao *
            simulador.eficiencia;


        const tempo =
            energiaSolar > 0
                ? energiaNecessaria / energiaSolar
                : Infinity;


        const resultadoHoras =
            tempo / 3600;


        atualizarElemento(
            "simulation-energy",
            `${(energiaNecessaria / 3600).toFixed(2)} kWh`
        );

        atualizarElemento(
            "simulation-time",
            isFinite(resultadoHoras)
                ? `${resultadoHoras.toFixed(1)} horas`
                : "Indisponível"
        );


        atualizarElemento(
            "simulation-efficiency",
            `${(simulador.eficiencia * 100).toFixed(0)}%`
        );


        atualizarElemento(
            "simulation-area",
            `${simulador.areaPlacas.toFixed(1)} m²`
        );
    }


    function pegarValor(id, propriedade) {

        const input = document.getElementById(id);

        if (!input) return;

        input.addEventListener("input", () => {

            simulador[propriedade] =
                Number(input.value);

            calcularSimulacao();
        });
    }


    pegarValor(
        "pool-volume",
        "volume"
    );

    pegarValor(
        "initial-temperature",
        "temperaturaInicial"
    );

    pegarValor(
        "target-temperature",
        "temperaturaAlvo"
    );

    pegarValor(
        "panel-area",
        "areaPlacas"
    );

    pegarValor(
        "solar-irradiance",
        "irradiacao"
    );

    calcularSimulacao();


    /* =====================================================
       DISCO DE NEWTON
       ===================================================== */

    const disco =
        document.getElementById("newton-disc") ||
        document.querySelector(".newton-disc");

    const velocidade =
        document.getElementById("disc-speed");

    let rotacao = 0;
    let velocidadeDisco = 1;

    if (velocidade) {

        velocidade.addEventListener("input", () => {

            velocidadeDisco =
                Number(velocidade.value);
        });
    }


    function animarDisco() {

        if (disco) {

            rotacao +=
                velocidadeDisco * 2;

            disco.style.transform =
                `rotate(${rotacao}deg)`;
        }

        requestAnimationFrame(animarDisco);
    }

    if (disco) {
        animarDisco();
    }


    /* =====================================================
       BOTÃO DISCO DE NEWTON
       ===================================================== */

    const iniciarDisco =
        document.getElementById("start-newton");

    if (iniciarDisco) {

        iniciarDisco.addEventListener("click", () => {

            velocidadeDisco =
                velocidadeDisco === 0
                    ? 1
                    : 0;
        });
    }


    /* =====================================================
       FAQ
       ===================================================== */

    document.querySelectorAll(
        ".faq-question, .faq-pergunta"
    ).forEach(pergunta => {

        pergunta.addEventListener("click", () => {

            const item =
                pergunta.parentElement;

            const resposta =
                item.querySelector(
                    ".faq-answer, .faq-resposta"
                );

            const aberto =
                item.classList.contains("active");


            document.querySelectorAll(
                ".faq-item"
            ).forEach(outro => {

                outro.classList.remove("active");

                const r =
                    outro.querySelector(
                        ".faq-answer, .faq-resposta"
                    );

                if (r) {
                    r.style.maxHeight = null;
                }
            });


            if (!aberto) {

                item.classList.add("active");

                if (resposta) {
                    resposta.style.maxHeight =
                        resposta.scrollHeight + "px";
                }
            }
        });
    });


    /* =====================================================
       ACESSIBILIDADE
       ===================================================== */

    let tamanhoFonte = 100;

    const aumentarFonte =
        document.getElementById("increase-font");

    const diminuirFonte =
        document.getElementById("decrease-font");

    const resetFonte =
        document.getElementById("reset-font");

    function aplicarFonte() {

        document.documentElement.style.fontSize =
            `${tamanhoFonte}%`;
    }


    if (aumentarFonte) {

        aumentarFonte.addEventListener(
            "click",
            () => {

                if (tamanhoFonte < 140) {
                    tamanhoFonte += 10;
                    aplicarFonte();
                }
            }
        );
    }


    if (diminuirFonte) {

        diminuirFonte.addEventListener(
            "click",
            () => {

                if (tamanhoFonte > 80) {
                    tamanhoFonte -= 10;
                    aplicarFonte();
                }
            }
        );
    }


    if (resetFonte) {

        resetFonte.addEventListener(
            "click",
            () => {

                tamanhoFonte = 100;
                aplicarFonte();
            }
        );
    }


    /* =====================================================
       ALTO CONTRASTE
       ===================================================== */

    const contraste =
        document.getElementById("high-contrast");

    if (contraste) {

        contraste.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "high-contrast"
                );
            }
        );
    }


    /* =====================================================
       REDUÇÃO DE ANIMAÇÕES
       ===================================================== */

    const reduzirAnimacao =
        document.getElementById("reduce-motion");

    if (reduzirAnimacao) {

        reduzirAnimacao.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "reduce-motion"
                );
            }
        );
    }


    /* =====================================================
       LEITOR DE TEXTO
       ===================================================== */

    const leitor =
        document.getElementById("text-reader");

    if (leitor && "speechSynthesis" in window) {

        leitor.addEventListener(
            "click",
            () => {

                const texto =
                    document.body.innerText;

                const fala =
                    new SpeechSynthesisUtterance(texto);

                fala.lang = "pt-BR";
                fala.rate = 0.9;

                speechSynthesis.cancel();
                speechSynthesis.speak(fala);
            }
        );
    }


    /* =====================================================
       BOTÃO VOLTAR AO TOPO
       ===================================================== */

    const topo =
        document.getElementById("back-to-top");

    if (topo) {

        window.addEventListener(
            "scroll",
            () => {

                topo.classList.toggle(
                    "visible",
                    window.scrollY > 500
                );
            }
        );

        topo.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    /* =====================================================
       ANIMAÇÃO DE ELEMENTOS AO ENTRAR NA TELA
       ===================================================== */

    const observador =
        new IntersectionObserver(
            (elementos) => {

                elementos.forEach(elemento => {

                    if (elemento.isIntersecting) {

                        elemento.target.classList.add(
                            "show"
                        );

                        observador.unobserve(
                            elemento.target
                        );
                    }
                });

            },
            {
                threshold: 0.15
            }
        );


    document
        .querySelectorAll(
            ".reveal, .animate-on-scroll"
        )
        .forEach(elemento => {

            observador.observe(elemento);
        });


    /* =====================================================
       CONTADORES ANIMADOS
       ===================================================== */

    function contador(elemento) {

        const alvo =
            Number(elemento.dataset.target);

        if (isNaN(alvo)) return;

        let atual = 0;

        const incremento =
            alvo / 60;

        function atualizar() {

            atual += incremento;

            if (atual >= alvo) {

                elemento.textContent =
                    alvo.toLocaleString("pt-BR");

                return;
            }

            elemento.textContent =
                Math.floor(atual)
                    .toLocaleString("pt-BR");

            requestAnimationFrame(atualizar);
        }

        atualizar();
    }


    document
        .querySelectorAll("[data-target]")
        .forEach(contador);


    /* =====================================================
       ALERTAS DO SISTEMA
       ===================================================== */

    function verificarSistema() {

        const alerta =
            document.getElementById("system-alert");

        if (!alerta) return;


        if (irradiacao < 150) {

            alerta.textContent =
                "⚠️ Baixa radiação solar detectada.";

            alerta.className =
                "system-alert warning";

        } else if (temperatura >= CONFIG.temperaturaIdeal) {

            alerta.textContent =
                "✅ Piscina na temperatura ideal.";

            alerta.className =
                "system-alert success";

        } else {

            alerta.textContent =
                "☀️ Sistema solar aquecendo a piscina.";

            alerta.className =
                "system-alert info";
        }
    }


    /* =====================================================
       SENSOR VISUAL
       ===================================================== */

    function atualizarSensores() {

        const sensores = {

            solar:
                irradiacao > 500
                    ? "NORMAL"
                    : "BAIXA",

            temperatura:
                temperatura >= 20
                    ? "NORMAL"
                    : "BAIXA",

            fluxo:
                fluxoAgua > 10
                    ? "NORMAL"
                    : "BAIXO",

            umidade:
                umidade > 30
                    ? "NORMAL"
                    : "BAIXA"
        };


        Object.entries(sensores).forEach(
            ([sensor, status]) => {

                const elemento =
                    document.getElementById(
                        `sensor-${sensor}`
                    );

                if (elemento) {

                    elemento.textContent =
                        status;

                    elemento.className =
                        status === "NORMAL"
                            ? "sensor normal"
                            : "sensor warning";
                }
            }
        );
    }


    /* =====================================================
       RELÓGIO
       ===================================================== */

    function atualizarRelogio() {

        const relogio =
            document.getElementById("system-clock");

        if (relogio) {

            relogio.textContent =
                new Date().toLocaleTimeString(
                    "pt-BR"
                );
        }
    }


    /* =====================================================
       CICLOS DO SISTEMA
       ===================================================== */

    atualizarDashboard();
    atualizarClima();
    atualizarSensores();
    verificarSistema();
    atualizarRelogio();


    setInterval(() => {

        atualizarDashboard();
        atualizarSensores();
        verificarSistema();

    }, CONFIG.intervaloDashboard);


    setInterval(() => {

        atualizarClima();

    }, 4000);


    setInterval(() => {

        atualizarGrafico();

    }, CONFIG.intervaloGrafico);


    setInterval(() => {

        atualizarRelogio();

    }, 1000);


    /* =====================================================
       MENSAGEM NO CONSOLE
       ===================================================== */

    console.log(
        "%c CEP AQUA SOLAR ",
        "font-size:20px;font-weight:bold;"
    );

    console.log(
        "Sistema de automação carregado com sucesso."
    );

});
