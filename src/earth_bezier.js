console.log('地球+贝塞尔曲线+旋转')
import './scss/style.scss'
// import 'default-passive-events'
import * as THREE from 'three'
import Stats from "three/examples/jsm/libs/stats.module";
import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
    debounce
} from "./utils/tools";

let container = document.querySelector('.container')

let renderer, camera, scene, stats, controls, group, radius = 5,
    groupDots, groupLines, groupHalo, aGroup, chinaPos;

group = new THREE.Group(); // 地球和各个国家小球
groupDots = new THREE.Group(); // 点
groupLines = new THREE.Group(); // 线
groupHalo = new THREE.Group(); // 光环
aGroup = new THREE.Group(); // 动画小球





// 根据geojson文件,筛选获取所有国家的一个经纬度
function reloadGeoJsonForDot() {
    return new Promise(resolve => {
        let loader = new THREE.FileLoader()
        loader.load('../public/earth_bezier/geojson/countries.json',function(json){
            let data = JSON.parse(json)
            let arr = []
            for(var key in data){
                let obj = {}
                obj.name = key;
                obj.position = data[key]
                arr.push(obj)
            }
            resolve(arr)
        })
    })

}

// 根据经纬度和地球半径计算对应的{x,y,z}
function getPosAsLatitudeAndLongitude(longitude, latitude, radius) {
    // 精度(角度)转换为弧度 longitude * Π /180
    let lg = THREE.MathUtils.degToRad(longitude)
    let lt = THREE.MathUtils.degToRad(latitude)

    let y = radius * Math.sin(lt)
    let temp = radius * Math.cos(lt)
    let x = temp * Math.sin(lg)
    let z = temp * Math.cos(lg)

    return {
        x,
        y,
        z
    }
}

/**
 * @desc 随机设置点
 * @param <Group> group ...
 * @param <number> radius ...
 */
function setRandomDot(group, radius) {
    return new Promise(resolve=>{
        reloadGeoJsonForDot().then((arr) => {
            arr.forEach(item => {
                const pos = getPosAsLatitudeAndLongitude(item.position[0], item.position[1], radius)
                var dotGeo = new THREE.SphereGeometry(0.1, 1, 1)
                var dotMater = new THREE.MeshPhongMaterial({
                    color: 0xFF6347
                })
                var dotMesh = new THREE.Mesh(dotGeo, dotMater)
                dotMesh.position.set(pos.x,pos.y,pos.z)
                dotMesh.name = item.name
                group.add(dotMesh)
                if(item.name === 'China') chinaPos = dotMesh.position
            })
            resolve()
        })
    })


}

// 创建线条 v0开始点 v3结束点
function createLines(v0,v3){
    // 夹角 0 ~ Math.PI
    let angle = (v0.angleTo(v3) * 1.8) / Math.PI / 0.1;
    //  aLen 两点之间的直线距离,求曲线控制点使用，数值越大，曲线越高（作为参考值使用，可更改）
    let aLen = angle * 0.4;
    // hLen 曲线顶点到0,0,0的距离，计算曲线顶点坐标使用，参数可改，角度越大，距离越远，实际影响并不很大
    let hLen = angle * angle * 12;
    var p0 = new THREE.Vector3(0,0,0)

    // 法线向量
    let rayLine = new THREE.Ray(p0,getVCenter(v0.clone(),v3.clone()))

    // 顶点坐标
    let vtop = rayLine.at(hLen/rayLine.at(1,p0.clone()).distanceTo(p0),p0.clone())
    
    // 控制点坐标 本质上是v0与vtop间的随机点
    let v1 = getLenVcetor(v0.clone(), vtop, aLen)
    let v2 = getLenVcetor(v3.clone(), vtop, aLen)

    // 绘制贝塞尔曲线
    let curve = new THREE.CubicBezierCurve3(v0,v1,v2,v3)
    let bufferGeometry = new THREE.BufferGeometry()
    let points = curve.getPoints(50)
    bufferGeometry.setFromPoints(points)

    let material = new THREE.LineBasicMaterial({
        vertexColors: true
    })
    let colorPoints = []
    points.forEach((item,idx)=>{
        let color;
        if(idx>25){
            color = new THREE.Color(0xFAE161)
        }else{
            color = new THREE.Color(0xFF0000)
        }
        colorPoints.push(color.r,color.g,color.b)
    })
    let bufferAttribute = new THREE.Float32BufferAttribute(colorPoints,3)
    bufferGeometry.setAttribute('color',bufferAttribute)


    return {
        points: points,
        lineMesh: new THREE.Line(bufferGeometry,material)
    }
}

