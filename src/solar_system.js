console.log('太阳系')
import './scss/style.scss';
import * as THREE from "three";
import { debounce } from "./utils/tools";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import Stats from "three/examples/jsm/libs/stats.module";

let container = document.querySelector('.container')

let Sun,
    Mercury, //水星
    Venus, //金星
    Earth,
    Mars,
    Jupiter, //木星
    Saturn, //土星
    Uranus, //天王
    Neptune, //海王
    stars = [];

const cameraFar = 3000; //镜头视距

let starNames = {}; //指向显示的星星名字对象
let displayName; //当前显示名字

let clock = new THREE.Clock(); //第一人称控制需要

let raycaster = new THREE.Raycaster(); //指向镭射
let mouse = new THREE.Vector2(); //鼠标屏幕向量

let scene, camera, renderer, state, controls
window.onload = function () {
    initScene()
    initCamera()
    initRenderer()
    initLight()
    initState()
    // initHelper()
    initControls()
    initStarrySky()
    animate()
}


function initScene() {
    scene = new THREE.Scene()
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, cameraFar)
    camera.position.set(-200, 50, 0)
    camera.lookAt(scene.position)
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement)
}

function initLight() {
    let ambientLight = new THREE.AmbientLight(0x999999, 1.2)
    scene.add(ambientLight)

    let pointLight = new THREE.PointLight(0xddddaa, 1.5, 500)
    scene.add(pointLight)

    let pointLight1 = new THREE.PointLight(0xffffff, 1.5, 500)
    pointLight1.position.set(2000,2000,2000)
    scene.add(pointLight1)
}

function initState() {
    state = new Stats()
    // let statsContainer = document.querySelector('.statsContainer')
    state.domElement.style.position = 'absolute'
    state.domElement.style.right = '0px'
    state.domElement.style.top = '0px'
    container.appendChild(state.domElement)
}

function initControls() {
    controls = new FirstPersonControls(camera,renderer.domElement)
    // 移动速度。默认为1。
    controls.movementSpeed = 100;
    // 环视速度。默认为0.005。
    controls.lookSpeed = 0.125
    // 是否能够垂直环视。默认为true。
    controls.lookVertical = true
    controls.lookAt(new THREE.Vector3(0,0,0))
    // 限制相机在xyz正负400以内
    // camera.position.x = THREE.MathUtils.clamp( camera.position.x, -400, 400 );
    // camera.position.y = THREE.MathUtils.clamp( camera.position.y, -400, 400 );
    // camera.position.z = THREE.MathUtils.clamp( camera.position.z, -400, 400 );

    window.addEventListener('mousemove',mouseMove,false)

}

// 鼠标指针指向响应
function mouseMove(event) {
    mouse.x = (event.clientX/window.innerWidth) * 2 -1
    mouse.y = -(event.clientY/window.innerHeight) * 2 + 1
}

function initHelper() {
    let axesHelper = new THREE.AxesHelper(250)
    scene.add(axesHelper)
}

function initStarrySky() {
    initSun()
    initOpacitySun()
    initPlanet()
    initStarBackground()
    displayPlanetName()
}

function initSun() {
    let loader = new THREE.TextureLoader()
    let texture = loader.load('../public/solar_system/img/sunCore.jpg')
    let geometry = new THREE.SphereGeometry(12, 16, 16)
    let material = new THREE.MeshLambertMaterial({
        map: texture,
    })
    Sun = new THREE.Mesh(geometry, material)

    Sun.name = 'Sun'
    Sun.castShadow = true;
    Sun.receiveShadow = true;
    scene.add(Sun)
}

// 透明太阳，比Sun大一圈，叠加出现光晕效果
function initOpacitySun() {
    let opSun = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 16),
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.35
        })
    )
    opSun.name = "Sun"
    scene.add(opSun)
}

/**
 *  Mercury,  //水星
    Venus,  //金星
    Earth,
    Mars,
    Jupiter, //木星
    Saturn, //土星
    Uranus, //天王
    Neptune, //海王
 */
