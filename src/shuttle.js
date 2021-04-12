console.log('网页穿梭动画特效')
import './scss/style.scss'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let container = document.querySelector('.container')
let scene,camera,renderer,curve,percentage = 0

window.onload = function(){
    initScene()
    initCamera()
    initRenderer()
    initLight()
    
    initObject()

    animate()
}
window.onresize = debounce(()=>{
    renderer.setSize(container.clientWidth,container.clientHeight)
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix()
})

function initScene() {
    scene = new THREE.Scene()
}
function initRenderer() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(container.clientWidth,container.clientHeight)
    container.appendChild(renderer.domElement)
}
function initLight() {
    let light = new THREE.AmbientLight(0xffffff)
    scene.add(light)
}
function initCamera() {
    camera = new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,1,1000)
    camera.position.z = 500
    
}
function debounce(fn,wait=200){
    let t = null;
    return function(){
        clearTimeout(t)
        t = setTimeout(()=>{
            fn&&fn.apply(this,arguments)
        },wait)
    }
}
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene,camera)
    curveAnimate()
}

function initObject() {

    const points = [
        [60,180], [120,240], [180,300], [280,180], [180,120], [60,60], [60,180]
    ];
    for(var i = 0; i < points.length; i++) {
        let x = points[i][0]
        let y = points[i][0]
        let z = points[i][1]
        points[i] = new THREE.Vector3(x,y,z)
    }
    createCurve(points)
}
function createCurve(points){
    curve = new THREE.CatmullRomCurve3(points)
    let geometry = new THREE.TubeBufferGeometry(curve,100,10,10,true)
    let material = new THREE.MeshBasicMaterial({color:0x64E5E8,wireframe:true})
    let mesh = new THREE.Mesh(geometry,material)
    scene.add(mesh)
}
function curveAnimate(){
    if(!curve) return
    percentage+=0.001
    // 根据弧长返回曲线上给定位置的向量
    const p1 = curve.getPointAt(percentage%1)
    const p2 = curve.getPointAt((percentage + 0.01)%1)
    camera.position.set(p1.x,p1.y,p1.z)
    camera.lookAt(p2)
}