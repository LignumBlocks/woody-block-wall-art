import paint from "./3d.js";

//DOM Elements
let fileInput = findElementById("input",'fileInput');
let sourceImage = findElementById("img",'sourceImage');
let outputWidthInput = findElementById("input",'outputWidth');
let outputHeightInput = findElementById("input",'outputHeight');
let btn1In = findElementById("a",'inBtn1');
let btn2In = findElementById("a",'inBtn2');

let btnEdit = findElementById("a",'btnEdit');
let btnOk = findElementById("a",'btnOk');
let btnReset = findElementById("a",'btnReset');

let canvas = findElementById("canvas",'pixelitcanvas');
let uploadButton = findElementById("a",'uploadButton');
let selectedFilename = findElementById("p",'selectedFilename');
let pixelitImage = findElementById("img","pixelitImage");
let pixelitImageFinal = findElementById("img","pixelitImageFinal");
let descriptionField = findElementById("p","descriptionField");
let priceLabel = findElementById("h2",'priceLabel');
//Global Variables
let xBlocks;
let yBlocks;
let colorCount;
let cropper;
let originalDescription = descriptionField.innerHTML;
let outputWidth = 24;
let outputHeight = 24;
let blockSize = 2;
let imData;
let colorPalette;
let allColors ;
let blueprintFile;
let coloredBlueprintFile;
let doc;
let firstPixelateDrawn = false;
let minCroppedWidth = 200;
let minCroppedHeight = 200;

//Cropper settings
let cropperSettings = {
    aspectRatio: 1, // 1:1 initial aspect ratio
    viewMode: 2, // View mode allow max zoom fit image in canvas
    zoomOnWheel: false, // Disable zooming on wheel
    cropend : pixelateImg, // Every time a crop is made
    ready : function () {
        console.log("ready")
        pixelateImg() // When the crop is ready for the first time
    },
    crop: function (event) {
        var width = Math.round(event.detail.width);
        var height = Math.round(event.detail.height);

        if (
            width < minCroppedWidth
            || height < minCroppedHeight
        ) {
            cropper.setData({
                width: minCroppedWidth,
                height: minCroppedHeight,
            });
        }

        //data.textContent = JSON.stringify(cropper.getData(true));
    }
};
// Canvas settings for pixelated image
let ctxSettings = {
    willReadFrequently: true,
    mozImageSmoothingEnabled: false,
    webkitImageSmoothingEnabled: false,
    imageSmoothingEnabled: false
};
let ctx = canvas.getContext('2d', ctxSettings);

/*function togglePreview(){
// Mobile responsive, toggle visibility of preview and crop containers
    if (previewBtn.innerHTML === "Ok"){
        console.log("click OK");
        //previewBtn.innerHTML = "Crop";
        //pixelitImage.parentElement.parentElement.style.display = "block";
        sourceImage.parentElement.parentElement.style.display = "none";
    } else {
        console.log("click Edit");
        previewBtn.innerHTML = "Edit";
        //pixelitImage.parentElement.parentElement.style.display = "none";
        sourceImage.parentElement.parentElement.style.display = "block";
    }
}*/


function updateResponsive(){
    // Display preview button on mobile only
    if (window.innerWidth < 768) {
        //previewBtn.innerHTML = "Preview";
        //previewBtn.parentElement.parentElement.style.display = "block";
        //sourceImage.parentElement.parentElement.style.display = "block";
       // pixelitImage.parentElement.parentElement.style.display = "none";
    } else {
        //previewBtn.parentElement.parentElement.style.display = "none";
        //sourceImage.parentElement.parentElement.style.display = "block";
       // pixelitImage.parentElement.parentElement.style.display = "block";
    }
}



function createCropper() {
    //Initialize image cropper when image is uploaded
    let file = fileInput.files[0];
    console.log(file);
    let fileType = file.type;
    //Allow only images
    if (!fileType.startsWith('image/')) {
        alert('Please upload only images (jpg, png,...)');
        return;
    }

    console.log("selected imagen",selectedFilename);
    selectedFilename.innerHTML = file.name;
    let src = URL.createObjectURL(file);
    sourceImage.src = src;
    sourceImage.srcset = src;
    sourceImage.onload = function () {
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(sourceImage, cropperSettings);
    }
}

function setCropRatio() {
    // Update crop ratio when output width or height is changed
    outputWidth = outputWidthInput.value;
    outputHeight = outputHeightInput.value;

    if ((outputWidth % 2 != 0 || outputHeight % 2 != 0) && blockSize === 2){
        btn1In.click();
        btn2In.className += " bg-invalid";
    } else {
        btn2In.className = btn2In.className.replace(" bg-invalid", "");
    }
    cropper.setAspectRatio(outputWidth / outputHeight);
    updateNumBlocks();
    pixelateImg();
}

