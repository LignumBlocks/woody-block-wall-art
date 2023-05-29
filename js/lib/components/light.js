import { AmbientLight, DirectionalLight, MathUtils, SpotLight, TextureLoader } from "../three.module.js";


const spotLight = new SpotLight( 0xffffff, 5);

spotLight.angle = 0.4;
//spotLight.penumbra = 0.2;
//spotLight.decay = 2;
//spotLight.distance = 30;

spotLight.position.set( 0, 40, 7 );

spotLight.castShadow = true;

/*spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 20;
spotLight.shadow.camera.fov = 30;*/

const directionalLight = new DirectionalLight(0xffffff, 1 );
directionalLight.castShadow = true;
directionalLight.position.set(0, 30, 6);
const ambientlight = new AmbientLight( 0xffffff, 0.5);

export {directionalLight, ambientlight, spotLight};