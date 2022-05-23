var partitionImage = function(context, canvas, rows, columns) {
    var width = canvas.width;
    var height = canvas.height;
    var boxWidth = Math.floor(width / columns);
    var boxHeight = Math.floor(height / rows);

    var partitionedData = [];

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            rTotal = 0
            gTotal = 0
            bTotal = 0
            aTotal = 0 // don't really care about alpha

            var imageData = context.getImageData(i*boxWidth, j*boxHeight, boxWidth, boxHeight); // get the box of appropriate size
            var pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                rTotal += pixels[i];
                gTotal += pixels[i+1];
                bTotal += pixels[i+2];
                aTotal += pixels[i+3];
            }

            var numPixels = pixels.length/4;
            rAvg = rTotal / numPixels;
            gAvg = gTotal / numPixels;
            bAvg = bTotal / numPixels;
            aAvg = aTotal / numPixels;

            partitionedData.push(Math.round(rAvg));
            partitionedData.push(Math.round(bAvg));
            partitionedData.push(Math.round(gAvg));
            partitionedData.push(Math.round(aAvg));
        }
    }

    console.log(partitionedData);
    return new Uint8ClampedArray(partitionedData);
    
};

var loadFile = function(event) {
	var canvas = document.getElementById('output');
    let context = canvas.getContext('2d');

    image = new Image();
    image.src = URL.createObjectURL(event.target.files[0]);
    image.onload = function(){
        context.drawImage(image, 0, 0);
        partitionImage(context, canvas, 10, 10);
    }

    // Loading image into Canvas: https://stackoverflow.com/questions/6011378/how-to-add-image-to-canvas
};