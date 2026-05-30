function mostrarJogo() {
    document.getElementById('menuInicial').style.display = 'none';
    document.getElementById('placar').classList.remove('hidden');
    document.getElementById('jogadorAtual').classList.remove('hidden');
    document.getElementById('game').classList.add('active');
}

function esconderJogo() {
    document.getElementById('game').classList.remove('active');
    document.getElementById('placar').classList.add('hidden');
    document.getElementById('jogadorAtual').classList.add('hidden');
    document.getElementById('menuInicial').style.display = 'block';
}

function Jogador(nome, forma) {
    this.nome = nome;
    this.forma = forma;
}

var jogador1, jogador2;
var jogadorAtual;
var tabuleiro = new Array(9);
var turno = 0;
var jogoFinalizado = false;
var pontosJogador1 = 0;
var pontosJogador2 = 0;

const formas = ['🌟', '❤️'];

function iniciarJogo() {
    var nomeJogador1 = document.getElementById('jogador1').value;
    var nomeJogador2 = document.getElementById('jogador2').value;

    if(nomeJogador1.trim() === '' || nomeJogador2.trim() === '') {
        mostrarPopup('Digite o nome dos dois jogadores!');
        return;
    }

    jogador1 = new Jogador(nomeJogador1, 0);
    jogador2 = new Jogador(nomeJogador2, 1);

    jogadorAtual = jogador1;

    atualizarPlacar();
    nomeJogadorAtual();
    mostrarJogo();
}

function resetPartida() {
    tabuleiro = new Array(9);
    const cells = document.querySelectorAll('td');

    cells.forEach(cel => {
        cel.textContent = '';
        cel.classList.remove('win');
    });

    jogoFinalizado = false;
    turno = 0;
    jogadorAtual = jogador1;

    nomeJogadorAtual();
}

function resetJogo() {
    resetPartida();

    pontosJogador1 = 0;
    pontosJogador2 = 0;

    atualizarPlacar();
    esconderJogo();
}

function nomeJogadorAtual() {
    document.getElementById('jogadorAtual').innerHTML = `${jogadorAtual.nome} (${formas[jogadorAtual.forma]})`;
    document.getElementById('jogadorAtual').classList.add('ativo');
}

function atualizarPlacar() {
    document.getElementById('pontosJogador1').innerHTML = `${formas[jogador1.forma]} ${jogador1.nome}: ${pontosJogador1}`;
    document.getElementById('pontosJogador2').innerHTML = `${formas[jogador2.forma]} ${jogador2.nome}: ${pontosJogador2}`;
}

const combinacaoVitoria = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

function verificarVitoria() {
    for(let combinacao of combinacaoVitoria) {
        const [a, b, c] = combinacao;

        if(tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c]) {
            jogoFinalizado = true;

            marcarVitoria(a, b, c);

            const vencedor = jogadorAtual;

            if(jogadorAtual === jogador1) {
                pontosJogador1++;
            } else {
                pontosJogador2++;
            }

            atualizarPlacar();
            dispararConfete();
            beep(900, 0.2);
            setTimeout(() => beep(1200, 0.2), 100);
            setTimeout(() => {
                mostrarPopup(vencedor.nome + ' venceu!');
                resetPartida();
            }, 300);

            return true;
        }
    }

    return false;
}

function verificarEmpate() {
    let preenchido = tabuleiro.filter(v => v !== undefined).length;

    if(preenchido === 9) {
        beep(400, 0.3);
        
        setTimeout(() => {
            mostrarPopup('Empate!');
            resetPartida();
        }, 200);
    }
}

function inserirFormas(cel, pos) {
    beep(600, 0.05);

    if(jogoFinalizado) return;
    if(tabuleiro[pos] === undefined) {
        cel.innerHTML = formas[jogadorAtual.forma];
        tabuleiro[pos] = formas[jogadorAtual.forma];

        if(!verificarVitoria()) {
            verificarEmpate();
        }

        turno = 1 - turno;
        jogadorAtual = (turno === 0) ? jogador1 : jogador2;

        nomeJogadorAtual();
    } else {
        mostrarPopup('Essa posição já foi marcada!')
    }
}

document.getElementById('game').addEventListener('click', function(e) {
    if(jogoFinalizado) return;

    if(e.target.tagName === 'TD') {
        const pos = e.target.dataset.pos;

        inserirFormas(e.target, pos);
    }
});

function marcarVitoria(a, b, c) {
    const celulaA = document.querySelector(`[data-pos="${a}"]`);
    const celulaB = document.querySelector(`[data-pos="${b}"]`);
    const celulaC = document.querySelector(`[data-pos="${c}"]`);

    setTimeout(() => {
        celulaA.classList.add('win');
        celulaB.classList.add('win');
        celulaC.classList.add('win');
    }, 50);
}

function mostrarPopup(texto) {
    document.getElementById('mensagemPopup').innerHTML = texto;
    document.getElementById('popup').classList.remove('hidden');
}

function fecharPopup() {
    document.getElementById('popup').classList.add('hidden');
}

function dispararConfete() {
    const padrao = {
        spread: 360,
        ticks: 80,
        gravity: 0.8,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#ffd700', '#ffffff', '#2563eb']
    };

    confetti({
        ...padrao,
        particleCount: 80,
        origin: {y: 0.6}
    });
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(frequencia = 440, duracao = 0.1) {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.frequency.value = frequencia;
    oscillator.type = "sine";
    oscillator.start();
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracao);
    oscillator.stop(audioCtx.currentTime + duracao);
}