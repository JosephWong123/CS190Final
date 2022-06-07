import { euclideanDistance, getScriabin } from "./key.js";

var audioContext;

function precalcFreqs(startMidi, endMidi) {
    if (startMidi > endMidi) {
        return [];
    }

    const semitoneFactor = Math.pow(2, 1/12);
    const a4Freq = 440;
    const a4Midi = 69;

    let freqs = [a4Freq * Math.pow(2, (startMidi - a4Midi) / 12)];
    let midi = startMidi + 1;

    while (midi <= endMidi) {
        freqs.push(freqs[freqs.length-1] * semitoneFactor);
        ++midi;
    }

    return freqs;
}

function playNote(position, duration, gain, freq, attackTime) {
    const oscillator = audioContext.createOscillator();
    
    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    const oscillatorGain = audioContext.createGain();
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(audioContext.destination);

    oscillatorGain.gain.setValueAtTime(0, position);
    oscillatorGain.gain.linearRampToValueAtTime(gain, position + attackTime);
    oscillatorGain.gain.linearRampToValueAtTime(0, position + duration);

    oscillator.start(position);
    oscillator.stop(position + duration);
}

function startNote(gain, freq, lightness, delay) {
    const attackTime = (1 - lightness) * 0.025;
    playNote(delay, 0.5, gain, freq,  attackTime);
}

function getChordFreqs(root, major) {
    const freqs = precalcFreqs(60, 71);
    let rootFreq;
    switch (root) {
        case "C":
            rootFreq = freqs[0];
            break;
        case "Db":
            rootFreq = freqs[1];
            break;
        case "D":
            rootFreq = freqs[2];
            break;
        case "Eb":
            rootFreq = freqs[3];
            break;
        case "E":
            rootFreq = freqs[4];
            break;
        case "F":
            rootFreq = freqs[5];
            break;
        case "Gb":
            rootFreq = freqs[6];
            break;
        case "G":
            rootFreq = freqs[7];
            break;
        case "Ab":
            rootFreq = freqs[8];
            break;
        case "A":
            rootFreq = freqs[9];
            break;
        case "Bb":
            rootFreq = freqs[10];
            break;
        default: //B
            rootFreq = freqs[11];
    }

    return major ? [rootFreq, rootFreq * Math.pow(2, 1/3), rootFreq * Math.pow(2, 7/12)] : [rootFreq, rootFreq * Math.pow(2, 1/4), rootFreq * Math.pow(2, 7/12)];
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

function playNotes(HSLdata, RGBdata, key, mode) {
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
        startNote(gain, freqs[pitch], lightness, i / 3 / 2);
    }
}

function playChords(HSLdata, RGBdata) {
    setUpAudioContext();

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const chord = getScriabin(data);
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];

        getChordFreqs(chord, lightness >= 0.4).forEach((v) => startNote(gain / 3, v, lightness, i / 3 / 2));
    }
}

function playRhythms(HSLdata, RGBdata) {
    const subdivision = 4;
    const maxDuration = 4;
    const initialRepeatProb = 0.5;

    let repeatProb = initialRepeatProb;
    let state = maxDuration;
    let time = 0;

    setUpAudioContext();

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const chord = getScriabin(data);
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        
        if (Math.random() > repeatProb) {
            state = Math.round(Math.random() * maxDuration);
            repeatProb = initialRepeatProb;
        } else {
            repeatProb /= 2;
        }

        const duration = state / subdivision;

        getChordFreqs(chord, lightness >= 0.4).forEach((v) => playNote(time, duration, gain / 3, v, (1 - lightness) * 0.025));
        time += duration;
    }
}

function playHarmony(HSLdata, RGBdata) {
    const subdivision = 4;
    const maxDuration = 4;
    const initialRepeatProb = 0.5;

    let repeatProb = initialRepeatProb;
    let state = maxDuration;
    let time = 0;

    setUpAudioContext();

    for (let i = 0; i < HSLdata.length; i += 3) { // HSLdata and RGBdata are the same length
        const data = [RGBdata[i], RGBdata[i+1], RGBdata[i+2]];
        const chord = getScriabin(data);
        const gain = HSLdata[i+1];
        const lightness = HSLdata[i+2];
        
        if (Math.random() > repeatProb) {
            state = Math.round(Math.random() * maxDuration);
            repeatProb = initialRepeatProb;
        } else {
            repeatProb /= 2;
        }

        const duration = state / subdivision;

        getChordFreqs(chord, lightness >= 0.4).forEach((v) => playNote(time, duration, gain / 3, v, (1 - lightness) * 0.025));
        time += duration;
    }
}

export { playNotes, playChords, playRhythms, playHarmony, audioContext };

