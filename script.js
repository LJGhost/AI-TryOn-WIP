


console.log("🚀 Script started!");

// Get DOM elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log("✅ Canvas and video elements set up.");

// Load FaceMesh
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
});

console.log("✅ FaceMesh initialized.");

// Initialize Three.js
console.log("🛠️ Initializing Three.js...");
let scene = new THREE.Scene();
let camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

console.log("✅ Three.js setup complete.");


// Load Hair Model
let hairGroup = new THREE.Group();
scene.add(hairGroup);


let loader = new THREE.GLTFLoader();
let hairModel = null;



console.log("📥 Loading Hair Model...");
loader.load(
    "glasses.gltf",
    function (gltf) {
      hairModel = gltf.scene;
      hairModel.scale.set(5.5, 5.5, 5.5);
      hairModel.position.set(0, 0, 0); // model stays centered in group
      hairGroup.add(hairModel); // ✅ add model to group
      console.log("✅ Hair model loaded into group.");
    },
    undefined,
    function (error) {
      console.error("❌ Error loading hair model", error);
    }
);




// smoothing flow of yawn for glasses

let smoothYaw = 0;

function smoothYawFilter(current, target, smoothingFactor = 0.1) {
    return current + (target - current) * smoothingFactor;
}



// FaceMesh detection results
faceMesh.onResults((results) => 
    {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const forehead = landmarks[6];
          
            // 🎯 Position the group to follow the face
            hairGroup.position.set(
              (forehead.x - 0.51) * 25,
              (forehead.y - 0.52) * -15,
              -8 // or whatever works best for your depth
            );
          
            // 🌀 Apply rotation to the model inside
            const left = landmarks[234];
            const right = landmarks[454];

            const dx = right.x - left.x;
            const dy = right.y - left.y;
            const yaw = Math.atan2(dy, dx);
            const amplifiedYaw = yaw * 3.5;
            smoothYaw = smoothYawFilter(smoothYaw, amplifiedYaw);
            hairModel.rotation.y = smoothYaw; // ONLY rotate model, not group
          }
});

// Start webcam
const cameraFeed = new Camera(video, {
    onFrame: async () => {
        await faceMesh.send({ image: video });
    },
    width: 640,
    height: 480,
});
cameraFeed.start();
console.log("📷 Camera started.");

// Camera Setup
camera1.position.z = 2;
console.log("🎥 Camera positioned at:", camera1.position);

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Debugging: Check if hair model exists and position updates
    if (hairModel) console.log("🔄 Hair Position:", hairModel.position);

    renderer.render(scene, camera1);
}
animate();
console.log("🎬 Animation started!");
