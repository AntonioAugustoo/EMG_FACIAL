let dom = {};

// ==================== MODO DEMO ====================
// 🎭 Para GitHub Pages: defina como true
// 🔌 Para ESP32 real: defina como false
const isDemoMode = true; // Mude para true para ativar o modo demo com dados simulados

let demoTimestamp = 0; // Contador de tempo simulado

// Estado da simulação do sorriso (máquina de estados)
let sorrisoState = {
    fase: 'repouso',        // 'repouso', 'ataque', 'sustentacao', 'queda'
    valorAtual: 200,        // Valor ADC atual (inicia em repouso)
    valorAlvo: 200,         // Valor ADC alvo
    tempoNaFase: 0,         // Tempo decorrido na fase atual (ms)
    duracaoFase: 0,         // Duração planejada da fase (ms)
    proximoEvento: 2000     // Tempo até próximo sorriso (ms)
};
// ===================================================

const config = {

    DATA_FETCH_INTERVAL_MS: 10, 

    MAX_DATA_POINTS: 300, 

    TOAST_DURATION_MS: 3000,

    MAX_ADC_VALUE: 4095, 

    

    VISUAL_Y_MAX: 1200, 

    

    VISUAL_X_MAX_S: 3,  

};



const state = {

    isMonitoring: false,

    startTime: null,

    realTimeData: [], 

    dataForSaving: [], 

    savedFiles: [],

    statistics: { currentADC: 0, totalSamples: 0 }, 

    intervals: {} 

};



addEventListener('DOMContentLoaded', () => {

    dom = {

        startBtn: document.getElementById('startBtn'),

        stopBtn: document.getElementById('stopBtn'),

        clearBtn: document.getElementById('clearBtn'),

        toast: document.getElementById('toast'),

        fileHistoryBody: document.getElementById('fileHistoryBody'),

        dataTableBody: document.getElementById('dataTableBody'),

        currentAmplitude: document.getElementById('currentAmplitude'), 

        avgFrequency: document.getElementById('avgFrequency'),

        recordingTime: document.getElementById('recordingTime'),

        signalChart: document.getElementById('signalChart'), 

        saveModal: document.getElementById('saveModal'),

        btnNo: document.getElementById('btnNo'),

        btnYes: document.getElementById('btnYes'),

        btnSave: document.getElementById('btnSave'),

        fileName: document.getElementById('fileName'),

        inputGroup: document.getElementById('inputGroup'),

        modalBody: document.getElementById('modalBody'),

        connectionStatus: document.getElementById('connectionStatus'),

        clock: document.getElementById('clock'),

    };



    dom.startBtn.addEventListener('click', iniciarMonitoramento);

    dom.stopBtn.addEventListener('click', pararESalvar);

    dom.clearBtn.addEventListener('click', limparDados);

    dom.btnNo.addEventListener('click', fecharModal);

    dom.btnYes.addEventListener('click', mostrarInputNome);

    dom.btnSave.addEventListener('click', salvarArquivo);

    dom.saveModal.addEventListener('click', (e) => {

        if (e.target === dom.saveModal) fecharModal();

    });



    redimensionarCanvas();

    window.addEventListener('resize', () => {

        clearTimeout(window.resizeTimeout);

        window.resizeTimeout = setTimeout(redimensionarCanvas, 200);

    });

    

    config.MAX_DATA_POINTS = (config.VISUAL_X_MAX_S * 1000) / config.DATA_FETCH_INTERVAL_MS;

    

    requestAnimationFrame(animarGrafico); 

    renderizarHistorico(); 

});

// ==================== GERADOR DE DADOS DEMO ====================
/**
 * Gera dados simulados de EMG com ciclo de vida realista do sorriso
 * Anatomia do sorriso:
 * - Repouso: 100-300 ADC (ruído basal)
 * - Ataque (onset): 0.5-0.7s subida gradual
 * - Sustentação (apex): 1-2s no pico (1500-4000 ADC)
 * - Queda (offset): descida gradual ao repouso
 */
