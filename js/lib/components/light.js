import { AmbientLight, DirectionalLight, MathUtils, SpotLight, TextureLoader } from "../three.module.js";


const spotLight = new SpotLight( 0xffffff, 5);
const spotLight1 = new SpotLight( 0xffffff, 5);

spotLight.angle = 0.4;
spotLight1.angle = 0.4;


spotLight.position.set( 20, 40, 7 );
spotLight1.position.set( -20, 40, 7 );


spotLight.castShadow = true;
spotLight1.castShadow = true;

/*spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 20;
spotLight.shadow.camera.fov = 30;*/

const directionalLight = new DirectionalLight(0xffffff, 1 );
directionalLight.castShadow = true;
directionalLight.position.set(0, 30, 6);
const ambientlight = new AmbientLight( 0xffffff, 0.5);

export {directionalLight, ambientlight, spotLight, spotLight1};