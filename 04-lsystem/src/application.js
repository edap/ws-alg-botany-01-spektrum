/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';
const LSystem = require('lindenmayer');

const gui = new Gui();
const debug = true;
const scene = new THREE.Scene();
const OrbitControls = require('three-orbit-controls')(THREE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin =0;
document.body.appendChild(renderer.domElement);
camera.position.z = 80;
this.controls = new OrbitControls(camera, renderer.domElement);

// stats
const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom


//scene
const materials = new CollectionMaterials;
const geometries = new CollectionGeometries;

//lights
let ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );
gui.addScene(scene, ambientLight, renderer);
gui.addMaterials(materials);

let lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );




var axisHelper = new THREE.AxisHelper( 50 );
//scene.add( axisHelper );

window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

addStats(debug);
render();


function addStats(debug) {
    if (debug) {
        document.body.appendChild(stats.domElement);
    }
}

function render(){
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(render);
}
