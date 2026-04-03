// avatar.js — Test 2: Natural Language → Avatar Animation
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

const API_BASE = "http://127.0.0.1:8000";

let scene, camera, renderer, controls, mixer, clock, currentAvatar;

initAvatar();

function initAvatar() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f3460);

    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 1.6, 3.5);

    const canvas = document.getElementById("avatar-canvas");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    resizeAvatarRenderer();

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 1.5);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x16213e });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const grid = new THREE.GridHelper(10, 20, 0x1a4a7a, 0x163660);
    scene.add(grid);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.update();

    clock = new THREE.Clock();

    window.addEventListener("resize", resizeAvatarRenderer);
    animateAvatar();

    // Load default T-pose on start
    loadAvatarModel("models/avatar/T-pose.glb");
}

function resizeAvatarRenderer() {
    const canvas = document.getElementById("avatar-canvas");
    const w = canvas.parentElement.clientWidth;
    const h = 420;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function animateAvatar() {
    requestAnimationFrame(animateAvatar);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

function loadAvatarModel(url) {
    const loader = new GLTFLoader();
    const fullUrl = `${API_BASE}/${url}`;

    // Cleanup old avatar
    if (currentAvatar) {
        scene.remove(currentAvatar);
        currentAvatar.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        currentAvatar = null;
    }
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }

    loader.load(
        fullUrl,
        (gltf) => {
            currentAvatar = gltf.scene;

            // Auto-scale avatar
            const box = new THREE.Box3().setFromObject(currentAvatar);
            const size = new THREE.Vector3();
            box.getSize(size);
            const scale = 1.8 / size.y;
            currentAvatar.scale.setScalar(scale);

            // Centre on floor
            const center = new THREE.Vector3();
            box.getCenter(center);
            currentAvatar.position.x = -center.x * scale;
            currentAvatar.position.z = -center.z * scale;
            currentAvatar.position.y = 0;

            scene.add(currentAvatar);

            // Play animation if present
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(currentAvatar);
                const action = mixer.clipAction(gltf.animations[0]);
                action.reset();
                action.play();
            }

            // Highlight active button
            highlightActiveAnimation(url);
        },
        undefined,
        (err) => {
            console.error("Avatar model load error:", err);
            showAvatarError("Could not load avatar model.");
        }
    );
}

function highlightActiveAnimation(url) {
    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.classList.remove("active");
        if (url.includes(btn.dataset.anim)) {
            btn.classList.add("active");
        }
    });
}

function setAvatarLoading(isLoading) {
    const btn = document.getElementById("avatar-send-btn");
    if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? "Processing..." : "Send Command";
    }
}

function showAvatarExplanation(text) {
    const el = document.getElementById("avatar-explanation");
    el.textContent = text;
    el.style.color = "#a8dadc";
}

function showAvatarError(text) {
    const el = document.getElementById("avatar-explanation");
    el.textContent = text;
    el.style.color = "#ff6b6b";
}

// --- Natural language command ---
window.performAvatarAction = async function (command) {
    if (!command || !command.trim()) return;

    setAvatarLoading(true);
    showAvatarExplanation("Claude is interpreting your command...");

    try {
        const res = await fetch(`${API_BASE}/avatar-action?command=${encodeURIComponent(command)}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        showAvatarExplanation(`"${data.animation_name}" — ${data.explanation}`);
        loadAvatarModel(data.animation);
    } catch (e) {
        console.error(e);
        showAvatarError("Backend unreachable. Make sure FastAPI is running on port 8000.");
    } finally {
        setAvatarLoading(false);
    }
};

// --- Quick action buttons ---
window.quickAction = function (animName) {
    loadAvatarModel(`models/avatar/${animName}.glb`);
    showAvatarExplanation(`Playing animation: ${animName}`);
};

// Allow Enter key on avatar input
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("avatar-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                window.performAvatarAction(input.value.trim());
            }
        });
    }

    const sendBtn = document.getElementById("avatar-send-btn");
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            const input = document.getElementById("avatar-input");
            window.performAvatarAction(input.value.trim());
        });
    }
});