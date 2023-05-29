import scene from "./lib/components/scene.js";
import camera from "./lib/components/camera.js";
import makeBlock from "./lib/components/block.js";
import renderer from "./lib/components/renderer.js";
import {directionalLight, ambientlight, spotLight, spotLight1} from "./lib/components/light.js";
import { Resizer } from "./lib/Resizer.js";
import { container } from "./lib/components/renderer.js";
import { gsap } from "./gsap/index.js";
import {    
    TextureLoader,
    EquirectangularReflectionMapping,
    MathUtils,
    BoxGeometry,
    MeshStandardMaterial,
    Mesh,
    CubeTextureLoader,
    CubeRefractionMapping,
    Color,
    DirectionalLightHelper,
    Object3D,
    SpotLightHelper,
    Vector3
  } from "./lib/three.module.js";
import { OrbitControls } from './lib/OrbitControls.js';
import { ArcballControls } from './lib/ArcballControls.js';
import  arcballGui  from './lib/components/CameraControls.js';

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

    //const controls = new OrbitControls(camera, renderer.domElement);

    //controls.dampingFactor = 0.05;
    //controls.enableDamping = true;  
    //controls.minDistance  = 5;

    //controls.minAzimuthAngle = MathUtils.degToRad(-20);
    //controls.maxAzimuthAngle = MathUtils.degToRad(20);

    //controls.maxPolarAngle = MathUtils.degToRad(90); // default
    //controls.minPolarAngle = MathUtils.degToRad(60); // default

    //controls.update();

    const textureLoader = new TextureLoader(); 


    const cubeTextureLoader = new CubeTextureLoader();
    const path = wp_variables.resources_path+'/textures/SwedishRoyalCastle/';
				const format = '.jpg';
				const urls = [
					path + 'px' + format, path + 'nx' + format,
					path + 'py' + format, path + 'ny' + format,
					path + 'pz' + format, path + 'nz' + format
				];

    const reflectionCube = cubeTextureLoader.load( urls );
       
      
    const map = textureLoader.load(wp_variables.resources_path+"/textures/brick_diffuse.jpg");
    const roughness = textureLoader.load(wp_variables.resources_path+"/textures/brick_roughness.jpg");

    /*new RGBELoader()
    .setPath( wp_variables.resources_path+"/textures/")
    .load( 'royal_esplanade_1k.hdr', function ( texture ) {    
        texture.mapping = EquirectangularReflectionMapping;    
        scene.background = texture;
        scene.environment = texture;   
    
    } );*/
        
    const cameraZ = Math.max(xBlocks, yBlocks);

    camera.position.set(0, 0, cameraZ);
//start the animation            
    camera.lookAt(0,0,0); 
    /*const tl = gsap.timeline();
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
    })   */
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
            let block = makeBlock(rgbC(
                allColors[y * xBlocks + x]), //One-dimentional array width all colors
                x , 
                -y, 
                map, //textures
                roughness, //textures
                reflectionCube,
                cornerX,
                cornerZ,
                matrix);
            scene.add(block);
        }    
    }
   
    
    //add lights
    scene.add(ambientlight);
    //scene.add(directionalLight);
    //spotLight.target = new Vector3(0,10,0);
    scene.add(spotLight.target);
    spotLight.target.position.z = 1;
    spotLight.target.position.x = 0;
    spotLight.target.position.y = -5;




    /*const targetObject = new Object3D(); 
    targetObject.position.y = -10;
    scene.add(targetObject);
    light.target = targetObject;*/


    scene.add(spotLight);
    scene.add(spotLight1);


    const spotLightHelper = new SpotLightHelper( spotLight );
    scene.add( spotLightHelper );
    const spotLightHelper1 = new SpotLightHelper( spotLight1 );
    scene.add( spotLightHelper1 );


    scene.background = new Color( 0x000000 );

    const helper = new DirectionalLightHelper( directionalLight, 5 );
    //scene.add( helper );

    
    //Painting black Frame

    const topFrameGeometry = new BoxGeometry(xBlocks, 1.5, 0.5);
    const frameMaterial = new MeshStandardMaterial({ 
        color: 0xffff00, 
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

    let ballControls = new ArcballControls(camera,renderer.domElement,scene)
    ballControls.addEventListener( 'change', render );

    arcballGui.populateGui(ballControls);

    //end painting

    render();
    callback();
    
    
    /*(async function(){
        renderer.setAnimationLoop(() => {            
        controls.update();
        renderer.render(scene, camera);
    });})()*/

    function render() {

        renderer.render( scene, camera );

    }
    
}

export default paint
