let fileInput = document.getElementById('fileInput');
let sourceImage = document.getElementById('sourceImage');
let outputWidthInput = document.getElementById('outputWidth');
let outputHeightInput = document.getElementById('outputHeight');

let numBlocksP = document.getElementById('numBlocks');
let numColorsP = document.getElementById('numColors');
let totalPriceP = document.getElementById('totalPrice');
let totalPriceValue = 0;
let btn1In = document.getElementById('1InBtn');
let btn2In = document.getElementById('2InBtn');
let btn3In = document.getElementById('3InBtn');
let downloadButton = document.getElementById('downloadPixelatedImg');
let colorCrusters = [];
let canvas = document.getElementById('pixelitcanvas');

let kmeansColorsInput = document.getElementById("kmeansColors");
ctxSettings = {
    willReadFrequently: true,
    mozImageSmoothingEnabled: false,
    webkitImageSmoothingEnabled: false,
    imageSmoothingEnabled: false
};
let ctx = canvas.getContext('2d', ctxSettings);

let maxCanvasHeight = 350;
let data;
let cropper;

canvasColumn = document.getElementById('canvasColumn');
cropperSettings = {
    aspectRatio: 1,
    preview: '.img-preview',
    viewMode: 1,
    cropend : updatePixelitImg,
    ready: updatePixelitImg,
};

function createCropper() {
    let file = fileInput.files[0];
    sourceImage.src = URL.createObjectURL(file);
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(sourceImage, cropperSettings);
}

function setCropRatio() {
    let outputWidth = outputWidthInput.value;
    let outputHeight = outputHeightInput.value;
    if (outputWidth && outputHeight) {
        cropper.setAspectRatio(outputWidth / outputHeight);
    }
    updatePixelitImg();
}

outputWidthInput.addEventListener("change", setCropRatio);
outputHeightInput.addEventListener("change", setCropRatio);
fileInput.addEventListener("change", createCropper);
kmeansColorsInput.addEventListener("change", updateKmeansColors);
let kmeansColors = 5;

function updateKmeansColors () {
    kmeansColors = kmeansColorsInput.value;
    pixelateImg();
}
function updatePixelitImg() {
    console.log("updatePixelitImg");
    data = cropper.getData();
    console.log(data);
}

function setBlockSize(valueIn){
    xBlocks = Math.floor(outputWidth / valueIn);
    yBlocks = Math.floor(outputHeight / valueIn);
}

function updateBlockSize(e){
    setBlockSize(e.target.value);
    pixelateImg();
    numBlocksP.innerHTML = "X blocks: " + xBlocks + " Y blocks: " + yBlocks + " Total blocks: " + xBlocks * yBlocks;
    numColorsP.innerHTML = "x colors";
    totalPriceValue = calculatePrice();
    totalPriceP.innerHTML = "$" + totalPriceValue;

}

function calculatePrice() {
    return (xBlocks * yBlocks * 0.25).toFixed(2);
}

btn1In.addEventListener("click", updateBlockSize);
btn2In.addEventListener("click", updateBlockSize);
btn3In.addEventListener("click", updateBlockSize);

