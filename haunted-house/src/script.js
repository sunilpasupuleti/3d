import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import * as dat from "dat.gui";
import { DirectionalLightHelper, MaterialLoader, PointLight } from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import names from "../static/names.json";
import ghostAudio from "../static/the_ghost.mp3";

/**
 * Debug
 */
// const gui = new dat.GUI({
//   closed: true,
//   width: 400,
// });

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
const doorColorTexture = textureLoader.load("textures/door/color.jpg");
const doorAlphaTexture = textureLoader.load("textures/door/alpha.jpg");
const doorAmbientOcclusionTexture = textureLoader.load(
  "textures/door/ambientOcclusion.jpg"
);
const doorHeightTexture = textureLoader.load("textures/door/height.jpg");
const doorNormalTexture = textureLoader.load("textures/door/normal.jpg");
const doorMetalnessTexture = textureLoader.load("textures/door/metalness.jpg");
const doorRoughnessTexture = textureLoader.load("textures/door/roughness.jpg");

// Bricks Texture
const bricksColorTexture = textureLoader.load("textures/bricks/color.jpg");
const bricksAmbientOcclusionTexture = textureLoader.load(
  "textures/bricks/ambientOcclusion.jpg"
);
const bricksNormalTexture = textureLoader.load("textures/bricks/normal.jpg");
const bricksRoughnessTexture = textureLoader.load(
  "textures/bricks/roughness.jpg"
);

// Grass Texture
const grassColorTexture = textureLoader.load("textures/grass/color.jpg");
const grassAmbientOcclusionTexture = textureLoader.load(
  "textures/grass/ambientOcclusion.jpg"
);
const grassNormalTexture = textureLoader.load("textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load(
  "textures/grass/roughness.jpg"
);



grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

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
 * Fog
 */
const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;
/**
 * Floor
 */
const floorMeasurements = {
  width: 20,
  height: 20,
};
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(floorMeasurements.width, floorMeasurements.height),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * House
 */
// Group
const house = new THREE.Group();
scene.add(house);

// Walls
const wallMeasurements = {
  width: 4,
  height: 2.5,
  depth: 4,
};
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(
    wallMeasurements.width,
    wallMeasurements.height,
    wallMeasurements.depth
  ),
  new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
);
walls.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = wallMeasurements.height / 2;
house.add(walls);

// Roof
const roofMeasurements = {
  radius: 3.5,
  height: 1,
  radialSegments: 4,
};
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(
    roofMeasurements.radius,
    roofMeasurements.height,
    roofMeasurements.radialSegments
  ),
  new THREE.MeshStandardMaterial({
    color: "#b35f45",
  })
);
roof.position.y = wallMeasurements.height + roofMeasurements.height / 2;
roof.rotation.y = Math.PI * 0.25;
house.add(roof);

// Door
const doorMeasurements = {
  width: 2.2,
  height: 2.2,
};
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(
    doorMeasurements.width,
    doorMeasurements.height,
    100,
    100
  ),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.2,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);

door.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.z = wallMeasurements.depth / 2 + 0.01;
door.position.y = doorMeasurements.height / 2;
house.add(door);

