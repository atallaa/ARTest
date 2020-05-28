var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerP1, markerP2, markerP3;

var material1, mesh1;

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
			
	let treeGroup = new THREE.Group();
	let loader = new THREE.TextureLoader();
	let trunk = loader.load("images/bark.jpg");
	let leaves = loader.load("images/green-leaves.jpg");

	let sgeometry = new THREE.PlaneGeometry( 2, 2);
	let smaterial = new THREE.MeshLambertMaterial( 0xffffff );
	smaterial.opacity = 0.5;
	sMesh = new THREE.Mesh( sgeometry, smaterial );
	scene.add(sMesh);


	let ambientLight = new THREE.AmbientLight( 0x666666, 1);
	scene.add( ambientLight );
}

function update()
{
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );

	var wp1, wp2, wp3;
	var points = new Array();
	
	if (markerP1.visible)
	{
		wp1 = markerP1.getWorldPosition();
		points.push(wp1);
		//console.log("P1 World position: " + wp.getComponent(0)+", "+ wp.getComponent(1)+", "+ wp.getComponent(2));
	}
	if (markerP2.visible)
	{
		wp2 = markerP2.getWorldPosition();
		points.push(wp2);
		//console.log("P2 World position: " + wp.getComponent(0)+", "+ wp.getComponent(1)+", "+ wp.getComponent(2));
	}
	if (markerP3.visible)
	{
		wp3 = markerP3.getWorldPosition();
		points.push(wp3);
		//console.log("P3 World position: " + wp.getComponent(0)+", "+ wp.getComponent(1)+", "+ wp.getComponent(2));
	}

	sMesh.position.x=(wp1.getComponent(0)+wp2.getComponent(0)+wp3.getComponent(0))/3;
	sMesh.position.y=(wp1.getComponent(1)+wp2.getComponent(1)+wp3.getComponent(1))/3;
	sMesh.position.z=(wp1.getComponent(2)+wp2.getComponent(2)+wp3.getComponent(2))/3;

	sMesh.lookAt(normalPlane(points));
}

function normalPlane(points)
{
	var a, b, D;
	var Exx, Eyy, Exy, Eyz, Exz; 
	var X = new Array();
	var Y = new Array(); 
	var Z = new Array();

	points.forEach(function (point, i) {
		X.push(point.getComponent(0));
		Y.push(point.getComponent(1));
		Z.push(point.getComponent(2));
	});

	Exx = math.dot(X,X);
	Eyy = math.dot(Y,Y);
	Exy = math.dot(X,Y);
	Eyz = math.dot(Y,Z);
	Exz = math.dot(X,Z);

	D = Exx * Eyy - Exy * Exy;
	a = Eyz * Exy - Exz * Eyy;
	b = Exy * Exz - Exx * Eyz;

	console.log("normal("+a+","+b+","+D+")");

	let normal = new THREE.Vector3(a,b,D);
	return normal;
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