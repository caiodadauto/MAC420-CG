//-------------------------------------------------//
//  Nome: Caio Vinicius Dadauto                    //
//  Nusp: 7994808                                  //
//  EP1 - Introducao a computacao grafica          //
//-------------------------------------------------//

var program;
var canvas;
var gl;

var xCenter = 0;
var yCenter = 0;
var zCenter = 0;
var sx = 1;
var sy = 1;
var sz = 1;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

var obj = null;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = vec4(cross(t1, t2), 0);

    pointsArray.push(vertices[a]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[b]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal);   
    pointsArray.push(vertices[a]);  
    normalsArray.push(normal); 
    pointsArray.push(vertices[c]); 
    normalsArray.push(normal); 
    pointsArray.push(vertices[d]); 
    normalsArray.push(normal);    
}

// define faces of a cube
function colorCube(){
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function resizeCanvas() {
   var width = canvas.clientWidth;
   var height = canvas.clientHeight;
   if (canvas.width != width ||
       canvas.height != height) {
     var ratio = height/width
     canvas.width = width;
     canvas.height = height;
     translateObj();
   }
     scaleObj();
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // draw simple cube for starters
    colorCube();

    // create vertex and normal buffers
    createBuffers(pointsArray, normalsArray);

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonF").onclick = function(){
        if(obj === null)
            return;
        obj.loadObjFileFlat();
        createBuffers(obj.vertices, obj.normals);
    };
    document.getElementById("ButtonS").onclick = function(){
        if(obj === null)
            return;
        obj.loadObjFileSmooth();
        createBuffers(obj.vertices, obj.normals);
    };
    document.getElementById('files').onchange = function (evt) {
        var file = evt.target.files[0];
        var reader = new FileReader();

        reader.onload = function(evt) { 
            var data = evt.target.result;
            loadObject(data);           
        };
        if(file)
            reader.readAsText(file);
    };

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
            flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
            flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
            flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
            flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program, 
                "shininess"),materialShininess);
    render();
}

function loadObject(data) {
    obj = new ObjDoc(data);
    obj.loadObjFileFlat();
    numVertices = obj.vertices.length;
    translateObj();
    createBuffers(obj.vertices, obj.normals);
}

function translateObj(){
    if(obj === null){
        return;
    }
    xCenter = obj.zCenter;
    yCenter = 0;
    zCenter = 0;
}

function scaleObj(){
    if(obj === null){
        sx = 1; sy = 1; sz = 1;
        if(canvas.width < canvas.height)
            sy *= (canvas.width/canvas.height);
        if(canvas.width > canvas.height)
            sx *= (canvas.height/canvas.width);
    } else{
        if(1/obj.max < 1){
            sx = 1/obj.max; sy = 1/obj.max; sz = 1/obj.max;
        } else{
            sx = 1; sy = 1; sz = 1;
        }
        if(canvas.width < canvas.height)
            sy *= (canvas.width/canvas.height);
        if(canvas.width > canvas.height)
            sx *= (canvas.height/canvas.width);
    }
}

var render = function() {
    resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (flag) theta[axis] += 2.0;

    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
            cradius * Math.sin(ctheta) * Math.sin(cphi), 
            cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);

    modelViewMatrix = mult(modelViewMatrix, Scale(sx, sy, sz));
    modelViewMatrix = mult(modelViewMatrix, translate(-xCenter, -yCenter, -zCenter));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));

    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    window.requestAnimFrame(render);
}

function createBuffers(points, normals) {
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}
