import * as THREE from "https://unpkg.com/three@0.127.0/build/three.module.js"
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/DRACOLoader.js";
import { Sky } from "./Sky.js"
import { Water } from "./Water.js"
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(0, 1, 2.5);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loader = new GLTFLoader();
var controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true;
// controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set(0, 0.8, 0);
// controls.maxDistance = 200.0;
// controls.update();




let obj;



const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);
renderer.outputEncoding = THREE.sRGBEncoding;
// Load a glTF resource
let loaded=0;
const loadcont = async () => {
    await loader.load(
        // resource URLgit 
        "./scene.gltf",
        // called when the resource is loaded
        function (gltf) {
            obj = gltf.scene;
            // obj.position.set(0,-50,0);
            obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            obj.translateY(0);
            scene.add(obj);
            obj.position.x = 0;
            obj.position.y = 0.5;
            obj.position.z = 0;
            renderer.render(scene, camera);
            loaded=1;
            gltf.animations;
            gltf.scenes;
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
        waterNormals: new THREE.TextureLoader().load('waternormals.jpeg', function (texture) {
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
water.rotation.x = - Math.PI / 2;
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

document.addEventListener("keydown", onDocumentKeyDown, false);
let vel = 0.25;
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        obj.translateZ(vel);
        camera.translateZ(-vel);
    }
    else if (keyCode == 83) {
        camera.translateZ(vel);
        obj.translateZ(-vel);
    }
    else if (keyCode == 65) {
        obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), vel / 50);
        obj.translateZ(vel);
        camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -vel);

        // camera.lookAt(obj.position);
        // camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), vel / 50);
    }
    else if (keyCode == 68) {
        obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), -vel / 50);
        obj.translateZ(vel);
        camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -vel);
        // camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), -vel / 50)
        // camera.lookAt(obj.position)
    }
    else if (keyCode == 32) {
        obj.rotateY(-vel / 10);
    }
    render();
};



function animate() {

    requestAnimationFrame(animate);


    render();

}
let ind = 0
setInterval(async () => {
    let enemy;
    console.log("called");
    console.log(camera.position);
    if (ind != 1 && loaded==1) {
        ind=1;
        await loader.load(
            "../ship/source/cargo ship.glb",
            function (gltf) {
                enemy = gltf.scene;
                // obj.position.set(0,-50,0);
                enemy.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
                scene.add(enemy);
                enemy.position.x = obj.position.x;
                enemy.position.y = 0.5;
                enemy.position.z = obj.position.z-6;
                gltf.animations;
                gltf.scenes;
                render();
                ind=0
                gltf.asset;
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            },
            function (error) {
                console.log(error);
            }
        );
    };
    console.log(obj);

}, 5000);

var render = function () {
    controls.target.set(obj.position.x, obj.position.y + 0.3, obj.position.z);
    controls.update();
    // camera.position.set(obj.position.x, obj.position.y + 0.5, obj.position.z + 2.5)
    renderer.render(scene, camera);
};