function initPlanet() {
    // 水星
    Mercury = createPlanet('Mercury', 0.02, 0, 'rgb(124,131,203)', 20, 2);
    //金星
    Venus = createPlanet('Venus', 0.012, 0, 'rgb(190,138,44)', 30, 4);

    Earth = createPlanet('Earth', 0.010, 0, 'rgb(46,69,119)', 40, 5);
    // 火星
    Mars = createPlanet('Mars', 0.008, 0, 'rgb(210,81,16)', 50, 4);
    //木星
    Jupiter = createPlanet('Jupiter', 0.006, 0, 'rgb(254,208,101)', 70, 9);
    //土星
    Saturn = createPlanet('Saturn', 0.005, 0, 'rgb(210,140,39)', 100, 7, {
        color: 'rgb(136,75,30)',
        innerRedius: 9,
        outerRadius: 11
    });
    //天王
    Uranus = createPlanet('Uranus', 0.003, 0, 'rgb(49,168,218)', 120, 4);
    //海王
    Neptune = createPlanet('Neptune', 0.002, 0, 'rgb(84,125,204)', 150, 3);

    stars.push(Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune);
}


/**
 * 初始化行星
 * @param  {[type]} speed    [description]
 * @param  {[type]} angle    [description]
 * @param  {[type]} color    [description]
 * @param  {[type]} distance 距离原点距离 [description]
 * @param  {[type]} volume 半径  [description]
 * @param  {[type]} ringMsg 是否有碎星带 [description]
 * @return {[type]}          [description]
 */
function createPlanet(name, speed, angle, color, distance, volume, ringMsg) {
    let sphere = new THREE.SphereGeometry(volume, 16, 16)
    let material = new THREE.MeshLambertMaterial({
        color: color
    })
    let mesh = new THREE.Mesh(sphere, material)
    mesh.name = name;
    mesh.position.x = distance;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // 轨道
    let trackGeometry = new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64, 1)
    let trackMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        side: THREE.DoubleSide
    })
    let track = new THREE.Mesh(trackGeometry, trackMaterial)
    track.rotateX(-Math.PI / 2)
    scene.add(track)

    let star = {
        name,
        speed,
        angle,
        distance,
        volume,
        Mesh: mesh
    }

    // 如果有碎星带
    if (ringMsg) {
        let ringGeometry = new THREE.RingGeometry(ringMsg.innerRadius, ringMsg.outerRadius, 32, 6)
        let ringMaterial = new THREE.MeshBasicMaterial({
            color: ringMsg.color,
            side: THREE.DoubleSide,
            opacity: 0.7,
            transparent: true
        })
        let ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.name = `Ring of ${name}`
        ring.rotation.x = -Math.PI / 3
        ring.rotation.y = -Math.PI / 4
        ring.position.x = distance
        scene.add(ring)
        star.ring = ring
    }

    scene.add(mesh)
    return star
}

