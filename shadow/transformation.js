var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var xLine, yLine, zLine;
var markerP1, markerP2, trihedralGroup;

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


	////////////////////////////////////////////////////////////
	// setup scene
	////////////////////////////////////////////////////////////
	
	// -- Définition du plan et de la normale
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	// -- Creation of the tree for P4
	////////////////////		
	// Creating trees //
	////////////////////
	let treeGroup = new THREE.Group();
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
	markerP2.add( treeGroup );

	// --- Creating the trihedral
	trihedralGroup = new THREE.Group();
	let zVector = new THREE.Vector3();
	let xVector = new THREE.Vector3();
	let yVector = new THREE.Vector3();
	let wp1 = markerP1.getWorldPosition();
	zVector = markerP1.up;
	//console.log("Z Vector :" + zVector.toArray());
	markerP1.getWorldDirection(xVector);
	//console.log("X Vector :" + xVector.toArray());
	yVector.fromArray(math.cross(zVector.toArray(), xVector.toArray()));
	//console.log("Y Vector :" + yVector.toArray());

	zLine = new THREE.ArrowHelper(zVector, wp1, 1, 0xff0000);
	xLine = new THREE.ArrowHelper(xVector, wp1, 1, 0x0000ff);
	yLine = new THREE.ArrowHelper(yVector, wp1, 1, 0x00ff00);
	trihedralGroup.add(zLine);
	trihedralGroup.add(xLine);
	trihedralGroup.add(yLine);
	markerP1.add(trihedralGroup);


}

function transformation()
// --- We get the position of the P2 Marker when our trihedral is the new basis and origin of the coordinate system.

{
	// --- Here we calculate the 3 vectors of the new basis.
	let xDir = new THREE.Vector3().fromArray(math.subtract(xLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	let yDir = new THREE.Vector3().fromArray(math.subtract(yLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	let zDir = new THREE.Vector3().fromArray(math.subtract(zLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	
	// --- Here we translate the origin.
	let P2WorldPosition = markerP2.getWorldPosition();
	let P1WorldPosition = markerP1.getWorldPosition();
	let P2RealPosition = new THREE.Vector3();
	P2RealPosition.fromArray(math.subtract(P2WorldPosition.toArray(), P1WorldPosition.toArray()));

	// --- And finally, we change the basis.
	let transformationMatrix = math.matrix([xDir.toArray(), yDir.toArray(), zDir.toArray()]);
	let P2FinalPosition = math.multiply(transformationMatrix, P2RealPosition.toArray());
	
	document.getElementById("coordinates").innerHTML = P2FinalPosition;
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	transformation();
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