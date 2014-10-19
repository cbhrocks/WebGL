var gl;

var points;
var NumPoints = 5;
var theta = 2*Math.PI/NumPoints;
var radius = 1;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = create_points();

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
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}

function create_points(){
    var p = vec2(1,0);
    points = [ p ];
    for (var i = 1; i <= NumPoints; i++){
        var x = radius * Math.cos(theta*i);
        var y = radius * Math.sin(theta*i);
        p = vec2(x,y);
        points.push(p);
        for (var j = i; j >= 0; j--){
            var a = radius * Math.cos(theta*j);
            var b = radius * Math.sin(theta*j);
            var p2 = vec2(a,b);
            points.push(p2);
            points.push(p);
        }
    }
    return points;
}