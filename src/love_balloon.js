console.log('图片胶卷螺旋特效')
import './scss/style.scss'
import {
    debounce
} from "./utils/tools";
import Stats from 'three/examples/jsm/libs/stats.module'
import * as THREE from 'three'

let scene, renderer, camera, stats, s = 150,meshes,
    heart, x = 0,
    y = 0;
let container = document.querySelector('.container')

window.onload = function () {
    initScene()
    initCamera()
    initRenderer()
    initLight()
    initStats()

    initObject()

    animate()
}
window.onresize = debounce(() => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix()
}, 200)

function initScene() {
    scene = new THREE.Scene()
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(15, 7.5, 30);
    camera.lookAt(scene.position);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 定义渲染器是否考虑对象级剪切平面。 默认为false.
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement)
}

function initLight() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 2, 4);

    scene.add(dirLight)

}

function initStats() {
    stats = new Stats()
    stats.domElement.style.position = 'fixed'
    stats.domElement.style.left = '10px'
    stats.domElement.style.top = '10px'
    container.appendChild(stats.domElement)
}


function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    if (stats) stats.update()
    updateAnimate()
}

function initObject() {
    createHeart()
    createMeshsGroup()
}

function createHeart() {
    heart = new THREE.Shape()
    heart.moveTo(x+0.5,y+0.5)
    heart.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heart.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heart.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heart.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heart.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
    heart.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

}

function createMeshsGroup(){
    meshes = new THREE.Group()
    scene.add(meshes)
    for (let i = 0; i < 30; i++) {
        createMeshe();
    }
}

function createMeshe(){
    let geometry = new THREE.ExtrudeGeometry(heart,{
        step: 2,
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 15
    })
    let material = new THREE.MeshPhongMaterial({color:0xfa6775})
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.random() * 30, Math.random() * -40, Math.random() * 20);
    mesh.rotation.z = Math.PI;
    // scene.add(mesh);
    // meshes.push(mesh);
    meshes.add(mesh)
    // scene.add(mesh)
}

function updateAnimate(){
    if(meshes.children.length==0) return
    meshes.children.forEach((elem,idx)=>{
        elem.position.y = (elem.position.y + 0.05) % 30;
    })
}