import { euclideanDistance } from "./key.js";

var audioContext;

function playNote(position, duration, gain, freq, attackTime) {
    const oscillator = audioContext.createOscillator();
    
    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    const oscillatorGain = audioContext.createGain();
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(audioContext.destination);

    oscillatorGain.gain.setValueAtTime(0, position);
    oscillatorGain.gain.linearRampToValueAtTime(gain / 2, position + attackTime);
    oscillatorGain.gain.linearRampToValueAtTime(0, position + duration);

    oscillator.start(position);
    oscillator.stop(position + duration);
}

function setUpAudioContext() {
    if (audioContext != null && audioContext.state != "closed") {
        audioContext.close();
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
}

function getKeysFreqs(key, mode) {
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

    var keys = [[255, 0, 0], [145, 0, 255], [255, 255, 0], [183, 70, 139], [195, 243, 255], [173, 0, 52], [125, 139, 253], [255, 126, 0], [188, 116, 253], [52, 204, 51], [169, 102, 125], [144, 201, 255]];
    // const colorMap = [0'C', 1'Db', 2'D', 3'Eb', 4'E', 5'F', 6'Gb', 7'G', 8'Ab', 9'A', 10'Bb', 11'B'];
    const majorFreqs = [261.63, 293.67, 329.63, 349.23, 392, 440, 493.89];
    const minorFreqs = [261.63, 293.67, 311.13, 349.23, 392, 415.31, 493.89];
    let freqs = [];
    if (mode == 'major') {
        for (let i = 0; i < majorFreqs.length; i++) {
            freqs.push(Math.pow(2, keyShift[key] / 12) * majorFreqs[i]);
        }
        // Remove all the non-major tones
        keys.splice(10, 1);
        keys.splice(8, 1);
        keys.splice(6, 1);
        keys.splice(3, 1);
        keys.splice(1, 1);
    }
    else {
        for (let i = 0; i < majorFreqs.length; i++) {
            freqs.push(Math.pow(2, keyShift[key] / 12) * minorFreqs[i]);
        }
        // Remove all the non-minor tones
        keys.splice(10, 1);
        keys.splice(9, 1);
        keys.splice(6, 1);
        keys.splice(4, 1);
        keys.splice(1, 1);
    }

    return [keys, freqs];
}

function playNotes(HSLdata, RGBdata, key, mode, rootHue) {
    setUpAudioContext();
    const [keys, freqs] = getKeysFreqs(key, mode);

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        let data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const pitch = Math.round((HSLdata[i] - rootHue + 360) / 360 * 7) % 7;
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        playNote(i / 3 / 2, 0.5, gain, freqs[pitch], (1 - lightness) * 0.025);
    }
}

function playScriabinNotes(HSLdata, RGBdata, key, mode) {
    setUpAudioContext();
    const [keys, freqs] = getKeysFreqs(key, mode);

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        // const pitch = Math.round(data[i] * 7 / 360) % 7;
        let data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        var minDistance = euclideanDistance(data, keys[0]);
        var pitch = 0;
        for (let j = 1; j < keys.length; j++) {
            let distance = euclideanDistance(data, keys[j]);
            if (distance < minDistance) {
                minDistance = distance;
                pitch = j;
            }
        }
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        // console.log(pitch, gain, lightness);
        playNote(i / 3 / 2, 0.5, gain, freqs[pitch], (1 - lightness) * 0.025);
    }
}

function playChords(HSLdata, RGBdata, key, mode, rootHue) {
    setUpAudioContext();
    const [keys, freqs] = getKeysFreqs(key, mode);

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const pitch = Math.round((HSLdata[i] - rootHue + 360) / 360 * 7) % 7;
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];

        [freqs[pitch], freqs[(pitch+2)%freqs.length], freqs[(pitch+4)%freqs.length]].forEach((v) => playNote(i / 3 / 2, 0.5, gain, v, (1 - lightness) * 0.025));
    }
}

function playRhythms(HSLdata, RGBdata, key, mode, rootHue) {
    const subdivision = 4;
    const maxDuration = 4;
    const initialRepeatProb = 0.5;

    let repeatProb = initialRepeatProb;
    let state = maxDuration;
    let time = 0;

    setUpAudioContext();
    const [keys, freqs] = getKeysFreqs(key, mode);

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const pitch = Math.round((HSLdata[i] - rootHue + 360) / 360 * 7) % 7;
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        
        if (Math.random() > repeatProb) {
            state = Math.round(Math.random() * maxDuration);
            repeatProb = initialRepeatProb;
        } else {
            repeatProb /= 2;
        }

        const duration = state / subdivision;

        [freqs[pitch], freqs[(pitch+2)%freqs.length], freqs[(pitch+4)%freqs.length]].forEach((v) => playNote(time, duration, gain / 3, v, (1 - lightness) * 0.025));
        time += duration;
    }
}

function playHarmony(HSLdata, RGBdata, key, mode, rootHue) {
    const subdivision = 4;
    const maxDuration = 4;
    const initialRepeatProb = 0.5;

    let repeatProb = initialRepeatProb;
    let state = maxDuration;
    let time = 0;

    setUpAudioContext();
    const [keys, freqs] = getKeysFreqs(key, mode);

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const pitch = Math.round((HSLdata[i] - rootHue + 360) / 360 * 7) % 7;
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        
        if (Math.random() > repeatProb) {
            state = Math.round(Math.random() * maxDuration);
            repeatProb = initialRepeatProb;
        } else {
            repeatProb /= 2;
        }

        const duration = state / subdivision;

        [freqs[pitch], freqs[(pitch+2)%freqs.length], freqs[(pitch+4)%freqs.length]].forEach((v) => playNote(time, duration, gain / 3, v, (1 - lightness) * 0.025));
        time += duration;
    }
}

export { playNotes, playScriabinNotes, playChords, playRhythms, playHarmony, audioContext };

