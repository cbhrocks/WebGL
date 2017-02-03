//Charles Horton, Nathan Cheung

var gl;

var points = [];

var color;
var colorLoc;
var isNot;
var isAnd;
var isOr;

window.onload = function init()


{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // var points = create_and_or_gate(x, y);
    color = vec4 (0.0, 0.0, 1.0, 1.0);
    colorLoc = gl.getUniformLocation (program, "color");

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 100000, gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    canvas.addEventListener ("click", function(event) {
        var x = -1 + 2*(event.clientX-80)/canvas.width;
        var y = -1 + 2*(canvas.height-event.clientY + 8)/canvas.height;
        // var points = create_and_or_gate(x, y);
        if (isNot){
            create_not_gate(x,y);
        }
        else if (isAnd){
            create_and_gate(x,y);
        }
        else if (isOr){
            create_or_gate(x,y);
        }
        gl.bufferSubData (gl.ARRAY_BUFFER, points, flatten(points));
        // render();
    });

    var menu = document.getElementById ("gateMenu");
    menu.addEventListener ("click", function () {
        switch (menu.selectedIndex) {
            case 0:
                isAnd = true;
                isOr = false
                isNot = false;
                // render();
                break;
            case 1:
                isAnd = false;
                isOr = true;
                isNot = false;
                // render();
                break;
            case 2:
                isAnd = false;
                isOr = false;
                isNot = true;
        }
    })
    // var points = [ vec2(0,0) ];
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.LINES, 0, points.length );
    requestAnimFrame (render);
}

function create_and_gate(x, y){
    var p = vec2(-1.0*.1+x, -0.5*.1+y);
    // points = [ p ];
    points.push(p);
    var p = vec2(-0.5*.1+x, -0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, -1.0*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-1.0*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 1.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI/2; theta <= Math.PI; theta += (Math.PI/20)){
        var p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);
    }
    var p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI; theta <= 3*Math.PI/2; theta += (Math.PI/20)){
        var p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);

    }
    points.push(p);
    // return points;
}

function create_or_gate(x, y){
    var p = vec2(-1.0*.1+x, -0.5*.1+y);
    // points = [ p ];
    points.push(p);
    var p = vec2(-0.5*.1+x, -0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, -1.0*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-1.0*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 1.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI/2; theta <= Math.PI; theta += (Math.PI/20)){
        var p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);
    }
    var p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI; theta <= 3*Math.PI/2; theta += (Math.PI/20)){
        var p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);

    }
    var p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    var p = vec2(-0.5*.1+x, 1.0*.1+y);
    points.push(p);
    points.push(p);
    points.push(p);
    // return points;
}

function create_not_gate(x, y) {
    var p = vec2(.1 * -1.0 + x, 0.0 + y);
    points.push(p);

    // var points = [ p ];

    p = vec2(.1 * -0.7 + x, 0.0 + y);
    points.push(p);
    points.push(p);
    p = vec2(.1 * -0.7 + x, .1 * 0.75 + y);
    points.push(p);
    points.push(p);
    p = vec2(.1 * 0.6 + x, 0.0 + y);
    points.push(p);
    points.push(p);

    for (var theta = Math.PI; theta >= 0; theta -= Math.PI/20) {
        p = vec2(.1 * (0.7 + .1*Math.cos(theta)) + x, .1 * .1*Math.sin(theta) + y);
        points.push(p);
        points.push(p);
    }

    p = vec2(.1 * 1.0 + x, 0.0 + y);
    points.push(p);
    points.push(p);
    p = vec2(.1 * 0.9 + x, 0.0 + y);
    points.push(p);
    points.push(p);

    for (var theta = 0; theta >= -Math.PI; theta -= Math.PI/20) {
        p = vec2(.1 * (0.7 + .1*Math.cos(theta)) + x, .1 * .1*Math.sin(theta) + y);
        points.push(p);
        points.push(p);
    }

    p = vec2(.1 * -0.7 + x, .1 * -0.75 + y);
    points.push(p);
    points.push(p);
    p = vec2(.1 * -0.7 + x, 0.0 + y);
    points.push(p);
    points.push(p);
    points.push(p);

    // return points;
}
