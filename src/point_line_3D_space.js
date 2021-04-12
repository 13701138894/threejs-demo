console.log('点线3d立体空间特效')
import './scss/style.scss'
import * as THREE from 'three'

let container = document.querySelector('.container')
let scene,camera,renderer,sphereNum = 100,mouseX = 0,mouseY = 0
let windowHalfX = container.clientWidth / 2;
let windowHalfY = container.clientHeight / 2;

window.onload = function(){
    initScene()
    initCamera()
    initRenderer()
    initObject()


    animate()
}
window.onresize = debounce(()=>{
    renderer.setSize(container.clientWidth,container.clientHeight)
    camera.aspect = container.clientWidth/container.clientHeight
    camera.updateProjectionMatrix()
})

function initScene(){
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xF45705)

}
function initCamera() {
    camera = new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,0.1,10000)
    camera.position.z = 100
    camera.lookAt(new THREE.Vector3(0,0,0))
}
function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        alpha:true
    })
    renderer.setSize(container.clientWidth,container.clientHeight)
    container.appendChild(renderer.domElement)
}

function animate() {
    requestAnimationFrame(animate)
    if(camera) {
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( - mouseY + 200 - camera.position.y ) * .05;
        camera.lookAt( scene.position );
    }
    renderer.render(scene,camera)
}
function debounce(fn,wait=200){
    let t = null;
    return function(){
        clearTimeout(t)
        t = setTimeout(()=>{
            fn.apply(this,arguments)
        },wait)
    }
}


function initObject() {
    let position = createSprite()
    createLine(position)
    addListener()
}

function createSprite() {
    let arr = []
    for(let i = 0; i < sphereNum; i ++) {
        let sphereGeometry = new THREE.SphereGeometry(0.3,10,10)
        let material = new THREE.MeshBasicMaterial({color:0xffffff})
        let sphere = new THREE.Mesh(sphereGeometry,material)
        sphere.position.x = Math.random() * 2 -1
        sphere.position.y = Math.random() * 2 -1
        sphere.position.z = Math.random() * 2 -1
        sphere.position.normalize()
        sphere.position.multiplyScalar(Math.random() * 10 + 350)
        sphere.scale.x = 10;
        sphere.scale.y = 10
        sphere.scale.z = 10
        scene.add(sphere)
        arr.push(sphere.position.x,sphere.position.y,sphere.position.z)
    }
    return arr
}

function createLine(position) {
    let v = new Float32Array(position)
    let bufferAttribute = new THREE.BufferAttribute(v,3)
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position',bufferAttribute)
    let material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
    })
    let line = new THREE.Line(geometry,material)
    scene.add(line)
}

function addListener() {
    document.addEventListener('mousemove',function(event){
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    },false)
}