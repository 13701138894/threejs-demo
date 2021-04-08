console.log('万花筒')
import './scss/style.scss'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from 'three'
import {debounce} from './utils/tools'

let scene,camera,renderer,controls,stats
window.onload = function(){
    initScene()
    initCamera()
}
window.onresize = debounce(()=>{

},200)

function initScene(){
    scene = new THREE.Scene()
}

function initCamera() {
    camera = new THREE.PerspectiveCamera()
}

