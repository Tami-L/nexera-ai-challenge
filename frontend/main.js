// main.js — Test 1: AI 3D Asset Pipeline
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

const API_BASE = "http://127.0.0.1:8000";

let scene, camera, renderer, controls, loader, currentObject;

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    camera.position.set(0, 1.5, 3.5);

    const canvas = document.getElementById("object-canvas");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    resizeRenderer();

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(-3, 10, -10);
    scene.add(dir);

    // Grid floor
    const grid = new THREE.GridHelper(10, 20, 0x444466, 0x333355);
    scene.add(grid);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.update();

    loader = new GLTFLoader();

    window.addEventListener("resize", resizeRenderer);
    animate();
}

function resizeRenderer() {
    const canvas = document.getElementById("object-canvas");
    const w = canvas.parentElement.clientWidth;
    const h = 420;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function setLoading(isLoading) {
    const btn = document.getElementById("generate-btn");
    const spinner = document.getElementById("object-spinner");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Generating..." : "Generate 3D Model";
    if (spinner) spinner.style.display = isLoading ? "block" : "none";
}

function loadObject(url) {
    // Remove old object
    if (currentObject) {
        scene.remove(currentObject);
        currentObject.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        currentObject = null;
    }

    const fullUrl = `${API_BASE}/${url}`;

    loader.load(
        fullUrl,
        (gltf) => {
            currentObject = gltf.scene;

            // Auto-scale and centre
            const box = new THREE.Box3().setFromObject(currentObject);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.5 / maxDim;
            currentObject.scale.setScalar(scale);

            const center = new THREE.Vector3();
            box.getCenter(center);
            currentObject.position.sub(center.multiplyScalar(scale));
            currentObject.position.y += 0.75;

            scene.add(currentObject);
        },
        undefined,
        (err) => {
            console.error("Failed to load model:", err);
            showError("object-explanation", "Could not load 3D model. Check backend.");
        }
    );
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.color = "#ff6b6b";
}

function showExplanation(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.color = "#a8dadc";
}

// --- Text input generate ---
window.generate3D = async function () {
    const input = document.getElementById("object-input").value.trim();
    if (!input) return;

    setLoading(true);
    showExplanation("object-explanation", "Thinking...");

    try {
        const res = await fetch(`${API_BASE}/generate-3d?query=${encodeURIComponent(input)}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        showExplanation("object-explanation", data.explanation);
        loadObject(data.model);
    } catch (e) {
        console.error(e);
        showError("object-explanation", "Backend unreachable. Make sure FastAPI is running on port 8000.");
    } finally {
        setLoading(false);
    }
};

// --- Image upload generate ---
window.generate3DFromImage = async function () {
    const fileInput = document.getElementById("image-upload");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    setLoading(true);
    showExplanation("object-explanation", "Analysing image with AI...");

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API_BASE}/generate-3d-from-image`, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        const label = document.getElementById("identified-label");
        if (label) label.textContent = `Identified as: ${data.identified_as}`;

        showExplanation("object-explanation", data.explanation);
        loadObject(data.model);
    } catch (e) {
        console.error(e);
        showError("object-explanation", "Image processing failed. Check backend.");
    } finally {
        setLoading(false);
    }
};

// Allow Enter key on text input
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("object-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") window.generate3D();
        });
    }
});