function gerarDadosDemo() {
    // Atualiza o timestamp simulado
    demoTimestamp += config.DATA_FETCH_INTERVAL_MS;
    sorrisoState.tempoNaFase += config.DATA_FETCH_INTERVAL_MS;
    
    // Máquina de estados do sorriso
    switch (sorrisoState.fase) {
        case 'repouso':
            // Em repouso: pequenas variações em torno de 150-250 ADC
            sorrisoState.valorAtual = 180 + Math.random() * 80 + Math.sin(demoTimestamp / 100) * 20;
            
            // Verifica se é hora de iniciar um sorriso
            if (sorrisoState.tempoNaFase >= sorrisoState.proximoEvento) {
                iniciarSorriso();
            }
            break;
            
        case 'ataque':
            // Subida gradual (onset): interpolação suave do repouso ao pico
            const progressoAtaque = sorrisoState.tempoNaFase / sorrisoState.duracaoFase;
            const easeOutAtaque = 1 - Math.pow(1 - progressoAtaque, 3); // Curva de aceleração
            
            sorrisoState.valorAtual = lerp(200, sorrisoState.valorAlvo, easeOutAtaque);
            
            // Adiciona micro-variações naturais
            sorrisoState.valorAtual += (Math.random() - 0.5) * 50;
            
            if (sorrisoState.tempoNaFase >= sorrisoState.duracaoFase) {
                sorrisoState.fase = 'sustentacao';
                sorrisoState.tempoNaFase = 0;
                sorrisoState.duracaoFase = 1000 + Math.random() * 1000; // 1-2s
            }
            break;
            
        case 'sustentacao':
            // Mantém no pico com pequenas oscilações
            const oscilacao = Math.sin(demoTimestamp / 50) * 30;
            sorrisoState.valorAtual = sorrisoState.valorAlvo + oscilacao + (Math.random() - 0.5) * 40;
            
            if (sorrisoState.tempoNaFase >= sorrisoState.duracaoFase) {
                sorrisoState.fase = 'queda';
                sorrisoState.tempoNaFase = 0;
                sorrisoState.duracaoFase = 500 + Math.random() * 300; // 0.5-0.8s
            }
            break;
            
        case 'queda':
            // Descida gradual (offset): do pico ao repouso
            const progressoQueda = sorrisoState.tempoNaFase / sorrisoState.duracaoFase;
            const easeInQueda = Math.pow(progressoQueda, 2); // Curva de desaceleração
            
            sorrisoState.valorAtual = lerp(sorrisoState.valorAlvo, 200, easeInQueda);
            sorrisoState.valorAtual += (Math.random() - 0.5) * 30;
            
            if (sorrisoState.tempoNaFase >= sorrisoState.duracaoFase) {
                sorrisoState.fase = 'repouso';
                sorrisoState.tempoNaFase = 0;
                sorrisoState.proximoEvento = 2000 + Math.random() * 4000; // 2-6s até próximo sorriso
            }
            break;
    }
    
    // Garante que o valor esteja dentro dos limites do ADC
    const rawValue = Math.max(50, Math.min(4095, Math.floor(sorrisoState.valorAtual)));
    
    // Valor filtrado é suavizado (85-95% do raw)
    const filteredValue = Math.floor(rawValue * (0.88 + Math.random() * 0.07));
    
    return {
        time_ms: demoTimestamp,
        raw: rawValue,
        filtered: filteredValue
    };
}

/**
 * Inicia um novo ciclo de sorriso
 */
function iniciarSorriso() {
    sorrisoState.fase = 'ataque';
    sorrisoState.tempoNaFase = 0;
    sorrisoState.duracaoFase = 500 + Math.random() * 200; // 0.5-0.7s
    
    // Define intensidade do sorriso (leve, moderado ou largo)
    const tipo = Math.random();
    if (tipo < 0.4) {
        // Sorriso leve (40% das vezes): 800-1500 ADC
        sorrisoState.valorAlvo = 800 + Math.random() * 700;
    } else if (tipo < 0.8) {
        // Sorriso moderado (40% das vezes): 1500-2500 ADC
        sorrisoState.valorAlvo = 1500 + Math.random() * 1000;
    } else {
        // Sorriso largo/máximo (20% das vezes): 2500-4000 ADC
        sorrisoState.valorAlvo = 2500 + Math.random() * 1500;
    }
}

/**
 * Interpolação linear entre dois valores
 */
function lerp(inicio, fim, t) {
    return inicio + (fim - inicio) * t;
}
// ================================================================

