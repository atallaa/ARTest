var scene, camera, renderer, clock, deltaTime, totalTime, table;
var arToolkitSource, arToolkitContext;
var xLine, yLine, zLine, treeGroup, treeClone;
var markerP1, markerP2, trihedralGroup;
var Position;
var mesh;
var growthIteration = 3;
var markerTable = [];


function onProgress(xhr) { /*console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); */ }
function onError(xhr) { /*console.log( 'An error happened' ); */}

function tree(marker)
// Gives a tree to a specific marker
{
	// Remove the previous tree (the children, if there is one) from the marker.
	for( var i = marker.children.length - 1; i >= 0; i--){
		obj = marker.children[i];
		marker.remove(obj);
	}

	// Add the new tree.
	new THREE.MTLLoader()
		.setPath( 'models/Noyer/' )
		.load( Object.values(table[growthIteration])[2], function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/Noyer/' )
				.load( Object.values(table[growthIteration])[3], function ( group ) {
					mesh = group.children[0];
					mesh.material.side = THREE.DoubleSide;
					mesh.position.y = 0.25;
					mesh.scale.set(0.25,0.25,0.25);
					mesh.castShadow = true;
					mesh.receiveShadow = true;
					marker.add(mesh);
				}, onProgress, onError );
		});
}


d3.csv("models/noyer.csv").then(function(data) {
  	table = Array.from(data);

initialize();
animate();

function initialize()
{
	scene = new THREE.Scene();
	growthIteration = 0;
	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.0 );
	scene.add( ambientLight );
				
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
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
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
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup the markers
	////////////////////////////////////////////////////////////

	// build markerControls
	markerP1 = new THREE.Group();
	scene.add(markerP1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerP1, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P1.patt",
	});

		markerSun = new THREE.Group();
	scene.add(markerSun);
	let markerControlsSun = new THREEx.ArMarkerControls(arToolkitContext, markerSun, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-sun.patt",
	});

	// Tree markers
	markerP2 = new THREE.Group();
	markerP2.name = "Marker P2";
	scene.add(markerP2);
	let markerControls2 = new THREEx.ArMarkerControls(arToolkitContext, markerP2, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P2.patt",
	});
	markerTable.push(markerP2);

	markerP3 = new THREE.Group();
	markerP3.name = "Marker P3";
	scene.add(markerP3);
	let markerControls3 = new THREEx.ArMarkerControls(arToolkitContext, markerP3, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P3.patt",
	});
	markerTable.push(markerP3);

	markerP4 = new THREE.Group();
	markerP4.name = "Marker P4";
	scene.add(markerP4);
	let markerControls4 = new THREEx.ArMarkerControls(arToolkitContext, markerP4, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P4.patt",
	});
	markerTable.push(markerP4);

	markerP5 = new THREE.Group();
	markerP5.name = "Marker P5";
	scene.add(markerP5);
	let markerControls5 = new THREEx.ArMarkerControls(arToolkitContext, markerP5, {
		type: 'pattern', patternUrl: "https://raw.githubusercontent.com/atallaa/ARTest/master/Pattern/pattern-P5.patt",
	});
	markerTable.push(markerP5);



	////////////////////////////////////////////////////////////
	// setting up the scene
	////////////////////////////////////////////////////////////
	
	renderer.shadowMap.enabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	//////////////////////
	// Creating the tree //
	//////////////////////
	tree(markerP2);
	tree(markerP3);

	//////////////////////
	// Creating the sun //
	//////////////////////
	let lightGroup = new THREE.Group();

	// Creating the floor for the shadows
	let floorGeometry = new THREE.PlaneGeometry( 20,20 );
	let floorMaterial = new THREE.ShadowMaterial();
	floorMaterial.opacity = 0.4;
	let floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );
	floorMesh.rotation.x = -Math.PI/2;
	floorMesh.receiveShadow = true;
	lightGroup.add( floorMesh );

	// Creating the light
	let light = new THREE.PointLight( 0xffffff, 2, 100 );
	light.position.set( 0,2,0 ); // default; light shining from top
	light.castShadow = true;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	lightGroup.add( light );
	
	let lightSphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.1),
		new THREE.MeshBasicMaterial({
			color: 0xffffff, 
			transparent: true,
			opacity: 0
		})
	);
	lightSphere.position.copy( light.position );
	lightGroup.add( lightSphere );
	markerSun.add( lightGroup );

	// --- Creating the trihedral
	trihedralGroup = new THREE.Group();
	let zVector = new THREE.Vector3();
	let xVector = new THREE.Vector3();
	let yVector = new THREE.Vector3();
	let wp1 = markerP1.getWorldPosition();
	zVector = markerP1.up;
	markerP1.getWorldDirection(xVector);
	yVector.fromArray(math.cross(zVector.toArray(), xVector.toArray()));

	zLine = new THREE.ArrowHelper(zVector, wp1, 1, 0xff0000);
	xLine = new THREE.ArrowHelper(xVector, wp1, 1, 0x0000ff);
	yLine = new THREE.ArrowHelper(yVector, wp1, 1, 0x00ff00);
	trihedralGroup.add(zLine);
	trihedralGroup.add(xLine);
	trihedralGroup.add(yLine);
	markerP1.add(trihedralGroup);
		
}
});


function transformation(marker)
// --- We get the position of the Marker when our trihedral is the new basis and origin of the coordinate system.
{
	// --- Here we calculate the 3 vectors of the new basis.
	let xDir = new THREE.Vector3().fromArray(math.subtract(xLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	let yDir = new THREE.Vector3().fromArray(math.subtract(yLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	let zDir = new THREE.Vector3().fromArray(math.subtract(zLine.cone.getWorldPosition().toArray(), markerP1.getWorldPosition().toArray()));
	
	// --- Here we translate the origin.
	let WorldPosition = marker.getWorldPosition();
	let P1WorldPosition = markerP1.getWorldPosition();
	let RealPosition = new THREE.Vector3();
	RealPosition.fromArray(math.subtract(WorldPosition.toArray(), P1WorldPosition.toArray()));

	// --- And finally, we change the basis.
	let transformationMatrix = math.matrix([xDir.toArray(), yDir.toArray(), zDir.toArray()]);
	let FinalPosition = math.multiply(transformationMatrix, RealPosition.toArray());
	return FinalPosition;
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	transformation(markerP2);
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


// Function to execute for the growth button 
function growth() {
	// We modify every visible tree in the scene :
    for(let i=0 ; i < (markerTable.length); i++) {
      	tree(markerTable[i]);
    }

    //We increment the years, until we reach the 5th iteration.
	if(growthIteration==5){
		growthIteration=0;
	} else {
		growthIteration++;  
	}       
}

// Function for the save button
function save() {

	var positionTable = [];

     for(let i=0 ; i < (markerTable.length); i++) {
     	if(markerTable[i].visible) {
      		var position = transformation(markerTable[i]).toArray();
      		var marker = {marker: markerTable[i], position: position};
      		positionTable.push(marker);
      	}
    }
    console.log(positionTable);
 
}
