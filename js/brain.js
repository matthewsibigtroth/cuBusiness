

/*
SHADERS_ENABLED = true;
NUM_INITIAL_CUBES = 50;
NUM_SPAWN_CUBES = 10;
DOT_SHADER_SPACING = 3;
DOT_SHADER_SIZE = 1;
DOT_SHADER_BLUR = 1.5;
BLUR_SHADER_AMOUNT = 1.2;
BLEND_SHADER_AMOUNT = 1.9;
*/


SHADERS_ENABLED = true;
FLOCKING_ENABLED = true;
NUM_INITIAL_CUBES = 50;
NUM_SPAWN_CUBES = 10;
DOT_SHADER_SPACING = 10;
DOT_SHADER_SIZE = 1;
DOT_SHADER_BLUR = 7.75;
BLUR_SHADER_AMOUNT = 1.2;
BLEND_SHADER_AMOUNT = 1.9;
Z_CAMERA = 400;

function Init()
{
	CreateBrain();
}

function CreateBrain()
{
	Brain_ = new Brain();
}


///////////////////////////////////////////////////////////

function Brain()
{
	var self = this;
	
	self.Init = function()
	{
		self.CreateGlInterface();
		self.CreateInitialCubes();
		self.CreateBoids();
	}

	self.CreateGlInterface = function()
	{
		self.GlInterface_ = new GlInterface(self);
	}

	self.CreateInitialCubes = function()
	{
		self.Cubes = [];
		
		for (var i=0; i<NUM_INITIAL_CUBES; i++)
		{
			var Cube_ = self.CreateInitialCube();
			self.Cubes.push(Cube_);
		}
	
	}
	
	self.CreateInitialCube = function()
	{
		var Cube_ = new Cube(self);
		self.GlInterface_.scene.add(Cube_.glShape);
		self.GlInterface_.objects.push(Cube_.glShape);

		var x_new = Math.random()*400-200;
		var y_new = Math.random()*200-100;
		var z_new = Math.random()*200-100;
		var rotationX_new = Math.random()*360;
		var rotationY_new = Math.random()*360;
		var rotationZ_new = Math.random()*360;

		if (FLOCKING_ENABLED == false)
		{
			Cube_.MoveTo(x_new, y_new, z_new, 2000);
			Cube_.RotateTo(rotationX_new, rotationY_new, rotationZ_new, 2000);
		}

		return Cube_;
	}

	self.CreateBoids = function()
	{
		boids = []
		for ( var i = 0; i < self.Cubes.length; i ++ ) 
		{
			self.CreateBoid(i);
		}
	}

	self.CreateBoid = function(index_cube)
	{
		boid = boids[ index_cube ] = new Boid(self.Cubes[index_cube].glShape);
		boid.position.x = self.Cubes[index_cube].x;
		boid.position.y = self.Cubes[index_cube].y;
		boid.position.z = self.Cubes[index_cube].z;
		boid.velocity.x = Math.random() * 2 - 1;
		boid.velocity.y = Math.random() * 2 - 1;
		boid.velocity.z = Math.random() * 2 - 1;
		boid.setAvoidWalls( true );
		boid.setWorldSize( 800, 600, 400 );	
	}


	///////////////////////////////////////
	//callbacks
	///////////////////////////////////////

	self.OnMouseOver_object = function(object)
	{
		var ObjectOwner = self.FindObjectOwner(object);
		if (ObjectOwner != null) {ObjectOwner.OnMouseOver_self();}
	}
	
	self.OnMouseOut_object = function(object)
	{
		var ObjectOwner = self.FindObjectOwner(object);
		if (ObjectOwner != null) {ObjectOwner.OnMouseOut_self();}
	}

	self.OnMouseUp_object = function(object)
	{
		var ObjectOwner = self.FindObjectOwner(object);
		if (ObjectOwner != null) {ObjectOwner.OnMouseUp_self();}
	}

	self.OnMouseUp_cube = function(Cube_mousedUp)
	{
		this.SpawnCubesFromCube(Cube_mousedUp);
	}
	

	///////////////////////////////////////
	//utilities
	///////////////////////////////////////

	self.FindObjectOwner = function(object)
	{
		var ObjectOwner = this.FindCubeObject(object);
		return ObjectOwner;
	}

	self.FindCubeObject = function(object)
	{
		for (var i=0; i<self.Cubes.length; i++)
		{
			if (self.Cubes[i].glShape == object)
			{
				return self.Cubes[i];
			}
		}
		return null;
	}

	self.SpawnCubesFromCube = function(Cube_toSpawnFrom)
	{
		var numCubesToSpawn = NUM_SPAWN_CUBES;
		for (var i=0; i<numCubesToSpawn; i++)
		{
			var Cube_ = self.SpawnCubeFromCube(Cube_toSpawnFrom);
			self.Cubes.push(Cube_);
			self.CreateBoid(self.Cubes.length-1);
		}
	}

	self.SpawnCubeFromCube = function(Cube_toSpawnFrom)
	{
		var Cube_ = new Cube(self);
		self.GlInterface_.scene.add(Cube_.glShape);
		self.GlInterface_.objects.push(Cube_.glShape);

		var x_start = Cube_toSpawnFrom.x;
		var y_start = Cube_toSpawnFrom.y;
		var z_start = Cube_toSpawnFrom.z;

		Cube_.x = x_start;
		Cube_.y = y_start;
		Cube_.z = z_start;

		var x_new = Math.random()*400-200;
		var y_new = Math.random()*200-100;
		var z_new = Math.random()*200-100;
		var rotationX_new = Math.random()*360;
		var rotationY_new = Math.random()*360;
		var rotationZ_new = Math.random()*360;

		Cube_.MoveTo(x_new, y_new, z_new, 2000);
		Cube_.RotateTo(rotationX_new, rotationY_new, rotationZ_new, 3000);
		return Cube_;
	}

	self.UpdateBoids = function()
	{
		try
		{
			for ( var i = 0, il = self.Cubes.length; i < il; i++ ) 
			{
				boid = boids[ i ];
				boid.run( boids );	
				bird = self.Cubes[i].glShape;
				self.Cubes[i].x = boid.position.x;
				self.Cubes[i].y = boid.position.y;
				self.Cubes[i].z = boid.position.z;
			}
		}
		catch(e)
		{
		}
	}

	self.Init();
}


