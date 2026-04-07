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
async function fetchModel(query) {
    try {
        const response = await fetch(
            `https://YOUR-RENDER-BACKEND.onrender.com/generate-3d?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (data.fallback) {
            console.warn('Fallback model returned:', data.object);
        }
        const modelPath = data.model_path;
        await loadModel(modelPath);
    } catch (err) {
        console.error('Failed to fetch model:', err);
        await loadModel('/models/default.glb'); // fallback
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