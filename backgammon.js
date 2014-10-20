//Charles Horton, Nathan Cheung

var gl;

var points = [];
var blackBoardPoints = [];
var redBoardPoints = [];
var rectangleBoardPoints = [];
var gamePieces = [];

var redTriangles = [];
var blackTriangles = [];
var triangles = [];

var color;
var colorLoc;
var isNot;
var isAnd;
var isOr;

window.onload = function init() {
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
    color = vec4 (0.0, 0.0, 0.0, 1.0);
    colorLoc = gl.getUniformLocation (program, "color");

    // setTriangleCoords(1, "red", "black");
    // setTriangleCoords(-1, "black", "red");
    setTriangles(1, "red", "black");
    setTriangles(-1, "black", "red");
    setCoords();
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
        var x = -1 + 2*(event.clientX)/canvas.width;
        var y = -1 + 2*(canvas.height-event.clientY)/canvas.height;
        for (var i = 0; i < triangles.length; i++) {
            if (triangles[i].hitTest(x,y)) {
                alert("Clicked a " + triangles[i].shade + " triangle");
            }
        }
    });

    // canvas.addEventListener ("click", function(event) {
    //     var x = -1 + 2*(event.clientX-80)/canvas.width;
    //     var y = -1 + 2*(canvas.height-event.clientY + 8)/canvas.height;
    //     // var points = create_and_or_gate(x, y);
    //     if (isNot){
    //         create_not_gate(x,y);
    //     }
    //     else if (isAnd){
    //         create_and_gate(x,y);
    //     }
    //     else if (isOr){
    //         create_or_gate(x,y);
    //     }
    //     gl.bufferSubData (gl.ARRAY_BUFFER, points, flatten(points));
    //     // render();
    // });

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


// height of triangle = 7/16 board height
// width of triangle = 1/14 board width
function setTriangleCoords(sign, color1, color2) {
    for (var i = 0; i < 7; i++) {
        var p1 = vec2((7-i)/7, sign * -1);
        var p2 = vec2((7-1-i)/7, sign * -1);
        var p3 = vec2((13-2*i)/14, sign * -1/8);
        if (i%2===0) {
            eval(color1+'BoardPoints').push(p1);
            eval(color1+'BoardPoints').push(p2);
            eval(color1+'BoardPoints').push(p3);
        } else {
            eval(color2+'BoardPoints').push(p1);
            eval(color2+'BoardPoints').push(p2);
            eval(color2+'BoardPoints').push(p3);
        }
        p1 = vec2(i/7, sign * -1);
        p2 = vec2((i+1)/7, sign * -1);
        p3 = vec2((2*i+1)/14, sign * -1/8);
        if (i%2===0) {
            eval(color1+'BoardPoints').push(p1);
            eval(color1+'BoardPoints').push(p2);
            eval(color1+'BoardPoints').push(p3);
        } else {
            eval(color2+'BoardPoints').push(p1);
            eval(color2+'BoardPoints').push(p2);
            eval(color2+'BoardPoints').push(p3);
        }
    }

    for (i = 0; i < 7; i++) {
        p1 = vec2(-(7-i)/7, sign * -1);
        p2 = vec2(-(7-1-i)/7, sign * -1);
        p3 = vec2(-(13-2*i)/14, sign * -1/8);
        if (i%2===0) {
            eval(color1+'BoardPoints').push(p1);
            eval(color1+'BoardPoints').push(p2);
            eval(color1+'BoardPoints').push(p3);
        } else {
            eval(color2+'BoardPoints').push(p1);
            eval(color2+'BoardPoints').push(p2);
            eval(color2+'BoardPoints').push(p3);
        }
        p1 = vec2(i/7, sign * -1);
        p2 = vec2((i+1)/7, sign * -1);
        p3 = vec2((2*i+1)/14, sign * -1/8);
        if (i%2===0) {
            eval(color1+'BoardPoints').push(p1);
            eval(color1+'BoardPoints').push(p2);
            eval(color1+'BoardPoints').push(p3);
        } else {
            eval(color2+'BoardPoints').push(p1);
            eval(color2+'BoardPoints').push(p2);
            eval(color2+'BoardPoints').push(p3);
        }
    }
}

function setCoords() {
    var length = triangles.length;
    for (var i = 0; i < length; i++) {
        if (triangles[i].shade == 'red') {
            redBoardPoints.push(triangles[i].vertexA);
            redBoardPoints.push(triangles[i].vertexB);
            redBoardPoints.push(triangles[i].vertexC);
        }
        else {
            blackBoardPoints.push(triangles[i].vertexA);
            blackBoardPoints.push(triangles[i].vertexB);
            blackBoardPoints.push(triangles[i].vertexC);
        }
    }
}

