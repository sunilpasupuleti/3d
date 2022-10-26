import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import * as dat from "dat.gui";
import { MaterialLoader } from "three";

/**
 * Debug
 */
const gui = new dat.GUI({
  width: 400,
});

/**
 * Canvas
 */
const canvas = document.querySelector("canvas.webgl");

/**
 * Textures
 */
const loadingManager = new THREE.LoadingManager();
loadingManager.onError = () => {
  console.log("Error occured");
};
const textureLoader = new THREE.TextureLoader(loadingManager);

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let aspectRatio = sizes.width / sizes.height;

/**
 * Event Listeners
 */

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  aspectRatio = sizes.width / sizes.height;

  // Update Camera
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;
  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  /**
   * Destroy old galaxy
   */
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    // positions
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = 0 + randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // colors
    const mixedColor = colorInside.clone();

    mixedColor.lerp(colorOutside, radius / parameters.radius);
    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

/**
 * Debugging
 */
gui
  .add(parameters, "count")
  .name("Count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .name("Size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "radius")
  .name("Radius")
  .min(0.01)
  .max(20)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "branches")
  .name("Branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "spin")
  .name("Spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "randomness")
  .name("Randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "randomnessPower")
  .name("Randomness Power")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .addColor(parameters, "insideColor")
  .name("Inside Color")
  .onFinishChange(generateGalaxy);

gui
  .addColor(parameters, "outsideColor")
  .name("Outside Color")
  .onFinishChange(generateGalaxy);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, aspectRatio);
camera.position.set(0, 0, 3);
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animation
 */
const clock = new THREE.Clock();
function tick() {
  // get elapsed time
  const elapsedTime = clock.getElapsedTime();

  // Update Controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();
