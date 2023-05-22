import { WebGLRenderer } from "../three.module.js";
const renderer = new WebGLRenderer({antialias: true});

const container = document.getElementById("pixelitImageFinal");
renderer.setSize( container.offsetWidth, container.offsetHeight );


container.children[0].children[0].remove();
container.children[0].appendChild(renderer.domElement);

export {container};
export default renderer;