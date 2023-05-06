let fileInput = findElementById("input",'fileInput');
let sourceImage = findElementById("img",'sourceImage');
let outputWidthInput = findElementById("input",'outputWidth');
let outputHeightInput = findElementById("input",'outputHeight');
let btn1In = findElementById("a",'inBtn1');
let btn2In = findElementById("a",'inBtn2');
let downloadButton = findElementById("a",'downloadPixelatedImg');
let canvas = findElementById("canvas",'pixelitcanvas');
let uploadButton = findElementById("a",'uploadButton');
let selectedFilename = findElementById("p",'selectedFilename');
let pixelitImage = findElementById("img","pixelitImage");
let descriptionField = findElementById("p","descriptionField");
//let blocksQtyLabel = findElementById("p","blocksQtyLabel");
//let blockSizeLabel = findElementById("p","blockSizeLabel");
//let widthLabel = findElementById("p","widthLabel");
//let heightLabel = findElementById("p","heightLabel");
//let weightLabel = findElementById("p","weightLabel");
let priceLabel = findElementById("h2",'priceLabel');
let xBlocks;
let yBlocks;
let totalPriceValue = 0;
let colorPallete;
let colorCount;
let data;
let cropper;
let originalDescription = descriptionField.innerHTML;

cropperSettings = {
    aspectRatio: 1,
    viewMode: 2,
    cropend : updatePixelitImg,
    ready : updatePixelitImg
};
ctxSettings = {
    willReadFrequently: true,
    mozImageSmoothingEnabled: false,
    webkitImageSmoothingEnabled: false,
    imageSmoothingEnabled: false
};
let ctx = canvas.getContext('2d', ctxSettings);




function createCropper() {
    let file = fileInput.files[0];
    fileType = file.type;
    //Allow only images
    if (!fileType.startsWith('image/')) {
        alert('Please upload only images (jpg, png,...)');
        return;
    }
    //filename
    selectedFilename.innerHTML = file.name;
    src = URL.createObjectURL(file);
    sourceImage.src = src;
    sourceImage.srcset = src;
    if (cropper) {
        cropper.destroy();
    }
    cropper = new Cropper(sourceImage, cropperSettings);
}

let outputWidth = 24;
let outputHeight = 24;
function setCropRatio() {

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
    updatePixelitImg();
}





function updatePixelitImg() {
    data = cropper.getData();
    pixelateImg();
}
let blockSize = 2;
function setBlockSize(valueIn){
    blockSize = valueIn;
    //blockSizeLabel.innerHTML = blockSize;
    updateNumBlocks();
}

function updateNumBlocks() {
    xBlocks = Math.floor(outputWidth / blockSize);
    yBlocks = Math.floor(outputHeight  / blockSize);
    console.log(outputHeight + " " + outputWidth + " " + blockSize + " " + xBlocks + " " + yBlocks)
    //blocksQtyLabel.innerHTML = xBlocks * yBlocks;
}
function updateBlockSize(e){
    id = this.id;
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
    if (blockSize=== 2){
        pricePerSquareFoot = 200;
    }
    if (blockSize=== 1){
        pricePerSquareFoot = 225;
    }
    areaIn = outputWidth * outputHeight;
    areaFt = areaIn / 144;
    return (pricePerSquareFoot * areaFt).toFixed(2);
}




let imData;

let allColors ;


