console.log('夜空动画特效')
import './scss/style.scss'
import * as THREE from 'three'
let container = document.querySelector('.container')
let scene,camera,renderer,starsNum = 1000,rot = 0

window.onload = function () {
    initScene()
    initCamera()
    initRenderer()
    initLight()

    initObject()

    animate()
}
window.onresize = debounce(()=>{
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth,container.clientHeight)
},200)
function debounce(fn,wait=200){
    let t = null;
    return function(){
        clearTimeout(t)
        t = setTimeout(()=>{
            fn&&fn.apply(this,arguments)
        },wait)
    }
}

function initScene(){
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xaaaaaa, 50, 2000);
}
function initCamera(){
    camera = new THREE.PerspectiveCamera(70,container.clientWidth/container.clientHeight,0.1,10000)
    // camera.lookAt(scene.position)
    // camera.position.set(0,0,1000)
}
function initRenderer(){
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(container.clientWidth,container.clientHeight)
    container.appendChild(renderer.domElement)
}
function initLight(){
    let light = new THREE.AmbientLight(0xfffff)
    scene.add(light)
}
function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene,camera)
    pointAnimate()
}

function initObject(){
    createPoint()
}
function createPoint(){
    let arr = [];
    for(let i = 0; i < starsNum; i ++){
        // 返回一个 在 -1000 到 1000 之间的浮点数
        let x = THREE.MathUtils.randFloatSpread(2000)
        let y = THREE.MathUtils.randFloatSpread(2000)
        let z = THREE.MathUtils.randFloatSpread(2000)
        arr.push(x,y,z)
    }
    let v = new Float32Array(arr)
    let bufferAttribute = new THREE.BufferAttribute(v,3)
    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position',bufferAttribute)
    let material = new THREE.PointsMaterial({
        color:0xffffff,
    })
    let mesh = new THREE.Points(geometry,material)
    scene.add(mesh)
}
function pointAnimate(){
    // 角度
    rot+=0.1
    // 转换成弧度
    const radian = (rot * Math.PI) / 180;
    camera.position.x = 1000 * Math.sin(radian);
    camera.position.z = 1000 * Math.cos(radian);
    camera.lookAt(new THREE.Vector3(0,0,0))
}