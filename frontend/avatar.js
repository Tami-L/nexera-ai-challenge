// avatar.js — Test 2: Natural Language → Avatar Animation (Mixamo FBX)
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { FBXLoader } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

const API_BASE = "http://127.0.0.1:8000";

let scene, camera, renderer, controls, clock;
let mixer = null;
let currentAction = null;
let avatar = null; // the loaded X Bot character

const fbxLoader = new FBXLoader();

// Map animation names to their FBX filenames
const ANIMATION_FILES = {
    "T-pose":  "T-pose.fbx",
    "idle":    "idle.fbx",
    "walk":    "walk.fbx",
    "wave":    "wave.fbx",
    "point":   "point.fbx",
    "view":    "view.fbx",
};

initAvatar();

function initAvatar() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f3460);
    scene.fog = new THREE.Fog(0x0f3460, 10, 50);

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 120, 280);

    const canvas = document.getElementById("avatar-canvas");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    resizeAvatarRenderer();

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 1.8);
    hemi.position.set(0, 200, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(80, 200, 100);
    dir.castShadow = true;
    dir.shadow.camera.top = 200;
    dir.shadow.camera.bottom = -100;
    dir.shadow.camera.left = -120;
    dir.shadow.camera.right = 120;
    scene.add(dir);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(600, 600);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x16213e,
        roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(600, 40, 0x1a4a7a, 0x163660);
    scene.add(grid);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 80, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.update();

    clock = new THREE.Clock();

    window.addEventListener("resize", resizeAvatarRenderer);

    // Load the base X Bot character first, then play idle
    loadCharacter(() => {
        playAnimation("idle");
    });

    animateAvatar();
    setupUI();
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

function loadCharacter(onLoaded) {
    showAvatarExplanation("Loading avatar character...");

    fbxLoader.load(
        `${API_BASE}/models/avatar/base.fbx`,
        (fbx) => {
            avatar = fbx;
            avatar.scale.setScalar(1);

            avatar.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(avatar);
            mixer = new THREE.AnimationMixer(avatar);

            showAvatarExplanation("Avatar ready. Type a command or use the quick buttons below.");
            if (onLoaded) onLoaded();
        },
        (xhr) => {
            const pct = Math.round((xhr.loaded / xhr.total) * 100);
            showAvatarExplanation(`Loading avatar... ${pct}%`);
        },
        (err) => {
            console.error("Failed to load base character:", err);
            showAvatarError("Could not load avatar. Make sure backend is running and base.fbx exists.");
        }
    );
}

function playAnimation(animName) {
    if (!avatar || !mixer) return;

    const filename = ANIMATION_FILES[animName] || ANIMATION_FILES["idle"];

    fbxLoader.load(
        `${API_BASE}/models/avatar/${filename}`,
        (fbx) => {
            if (!fbx.animations || fbx.animations.length === 0) {
                console.warn("No animations found in", filename);
                return;
            }

            const newAction = mixer.clipAction(fbx.animations[0]);

            // Smooth crossfade from current action
            if (currentAction && currentAction !== newAction) {
                currentAction.fadeOut(0.3);
            }

            newAction.reset();
            newAction.fadeIn(0.3);
            newAction.play();
            currentAction = newAction;

            highlightActiveButton(animName);
        },
        undefined,
        (err) => {
            console.error("Failed to load animation:", filename, err);
            showAvatarError(`Could not load animation: ${animName}`);
        }
    );
}

function highlightActiveButton(animName) {
    document.querySelectorAll(".quick-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.anim === animName) {
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
    if (el) {
        el.textContent = text;
        el.style.color = "#a8dadc";
    }
}

function showAvatarError(text) {
    const el = document.getElementById("avatar-explanation");
    if (el) {
        el.textContent = text;
        el.style.color = "#ff6b6b";
    }
}

// --- Natural language command via backend ---
window.performAvatarAction = async function(command) {
    if (!command || !command.trim()) return;

    setAvatarLoading(true);
    showAvatarExplanation("Claude is interpreting your command...");

    try {
        const res = await fetch(`${API_BASE}/avatar-action?command=${encodeURIComponent(command)}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        showAvatarExplanation(`"${data.animation_name}" — ${data.explanation}`);
        playAnimation(data.animation_name);
    } catch (e) {
        console.error(e);
        showAvatarError("Backend unreachable. Make sure FastAPI is running on port 8000.");
    } finally {
        setAvatarLoading(false);
    }
};

// --- Quick action buttons ---
window.quickAction = function(animName) {
    playAnimation(animName);
    showAvatarExplanation(`Playing animation: ${animName}`);
};

function setupUI() {
    // Enter key on input
    const input = document.getElementById("avatar-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                window.performAvatarAction(input.value.trim());
            }
        });
    }

    // Send button
    const sendBtn = document.getElementById("avatar-send-btn");
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            const input = document.getElementById("avatar-input");
            window.performAvatarAction(input.value.trim());
        });
    }
}