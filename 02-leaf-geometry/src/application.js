/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionMaterials from './materials.js';
import {phyllotaxisSimple, phyllotaxisConical} from './phyllotaxis.js';
import {exportMeshAsObj} from './exporter.js';
import LeafGeometry from './LeafGeometry';

const debug = true;
const scene = new THREE.Scene();
let gui;
const OrbitControls = require('three-orbit-controls')(THREE);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
const controls = new OrbitControls(camera, renderer.domElement);
const materials = new CollectionMaterials;
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

    populateGroup(materials[gui.params.material]);
    render();
};

function populateGroup(selected_material) {
    let leafGeometry = makeLeaf();
    let radToDeg = Math.PI/180.0;
    for (var i = 0; i< gui.params.num; i++) {
        let coord = phyllotaxisConical(i, gui.params.angle, gui.params.spread, gui.params.extrude);
        let object = new THREE.Mesh(leafGeometry, selected_material);
        object.position.set(coord.x, coord.y, coord.z);
        // WS 01, what if you add rotation while composing?
        // try uncommenting this line first and changing the parameter rotateZ in the GUI
        object.rotateZ( (gui.params.rotateZ + i * 100/gui.params.num ) * -radToDeg );
        // try uncommenting this line first and changing the parameter rotateY in the GUI
        object.rotateY( (gui.params.rotateY + i * 200/gui.params.num ) * -radToDeg );

        let ratio = i/gui.params.num;
        let scaleRatio = ratio === 0 ? 0.001 : ratio;
        object.scale.set(5 * scaleRatio ,1 ,1);
        //WS 03 what if you scale in other sides other than x with another factor other than 5?
        object.scale.set(1, 8 * scaleRatio ,1);
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
        if (gui.params.rotate_flower) {
            group.rotateZ( 0.0137);
        }
        renderer.render(scene, camera);
    }
    stats.end();
    requestAnimationFrame(render);
}

let exportMesh = () => {
    exporting = true;
    let selected_geometry = mergeObjectsInOneGeometry(objects);
    let mesh = new THREE.Mesh(selected_geometry, materials[gui.params.material]);
    scene.add(mesh);
    exportMeshAsObj(scene);
    scene.remove(mesh);
    exporting = false;
}

let regenerateMesh = () => {
    resetGroup();
    populateGroup(materials[gui.params.material]);
}

function mergeObjectsInOneGeometry(objects){
    let geometry = new THREE.Geometry();
    for (let i = 0; i < objects.length; i++){
        let mesh = objects[i];
        mesh.updateMatrix();
        geometry.merge(mesh.geometry, mesh.matrix);
    }
    assignUVs(geometry);
    return geometry;
}

function makeLeaf(material) {
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
    let geometry = new LeafGeometry(opt);
    return geometry;
}


function assignUVs(geometry) {
    geometry.faceVertexUvs[0] = [];
    geometry.faces.forEach(function(face) {
        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];
        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);
    });

    geometry.uvsNeedUpdate = true;
}

init();

