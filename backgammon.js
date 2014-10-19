//Charles Horton, Nathan Cheung

var gl;

var points = [];
var blackBoardPoints = [];
var redBoardPoints = [];
var rectangleBoardPoints = [];

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
    gl.clearColor( 1.0, 0.8, 0.7, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // var points = create_and_or_gate(x, y);
    color = vec4 (0.0, 0.0, 0.0, 1.0);
    colorLoc = gl.getUniformLocation (program, "color");

    // setTriangleCoords(1);
    // setTriangleCoords(-1);
    setBlackTriangleCoords();
    setRedTriangleCoords();
    setRectangleBoardCoords();

    var blackBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, blackBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(blackBoardPoints), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderBlackBoard();

    var redBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, redBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(redBoardPoints), gl.STATIC_DRAW );
    color = vec4 (1.0, 0.0, 0.0, 1.0);

    // Associate out shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderRedBoard();

    var rectangleBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, rectangleBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(rectangleBoardPoints), gl.STATIC_DRAW );
    color = vec4 (0.3, 0.0, 0.0, 1.0);

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderRectangleBoard();

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

    // var menu = document.getElementById ("gateMenu");
    // menu.addEventListener ("click", function () {
    //     switch (menu.selectedIndex) {
    //         case 0:
    //             isAnd = true;
    //             isOr = false
    //             isNot = false;
    //             // render();
    //             break;
    //         case 1:
    //             isAnd = false;
    //             isOr = true;
    //             isNot = false;
    //             // render();
    //             break;
    //         case 2:
    //             isAnd = false;
    //             isOr = false;
    //             isNot = true;
    //     }
    // })
    //render();
};

function renderBlackBoard() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, blackBoardPoints.length )
}

function renderRedBoard() {
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, redBoardPoints.length )
}

function renderRectangleBoard() {
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.TRIANGLES, 0, rectangleBoardPoints.length )
}

function render() {
    //gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniform4fv (colorLoc, color);
    gl.drawArrays( gl.LINES, 0, points.length );
    requestAnimFrame (render);
}

function setTriangleCoords(sign) {
    for (var i = 0; i < 7; i++) {
        var p1 = vec2((7-i)/7, sign * -1);
        var p2 = vec2((7-1-i)/7, sign * -1);
        var p3 = vec2((13-2*i)/14, sign * -1/8);
        if (sign=== -1 && i%2===0) {
            redBoardPoints.push(p1);
            redBoardPoints.push(p2);
            redBoardPoints.push(p3);
        } else {
            blackBoardPoints.push(p1);
            blackBoardPoints.push(p2);
            blackBoardPoints.push(p3);
        }
        p1 = vec2(i/7, sign * -1);
        p2 = vec2((i+1)/7, sign * -1);
        p3 = vec2((2*i+1)/14, sign * -1/8);
        if (i%2===0) {
            redBoardPoints.push(p1);
            redBoardPoints.push(p2);
            redBoardPoints.push(p3);
        } else {
            blackBoardPoints.push(p1);
            blackBoardPoints.push(p2);
            blackBoardPoints.push(p3);
        }
    }
}

