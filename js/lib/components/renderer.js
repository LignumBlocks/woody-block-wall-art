import { PCFSoftShadowMap, VSMShadowMap, WebGLRenderer } from "../three.module.js";
const renderer = new WebGLRenderer({antialias: true});

const container = document.getElementById("pixelitImageFinal");
renderer.setSize( container.clientWidth, container.clientHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  //renderer.shadowMap.type = VSMShadowMap;
  
  renderer.shadowMap.renderSingleSided = false;

container.children[0].children[0].remove();
container.children[0].appendChild(renderer.domElement);

export {container};
export default renderer;