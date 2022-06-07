import { playNotes, playScriabinNotes, playChords, playRhythms, playHarmony, audioContext } from "./play-notes.js";
import kmeans from "./kmeans.js";
import { partitionImage, RGBToHSL, removeAlpha } from "./image-processing.js";
import { generateKey } from "./key.js";

var simpleAlgorithm = () => {};
var scriabinAlgorithm = () => {};
var chordAlgorithm= () => {};
var rhythmAlgorithm= () => {};
var harmonyAlgorithm= () => {};
var algorithm = "";

function musicStart() {
    switch (algorithm) {
        case "chord":
            chordAlgorithm();
            break;
        case "scriabin":
            scriabinAlgorithm();
            break;
        case "rhythm":
            rhythmAlgorithm();
            break;
        case "harmony":
            harmonyAlgorithm();
            break;
        default:
            simpleAlgorithm();
    }
}

window.loadFile = function(event) {
    if (audioContext != null) {
        audioContext.close();
    }
    var canvas = document.getElementById('output');
    let context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    let image = new Image();
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function(){
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let data = partitionImage(context, canvas, 10, 10);
        let pixelData = [];
        for (let i = 0; i < data.length; i += 4) {
            let pixel = [];
            for (let j = 0; j < 3; ++j) {
                pixel.push(isFinite(data[i+j]) ? data[i+j] : 0);
            }
            pixelData.push(pixel);
        }
        let clusterResults = kmeans(pixelData, 5);
        clusterResults.clusters.sort((a, b) => b.points.length - a.points.length);
        for (let i = 0; i < clusterResults.clusters.length; ++i) {
            const tag = document.getElementById("c" + (i + 1));
            const color = clusterResults.centroids[i];
            if (clusterResults.clusters[i].points.length > 1) {
                tag.style.color = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
            }
        }
        let [key, rootHue] = generateKey(clusterResults.centroids, clusterResults.clusters);
        let HSLdata = RGBToHSL(data);
        let RGBdata = removeAlpha(data);
        let lightSum = 0;
        for (let i = 0; i < HSLdata.length / 3; ++i) {
                lightSum += HSLdata[3*i+2];
        }
        const avgLightness  = lightSum / HSLdata.length * 3;
        let satSum = 0;
        for (let i = 0; i < HSLdata.length / 3; ++i) {
                satSum += HSLdata[3*i+1];
        }
        const avgSaturation  = satSum / HSLdata.length * 3;
        const tonality = avgLightness + avgSaturation < 1 && avgLightness < 0.5 && avgSaturation < 0.5 ? "minor" : "major";
        simpleAlgorithm = () => playNotes(HSLdata, RGBdata, key, tonality, rootHue);
        scriabinAlgorithm = () => playScriabinNotes(HSLdata, RGBdata, key, tonality);
        chordAlgorithm = () => playChords(HSLdata, RGBdata, key, tonality, rootHue);
        rhythmAlgorithm = () => playRhythms(HSLdata, RGBdata, key, tonality, rootHue);
        harmonyAlgorithm = () => playHarmony(HSLdata, RGBdata, key, tonality, rootHue);
    }

    // Loading image into Canvas: https://stackoverflow.com/questions/6011378/how-to-add-image-to-canvas
};

window.selectAlgorithm = function(selectObject) {
    if (audioContext != null && audioContext.state != "closed") {
        audioContext.close();
    }
    algorithm = selectObject.value;
};

window.play = function(event) {
    if (audioContext == null || audioContext.state == "closed") {
        musicStart();
    } else if (audioContext.state == "suspended") {
        audioContext.resume();
    }
};

window.pause = function(event) {
    if (audioContext != null && audioContext.state == "running") {
        audioContext.suspend();
    }
}

window.reset = function(event) {
    musicStart();
    audioContext.suspend();
}

