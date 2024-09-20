// Import lib
import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { TransformControls } from './js/TransformControls.js';
import { TeapotBufferGeometry } from './js/TeapotBufferGeometry.js';


// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Init variable
var camera, scene, renderer, control, orbit;
var mesh, floor, floorMesh;
var raycaster, light;
var type_material = 3;
var material = new THREE.MeshPhongMaterial({ color: 0xffffff });
material.needsUpdate = true;
var mouse = new THREE.Vector2();
var temp;

// Init point for LatheGeometry
const points = [];
for (let i = 0; i < 10; i++) 
{
	points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
}

// Geometry
var BoxGeometry = new THREE.BoxGeometry(30, 30, 30, 40, 40, 40);
var SphereGeometry = new THREE.SphereGeometry(20, 20, 20);
var ConeGeometry = new THREE.ConeGeometry(18, 30, 32, 20);
var CylinderGeometry = new THREE.CylinderGeometry(20, 20, 40, 30, 5);
var TorusGeometry = new THREE.TorusGeometry(20, 5, 20, 100);
var TeapotGeometry = new TeapotBufferGeometry(20, 8);
var DodecahedronGeometry = new THREE.DodecahedronBufferGeometry(25);
var IcosahedronGeometry = new THREE.IcosahedronBufferGeometry(25);
var OctahedronGeometry =  new THREE.OctahedronBufferGeometry(25);
var TetrahedronGeometry = new THREE.TetrahedronBufferGeometry(25);
var LatheGeometry = new THREE.LatheGeometry(points);
var TorusKnotGeometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

init();
render();

function init() 
{
	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x343a40);

	// Camera
	var camera_x = 1;
	var camera_y = 50;
	var camera_z = 100;
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(camera_x, camera_y, camera_z);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	// light
	// light = new THREE.PointLight('rgb(255,255,255)');
	// light.position.set(45, 75, 45);
    // light.castShadow = true;
    // scene.add(light);

	//more light
	// light = new THREE.AmbientLight( 0x404040 , 10); // soft white light
	// scene.add( light );

	//more light
	// directionalLight = new THREE.DirectionalLight( 0xffffff );
	// scene.add( directionalLight );

	//more light
	// const light = new THREE.PointLight( 0xffffff, 10, 200,1 );
	// light.position.set( 50, 50, 50 );
	// scene.add( light );

	//more light
	const light = new THREE.SpotLight( 0xffffff );
	light.position.set( 100, 1000, 100 );
	light.castShadow = true;
	light.shadow.camera.near = 500;
	light.shadow.camera.far = 4000;
	light.shadow.camera.fov = 30;

	scene.add( light );

	// load the cube map
	var cubemap_path = "/images/";
	var cubemap_format = ".jpg";
	var urls = [
	  cubemap_path + "px" + cubemap_format,
	  cubemap_path + "nx" + cubemap_format,
	  cubemap_path + "py" + cubemap_format,
	  cubemap_path + "ny" + cubemap_format,
	  cubemap_path + "pz" + cubemap_format,
	  cubemap_path + "nz" + cubemap_format,
	];
	var refection_cube = new THREE.CubeTextureLoader().load(urls);
	refection_cube.format = THREE.RGBFormat;
	scene.background = refection_cube;
	
	// Floor
	floor = new THREE.PlaneBufferGeometry(200, 200, 32, 32);
	var floorMat = new THREE.MeshPhongMaterial({side: THREE.DoubleSide});
	var texture_loader = new THREE.TextureLoader();
	floorMat.map = texture_loader.load("/images/floor.png");
	floorMat.envMap = refection_cube;
	floorMesh = new THREE.Mesh(floor, floorMat);
	floorMesh.receiveShadow = true;
	floorMesh.rotation.x = -Math.PI / 2.0;
	floorMesh.position.set(0, -25, 0);
	scene.add(floorMesh);
	
    // Renderer
    raycaster = new THREE.Raycaster();
    renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize( window.innerWidth, window.innerHeight )
    renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById("rendering").addEventListener('mousedown', onMouseDown, false);
	document.getElementById("rendering").appendChild(renderer.domElement);

	window.addEventListener('resize', () => 
	{
		var width = window.innerWidth
		var height = window.innerHeight
		renderer.setSize(width, height)
		camera.aspect = width / height
		camera.updateProjectionMatrix()
		render()
	})

	orbit = new OrbitControls(camera, renderer.domElement);
	orbit.update();
	orbit.addEventListener('change', render);
	control = new TransformControls(camera, renderer.domElement);
	control.addEventListener('change', render);
	control.addEventListener('dragging-changed', function (event) 
	{
		orbit.enabled = !event.value;
	});
}