function setBlockSize(valueIn){
    // Update block size when changed
    blockSize = valueIn;
    updateNumBlocks();
}

function updateNumBlocks() {
    // Update number of blocks when block size or output width/height is changed
    xBlocks = Math.floor(outputWidth / blockSize);
    yBlocks = Math.floor(outputHeight  / blockSize);
}
function updateBlockSize(e){
    // Update block size when clicked if valid
    let id = this.id;
    if (id === "inBtn1") {
        setBlockSize(1);
    }
    if (id === "inBtn2") {
        if ((outputWidth % 2 !== 0 || outputHeight % 2 !== 0)){
            return;
        }
        setBlockSize(2);
    }
    btn1In.className = btn1In.className.replace(" bg-active", "");
    btn2In.className = btn2In.className.replace(" bg-active", "");

    this.className += " bg-active";
    pixelateImg();
}
function calculatePrice() {
    // Calculate price of pixelated image
    let pricePerSquareFoot = 0;
    if (blockSize=== 2){
        pricePerSquareFoot = 200;
    }
    if (blockSize=== 1){
        pricePerSquareFoot = 225;
    }
    let areaIn = outputWidth * outputHeight;
    let areaFt = areaIn / 144;
    return (pricePerSquareFoot * areaFt).toFixed(2);
}

let currentPixelatedSrc;
function pixelateImg(){
    console.log("Trying to pixelate image")
    // Pixelate image
    let croppedImage = cropper.getCroppedCanvas();
    if (croppedImage === null){
        console.log("cropped image is null")
        return;
    }
    console.log("cropped image is valid")
    // Get cropped image
    // Set canvas size
    let croppedWidth = croppedImage.width;
    let croppedHeight = croppedImage.height;
    let ratio = croppedWidth / croppedHeight;

    let canvasWidth = 500;
    let canvasHeight = canvasWidth / ratio;


    let xBlockSize = Math.max(Math.floor(canvasWidth / xBlocks),1);
    let yBlockSize = Math.max(Math.floor(canvasHeight / yBlocks),1);

    let width = xBlockSize * xBlocks;
    let height = yBlockSize * yBlocks;
    canvas.width = width;
    canvas.height = height;

    // Draw initial image
    ctx.drawImage(croppedImage, 0, 0, croppedImage.width, croppedImage.height,0,0,canvas.width,canvas.height);
    allColors = [];
    // Get image data in form of array of pixels (RGBA) not array of arrays
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imData = imageData.data;
    // Calculate average color of each block
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
                        let redValue = imData[offset];
                        let greenValue = imData[offset + 1];
                        let blueValue = imData[offset + 2];
                        let alphaValue = imData[offset + 3];


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
            // Add color to array
            allColors.push([red, green, blue]);
        }
    }
    // Cluster colors using kmeans
    let kmeansResult = kmeans(allColors, 30);
    colorPalette = []
    let i = 0;
    // Replace colors with cluster centroids
    for (let y = 0; y < height; y += yBlockSize) {
        let newColor;
        for (let x = 0; x < width; x += xBlockSize) {
            let color = allColors[i];
            let clusterFound = false;
            for (let cluster of kmeansResult.clusters){
                for (let point of cluster.points){
                    if (point === color){
                        newColor = cluster.centroid;

                        newColor[0] = Math.floor(newColor[0]);
                        newColor[1] = Math.floor(newColor[1]);
                        newColor[2] = Math.floor(newColor[2]);

                        //add new color to palette if not there
                        if (!colorPalette.includes(newColor)){
                            colorPalette.push(newColor);
                        }

                        allColors[i] = newColor;

                        clusterFound = true;
                        break;
                    }
                }
                if (clusterFound){
                    break;
                }
            }
            //Set color for the entire block
            ctx.clearRect(x, y, xBlockSize, yBlockSize);
            color = "rgb(" + newColor[0] + "," + newColor[1] + "," + newColor[2] + ")";
            ctx.fillStyle = color;
            ctx.fillRect(x, y, xBlockSize, yBlockSize);
            i++;
        }
    }

    // Create color indices for color index purposes in the product report
    colorIndices = {};
    for (let i = 0; i < colorPalette.length; i++) {
        colorIndices[colorPalette[i]] = i;
    }
    // Create a dictionary of colors and their counts
    countColors(allColors);    

    //Display image and set download link
    currentPixelatedSrc = canvas.toDataURL();
    showImages();
    // Write the description (number of blocks, weight, price, etc)
    writeDescription();
}

