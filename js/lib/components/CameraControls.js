import * as THREE from "../three.module.js"

import { GUI } from '../lil-gui.module.min.js';

import { ArcballControls } from '../ArcballControls.js';


const perspectiveDistance = 2.5;
const orthographicDistance = 120;
let camera, controls, scene, renderer, gui;
let folderOptions, folderAnimations;


const arcballGui = {

    gizmoVisible: true,

    /*setArcballControls: function () {

        controls = new ArcballControls( camera, renderer.domElement, scene );
        controls.addEventListener( 'change', render );

        this.gizmoVisible = true;

        this.populateGui();

    },*/

    populateGui: function (controls) {
        gui = new GUI();
        folderOptions = gui.addFolder( 'Arcball parameters' );
        folderAnimations = folderOptions.addFolder( 'Animations' );

        folderOptions.add( controls, 'enabled' ).name( 'Enable controls' );
        folderOptions.add( controls, 'enableGrid' ).name( 'Enable Grid' );
        folderOptions.add( controls, 'enableRotate' ).name( 'Enable rotate' );
        folderOptions.add( controls, 'enablePan' ).name( 'Enable pan' );
        folderOptions.add( controls, 'enableZoom' ).name( 'Enable zoom' );
        folderOptions.add( controls, 'cursorZoom' ).name( 'Cursor zoom' );
        folderOptions.add( controls, 'adjustNearFar' ).name( 'adjust near/far' );
        folderOptions.add( controls, 'scaleFactor', 1.1, 10, 0.1 ).name( 'Scale factor' );
        folderOptions.add( controls, 'minDistance', 0, 50, 0.5 ).name( 'Min distance' );
        folderOptions.add( controls, 'maxDistance', 0, 50, 0.5 ).name( 'Max distance' );
        folderOptions.add( controls, 'minZoom', 0, 50, 0.5 ).name( 'Min zoom' );
        folderOptions.add( controls, 'maxZoom', 0, 50, 0.5 ).name( 'Max zoom' );
        folderOptions.add( arcballGui, 'gizmoVisible' ).name( 'Show gizmos' ).onChange( function () {

            controls.setGizmosVisible( arcballGui.gizmoVisible );

        } );
        folderOptions.add( controls, 'copyState' ).name( 'Copy state(ctrl+c)' );
        folderOptions.add( controls, 'pasteState' ).name( 'Paste state(ctrl+v)' );
        folderOptions.add( controls, 'reset' ).name( 'Reset' );
        folderAnimations.add( controls, 'enableAnimations' ).name( 'Enable anim.' );
        folderAnimations.add( controls, 'dampingFactor', 0, 100, 1 ).name( 'Damping' );
        folderAnimations.add( controls, 'wMax', 0, 100, 1 ).name( 'Angular spd' );

    }

};



export default arcballGui;