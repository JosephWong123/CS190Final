import { startNote, playNotes } from "./play-notes";
import { kmeans } from "./kmeans.js";
import { partitionImage, RGBToHSL } from "./image-processing.js";

var audioContext;

var startNote = function(gain, freq, lightness, delay) {
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

var playNotes = function(data) {
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

window.loadFile = function(event) {
    var canvas = document.getElementById('output');
    let context = canvas.getContext('2d');

    let image = new Image();
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function(){
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let data = partitionImage(context, canvas, 10, 10);
        let pixelData = [];
        for (let i = 0; i < data.length; i += 3) {
            let pixel = [];
            for (let j = 0; j < 3; ++j) {
                pixel.push(isFinite(data[i+j]) ? data[i+j] : 0);
            }
            pixelData.push(pixel);
        }
        let clusterResults = kmeans(pixelData, 5);
        console.log(clusterResults);
        for (let i = 0; i < 5; ++i) {
            const tag = document.getElementById("c" + (i + 1));
            const color = clusterResults.centroids[i];
            if (clusterResults.clusters[i].points.length > 1) {
                console.log(color);
                tag.style.color = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
            }
        }
        data = RGBToHSL(data);
        playNotes(data);
    }

    // Loading image into Canvas: https://stackoverflow.com/questions/6011378/how-to-add-image-to-canvas
};