// 星空背景
function initStarBackground() {
    const particles = 20000; // 星星数量
    // 创造星星
    let bufferGeometry = new THREE.BufferGeometry()

    let positions = new Float32Array(particles * 3)
    let colors = new Float32Array(particles * 3)

    let color = new THREE.Color()

    // 定义星星的最近出现位置
    const gap = 1500;

    for (let i = 0; i < positions.length; i++) {
        // -2gap < x < 2gap
        let x = (Math.random() * gap * 2) * (Math.random() < 0.5 ? -1 : 1)
        let y = (Math.random() * gap * 2) * (Math.random() < 0.5 ? -1 : 1)
        let z = (Math.random() * gap * 2) * (Math.random() < 0.5 ? -1 : 1)

        // 找出x,y,z中绝对值最大的一个数
        let biggest = Math.abs(x) > Math.abs(y) ? Math.abs(x) > Math.abs(z) ? 'x' : 'z' : Math.abs(y) > Math.abs(z) ? 'y' : 'z'
        let pos = {x,y,z}

        // 如果最大值比gap要小（因为要在一个距离之外才出现星星）则赋值为n 或者 -n
        if(Math.abs(pos[biggest]) < gap ) pos[biggest] = pos[biggest] < 0 ? -gap : gap

        x = pos['x']
        y = pos['y']
        z = pos['z']

        positions[i] = x;
        positions[i+1] = y;
        positions[i+2] = z;

        // colors

        // 70%星星有颜色
        let hasColor = Math.random() > 0.3;
        let vx,vy,vz;
        if(hasColor){
            vx = (Math.random()+1)/2
            vy = (Math.random()+1)/2
            vz = (Math.random()+1)/2
        }else {
            vx = 1;
            vy = 1;
            vz = 1;
        }


        color.setRGB( vx, vy, vz );
        colors[ i ]     = color.r;
        colors[ i + 1 ] = color.g;
        colors[ i + 2 ] = color.b;
    }

    bufferGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3))
    bufferGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3))
    /**
     * bufferGeometry.computeBoundingSphere()
     * 计算当前几何体的的边界球形，该操作会更新已有 [param:.boundingSphere]。
        边界球形不会默认计算，需要调用该接口指定计算边界球形，否则保持默认值 null。
     */
    bufferGeometry.computeBoundingSphere()

    // 星星的material
    let material = new THREE.PointsMaterial({
        vertexColors: true,
        size: 6
    })
    let particleSystem = new THREE.Points(bufferGeometry,material)
    scene.add(particleSystem)

}

// 初始化指向显示名字
function displayPlanetName(){
    stars.forEach(star=>{
        nameConstructor(star.name,star.volume)
    })
    nameConstructor('Sun',12)
}

function nameConstructor(name,volume){
    let loader = new THREE.FontLoader()
    loader.load('../public/solar_system/font/helvetiker_bold.typeface.json',function(font){
        let planetName = new THREE.Mesh(
            new THREE.TextGeometry(name,{
                font,
                size: 4,
                height: 4
            }),
            new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide})
        )
        planetName.volume = volume
        planetName.visible = false;
        starNames[name] = planetName;
        scene.add(planetName)
    })

}

// 行星移动
function move(){
    // 行星公转
    stars.forEach(star=>{
        moveEachStar(star)
    })

    // 太阳自转
    Sun.rotation.y = Sun.rotation.y == 2 * Math.PI ? 0.004*Math.PI : Sun.rotation.y+0.004*Math.PI;

    // 限制相机在xyz正负400以内
    camera.position.x = THREE.MathUtils.clamp( camera.position.x, -400, 400 );
    camera.position.y = THREE.MathUtils.clamp( camera.position.y, -400, 400 );
    camera.position.z = THREE.MathUtils.clamp( camera.position.z, -400, 400 );
    
    // 鼠标指向行星显示名字
    raycaster.setFromCamera( mouse, camera ); 
    // 交汇点对像
    let intersects = raycaster.intersectObjects(scene.children)
    if(intersects.length>0){
        // 取第一个交汇对像（最接近相机）
        let obj = intersects[0].object;

        let name = obj.name;

        // 把上一个显示隐藏
        displayName && (displayName.visible = false);

        // 如果是有设定名字的东西
        if(starNames[name]){
            starNames[name].visible = true;
            displayName = starNames[name];
            // 复制行星位置
            displayName.position.copy(obj.position)
            // 文字居中
            displayName.geometry.center()
            // 显示在行星的上方（y轴）
            displayName.position.y = starNames[name].volume + 4;
            // 面向相机
            displayName.lookAt(camera.position)
        }
    }else{
        displayName && displayName.visible && ( displayName.visible = false )
    }
}

// 行星公转
function moveEachStar(star){
    star.angle += star.speed;
    if(star.angle >= 2 * Math.PI) star.angle -=  2 * Math.PI
    star.Mesh.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle))

    // 碎星带
    if(star.ring){
        star.ring.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle))
    }
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    // 鼠标视角控制
    if (controls) controls.update(clock.getDelta())


    if (state) state.update()
    move()
}

window.onresize = debounce(() => {
    renderer.setSize(container.clientWidth, container.clientHeight)
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
}, 200)