function buscarDadosRealTime() {

    if (!state.isMonitoring) return; 

    // ==================== MODO DEMO: BYPASS DO FETCH ====================
    if (isDemoMode) {
        // Em modo demo, gera dados simulados sem fazer requisição HTTP
        const dadosSimulados = gerarDadosDemo();
        processarAmostraRealTime(dadosSimulados);
        
        // Agenda próxima chamada
        setTimeout(buscarDadosRealTime, config.DATA_FETCH_INTERVAL_MS);
        return; // Early return: não executa o fetch real
    }
    // ====================================================================

    // MODO REAL: Requisição HTTP para ESP32
    fetch('/live_data') 

        .then(res => {

            if (!res.ok) throw new Error('Network response not ok');

            return res.json(); 

        })

        .then(data => {

            if (data && data.time_ms !== undefined) {

                 processarAmostraRealTime(data); 

            }

        })

        .catch(err => {})

        .finally(() => {

            setTimeout(buscarDadosRealTime, config.DATA_FETCH_INTERVAL_MS);

        });

}



function processarAmostraRealTime(data) {

    if (!state.isMonitoring || data.time_ms === undefined) return; 

    

    const amplitudeFiltrada = data.filtered || 0; 

    const amplitudeBruta = data.raw || 0;

    const timestamp = data.time_ms;



    const newPoint = { 

        timestamp: timestamp, 

        filtered: amplitudeFiltrada, 

        raw: amplitudeBruta,

        dateObj: new Date(state.startTime + timestamp) 

    };



    state.realTimeData.push(newPoint); 

    state.dataForSaving.push(newPoint); 



    state.statistics.currentADC = amplitudeFiltrada;

    

    if (state.realTimeData.length > config.MAX_DATA_POINTS) {

        state.realTimeData.shift(); 

    }

    

    const highlightClass = amplitudeFiltrada > 1000 || amplitudeFiltrada < 100 ? 'highlight-pulse' : '';

    dom.currentAmplitude.innerHTML = `<span class="${highlightClass}">${amplitudeFiltrada}</span> <span class="unit">ADC</span>`; 

    dom.avgFrequency.innerHTML = `${(1000 / config.DATA_FETCH_INTERVAL_MS).toFixed(0)} <span class="unit">Hz</span>`; 

    

    const ultimos = state.realTimeData.slice(-4).reverse();

    dom.dataTableBody.innerHTML = ultimos.map(d => {

        const timeStr = d.dateObj.toLocaleTimeString('pt-BR', { second: '2-digit', minute: '2-digit' }) + ':' + String(d.dateObj.getMilliseconds()).padStart(3, '0');

        const ampHighlight = d.filtered > 1000 ? 'log-highlight' : ''; 

        

        return `

            <div class="log-entry">

                <span class="log-time">${timeStr}</span>

                <span class="log-amplitude ${ampHighlight}">${d.filtered} ADC</span>

            </div>

        `;

    }).join('');

}



function redimensionarCanvas() {

    const container = dom.signalChart.parentElement;

    dom.signalChart.width = container.clientWidth;

    const headerOffset = 50; 

    dom.signalChart.height = container.clientHeight - headerOffset; 

    

    if (dom.signalChart.height <= 50) {

        dom.signalChart.height = 350; 

    }

}



function desenharSinal(ctx, data, property, color, isFiltered = false) {

    const w = ctx.canvas.width;

    const h = ctx.canvas.height;

    const h_plot = h - 40; 

    

    const VISUAL_Y_MAX = config.VISUAL_Y_MAX;

    const scaleY = h_plot / VISUAL_Y_MAX; 

    const stepX = w / (config.MAX_DATA_POINTS - 1); 



    ctx.beginPath();

    ctx.strokeStyle = color; 

    ctx.lineWidth = isFiltered ? 3 : 1;

    ctx.shadowBlur = isFiltered ? 10 : 0; 

    ctx.shadowColor = color;



    data.forEach((pt, i) => {

        const x = i * stepX;

        let y_mapped = pt[property] * scaleY;

        

        if (y_mapped > h_plot) y_mapped = h_plot;

        const y = h_plot - y_mapped;



        if (i === 0) {

            ctx.moveTo(x, y); 

        } else {

            ctx.lineTo(x, y);

        }

    });

    

    ctx.stroke();

    ctx.shadowBlur = 0; 

}



