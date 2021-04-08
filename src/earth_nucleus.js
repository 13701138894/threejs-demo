console.log('地球细胞核空间特效')
import './scss/style.scss'
import * as THREE from 'three'
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {
    debounce
} from "./utils/tools";

import SimplexNoise from "simplex-noise";

let container = document.querySelector('.container')

let scene, renderer, camera, controls, stats, textureObj = {},
    noise = new SimplexNoise(),
    blobScale = 3
let nucleus, // 细胞核
    sphereBg, // 球体背景
    particleStarMap = new Map(), // 存放particleStar的相关信息
    stars // 星星
window.onload = function () {
    initRenderer()
    initScene()
    initLight()
    initCamera()
    initControls()
    initHelper()
    initStats()

    initObject()

    animate()
}

window.onresize = debounce(() => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
}, 200)

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        // 是否执行抗锯齿。默认为false.
        antialias: true,
        // canvas是否包含alpha (透明度)。默认为 false
        // alpha: true
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    // 设置设备像素比。通常用于避免HiDPI设备上绘图模
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement)
}

function initScene() {
    scene = new THREE.Scene()
}

function initLight() {
    let ambientLight = new THREE.AmbientLight(0xcccccc, 1.5)
    scene.add(ambientLight)

    let directionalLight = new THREE.DirectionalLight(0xffffff, 2)
    directionalLight.position.set(0, 50, -20)
    scene.add(directionalLight)
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 100000)
    camera.position.set(0, 0, 300);
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    if (controls) controls.update()
    if (stats) stats.update()
    starsAnimate()
    nucleusAnimate()
    sphereBgAnimate()
}

function initControls() {
    controls = new OrbitControls(camera, renderer.domElement)
    // 将其设为true，以自动围绕目标旋转
    controls.autoRotate = true;
    // 当.autoRotate为true时，围绕目标旋转的速度将有多快，默认值为2.0，相当于在60fps时每旋转一周需要30秒。
    controls.autoRotateSpeed = 4;
    controls.maxDistance = 350;
    controls.minDistance = 150;
    // 启用或禁用摄像机平移，默认为true
    controls.enablePan = false;
}

function initHelper() {
    let axesHelper = new THREE.AxesHelper(250)
    scene.add(axesHelper)
}

function initStats() {
    stats = new Stats()
    stats.domElement.style.position = 'fixed'
    stats.domElement.style.left = '5px'
    stats.domElement.style.top = '5px'
    container.appendChild(stats.domElement)
}

function initObject() {
    toLoadTexture()
    createNucleus()
    createSphereBg()
    createStars()
    createFixedStars()
}

function toLoadTexture() {
    let loader = new THREE.TextureLoader()
    textureObj.textureSphereBg = loader.load('../public/earth_nucleus/img/bg3-je3ddz.jpg');
    textureObj.texturenucleus = loader.load('../public/earth_nucleus/img/star-nc8wkw.jpg');
    textureObj.textureStar = loader.load('../public/earth_nucleus/img/p1-g3zb2a.png');
    textureObj.texture1 = loader.load('../public/earth_nucleus/img/p2-b3gnym.png');
    textureObj.texture2 = loader.load('../public/earth_nucleus/img/p3-ttfn70.png');
    textureObj.texture4 = loader.load('../public/earth_nucleus/img/p4-avirap.png');
}
// 细胞核
function createNucleus() {
    const {
        texturenucleus
    } = textureObj
    // anisotropy 沿着轴，通过具有最高纹素密度的像素的样本数。 默认情况下，这个值为1。设置一个较高的值将会产生比基本的mipmap更清晰的效果，代价是需要使用更多纹理样本
    texturenucleus.anisotropy = 16;
    let icosahedronGeometry = new THREE.IcosahedronGeometry(30, 10)
    let lamberMaterial = new THREE.MeshLambertMaterial({
        map: texturenucleus,
        // color: 0x00ff00
    })
    nucleus = new THREE.Mesh(icosahedronGeometry, lamberMaterial)
    scene.add(nucleus)

}
// 球体背景
function createSphereBg() {
    const {
        textureSphereBg
    } = textureObj
    textureSphereBg.anisotropy = 16;
    let sphereGeometry = new THREE.SphereBufferGeometry(150, 40, 40)
    let sphereMaterial = new THREE.MeshLambertMaterial({
        map: textureSphereBg,
        side: THREE.BackSide
    })
    sphereBg = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphereBg)
}
// 星星
function createStars() {
    const {
        textureStar
    } = textureObj
    let starsGeometry = new THREE.BufferGeometry();
    let arr = []
    for (let i = 0; i < 50; i++) {
        // 微粒星 坐标 分布在 半径150的球上
        let particleStar = randomPointSphere(150)
        let obj = {}
        // 速度 50-200间的随机整数
        obj.velocity = THREE.MathUtils.randInt(50, 200);
        obj.startX = toFixed3(particleStar.x)
        obj.startY = toFixed3(particleStar.y)
        obj.startZ = toFixed3(particleStar.z)
        // particleStarMap.set(particleStar,obj)
        let key = [obj.startX, obj.startY, obj.startZ]
        particleStarMap.set(JSON.stringify(key), obj)
        arr.push(obj.startX, obj.startY, obj.startZ)
    }
    let vertices = new Float32Array(arr)
    let bufferAttribute = new THREE.BufferAttribute(vertices, 3)
    starsGeometry.setAttribute('position', bufferAttribute)
    let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    })
    stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)


}