// 计算v1,v2 的中点
function getVCenter(v1, v2) {
    let v = v1.add(v2);
    return v.divideScalar(2);
}

// 计算V1，V2向量固定长度的点
function getLenVcetor(v1, v2, len) {
    // v1与v2间的直线距离
    let v1v2Len = v1.distanceTo(v2)
    // len/v1v2Len 取值[0-1] 0 时表示的是当前向量v1，1 时表示的是所传入的向量v2。
    return v1.lerp(v2,len/v1v2Len)
}


/**
 * @description 初始化渲染场景
 */
function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true, // 是否执行抗锯齿。默认为false.
        alpha: true // canvas是否包含alpha (透明度)。默认为 false
    })
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement)
}

/**
 * @description 初始化相机
 */
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 10000)
    camera.position.set(0.5, -2, 20)
    camera.lookAt(0, 3, 0)
    window.camera = camera
}

/**
 * @description 初始化场景
 */
function initScene() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xa0a0a0)
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000) // 雾
    window.scene = scene
    // ground
    var planeGeometry = new THREE.PlaneGeometry(2000, 2000)
    var planeMaterial = new THREE.MeshPhongMaterial({
        color: 0x999999,
        depthWrite: false, // 渲染此材质是否对深度缓冲区有任何影响。默认为true。 在绘制2D叠加时，将多个事物分层在一起而不创建z-index时，禁用深度写入会很有用。
    })
    var ground = new THREE.Mesh(planeGeometry, planeMaterial)
    ground.rotateX(-Math.PI / 2) // ground.rotation.x = -Math.PI/2
    ground.receiveShadow = true;
    scene.add(ground)
}

//辅助工具
function initHelper() {
    const helper = new THREE.AxesHelper(500)
    scene.add(helper)

    // 网格
    var grid = new THREE.GridHelper(20, 100, 0x000000, 0x000000)
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid)
}

// 性能插件
function initStats() {
    stats = new Stats()
    stats.dom.style.position = 'absolute'
    stats.dom.style.left = '0px'
    stats.dom.style.top = '0px'
    container.appendChild(stats.dom)
}

/**
 * 初始化用户交互
 **/
function initControls() {
    controls = new OrbitControls(camera, renderer.domElement)
    // 如果使用animate方法时，将此函数删除
    // controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
    // controls.dampingFactor = 0.25;
    // 是否可以缩放
    controls.enableZoom = true;
    // 是否自动旋转
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2;
    // 设置相机距离原点的最近距离
    // controls.minDistance = 2;
    // 设置相机距离原点的最远距离
    // controls.maxDistance = 1000;
    // 是否开启右键拖拽
    controls.enablePan = true;
}


/**
 * @description 初始化光
 */
function initLight() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1)
    scene.add(ambientLight)

    // 平行光
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
    directionalLight.position.set(1, 0.1, 0)
    /** normalize
     *  将该向量转换为单位向量（unit vector）， 也就是说，
     *  将该向量的方向设置为和原向量相同，但是其长度（length）为1。
     */
    var directionalLight2 = new THREE.DirectionalLight(0xff2fff, 0.2)
    directionalLight2.position.set(1, 0.1, 0.1)
    var directionalLight3 = new THREE.DirectionalLight(0xffffff)
    directionalLight3.position.set(1, 500, -20)
    directionalLight3.castShadow = true;
    directionalLight3.shadow.camera.top = 18;
    directionalLight3.shadow.camera.bottom = -10;
    directionalLight3.shadow.camera.left = -52;
    directionalLight3.shadow.camera.right = 12;
    scene.add(directionalLight, directionalLight2, directionalLight3)

    // 半球光
    var hemLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2)
    hemLight.position.set(0, 1, 0)
    scene.add(hemLight)
}

/**
 * @description 初始化添加物体
 */