function desenharEixos(ctx, w, h) {

    const divisiones = 5;

    

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; 

    ctx.font = '10px Quicksand';

    

    ctx.textAlign = 'right';

    const VISUAL_Y_MAX = config.VISUAL_Y_MAX;

    

    for (let i = 0; i <= divisiones; i++) {

        const y_pos = (h / divisiones) * i;

        

        ctx.beginPath();

        ctx.moveTo(0, y_pos);

        ctx.lineTo(w, y_pos);

        ctx.stroke();



        const adc_value = Math.round(VISUAL_Y_MAX - (VISUAL_Y_MAX / divisiones) * i);

        if (i < divisiones) { 

            ctx.fillText(`${adc_value}`, w - 5, y_pos + 10); 

        }

    }

    

    ctx.textAlign = 'center';

    

    const data = state.realTimeData;

    const temDados = data.length > 0;

    const timeWindowMS = config.VISUAL_X_MAX_S * 1000;

    

    let now;

    if (temDados) {

        now = data[data.length - 1].dateObj;

    }



    for (let i = 0; i <= divisiones; i++) {

        const x_pos = (w / divisiones) * i;

        

        ctx.beginPath();

        ctx.moveTo(x_pos, 0);

        ctx.lineTo(x_pos, h);

        ctx.stroke();



        let timeStr = "--:--";

        

        if (temDados && now) {

            const timeOffset = timeWindowMS * (1 - (i / divisiones));

            const gridTime = new Date(now.getTime() - timeOffset);

            timeStr = gridTime.toLocaleTimeString('pt-BR', { second: '2-digit' }) + 

                      ':' + String(gridTime.getMilliseconds()).padStart(3, '0').slice(0, 2);

        } else if (i === divisiones) {

            timeStr = "00:00";

        }



        ctx.fillText(timeStr, x_pos, h + 15);

    }

    

    ctx.fillText("Tempo (s:ms)", w / 2, h + 30);

}



function animarGrafico() {

    const ctx = dom.signalChart.getContext('2d');

    const w = dom.signalChart.width;

    const h = dom.signalChart.height - 40; 

    

    ctx.clearRect(0, 0, w, dom.signalChart.height); 

    

    const data = state.realTimeData;

    

    desenharEixos(ctx, w, h);

    

    if (data.length < 2) {

        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';

        ctx.font = '20px Quicksand';

        ctx.textAlign = 'center';

        ctx.fillText('Aguardando Fluxo de Dados...', w / 2, h / 2);

        requestAnimationFrame(animarGrafico); 

        return;

    }



    desenharSinal(ctx, data, 'raw', 'skyblue', false);

    desenharSinal(ctx, data, 'filtered', '#FFD700', true);



    requestAnimationFrame(animarGrafico); 

}



function iniciarMonitoramento() {

    if (state.isMonitoring) return;

    state.isMonitoring = true;

    state.startTime = Date.now();

    state.realTimeData = [];

    state.dataForSaving = []; 

    state.statistics = { currentADC: 0, totalSamples: 0 };

    atualizarUI(true);

    // Reset do timestamp demo ao iniciar nova sessão
    if (isDemoMode) {
        demoTimestamp = 0;
        // Reseta o estado do sorriso para começar em repouso
        sorrisoState = {
            fase: 'repouso',
            valorAtual: 200,
            valorAlvo: 200,
            tempoNaFase: 0,
            duracaoFase: 0,
            proximoEvento: 1000 + Math.random() * 2000 // Primeiro sorriso em 1-3s
        };
        mostrarToast('🎭 MODO DEMO - Dados Simulados');
    } else {
        mostrarToast('✨ CAPTURANDO SINAL EMG...');
        fetch('/start').catch(e => console.error("Falha ao enviar /start:", e)); 
    }

    setTimeout(() => {

        buscarDadosRealTime(); 

        state.intervals.timer = setInterval(atualizarCronometro, 1000);

    }, 100); 

}



function pararESalvar() {

    if (!state.isMonitoring) return;

    state.isMonitoring = false; 

    clearInterval(state.intervals.timer);

    // Só faz fetch para /stop se NÃO estiver em modo demo
    if (!isDemoMode) {
        fetch('/stop').catch(e => console.error("Falha ao enviar /stop:", e));
    }

    atualizarUI(false);

    setTimeout(() => {

        if (state.dataForSaving.length === 0) {

            mostrarToast('Nenhum dado capturado para salvar.');

            return;

        }

        abrirModal();

    }, 100);

}