function render() 
{
	renderer.render(scene, camera);
}

// 2 Các khối hình sẽ được vẽ theo Point/Lines/Solid
function CloneMesh(dummy_mesh) 
{
	mesh.name = dummy_mesh.name;
	mesh.position.set(dummy_mesh.position.x, dummy_mesh.position.y, dummy_mesh.position.z);
	mesh.rotation.set(dummy_mesh.rotation.x, dummy_mesh.rotation.y, dummy_mesh.rotation.z);
	mesh.scale.set(dummy_mesh.scale.x, dummy_mesh.scale.y, dummy_mesh.scale.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);
	control.attach(mesh);
	scene.add(control);
}

function SetMaterial(mat) 
{
	mesh = scene.getObjectByName("mesh1");
	temp = mat;
	
	if (mat != 0) 
	{
		type_material = mat;
	}
	
	if (mesh) 
	{
		const dummy_mesh = mesh.clone();
		scene.remove(mesh);

		switch (type_material) 
		{
			case 1:
				material = new THREE.PointsMaterial({ size: 0.4});
				mesh = new THREE.Points(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 2:
				material = new THREE.MeshPhongMaterial({ wireframe: true });
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 3:
				material = new THREE.MeshPhongMaterial();
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
		}
		render();
	}
}
window.SetMaterial = SetMaterial

function SetColor() 
{
	if (temp_id == 0)
	{
		alert("Choose an object !")
	}
	else
	{
		mesh = scene.getObjectByName("mesh1");

		if (temp != 0) 
		{
			type_material = temp;
		}

		var color_material = document.getElementById("colorpicker1").value;

		if (mesh) 
		{
			const dummy_mesh = mesh.clone();
			scene.remove(mesh);

			switch (type_material) 
			{
				case 1:
					material = new THREE.PointsMaterial({ color: color_material, size: 0.4 });
					mesh = new THREE.Points(dummy_mesh.geometry, material);
					CloneMesh(dummy_mesh);
					break;
				case 2:
					material = new THREE.MeshPhongMaterial({ color: color_material, wireframe: true });
					mesh = new THREE.Mesh(dummy_mesh.geometry, material);
					CloneMesh(dummy_mesh);
					break;
				case 3:
					material = new THREE.MeshPhongMaterial({ color: color_material  });
					mesh = new THREE.Mesh(dummy_mesh.geometry, material);
					CloneMesh(dummy_mesh);
					break;
			}
			render();
		}
    }
}
window.SetColor = SetColor

function SetLight()
{
	scene.remove(light);

	var color_material = document.getElementById("colorpicker2").value;
	
	light = new THREE.PointLight(color_material);
	light.position.set(45, 75, 45);
    light.castShadow = true;
    scene.add(light);
	render();
}
window.SetLight = SetLight

// 1 Vẽ các khối hình
var temp_id = 0;
function RenderGeo(id) 
{
	cancelAnimationFrame(animate1);
	cancelAnimationFrame(animate2);
	cancelAnimationFrame(animate3);
	cancelAnimationFrame(animate4);
	cancelAnimationFrame(animate5);
	cancelAnimationFrame(animate6);
	animation_cur = 0;

	mesh = scene.getObjectByName("mesh1");
	scene.remove(mesh);
	material = new THREE.MeshPhongMaterial();
	temp_id = id;
	switch (id) 
	{
		case 1:
			mesh = new THREE.Mesh(BoxGeometry, material);
			break;
		case 2:
			mesh = new THREE.Mesh(SphereGeometry, material);
			break;
		case 3:
			mesh = new THREE.Mesh(ConeGeometry, material);
			break;
		case 4:
			mesh = new THREE.Mesh(CylinderGeometry, material);
			break;
		case 5:
			mesh = new THREE.Mesh(TorusGeometry, material);
			break;
		case 6:
			mesh = new THREE.Mesh(TeapotGeometry, material);
			break;
		case 7:
			mesh = new THREE.Mesh(IcosahedronGeometry, material);
			break;
		case 8:
			mesh = new THREE.Mesh(DodecahedronGeometry, material);
			break;
		case 9:
			mesh = new THREE.Mesh(OctahedronGeometry, material);
			break;
		case 10:
			mesh = new THREE.Mesh(TetrahedronGeometry, material);
			break;
		case 11:
			mesh = new THREE.Mesh(LatheGeometry, material);
			break;
		case 12:
			mesh = new THREE.Mesh(TorusKnotGeometry, material);
			break;
	}
	temp = 3;
    mesh.name = "mesh1";
    mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add(mesh);
	control_transform(mesh);
	render();
}
window.RenderGeo = RenderGeo;


// 3. Thực hiện chiếu phối cảnh; tăng giảm các toạ độ x,y,z; near, far
function setFOV(value) 
{
	camera.fov = Number(value);
	camera.updateProjectionMatrix();
	render();
}
window.setFOV = setFOV;

function setFar(value) 
{
	camera.far = Number(value);
	camera.updateProjectionMatrix();
	render();
}
window.setFar = setFar;

function setNear(value) 
{
	camera.near = Number(value);
	camera.updateProjectionMatrix();
	render();
}
window.setNear = setNear;

// 4. Affine
function Translate() 
{
	control.setMode("translate");
}
window.Translate = Translate;

function Rotate() 
{
	control.setMode("rotate");
}
window.Rotate = Rotate;

function Scale() 
{
	control.setMode("scale");
}
window.Scale = Scale;

// Control onKeydown
function control_transform(mesh) 
{
	control.attach(mesh);
	scene.add(control);
	window.addEventListener('keydown', function (event) 
	{
		switch (event.keyCode) 
		{
			case 84: // T
				Translate(); 
				break;
			case 82: // R
				Rotate(); 
				break;
			case 83: // S
				Scale(); 
				break;
		}
	});
}

function onMouseDown(event) 
{
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	// find intersections
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(scene.children);
	let check_obj = 0;
	if (intersects.length > 0) 
	{
		var obj;
		for (obj in intersects) 
		{
			if (intersects[obj].object.name == "mesh1") 
			{
				check_obj = 1;
				control_transform(intersects[obj].object);
				break;
			}
			if (intersects[obj].object.type == "PointLightHelper") 
			{
				check_obj = 1;
				control_transform(light);
				break;
			}
		}
	}
	if (check_obj == 0 && control.dragging == 0) control.detach();
	render();
}

// Animation
function cancel_all()
{
	cancelAnimationFrame(animate1);
	cancelAnimationFrame(animate2);
	cancelAnimationFrame(animate3);
	cancelAnimationFrame(animate4);
	cancelAnimationFrame(animate5);
	cancelAnimationFrame(animate6);
}
window.cancel_all = cancel_all;

var mesh = new THREE.Mesh();
var animate1, animate2, animate3, animate4, animate5, animate6;
var animation_cur = 0;
function Animate_1() 
{
	cancel_all();
	mesh.rotation.x += 0.01;
	render();
	animate1 = requestAnimationFrame(Animate_1);
	animation_cur = 1;
}
window.Animate_1 = Animate_1;

function Animate_2() 
{
	cancel_all();
	mesh.rotation.y += 0.01;
	render();
	animate2 = requestAnimationFrame(Animate_2);
	animation_cur = 2;
}
window.Animate_2 = Animate_2;

function Animate_3() 
{
	cancel_all();
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.01;
	render();
	animate3 = requestAnimationFrame(Animate_3);
	animation_cur = 3;
}
window.Animate_3 = Animate_3;

function Animate_4() 
{
	cancel_all();
	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.01;
	mesh.rotation.z += 0.01;
	render();
	animate4 = requestAnimationFrame(Animate_4);
	animation_cur = 4;
}
window.Animate_4 = Animate_4;

const position_x = mesh.position.x;
const position_y = mesh.position.y;
var check = 0;
function Animate_5() 
{
	cancel_all();
	var positionx = mesh.position.x;
	var positiony = mesh.position.y;
	if (positiony < position_y + 30 && check == 0)
	{
		mesh.position.y += 0.3;
	}
	if (positiony > position_y + 30 && positionx < position_x + 30) 
	{
		mesh.position.x += 0.3;
	}
	if (positiony > position_y + 30 && positionx > position_x + 30) check += 1;
	if (check > 1 && positiony > position_y)
	{
		mesh.position.y -= 0.3;
	}
	if (check > 1 && positiony < position_y && positionx > position_x)
	{
		mesh.position.x -= 0.3;
	}
	if (positiony < position_y && positionx < position_x) check = 0;
	mesh.rotation.y += 0.01;
	render();
	animate5 = requestAnimationFrame(Animate_5);
	animation_cur = 5;
}
window.Animate_5 = Animate_5;

var check2 = 0;
function Animate_6() 
{
	cancel_all();
	var positiony = mesh.position.y;
	if (positiony < position_y + 30 && check2 == 0) 
	{ 
		mesh.position.y += 0.3;
		mesh.rotation.y += 0.05;
	}
	if (positiony > position_y + 30) check2 += 1;
	if (check2 > 1 && positiony > position_y) 
	{ 
		mesh.position.y -= 0.3;
		mesh.rotation.y += 0.05;
	}
	if (positiony < position_y) check2 = 0;
	render();
	animate6 = requestAnimationFrame(Animate_6);
	animation_cur = 6;
}
window.Animate_6 = Animate_6;

function Pause() 
{
	switch (animation_cur)
	{
		case 0:
			alert("Animation is off !");
			break;
		case 1:
			cancelAnimationFrame(animate1);
			break;
		case 2:
			cancelAnimationFrame(animate2);
			break;
		case 3:
			cancelAnimationFrame(animate3);
			break;
		case 4:
			cancelAnimationFrame(animate4);
			break;
		case 5:
			cancelAnimationFrame(animate5);
			break;
		case 6:
			cancelAnimationFrame(animate6);
			break;
	}
}
window.Pause = Pause;

function Play() 
{
	switch (animation_cur)
	{
		case 0:
			alert("Animation is off !");
			break;
		case 1:
			Animate_1();
			break;
		case 2:
			Animate_2();
			break;
		case 3:
			Animate_3();
			break;
		case 4:
			Animate_4();
			break;
		case 5:
			Animate_5();
			break;
		case 6:
			Animate_6();
			break;
	}
}
window.Play = Play;

function Reset() 
{
	animation_cur = 0;
	cancel_all();
	RenderGeo(temp_id);
	SetColor();
}
window.Reset = Reset;

function Texture(mat) 
{
	mesh = scene.getObjectByName("mesh1");

	var loader = new THREE.TextureLoader();

	if (mesh) 
	{
		const dummy_mesh = mesh.clone();
		scene.remove(mesh);

		switch (mat) 
		{
			case 1:
				material = new THREE.MeshPhongMaterial({

                    map: loader.load("./images/texture1.jpg"),

                });
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 2:
				material = new THREE.MeshPhongMaterial({

                    map: loader.load("./images/texture2.jpg"),

                });
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 3:
				material = new THREE.MeshPhongMaterial({

                    map: loader.load("./images/texture3.jpg"),

                });
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 4:
				material = new THREE.MeshPhongMaterial({

					map: loader.load("./images/texture4.jpg"),

				});
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
			case 5:
				material = new THREE.MeshPhongMaterial({

					map: loader.load("./images/texture5.jpg"),

				});
				mesh = new THREE.Mesh(dummy_mesh.geometry, material);
				CloneMesh(dummy_mesh);
				break;
		}
		render();
	}
}
window.Texture = Texture

function setLightType(lightType) {
    // Xóa ánh sáng hiện có khỏi scene
    scene.remove(light);

    // Tạo ánh sáng mới tương ứng với loại được chọn
    switch (lightType) {
        case 'point':
            light = new THREE.PointLight(0xffffff);
            light.position.set(45, 75, 45);
            light.castShadow = true;
            scene.add(light);
            break;
        case 'ambient':
			// light = new THREE.AmbientLight( 0x404040 , 10); // soft white light
			// scene.add( light );

            light = new THREE.AmbientLight(0x404040, 100); // soft white light
            scene.add(light);
            break;
        case 'directional':
            light = new THREE.DirectionalLight(0xffffff);
            scene.add(light);
            break;
        case 'spot':
            light = new THREE.SpotLight(0xffffff);
            light.position.set(100, 1000, 100);
            light.castShadow = true;
            light.shadow.camera.near = 500;
            light.shadow.camera.far = 4000;
            light.shadow.camera.fov = 30;
            scene.add(light);
            break;
        default:
            console.error('Invalid light type');
            return;
    }

    render(); // Gọi hàm render để cập nhật scene
}
window.setLightType = setLightType


//load model 

// const modelURLs = {
//     "Model1": "./ururu/scene.gltf",
//     "Model2": "https://example.com/models/model2.glb",
//     "Model3": "https://example.com/models/model3.glb",
//     "Model4": "https://example.com/models/model4.glb",
//     "Model5": "https://example.com/models/model5.glb"
// };

// // Load Model Function
// function LoadModel(modelName) {
//     const url = modelURLs[modelName];
//     if (url) {
//         const loader = new GLTFLoader();

//         loader.load(
//             url,
//             function (gltf) {
//                 clearScene(); // Remove any previous model
//                 scene.add(gltf.scene);
//                 gltf.scene.position.set(0, 0, 0);
//                 console.log(`Loaded model: ${modelName}`);
//             },
//             undefined,
//             function (error) {
//                 console.error(`Error loading model: ${error}`);
//             }
//         );
//     } else {
//         console.error(`Model URL for ${modelName} not found.`);
//     }
// }

// // Clear previous models
// function clearScene() {
//     while (scene.children.length > 1) {
//         scene.remove(scene.children[1]);
//     }
// }

// Export the LoadModel function for use in HTML
// window.LoadModel = LoadModel;