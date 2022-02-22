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
let enemies = [];
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
let cannonload=0;
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/js/libs/draco/');
loader.setDRACOLoader(dracoLoader);
let loaded = 0;
renderer.outputEncoding = THREE.sRGBEncoding;
// Load a glTF resource
const loadcont = async () => {
    await loader.load(
        // resource URLgit 
        "./scene.gltf",
        // called when the resource is loaded
        function (gltf) {
            obj = gltf.scene;
            // obj.position.set(0,-50,0);
            obj.rotateOnAxis(new THREE.Vector3(0, 1, 0),Math.PI);
            obj.translateY(0);
            scene.add(obj);
            obj.position.x = 0;
            obj.position.y = 0.5;
            obj.position.z = 0;

            renderer.render(scene, camera);
            loaded = 1;
            gltf.animations;
            gltf.scenes;
            gltf.asset;
        },
        function (xhr) {
            //.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        function (error) {
            //.log(error);
        }
    );
}

let cannon;
const loadcannon = async () => {
    await loader.load(
        // resource URLgit 
        "./cannon/scene.gltf",
        // called when the resource is loaded
        function (gltf) {
            cannon = gltf.scene
            cannon.scale.set(0.1,0.1,0.1);
            // obj.position.set(0,-50,0);
            // .rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
            // obj.translateY(0);
            cannonload=1;
        },
        function (xhr) {
            //.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        function (error) {
            //.log(error);
        }
    );
}

loadcannon();
//

let original;
const load_enemies = async () => {
    await loader.load(
        "./enemy_ship/scene.gltf",
        function (gltf) {
            original = gltf.scene;
            original.scale.set(0.06,0.06,0.06);
            gltf.asset;
        },
        function (xhr) {
            //.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            //.log(error);
        }
    );
}
load_enemies();


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
//.log(scene);
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
let shots=[];
document.addEventListener("keydown", onDocumentKeyDown, false);
let vel = 0.125;
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        obj.translateZ(vel);
        camera.translateZ(-vel);
    }
    else if (keyCode == 83) {
        obj.translateZ(-vel);
        var obj_z_dir=new THREE.Vector3();
        obj.getWorldDirection(obj_z_dir);
        camera.position.x-=obj_z_dir.x*vel;
        camera.position.y-=obj_z_dir.y*vel;
        camera.position.z-=obj_z_dir.z*vel;
    
    }
    else if (keyCode == 65) {
        obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), vel / 25);
        obj.translateZ(vel);
        camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -vel);
    }
    
    else if (keyCode == 68) {
        obj.rotateOnAxis(new THREE.Vector3(0, 1, 0), -vel / 25);
        obj.translateZ(vel);
        camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -vel);
        
    }
    else if (keyCode == 32) {
        obj.rotateY(-vel / 10);
    }

    else if(keyCode==66){
        if(cannonload==1){
            console.log("cannon shot");
            cannonshot(obj);
            // cannon.position.x=obj.position.x+0.4;cannon.position.y=obj.position.y;cannon.position.z=obj.position.z;
        }
    }
    else if(keyCode==88){
        camera.translateZ(vel);

    }
    render();
};



