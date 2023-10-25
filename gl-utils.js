var canvas_container = document.querySelector("#canvas-container");

var canvas = document.querySelector("#c");
canvas.width = canvas_container.offsetWidth;
canvas.height = window.innerHeight - 20;


var gl = canvas.getContext("webgl2");

if (!gl)
{
    console.error("WebGL not supported!");
}

// create shader programs
function createProgram(vertex_source, fragment_source)
{
    var vertexShaderSource = document.querySelector(vertex_source).text.trim();
    var fragmentShaderSource = document.querySelector(fragment_source).text.trim();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    // fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    // shader program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}

function createComputeProgram(vertex_source, fragment_source)
{
    var vertexShaderSource = document.querySelector(vertex_source).text.trim();
    var fragmentShaderSource = document.querySelector(fragment_source).text.trim();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
    {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    // fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
    {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    // shader program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.transformFeedbackVaryings(program, ['color', 'transform'], gl.INTERLEAVED_ATTRIBS);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}