// height of triangle = 3/8 board height
// width of triangle = 1/14 board width
function setBlackTriangleCoords() {
    var p1 = vec2(-6/7, -1);
    var p2 = vec2(-5/7, -1);
    var p3 = vec2(-11/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(-4/7, -1);
    p2 = vec2(-3/7, -1);
    p3 = vec2(-7/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(-2/7, -1);
    p2 = vec2(-1/7, -1);
    p3 = vec2(-3/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    // var p1 = vec2(-1/7, -1);
    // var p2 = vec2(0, -1);
    // var p3 = vec2(-1/14, -1/8)
    // blackBoardPoints.push(p1);
    // blackBoardPoints.push(p2);
    // blackBoardPoints.push(p3);
    p1 = vec2(1/7, -1);
    p2 = vec2(2/7, -1);
    p3 = vec2(3/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(3/7, -1);
    p2 = vec2(4/7, -1);
    p3 = vec2(7/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(5/7, -1);
    p2 = vec2(6/7, -1);
    p3 = vec2(11/14, -1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(-1, 1);
    p2 = vec2(-6/7, 1);
    p3 = vec2(-13/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(-5/7, 1);
    p2 = vec2(-4/7, 1);
    p3 = vec2(-9/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(-3/7, 1);
    p2 = vec2(-2/7, 1);
    p3 = vec2(-5/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(0, 1);
    p2 = vec2(1/7, 1);
    p3 = vec2(1/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(2/7, 1);
    p2 = vec2(3/7, 1);
    p3 = vec2(5/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    p1 = vec2(4/7, 1);
    p2 = vec2(5/7, 1);
    p3 = vec2(9/14, 1/8);
    blackBoardPoints.push(p1);
    blackBoardPoints.push(p2);
    blackBoardPoints.push(p3);
    // var p1 = vec2(6/7, 1);
    // var p2 = vec2(1, 1);
    // var p3 = vec2(13/14, 1/8)
    // blackBoardPoints.push(p1);
    // blackBoardPoints.push(p2);
    // blackBoardPoints.push(p3);
}

// height of triangle = 3/8 board height
// width of triangle = 1/14 board width
function setRedTriangleCoords() {
    var p1 = vec2(-1, -1);
    var p2 = vec2(-6/7, -1);
    var p3 = vec2(-13/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(-5/7, -1);
    p2 = vec2(-4/7, -1);
    p3 = vec2(-9/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(-3/7, -1);
    p2 = vec2(-2/7, -1);
    p3 = vec2(-5/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(0, -1);
    p2 = vec2(1/7, -1);
    p3 = vec2(1/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(2/7, -1);
    p2 = vec2(3/7, -1);
    p3 = vec2(5/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(4/7, -1);
    p2 = vec2(5/7, -1);
    p3 = vec2(9/14, -1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    // var p1 = vec2(6/7, -1);
    // var p2 = vec2(1, -1);
    // var p3 = vec2(13/14, -1/8)
    // redBoardPoints.push(p1);
    // redBoardPoints.push(p2);
    // redBoardPoints.push(p3);
    p1 = vec2(-6/7, 1);
    p2 = vec2(-5/7, 1);
    p3 = vec2(-11/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(-4/7, 1);
    p2 = vec2(-3/7, 1);
    p3 = vec2(-7/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(-2/7, 1);
    p2 = vec2(-1/7, 1);
    p3 = vec2(-3/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    // var p1 = vec2(-1/7, 1);
    // var p2 = vec2(0, 1);
    // var p3 = vec2(-1/14, 1/8)
    // redBoardPoints.push(p1);
    // redBoardPoints.push(p2);
    // redBoardPoints.push(p3);
    p1 = vec2(6/7, 1);
    p2 = vec2(5/7, 1);
    p3 = vec2(11/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(4/7, 1);
    p2 = vec2(3/7, 1);
    p3 = vec2(7/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
    p1 = vec2(2/7, 1);
    p2 = vec2(1/7, 1);
    p3 = vec2(3/14, 1/8);
    redBoardPoints.push(p1);
    redBoardPoints.push(p2);
    redBoardPoints.push(p3);
}

function setRectangleBoardCoords() {
    var p1 = vec2(-1/7, 1);
    var p2 = vec2(-1/7, -1);
    var p3 = vec2(0, 1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
    p1 = vec2(-1/7, -1);
    p2 = vec2(0, 1);
    p3 = vec2(0, -1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);

    p1 = vec2(6/7, 1);
    p2 = vec2(6/7, -1);
    p3 = vec2(1, 1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
    p1 = vec2(6/7, -1);
    p2 = vec2(1, 1);
    p3 = vec2(1, -1);
    rectangleBoardPoints.push(p1);
    rectangleBoardPoints.push(p2);
    rectangleBoardPoints.push(p3);
}

function create_and_gate(x, y){
    var p = vec2(-1.0*.1+x, -0.5*.1+y);
    points.push(p);
    p = vec2(-0.5*.1+x, -0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, -1.0*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-1.0*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 1.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI/2; theta <= Math.PI; theta += (Math.PI/20)){
        p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);
    }
    p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI; theta <= 3*Math.PI/2; theta += (Math.PI/20)){
        p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
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
    p = vec2(-0.5*.1+x, -0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, -1.0*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-1.0*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 0.5*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 1.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI/2; theta <= Math.PI; theta += (Math.PI/20)){
        p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);
    }
    p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    for (var theta = Math.PI; theta <= 3*Math.PI/2; theta += (Math.PI/20)){
        p = vec2((-0.5 - Math.cos(theta))*.1+x, Math.sin(theta)*.1+y);
        points.push(p);
        points.push(p);

    }
    p = vec2(1.0*.1+x, 0.0*.1+y);
    points.push(p);
    points.push(p);
    p = vec2(-0.5*.1+x, 1.0*.1+y);
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
