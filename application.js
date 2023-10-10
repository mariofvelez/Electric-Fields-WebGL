var canvas = document.querySelector("#c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("WebGL not supported!");
}

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);


// create shader programs
function createProgram(vertex_source, fragment_source)
{
    var vertexShaderSource = document.querySelector(vertex_source).text.trim();
    var fragmentShaderSource = document.querySelector(fragment_source).text.trim();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    // fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    // shader program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}

function createComputeProgram(vertex_source, fragment_source) {
    var vertexShaderSource = document.querySelector(vertex_source).text.trim();
    var fragmentShaderSource = document.querySelector(fragment_source).text.trim();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    // fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    // shader program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.transformFeedbackVaryings(program, ['color', 'transform'], gl.INTERLEAVED_ATTRIBS);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}

var program = createProgram("#Vertex-shader", "#Fragment-shader");

var grid_program = createProgram("#GridVertex-shader", "#GridFragment-shader");

var arrow_program = createProgram("#ArrowVertex-shader", "#ArrowFragment-shader");

var arrow_compute_program = createComputeProgram("#ArrowComputeVertex-shader", "#ArrowComputeFragment-shader");

gl.useProgram(program);

// uniform locations
var proj_loc = gl.getUniformLocation(program, "uViewProjection");
var model_loc = gl.getUniformLocation(program, "uModel");
var radius_loc = gl.getUniformLocation(program, "radius");

var charge_loc = gl.getUniformLocation(program, "uCharge");

var proj_loc_grid = gl.getUniformLocation(grid_program, "uViewProjection");
var model_loc_grid = gl.getUniformLocation(grid_program, "uModel");

var proj_loc_arrow = gl.getUniformLocation(arrow_program, "uViewProjection");
var model_loc_arrow = gl.getUniformLocation(arrow_program, "uModel");

var grid_loc_arrow_compute = gl.getUniformLocation(arrow_compute_program, "grid_matrix");
var pos_loc_arrow_compute = gl.getUniformLocation(arrow_compute_program, "pos");
var pos2_loc_arrow_compute = gl.getUniformLocation(arrow_compute_program, "pos2");
var charge_loc_arrow_compute = gl.getUniformLocation(arrow_compute_program, "charge");

// creating shapes

var sphere_subdivisions = 8;
var sphere_radius = 0.1;

const shapes = [];

// min and max values of the sliders
var pos_min = -10.0;
var pos_max = 10.0;

// shape prefabs

// sphere
var sphere_prefab = createSphere(sphere_subdivisions, sphere_subdivisions, sphere_radius);
console.log("sphere prefab: " + sphere_prefab);

// creating array buffer
var sphereVBO = gl.createBuffer();

var sphereVAO = gl.createVertexArray();

gl.bindVertexArray(sphereVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
gl.bufferData(gl.ARRAY_BUFFER, sphere_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);
gl.enableVertexAttribArray(0);

// normal
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
gl.enableVertexAttribArray(1);

var sphereEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere_prefab.indices, gl.STATIC_DRAW);

// line segment
var line_segment_prefab = createLineSegment();
console.log(line_segment_prefab);

var line_segmentVBO = gl.createBuffer();

var line_segmentVAO = gl.createVertexArray();

gl.bindVertexArray(line_segmentVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, line_segmentVBO);
gl.bufferData(gl.ARRAY_BUFFER, line_segment_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var line_segmentEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, line_segmentEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, line_segment_prefab.indices, gl.STATIC_DRAW);

// ring
var ring_prefab = createRing();
console.log("ring prefab: " + ring_prefab);

var ringVBO = gl.createBuffer();

var ringVAO = gl.createVertexArray();

gl.bindVertexArray(ringVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, ringVBO);
gl.bufferData(gl.ARRAY_BUFFER, ring_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var ringEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ringEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ring_prefab.indices, gl.STATIC_DRAW);

// disc


function addSphere(position, radius, charge)
{
    // creating HTML controls
    const controls = document.getElementById("controls");
    const div = document.createElement("div");
    controls.appendChild(div);

    // X slider
    const text_x = document.createTextNode("x: ");
    div.appendChild(text_x);

    const slider_x = document.createElement("input");
    slider_x.type = "range";
    slider_x.min = pos_min;
    slider_x.max = pos_max;
    slider_x.value = 0;
    slider_x.step = 0.01;
    slider_x.id = shapes.length * 3;
    div.appendChild(slider_x);

    slider_x.oninput = function () {
        shapes[slider_x.id / 3].position[0] = slider_x.value;
    }

    // Y slider
    const text_y = document.createTextNode("y: ");
    div.appendChild(text_y);

    const slider_y = document.createElement("input");
    slider_y.type = "range";
    slider_y.min = pos_min;
    slider_y.max = pos_max;
    slider_y.value = 0;
    slider_y.step = 0.01;
    slider_y.id = shapes.length * 3 + 1;
    div.appendChild(slider_y);

    slider_y.oninput = function () {
        shapes[(slider_y.id - 1) / 3].position[1] = slider_y.value;
    }

    // Z slider
    const text_z = document.createTextNode("z: ");
    div.appendChild(text_z);

    const slider_z = document.createElement("input");
    slider_z.type = "range";
    slider_z.min = pos_min;
    slider_z.max = pos_max;
    slider_z.value = 0;
    slider_z.step = 0.01;
    slider_z.id = shapes.length * 3 + 2;
    div.appendChild(slider_z);

    slider_z.oninput = function () {
        shapes[(slider_z.id - 2) / 3].position[2] = slider_z.value;
    }

    // Charge slider
    const text_charge = document.createTextNode("Charge: ");
    div.appendChild(text_charge);

    const slider_charge = document.createElement("input");
    slider_charge.type = "range";
    slider_charge.min = -10;
    slider_charge.max = 10;
    slider_charge.value = 0;
    slider_charge.step = 0.5;
    slider_charge.id = "charge-slider";
    slider_charge.name = shapes.length;
    div.appendChild(slider_charge);

    slider_charge.oninput = function () {
        shapes[slider_charge.name].charge = slider_charge.value;
    }

    shapes.push({
        name: "sphere",
        position: position,
        length: sphere_prefab.indices.length,
        charge: charge,
        mVAO: sphereVAO
    });
}

function addLineSegment(position_a, position_b, charge)
{
    shapes.push({
        name: "line segment",
        position_a: position_a,
        position_b: position_b,
        charge: charge,
        length: 2,
        mVAO: line_segmentVAO
    });
}

function addPlane(position, normal, charge)
{

}

function addRing(position, radius, normal, charge)
{
    shapes.push({
        name: "ring",
        position: position,
        radius: radius,
        normal: normal,
        length: ring_prefab.indices.length,
        charge: charge,
        mVAO: ringVAO
    });
}

function addDisc(position, radius, normal, charge)
{

}

function addWasher(position, inner, outer, normal, charge)
{

}

var add_charge = document.getElementById("add-charge-button");
// change to have a charge input
add_charge.addEventListener("click", (e) => {
    addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 1.0);
}, false);

addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 0.0);