function animate() {
    requestAnimationFrame(animate);
    if (loaded == 1) {
        for (var i = 0; i < enemies.length; i++) {
            var dir = new THREE.Vector3(obj.position.x - enemies[i].position.x, obj.position.y - enemies[i].position.y, obj.position.z - enemies[i].position.z-0.3).normalize();
            var obj_z=new THREE.Vector3();
            obj.getWorldDirection(obj_z);
            enemies[i].position.x += dir.x / 50,
            enemies[i].position.y += dir.y / 50,
            enemies[i].position.z += dir.z / 50;
            var dir = new THREE.Vector3(obj.position.x - enemies[i].position.x, obj.position.y - enemies[i].position.y, obj.position.z - enemies[i].position.z).normalize();
            let enemy_z = new THREE.Vector3();
            // obj_z.x*=-1;obj_z.y*=-1;obj_z.z*=-1;
            enemies[i].getWorldDirection(enemy_z);
            var enemy_x = new THREE.Vector3().crossVectors(enemy_z, new THREE.Vector3(0, 1, 0))
            let x_axis = new THREE.Vector3().crossVectors(obj_z, new THREE.Vector3(0, 1, 0));
            dir.x*=-1;dir.y*=-1;dir.z*=-1;
            if(x_axis.angleTo(dir)<Math.PI/2){
                enemies[i].rotateOnAxis(new THREE.Vector3(0, 1, 0),   dir.angleTo(enemy_z)/50); 
            }
            else{
                enemies[i].rotateOnAxis(new THREE.Vector3(0, 1, 0), (-1*dir.angleTo(enemy_z))/50); 
            }
        }
        render();
    }
}
const gen_random = (max, min) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2.0);
let ind = 0
setInterval(async () => {
    //.log("called");
    //.log(camera.position);
    for (var i = 0; i < 3; i++) {
        if (ind != 1 && loaded == 1) {
            let enemy;
            var x = obj.position.x; var y = obj.position.y; var z = obj.position.z;
            //.log(x, y, z);
            //.log(obj.position);
            let new_ob = new THREE.Vector3(x, y, z);
            obj.getWorldDirection(new_ob);
            let x_axis = new THREE.Vector3().crossVectors(new_ob, new THREE.Vector3(0, 1, 0))
            enemy = original.clone();

            //2*Math.PI-dir.angleTo(enemy_x));

            //.log(obj.position, new_ob);
            var pos_z = gen_random(18, 10);
            var pos_i = gen_random(6, -6);
            // pos_z=1;
            enemy.position.x = obj.position.x + pos_z * new_ob.x + pos_i * x_axis.x;
            enemy.position.y = obj.position.y + pos_z * new_ob.y + pos_i * x_axis.y;
            enemy.position.z = obj.position.z + pos_z * new_ob.z + pos_i * x_axis.z;

            var dir = new THREE.Vector3(obj.position.x - enemy.position.x, obj.position.y - enemy.position.y, obj.position.z - enemy.position.z).normalize();
            let enemy_z = new THREE.Vector3();
            enemy.getWorldDirection(enemy_z);
            var enemy_x = new THREE.Vector3().crossVectors(enemy_z, new THREE.Vector3(0, 1, 0))
            enemy_x.x *= -1; enemy_x.y *= -1; enemy_x.z *= -1
            enemy.rotateOnAxis(new THREE.Vector3(0, 1, 0),   dir.angleTo(enemy_z))
            // //.log(dir.angleTo(enemy_x)*57.29);
            dir.x*=-1;dir.y*=-1;dir.z*=-1;
            scene.add(enemy);
            loaded=1;
        
            cannonshot_enemy(enemy);
            console.log(x_axis.angleTo(dir)*57.29);
            enemies.push(enemy);
            render();

            ind = 0;
        }
    }

}, 7000);

var render = function () {
    controls.target.set(obj.position.x, obj.position.y + 0.3, obj.position.z);
    controls.update();
    // camera.position.set(obj.position.x, obj.position.y + 0.5, obj.position.z + 2.5)
    renderer.render(scene, camera);
};


const cannonshot=(ship)=>{
    if(cannonload==1){
        var dup=cannon.clone();
        var obj_z=new THREE.Vector3();
        ship.getWorldDirection(obj_z);
        var zaxis=new THREE.Vector3(1,0,0);
        console.log(zaxis.angleTo(obj_z)*57.29);
        // dup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0),-1*(Math.PI/2-zaxis.angleTo(obj_z)));

        let new_ob = new THREE.Vector3();
        dup.getWorldDirection(new_ob);
        let x_axis = new THREE.Vector3().crossVectors(new_ob, new THREE.Vector3(0, 1, 0))
        dup.position.x=ship.position.x-x_axis.x*0.4+new_ob.x*0.75;
        dup.position.y=ship.position.y-x_axis.y*0.4+new_ob.y*0.75;
        dup.position.z=ship.position.z-x_axis.z*0.4+new_ob.z*0.75;
        scene.add(dup);
    }

}


const cannonshot_enemy=(ship)=>{
    if(cannonload==1){
        var dup=cannon.clone();
        var obj_z=new THREE.Vector3();
        ship.getWorldDirection(obj_z);
        var zaxis=new THREE.Vector3(1,0,0);
        console.log(zaxis.angleTo(obj_z)*57.29);
        // dup.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0),-1*(Math.PI/2-zaxis.angleTo(obj_z)));

        let new_ob = new THREE.Vector3();
        dup.getWorldDirection(new_ob);
        let x_axis = new THREE.Vector3().crossVectors(new_ob, new THREE.Vector3(0, 1, 0))
        let objx= new THREE.Vector3().crossVectors(obj_z, new THREE.Vector3(0, 1, 0))
        dup.position.x=ship.position.x-x_axis.x*0.4//+ obj_z.x*1//-0.4*objx.x;
        dup.position.y=ship.position.y-x_axis.y*0.4//+ obj_z.y*1//-0.4*objx.y;
        dup.position.z=ship.position.z-x_axis.z*0.4//+ obj_z.z*1//-0.4*objx.z;
        scene.add(dup);
    }
}

animate();
