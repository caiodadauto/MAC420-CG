var canvas;
var gl;
var context;
var theta = 0.0;
var theta1 = 0.0;
var centerLoc;
var thetaLoc;
var centerX;
var centerY;

window.onload = function init(){

    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl )
        alert( "WebGL isn't available" );

    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;
 
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth || 
            canvas.height != displayHeight){

        // Make the canvas the same size
        if(displayWidth > displayHeight){
            canvas.width  = displayHeight;
            canvas.height = displayHeight;
        }
        else{
            canvas.width  = displayWidth;
            canvas.height = displayWidth;
        
        }
    }
    //
    //  Configure WebGL
    //
    gl.viewport( 0.5, 0.5, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vertices = [
        vec2(  0,  0.5 ),
        vec2(  -0.5,  0 ),
        vec2( -1,  0.5 ),
        vec2(  -0.5, 1 ),

        vec2(  0,  -0.5 ),
        vec2(  0.5,  0 ),
        vec2( 1,  -0.5 ),
        vec2(  0.5, -1 ),
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation( program, "theta" );
    centerLoc = gl.getUniformLocation( program, "center" );
    alert("oi");
    render();
};


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    theta += 0.1;
    gl.uniform1f( thetaLoc, theta );
    centerX = -0.5;
    centerY = 0.5;
    gl.uniform2f( centerLoc, centerX, centerY );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    theta1 -= 0.1;
    gl.uniform1f( thetaLoc, theta1 );
    centerX = 0.5;
    centerY = -0.5;
    gl.uniform2f( centerLoc, centerX, centerY );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );
    window.requestAnimFrame(render);
}