addSphere(vec3.fromValues(1.0, 2.0, 1.0), sphere_radius, 0.0);

//addRing(vec3.fromValues(0.0, 1.0, 0.0), 2.0, vec3.fromValues(1.0, 0.0, 0.0), 10.0);

//addLineSegment(vec3.fromValues(3.0, 3.0, 3.0), vec3.fromValues(-3.0, -3.0, -3.0), 1.0);

console.log("num shapes " + shapes.length);

var grid_w = 15;

// creating grid
var grid = createGrid(vec3.fromValues(0.0, 1.0, 0.0), 0.5, grid_w);

console.log("grid:" + grid);

var gVBO = gl.createBuffer()

var gVAO = gl.createVertexArray();

gl.bindVertexArray(gVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, gVBO);
gl.bufferData(gl.ARRAY_BUFFER, grid.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var gEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, grid.indices, gl.STATIC_DRAW);

// creating arrows
var arrow = createArrow();

console.log("arrow: " + arrow);

var aVBO = gl.createBuffer();

var aVAO = gl.createVertexArray();

gl.bindVertexArray(aVAO);

// vertex buffer
gl.bindBuffer(gl.ARRAY_BUFFER, aVBO);
gl.bufferData(gl.ARRAY_BUFFER, arrow.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

// color-model buffer
var color_model_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_model_buffer);
gl.bufferData(gl.ARRAY_BUFFER, grid.matrices, gl.DYNAMIC_DRAW);