///////////////////////////////////////////////////////////

function GlInterface(Brain)
{
	var self = this;
	self.Brain = Brain;
	
	self.Init = function()
	{
		self.WIDTH=window.innerWidth;
		self.HEIGHT = window.innerHeight;
		self.VIEW_ANGLE = 45;
		self.ASPECT = self.WIDTH / self.HEIGHT;
		self.NEAR = 0.1;
		self.FAR = 10000;
		self.mouse = new THREE.Vector2();
		self.offset = new THREE.Vector3();
		self.INTERSECTED;
		self.SELECTED;
		self.objects = [];

		self.CreateRenderer()
		self.CreateCamera();
		self.CreateProjector();
		self.CreateScene();
		self.CreateLighting();
		self.CreateComposer();

		self.animate();
	}

	self.CreateRenderer = function()
	{
		self.renderer = Detector.webgl? new THREE.WebGLRenderer(): new THREE.CanvasRenderer();
		//self.renderer = new THREE.WebGLRenderer();
		self.renderer.setSize(self.WIDTH, self.HEIGHT);
		$("#container").append(self.renderer.domElement);
		self.renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		self.renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		self.renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	}

	self.CreateCamera = function()
	{
		self.camera = new THREE.PerspectiveCamera(self.VIEW_ANGLE, self.ASPECT, self.NEAR, self.FAR);
		self.camera.position.z = Z_CAMERA;
		$(document).keypress(function(e) {
			var delta = 10;
			if (e.charCode == 119) {self.MoveCamera(0, 0, -delta);}
			if (e.charCode == 97) {self.MoveCamera(-delta, 0, 0);}
			if (e.charCode == 115) {self.MoveCamera(0, 0, delta);}
			if (e.charCode == 100) {self.MoveCamera(delta, 0, 0);}
		});
	}

	self.CreateProjector = function()
	{
		self.projector = new THREE.Projector();
	}

	self.CreateScene = function()
	{
		self.scene = new THREE.Scene();
		self.scene.add(self.camera);
	}

	self.CreateLighting = function()
	{
		self.pointLight = new THREE.PointLight( 0xFFFFFF );
		self.pointLight.position.x = 10;
		self.pointLight.position.y = 50;
		self.pointLight.position.z = 130;
		self.scene.add(self.pointLight);
	}

	self.CreateComposer = function()
	{
		//http://www.airtightinteractive.com/demos/js/ledeffect/
		//common render target params
		var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };

		//Init dotsComposer to render the dots effect
		//A composer is a stack of shader passes combined

		//a render target is an offscreen buffer to save a composer output
		renderTargetDots = new THREE.WebGLRenderTarget( self.WIDTH, self.HEIGHT, renderTargetParameters ); 				
		//dots Composer renders the dot effect
		self.dotsComposer = new THREE.EffectComposer( self.renderer, renderTargetDots );

		var renderPass = new THREE.RenderPass( self.scene, self.camera );
		//a shader pass applies a shader effect to a texture (usually the previous shader output)

		dotMatrixPass = new THREE.ShaderPass( THREE.DotMatrixShader );

		dotMatrixPass.uniforms[ "spacing" ].value = DOT_SHADER_SPACING; 
		dotMatrixPass.uniforms[ "size" ].value = Math.pow(DOT_SHADER_SIZE,2);
		dotMatrixPass.uniforms[ "blur" ].value = Math.pow(DOT_SHADER_BLUR*2,2);

		self.dotsComposer.addPass( renderPass );
		self.dotsComposer.addPass( dotMatrixPass );

		//Init glowComposer renders a blurred version of the scene
		renderTargetGlow = new THREE.WebGLRenderTarget( self.WIDTH, self.HEIGHT, renderTargetParameters ); //1/2 res for performance
		self.glowComposer = new THREE.EffectComposer( self.renderer, renderTargetGlow );

		//create shader passes
		hblurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		vblurPass = new THREE.ShaderPass( THREE.VerticalBlurShader );

		hblurPass.uniforms[ 'h' ].value = BLUR_SHADER_AMOUNT / this.WIDTH*2;
		vblurPass.uniforms[ 'v' ].value = BLUR_SHADER_AMOUNT  / this.HEIGHT*2;

		//fxaa smooths stuff out
		var fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
		fxaaPass.uniforms[ 'resolution' ].value.set( 1 / self.WIDTH, 1 / self.HEIGHT );

		self.glowComposer.addPass( renderPass );
		self.glowComposer.addPass( dotMatrixPass );
		self.glowComposer.addPass( hblurPass );
		self.glowComposer.addPass( vblurPass );

		//blend Composer runs the AdditiveBlendShader to combine the output of dotsComposer and glowComposer
		blendPass = new THREE.ShaderPass( THREE.AdditiveBlendShader );
		blendPass.uniforms[ 'tBase' ].value = self.dotsComposer.renderTarget1;
		blendPass.uniforms[ 'tAdd' ].value = self.glowComposer.renderTarget1;
		blendPass.uniforms[ 'amount' ].value = BLEND_SHADER_AMOUNT;

		self.blendComposer = new THREE.EffectComposer( self.renderer );
		self.blendComposer.addPass( blendPass );
		blendPass.renderToScreen = true;
	}


	///////////////////////////////////////
	//callbacks
	///////////////////////////////////////

	function onDocumentMouseMove( event ) {

		event.preventDefault();

		self.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		self.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 0.5 );
		self.projector.unprojectVector( vector, self.camera );

		var ray = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );


		if ( self.SELECTED ) 
		{
			var intersects = ray.intersectObject( self.plane );
			return;
		}

		var intersects = ray.intersectObjects( self.objects );

		if ( intersects.length > 0 ) 
		{
			if ( self.INTERSECTED != intersects[ 0 ].object ) {

				
				if ( self.INTERSECTED ) self.INTERSECTED.material.color.setHex( self.INTERSECTED.currentHex );

				self.INTERSECTED = intersects[ 0 ].object;
				self.INTERSECTED.currentHex = self.INTERSECTED.material.color.getHex();
			}

			container.style.cursor = 'pointer';

		} 
		else 
		{
			self.INTERSECTED = null;
			container.style.cursor = 'auto';
		}

	}

	function onDocumentMouseDown( event ) 
	{
		event.preventDefault();

		self.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		self.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		var vector = new THREE.Vector3( self.mouse.x, self.mouse.y, 0.5 );
		self.projector.unprojectVector( vector, self.camera );

		var ray = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

		var intersects = ray.intersectObjects( self.objects );


		if ( intersects.length > 0 ) 
		{
			self.SELECTED = intersects[ 0 ].object;
			var intersects = ray.intersectObject( self.plane );
			container.style.cursor = 'move';
		}

	}

	function onDocumentMouseUp( event ) 
	{
		event.preventDefault();

		if ( self.INTERSECTED ) 
		{
			self.SELECTED = null;
			self.OnMouseUp_object(self.INTERSECTED);
		}

		container.style.cursor = 'auto';
	}

	self.OnMouseOver_object = function(object)
	{
		self.Brain.OnMouseOver_object(object);
	}

	self.OnMouseOut_object = function(object)
	{
		self.Brain.OnMouseOut_object(object);
	}

	self.OnMouseUp_object = function(object)
	{
		self.Brain.OnMouseUp_object(object);
	}


	///////////////////////////////////////
	//utilities
	///////////////////////////////////////

	self.animate = function() 
	{
		requestAnimationFrame(self.animate);

		if (FLOCKING_ENABLED == true)
		{
			self.Brain.UpdateBoids();	
		}

		if (SHADERS_ENABLED == true)
		{
			self.dotsComposer.render();
			self.glowComposer.render();
			self.blendComposer.render();
		}
		else
		{
			self.renderer.render(self.scene, self.camera);
		}
		
		TWEEN.update();
	}

	self.MoveCamera = function(x_delta, y_delta, z_delta)
	{
		self.camera.position.x += x_delta;
		self.camera.position.y += y_delta;
		self.camera.position.z += z_delta;
	}

	self.Init();
}


