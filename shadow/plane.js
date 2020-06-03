var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerP1, markerP2, markerP3;

var normal, plane;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
				
	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResizeElement()	
		arToolkitSource.copyElementSizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'https://raw.githubusercontent.com/atallaa/ARTest/master/shadow/data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerPs
	////////////////////////////////////////////////////////////

	// build markerControls
	markerP1 = new THREE.Group();
	scene.add(markerP1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerP1, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P1.patt",
	});

	markerP2 = new THREE.Group();
	scene.add(markerP2);
	let markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, markerP2, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P2.patt",
	})

	markerP3 = new THREE.Group();
	scene.add(markerP3);
	let markerControls3 = new THREEx.ArMarkerControls(arToolkitContext, markerP3, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P3.patt",
	})

	////////////////////////////////////////////////////////////
	// setup scene
	////////////////////////////////////////////////////////////
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	scene.add(normal);
	scene.add(plane);

}

function Plane()
{
	// --- Here we remove the outdated normal and plane.
	scene.remove(normal);
	scene.remove(plane);

	// --- Then we get the coordinates of the markers
	var wp1, wp2, wp3;
	var points = new Array();
	if (markerP1.visible)
	{
		wp1 = markerP1.getWorldPosition();
		points.push(wp1);
		console.log("P1 World position: " + wp1.getComponent(0)+", "+ wp1.getComponent(1)+", "+ wp1.getComponent(2));
	}
	if (markerP2.visible)
	{
		wp2 = markerP2.getWorldPosition();
		points.push(wp2);
		console.log("P2 World position: " + wp2.getComponent(0)+", "+ wp2.getComponent(1)+", "+ wp2.getComponent(2));
	}
	if (markerP3.visible)
	{
		wp3 = markerP3.getWorldPosition();
		points.push(wp3);
		console.log("P3 World position: " + wp3.getComponent(0)+", "+ wp3.getComponent(1)+", "+ wp3.getComponent(2));
	}

	// --- Here we calculate the coordinates and the dimensions of the plan
	var planeX = (wp1.getComponent(0) + wp2.getComponent(0) + wp3.getComponent(0))/3;
	var planeY = (wp1.getComponent(1) + wp2.getComponent(1) + wp3.getComponent(1))/3;
	var planeZ = (wp1.getComponent(2) + wp2.getComponent(2) + wp3.getComponent(2))/3;
	var planeCoordinates = new THREE.Vector3(planeX, planeY, planeZ);

	var distanceP1 = math.sqrt(math.pow((planeCoordinates.getComponent(0) - wp1.getComponent(0)),2)+math.pow((planeCoordinates.getComponent(1) - wp1.getComponent(1)),2) + math.pow((planeCoordinates.getComponent(2) - wp1.getComponent(2)),2));
	var distanceP2 = math.sqrt(math.pow((planeCoordinates.getComponent(0) - wp2.getComponent(0)),2)+math.pow((planeCoordinates.getComponent(1) - wp2.getComponent(1)),2) + math.pow((planeCoordinates.getComponent(2) - wp2.getComponent(2)),2));
	var distanceP3 = math.sqrt(math.pow((planeCoordinates.getComponent(0) - wp3.getComponent(0)),2)+math.pow((planeCoordinates.getComponent(1) - wp3.getComponent(1)),2) + math.pow((planeCoordinates.getComponent(2) - wp3.getComponent(2)),2));
	var planeSize = 2*math.max(distanceP1, distanceP2, distanceP3);

	// --- We create the geometries for the normal and the plane
	var geometryNormal = new THREE.Geometry();
	var materialNormal = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );
	var geometry = new THREE.PlaneGeometry( planeSize, planeSize, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
	material.opacity = 0.3;

	// --- Here we calculate the normale.
	let v12 = [wp2.getComponent(0)-wp1.getComponent(0), wp2.getComponent(1)-wp1.getComponent(1), wp2.getComponent(2)-wp1.getComponent(2)]; 
	let v13 = [wp3.getComponent(0)-wp1.getComponent(0), wp3.getComponent(1)-wp1.getComponent(1), wp3.getComponent(2)-wp1.getComponent(2)]; 
	let normDir = math.cross(v12, v13);
	let norm = math.add([normDir[0], normDir[1], normDir[2]], [planeCoordinates.getComponent(0), planeCoordinates.getComponent(1), planeCoordinates.getComponent(2)])
	let n = new THREE.Vector3(norm[0], norm[1], norm[2]);
	geometryNormal.vertices.push(planeCoordinates);
	geometryNormal.vertices.push(n);
	//console.log("n vector: " + n.getComponent(0)+", "+ n.getComponent(1)+", "+ n.getComponent(2));

	// -- Finally we create the scene
	plane = new THREE.Mesh( geometry, material );
	normal = new THREE.Line( geometryNormal, materialNormal);
	scene.add(plane);
	plane.position.x = planeX;
	plane.position.y = planeY;
	plane.position.z = planeZ;
	plane.lookAt(n);
	scene.add(normal);
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
	Plane();

}

function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}