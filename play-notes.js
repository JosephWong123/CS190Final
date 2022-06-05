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

function playNotes(data) {
    if (typeof audioContext !== 'undefined') {
        audioContext.close();
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    const freqs = [261.63, 293.67, 329.63, 349.23, 392, 440, 493.89];
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