function showImages() {
    console.log("pixelateImg change",pixelateImg.src);
    pixelitImage.src = currentPixelatedSrc;
    pixelitImage.srcset = currentPixelatedSrc;

    //pixelitImageFinal.src = currentPixelatedSrc;
    //pixelitImageFinal.srcset = currentPixelatedSSrc;
    console.log("Updated images src")
    //console.log(currentPixelatedSrc)
    pixelitImage.onload = function () {
        if (!(pixelitImage.src === currentPixelatedSrc && pixelitImage.srcset === currentPixelatedSrc)) {
            showImages()
        }
    }
    /*pixelitImageFinal.onload = function () {
        if (!(pixelitImageFinal.src === currentPixelatedSrc && pixelitImageFinal.srcset === currentPixelatedSrc)) {
            showImages()
        }
    }*/
}
function writeDescription(){
    // Write description of product in the product description dom element
    let description = originalDescription.replace("{numBlocks}",xBlocks * yBlocks);
    description = description.replace("{blockSize}",blockSize);
    description = description.replace("{width}",outputWidth);
    description = description.replace("{height}",outputHeight);
    description = description.replace("{weight}",calculateWeight());

    descriptionField.innerHTML = description;
    priceLabel.innerHTML = "$" + calculatePrice();

}
function calculateWeight(){
    // Calculate weight of product
    return (xBlocks * yBlocks * 0.25 * 0.001).toFixed(2);
}
let colorIndices;

