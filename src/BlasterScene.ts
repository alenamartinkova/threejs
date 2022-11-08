import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import Bullet from './Bullet';

export default class BlasterScene extends THREE.Scene {
    private readonly mtlLoader = new MTLLoader();
    private readonly objLoader = new OBJLoader();
    private readonly camera: THREE.PerspectiveCamera;
    private readonly keyDown = new Set<string>();
    private blaster?: THREE.Group;
    private directionVector = new THREE.Vector3();
    private speed:number = .1;
    private bulletMtl?: MTLLoader.MaterialCreator;
    private bullets: Bullet[] = [];
    private targets: THREE.Group[] = [];

    /**
     * Constructor
     * @param camera
     */
    constructor(camera: THREE.PerspectiveCamera) {
        super();

        this.camera = camera
    }

    /**
     * Init function
     */
    async initialize() {
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl')
        targetMtl.preload()

        const blasterMtl = await this.mtlLoader.loadAsync('assets/blasterG.mtl')
        blasterMtl.preload()

        this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl')
        this.bulletMtl.preload()

        const target1 = await this.createTarget(targetMtl)
        target1.position.x = -1
        target1.position.z = -3

        const target2 = await this.createTarget(targetMtl)
        target2.position.x = 1
        target2.position.z = -3

        const target3 = await this.createTarget(targetMtl)
        target3.position.x = 2
        target3.position.z = -3

        const target4 = await this.createTarget(targetMtl)
        target4.position.x = -2
        target4.position.z = -3
        this.targets.push(target1, target2, target3, target4)

        this.blaster = await this.createBlaster(blasterMtl)
        this.blaster.position.z = 3
        this.blaster.add(this.camera)

        this.camera.position.z = 1
        this.camera.position.y = .5

        const light = new THREE.DirectionalLight(0xFFFFFF, 1.4)
        light.position.set(0,4,2)
        this.add(light)
        this.add(target1, target2, target3, target4, this.blaster)

        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
    }

    /**
     * Function that handles key down event
     * @param event
     */
    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase())
    }

    /**
     * Function that handles key up event
     * @param event
     */
    private handleKeyUp = (event: KeyboardEvent) => {
        this.keyDown.delete(event.key.toLowerCase())

        if (event.key === ' ') {
            if (this.bulletMtl) {
                this.createBullet(this.bulletMtl);
            }
        }
    }

    /**
     * Function that moves camera based on user input
     * @returns
     */
    private updateInput() {
        if (!this.blaster) {
            return;
        }

        const shiftKey = this.keyDown.has('shift')

        if (!shiftKey) {
            if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.rotateY(.02)
            } else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.rotateY(-.02)
            }
        }

        const dir = this.directionVector
        this.camera.getWorldDirection(dir)

        if (this.keyDown.has('w') || this.keyDown.has('arrowup')) {
            this.blaster.position.add(dir.clone().multiplyScalar(this.speed))
        } else if (this.keyDown.has('s') || this.keyDown.has('arrowdown')) {
            this.blaster.position.add(dir.clone().multiplyScalar(-this.speed))
        }

        if (shiftKey) {
            const strafeDir = dir.clone();
            const upVector = new THREE.Vector3(0, 1, 0)

            if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.position.add(strafeDir.applyAxisAngle(upVector, Math.PI * 0.5).multiplyScalar(this.speed))
            } else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.position.add(strafeDir.applyAxisAngle(upVector, Math.PI * -0.5).multiplyScalar(this.speed))
            }
        }
    }

     /**
     * Function that creates target from obj file
     * @returns
     */
    private async createTarget(mtl: MTLLoader.MaterialCreator) {
        this.objLoader.setMaterials(mtl)
        const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj')
        modelRoot.rotateY(Math.PI * 0.5)

        return modelRoot
    }

    /**
    * Function that creates blaster from obj file
    * @returns
    */
    private async createBlaster(mtl: MTLLoader.MaterialCreator) {
        this.objLoader.setMaterials(mtl)
        const modelRoot = await this.objLoader.loadAsync('assets/blasterG.obj')

        return modelRoot
    }

    /**
    * Function that creates bullet from obj file
    * @returns
    */
    private async createBullet(mtl: MTLLoader.MaterialCreator) {
        if (!this.blaster) {
            return;
        }

        if (this.bulletMtl) {
            this.objLoader.setMaterials(mtl)
        }

        const modelRoot = await this.objLoader.loadAsync('assets/foamBulletB.obj')
        this.camera.getWorldDirection(this.directionVector)

        // axis aligned bound box
        const aabb = new THREE.Box3().setFromObject(this.blaster)
        const size = aabb.getSize(new THREE.Vector3())
        const vec = this.blaster.position.clone()
        vec.y += .06

        // position bullet
        modelRoot.position.add(
            vec.add(
                this.directionVector.clone().multiplyScalar(size.z * .5)
            )
        )

        // rotate bullet
        modelRoot.children.forEach(child => child.rotateX(Math.PI * -.5))
        modelRoot.rotation.copy(this.blaster.rotation)

        this.add(modelRoot)
        const b = new Bullet(modelRoot)
        b.setVelocity(
            this.directionVector.x * .2,
            this.directionVector.y * .2,
            this.directionVector.z * .2,
        )

        this.bullets.push(b)
    }

    /**
     * Function that updates bullets
     */
    private updateBullets() {
        for (let i = 0; i < this.bullets.length; i++) {
            const b = this.bullets[i];
            b.update()

            if (b.shouldRemove) {
                this.removeBullet(b, i)
            } else {
                for (let j = 0; j < this.targets.length; j++) {
                    const t = this.targets[j]

                    if (t.position.distanceToSquared(b.group.position) < .05) {
                        this.removeBullet(b, i)
                        t.visible = false
                        setTimeout(() => {
                            t.visible = true
                        }, 1000)
                    }
                }
            }
        }
    }

    /**
     * Function that removes bullet
     *
     * @param b
     * @param i
     */
    private removeBullet(b: Bullet, i: number) {
        this.remove(b.group)
        this.bullets.splice(i, 1)
        i--
    }

    /**
     * Update function called from main
     */
    update() {
        this.updateInput()
        this.updateBullets()
    }

    /**
     * Function that creates cube
     * @returns THREE.Mesh
     */
    createCube() {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        cube.position.z = -5;
        cube.position.y = 0;

        return cube;
    }

     /**
     * Function that creates lines
     * @returns THREE.Line
     */
    createLine() {
        const points = [];
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        points.push( new THREE.Vector3( -10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        points.push( new THREE.Vector3( 10, 0, 0 ) );
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);

        return line;
    }

     /**
     * Function that creates donut
     * @returns THREE.Mesh
     */
    createDonut() {
        const geometry = new THREE.TorusGeometry( 10, 5, 16, 50 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const torus = new THREE.Mesh( geometry, material );

        return torus;
    }
}