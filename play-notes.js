var audioContext;

function startNote(gain, freq, lightness, delay) {
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = freq;
    oscillator.type = "sine";
    const oscillatorGain = audioContext.createGain();
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(audioContext.destination);
    oscillatorGain.gain.cancelScheduledValues(delay);
    oscillatorGain.gain.setValueAtTime(0, delay);
    oscillatorGain.gain.linearRampToValueAtTime(gain, delay + (1 - lightness) * .025);
    oscillatorGain.gain.linearRampToValueAtTime(0, delay + .48);
    oscillator.start(delay);
    oscillator.stop(delay + .5);
};

function playNotes(data, key, mode) {
    const keyShift = {
        'G': -5,
        'Ab': -4, 
        'A': -3,
        'Bb': -2,
        'B': -1,
        'C': 0,
        'Db': 1,
        'D': 2,
        'Eb': 3,
        'E': 4,
        'F': 5,
        'Gb': 6
    }

    if (typeof audioContext !== 'undefined') {
        audioContext.close();
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    const majorFreqs = [261.63, 293.67, 329.63, 349.23, 392, 440, 493.89];
    const minorFreqs = [261.63, 293.67, 311.13, 349.23, 392, 415.31, 493.89];
    let freqs = [];
    if (mode == 'major') {
        for (let i = 0; i < majorFreqs.length; i++) {
            freqs.push(Math.pow(2, keyShift[key] / 12) * majorFreqs[i]);
        }
    }
    else {
        for (let i = 0; i < majorFreqs.length; i++) {
            freqs.push(Math.pow(2, keyShift[key] / 12) * minorFreqs[i]);
        }
    }
    let oscillators = [];
    for (let i = 0; i < data.length; i += 3) {
        const pitch = Math.round(data[i] * 7 / 360) % 7;
        const gain = data[i+1];
        const lightness = data[i+2];
        console.log(pitch, gain, lightness);
        startNote(gain, freqs[pitch], lightness, i / 3 / 2);
    }
};

export { playNotes };
