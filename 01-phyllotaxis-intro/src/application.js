/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';
import {phyllotaxisSimple, phyllotaxisConical, phyllotaxisApple, phyllotaxisWrong} from './phyllotaxis.js';
import {exportMeshAsObj} from './exporter.js';

const debug = true;
const scene = new THREE.Scene();
let gui;
const OrbitControls = require('three-orbit-controls')(THREE);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
const controls = new OrbitControls(camera, renderer.domElement);
const materials = new CollectionMaterials;
const geometries = new CollectionGeometries;
const stats = new Stats();
let exporting = false;

var objects = [];
var group = new THREE.Group();

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.style.margin =0;
    document.body.appendChild(renderer.domElement);
    camera.position.z = 80;

    // stats
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

    //scene

    //lights
    let ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    gui = new Gui(exportMesh, regenerateMesh);
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

    populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
    render();
};

function populateGroup(selected_geometry, selected_material) {
    for (var i = 0; i< gui.params.num; i++) {
        // WS 01 , there are some phyllotaxis functions in the  phyllotaxis.js file! try them out
        // WS 02, make a meaningfull composition, experiment with other geometries like
        // https://threejs.org/docs/#api/geometries/IcosahedronGeometry
        //let coord = phyllotaxisConical(i, gui.params.angle, gui.params.spread, gui.params.extrude);
        let coord =  phyllotaxisWrong(i, gui.params.angle, gui.params.spread, gui.params.num);
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
    if(!exporting){
        //populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
        if (true) {
            group.rotateZ( 0.0137);
        }
        renderer.render(scene, camera);
        //resetGroup();
    }
    stats.end();
    requestAnimationFrame(render);
}

let exportMesh = () => {
    exporting = true;
    //populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
    let selected_geometry = mergeObjectsInOneGeometry(objects);
    let mesh = new THREE.Mesh(selected_geometry, materials[gui.params.material]);
    scene.add(mesh);
    exportMeshAsObj(scene);
    scene.remove(mesh);
    //resetGroup();
    exporting = false;
}

let regenerateMesh = () => {
    resetGroup();
    populateGroup(geometries[gui.params.geometry],materials[gui.params.material]);
}

function mergeObjectsInOneGeometry(objects){
    let geometry = new THREE.Geometry();
    for (let i = 0; i < objects.length; i++){
        let mesh = objects[i];
        mesh.updateMatrix();
        geometry.merge(mesh.geometry, mesh.matrix);
    }
    return geometry;
}


init();