function countColors(colors) {
    // Count the number of times each color appears
    colorCount = {};
    for (let color of colors) {

        if (!(color in colorCount)) {
            colorCount[color] = 0;
        }

        colorCount[color] += 1;
    }
}
function drawHeader(){
    //Header of each report page
    doc.text(10, 10, "NÃºmero de orden: ");
    doc.text(10, 15, "DimensiÃ³n final: " + xBlocks*blockSize + "x" + yBlocks*blockSize + "in");
    doc.text(10, 20, "NÃºmero de pÃ¡neles: " + xBlocks + "x" + yBlocks );
    doc.text(10, 25, "TamaÃ±o de panel: " + blockSize + "in");
}
function drawBlueprintPdf(){
    //Draw blueprint of product in pdf format
    doc = new jspdf.jsPDF('p', 'mm', [216, 279],true);
    doc.setFontSize(12);
    // Draw color index, 43 colors per column, 3 columns per page
    drawHeader();
    doc.text(10, 30, "Leyenda de colores: ");

    let y = 40;
    var sortedIndices = [];
    for(var color in colorCount) {
        let idx = parseInt(colorIndices[color]);
        sortedIndices.push(idx);
    }
    sortedIndices.sort(function (a,b) {
        return a - b; // Ascending
    });

    let x = 10;
    for (let idx of sortedIndices){
        if (idx != 0 && idx%43 === 0){
            x += 70;
            y = 40;
            if (idx == 129) {
                doc.addPage();
                drawHeader();
                x = 10;
                Y = 40;
            }
        }
        let colorObj = colorPalette[idx];
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(colorObj[0], colorObj[1], colorObj[2]);
        doc.rect(x, y - 3, 3, 3, 'FD');
        doc.setDrawColor(0, 0, 0);
        let text = 'Color ' + idx + ': ' + colorObj + ' (' + colorCount[colorObj] + ')';
        doc.text(x + 5, y, text);
        y += 5.3;
    }

    // Draw image of product for reference
    let currentPage = 1
    let xBase = 0;
    let yBase = 0;
    let count = 0;
    let dx = 10;
    let dy = 35;
    let tileSize = 8 * blockSize;
    let tilesPerPage = 24 / blockSize;
    let horizontalPages = Math.ceil(xBlocks / tilesPerPage);
    let verticalPages = Math.ceil(yBlocks / tilesPerPage);
    let totalPages = horizontalPages * verticalPages;


    doc.addPage();
    drawHeader();
    // Draw image compressed for speed purposes
    doc.addImage(pixelitImage, 'JPEG', 10, 35, 190, 190,'','FAST');

    // Draw grid of reference, all pages with numbers
    doc.addPage();
    drawHeader();
    let mapWidth = 8 * 24;
    let mapHeight = 8 * 24;
    let xDivision = mapWidth / horizontalPages;
    let yDivision = mapHeight / verticalPages;
    let k = 1;
    let fontSize = Math.min(xDivision, yDivision);
    for (var j = 0; j < verticalPages; j++) {
        for (var i = 0; i < horizontalPages; i++) {
            doc.setDrawColor(0, 0, 0);
            doc.setFillColor(255, 255, 255);
            doc.rect(dx + i * xDivision, dy + j * yDivision, xDivision, yDivision, 'FD');
            doc.setFontSize(fontSize);
            doc.text(dx + i * xDivision + xDivision / 2, dy + j * yDivision + yDivision / 2, k.toString(),null, null, 'center');
            k ++;
        }
    }
    doc.setFontSize(12);
    // Draw report, 24 blocks per page, left to right and then top to bottom
    while (count < allColors.length) {
        doc.addPage();
        drawHeader();
        doc.text(10,30,"Plano: " + currentPage + " de " + totalPages);

        let currentX = xBase;
        let currentY = yBase;
        for (var xi = 0; xi < tilesPerPage; xi++) {
            currentX = xBase + xi;
            if (currentX == xBlocks) {
                break;
            }
            for (var yi = 0; yi < tilesPerPage; yi++) {
                currentY = yBase + yi;
                if (currentY >= yBlocks) {
                    break;
                }
                let colorIdx = xBase + xi + (yBase + yi) * xBlocks;
                let color = allColors[colorIdx];
                let idx = colorIndices[color].toString();
                let xRect = dx + xi * tileSize;
                let yRect = dy + yi * tileSize;
                doc.text(xRect + tileSize/2, yRect + tileSize / 2 + 2, idx, null, null, 'center');
                doc.rect(xRect, yRect, tileSize, tileSize);
                count++;
            }
        }
        if (currentX >= xBlocks - 1) {
            xBase = 0;
            yBase += tilesPerPage;
        }
        else {
            xBase += tilesPerPage;
        }
        currentPage++;
    }
    // Save the PDF in base64 format
    blueprintFile = btoa(doc.output());
}
function drawColoredPdf(){
    // Draw colored image of product in pdf format, Same algorithm as drawBlueprintPdf
    doc = new jspdf.jsPDF('p', 'mm', [216, 279],true);
    doc.setFontSize(12);

    drawHeader();
    doc.text(10, 30, "Leyenda de colores: ");

    let y = 40;
    var sortedIndices = [];
    for(var color in colorCount) {
        let idx = parseInt(colorIndices[color]);
        sortedIndices.push(idx);
    }
    sortedIndices.sort(function (a,b) {
        return a - b; // Ascending
    });

    let x = 10;
    for (let idx of sortedIndices){
        if (idx != 0 && idx%43 === 0){
            x += 70;
            y = 40;
            if (idx == 129) {
                doc.addPage();
                drawHeader();
                x = 10;
                Y = 40;
            }
        }
        let colorObj = colorPalette[idx];
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(colorObj[0], colorObj[1], colorObj[2]);
        doc.rect(x, y - 3, 3, 3, 'FD');
        doc.setDrawColor(0, 0, 0);
        let text = 'Color ' + idx + ': ' + colorObj + ' (' + colorCount[colorObj] + ')';
        doc.text(x + 5, y, text);
        y += 5.3;
    }
    let currentPage = 1
    let xBase = 0;
    let yBase = 0;
    let count = 0;

    let dx = 10;
    let dy = 35;
    let tileSize = 8 * blockSize;
    let tilesPerPage = 24 / blockSize;
    let horizontalPages = Math.ceil(xBlocks / tilesPerPage);
    let verticalPages = Math.ceil(yBlocks / tilesPerPage);
    let totalPages = horizontalPages * verticalPages;

    doc.addPage();
    drawHeader();
    // Draw image
    doc.addImage(pixelitImage, 'JPEG', 10, 35, 190, 190,'','FAST');


    doc.addPage();
    drawHeader();
    let mapWidth = 8 * 24;
    let mapHeight = 8 * 24;
    let xDivision = mapWidth / horizontalPages;
    let yDivision = mapHeight / verticalPages;
    let k = 1;
    let fontSize = Math.min(xDivision, yDivision);
    for (var j = 0; j < verticalPages; j++) {
        for (var i = 0; i < horizontalPages; i++) {
            doc.setDrawColor(0, 0, 0);
            doc.setFillColor(255, 255, 255);
            doc.rect(dx + i * xDivision, dy + j * yDivision, xDivision, yDivision, 'FD');
            doc.setFontSize(fontSize);
            doc.text(dx + i * xDivision + xDivision / 2, dy + j * yDivision + yDivision / 2, k.toString(),null, null, 'center');
            k ++;
        }
    }
    doc.setFontSize(12);
    while (count < allColors.length) {
        doc.addPage();
        drawHeader();
        doc.text(10,30,"Plano: " + currentPage + " de " + totalPages);

        let currentX = xBase;
        let currentY = yBase;
        for (var xi = 0; xi < tilesPerPage; xi++) {
            currentX = xBase + xi;
            if (currentX == xBlocks) {
                break;
            }
            for (var yi = 0; yi < tilesPerPage; yi++) {
                currentY = yBase + yi;
                if (currentY >= yBlocks) {
                    break;
                }
                let colorIdx = xBase + xi + (yBase + yi) * xBlocks;
                let color = allColors[colorIdx];
                let idx = colorIndices[color].toString();
                let xRect = dx + xi * tileSize;
                let yRect = dy + yi * tileSize;
                doc.text(xRect + tileSize/2, yRect + tileSize / 2 + 2, idx, null, null, 'center');
                doc.setDrawColor(0, 0, 0);
                doc.setFillColor(color[0], color[1], color[2]);
                doc.rect(xRect, yRect, tileSize, tileSize, 'FD');
                count++;
            }
        }
        if (currentX >= xBlocks - 1) {
            xBase = 0;
            yBase += tilesPerPage;
        }
        else {
            xBase += tilesPerPage;
        }
        currentPage++;
    }
    // Save the PDF
    coloredBlueprintFile = btoa(doc.output());
}
function setCropRatioInput(){
    // Set crop ratio from input
    setCropRatio();
}