// color
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, (16 + 3) * 4, 0);
gl.vertexAttribDivisor(1, 1);

// model
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 4, gl.FLOAT, false, (16 + 3) * 4, 12);
gl.enableVertexAttribArray(3);
gl.vertexAttribPointer(3, 4, gl.FLOAT, false, (16 + 3) * 4, 16 + 12);
gl.enableVertexAttribArray(4);
gl.vertexAttribPointer(4, 4, gl.FLOAT, false, (16 + 3) * 4, 32 + 12);
gl.enableVertexAttribArray(5);
gl.vertexAttribPointer(5, 4, gl.FLOAT, false, (16 + 3) * 4, 48 + 12);

gl.vertexAttribDivisor(2, 1);
gl.vertexAttribDivisor(3, 1);
gl.vertexAttribDivisor(4, 1);
gl.vertexAttribDivisor(5, 1);

var aEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, aEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrow.indices, gl.STATIC_DRAW);

// creating arrow compute buffers
var acVAO = gl.createVertexArray();
gl.bindVertexArray(acVAO);

var arrow_pos_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, arrow_pos_buffer);
gl.bufferData(gl.ARRAY_BUFFER, grid.arrow_vertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);

var acTF = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, acTF);

gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, color_model_buffer);

gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

// MVP matrices

var cam_dist = 7.0;

var proj = mat4.create();
mat4.perspective(proj, Math.PI / 2.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 20.0);

var view = mat4.create();

var viewProj = mat4.create();

function updateCamera(theta, phi)
{
    var x = Math.cos(phi) * Math.cos(theta);
    var y = Math.sin(phi);
    var z = Math.cos(phi) * Math.sin(theta);

    mat4.lookAt(view, vec3.fromValues(x * cam_dist, y * cam_dist, z * cam_dist), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));

    mat4.multiply(viewProj, proj, view);
}

// camera angles
var theta = 0;
var phi = 0.1;

updateCamera(theta, phi);

console.log(proj_loc);
console.log(model_loc);

// input
var prev_x = 0;
var prev_y = 0;
var is_mouse_down = false;

canvas.addEventListener("mousemove", (e) => {

    var dx = e.offsetX - prev_x;
    var dy = e.offsetY - prev_y;

    if (is_mouse_down)
    {
        theta += Math.PI * 2 * (dx / canvas.width);
        phi += Math.PI * (dy / canvas.height);

        if (phi >= Math.PI * 0.5)
            phi = Math.PI * 0.5 - 0.0001;
        if (phi <= -Math.PI * 0.5)
            phi = -Math.PI * 0.5 + 0.0001;

        updateCamera(theta, phi);

        mat4.multiply(viewProj, proj, view);
    }

    prev_x = e.offsetX;
    prev_y = e.offsetY;

}, false);

canvas.addEventListener("mousedown", (e) => {

    is_mouse_down = true;
    canvas.style.cursor = "grabbing";

}, false);

canvas.addEventListener("mouseup", (e) => {

    is_mouse_down = false;
    canvas.style.cursor = "auto";

}, false);

window.addEventListener("resize", (e) => {

    // update canvas and projection
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    mat4.perspective(proj, Math.PI / 2.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 10.0);
    mat4.multiply(viewProj, proj, view);

}, false);


// rendering

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

var up = vec3.fromValues(0.134, -0.8251, 0.3117);
vec3.normalize(up, up);

