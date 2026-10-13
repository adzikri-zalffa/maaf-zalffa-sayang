const openLetter = document.getElementById('openLetter');
const letter = document.getElementById('letter');
const forgiveBtn = document.getElementById('forgiveBtn');
const reply = document.getElementById('reply');

openLetter.addEventListener('click', () => {
  letter.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

forgiveBtn.addEventListener('click', () => {
  reply.textContent = 'Terima kasih sudah membaca sampai akhir. Perasaanmu tetap penting. ♡';
  forgiveBtn.textContent = 'Peluk jauh untuk kamu 🤍';
});

// Musik instrumental sederhana dibuat langsung oleh browser, tanpa file lagu berhak cipta.
// Tekan tombol musik agar audio mulai, karena browser memerlukan interaksi pengguna.
let audioContext = null;
let masterGain = null;
let musicTimer = null;
let noteIndex = 0;
let isPlaying = false;

const melody = [
  [523.25, 0.32], [659.25, 0.32], [783.99, 0.48], [659.25, 0.32],
  [587.33, 0.32], [659.25, 0.32], [698.46, 0.48], [587.33, 0.48],
  [523.25, 0.32], [587.33, 0.32], [659.25, 0.48], [523.25, 0.48],
  [440.00, 0.32], [523.25, 0.32], [587.33, 0.65], [523.25, 0.65]
];

function playNote(freq, duration, when) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.075, when + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(when);
  osc.stop(when + duration + 0.03);

  // Nada harmoni lembut satu oktaf lebih rendah.
  const pad = audioContext.createOscillator();
  const padGain = audioContext.createGain();
  pad.type = 'triangle';
  pad.frequency.setValueAtTime(freq / 2, when);
  padGain.gain.setValueAtTime(0.0001, when);
  padGain.gain.exponentialRampToValueAtTime(0.018, when + 0.06);
  padGain.gain.exponentialRampToValueAtTime(0.0001, when + duration * 1.5);
  pad.connect(padGain);
  padGain.connect(masterGain);
  pad.start(when);
  pad.stop(when + duration * 1.5 + 0.03);
}

function scheduleMusic() {
  if (!isPlaying || !audioContext) return;
  const [freq, duration] = melody[noteIndex % melody.length];
  playNote(freq, duration, audioContext.currentTime + 0.03);
  noteIndex++;
  musicTimer = setTimeout(scheduleMusic, duration * 1000);
}

async function toggleMusic() {
  const btn = document.getElementById('musicBtn');
  const icon = document.getElementById('musicIcon');
  const label = document.getElementById('musicLabel');

  if (isPlaying) {
    isPlaying = false;
    clearTimeout(musicTimer);
    if (audioContext && audioContext.state !== 'closed') await audioContext.suspend();
    btn.classList.remove('playing');
    btn.setAttribute('aria-pressed', 'false');
    icon.textContent = '♫';
    label.textContent = 'Putar musik';
    return;
  }

  try {
    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.75;
      masterGain.connect(audioContext.destination);
    }
    await audioContext.resume();
    isPlaying = true;
    btn.classList.add('playing');
    btn.setAttribute('aria-pressed', 'true');
    icon.textContent = '♪';
    label.textContent = 'Musik menyala';
    scheduleMusic();
  } catch (error) {
    label.textContent = 'Musik tidak tersedia';
  }
}
document.getElementById('musicBtn').addEventListener('click', toggleMusic);
