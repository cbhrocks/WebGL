var gl;

var points;
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    points = create_and_gate();

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

    // canvas.addEventListener ("click", function(event) {
    //     if (numPoints < maxPoints) {
    //         var point = vec2 (-1 + 2*(event.clientX-mouseSize)/canvas.width,
    //             -1 + 2*(canvas.height-event.clientY+mouseSize)/canvas.height);
    //         // gl.bufferSubData (gl.ARRAY_BUFFER, 8*numPoints, flatten(point));
    //         numPoints++;
    //     }
    // });

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}

function create_and_gate(){
    var p = vec2(-1.0, -0.5);
    points = [ p ];
    var p = vec2(-0.5, -0.5);
    points.push(p);
    var p = vec2(-0.5, -1.0);
    points.push(p);
    var p = vec2(-0.5, 0.5);
    points.push(p);
    var p = vec2(-1.0, 0.5);
    points.push(p);
    var p = vec2(-0.5, 0.5);
    points.push(p);
    var p = vec2(-0.5, 1.0);
    points.push(p);
    for (var theta = Math.PI/2; theta <= Math.PI; theta += (Math.PI/20)){
        var p = vec2(-0.5 - Math.cos(theta), Math.sin(theta));
        points.push(p);
    }
    var p = vec2(1.0, 0.0);
    points.push(p);
    for (var theta = Math.PI; theta <= 3*Math.PI/2; theta += (Math.PI/20)){
        var p = vec2(-0.5 - Math.cos(theta), Math.sin(theta));
        points.push(p);
    }
    return points;
}