function gerarEExportarCSV(nomeUsuario) {

    const fileName = `${nomeUsuario.replace(/[^a-z0-9]/gi, '_')}_EMG.csv`;

    const header = 'Timestamp(ms),DataHoraISO,AmplitudeFiltrada(ADC),AmplitudeBruta(ADC)\n'; 

    

    const rows = state.dataForSaving.map(d => 

        `${d.timestamp},${d.dateObj.toISOString()},${d.filtered},${d.raw}`

    ).join('\n');

    

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);



    state.savedFiles.unshift({ nome: fileName, hora: new Date().toLocaleTimeString('pt-BR'), urlBlob: url, dados: state.dataForSaving.slice() });

    renderizarHistorico();

    mostrarToast(`ARQUIVO SALVO: ${fileName}`);

}



function atualizarCronometro() {

    if (!state.startTime) return;

    const diff = Math.floor((Date.now() - state.startTime) / 1000);

    const m = Math.floor(diff / 60).toString().padStart(2,'0');

    const s = (diff % 60).toString().padStart(2,'0');

    dom.recordingTime.textContent = `${m}:${s}`; 

}



function abrirModal() {

    dom.saveModal.classList.add('show');

    dom.inputGroup.classList.add('hidden');

    dom.modalBody.querySelector('.modal-question').style.display = 'block';

    dom.modalBody.querySelector('.modal-buttons').style.display = 'flex';

    dom.fileName.value = `Sessao_${new Date().getHours()}h${new Date().getMinutes()}`;

}



function fecharModal() {

    dom.saveModal.classList.remove('show');

}



function mostrarInputNome() {

    dom.modalBody.querySelector('.modal-question').style.display = 'none';

    dom.modalBody.querySelector('.modal-buttons').style.display = 'none';

    dom.inputGroup.classList.remove('hidden');

    dom.fileName.focus();

}



function salvarArquivo() {

    const nomeArquivo = dom.fileName.value.trim();

    if (!nomeArquivo) {

        mostrarToast('⚠️ Digite um nome para o arquivo!');

        return;

    }

    gerarEExportarCSV(nomeArquivo);

    fecharModal();

}



function renderizarHistorico() {

    const tbody = dom.fileHistoryBody;

    if (state.savedFiles.length === 0) {

        tbody.innerHTML = '<tr><td colspan="3" class="empty">Vamos capturar alguns sorrisos?</td></tr>';

        return;

    }

    tbody.innerHTML = state.savedFiles.map((f, index) => `

        <tr>

            <td>${f.nome}</td>

            <td class="text-secondary">${f.hora}</td>

            <td><button onclick="baixarArquivo(${index})" class="download-link">BAIXAR</button></td>

        </tr>

    `).join('');

}



function baixarArquivo(index) {

    const arquivo = state.savedFiles[index];

    if (!arquivo) return;

    

    const link = document.createElement('a');

    link.href = arquivo.urlBlob;

    link.download = arquivo.nome;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    

    mostrarToast(`📥 Download: ${arquivo.nome}`);

}



function limparDados() {

    if (state.isMonitoring) {

        mostrarToast('⚠️ Pare a captura antes de limpar os dados!');

        return;

    }

    state.realTimeData = [];

    state.dataForSaving = []; 

    state.savedFiles = [];

    dom.dataTableBody.innerHTML = '';

    renderizarHistorico();

    mostrarToast('Dados e histórico de arquivos limpos.');

}



function atualizarUI(isRecording) {

    if (isRecording) {

        dom.startBtn.classList.add('hidden');

        dom.stopBtn.classList.remove('hidden');

        dom.connectionStatus.classList.add('active'); 

    } else {

        dom.startBtn.classList.remove('hidden');

        dom.stopBtn.classList.add('hidden');

        dom.connectionStatus.classList.remove('active');

    }

}



function mostrarToast(msg) {

    dom.toast.textContent = msg;

    dom.toast.classList.add('show');

    setTimeout(() => dom.toast.classList.remove('show'), config.TOAST_DURATION_MS);

}