async function initObject() {
    let globeTextureLoader = new THREE.TextureLoader()

    // 光环
    let haloTexture = globeTextureLoader.load('../public/earth_bezier/img/halo.png')
    let haloGeometry = new THREE.PlaneGeometry(14,14)
    let haloMaterial = new THREE.MeshLambertMaterial({
        map: haloTexture,
        transparent: true,
        side: THREE.DoubleSide
    })
    let halo = new THREE.Mesh(haloGeometry,haloMaterial)
    groupHalo.add(halo)
    // groupHalo.rotation.set(1.9, 0.5, 1);
    scene.add(groupHalo)

    // 小地球
    let smallEarthTexture = globeTextureLoader.load('../public/earth_bezier/img/smallEarth.png')
    let smallEarthGeometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
        -7,0,0,
        7,0,0
    ])
    let bufferAttribute = new THREE.BufferAttribute(vertices,3)
    smallEarthGeometry.setAttribute('position',bufferAttribute)
    let smallEarthMaterial = new THREE.PointsMaterial({
        map: smallEarthTexture,
        side: THREE.DoubleSide,
        transparent: true,
        size: 1
    })
    let smallEarth = new THREE.Points(smallEarthGeometry,smallEarthMaterial)
    groupHalo.add(smallEarth)

    // 地球
    // let earthTexture = globeTextureLoader.load('../public/earth_bezier/img/earth2.jpg')
    let earthTexture = globeTextureLoader.load('../public/earth_bezier/img/Earth_map.png')
    let earthNormal = globeTextureLoader.load('../public/earth_bezier/img/EarthNormal.png')
    let earthSpecular = globeTextureLoader.load('../public/earth_bezier/img/EarthSpec.png')
    let earthGeometry = new THREE.SphereGeometry(radius,100,100)
    let earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: earthNormal,
        normalScale: new THREE.Vector2(10,10),
        specularMap: earthSpecular,
        specular: new THREE.Color(0x8180FF),
        shininess: 5
    })
    let earth = new THREE.Mesh(earthGeometry,earthMaterial)
    group.rotation.set(0.5,2.9,0.1)
    group.add(earth)


    // 小点
    await setRandomDot(groupDots, radius)
    groupDots.rotation.y-=(134/240)*Math.PI
    groupDots.rotation.x+=Math.PI*42/240
    scene.add(groupDots);


    // 曲线
    var animateDots = [];
    groupDots.children.forEach((elem,idx)=>{
        if(elem.name === 'China') return
        let line = createLines(chinaPos,elem.position)
        groupLines.add(line.lineMesh)
        animateDots.push(line.points)

    })
    groupLines.rotation.y-=(134/240)*Math.PI
    groupLines.rotation.x+=Math.PI*42/240



    // 添加动画
    for(let i = 0; i < animateDots.length; i++){
        let aGeo = new THREE.SphereGeometry(0.05,1,0.03)
        let aMater = new THREE.MeshPhongMaterial({color: '#fff'})
        let aMesh = new THREE.Mesh(aGeo,aMater)
        aGroup.add(aMesh)
    }
    aGroup.rotation.y-=(134/240)*Math.PI
    aGroup.rotation.x+=Math.PI*42/240
    var vIndex = 0;
    function animateLine(){
        aGroup.children.forEach((elem,index)=>{
            let v = animateDots[index]&&animateDots[index][vIndex]
            if(v) elem.position.set(v.x,v.y,v.z)
        })
        vIndex ++;
        if(vIndex>100) {
            vIndex = 0
        };
        setTimeout(animateLine,60)
    }


    scene.add(aGroup);
    scene.add(group);
    scene.add(groupLines)
    animateLine()
}

/**
 * 窗口变动
 **/
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
}

/**
 * 更新
 **/
function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    if (controls) controls.update();
    if (stats) stats.update();
    // 光环
    groupHalo.rotation.z = groupHalo.rotation.z + 0.01;
    // 地球和各个国家小球
    group.rotation.y = group.rotation.y + 0.001;
    // 小点
    groupDots.rotation.y = groupDots.rotation.y + 0.001;
    // 线
    groupLines.rotation.y = groupLines.rotation.y + 0.001;
    // 动画小球
    aGroup.rotation.y = aGroup.rotation.y + 0.001;
    
}

window.onload = () => {
    initRenderer()
    initCamera();
    initScene();
    initLight();
    initHelper()

    initStats()
    initObject();
    // initOrbitControls()
    initControls()
    animate()
}
window.onresize = debounce(onWindowResize, 50)