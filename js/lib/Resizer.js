import { PCFSoftShadowMap, VSMShadowMap } from "./three.module.js";

const setSize = (container, camera, renderer) => {
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.shadowMap.renderSingleSided = false;
  };
  
  class Resizer {
    constructor(container, camera, renderer) {
      // set initial size on load
      setSize(container, camera, renderer);
      window.addEventListener("resize", () => {
        // set the size again if a resize occurs
        setSize(container, camera, renderer);
        this.onResize();
      });
    }
    onResize() {}
  }
  
  export { Resizer };