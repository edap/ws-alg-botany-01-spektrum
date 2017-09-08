import DAT from 'dat-gui';
import {Color, Fog} from 'three';

export default class Gui extends DAT.GUI{
    constructor(callbackExport, regenerateMesh){
        super(
            {
                load: JSON,
                preset: 'Flow'
            }
        );
        this.params = {
            material: "standard",
            length:24,
            length_stem:1,
            width_stem:0.7,
            leaf_width:0.5,
            leaf_up:1.5,
            curvature: 0.05,
            curvature_border: 0.05,
            leaf_inclination: 0.7,
            border_curve: 0.002,
            density:21,
            angle: 137.5,
            spread: 0.4,
            extrude: 0.5,
            num:3,
            rotateZ: 2.0,
            rotateY: 2.0
        };
        this.remember(this.params);

        let saveMesh = { add:callbackExport};
        this.add(saveMesh, 'add').name('SAVE');


        this.add(this.params, "material", ["standard", "wireframe", "phong","lambert"]).onChange(this._updateMaterialFolder(regenerateMesh));
        this.add(this.params, "angle").min(136.0).max(138.0).step(0.1).onChange(regenerateMesh);
        this.add(this.params, "spread").min(0.2).max(10.0).step(0.2).onChange(regenerateMesh);
        this.add(this.params, "extrude").min(0.0).max(5.0).step(0.1).onChange(regenerateMesh);
        this.add(this.params, "num").min(1).max(800).step(1).onChange(regenerateMesh);
        this.add(this.params, "rotateZ").min(0).max(360).step(1).onChange(regenerateMesh);
        this.add(this.params, "rotateY").min(0).max(360).step(1).onChange(regenerateMesh);

        this.add(this.params, "length").min(0).max(40).step(1).onChange(regenerateMesh);;
        this.add(this.params, "length_stem").min(0).max(10).step(1).onChange(regenerateMesh);;
        this.add(this.params, "width_stem").min(0.2).max(2).step(0.1).onChange(regenerateMesh);;
        this.add(this.params, "leaf_width").min(0.1).max(1.0).step(0.1).onChange(regenerateMesh);;
        this.add(this.params, "leaf_up").min(0).max(5).step(0.5).onChange(regenerateMesh);;
        this.add(this.params, "curvature").min(0.001).max(0.10).step(0.001).onChange(regenerateMesh);;
        this.add(this.params, "curvature_border").min(0.001).max(0.10).step(0.001).onChange(regenerateMesh);;
        this.add(this.params, "leaf_inclination").min(0.1).max(1.0).step(0.1).onChange(regenerateMesh);;
        this.add(this.params, "density").min(6).max(26).step(1).onChange(regenerateMesh);;

    }

    addMaterials(materials){
        this.materials = materials;
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

    _handleColorChange ( color ) {
	      return function ( value ){
		        if (typeof value === "string") {
			          value = value.replace('#', '0x');
		        }
		        color.setHex( value );
        };
    }

    _updateMaterialFolder(meshCallback){
	      return ( material ) => {
            if (!this.materials){
                console.log(
                    "If you want to edit the materials in the GUI, you have to add them using gui.addMaterials"
                );
                return;
            };
            switch (material) {
                case "phong":
                    this._addPhongMaterial(this.materials[material]);
                    break;
                case "standard":
                    this._addStandardMaterial(this.materials[material]);
                    break;
                case "wireframe":
                    this._addMaterialColor(this.materials[material]);
                    break;
                case "lambert":
                    this._addLambertMaterial(this.materials[material]);
                    break;
                default:
                this._addMaterialColor(this.materials[material]);
            }
            meshCallback();
        };
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

    _addPhongMaterial (material) {
        this._removeFolder("Material");
        var folder = this.addFolder('Material');
        var data = {
            color : material.color.getHex(),
            emissive : material.emissive.getHex(),
            specular : material.specular.getHex()
        };

        folder.addColor( data, 'color' ).onChange( this._handleColorChange( material.color ) );
        folder.addColor( data, 'emissive' ).onChange( this._handleColorChange( material.emissive ) );
        folder.addColor( data, 'specular' ).onChange( this._handleColorChange( material.specular ) );
        folder.add( material, 'shininess', 0, 100);
        folder.add( material, 'wireframe' );
        folder.add( material, 'wireframeLinewidth', 0, 10 );
        folder.add( material, 'fog' );
    }

    _addStandardMaterial (material) {
        this._removeFolder("Material");
        var folder = this.addFolder('Material');
        let data = {
            color : material.color.getHex(),
            emissive : material.emissive.getHex()
        };

        folder.addColor( data, 'color' ).onChange( this._handleColorChange( material.color ) );
        folder.addColor( data, 'emissive' ).onChange( this._handleColorChange( material.emissive ) );
        folder.add( material, 'roughness', 0, 1 );
        folder.add( material, 'metalness', 0, 1 );
        folder.add( material, 'wireframe' );
        folder.add( material, 'wireframeLinewidth', 0, 10 );
        folder.add( material, 'fog' );
    }
    _addLambertMaterial(material){
        this._removeFolder("Material");
        let folder = this.addFolder('Material');
        let data = {
            color : material.color.getHex(),
            emissive : material.emissive.getHex()
        };

        folder.addColor( data, 'color' ).onChange( this._handleColorChange( material.color ) );
        folder.addColor( data, 'emissive' ).onChange( this._handleColorChange( material.emissive ) );
        folder.add( material, 'wireframe' );
        folder.add( material, 'wireframeLinewidth', 0, 10 );
        folder.add( material, 'fog' );
        folder.add( material, 'reflectivity', 0, 1 );
        folder.add( material, 'refractionRatio', 0, 1 );
    }

    _addMaterialColor(material){
        this._removeFolder("Material");
        var folder = this.addFolder('Material');
        let data = {
            color : material.color.getHex()
        };
        folder.addColor( data, 'color' ).onChange( this._handleColorChange( material.color ) );
    }
}