async function pixelateImg(){
    //Initial size
    let numColors = 0;

    columnWidth = canvasColumn.offsetWidth;
    console.log("pixelate");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let sourceWidth = data.width;
    let sourceHeight = data.height;
    let ratio = sourceWidth / sourceHeight;
    let width;
    let height;
    console.log("sourceWidth: " + sourceWidth + " sourceHeight: " + sourceHeight);
    //Initial size
    if (sourceWidth >= sourceHeight) {
        width = columnWidth;
        height = width / ratio;
    } else {
        if (sourceHeight > maxCanvasHeight) {
            height = maxCanvasHeight;
        } else {
            height = sourceHeight;
        }
        width = height * ratio;
    }
    width = Math.floor(width);
    height = Math.floor(height);
    console.log("Initial || width: " + width + " height: " + height);

    xBlockSize = Math.floor(width / xBlocks);
    yBlockSize = Math.floor(height / yBlocks);

    //Final size
    width = xBlockSize * xBlocks;
    height = yBlockSize * yBlocks;
    canvas.width = width;
    canvas.height = height;

    console.log("xBlockSize: " + xBlockSize + " yBlockSize: " + yBlockSize);
    console.log("xBlocks: " + xBlocks + " yBlocks: " + yBlocks);
    console.log("width: " + width + " height: " + height);

    ctx.drawImage(sourceImage, data.x, data.y, sourceWidth, sourceHeight,0,0,canvas.width,canvas.height);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let imData = imageData.data;
    let colors = [];
    for (let y = 0; y < height; y += yBlockSize) {
        for (let x = 0; x < width; x += xBlockSize) {

            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let numPixels = 0;

            for (let dy = 0; dy < yBlockSize; dy++) {
                for (let dx = 0; dx < xBlockSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        let offset = 4 * ((y + dy) * width + (x + dx));
                        redValue = imData[offset];
                        greenValue = imData[offset + 1];
                        blueValue = imData[offset + 2];
                        alphaValue = imData[offset + 3];
                        if (alphaValue === 0) {
                            continue;
                        }
                        red += redValue;
                        green += greenValue;
                        blue += blueValue;
                        alpha += alphaValue;
                        numPixels++;
                    }
                }
            }

            if (numPixels != 0) {
                red = Math.floor(red / numPixels);
                green = Math.floor(green / numPixels);
                blue = Math.floor(blue / numPixels);
                alpha = Math.floor(alpha / numPixels);
            } else {
                red = 0;
                green = 0;
                blue = 0;
                alpha = 0;
            }

            colors.push([red, green, blue]);
            for (let dy = 0; dy < yBlockSize; dy++) {
                for (let dx = 0; dx < xBlockSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        let offset = 4 * ((y + dy) * width + (x + dx));
                        imData[offset] = red;
                        imData[offset + 1] = green;
                        imData[offset + 2] = blue;
                        imData[offset + 3] = alpha;
                    }
                }
            }

        }
    }

    console.log(colors);
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    // usage example:
    var a = ['a', 1, 'a', 2, '1'];
    var unique = colors.filter(onlyUnique);

    console.log(unique); // ['a', 1, 2, '1']
    console.log(unique.length); // ['a', 1, 2, '1']
    if (kmeansColors != 0) {

        console.log("kmeansColors: " + kmeansColors)
        result = kmeans(colors, kmeansColors);
        console.log(result);

        //Replace colors in clusters
        for (let y = 0; y < height; y += yBlockSize) {
            for (let x = 0; x < width; x += xBlockSize) {
                let red = null;
                let green = null;
                let blue = null;
                let alpha = 255;
                for (let dy = 0; dy < yBlockSize; dy++) {
                    for (let dx = 0; dx < xBlockSize; dx++) {
                        if (x + dx < width && y + dy < height) {
                            let offset = 4 * ((y + dy) * width + (x + dx));
                            if (red === null) {
                                red = imData[offset];
                                green = imData[offset + 1];
                                blue = imData[offset + 2];
                                console.log("Finding color for red: " + red + " green: " + green + " blue: " + blue)

                                let cluster;
                                for (let i = 0; i < result.clusters.length; i++) {
                                    cluster = result.clusters[i];

                                    for (let j = 0; j < cluster.points.length; j++) {
                                        point = cluster.points[j];
                                        if (point[0] === red && point[1] === green && point[2] === blue) {
                                            red = cluster.centroid[0];
                                            green = cluster.centroid[1];
                                            blue = cluster.centroid[2];
                                            console.log("red: " + red + " green: " + green + " blue: " + blue);
                                            break;
                                        }
                                    }
                                }
                            }
                            imData[offset] = red;
                            imData[offset + 1] = green;
                            imData[offset + 2] = blue;
                            imData[offset + 3] = 255;
                        }
                    }
                }

            }
        }
    }
    ctx.putImageData(imageData, 0, 0);
    downloadButton.download = 'canvas_image.png';
    downloadButton.href = canvas.toDataURL();

}

setBlockSize(2);

jQuery(document).ready(function($) {         //wrapper
    $("#addToCart").on("click",function() {          //event
        var this2 = this;                  //use in callback
        $.post(my_ajax_obj.ajax_url, {      //POST request
                _ajax_nonce: my_ajax_obj.nonce, //nonce
                action: "change_price",         //action
                price: totalPriceValue               //data
            }, function(data) {            //callback
                console.log(data)     //insert server response
                window.location.href = my_ajax_obj.cart_url;
            }
        );
    } );
} );
