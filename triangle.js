import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js"
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";
import { Water } from './Water.js';
import { Sky } from "./Sky.js"
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(0, 5,2);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loader = new GLTFLoader();
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0,4 , 0);
controls.maxDistance = 200.0;
controls.update();



const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);
renderer.outputEncoding = THREE.sRGBEncoding;
// Load a glTF resource
const loadcont = async () => {
    await loader.load(
        // resource URL
        "ship/source/cargo ship.glb",
        // called when the resource is loaded
        function (gltf) {
            const obj=gltf.scene;
            obj.position.y=4;
            obj.rotation.set(0,Math.PI/2,0)
            obj.position.x=-0.5;
            scene.add(obj);
            gltf.animations;
            gltf.scenes;
            renderer.render(scene, camera);
            gltf.asset;
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        function (error) {
            console.log(error);
        }
    );
}


const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('waternormals.jpeg', function ( texture ) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
);
water.rotation.x =- Math.PI / 2;
scene.add(water);

const waterUniforms = water.material.uniforms;


const sky = new Sky();
sky.scale.setScalar(10000);
console.log(scene);
scene.add(sky);
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 100;
skyUniforms['rayleigh'].value = 20;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const parameters = {
    elevation: 3,
    azimuth: 115
}

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const sun = new THREE.Vector3();
const theta = Math.PI * (0.49 - 0.5);
const phi = 2 * Math.PI * (0.205 - 0.5);
sun.x = Math.cos(phi);
sun.y = Math.sin(phi) * Math.sin(theta);
sun.z = Math.sin(phi) * Math.cos(theta);

sky.material.uniforms['sunPosition'].value.copy(sun);
scene.environment = pmremGenerator.fromScene(sky).texture;

loadcont();





