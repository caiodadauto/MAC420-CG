
    var gl;
    function initGL() {
        try {
            gl = WebGLUtils.setupWebGL( canvas );
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    };

    var shaderProgram;

    function setupShaders() {
		shaderProgram = initShaders( gl, "shader-vs", "shader-fs" );

        gl.useProgram(shaderProgram);

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.translation = gl.getUniformLocation(shaderProgram, "u_Translation");
		shaderProgram.scale = gl.getUniformLocation(shaderProgram, "u_Scale");
		shaderProgram.theta = gl.getUniformLocation(shaderProgram, "u_Theta" );
    };

    var triangleVertexPositionBuffer;
    var squareVertexPositionBuffer;

    function initBuffers() {
        triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
             0.25,  0.25,  0.0,
            -0.25,  0.25,  0.0,
             0.25, -0.25,  0.0,
            -0.25, -0.25,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 4;

        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             0.25,  0.25,  0.0,
            -0.25,  0.25,  0.0,
             0.25, -0.25,  0.0,
            -0.25, -0.25,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;
    };

	var theta = 0.0;
	var beta = 0.0;
	
    function drawScene() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


		// The scaling factor
		var Sx = gl.viewportWidth / gl.viewportHeight, Sy = gl.viewportHeight / gl.viewportWidth, Sz = 1.0;

		theta += 0.02;
		beta  -= 0.02;

			
		// The translation distance for x, y, and z direction
		var Tx = -0.5, Ty = 0.0, Tz = 0.0;
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniform4f(shaderProgram.translation, Tx, Ty, Tz, 0.0);
		gl.uniform4f(shaderProgram.scale, Sx, Sy, Sz, 1.0);
		gl.uniform1f( shaderProgram.theta, theta );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangleVertexPositionBuffer.numItems);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniform4f(shaderProgram.translation, Tx * -1, Ty, Tz, 0.0);//translate to the right
		gl.uniform4f(shaderProgram.scale, Sx, Sy, Sz, 1.0);
        gl.uniform1f( shaderProgram.theta, beta );
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		
		window.requestAnimFrame(drawScene);
    };

	var canvas;
	function init() {
		canvas = document.getElementById("lesson01-canvas");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
        initGL();
        setupShaders();
        initBuffers();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);	
	};

	function windowResized() {
		//theta = 0.0;
		//beta  = 0.0;
		
		init();
	};
	
	function webGLStart() {
		init();
        drawScene();
    };

	window.onload = webGLStart;
	window.onresize = windowResized;