function euclideanDistance(color1, color2) {
    return Math.sqrt(Math.pow(color1[0] - color2[0], 2) + Math.pow(color1[1] - color2[1], 2) + Math.pow(color1[2] - color2[2], 2));
}

// Given the clusters of colors, determine a key for the melody to generate in.
// Based off the Sciabrin mapping + weighted average.
function generateKey(centroids) {
    var r = 0;
    var g = 0;
    var b = 0;
    var entries = (centroids.length * (centroids.length + 1)) / 2;

    for (var i = centroids.length - 1; i >= 0; i--) {
        var weight = centroids.length - i;
        r += (weight * centroids[i][0]);
        g += (weight * centroids[i][1]);
        b += (weight * centroids[i][2]);
    }
    let colorResult = [r / entries, g / entries, b / entries];
    // keys is the array of RGB values, index 0 = C, moving up by half steps
    const keys = [[233, 51, 35], [130, 24, 242], [255, 255, 84], [171, 77, 136], [204, 241, 252], [157, 31, 56], [129, 138, 245], [239, 134, 50], [178, 120, 244], [103, 201, 77], [159, 106, 123], [155, 200, 250]];
    const colorMap = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    var minDistance = euclideanDistance(colorResult, keys[0]);
    var key = colorMap[0];
    
    for (var i = 1; i < keys.length; i++) {
        let distance = euclideanDistance(colorResult, keys[i]);
        if (distance < minDistance) {
            minDistance = distance;
            key = colorMap[i];
        }
    }

    return key;
}

export {generateKey};