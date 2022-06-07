function euclideanDistance(color1, color2) {
    return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
}

function getScriabin(rgb) {
    // console.log(rgb);
    const keys = [[255, 0, 0], [145, 0, 255], [255, 255, 0], [183, 70, 139], [195, 243, 255], [173, 0, 52], [125, 139, 253], [255, 126, 0], [188, 116, 253], [52, 204, 51], [169, 102, 125], [144, 201, 255]];
    const colorMap = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    var minDistance = euclideanDistance(rgb, keys[0]);
    var key = colorMap[0];
    
    for (var i = 1; i < keys.length; i++) {
        let distance = euclideanDistance(rgb, keys[i]);
        if (distance < minDistance) {
            minDistance = distance;
            key = colorMap[i];
        }
    }

    return key;
}

// Given the clusters of colors, determine a key for the melody to generate in.
// Based off the Sciabrin mapping + weighted average.
function generateKey(centroids, clusters) {
    var r = 0;
    var g = 0;
    var b = 0;
    var entries = 0;

    for (var i = centroids.length - 1; i >= 0; i--) {
        var weight = clusters[i].points.length;
        r += (weight * centroids[i][0]);
        g += (weight * centroids[i][1]);
        b += (weight * centroids[i][2]);
        entries += weight;
        // console.log(weight);
    }
    // console.log(r, g, b);
    let colorResult = [r / entries, g / entries, b / entries];
    // console.log(colorResult);
    // keys is the array of RGB values, index 0 = C, moving up by half steps

    const key = getScriabin(colorResult);
    return key;
}

export {generateKey, euclideanDistance, getScriabin};
