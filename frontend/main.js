// main.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ----------- Scene Setup -----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ----------- Lighting -----------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// ----------- Model Loader -----------
const loader = new GLTFLoader();
let currentModel = null;

async function loadModel(path) {
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((child) => {
            if (child.isMesh) child.geometry.dispose();
        });
    }

    loader.load(
        path,
        (gltf) => {
            currentModel = gltf.scene;
            scene.add(currentModel);
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
        }
    );
}

// ----------- Backend Fetch Function -----------
const API_BASE = "https://nexera-ai-challenge.onrender.com";

async function fetchModel(query) {
    try {
        const res = await fetch(
            `${API_BASE}/generate-3d?query=${encodeURIComponent(query)}`
        );

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.message || "Unknown error");
        }

        await loadModel(data.model_url);

    } catch (err) {
        console.error(err);
        await loadModel('/models/default.glb');
    }
}

// ----------- Input Handling -----------
const input = document.getElementById('modelInput');
const button = document.getElementById('modelButton');

button.addEventListener('click', () => {
    const query = input.value.trim();
    if (query) fetchModel(query);
});

// ----------- Window Resize -----------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ----------- Animation Loop -----------
function animate() {
    requestAnimationFrame(animate);
    if (currentModel) currentModel.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// ----------- Load Default Model on Start -----------
loadModel('/models/default.glb');