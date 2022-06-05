import { playNotes } from "./play-notes.js";
import { kmeans } from "./kmeans.js";
import { partitionImage, RGBToHSL } from "./image-processing.js";

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
