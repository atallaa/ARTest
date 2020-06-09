var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerP1, markerP2, markerP3;

var normal, xLine, yLine;

var treeGroup;

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
				
	camera = new THREE.Camera();
	scene.add(camera);
	let ambientLight = new THREE.AmbientLight( 0x666666 );
	scene.add(ambientLight);

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

	markerP4 = new THREE.Group();
	scene.add(markerP4);
	let markerControls4 = new THREEx.ArMarkerControls(arToolkitContext, markerP4, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P4.patt",
	})


	////////////////////////////////////////////////////////////
	// setup scene
	////////////////////////////////////////////////////////////
	
	// -- Définition du plan et de la normale
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;
	scene.add(normal);
	scene.add(xLine);
	scene.add(yLine);

	// -- Creation of the tree for P4
	////////////////////		
	// Creating trees //
	////////////////////
	treeGroup = new THREE.Group();
	let loader = new THREE.TextureLoader();
	let trunk = loader.load("images/bark.jpg");
	let leaves = loader.load("images/green-leaves.jpg");	
	// Creating the trunk
	let geometry = new THREE.CylinderGeometry( 0.10, 0.15, 1, 32 );
	let material = new THREE.MeshLambertMaterial( {map: trunk} );
	cylinderMesh = new THREE.Mesh( geometry, material );
	cylinderMesh.position.y = 0.5;
	cylinderMesh.castShadow = true;
	cylinderMesh.receiveShadow = true;
	treeGroup.add( cylinderMesh );
	// Creating the leaves
	let spheregeometry = new THREE.SphereGeometry( 0.6, 150 , 150);
	let spherematerial = new THREE.MeshLambertMaterial( {map: leaves} );
	sphereMesh = new THREE.Mesh( spheregeometry, spherematerial );
	sphereMesh.position.y = 1.5;
	sphereMesh.castShadow = true;
	sphereMesh.receiveShadow = true;
	treeGroup.add( sphereMesh );

	scene.add(treeGroup);

}

function Plane()
{
	// --- Here we remove the outdated normal and plane.
	scene.remove(normal);
	scene.remove(xLine);
	scene.remove(yLine);

	// --- Then we get the coordinates of the markers
	var wp1, wp2, wp3;
	var points = new Array();
	if (markerP1.visible)
	{
		wp1 = markerP1.getWorldPosition();
		points.push(wp1);
		console.log("P1 World position: " + wp1.getComponent(0)+", "+ wp1.getComponent(1)+", "+ wp1.getComponent(2));
		console.log(markerP1.matrix.elements);
	}
	if (markerP2.visible)
	{
		wp2 = markerP2.getWorldPosition();
		points.push(wp2);
		//console.log("P2 World position: " + wp2.getComponent(0)+", "+ wp2.getComponent(1)+", "+ wp2.getComponent(2));
	}
	if (markerP3.visible)
	{
		wp3 = markerP3.getWorldPosition();
		points.push(wp3);
		//console.log("P3 World position: " + wp3.getComponent(0)+", "+ wp3.getComponent(1)+", "+ wp3.getComponent(2));
	}

	// --- Here we calculate the normal.
	let v12 = [wp2.getComponent(0)-wp1.getComponent(0), wp2.getComponent(1)-wp1.getComponent(1), wp2.getComponent(2)-wp1.getComponent(2)]; 
	let v13 = [wp3.getComponent(0)-wp1.getComponent(0), wp3.getComponent(1)-wp1.getComponent(1), wp3.getComponent(2)-wp1.getComponent(2)]; 
	let normalDir = math.cross(v12, v13);
	let normalNorm = math.sqrt(math.pow(normalDir[0],2) + math.pow(normalDir[1],2) + math.pow(normalDir[2],2));
	let normalVector = new THREE.Vector3(normalDir[0]/normalNorm, normalDir[1]/normalNorm, normalDir[2]/normalNorm);

	// --- Here we calculate the X line
	let normX = math.sqrt(math.pow(v12[0],2) + math.pow(v12[1],2) + math.pow(v12[2],2));
	let xVector = new THREE.Vector3(v12[0]/normX, v12[1]/normX, v12[2]/normX);

	// --- Here we calculate the Y line
	let yDir = math.cross([normalVector.getComponent(0), normalVector.getComponent(1), normalVector.getComponent(2)],[xVector.getComponent(0), xVector.getComponent(1), xVector.getComponent(2)]);
	let yNorm = math.sqrt(math.pow(yDir[0],2) + math.pow(yDir[1],2) + math.pow(yDir[2],2));
	let yVector = new THREE.Vector3(yDir[0]/yNorm, yDir[1]/yNorm, yDir[2]/yNorm);

	// --- Finally we create the scene
	normal = new THREE.ArrowHelper( normalVector, wp1, 1, 0xff0000);
	xLine = new THREE.ArrowHelper(xVector, wp1, 1, 0x0000ff);
	yLine = new THREE.ArrowHelper(yVector, wp1, 1, 0x00ff00);
	scene.add(normal);
	scene.add(xLine);
	scene.add(yLine);
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	// -- Test for the position of the tree without a marker
	if (markerP4.visible)
	{
		wp4 = markerP4.getWorldPosition();
		//console.log("P1 World position: " + wp4.getComponent(0)+", "+ wp4.getComponent(1)+", "+ wp4.getComponent(2));
		treeGroup.position.x = wp4.getComponent(0);
		treeGroup.position.y = wp4.getComponent(1);
		treeGroup.position.z = wp4.getComponent(2);
	}

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