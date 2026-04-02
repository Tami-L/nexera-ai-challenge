// avatar.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, mixer, clock;
let currentAvatar;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 3);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas"), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, -10);
    scene.add(dirLight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    clock = new THREE.Clock();

    animate();
}

// Animate loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

// Load avatar GLB with animation
async function loadAvatar(url) {
    const loader = new GLTFLoader();

    if (currentAvatar) {
        scene.remove(currentAvatar);
        currentAvatar.traverse((child) => {
            if (child.isMesh) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }

    loader.load(url, (gltf) => {
        currentAvatar = gltf.scene;
        scene.add(currentAvatar);

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(currentAvatar);
            const action = mixer.clipAction(gltf.animations[0]);
            action.reset();
            action.play();
        }
    });
}

// Called when user clicks a command button
window.performAvatarAction = async function(command) {
    const res = await fetch(`http://127.0.0.1:8000/avatar-action?command=${command}`);
    const data = await res.json();

    document.getElementById("explanation").innerText = data.explanation;

    console.log("Loading animation:", data.animation);
    loadAvatar(data.animation);
};