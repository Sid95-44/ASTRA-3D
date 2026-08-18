/**
 * camera.js
 * ------------------------------------------------------------------------
 * Perspective camera + OrbitControls (rotate / zoom / pan), plus a
 * smooth "focus on object" animation used by the planet explorer and the
 * view dock buttons.
 * ------------------------------------------------------------------------
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.05,
    8000
  );
  camera.position.set(0, 26, 62);
  return camera;
}

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.2;
  controls.maxDistance = 2600;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.55;
  controls.panSpeed = 0.6;
  controls.screenSpacePanning = false;
  return controls;
}

/**
 * Smoothly moves the camera + OrbitControls target toward a focus point,
 * offset back along a reasonable viewing vector so the object isn't
 * clipped by the near plane.
 */
export class CameraFocuser {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.active = false;
    this._from = new THREE.Vector3();
    this._to = new THREE.Vector3();
    this._targetFrom = new THREE.Vector3();
    this._targetTo = new THREE.Vector3();
    this._t = 0;
    this._duration = 1.1; // seconds
  }

  focusOn(object3D, viewDistance) {
    const targetPos = new THREE.Vector3();
    object3D.getWorldPosition(targetPos);

    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    this._from.copy(this.camera.position);
    this._to.copy(targetPos).addScaledVector(dir, viewDistance);

    this._targetFrom.copy(this.controls.target);
    this._targetTo.copy(targetPos);

    this._t = 0;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    this._t = Math.min(1, this._t + dt / this._duration);
    const e = easeInOutCubic(this._t);

    this.camera.position.lerpVectors(this._from, this._to, e);
    this.controls.target.lerpVectors(this._targetFrom, this._targetTo, e);
    this.controls.update();

    if (this._t >= 1) this.active = false;
  }
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}