import DAT from 'dat-gui';
import {Color, Fog} from 'three';

export default class Gui extends DAT.GUI{
    constructor(material, trunkMaterial, callbackExport, regenerateMesh){
        super(
            {
                load: JSON,
                preset: 'Flow'
            }
        );

        this.material = material;
        this.trunkMaterial = trunkMaterial;
        this.params = {
            spread: 0.1,
            angle: 137.5,
            num: 406,
            growth: 0.12,
            foliage_start_at: 40,
            trunk_regular: false,
            angle_open: 36.17438258159361,
            starting_angle_open: 47,
            length: 50,
            length_stem: 20,
            width_stem: 0.2,
            leaf_width: 0.8,
            leaf_up: 1.5,
            density: 11,
            curvature: 0.04,
            curvature_border: 0.005,
            leaf_inclination: 0.9,

            color: 0xefff00,
            emissive: 0x4ca078,
            roughness:0.55,
            metalness:0.89,
            vertex_colors: true,
            backgroundColor:"#505050",
            ambientLight:"#34ac0f",

            colorT: 0xefff00,
            emissiveT: 0x4ca078,
            roughnessT:0.55,
            metalnessT:0.89,
            vertex_colorsT: true,
            backgroundColorT:"#505050",
            ambientLightT:"#34ac0f"

        };
        this.remember(this.params);

        let saveMesh = { add:callbackExport};
        this.add(saveMesh, 'add').name('SAVE');

        this.add(this.params, "spread").min(0).max(0.7).step(0.1).onChange(regenerateMesh);;
        this.add(this.params, "angle").min(132.0).max(138.0).step(0.01).onChange(regenerateMesh);;
        this.add(this.params, "num").min(60).max(2200).step(1).onChange(regenerateMesh);;
        //this.add(this.params, "growth").min(0.04).max(0.25).step(0.01); useless when on the curve
        this.add(this.params, "foliage_start_at").min(10).max(320).step(1).onChange(regenerateMesh);;
        this.add(this.params, "angle_open").min(0).max(80).onChange(regenerateMesh);;
        this.add(this.params, "starting_angle_open").min(20).max(100).onChange(regenerateMesh);;
        this.add(this.params, "trunk_regular").onChange(regenerateMesh);;


        this.add(this.params, "length").min(0).max(40).step(1).onChange(regenerateMesh);
        this.add(this.params, "length_stem").min(0).max(10).step(1).onChange(regenerateMesh);
        this.add(this.params, "width_stem").min(0.2).max(2).step(0.1).onChange(regenerateMesh);
        this.add(this.params, "leaf_width").min(0.1).max(1.0).step(0.1).onChange(regenerateMesh);
        this.add(this.params, "leaf_up").min(0).max(5).step(0.5).onChange(regenerateMesh);
        this.add(this.params, "curvature").min(0.001).max(0.10).step(0.001).onChange(regenerateMesh);
        this.add(this.params, "curvature_border").min(0.001).max(0.10).step(0.001).onChange(regenerateMesh);
        this.add(this.params, "leaf_inclination").min(0.1).max(1.0).step(0.1).onChange(regenerateMesh);
        this.add(this.params, "density").min(6).max(26).step(1).onChange(regenerateMesh);

        let mat = this.addFolder('Foliage Material');
        mat.closed=true;
        mat.add(this.params, "vertex_colors").onChange( this._handleVertexColorChange(this.material));
        mat.addColor(this.params, 'color' ).onChange( this._handleColorChange( this.material.color ) );
        mat.addColor(this.params, 'emissive' ).onChange( this._handleColorChange( this.material.emissive ) );
        mat.add(this.params, 'metalness', 0.0, 1.0).onChange( (val)=>{this.material.metalness = val;});
        mat.add(this.params, 'roughness', 0.0, 1.0).onChange( (val)=>{this.material.roughness = val;});

        let tmat = this.addFolder('Trunk Material');
        tmat.closed=true;
        tmat.add(this.params, "vertex_colorsT").onChange( this._handleVertexColorChange(this.trunkMaterial));
        tmat.addColor(this.params, 'colorT' ).onChange( this._handleColorChange( this.trunkMaterial.color ) );
        tmat.addColor(this.params, 'emissiveT' ).onChange( this._handleColorChange( this.trunkMaterial.emissive ) );
        tmat.add(this.params, 'metalnessT', 0.0, 1.0).onChange( (val)=>{this.trunkMaterial.metalness = val;});
        tmat.add(this.params, 'roughnessT', 0.0, 1.0).onChange( (val)=>{this.trunkMaterial.roughness = val;});

    }


    // credtis to these methods goes to Greg Tatum https://threejs.org/docs/scenes/js/material.js
    addScene ( scene, ambientLight, renderer ) {
	      let folder = this.addFolder('Scene');
	      let data = {
		        background : "#000000",
		        "ambient light" : ambientLight.color.getHex()
	      };

	      let color = new Color();
	      let colorConvert = this._handleColorChange( color );

	      folder.addColor( data, "background" ).onChange( function ( value ) {
		        colorConvert( value );
		        renderer.setClearColor( color.getHex() );

	      } );

	      folder.addColor( data, "ambient light" ).onChange( this._handleColorChange( ambientLight.color ) );
	      this.guiSceneFog( folder, scene );
    }

    guiSceneFog ( folder, scene ) {
	      let fogFolder = folder.addFolder('scene.fog');
	      let fog = new Fog( 0x3f7b9d, 0, 60 );
	      let data = {
		        fog : {
			          "THREE.Fog()" : false,
			          "scene.fog.color" : fog.color.getHex()
		        }
	      };

	      fogFolder.add( data.fog, 'THREE.Fog()' ).onChange( function ( useFog ) {
		        if ( useFog ) {
			          scene.fog = fog;
		        } else {
			          scene.fog = null;
		        }
	      } );
	      fogFolder.addColor( data.fog, 'scene.fog.color').onChange( this._handleColorChange( fog.color ) );
    }

    _removeFolder(name) {
        let folder = this.__folders[name];
        if (!folder) {
            return;
        }
        folder.close();
        this.__ul.removeChild(folder.domElement.parentNode);
        delete this.__folders[name];
        this.onResize();
    }
    _handleColorChange ( color ) {
	      return ( value ) => {
		        if (typeof value === "string") {
			          value = value.replace('#', '0x');
		        }
		        color.setHex( value );
        };
    }
    _handleVertexColorChange ( material ) {
        return (value) => {
            if (value === true) {
                material.vertexColors = VertexColors;
            } else {
                material.vertexColors = NoColors;
            }
            material.needsUpdate = true;
        }
    }
}
