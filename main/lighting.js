import * as THREE from 'three';

function createLight() {
  const color = 0xFFFFFF;
  const intensity = 10;
  const light = new THREE.DirectionalLight(color, intensity);
  return light;
}

export {createLight};