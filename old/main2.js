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
let selectBtn = document.getElementById('selectBtn');
let downloadButton = document.getElementById('downloadPixelatedImg');
let colorCrusters = [];
let canvas = document.getElementById('pixelitcanvas');
let kmeansResult;

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
    selectBtn.style.display = "block";
}

function setBlockSize(valueIn){
    xBlocks = Math.floor(outputWidthInput.value / valueIn);
    yBlocks = Math.floor(outputHeightInput.value / valueIn);
}

function updateBlockSize(e){
    setBlockSize(e.target.value);
    pixelateImg();
    numBlocksP.innerHTML = "X blocks: " + xBlocks + " Y blocks: " + yBlocks + " Total blocks: " + xBlocks * yBlocks;
    numColorsP.innerHTML = "x colors";
    totalPriceValue = calculatePrice();
    totalPriceP.innerHTML = "$" + totalPriceValue;

}

selectBtn.addEventListener("click", selectCroppedSection);
function selectCroppedSection() {
    calculateKmeans();
}
function calculatePrice() {
    return (xBlocks * yBlocks * 0.25).toFixed(2);
}

btn1In.addEventListener("click", updateBlockSize);
btn2In.addEventListener("click", updateBlockSize);
btn3In.addEventListener("click", updateBlockSize);

let imData;

let selectedImageData;
function calculateKmeans(){
    //Initial size
    columnWidth = canvasColumn.offsetWidth;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let sourceWidth = data.width;
    let sourceHeight = data.height;
    let ratio = sourceWidth / sourceHeight;
    let width;
    let height;
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

    xBlockSize = Math.floor(width / xBlocks);
    yBlockSize = Math.floor(height / yBlocks);

    //Final size
    width = xBlockSize * xBlocks;
    height = yBlockSize * yBlocks;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(sourceImage, data.x, data.y, sourceWidth, sourceHeight,0,0,canvas.width,canvas.height);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imData = [...imageData.data];
    let colors = [];

    //Find colors
    for (let y = 0; y < height; y += yBlockSize) {
        for (let x = 0; x < width; x += xBlockSize) {

            for (let dy = 0; dy < yBlockSize; dy++) {
                for (let dx = 0; dx < xBlockSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        let offset = 4 * ((y + dy) * width + (x + dx));
                        redValue = imData[offset];
                        greenValue = imData[offset + 1];
                        blueValue = imData[offset + 2];
                        alphaValue = imData[offset + 3];
                        colors.push([redValue, greenValue, blueValue]);
                    }
                }
            }
        }
    }
    //Find clusters
    kmeansResult = kmeans(colors, kmeansColors);
}
async function pixelateImg(){
    columnWidth = canvasColumn.offsetWidth;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let sourceWidth = data.width;
    let sourceHeight = data.height;
    let ratio = sourceWidth / sourceHeight;
    let width;
    let height;
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

    xBlockSize = Math.floor(width / xBlocks);
    yBlockSize = Math.floor(height / yBlocks);

    //Final size
    width = xBlockSize * xBlocks;
    height = yBlockSize * yBlocks;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(sourceImage, data.x, data.y, data.width, data.height,0,0,canvas.width,canvas.height);

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imData = imageData.data;



    height = canvas.height;
    width = canvas.width;

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

            //Find the closest cluster
            let cluster;
            let minDistance = null;
            for (let i = 0; i < kmeansResult.clusters.length; i++) {
                cluster = kmeansResult.clusters[i];
                center = cluster.centroid;
                distance = Math.sqrt(Math.pow(red - center[0], 2) + Math.pow(green - center[1], 2) + Math.pow(blue - center[2], 2));
                if (minDistance == null || distance < minDistance) {
                    minDistance = distance;
                    newRed = center[0];
                    newGreen = center[1];
                    newBlue = center[2];
                }
            }

            //Set color for the entire block
            for (let dy = 0; dy < yBlockSize; dy++) {
                for (let dx = 0; dx < xBlockSize; dx++) {
                    if (x + dx < width && y + dy < height) {
                        let offset = 4 * ((y + dy) * width + (x + dx));
                        imData[offset] = newRed;
                        imData[offset + 1] = newGreen;
                        imData[offset + 2] = newBlue;
                        imData[offset + 3] = 255;
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
sourceImage.src = wp_variables.default_image;
selectBtn.style.display = "none";

jQuery(document).ready(function($) {         //wrapper
    $("#addToCart").on("click",function() {          //event
        $.post(wp_variables.ajax_url, {      //POST request
                _ajax_nonce: wp_variables.nonce, //nonce
                action: "change_price",         //action
                price: totalPriceValue               //data
            }, function(data) {            //callback
                console.log(data)     //insert server response
                window.location.href = wp_variables.cart_url;
            }
        );
    } );
} );
