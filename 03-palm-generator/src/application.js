/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionMaterials from './materials.js';
import {exportMeshAsObj} from './exporter.js';
import LeafGeometry from './LeafGeometry';
import PalmGenerator from './PalmGenerator.js';

const debug = true;
const scene = new THREE.Scene();
let gui;
const OrbitControls = require('three-orbit-controls')(THREE);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
const controls = new OrbitControls(camera, renderer.domElement);
const materials = new CollectionMaterials;
const material = materials["phong"];
const trunkMaterial = materials["standard"];
const stats = new Stats();
let exporting = false;
let palm;

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.style.margin =0;
    document.body.appendChild(renderer.domElement);
    camera.position.z = 80;

    // stats
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

    //lights
    let ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    gui = new Gui(material, trunkMaterial, exportMesh, regenerateMesh);
    gui.addScene(scene, ambientLight, renderer);

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
    regenerateMesh();

    render();
};


function addStats(debug) {
    if (debug) {
        document.body.appendChild(stats.domElement);
    }
}

function render(){
    stats.begin();
    if(!exporting){
        renderer.render(scene, camera);
    }
    stats.end();
    requestAnimationFrame(render);
}

let exportMesh = () => {
    exporting = true;
    exportMeshAsObj(scene);
    exporting = false;
}

let regenerateMesh = () => {
    let palm_opt = {
        spread: gui.params.spread,
        angle: gui.params.angle,
        num: gui.params.num,
        growth: gui.params.growth,
        foliage_start_at: gui.params.foliage_start_at,
        trunk_regular: gui.params.trunk_regular,
        buffers: true,
        angle_open: gui.params.angle_open,
        starting_angle_open: gui.params.starting_angle_open
    };

    let leafGeometry = makeLeaf();
    let curve = getCurve();
    let mesh = makePalm(leafGeometry, palm_opt,curve);
    mesh.castShadow = true;
    mesh.name = "palm";
    removeEntityByName("palm", scene);
    palm = mesh;
    scene.add( mesh );
}

function removeEntityByName(name,scene) {
    let selectedObject = scene.getObjectByName(name);
    if(selectedObject){
        scene.remove( selectedObject );
    }
}

function makePalm(leafGeometry, palm_opt,curve){
    // WS 01, have a look at the PalmGenerator.js file. Do you recongnise some of the previous code?
    // WS 02, find a palm that you like online, try to recreate it with the palm generator
    let trunkGeometry = new THREE.BoxGeometry(5,5,5);
    palm = new PalmGenerator(leafGeometry,
                             trunkGeometry,
                             palm_opt, curve);
    let geometry = palm.geometry;
    let bufGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    let palmBuffers = palm.buffers;
    bufGeometry.addAttribute( 'color', new THREE.BufferAttribute(
        palmBuffers.color,
        3));

    bufGeometry.attributes.color.needsUpdate = true;
    let tot_vert = palmBuffers.totVertices;
    let tot_vert_foliage = palmBuffers.totFoliageVertices;

    let materials = [material, trunkMaterial];
    bufGeometry.clearGroups();
    bufGeometry.addGroup(0,tot_vert_foliage,0);
    bufGeometry.addGroup((tot_vert_foliage),tot_vert,1);
    let mesh = new THREE.Mesh(bufGeometry, materials);
    return mesh;
}

function makeLeaf() {
    let opt = {
        length: gui.params.length,
        length_stem: gui.params.length_stem,
        width_stem: gui.params.width_stem,
        leaf_width: gui.params.leaf_width,
        leaf_up: gui.params.leaf_up,
        density: gui.params.density,
        curvature: gui.params.curvature,
        curvature_border: gui.params.curvature_border,
        leaf_inclination: gui.params.leaf_inclination
    };
    return new LeafGeometry(opt);
}

function getCurve(){
    // WS 03, change the vertices in the curve. The last one is the root of the palm.
    var curve = new THREE.CatmullRomCurve3( [
	      new THREE.Vector3( -40, 150, 0 ),
	      new THREE.Vector3( -40, 100, 0 ),
	      new THREE.Vector3( 0, 60, 0 ),
	      new THREE.Vector3( 0, 0, 0 ),
    ] );
    return curve;
}

init();

