var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerP1, markerP2, markerP3;

var material1, mesh1;

var line12, line13, normal;

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
	line12 = new THREE.Line();
	line13 = new THREE.Line();
	normal = new THREE.Line();
	scene.add(line12);
	scene.add(line13);
	scene.add(normal);

}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	scene.remove(line12);
	scene.remove(line13);
	scene.remove(normal);
	var wp1, wp2, wp3;
	var points = new Array();
	var geometry12 = new THREE.Geometry();
	var geometry13 = new THREE.Geometry();
	var geometryNormal = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
	var materialNormal = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 5 } );

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

	geometry12.vertices.push(wp1);
	geometry12.vertices.push(wp2);
	line12 = new THREE.Line( geometry12, material);
	scene.add( line12 );
	geometry13.vertices.push(wp1);
	geometry13.vertices.push(wp3);
	line13 = new THREE.Line( geometry13, material);
	scene.add( line13 );

	let v12 = [wp2.getComponent(0)-wp1.getComponent(0), wp2.getComponent(1)-wp1.getComponent(1), wp2.getComponent(2)-wp1.getComponent(2)]; 
	let v13 = [wp3.getComponent(0)-wp1.getComponent(0), wp3.getComponent(1)-wp1.getComponent(1), wp3.getComponent(2)-wp1.getComponent(2)]; 
	let normDir = math.cross(v12, v13);
	let norm = math.add([normDir[0], normDir[1], normDir[2]], [wp1.getComponent(0), wp1.getComponent(1), wp1.getComponent(2)])
	let n = new THREE.Vector3(norm[0], norm[1], norm[2]);
	geometryNormal.vertices.push(wp1);
	geometryNormal.vertices.push(n);
	console.log("n vector: " + n.getComponent(0)+", "+ n.getComponent(1)+", "+ n.getComponent(2));

	normal = new THREE.Line( geometryNormal, materialNormal);
	scene.add(normal);
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