function setTriangles(sign, color1, color2) {
    for (var i = 0; i < 7; i++) {
        
        var leftBound = (7-1-i)/7;
        var rightBound = (7-i)/7;

        var topBound = 1;
        var bottomBound = 1/8;

        if (sign===1) {
            topBound = -1/8;
            bottomBound = -1;
        }

        
        var p1 = vec2((7-i)/7, sign * -1);
        var p2 = vec2((7-1-i)/7, sign * -1);
        var p3 = vec2((13-2*i)/14, sign * -1/8);
        var triangle;
        
        if (i%2===0) {
            triangle = new Triangle(p1, p2, p3, color1, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        } else {
            triangle = new Triangle(p1, p2, p3, color2, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        }
        
        leftBound = i/7;
        rightBound = (i+1)/7;

        p1 = vec2(i/7, sign * -1);
        p2 = vec2((i+1)/7, sign * -1);
        p3 = vec2((2*i+1)/14, sign * -1/8);
        
        if (i%2===0) {
            triangle = new Triangle(p1, p2, p3, color1, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        } else {
            triangle = new Triangle(p1, p2, p3, color2, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        }
    }

    for (i = 0; i < 7; i++) {
        
        leftBound = -(7-i)/7;
        rightBound = -(7-1-i)/7;
        
        p1 = vec2(-(7-i)/7, sign * -1);
        p2 = vec2(-(7-1-i)/7, sign * -1);
        p3 = vec2(-(13-2*i)/14, sign * -1/8);
        
        if (i%2===0) {
            triangle = new Triangle(p1, p2, p3, color1, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        } else {
            triangle = new Triangle(p1, p2, p3, color2, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        }

        leftBound = i/7;
        rightBound = (i+1)/7;

        p1 = vec2(i/7, sign * -1);
        p2 = vec2((i+1)/7, sign * -1);
        p3 = vec2((2*i+1)/14, sign * -1/8);

        if (i%2===0) {
            triangle = new Triangle(p1, p2, p3, color1, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        } else {
            triangle = new Triangle(p1, p2, p3, color2, leftBound, rightBound, topBound, bottomBound);
            triangles.push(triangle);
        }
    }
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

function Triangle(a, b, c, color, leftBound, rightBound, topBound, bottomBound, position) {
    this.vertexA = a;
    this.vertexB = b;
    this.vertexC = c;
    this.leftBound = leftBound
    this.rightBound = rightBound;
    this.topBound = topBound;
    this.bottomBound = bottomBound;
    this.posiiton = position;
    this.pieceNumber = 0;

    this.shade = color;
    // this.onClick1 = function(event) {
    //     console.log("Clicked a triangle");
    // };
    // this.onClick2 = function(event) {
    //     console.log("Clicked a triangle");
    // };
    // element.addEventListener('click', this.onClick1, false);
    // element.addEventListener('click', this.onClick2, false);

    this.hitTest = function (x, y) {

        var inWidthBox = false;
        var inLengthBox = false;

        if (x > this.leftBound && x < this.rightBound) {
            inWidthBox = true;
        }

        if (y > this.bottomBound && y < this.topBound) {
            inLengthBox = true;
        }
        
        return (inWidthBox && inLengthBox);
    };
}

function sayClicked(event) {
    console.log("Click event");
}

function GamePiece(color, position) {
    this.shade = color;
    this.position = position;
}

GamePiece.prototype.draw = function(){

};

GamePiece.prototype.setLocation = function(position){
    this.position = position
};

function createGamePieceArray(){
    for (var i = 0; i < 2; i++){
        this.gamePieces.push(new GamePiece(red, 0));
        this.triangles[0].pieceNumber +=1;
        this.gamePieces.push(new GamePiece(black, 23));
        this.triangles[23].pieceNumber +=1;
    }

    for (i = 0; i < 3; i++){
        thi.gamePieces.push(new GamePiece(red, 16));
        this.triangles[16].pieceNumber +=1;
        this.gamePieces.push(new GamePiece(black, 7));
        this.triangles[7].pieceNumber +=1;
    }

    for (i = 0; i < 5; i++){
        this.gamePieces.push(new GamePiece(red, 11));
        this.triangles[11].pieceNumber +=1;
        this.gamePieces.push(new GamePiece(red, 18));
        this.triangles[18].pieceNumber +=1;
        this.gamePieces.push(new GamePiece(black, 5));
        this.triangles[5].pieceNumber +=1;
        this.gamePieces.push(new GamePiece(black, 12));
        this.triangles[12].pieceNumber +=1;
    }
}