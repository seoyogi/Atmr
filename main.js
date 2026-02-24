import { createScene } from "./scene.js";
import { initPhysics, updatePhysics } from "./physics.js";
import { createVehicle } from "./vehicle.js";
import { setupControls } from "./controls.js";
import { setupDayNight } from "./daynight.js";

let renderer, scene, camera, vehicle, clock;

export async function startGame() {
  const setup = await createScene();
  renderer = setup.renderer;
  scene = setup.scene;
  camera = setup.camera;
  clock = setup.clock;

  initPhysics();
  vehicle = await createVehicle(scene);

  setupControls(vehicle);
  setupDayNight(scene);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updatePhysics(delta);
  renderer.render(scene, camera);
}
