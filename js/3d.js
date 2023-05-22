import scene from "./lib/components/scene.js";
import camera from "./lib/components/camera.js";
import makeBlock from "./lib/components/block.js";
import renderer from "./lib/components/renderer.js";
import light from "./lib/components/light.js";
import { Resizer } from "./lib/Resizer.js";
import { container } from "./lib/components/renderer.js";
import { gsap } from "./gsap/index.js";
import {
    AmbientLight, 
    AxesHelper, 
    DirectionalLightHelper, 
    TextureLoader,
    EquirectangularReflectionMapping,
    MathUtils,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh
  } from "./lib/three.module.js";
import { OrbitControls } from './lib/OrbitControls.js';
import { RGBELoader } from "./lib/RGBELoader.js" 


//Create color string
const rgbC = (arr) => {
    return "rgb("+arr[0]+","+ arr[1]+","+arr[2]+")";
}

const paint = async (allColors, xBlocks, yBlocks, callback) => {

    //cleaning the scene
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.dampingFactor = 0.05;
    controls.enableDamping = true;  
    controls.minDistance  = 5;

    controls.minAzimuthAngle = MathUtils.degToRad(-20);
    controls.maxAzimuthAngle = MathUtils.degToRad(20);

    controls.maxPolarAngle = MathUtils.degToRad(90); // default
    controls.minPolarAngle = MathUtils.degToRad(60); // default

    controls.update();

    const textureLoader = new TextureLoader();      
    const normal = textureLoader.load(wp_variables.resources_path+"/textures/wood_normal.jpeg");
    const roughness = textureLoader.load(wp_variables.resources_path+"/textures/wood_roughness.jpeg");

    new RGBELoader()
    .setPath( wp_variables.resources_path+"/textures/")
    .load( 'royal_esplanade_1k.hdr', function ( texture ) {    
        texture.mapping = EquirectangularReflectionMapping;    
        scene.background = texture;
        scene.environment = texture;   
    
    } );

        
    const cameraZ = Math.max(xBlocks, yBlocks);

    camera.position.set(0, 0, cameraZ);
//start the animation            
    camera.lookAt(0,0,0); 
    const tl = gsap.timeline();
    controls.enabled = false;
    tl.to(camera.position,{
        duration: 2,
        z: 5,
        onUpdate: function() {            
            controls.update();        
        },
        ease: "power2.inOut"

    })
    .to(camera.position,{
        duration: 2,
        z: cameraZ,
        onUpdate: function() {	            	
            controls.update();        
        },
        ease: "power2.inOut"
    })
    .to(camera.position,{
        duration: 2,
        z: cameraZ,
        x: 3,
        y: 1,
        onUpdate: function() {            
            controls.update();        
        },
        ease: "power2.inOut"
    })
    .to(camera.position,{
        duration: 2,
        z: cameraZ,
        x: 0,
        y: 0,
        onUpdate: function() {            
            controls.update();        
        },
        onComplete: function() {
            controls.enabled = true;
            controls.update();
        },
        ease: "power2.inOut"
    })   
// end animation

//create a matrix to store blocks rotation angles
    let matrix = new Array(xBlocks);
    for (let index = 0; index < matrix.length; index++) {
        matrix[index] = new Array(yBlocks);        
    }
    //calucate the position of the first block
    let cornerX = -xBlocks/2 + 0.5;
    let cornerZ =  yBlocks/2 + 0.5;

    let cont = 0;
    //making blocks, one row at time
    for (let y = 0; y < yBlocks; y++) {
        for (let x = 0; x < xBlocks; x++) {   
            console.log("pintado", cont++);       
            let block = makeBlock(rgbC(
                allColors[y * xBlocks + x]), //One-dimentional array width all colors
                x , 
                -y, 
                normal, //textures
                roughness, //textures
                cornerX,
                cornerZ,
                matrix);
            scene.add(block);
        }    
    }
   
    light.position.set(-5,5,5);
    const al = new AmbientLight( 0xffffff, 0.5);
    
    scene.add(light);
    scene.add(al);
    
    //Painting black Frame

    const topFrameGeometry = new BoxGeometry(xBlocks, 1.5, 0.5);
    const frameMaterial = new MeshStandardMaterial({ 
        color: 0x000000, 
        roughness: 0.1,
    });
    const topFrameMesh = new Mesh(topFrameGeometry, frameMaterial);
    topFrameMesh.receiveShadow = true;
    topFrameMesh.position.x = 0;
    topFrameMesh.position.y = yBlocks/2+1;
    topFrameMesh.position.z = 0.0;

    const bottomFrameMesh = topFrameMesh.clone();
    bottomFrameMesh.position.y = -yBlocks/2+1;

    const leftFrameGeometry = new BoxGeometry(yBlocks+1.5, 1.5, 0.5);
    const leftFrameMesh = new Mesh(leftFrameGeometry, frameMaterial);

    leftFrameMesh.rotateZ(MathUtils.degToRad(90));
    leftFrameMesh.position.x = cornerX-0.5;
    leftFrameMesh.position.y = 1;

    let rightFrameMesh = leftFrameMesh.clone();
    rightFrameMesh.position.x = xBlocks/2+0.5;

    scene.add(bottomFrameMesh);
    scene.add(topFrameMesh);
    scene.add(leftFrameMesh);
    scene.add(rightFrameMesh);
    // the black frame is finished painting
    
    //update the camera-aspect and render-size to fix the container
    const resizer = new Resizer(container, camera, renderer);
    resizer.onResize = () => {
        renderer.render(scene, camera);
    };

    //the painting finished
    callback();
    
    (async function(){
        renderer.setAnimationLoop(() => {            
        controls.update();
        renderer.render(scene, camera);
    });})()
    
}

export default paint
