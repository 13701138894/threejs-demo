console.log('礼物盒子爆炸特效')
import './scss/style.scss'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene,camera,renderer,intersects,pointer = new THREE.Vector2(),raycaster;
let mesh,opening,opened,openSpeed=4,openTime = 0,timeToOpen=120,opacity = 1,pieces = [],bow,materials=[]
let container = document.querySelector('.container')


window.onload = function () {
    initTHREE()

    initObject()
}
window.onresize = function(){
    renderer.setSize(container.clientWidth,container.clientHeight)
    camera.aspect = container.clientWidth/container.clientHeight
    camera.updateProjectionMatrix()
}

function initTHREE(){
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(60,container.clientWidth/container.clientHeight,0.1,1000)
    camera.position.set(30,30,30)
    camera.lookAt(scene.position)
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(container.clientWidth,container.clientHeight)
    renderer.setClearColor(new THREE.Color(0xf98686))
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement)

    let ambientLight = new THREE.AmbientLight(0xffffff,0.7)
    let directionalLight = new THREE.DirectionalLight(0xffffff)
    directionalLight.position.set(10,20,0)
    directionalLight.shadow.mapSize = new THREE.Vector2(1024,1024)
    directionalLight.castShadow = true
    scene.add(ambientLight,directionalLight)

    let controls = new OrbitControls(camera,renderer.domElement)
    const size = 12;
    const divisions = 7;
    
    // const gridHelper = new THREE.GridHelper( size, divisions );
    // gridHelper.position.y = 6.1
    // gridHelper.material.color = new THREE.Color(0xffffff)
    // scene.add( gridHelper );


    animate()
}
function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene,camera)

    giftAnimate()
}

function initObject() {
    createGift()
}

function createGift() {
    mesh = new THREE.Group()
    let pieceGeo = new THREE.PlaneGeometry(12/7,12/7)
    let wrappingMat = new THREE.MeshStandardMaterial({
        color: 0x123a99,
        side: THREE.DoubleSide,
        transparent: true,
        wireframe: false
    })
    let wrappingPiece = new THREE.Mesh(pieceGeo, wrappingMat)

    let ribbonMat = new THREE.MeshStandardMaterial({
        color: 0xff1c54,
        side: THREE.DoubleSide,
        transparent: true,
        wireframe: false
    }) 
    let ribbonPiece = new THREE.Mesh(pieceGeo, ribbonMat);

    materials.push(wrappingMat,ribbonMat)

    // 礼物盒子主体拼装
    for(var i = 0; i < 6; i ++) {
        let side = new THREE.Object3D()
        switch(i){
            // bottom
            case 0:
                side.position.set(0,-6,0)
                side.rotation.x = Math.PI / 2
                break;
            // back
            case 1: 
                side.position.set(0, 0, -6);
                side.rotation.y = Math.PI;
                break;
           // left
            case 2:
                side.position.set(-6, 0, 0);
                side.rotation.y = -Math.PI / 2;
                break;
            // right
            case 3:
                side.position.set(6, 0, 0);
                side.rotation.y = Math.PI / 2;
                break;
            // front
            case 4:
                side.position.set(0, 0, 6);
                break;
            // top
            default:
                side.position.set(0, 6, 0);
                side.rotation.x = -Math.PI / 2;
                break;
        }

        // 组装盒子
        for(let h = -7/2; h < 7/2; h ++){
            for(let w = -7/2; w < 7/2; w++) {
                let isMiddleX = w >= -1 && w <= 0,
                isMiddleY = h >= -1 && h <= 0,
                topOrBottom = i == 0 || i == 5,
                // w为横向 横向中间一个为红色
                // h为纵向 仅顶部和底部中间有红色
                onBow = isMiddleX || (isMiddleY && topOrBottom),
                piece = onBow ? ribbonPiece.clone() : wrappingPiece.clone();

                piece.firstPosition = {
                    x: 12/7 * w + 12/14,
                    y: 12/7 * h + 12/14,
                    z: 0
                };
                piece.position.set(piece.firstPosition.x, piece.firstPosition.y, 0);

                // adjust movements while adhereing to star–like direction
                piece.xMoveBias = randDecimal(0.3, 1);
                piece.yMoveBias = randDecimal(0.3, 1);
                piece.zMoveBias = randDecimal(0.3, 1);

                piece.xRotateDir = getTails() ? -1 : 1;
                piece.yRotateDir = getTails() ? -1 : 1;
                piece.zRotateDir = getTails() ? -1 : 1;

                side.add(piece);
                pieces.push(piece)
            }
        }
        mesh.add(side)
        mesh.name = 'Present'
        scene.add(mesh)
    }

    // 添加bow钮
    let bowRad = 7 % 2 == 0 ? 4 : 3;
    let bowGeo = new THREE.DodecahedronGeometry(bowRad);
    let bowMat = new THREE.MeshStandardMaterial({
        color: 0xff1c54,
        transparent: true,
        wireframe: false
    })

    materials.push(bowMat)
    bow = new THREE.Mesh(bowGeo, bowMat);
    bow.castShadow = true;
    bow.firstPosition = {
        y: 6 + bowRad / 4
    };
    bow.position.set(0, bow.firstPosition.y, 0)

    bow.xMoveDir = Math.random() * 0.8 * (getTails() ? -1 : 1);
    bow.yMoveDir = 1;
    bow.zMoveDir = Math.random() * 0.8 * (getTails() ? -1 : 1);

    bow.xRotateDir = getTails() ? -1 : 1;
    bow.yRotateDir = getTails() ? -1 : 1;
    bow.zRotateDir = getTails() ? -1 : 1;

    bow.scale.y = 0.5;
    mesh.add(bow);
}

