import * as THREE from 'three';
import BlasterScene from './BlasterScene';

const width = window.innerWidth
const height = window.innerHeight

// where to render
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('app') as HTMLCanvasElement
})

renderer.setSize(width, height)

// camera
const camera = new THREE.PerspectiveCamera(60, width / height, .1, 100)
camera.position.set( 0, 0, 1);

// scene
const scene = new BlasterScene(camera)
scene.initialize ()

// function that animates the scene - refreshes 60 times per second
function animate() {
  scene.update();
	renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();