function draw(time)
{
    var seconds = time * 0.001;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // shapes
    gl.useProgram(program);

    gl.uniformMatrix4fv(proj_loc, false, viewProj);

    for (var i = 0; i < shapes.length; ++i)
    {
        if (shapes[i].name === "sphere")
        {
            var model = mat4.create();
            mat4.scalar.translate(model, model, shapes[i].position);
            gl.uniformMatrix4fv(model_loc, false, model);

            gl.uniform1f(charge_loc, shapes[i].charge);
            gl.uniform1f(radius_loc, 1.0);

            gl.bindVertexArray(shapes[i].mVAO);
            gl.drawElements(gl.TRIANGLES, shapes[i].length, gl.UNSIGNED_INT, 0);
        }
        else if (shapes[i].name === "ring")
        {
            var model = mat4.create();
            var target = vec3.clone(shapes[i].position);
            vec3.add(target, target, shapes[i].normal);
            mat4.lookAt(model, shapes[i].position, target, up);
            mat4.scalar.invert(model, model);
            gl.uniformMatrix4fv(model_loc, false, model);

            gl.uniform1f(charge_loc, shapes[i].charge);
            gl.uniform1f(radius_loc, shapes[i].radius);

            gl.bindVertexArray(shapes[i].mVAO);
            gl.drawElements(gl.LINES, shapes[i].length, gl.UNSIGNED_INT, 0);
        }
        else if (shapes[i].name === "line segment")
        {
            console.log("drawing line segment");
            var model = mat4.create();
            gl.uniformMatrix4fv(model_loc, false, model);

            // set line segment buffer positions
            line_segment_prefab.vertices[0] = shapes[i].position_a[0];
            line_segment_prefab.vertices[1] = shapes[i].position_a[1];
            line_segment_prefab.vertices[2] = shapes[i].position_a[2];
            line_segment_prefab.vertices[3] = shapes[i].position_b[0];
            line_segment_prefab.vertices[4] = shapes[i].position_b[1];
            line_segment_prefab.vertices[5] = shapes[i].position_b[2];

            gl.bindBuffer(gl.ARRAY_BUFFER, line_segmentVBO);
            gl.bufferData(gl.ARRAY_BUFFER, line_segment_prefab.vertices, gl.STATIC_DRAW);

            gl.uniform1f(charge_loc, shapes[i].charge);
            gl.uniform1f(radius_loc, 1.0);

            gl.bindVertexArray(shapes[i].mVAO);
            gl.drawElements(gl.LINES, shapes[i].length, gl.UNSIGNED_INT, 0);
        }
    }

    // grid
    gl.useProgram(grid_program);

    gl.uniformMatrix4fv(proj_loc_grid, false, viewProj);

    var model = mat4.create();
    gl.uniformMatrix4fv(model_loc_grid, false, model);

    gl.bindVertexArray(gVAO);
    gl.drawElements(gl.LINES, grid.indices.length, gl.UNSIGNED_INT, 0);

    // arrow compute
    gl.useProgram(arrow_compute_program);

    gl.uniformMatrix4fv(grid_loc_arrow_compute, false, grid.grid_matrix);
    gl.uniform3f(pos_loc_arrow_compute, shapes[0].position[0], shapes[0].position[1], shapes[0].position[2]);
    gl.uniform3f(pos2_loc_arrow_compute, shapes[1].position[0], shapes[1].position[1], shapes[1].position[2]);
    gl.uniform1f(charge_loc_arrow_compute, shapes[0].charge);

    gl.bindVertexArray(acVAO);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, acTF);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, grid.arrow_vertices.length / 3);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    gl.disable(gl.RASTERIZER_DISCARD);

    // arrows
    gl.useProgram(arrow_program);

    gl.uniformMatrix4fv(proj_loc_arrow, false, viewProj);

    var arrow_model = mat4.create();
    mat4.scalar.translate(arrow_model, arrow_model, vec3.fromValues(1.0, 0.0, -1.0));
    gl.uniformMatrix4fv(model_loc_arrow, false, arrow_model);

    gl.bindVertexArray(aVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, arrow.indices.length, gl.UNSIGNED_INT, 0, grid.matrices.length / (16 + 3));

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

