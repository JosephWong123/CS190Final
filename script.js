import { playNotes, audioContext } from "./play-notes.js";
import kmeans from "./kmeans.js";
import { partitionImage, RGBToHSL, removeAlpha } from "./image-processing.js";
import { generateKey } from "./key.js";

var musicStart = () => {};

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
                tag.style.color = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
            }
        }
        let key = generateKey(clusterResults.centroids, clusterResults.clusters);
        let HSLdata = RGBToHSL(data);
        let RGBdata = removeAlpha(data);
        let lightSum = 0;
        for (let i = 0; i < HSLdata.length / 3; ++i) {
                lightSum += HSLdata[3*i+2];
        }
        const avgLightness  = lightSum / HSLdata.length * 3;
        const tonality = avgLightness < 0.25 ? "minor" : "major";
        console.log(tonality);
        musicStart = () => playNotes(HSLdata, RGBdata, key, tonality);
    }

    // Loading image into Canvas: https://stackoverflow.com/questions/6011378/how-to-add-image-to-canvas
};

window.togglePlay = function(event) {
    if (audioContext == null) {
        musicStart();
    } else {
        audioContext.close();
        audioContext = null;
    }
};
