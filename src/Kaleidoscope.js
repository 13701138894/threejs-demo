console.log('万花筒')
import './scss/style.scss'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as THREE from 'three'
import {debounce} from './utils/tools'

let container = document.querySelector('.container')
let scene,camera,renderer,controls,stats,uniforms;
window.onload = function(){
    initScene()
    initCamera()
    initRenderer()
    initStats()

    initObject()

    animate()
}
window.onresize = debounce(()=>{
    renderer.setSize(container.clientWidth,container.clientHeight)
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix()
},200)

function initScene(){
    scene = new THREE.Scene()
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45,container.clientWidth/container.clientHeight,1,100000)
    camera.position.set(0,0,1)
    camera.lookAt(scene.position)
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({

    })
    renderer.setSize(container.clientWidth,container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)
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
    renderer.render(scene,camera)
    if(controls) controls.update()
    if(stats) stats.update()
    if(uniforms) uniforms.time.value += 0.05;
}

function initObject() {
    let geometry = new THREE.PlaneGeometry(2,2)
    
    uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() }
    }

    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        // vertexShader: document.getElementById( 'vertexShader' ).textContent,
        // fragmentShader: document.getElementById( 'fragmentShader' ).textContent
        vertexShader:vertexShader,
        fragmentShader: fragmentShader
    } );

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
    let mesh = new THREE.Mesh(geometry,material)
    scene.add(mesh)
    console.log(uniforms)
    // onWindowResize()
}


var vertexShader = `  void main() {
    gl_Position = vec4( position, 1.0 );
}`

var fragmentShader = `#define TWO_PI 6.2831853072
#define PI 3.14159265359

precision highp float;
uniform vec2 resolution;
uniform float time;

const float displace = 3.;
const float gridSize = 2.0;
const int layers = 2;
const float detail = 5.0;
const float wave = 10.0;

vec2 rotate(vec2 v, float angle) {
	float c = cos(angle);
	float s = sin(angle);
	return v * mat2(c, -s, s, c);
}

vec3 coordToHex(vec2 coord, float scale, float angle) {
	vec2 c = rotate(coord, angle);
	float q = (1.0 / 3.0 * sqrt(3.0) * c.x - 1.0 / 3.0 * c.y) * scale;
	float r = 2.0 / 3.0 * c.y * scale;
	return vec3(q, r, -q - r);
}

vec3 hexToCell(vec3 hex, float m) {
	return fract(hex / m) * 2.0 - 1.0;
}

float absMax(vec3 v) {
	return max(max(abs(v.x), abs(v.y)), abs(v.z));
}

float nsin(float value) {
	return sin(value * TWO_PI) * 0.5 + 0.5;
}

float hexToFloat(vec3 hex, float amt) {
	return mix(absMax(hex), 1.0 - length(hex) / sqrt(3.0), amt);
}

float calc(vec3 hex, float time, float len) {
	float value = 0.0;
	for (int i = 0; i < layers; i++) {
		vec3 cell = hexToCell(hex, 1.0 + float(i)*2.0);
		value += nsin(
			hexToFloat(
				cell,
				nsin(len * wave + time + float(i) / float(layers))
			) * detail + nsin(time * 0.5)
		);
	}

	return value / float(layers);
}

void main(void) {
	vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
	float t = time *0.02;

	float rgb[3];
	float len = 1.0 - length(uv)*0.02;


	float zoom = nsin(t*0.1) + len * 10.0;
	float angle = TWO_PI * nsin(t * 0.05);
	vec3 hex = coordToHex(uv, gridSize*zoom, angle);

	for (int i = 0; i < 3; i++) {
		float t2 = t + float(i) * displace;
  hex[i] += sin(PI * len * 0.5)*0.1;
		//rgb[i] = pow(calc(hex, t2, len), float(i)*0.5) * (0.2 + 0.8 * sin(PI * len * 0.5));
  rgb[i] = pow(calc(hex, t2-float(i)*0.9, len),8.0)*2.  * (0.2 + 0.8 * sin(PI * len * 0.5));
	}

	gl_FragColor = vec4(
		rgb[0]-0.8,
		rgb[1]-0.8,
		rgb[2]+0.85,
		1.0
	);
}
`
