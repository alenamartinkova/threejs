import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

// Loading
const textureLoader = new THREE.TextureLoader()
const normalTexture = textureLoader.load('/textures/height_normal.png')

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.SphereGeometry(.5, 64, 64)

// Materials
const material = new THREE.MeshStandardMaterial()
material.metalness = .7
material.roughness = .2
material.normalMap = normalTexture

// Mesh
const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere)

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

// Light 2
const pointLightSecond = new THREE.PointLight(0xff0000, 2)
pointLightSecond.position.set(-2.38, 1.28,-2.63)
pointLightSecond.intensity = 10
scene.add(pointLightSecond)

const pointLightHelper = new THREE.PointLightHelper(pointLightSecond, .5)
scene.add(pointLightHelper)

const light2 = gui.addFolder('Light 2')
// GUI
light2.add(pointLightSecond.position, 'x').min(-6).max(6).step(.01)
light2.add(pointLightSecond.position, 'y').min(-3).max(3).step(.01)
light2.add(pointLightSecond.position, 'z').min(-3).max(6).step(.01)
light2.add(pointLightSecond, 'intensity').min(0).max(10).step(.01)

// Light 3
const pointLightThird = new THREE.PointLight(0xf0ff, 2)
pointLightThird.position.set(1.73, -1.65, -1.17)
pointLightThird.intensity = 10
scene.add(pointLightThird)

const pointLightThirdHelper = new THREE.PointLightHelper(pointLightThird, .5)
scene.add(pointLightThirdHelper)

const light3 = gui.addFolder('Light 3')
// GUI
light3.add(pointLightThird.position, 'x').min(-6).max(6).step(.01)
light3.add(pointLightThird.position, 'y').min(-3).max(3).step(.01)
light3.add(pointLightThird.position, 'z').min(-3).max(6).step(.01)
light3.add(pointLightThird, 'intensity').min(0).max(10).step(.01)

const light3Color = {
    color: 0xf0ff
}

light3.addColor(light3Color, 'color').onChange(() => {
    pointLightThird.color.set(light3Color.color)
})


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()