function randDecimal(min, max){
    return Math.random() * (max - min) + min
}
function getTails(){
    return Math.random() < 0.5
}

document.addEventListener("click",(e)=>{
    if (intersects.length || e.keyCode == 32){
        if(!opening&&!opened) {
            opening = true;
        }
    }
    
});
window.addEventListener("mousemove", (e)=> {
    updateRaycaster(e)
    renderer.domElement.style.cursor = intersects.length ? "pointer" : "default";
}, false);

function updateRaycaster (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if(!raycaster) raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, camera);
    intersects = raycaster.intersectObjects(mesh.children, true);
    intersects = intersects.filter(
        child => child.object.type == "Mesh"
    );
}

function giftAnimate(){
    if (opening) {
        let sineCurve = n => 0.03 * Math.sin(8 * Math.PI * n / 100)
        let scaleBy = 1 - sineCurve(openTime);

        mesh.scale.x = scaleBy;
        mesh.scale.y = scaleBy;
        mesh.scale.z = scaleBy;

        openTime += openSpeed;
        if (openTime >= timeToOpen) {
            openTime = 0;
            opening = false;
            opened = true;
        }

    } else if (opened) {
        let moveSpeed = 0.8,
            rotateSpeed = 0.1,
            divs = 7;

        // pieces
        if (opacity > 0) {
            opacity -= 0.02;

            pieces.forEach((e, i) => {
                let angleXZ = -45 + (90 * (i % divs) / (divs - 1)),
                    angleY = -45 + (90 / (divs - 1) * Math.floor((i % divs ** 2) / divs));

                e.position.x += moveSpeed * Math.sin(angleXZ * Math.PI / 180) * e.xMoveBias;
                e.position.y += moveSpeed * Math.sin(angleY * Math.PI / 180) * e.yMoveBias;
                e.position.z += moveSpeed * Math.cos(angleXZ * Math.PI / 180) * e.zMoveBias;

                e.rotation.x += rotateSpeed * e.xRotateDir;
                e.rotation.y += rotateSpeed * e.yRotateDir;
                e.rotation.z += rotateSpeed * e.zRotateDir;
            });

            // bow
            bow.position.x += moveSpeed * bow.xMoveDir;
            bow.position.y += moveSpeed * bow.yMoveDir;
            bow.position.z += moveSpeed * bow.xMove
            bow.rotation.x += rotateSpeed * bow.xRotateDir;
            bow.rotation.y += rotateSpeed * bow.yRotateDir;
            bow.rotation.z += rotateSpeed * bow.zRotateDir;

        } else {
            opacity = 0;
            restore();
        }

        materials.forEach(e => {
            e.opacity = opacity;
        });
    }

}
function restore(){
    opened = false;
    opacity = 1;

    // pieces
    pieces.forEach(e => {
        e.position.set(e.firstPosition.x, e.firstPosition.y, e.firstPosition.z);
        e.rotation.set(0, 0, 0);
    });
    // bow
    bow.position.set(0, bow.firstPosition.y, 0);
    bow.rotation.set(0, 0, 0);
}