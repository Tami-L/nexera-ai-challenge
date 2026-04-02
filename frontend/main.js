// main.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, loader, currentObject;
let clock = new THREE.Clock();

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("object-canvas"), antialias: true });
    renderer.setSize(window.innerWidth, 500);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-3, 10, -10);
    scene.add(dirLight);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    loader = new GLTFLoader();

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

async function loadObject(url) {
    if (currentObject) {
        scene.remove(currentObject);
        currentObject.traverse((child) => {
            if (child.isMesh) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }

    loader.load(url, (gltf) => {
        currentObject = gltf.scene;

        const box = new THREE.Box3().setFromObject(currentObject);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim;
        currentObject.scale.set(scale, scale, scale);

        const center = new THREE.Vector3();
        box.getCenter(center);
        currentObject.position.sub(center);

        scene.add(currentObject);
    });
}

window.generate3D = async function() {
    const input = document.getElementById("input").value;
    try {
        const res = await fetch(`http://127.0.0.1:8000/generate-3d?query=${input}`);
        const data = await res.json();
        document.getElementById("object-explanation").innerText = data.explanation;
        loadObject(data.model);
    } catch (e) {
        console.error("Backend unreachable:", e);
        alert("Failed to contact backend at port 8000. Make sure it's running.");
    }
};