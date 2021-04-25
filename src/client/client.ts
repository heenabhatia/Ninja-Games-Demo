import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/dat.gui.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Application } from 'pixi.js'
import { Sprite } from 'pixi.js'
import { Texture } from 'pixi.js'
import { Container } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { AnimationMixer } from 'three';
// import { release } from 'os';

const scene_3D: THREE.Scene = new THREE.Scene();
scene_3D.background = new THREE.Color('white');

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

let detectedOptions: object = {
    width:window.innerWidth,
    height:window.innerHeight,
    transparent:false,
    antialias: true,
    resolution: window.devicePixelRatio
}

const canvas_2D = PIXI.autoDetectRenderer(detectedOptions);
let texture3D = Texture.from(renderer.domElement);
let sprite3D =  new Sprite(texture3D);

let scene_2D = new Container();
scene_2D.addChild(sprite3D);

// Adding canvas to html
document.body.appendChild(canvas_2D.view);

let mesh: THREE.Object3D;
let animations, mixer: THREE.AnimationMixer, attackAction: THREE.AnimationAction;
let bragAction: THREE.AnimationAction;
let defendAction: THREE.AnimationAction;
let idleAction: THREE.AnimationAction;
let hitAction: THREE.AnimationAction;
let actions: THREE.AnimationAction[];
const clock = new THREE.Clock();

const ambient = new THREE.AmbientLight( 0x0000ff, 1 );
scene_3D.add( ambient );

let loader = new GLTFLoader();
loader.load( 'textures/ninja.gltf', function ( gltf ) {
    mesh = gltf.scene.children[0];
    mesh.scale.set(0.1,0.1,0.1);
    scene_3D.add( mesh );

    animations = gltf.animations;
    mixer = new THREE.AnimationMixer( mesh );
    attackAction = mixer.clipAction( animations[ 0 ] );
    bragAction = mixer.clipAction( animations[ 1 ] );
    defendAction = mixer.clipAction( animations[ 2 ] );
    hitAction = mixer.clipAction( animations[ 3 ] );
    idleAction = mixer.clipAction( animations[ 4 ] );
    console.log(animations);
    // console.log(attackAction);
    // console.log(bragAction);
    // console.log(defendAction);
    // attackAction.play();

    actions = [ attackAction, bragAction, defendAction, hitAction,  idleAction];

    actions.forEach( function ( action ) {
        action.play();
    } );

    animate();
});


const controls = new OrbitControls(camera, renderer.domElement)

camera.position.z = 5

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

window.addEventListener("keydown", event => {
    // console.log(event.key);
    press(event.key);
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
        actions.forEach( function ( action ) {
            action.play();
        } );
        const delta = clock.getDelta();
        mixer.update( delta);
    } else {
        mesh.position.x += 0;
        mesh.position.y += 0;
    } 
}

var animate = function () {
    requestAnimationFrame(animate)
    sprite3D.texture.update();
    controls.update();
    const delta = clock.getDelta();
    mixer.update( delta);
    canvas_2D.render( scene_2D );
    render()
};

function render() {
    renderer.render(scene_3D, camera)
}

animate();
