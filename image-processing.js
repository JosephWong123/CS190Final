function partitionImage (context, canvas, rows, columns) {
    var width = canvas.width;
    var height = canvas.height;
    var boxWidth = Math.floor(width / columns);
    var boxHeight = Math.floor(height / rows);

    var partitionedData = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let rTotal = 0;
            let gTotal = 0;
            let bTotal = 0;
            let aTotal = 0; // don't really care about alpha

            var imageData = context.getImageData(i*boxWidth, j*boxHeight, boxWidth, boxHeight); // get the box of appropriate size
            var pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                rTotal += pixels[i];
                gTotal += pixels[i+1];
                bTotal += pixels[i+2];
                aTotal += pixels[i+3];
            }

            var numPixels = pixels.length/4;
            let rAvg = rTotal / numPixels;
            let gAvg = gTotal / numPixels;
            let bAvg = bTotal / numPixels;
            let aAvg = aTotal / numPixels;

            partitionedData.push(Math.round(rAvg));
            partitionedData.push(Math.round(bAvg));
            partitionedData.push(Math.round(gAvg));
            partitionedData.push(Math.round(aAvg));
        }
    }

    return new Uint8ClampedArray(partitionedData); // Only care about RGB
};

function RGBToHSL(data) {
    // https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
    // Returns HSL values for indexes i, i+1, i+2 and removes alpha

    let HSL = [];
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i] / 255;
        let g = data[i+1] / 255;
        let b = data[i+2] / 255;

        let min = Math.min(r, g, b);
        let max = Math.max(r, g, b);

        let l = (min + max) / 2;

        let s = 0;
        if (l <= 0.5) {
            s = (max - min)/(max + min);
        }

        else {
            s = (max - min)/(2.0 - max - min);
        }

        let rmax = r == max;
        let gmax = g == max;
        let bmax = b == max; // figure out which is the max value
        let h = 0;
        if (rmax) {
            h = (g - b)/(max - min);
        }
        else if (gmax) {
            h = 2.0 + (b - r)/(max - min);
        }
        else {
            h = 4.0 + (r-g)/(max - min);
        }
        HSL.push(isFinite(h) ? (h *  60 + 360) % 360 : 0);
        HSL.push(isFinite(s) ? s : 0);
        HSL.push(isFinite(l) ? l : 0);
    }
    return HSL;
};

// Removes the alpha values from the RGB returned by the canvas
function removeAlpha(RGBdata) {
    let data = [];
    for (let i = 0; i < RGBdata.length; i+= 4) {
        data.push(RGBdata[i]);
        data.push(RGBdata[i+1]);
        data.push(RGBdata[i+2]);
    }
    return data;
}
export { partitionImage, RGBToHSL, removeAlpha};

