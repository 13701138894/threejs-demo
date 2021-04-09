console.log('火箭上升')
import './scss/style.scss'
import { debounce } from "./utils/tools";
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

let container = document.querySelector('.container')

let scene,camera,renderer,stats,controls,rocket,width,height;
const targetRocketPosition = 40;
const animationDuration = 2000;
width = container.clientWidth;
height = container.clientHeight;
let lineGroup = new THREE.Group()
const svgGroup = new THREE.Group();

window.onload = function() {
    initScene()
    initCamera()
    initRenderer()
    initLight()
    initStats()

    initObject()

    animate()
}
window.onresize = debounce(()=>{
    renderer.setSize(container.clientWidth,container.clientHeight)
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix()
    width = container.clientWidth;
    height = container.clientHeight;
},200)

function initScene() {
    scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x5d0361, 10, 1500);
    scene.background = new THREE.Color(0x1a032b)
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,1,1000)
    camera.position.set(0,500,-10)
    camera.lookAt(scene.position)
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    })
    renderer.setSize(container.clientWidth,container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
}

function initLight() {
    let HemisphereLight = new THREE.HemisphereLight(0x404040,0x404040,1)
    let directionalLight = new THREE.DirectionalLight(0xdfebff,1)
    directionalLight.position.set(-300,0,600)
    let pointLight = new THREE.PointLight(0xa11148,2,1000,2)
    pointLight.position.set(200,-100,-50)
    scene.add(HemisphereLight,directionalLight,pointLight)
}

function initStats(){
    stats = new Stats()
    stats.domElement.style.position = 'fixed'
    stats.domElement.style.left = '10px'
    stats.domElement.style.top = '10px'
    container.appendChild(stats.domElement)
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene,camera)
    if(stats) stats.update()
    rocketAnimate()
    lineAnimate()
    svgAnimate()
}

function initObject(){
    createRocket()
    createLine()
    createSVG()
}

function createRocket(){
    let loader = new GLTFLoader()
    loader.load('../public/rocket_up/models/rocket.gltf',function(gltf){
        rocket = gltf.scene;
        rocket.rotation.x = Math.PI/2
        rocket.scale.set(0.7,0.7,0.7)
        scene.add(rocket)
    })
}

function rocketAnimate(){
    if(!rocket) return
    let t=( Date.now()%animationDuration)/animationDuration;
    let translate = Math.sin(t*Math.PI*2) * targetRocketPosition
    rocket.rotation.y+=0.1;
    rocket.position.z = translate
}

function createLine() {
    let shape = new THREE.Shape()
    let R = 5;
    let count = 10;
    let xStep = 80;
    // 200 -250
    shape.absarc(0,0,R,0,Math.PI)
    shape.lineTo(-R,-15*R)
    shape.absarc(0,-15*R,R,Math.PI,2*Math.PI)
    shape.lineTo(R,0)
    let geometry = new THREE.ShapeGeometry(shape,20)
    let material = new THREE.MeshLambertMaterial({
        color: 0x7E6C8B,
        side: THREE.DoubleSide
    })
    let baseLine = new THREE.Mesh(geometry,material)
    baseLine.rotateX(-Math.PI/2)

    let tag = 0
    for(let i = 1; i <= count; i++){
        let line = baseLine.clone()
        line.name = 'line'+i;
        if(i<=count/2){
            line.position.x = -i * xStep;
            tag = i
        }else{
            line.position.x = (i-tag) * xStep
        }
        line.position.z = THREE.MathUtils.randInt(-250,200)
        line.speed = THREE.MathUtils.randInt(5,10)
        lineGroup.add(line)
    }
    lineGroup.name = 'lineGroup'



    scene.add(lineGroup)
    // lineAnimate()
}

function lineAnimate() {
    if(lineGroup.children.length==0) return
    lineGroup.children.forEach(line=>{
        line.position.z-=line.speed;
        if(line.position.z<-250) {
            line.position.z = 200;
            line.speed = THREE.MathUtils.randInt(5,15)
        }
    })
}

function createSVG() {
    let loader = new SVGLoader()
    loader.load('../public/rocket_up/img/fire.svg',function(data){
        const paths = data.paths;
        
        for ( let i = 0; i < paths.length; i ++ ){
            const path = paths[ i ];
            const material = new THREE.MeshBasicMaterial({
                color: path.color,
                opacity: path.userData.style.fillOpacity,
                transparent: path.userData.style.fillOpacity < 1,
                side: THREE.DoubleSide,
                depthWrite: false,
            })

            let points = path.currentPath.getPoints(100)
            let shape = new THREE.Shape(points)
            let geometry = new THREE.ShapeGeometry(shape,30)
            geometry.center()
            const mesh = new THREE.Mesh( geometry, material );
            svgGroup.add( mesh );
        }
        svgGroup.scale.set(15,40,0)
        svgGroup.rotation.x = Math.PI * 0.95;
        svgGroup.position.z = -50;
        svgGroup.add = true
        scene.add(svgGroup)
    })
}


function svgAnimate(){
    if(svgGroup.children.length==0) return
    if(svgGroup.add){
        svgGroup.position.y+=4;
    }else{
        svgGroup.position.y-=4;
    }
    if(svgGroup.position.y>200){
        svgGroup.add = false;
    }else if(svgGroup.position.y <=0){
        svgGroup.add = true;
    }
}