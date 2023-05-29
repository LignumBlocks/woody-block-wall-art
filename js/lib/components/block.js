import { MeshStandardMaterial, Mesh, BufferGeometry, BufferAttribute, FrontSide } from "../three.module.js";

const makeBlock = (color, x, y, map, roughness, envMaps, cornerX = 0, cornerZ = 0, matrix) => {
    
    const geometry = new BufferGeometry();

    const vertices = new Float32Array( [
        // Front
         - 0.5, 0.7, 0.5,
         0.5, 0.7, 0.5, 
         - 0.5, 0, 0.5, 
         0.5, 0, 0.5,
         // Back
         0.5, 1, - 0.5,
         - 0.5, 1, - 0.5,
         0.5, 0, - 0.5,
         - 0.5, 0, - 0.5,
         // Left
         - 0.5, 1, - 0.5,
         - 0.5, 0.7, 0.5, 
         - 0.5, 0, - 0.5,
         - 0.5, 0, 0.5,
         // Right
         0.5, 0.7, 0.5, 
         0.5, 1, - 0.5,
         0.5, 0, 0.5, 
         0.5, 0, - 0.5, 
         // Top
         - 0.5, 0.7, 0.5,
         0.5, 0.7, 0.5, 
         - 0.5, 1, - 0.5,
         0.5, 1, - 0.5, 
         // Bottom
         0.5, 0, 0.5,
         - 0.5, 0, 0.5,
         0.5, 0, - 0.5,
         - 0.5, 0, - 0.5,
     ] );
     
     const indices = [
        0, 2, 1,
		2, 3, 1,
		4, 6, 5,
		6, 7, 5,
		8, 10, 9,
		10, 11, 9,
		12, 14, 13,
		14, 15, 13,
		16, 17, 18,
		18, 17, 19,
		20, 21, 22,
		22, 21, 23
    ];

     
    geometry.setAttribute( 'uv', new BufferAttribute( randomUV(), 2 ) );
     
    geometry.setIndex( indices );

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
    geometry.computeVertexNormals();
    geometry.rotateX(Math.PI/2);

    const material = new MeshStandardMaterial( {
         flatShading: true,
         color: color, 
         emissive: color,
         emissiveIntensity: 0.4,
         side: FrontSide, 
         map: map, 
         roughnessMap: roughness,
         roughness: 1,
         //envMap: envMaps,
        } );
    const mesh = new Mesh( geometry, material );   
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    let mult = getRotation(matrix, x, Math.abs(y)); //determinar el 'angulo de rotacion

    mesh.rotateZ( Math.PI * mult);
    
    mesh.position.x = cornerX + x;
    mesh.position.y =  cornerZ + y;    

    return mesh;
}

function randomUV(){
    var uvs_1 =
     [
        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,

        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,

        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,

        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,

        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,

        0,0,
        0.5,0,
        0,0.5,
        0.5,0.5,
     ];
     var uvs_2 =
     [
        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,

        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,

        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,

        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,

        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,

        0.5,0,
        1,0,
        0.5,0.5,
        1,0.5,
     ];
     var uvs_3 =
     [
        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,

        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,

        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,

        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,

        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,

        0,0.5,
        0.5,0.5,
        0,1,
        0.5,1,
     ];
     var uvs_4 =
     [
        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,

        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,

        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,

        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,

        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,

        0.5,0.5,
        1,0.5,
        0.5,1,
        1,1,
     ];

    let variantsUV = new Array(4);
    variantsUV[0] = uvs_1;
    variantsUV[1] = uvs_2;
    variantsUV[2] = uvs_3;
    variantsUV[3] = uvs_4;

    let index = getRandomInt(0, 3);

    var uvs = new Float32Array( variantsUV[index] );
    return uvs;
}
//calculate the rotation angle of the block, it look the East and Nort element
//to 
function getRotation(matrix, x, y){
    let radio = [0, 0.5, 1, 1.5];//rotation angles
    
    if( x > 0 ) {//exclude the first row
        let bockLeftRotation = matrix[x - 1][y];//

        if( bockLeftRotation == 0 ){
            radio.splice(radio.indexOf(0), 1);
        }
        if( bockLeftRotation == 1 ){
            radio.splice(radio.indexOf(1), 1);
        }  
        if( bockLeftRotation == 0.5 ){
            radio.splice(radio.indexOf(0.5), 1);
        }
        if( bockLeftRotation == 1.5 ){
            radio.splice(radio.indexOf(1.5), 1);
        }
    }
    if( y > 0 ) {//exclude the first column
        let bockTopRotation = matrix[x][y-1];
        if( bockTopRotation == 0 ){
            radio.splice(radio.indexOf(0), 1);
            radio.splice(radio.indexOf(1), 1);            
        }
        if( bockTopRotation == 1 ){
            radio.splice(radio.indexOf(1), 1);
        }
        if( bockTopRotation == 0.5 ){
            radio.splice(radio.indexOf(0.5), 1);
        }
        if( bockTopRotation == 1.5 ){
            radio.splice(radio.indexOf(1.5), 1);
        }
    }
    let index = getRandomInt(0, radio.length - 1);
    let mult = radio[index];
    matrix[x][y] = mult;
    return mult;
}

function getRandomInt(min, max) {    
    var x = Math.floor(Math.random()*(max-min+1)+min);
    return x;
}


export default makeBlock;