// Bushes
const bushMeasurements = {
  radius: 1,
  widthSegments: 16,
  heightSegments: 16,
};
const bushGeometry = new THREE.SphereGeometry(
  bushMeasurements.radius,
  bushMeasurements.widthSegments,
  bushMeasurements.heightSegments
);
const bushMaterial = new THREE.MeshStandardMaterial({
  color: "#89c854",
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush1Scale = bushMeasurements.radius / 2;
bush1.scale.set(bush1Scale, bush1Scale, bush1Scale);
bush1.position.set(0.8, 0.2, 2.2);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush2Scale = bush1Scale / 2;
bush2.scale.set(bush2Scale, bush2Scale, bush2Scale);
bush2.position.set(1.4, 0.1, 2.1);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush3Scale = 0.4;
bush3.scale.set(bush3Scale, bush3Scale, bush3Scale);
bush3.position.set(-0.8, 0.1, 2.2);

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush4Scale = 0.15;
bush4.scale.set(bush4Scale, bush4Scale, bush4Scale);
bush4.position.set(-1, 0.05, 2.6);

house.add(bush1, bush2, bush3, bush4);

/**
 * Graves
 */
// Group
const graves = new THREE.Group();
scene.add(graves);
const graveMeasurements = {
  width: 0.6,
  height: 0.8,
  depth: 0.2,
};
const graveGeometry = new THREE.BoxGeometry(
  graveMeasurements.width,
  graveMeasurements.height,
  graveMeasurements.depth
);
const graveMaterial = new THREE.MeshStandardMaterial({
  color: "#b2b6b1",
});

const fontLoader = new FontLoader(loadingManager);

fontLoader.load("fonts/blood.json", (font) => {
  const graveTextMaterial = new THREE.MeshStandardMaterial({
    color: "tomato",
  });
  const graveLight = new THREE.PointLight("red", 1, 10);
  graveLight.position.y = -1;
  scene.add(graveLight);

  // const graveLightHelper = new THREE.PointLightHelper(graveLight);
  // scene.add(graveLightHelper);

  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 6;

    const x = Math.sin(angle) * radius;
    const y = graveMeasurements.height / 2;
    const z = Math.cos(angle) * radius;
    const grave = new THREE.Mesh(graveGeometry, graveMaterial);

    const graveGroup = new THREE.Group();

    // generate random name
    const randomName = names[Math.floor(Math.random() * names.length)];

    const graveTextGeometry = new TextGeometry(randomName, {
      font: font,
      size: 0.15,
      height: 0.2,
      curveSegments: 4,
      bevelEnabled: true,
      bevelOffset: 0,
      bevelSegments: 4,
      bevelSize: 0.02,
      bevelThickness: 0.03,
    });

    graveTextGeometry.center();

    const graveText = new THREE.Mesh(graveTextGeometry, graveTextMaterial);

    graveGroup.add(graveText);
    graveGroup.add(grave);

    graveGroup.position.set(x, y - 0.1, z);
    graveLight.position.set(x, -2, z);

    graveGroup.rotation.y = (Math.random() - 0.5) * 0.4;
    graveGroup.rotation.z = (Math.random() - 0.5) * 0.4;
    grave.castShadow = true;
    graveText.castShadow = true;

    graves.add(graveGroup);
  }
});

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.position.set(2, 2, -1);
scene.add(moonLight);

const moonLightHelper = new THREE.DirectionalLightHelper(moonLight);
moonLightHelper.visible = false;
scene.add(moonLightHelper);

// Door Light
const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, wallMeasurements.height + 0.2);
const doorLightHelper = new THREE.PointLightHelper(doorLight);
doorLightHelper.visible = false;

house.add(doorLight);
scene.add(doorLightHelper);

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight("#ff00ff", 1.5, 3);
scene.add(ghost1);

const ghost2 = new THREE.PointLight("#00ffff", 1.5, 3);
scene.add(ghost2);

const ghost3 = new THREE.PointLight("#ffff00", 1.5, 3);
scene.add(ghost3);

/**
 * Debugging
 */
// gui
//   .add(ambientLight, "intensity")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("Amb Light Intensity");
// gui
//   .add(moonLight, "intensity")
//   .min(0)
//   .max(1)
//   .step(0.001)
//   .name("Moon Light Intensity");
// gui
//   .add(moonLight.position, "x")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("Moon Light Position X");
// gui
//   .add(moonLight.position, "y")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("Moon Light Position Y");
// gui
//   .add(moonLight.position, "z")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("Moon Light Position Z");

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.5, 100);
camera.position.set(3, 7, 13);
// camera.position.set(4, 2, 5);

// 425
scene.add(camera);

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Shadows
 */

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

floor.receiveShadow = true;

// optimize shadows
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(scene.fog.color);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animation
 */
const clock = new THREE.Clock();
function tick() {
  // get elapsed time
  const elapsedTime = clock.getElapsedTime();

  // Animate Ghosts
  const ghost1Angle = elapsedTime * 0.5;
  ghost1.position.x = Math.cos(ghost1Angle) * 4;
  ghost1.position.z = Math.sin(ghost1Angle) * 4;
  ghost1.position.y = Math.sin(elapsedTime) * 3;

  const ghost2Angle = -elapsedTime * 0.32;
  ghost2.position.x = Math.cos(ghost2Angle) * 5;
  ghost2.position.z = Math.sin(ghost2Angle) * 5;
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

  const ghost3Angle = elapsedTime * 0.18;
  ghost3.position.x =
    Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
  ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2.5);

  // Update Controls
  controls.update();

  // Render
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();

/**
 * Play Audio
 */

// const audio = new Audio(ghostAudio);

// if (typeof audio.loop == "boolean") {
//   audio.loop = true;
// } else {
//   audio.addEventListener(
//     "ended",
//     function () {
//       this.currentTime = 0;
//       this.play();
//     },
//     false
//   );
// }
// audio.play();
