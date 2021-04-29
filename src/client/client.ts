import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import Stats from 'three/examples/jsm/libs/stats.module'
// import {GUI} from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Application } from 'pixi.js'
import { Sprite, Graphics, Texture, Container } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { AnimationMixer, Material, PixelFormat, Object3D } from 'three';

let mesh: THREE.Object3D;
let cube: THREE.Object3D;
let animations, mixer: AnimationMixer;
let attackAction: THREE.AnimationAction;
let bragAction: THREE.AnimationAction;
let defendAction: THREE.AnimationAction;
let idleAction: THREE.AnimationAction;
let hitAction: THREE.AnimationAction;
let actions: THREE.AnimationAction[];
const clock = new THREE.Clock();
let material: THREE.MeshBasicMaterial;

const scene_3D: THREE.Scene = new THREE.Scene();
scene_3D.background = new THREE.Color('white');

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0,0,800);

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

let detectedOptions: object = {
    width:window.innerWidth,
    height:window.innerHeight,
    transparent:false,
    antialias: true,
    resolution: window.devicePixelRatio
};

const canvas_2D = PIXI.autoDetectRenderer(detectedOptions);
let texture3D = Texture.from(renderer.domElement);
let sprite3D =  new Sprite(texture3D);

let scene_2D = new Container();
scene_2D.addChild(sprite3D);

// Adding canvas to html
document.body.appendChild(canvas_2D.view);

const ambient = new THREE.AmbientLight( 0x0000ff, 1 );
scene_3D.add( ambient );

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene_3D.add( hemiLight );

const texture = new THREE.TextureLoader().load( 
    'textures/ninja.png', function ( texture ) {
		material = new THREE.MeshBasicMaterial( {
			map: texture
		 } );
	}, undefined,
	function ( err ) {
		console.error( 'An error happened.' );
    } 
);

texture.encoding = THREE.sRGBEncoding;
texture.flipY = false;

let loader = new GLTFLoader();
loader.load( 'textures/cibus_ninja.glb', function ( gltf ) {
    mesh = gltf.scene.children[0];
    mesh.scale.set(0.1,0.1,0.1);
    gltf.scene.traverse( function ( object ) {            
        if (object instanceof THREE.Mesh) { 
            material = <THREE.MeshBasicMaterial>object.material;
            material.map = texture;
        }
    });
    scene_3D.add( mesh );

    animations = gltf.animations;
    mixer = new AnimationMixer( mesh );  
    attackAction = mixer.clipAction( animations[ 0 ] );
    bragAction = mixer.clipAction( animations[ 1 ] );
    defendAction = mixer.clipAction( animations[ 2 ] );
    hitAction = mixer.clipAction( animations[ 3 ] );
    idleAction = mixer.clipAction( animations[ 4 ] );

    actions = [ attackAction, bragAction, defendAction, hitAction,  idleAction];
    // hitAction.play();
    // actions.forEach( function ( action ) {
    //     action.play();
    // } );
    animate();
});

const cubeTexture = new THREE.TextureLoader().load( 'textures/crate.gif' );
const cubeGeometry = new THREE.BoxGeometry( 100, 100, 100 );
const cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture } );
cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
cube.scale.set(0.1,0.1,0.1);
// cube.position.x = ;
cube.position.z = -200;
scene_3D.add( cube );

const controls = new OrbitControls(camera, renderer.domElement)
camera.position.z = 1;

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

window.addEventListener("keydown", event => {
    press(event.key);
    event.preventDefault();
})

window.addEventListener("keyup", event => {
    release(event.key);
    event.preventDefault();
})

function press(keyCode: string) {
    if(keyCode === "ArrowLeft") {
        mesh.position.x += -0.1;
        mesh.position.y += 0;
        console.log(hitTestRectangle(mesh, cube));
    } else if (keyCode === "ArrowUp") {
        mesh.position.x += 0;
        mesh.position.y += 0.1;
    } else if (keyCode === "ArrowRight") {
        mesh.position.x += 0.1;
        mesh.position.y += 0;
    } else if (keyCode === "ArrowDown") {
        mesh.position.x += 0;
        mesh.position.y += -0.1;
    } else if (keyCode === " ") {
        attackAction.play();
    } else {
        mesh.position.x += 0;
        mesh.position.y += 0;
    } 
}

function release(keyCode: string) {
    if (keyCode === " ") {
        attackAction.stop();
    }
}

function animate() {
    requestAnimationFrame(animate)
    sprite3D.texture.update();
    controls.update();
    const delta = clock.getDelta();
    mixer.update( delta);
    canvas_2D.render( scene_2D );
    render();
};

function render() {
    renderer.render(scene_3D, camera);
}

animate();

function hitTestRectangle(r1: THREE.Object3D, r2: THREE.Object3D) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights;
    let vx: number, vy:number;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Calculate the distance vector between the sprites
    vx = (r1.position.x + r1.position.length() / 2) - 
    (r2.position.x + r2.position.length() / 2);
    // r1.centerX - r2.centerX;
    vy = (r1.position.y + r1.position.length() / 2) - 
    (r2.position.y + r2.position.length() / 2);
    // r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.position.length() / 2 + r2.position.length() / 2;
    // r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.position.length() / 2 + r2.position.length() / 2;
    // r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    console.log(r2.position);
    console.log(r1.position);
    if (r2.position < r1.position) {
        //There's definitely a collision happening
        hit = true;
      } else {
        //There's no collision on the y axis
        hit = false;
      }
  
    //`hit` will be either `true` or `false`
    return hit;
  };