// 指定范围随机点
function randomPointSphere(radius) {
    // 随机角度
    let theta = 2 * Math.PI * Math.random()
    // acos 反余弦 定义域[-1,1] 到达域 [0,π]
    let phi = Math.acos(2 * Math.random() - 1)
    let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
    let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
    let dz = 0 + (radius * Math.cos(phi));
    return new THREE.Vector3(dx, dy, dz)
}

// 球体内部的恒星
function createFixedStars() {
    const {
        texture1,
        texture2,
        texture4
    } = textureObj
    scene.add(toCreateFixedStars(texture1, 15, 20))
    scene.add(toCreateFixedStars(texture2, 5, 5))
    scene.add(toCreateFixedStars(texture4, 7, 5))
}
// 创建恒星
function toCreateFixedStars(texture, size, total) {
    let bufferGeometry = new THREE.BufferGeometry()
    let pointMaterial = new THREE.PointsMaterial({
        size: size,
        map: texture,
        blending: THREE.AdditiveBlending,
    });
    let arr = []
    for (let i = 0; i < total; i++) {
        let radius = THREE.MathUtils.randInt(149, 70)
        let particles = randomPointSphere(radius)
        arr.push(particles.x, particles.y, particles.z)
    }
    let vertices = new Float32Array(arr)
    let bufferAttribute = new THREE.BufferAttribute(vertices, 3)
    bufferGeometry.setAttribute('position', bufferAttribute)

    return new THREE.Points(bufferGeometry, pointMaterial)
}

// 星星 动画
function starsAnimate() {
    let position = stars.geometry.attributes.position;
    if (!position) return
    let vertex = new THREE.Vector3()
    let arr = []
    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i)
        let vx = toFixed3(vertex.x)
        let vy = toFixed3(vertex.y)
        let vz = toFixed3(vertex.z)
        let temporaryArr = [vx, vy, vz]
        let key = JSON.stringify(temporaryArr)
        let value = particleStarMap.get(key)
        if (!value) return
        particleStarMap.delete(key)

        temporaryArr[0] = toFixed3(vx + (0 - vx) / value.velocity)
        temporaryArr[1] = toFixed3(vy + (0 - vy) / value.velocity)
        temporaryArr[2] = toFixed3(vz + (0 - vz) / value.velocity)
        value.velocity -= 0.3;

        if (temporaryArr[0] <= 5 && temporaryArr[0] >= -5 && temporaryArr[2] <= 5 && temporaryArr[2] >= -5) {
            temporaryArr[0] = value.startX
            temporaryArr[1] = value.startY
            temporaryArr[2] = value.startZ
            value.velocity = THREE.MathUtils.randInt(50, 300);
        }
        arr = [...arr, ...temporaryArr]
        particleStarMap.set(JSON.stringify(temporaryArr), value)
    }
    let vertices = new Float32Array(arr)
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
}

// 细胞核动画
function nucleusAnimate() {
    let position = nucleus.geometry.attributes.position;
    let vector3 = new THREE.Vector3()
    let arr = []
    for (var i = 0; i < position.count; i++) {
        let time = Date.now()
        vector3.fromBufferAttribute(position, i)
        /**
         * vector3.normalize()
         * 将该向量转换为单位向量（unit vector）， 也就是说，
         * 将该向量的方向设置为和原向量相同，但是其长度（length）为1。
         */
        vector3.normalize()


        // noise.noise3D(x,y,z) 返回 [-1,1]
        let distance = nucleus.geometry.parameters.radius + noise.noise3D(
            vector3.x + time * 0.0005,
            vector3.y + time * 0.0003,
            vector3.z + time * 0.0008,
        ) * blobScale
        // vector3 * distance 将该向量与所传入的标量s进行相乘
        vector3.multiplyScalar(distance)
        arr.push(vector3.x,vector3.y,vector3.z)
    }
    let v = new Float32Array(arr)
    let bufferAttribute = new THREE.BufferAttribute(v,3)
    nucleus.geometry.setAttribute('position',bufferAttribute)

    // 通过面片法向量的平均值计算每个顶点的法向量
    nucleus.geometry.computeVertexNormals();
    nucleus.geometry.computeFaceNormals();
    nucleus.rotation.y += 0.002;
}

// 球体背景动画
function sphereBgAnimate() {
    sphereBg.rotation.x += 0.002;
    sphereBg.rotation.y += 0.002;
    sphereBg.rotation.z += 0.002;
}

// 
function toFixed3(str) {
    return Number(str.toFixed(3))
}