function Cube(Brain)
{
	var self = this;
	self.Brain = Brain;
	
	self.Init = function()
	{
		self.InitPosition();
		self.InitRotation();
		self.InitScale();
		self.CreatePolys();
	}

	self.InitPosition = function()
	{
		self.x = 0;
		self.y = 0;
		self.z = 0;
	}

	self.InitRotation = function()
	{
		self.rotationX = 0;
		self.rotationY = 0;
		self.rotationZ = 0;
	}

	self.InitScale = function()
	{
		self.scaleX = 1;
		self.scaleY = 1;
		self.scaleZ = 1;
	}

	self.CreatePolys = function()
	{
		if (SHADERS_ENABLED == true)
		{
			//var material = new THREE.MeshLambertMaterial({ color: 0xcccccc, shading: THREE.FlatShading });
			var material = new THREE.MeshBasicMaterial({color:0xFFFFFF*Math.random(), blending: THREE.AdditiveBlending, depthTest: false, transparent: true});
		}
		else
		{
			var material = new THREE.MeshLambertMaterial({color: 0xcccccc});
		}
		var radius = 10;
		self.glShape = new THREE.Mesh(new THREE.CubeGeometry(radius, radius, radius), material);
	}

	self.Init();


	///////////////////////////////////////
	//callbacks
	///////////////////////////////////////

	self.OnMouseOver_self = function()
	{
		var scale_new = 1.5;
		var duration = 500;
		self.ScaleTo(scale_new, duration);
	}

	self.OnMouseOut_self = function()
	{
		var scale_new = 1;
		var duration = 300;
		self.ScaleTo(scale_new, duration);
	}	

	self.OnMouseUp_self = function()
	{
		this.Brain.OnMouseUp_cube(self);
	}


	///////////////////////////////////////
	//utilities
	///////////////////////////////////////

	self.MoveTo = function(x_new, y_new, z_new, duration)
	{
		var position = { x:self.x, y:self.y , z:self.z};
		var target = { x:x_new, y:y_new, z:z_new};
		var tween = new TWEEN.Tween(position).to(target, duration)
	            .easing( TWEEN.Easing.Back.Out )
	            .onUpdate( function () 
	            {
	            	self.x = this.x;
	            	self.y = this.y;
	            	self.z = this.z;
	            	self.glShape.position.x = this.x;
	            	self.glShape.position.y = this.y;
	            	self.glShape.position.z = this.z;
	            } )
	            .start();
	}

	self.RotateTo = function(rotationX_new, rotationY_new, rotationZ_new, duration)
	{
		var rotationX_new = rotationX_new * (Math.PI/180);
		var rotationY_new = rotationY_new * (Math.PI/180);
		var rotationZ_new = rotationZ_new * (Math.PI/180);
		var rotation = { rotationX:self.rotationX, rotationY:self.rotationY , rotationZ:self.rotationZ};
		var target = { rotationX:rotationX_new, rotationY:rotationY_new , rotationZ:rotationZ_new};
		var tween = new TWEEN.Tween(rotation).to(target, duration)
	            .easing( TWEEN.Easing.Back.Out )
	            .onUpdate( function () 
	            {
	            	self.rotationX = this.rotationX;
			self.rotationY = this.rotationY;
			self.rotationZ = this.rotationZ;
	            	self.glShape.rotation.x = this.rotationX;
	            	self.glShape.rotation.y = this.rotationY;
	            	self.glShape.rotation.z = this.rotationZ;
	            } )
	            .onComplete( function() 
	            {
			var rotationX_new = Math.random()*360;
			var rotationY_new = Math.random()*360;
			var rotationZ_new = Math.random()*360;
			var duration = 30000;
			self.RotateTo(rotationX_new, rotationY_new, rotationZ_new, duration);
	            })
	            .start();
	}

	self.ScaleTo = function(scale_new, duration)
	{
		var scale = { scaleX:self.scaleX, scaleY:self.scaleY , scaleZ:self.scaleZ};
		var target = { scaleX:scale_new, scaleY:scale_new , scaleZ:scale_new};
		var tween = new TWEEN.Tween(scale).to(target, duration)
	            .easing( TWEEN.Easing.Back.Out )
	            .onUpdate( function () 
	            {
	            	self.scaleX = this.scaleX;
			self.scaleY = this.scaleY;
			self.scaleZ = this.scaleZ;
	            	self.glShape.scale.x = this.scaleX;
	            	self.glShape.scale.y = this.scaleY;
	            	self.glShape.scale.z = this.scaleZ;
	            } )
	            .start();
	}
}


	