function pixelateImg(){

    croppedImage = cropper.getCroppedCanvas();

    if (!croppedImage) return;

    croppedWidth = croppedImage.width;
    croppedHeight = croppedImage.height;
    console.log("X Blocks " + xBlocks + " Y Blocks " + yBlocks + " Block Size " + blockSize + " Cropped Width " + croppedWidth + " Cropped Height " + croppedHeight + " Output Width " + outputWidth + " Output Height " + outputHeight + "")
    xBlockSize = Math.max(Math.floor(croppedWidth / xBlocks),1);
    yBlockSize = Math.max(Math.floor(croppedHeight / yBlocks),1);

    width = xBlockSize * xBlocks;
    height = yBlockSize * yBlocks;

    canvas.width = width;
    canvas.height = height;
    console.log("width: " + width + " height: " + height)

    ctx.drawImage(croppedImage, 0, 0, croppedImage.width, croppedImage.height,0,0,canvas.width,canvas.height);
    allColors = [];

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imData = imageData.data;

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
            closestColor = findClosestColor([red, green, blue]);
            allColors.push(closestColor);
            newRed = closestColor[0];
            newGreen = closestColor[1];
            newBlue = closestColor[2];

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
    countColors(allColors);
    ctx.putImageData(imageData, 0, 0);
    downloadButton.download = 'My woody block wall art.png';
    src = canvas.toDataURL();
    downloadButton.href = src;
    pixelitImage.src = src;
    pixelitImage.srcset = src;
    writeDescription();
}

function writeDescription(){
    description = originalDescription.replace("{numBlocks}",xBlocks * yBlocks);
    description = description.replace("{blockSize}",blockSize);
    description = description.replace("{width}",outputWidth);
    description = description.replace("{height}",outputHeight);
    description = description.replace("{weight}",calculateWeight());

    descriptionField.innerHTML = description;
    priceLabel.innerHTML = "$" + calculatePrice();

}
function calculateWeight(){
    return (xBlocks * yBlocks * 0.25 * 0.001).toFixed(2);
}
function findClosestColor(color) {
    minDistance = null;
    colorFound = null;
    for (let possibleColor of colorPallete) {
        distance = Math.sqrt(Math.pow(color[0] - possibleColor[0], 2) + Math.pow(color[1] - possibleColor[1], 2) + Math.pow(color[2] - possibleColor[2], 2));
        if (minDistance == null || distance < minDistance) {
            minDistance = distance;
            colorFound = [...possibleColor];
        }
    }
    return colorFound;
}
let colorIndices;


function buildColorPallete(redBits,greenBits,blueBits) {
    /**
    redStep = 255 / (Math.pow(2, redBits) - 1);
    greenStep = 255 / (Math.pow(2, greenBits) - 1);
    blueStep = 255 / (Math.pow(2, blueBits) - 1);

    colorPallete = [];
    for (let i = 0; i < Math.pow(2, redBits); i++) {
        red = Math.floor(i * redStep)
        for (let j = 0; j < Math.pow(2, greenBits); j++) {
            green = Math.floor(j * greenStep)
            for (let k = 0; k < Math.pow(2, blueBits); k++) {
                blue = Math.floor(k * blueStep)
                colorPallete.push([red, green, blue]);
            }
        }
    }
    **/
    hexPallete = ["#BEBDBF","#585859","#1E1E20","#1C1D21","#31353D","#44464A","#292A2B","#37474F","#607D8B","#546E7A","#374140","#2A2C2B","#424242","#292929","#232323","#454545","#D9D9D9","#BFBFBF","#212121","#616161","#757575","#8C8C8C","#595959","#252525","#F2E926","#FFEA00","#FFEE58","#FFEB3B","#FFF176","#EDDB43","#E8CA00","#FFE11A","#FFDC00","#FFDE20","#FBD506","#FFD600","#F2D03B","#FFD933","#FFD10F","#F0C419","#EFC94C","#FFD34E","#F2B705","#F2C12E","#FFBE00","#F0C755","#AB47BC","#9C27B0","#7B1FA2","#9250BC","#3C0F59","#460273","#5C148C","#4C1273","#360259","#8B63A6","#6B14A6","#7E55A3","#7B52AB","#4A148C","#9768D1","#36175E","#553285","#732DD9","#420F8D","#9575CD","#673AB7","#512DA8","#FA9600","#FF8C00","#EB7F00","#DE6D00","#FD7400","#FF822E","#FF6600","#D95100","#F2600C","#FF7729","#FF6D1F","#FF6517","#FA5B0F","#F57336","#FC7D49","#FF733F","#F27649","#D23600","#F77A52","#FF5722","#F4511E","#FF6138","#5C0002","#D40D12","#FF1D23","#94090D","#450003","#B9121B","#8C1C03","#FF2D00","#E74C3C","#F44336","#441A19","#E53935","#EF5350","#CD0402","#900B0A","#C30F0E","#4C1B1B","#C62828","#D90000","#D50000","#440505","#FF5252","#2C1DFF","#1510F0","#0003C7","#020873","#1C3FFD","#35478C","#2962FF","#365FB7","#799AE0","#0D47A1","#1B76FF","#002253","#133463","#7FB2F0","#1976D2","#004B8D","#4192D9","#7ABAF2","#00305A","#ADD5F7","#3498DB","#2980B9","#012840","#0067A6","#7ECEFD","#0288D1","#04668C","#00ABD8","#0092B2","#59D8E6","#0EEAFF","#ACF0F2","#04BFBF","#287D7D","#04756F","#009688","#26A69A","#00796B","#00A388","#1BBC9B","#1F8A70","#289976","#468966","#67CC8E","#168039","#79BD8F","#45BF55","#2E7D32","#66BB6A","#43A047","#96ED89","#33691E","#B1FF91","#BEEB9F","#91C46C","#689F38","#588F27","#8BC34A","#BDF271","#B5E655","#96CA2D","#A9CF54","#95AB63","#BDD684","#A8C545","#BEDB39",];

    function hexToRgb(hex) {
        hex = hex.replace("#","");
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);
        return [r,g,b];
    }

    colorPallete = [];
    for (let hex of hexPallete) {
        colorPallete.push(hexToRgb(hex));
    }
    colorIndices = {};
    for (let i = 0; i < colorPallete.length; i++) {
        colorIndices[colorPallete[i]] = i;
    }
}

