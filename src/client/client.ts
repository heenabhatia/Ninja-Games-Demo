import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// import Stats from 'three/examples/jsm/libs/stats.module'
// import {GUI} from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Application } from 'pixi.js'
import { Sprite, Graphics, Texture, Container } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { AnimationMixer, Box3, Object3D } from 'three';

let mesh: Object3D;
let cube: Object3D;
let cubes: Object3D[];
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
hemiLight.position.set( 20, 20, 0 );
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
    console.log(mesh.position);

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

});

// const cubeTexture = new THREE.TextureLoader().load( 'textures/crate.gif' );
// const cubeGeometry = new THREE.BoxGeometry( 100, 100, 100 );
// const cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture } );
// cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
// cube.scale.set(0.1,0.1,0.1);
// cube.position.z = -20;
// scene_3D.add( cube );

// create a cube and add to scene
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff2255});
cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.name = 'cube';
scene_3D.add(cube);

const cubeMaterial2 = new THREE.MeshLambertMaterial({color: 0xff0000});
const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial2);
cube2.position.set(5, 0, 0);
cube2.name = 'cube-red';
scene_3D.add(cube2);


const cubeMaterial3 = new THREE.MeshLambertMaterial({color: 0x00ff00});
const cube3 = new THREE.Mesh(cubeGeometry, cubeMaterial3);
cube3.position.set(0, 0, 5);
cube3.name = 'cube-green';
scene_3D.add(cube3);

const cubeMaterial4 = new THREE.MeshLambertMaterial({color: 0x0000ff});
const cube4 = new THREE.Mesh(cubeGeometry, cubeMaterial4);
cube4.position.set(0, 0, -5);
cube4.name = 'cube-blue';
scene_3D.add(cube4);

const cubeMaterial5 = new THREE.MeshLambertMaterial({color: 0xff00ff});
const cube5 = new THREE.Mesh(cubeGeometry, cubeMaterial5);
cube5.position.set(-5, 0, 0);
cube5.name = 'cube-purple';
scene_3D.add(cube5);

cubes = [ cube2, cube3, cube4, cube5 ];

let groundPlane = new THREE.PlaneGeometry(1000, 1000, 20, 20);
let groundMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: THREE.ImageUtils.loadTexture("../assets/textures/wood_1-1024x1024.png")
});

// groundMat.map.wrapS = groundMat.map?.wrapT = THREE.RepeatWrapping;
// groundMat.map?.repeat.set(10, 10);


var physMesh = new THREE.Mesh(groundPlane, groundMat);
physMesh.rotation.x = -0.5 * Math.PI;
physMesh.receiveShadow = true;
physMesh.position.y = -2;

scene_3D.add(physMesh);

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
    } else if (keyCode === "Control") {
        hitAction.play();
    } else if (keyCode === "Alt") {
        defendAction.play();
    } else {
        mesh.position.x += 0;
        mesh.position.y += 0;
    } 
    console.log(mesh.position);
}

function release(keyCode: string) {
    if (keyCode === " ") {
        attackAction.stop();
    } 
    if (keyCode === "Control") {
        hitAction.stop();
    }
    if (keyCode === "Alt") {
        defendAction.stop();
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


function detectCollisionCubes(object1: THREE.Object3D, object2: THREE.Object3D) {
    // object1.geometry.computeBoundingBox(); //not needed if its already calculated
    // object2.geometry.computeBoundingBox();
    object1.updateMatrixWorld();
    object2.updateMatrixWorld();
    
    let box1 = object1.clone();
    box1.applyMatrix4(object1.matrixWorld);
  
    let box2 = object2.clone();
    box2.applyMatrix4(object2.matrixWorld);
  
    return intersectsBox(box2);
  }

  function intersectsBox( box: THREE.Object3D ) {

    // using 6 splitting planes to rule out intersections.
    // return box. max.x < this.min.x || box.min.x > this.max.x ||
    //     box.max.y < this.min.y || box.min.y > this.max.y ||
    //     box.max.z < this.min.z || box.min.z > this.max.z ? false : true;

}