function showBloks(){
    let pixel3D = document.getElementById('pixelitImageFinal');
    
    paint(allColors, xBlocks, yBlocks,() => { 
        pixel3D.style.visibility = "visible";
    });    
    sourceImage.parentElement.parentElement.style.visibility = "hidden";
    //btnOk.parentElement.parentElement.style.display = "none";
    //btnEdit.parentElement.parentElement.style.display = "block";

}

function showCrop(){
    document.getElementById('pixelitImageFinal').style.visibility = "hidden";
    sourceImage.parentElement.parentElement.style.visibility = "visible";   
    //btnOk.parentElement.parentElement.style.display = "block";
    //btnEdit.parentElement.parentElement.style.display = "none";
}

function resetPage(){
    location.reload();
}


function init() {
    // Initialize listeners and initial state of the program
    uploadButton.addEventListener("click", function () {fileInput.click();});
    outputWidthInput.addEventListener("change", setCropRatioInput);
    outputHeightInput.addEventListener("change", setCropRatioInput);
    fileInput.addEventListener("change", createCropper);
    btn1In.addEventListener("click", updateBlockSize);
    btn2In.addEventListener("click", updateBlockSize);

    //document.getElementById('pixelitImageFinal').style.visibility = "hidden";
    btnOk.addEventListener("click", showBloks);
    btnEdit.addEventListener("click", showCrop);
    btnReset.addEventListener("click", resetPage);

    sourceImage.srcset = wp_variables.default_image;
    sourceImage.src = wp_variables.default_image;
    cropper = new Cropper(sourceImage, cropperSettings);
    btn1In.click();

    addEventListener("resize", updateResponsive);
    updateResponsive();
}

function findElementById(tag,id) {
    // Find element by id and tag because of elementor nesting
    let parent = document.getElementById(id);
    let element;
    if (parent){
        if (parent.tagName.toLowerCase() === tag) {
            element = parent;
        } else {
            element = document.getElementById(id).getElementsByTagName(tag)[0];
        }
        return element;
    }
}


document.addEventListener("DOMContentLoaded", init);

jQuery(document).ready(function($) {
    function addToCart() {
        //event
        // loading cursor
        document.body.style.cursor = 'wait';
        drawColoredPdf();
        drawBlueprintPdf();
        $.post(wp_variables.ajax_url, {      //POST request
                _ajax_nonce: wp_variables.nonce, //nonce
                action: "change_price",         //action
                price: calculatePrice(),               //data
                blueprint: blueprintFile,
                coloredBlueprint: coloredBlueprintFile,
                pixelated_img_url: pixelitImage.src,
            }, function(data) {            //callback
                document.body.style.cursor = 'default';
                window.location.href = wp_variables.cart_url;
            }
        );
    }
    // Add to cart button ajax request for wordpress
    $("#addToCart").on("click",addToCart);
    $("#saveForLater").on("click",addToCart);

} );