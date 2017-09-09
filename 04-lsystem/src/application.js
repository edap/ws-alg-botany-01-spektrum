/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';

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
var objects = [];
var group = new THREE.Group();

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

function populateGroup(selected_geometry, selected_material) {
    for (var i = 0; i< gui.params.num; i++) {
        // WS 01 , try to use phyllotaxis
        //let coord = phyllotaxisSimple(i, 137.5, 0.5, false);
        let coord = {x:i, y:i, z:i};
        let object = new THREE.Mesh(selected_geometry, selected_material);
        object.position.set(coord.x, coord.y, coord.z);
        object.rotateY( (90 + 40 + i * 100/gui.params.num ) * -Math.PI/180.0 );

        objects.push(object);
        group.add(object);
    }
    scene.add(group);
}

function addStats(debug) {
    if (debug) {
        document.body.appendChild(stats.domElement);
    }
}


function resetGroup(){
    for (var index in objects) {
        let object = objects[index];
	    group.remove( object );
    }
    scene.remove(group);
    objects = [];
}

function render(){
    stats.begin();
    populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
    if (gui.params.rotate_flower) {
        group.rotateZ( 0.0137);
    }
    renderer.render(scene, camera);
    resetGroup();
    stats.end();
    requestAnimationFrame(render);
}


function phyllotaxisSimple(i, angleInRadians, spread, extrude){
    let current_angle = i * angleInRadians;
    let radius = spread * Math.sqrt(i);
    let x = radius * Math.cos(current_angle);
    let y = radius * Math.sin(current_angle);
    let z = 0.0;
    if (extrude) {
        z = i * -.05;
    }
    return {x, y, z};
}


