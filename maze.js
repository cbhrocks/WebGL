var gl;

var points;
var points2;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = create_points();

    points2 = create_points2();

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();

    var bufferId2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render2();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}

function render2() {
    gl.drawArrays( gl.LINE_STRIP, 0, points2.length );
}

function create_points(){
    var p = vec2(-.99, -.99);
    points = [ p ];
    var p = vec2(1.0, -.99);
    points.push(p);
    var p = vec2(1.0, .2);
    points.push(p);
    var p = vec2(-0.6, .2);
    points.push(p);
    var p = vec2(-0.6, .6);
    points.push(p);
    var p = vec2(-0.6, .2);
    points.push(p);
    var p = vec2(-0.2, .2);
    points.push(p);
    var p = vec2(-0.2, .6);
    points.push(p);
    return points;
}

function create_points2(){
    var p = vec2(0.6, -.6);
    points2 = [ p ];
    var p = vec2(-0.99, -0.6);
    points2.push(p);
    var p = vec2(-0.99, -0.2);
    points2.push(p);
    var p = vec2(0.6, -0.2);
    points2.push(p);
    var p = vec2(-0.99, -0.2);
    points2.push(p);
    var p = vec2(-0.99, 1.0);
    points2.push(p);
    var p = vec2(0.2, 1.0);
    points2.push(p);
    var p = vec2(0.2, 0.6);
    points2.push(p);
    var p = vec2(0.2, 1.0);
    points2.push(p);
    var p = vec2(1.0, 1.0);
    points2.push(p);
    var p = vec2(1.0, 0.6);
    points2.push(p);
    var p = vec2(0.6, 0.6);
    points2.push(p);
    return points2;
}