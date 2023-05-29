import { Fog, Scene } from "../three.module.js"; 

const scene = new Scene();
let fog = new Fog( 0x0d0d0d, 1, 1000 );
scene.fog = fog;

export default scene;
