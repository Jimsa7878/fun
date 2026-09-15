import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const CATEGORIES = ['SONG TITLE', 'EXACT YEAR', 'ARTIST / BAND', 'DECADE', 'YEAR +/- 3'];
const DEFAULT_DURATION = 45;

function playTone(frequency, duration = 100) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.06;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    window.setTimeout(() => {
      oscillator.stop();
      context.close();
    }, duration);
  } catch {
    // Sound is optional and should not stop the game in browsers without AudioContext.
  }
}

function App() {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [category, setCategory] = useState(null);
  const lastCategory = useRef(null);

  const pickCategory = () => {
    const available = CATEGORIES.filter((item) => item !== lastCategory.current);
    const next = available[Math.floor(Math.random() * available.length)];
    lastCategory.current = next;
    setCategory(next);
    return next;
  };

  const newRound = () => {
    setPhase('ready');
    setCountdown(null);
    setRemaining(duration);
    pickCategory();
  };

  const startRound = () => {
    if (phase === 'running' || phase === 'countdown') return;
    if (!category) pickCategory();
    setPhase('countdown');
    setCountdown(3);
    playTone(660);
  };

  const pauseRound = () => {
    if (phase !== 'running') return;
    setPhase('paused');
    playTone(500);
  };

  useEffect(() => {
    if (phase !== 'countdown') return undefined;
    const countdownTimer = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(countdownTimer);
          setRemaining(duration);
          setPhase('running');
          playTone(1000, 180);
          return null;
        }
        playTone(660);
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdownTimer);
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setPhase('done');
          playTone(220, 450);
          return 0;
        }
        if (value <= 11) playTone(700, 70);
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        phase === 'running' ? pauseRound() : startRound();
      }
      if (event.key.toLowerCase() === 'n') newRound();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const changeDuration = (event) => {
    const nextDuration = Number(event.target.value);
    setDuration(nextDuration);
    if (phase === 'ready' || phase === 'paused') setRemaining(nextDuration);
  };

  const categoryText = phase === 'done' ? "TIME'S UP!" : category || 'PRESS NEW ROUND';
  const statusText = {
    ready: 'Category selected. Start the countdown when you are ready.',
    countdown: 'Get ready...',
    running: `Go! ${duration} seconds on the clock.`,
    paused: 'Paused. Continue when you are ready.',
    done: "Time's up - reveal the correct answer!"
  }[phase];

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">ITC</div>
        <div>
          <p className="eyebrow">Disco music bingo</p>
          <h1>Hitster Bingo</h1>
        </div>
        <label className="duration-control">
          <span>Time</span>
          <select value={duration} onChange={changeDuration} disabled={phase === 'countdown' || phase === 'running'}>
            <option value="30">30 sek</option>
            <option value="45">45 sek</option>
            <option value="60">60 sek</option>
            <option value="75">75 sek</option>
            <option value="90">90 sek</option>
          </select>
        </label>
      </header>

      <section className="game-panel" aria-live="polite">
        <div className="panel-kicker">Next challenge</div>
        <div className={`category ${phase === 'done' ? 'category--done' : ''}`}>
          {countdown ? <span className="countdown">{countdown}</span> : categoryText}
        </div>
        <div className={`timer ${phase === 'running' && remaining <= 10 ? 'timer--warning' : ''} ${phase === 'done' ? 'timer--done' : ''}`}>
          {remaining}
        </div>
        <p className="status">{statusText}</p>

        <div className="controls">
          <button className="button button--primary" onClick={startRound} disabled={phase === 'running' || phase === 'countdown' || phase === 'done'}>
            {phase === 'paused' ? 'RESUME' : 'START'}
          </button>
          <button className="button button--quiet" onClick={pauseRound} disabled={phase !== 'running'}>PAUSE</button>
          <button className="button button--quiet" onClick={newRound}>NEW ROUND</button>
        </div>
      </section>

      <footer className="footer-note">
        <span>Categories from the ITC Hitster Bingo PDF</span>
        <span className="keyboard-note">Space: start/pause · N: new round</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