function countColors(colors) {
    colorCount = {};
    for (let color of colors) {

        if (!(color in colorCount)) {
            colorCount[color] = 0;
        }

        colorCount[color] += 1;
    }
}
let blueprintFile;
let coloredBlueprintFile;
let doc;
function drawHeader(){
    doc.text(10, 10, "Número de orden: ");
    doc.text(10, 15, "Dimensión final: " + xBlocks*blockSize + "x" + yBlocks*blockSize + "in");
    doc.text(10, 20, "Número de páneles: " + xBlocks + "x" + yBlocks );
    doc.text(10, 25, "Tamaño de panel: " + blockSize + "in");
}
function drawBlueprintPdf(){
    doc = new jspdf.jsPDF('p', 'mm', [216, 279]);
    doc.setFontSize(12);

    drawHeader();
    doc.text(10, 30, "Leyenda de colores: ");

    y = 40;
    var sortedIndices = [];
    for(var color in colorCount) {
        idx = parseInt(colorIndices[color]);
        sortedIndices.push(idx);
    }
    sortedIndices.sort(function (a,b) {
        return a - b; // Ascending
    });

    x = 10;
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
        color = colorPallete[idx];
        colorObj = colorPallete[idx];
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(colorObj[0], colorObj[1], colorObj[2]);
        doc.rect(x, y - 3, 3, 3, 'FD');
        doc.setDrawColor(0, 0, 0);
        text = 'Color ' + idx + ': ' + color + ' (' + colorCount[color] + ')';
        doc.text(x + 5, y, text);
        y += 5.3;
    }
    currentPage = 1
    xBase = 0;
    yBase = 0;
    count = 0;
    dx = 10;
    dy = 35;
    tileSize = 8 * blockSize;
    tilesPerPage = 24 / blockSize;
    horizontalPages = Math.ceil(xBlocks / tilesPerPage);
    verticalPages = Math.ceil(yBlocks / tilesPerPage);
    totalPages = horizontalPages * verticalPages;
    doc.addPage();
    drawHeader();
    mapWidth = 8 * 24;
    mapHeight = 8 * 24;
    xDivision = mapWidth / horizontalPages;
    yDivision = mapHeight / verticalPages;
    k = 1;
    fontSize = Math.min(xDivision, yDivision);
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

        currentX = xBase;
        currentY = yBase;
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
                colorIdx = xBase + xi + (yBase + yi) * xBlocks;
                color = allColors[colorIdx];
                idx = colorIndices[color].toString();
                xRect = dx + xi * tileSize;
                yRect = dy + yi * tileSize;
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
    // Save the PDF
    blueprintFile = btoa(doc.output());
}
function drawColoredPdf(){
    doc = new jspdf.jsPDF('p', 'mm', [216, 279]);
    doc.setFontSize(12);

    drawHeader();
    doc.text(10, 30, "Leyenda de colores: ");

    y = 40;
    var sortedIndices = [];
    for(var color in colorCount) {
        idx = parseInt(colorIndices[color]);
        sortedIndices.push(idx);
    }
    sortedIndices.sort(function (a,b) {
        return a - b; // Ascending
    });

    x = 10;
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
        color = colorPallete[idx];
        colorObj = colorPallete[idx];
        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(colorObj[0], colorObj[1], colorObj[2]);
        doc.rect(x, y - 3, 3, 3, 'FD');
        doc.setDrawColor(0, 0, 0);
        text = 'Color ' + idx + ': ' + color + ' (' + colorCount[color] + ')';
        doc.text(x + 5, y, text);
        y += 5.3;
    }
    currentPage = 1
    xBase = 0;
    yBase = 0;
    count = 0;

    dx = 10;
    dy = 35;
    tileSize = 8 * blockSize;
    tilesPerPage = 24 / blockSize;
    horizontalPages = Math.ceil(xBlocks / tilesPerPage);
    verticalPages = Math.ceil(yBlocks / tilesPerPage);
    totalPages = horizontalPages * verticalPages;

    doc.addPage();
    drawHeader();
    mapWidth = 8 * 24;
    mapHeight = 8 * 24;
    xDivision = mapWidth / horizontalPages;
    yDivision = mapHeight / verticalPages;
    k = 1;
    fontSize = Math.min(xDivision, yDivision);
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

        currentX = xBase;
        currentY = yBase;
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
                colorIdx = xBase + xi + (yBase + yi) * xBlocks;
                color = allColors[colorIdx];
                idx = colorIndices[color].toString();
                xRect = dx + xi * tileSize;
                yRect = dy + yi * tileSize;
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
    setCropRatio();
}
function init() {
    uploadButton.addEventListener("click", function () {fileInput.click();});
    outputWidthInput.addEventListener("change", setCropRatioInput);
    outputHeightInput.addEventListener("change", setCropRatioInput);
    fileInput.addEventListener("change", createCropper);
    btn1In.addEventListener("click", updateBlockSize);
    btn2In.addEventListener("click", updateBlockSize);

    buildColorPallete(3,3,2);
    sourceImage.src = wp_variables.default_image;
    sourceImage.srcset = wp_variables.default_image;
    cropper = new Cropper(sourceImage, cropperSettings);
    btn1In.click();
    updatePixelitImg();
}

function findElementById(tag,id) {
    parent = document.getElementById(id);
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

jQuery(document).ready(function($) {         //wrapper
    $("#addToCart").on("click",function() {          //event
        drawColoredPdf();
        drawBlueprintPdf();
        $.post(wp_variables.ajax_url, {      //POST request
                _ajax_nonce: wp_variables.nonce, //nonce
                action: "change_price",         //action
                price: calculatePrice(),               //data
                blueprint: blueprintFile,
                coloredBlueprint: coloredBlueprintFile
            }, function(data) {            //callback
                window.location.href = wp_variables.cart_url;
            }
        );
    } );
} );
