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

var program = createProgram("#Vertex-shader", "#Fragment-shader");

var grid_program = createProgram("#GridVertex-shader", "#GridFragment-shader");

var arrow_program = createProgram("#ArrowVertex-shader", "#ArrowFragment-shader");

gl.useProgram(program);

// uniform locations
var proj_loc = gl.getUniformLocation(program, "uViewProjection");
var model_loc = gl.getUniformLocation(program, "uModel");

var charge_loc = gl.getUniformLocation(program, "uCharge");

var proj_loc_grid = gl.getUniformLocation(grid_program, "uViewProjection");
var model_loc_grid = gl.getUniformLocation(grid_program, "uModel");

var proj_loc_arrow = gl.getUniformLocation(arrow_program, "uViewProjection");
var model_loc_arrow = gl.getUniformLocation(arrow_program, "uModel");

// geometry

// Change to be created from icosahedron
function createSphere(width, height, rho)
{
    var vertex_size = 6 * (width + 1) * (height + 1);
    var index_size = 6 * width * height;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    var vertex_index = 0;
    var indices_index = 0;

    for (var h = 0; h <= height; ++h)
    {
        for (var w = 0; w <= width; ++w)
        {
            var u = w / width;
            var v = h / height;
            var theta = u * Math.PI * 2.0;
            var phi = v * Math.PI;

            var x = Math.sin(phi) * Math.cos(theta);
            var y = Math.cos(phi);
            var z = Math.sin(phi) * Math.sin(theta);

            vertices[vertex_index * 6 + 0] = x * rho;
            vertices[vertex_index * 6 + 1] = -y * rho;
            vertices[vertex_index * 6 + 2] = z * rho;
            vertices[vertex_index * 6 + 3] = x;
            vertices[vertex_index * 6 + 4] = -y;
            vertices[vertex_index * 6 + 5] = z;

            ++vertex_index;
        }
    }

    for (var h = 0; h < height; ++h)
    {
        for (var w = 0; w < width; ++w)
        {
            var top_left = w * (width + 1) + h;
            var top_right = top_left + 1;
            var bot_left = top_left + width + 1;
            var bot_right = top_right + width + 1;

            indices[indices_index * 6 + 0] = top_left;
            indices[indices_index * 6 + 1] = bot_right;
            indices[indices_index * 6 + 2] = top_right;
            indices[indices_index * 6 + 3] = bot_right;
            indices[indices_index * 6 + 4] = top_left;
            indices[indices_index * 6 + 5] = bot_left;

            ++indices_index;
        }
    }

    return {
        vertices: vertices,
        indices: indices
    }
}

function createGrid(norm, scale, width)
{
    var vertex_size = 12 * width + 12;
    var index_size = 4 * (width + 1);
    // model uniforms for instanced arrows
    var matrix_size = 16 * (width + 1) * (width + 1) * (width + 1);

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);
    var matrices = new Float32Array(matrix_size);

    var normal = vec3.create();
    vec3.normalize(normal, norm);

    var x_dir = vec3.create();
    vec3.cross(x_dir, normal, vec3.fromValues(0.0, 1.0, 0.01));
    vec3.normalize(x_dir, x_dir);

    var y_dir = vec3.create();
    vec3.cross(y_dir, normal, x_dir);
    vec3.normalize(y_dir, y_dir);

    console.log("x: " + x_dir);
    console.log("y: " + y_dir);

    var dist = (width * scale) / 2.0;

    var grid_matrix = mat3.fromValues(x_dir[0], x_dir[1], x_dir[2],
                                      y_dir[0], y_dir[1], y_dir[2],
                                      normal[0], normal[1], normal[2]);

    for (var i = 0; i < width + 1; ++i)
    {
        x = ((i / width) - 0.5) * dist * 2;

        // parallel to x-axis
        var pos_x1 = vec3.fromValues(-dist, x, 0.0);
        var pos_x2 = vec3.fromValues(dist, x, 0.0);
        // parallel to y-axis
        var pos_y1 = vec3.fromValues(x, dist, 0.0);
        var pos_y2 = vec3.fromValues(x, -dist, 0.0);

        vec3.transformMat3(pos_x1, pos_x1, grid_matrix);
        vec3.transformMat3(pos_x2, pos_x2, grid_matrix);
        vec3.transformMat3(pos_y1, pos_y1, grid_matrix);
        vec3.transformMat3(pos_y2, pos_y2, grid_matrix);

        vertices[i * 12 + 0]  = pos_x1[0];
        vertices[i * 12 + 1]  = pos_x1[1];
        vertices[i * 12 + 2]  = pos_x1[2];

        vertices[i * 12 + 3]  = pos_x2[0];
        vertices[i * 12 + 4]  = pos_x2[1];
        vertices[i * 12 + 5]  = pos_x2[2];

        vertices[i * 12 + 6]  = pos_y1[0];
        vertices[i * 12 + 7]  = pos_y1[1];
        vertices[i * 12 + 8]  = pos_y1[2];

        vertices[i * 12 + 9]  = pos_y2[0];
        vertices[i * 12 + 10] = pos_y2[1];
        vertices[i * 12 + 11] = pos_y2[2];
    }

    for (var i = 0; i < indices.length; ++i)
    {
        indices[i] = i;
    }

    // converting grid matrix to mat4
    var grid_mat = mat4.create();
    grid_mat[0] = grid_matrix[0];
    grid_mat[1] = grid_matrix[1];
    grid_mat[2] = grid_matrix[2];
    grid_mat[4] = grid_matrix[3];
    grid_mat[5] = grid_matrix[4];
    grid_mat[6] = grid_matrix[5];
    grid_mat[8] = grid_matrix[6];
    grid_mat[9] = grid_matrix[7];
    grid_mat[10] = grid_matrix[8];
    grid_mat[15] = 1.0;

    var index = 0;
    for (var z = 0; z < width + 1; ++z)
    {
        var pz = ((z / width) - 0.5) * dist * 2;
        for (var y = 0; y < width + 1; ++y)
        {
            var py = ((y / width) - 0.5) * dist * 2;
            for (var x = 0; x < width + 1; ++x)
            {
                var px = ((x / width) - 0.5) * dist * 2;
            
                var mat = mat4.create();
                mat4.scalar.translate(mat, mat, vec3.fromValues(px, pz, py));

                mat4.multiply(mat, mat, grid_mat);

                for (var i = 0; i < 16; ++i)
                {
                    matrices[index * 16 + i] = mat[i];
                }
                ++index;
            }
        }
    }


    return {
        vertices: vertices,
        indices: indices,
        matrices: matrices
    }
}

function createArrow()
{
    var width = 8;
    var inside_r = 0.015;
    var outside_r = 0.04;
    var point_height = 0.4;
    var height = 0.5


    var vertex_size = 3 * 3 * width + 6;
    var index_size = 18 * width;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    for (var i = 0; i < width; ++i)
    {
        var angle = (i / width) * 2 * Math.PI;
        var x = Math.cos(angle);
        var y = Math.sin(angle);

        // bottom
        vertices[i * 9 + 0] = x  * inside_r;
        vertices[i * 9 + 1] = y * inside_r;
        vertices[i * 9 + 2] = 0;

        // inside point
        vertices[i * 9 + 3] = x * inside_r;
        vertices[i * 9 + 4] = y * inside_r;
        vertices[i * 9 + 5] = point_height;

        // outside point
        vertices[i * 9 + 6] = x * outside_r;
        vertices[i * 9 + 7] = y * outside_r;
        vertices[i * 9 + 8] = point_height;
    }
    // tip
    vertices[vertex_size - 3] = 0.0;
    vertices[vertex_size - 2] = 0.0;
    vertices[vertex_size - 1] = height;

    // bottom center
    vertices[vertex_size - 6] = 0.0;
    vertices[vertex_size - 5] = 0.0;
    vertices[vertex_size - 4] = 0.0;

    var bottom_middle = vertex_size / 3;
    var top_middle = vertex_size / 3 - 1;

    for (var i = 0; i < width; ++i)
    {
        var bottom = i * 3;
        var bottom_right = bottom + 3;
        if (i >= width - 1) // last index
            bottom_right = 0;
        var inside = i * 3 + 1;
        var inside_right = inside + 3;
        if (i >= width - 1) // last index
            inside_right = 1;
        var outside = i * 3 + 2;
        var outside_right = outside + 3;
        if (i >= width - 1) // last index
            outside_right = 2;

        // bottom
        indices[i * 18 + 0] = bottom_middle;
        indices[i * 18 + 1] = bottom_right;
        indices[i * 18 + 2] = bottom;

        // side
        indices[i * 18 + 3] = inside;
        indices[i * 18 + 4] = bottom;
        indices[i * 18 + 5] = bottom_right;

        indices[i * 18 + 6] = bottom_right;
        indices[i * 18 + 7] = inside_right;
        indices[i * 18 + 8] = inside;

        // under point
        indices[i * 18 + 9] = inside_right;
        indices[i * 18 + 10] = outside;
        indices[i * 18 + 11] = inside;

        indices[i * 18 + 12] = inside_right;
        indices[i * 18 + 13] = outside_right;
        indices[i * 18 + 14] = outside;

        // point
        indices[i * 18 + 15] = outside_right;
        indices[i * 18 + 16] = top_middle;
        indices[i * 18 + 17] = outside;
    }

    return {
        vertices: vertices,
        indices: indices
    }
}

// creating spheres

var sphere_subdivisions = 8;
var sphere_radius = 0.1;

const spheres = [];

// min and max values of the sliders
var pos_min = -10.0;
var pos_max = 10.0;

function addSphere(position, radius, charge)
{
    // creating array buffer
    var sphere = createSphere(sphere_subdivisions, sphere_subdivisions, radius);

    console.log(sphere);

    var VBO = gl.createBuffer();

    var VAO = gl.createVertexArray();

    gl.bindVertexArray(VAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(1);

    var EBO = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

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
    slider_x.id = spheres.length * 3;
    div.appendChild(slider_x);

    slider_x.oninput = function () {
        spheres[slider_x.id / 3].position[0] = slider_x.value;
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
    slider_y.id = spheres.length * 3 + 1;
    div.appendChild(slider_y);

    slider_y.oninput = function () {
        spheres[(slider_y.id - 1) / 3].position[1] = slider_y.value;
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
    slider_z.id = spheres.length * 3 + 2;
    div.appendChild(slider_z);

    slider_z.oninput = function () {
        spheres[(slider_z.id - 2) / 3].position[2] = slider_z.value;
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
    slider_charge.name = spheres.length;
    div.appendChild(slider_charge);

    slider_charge.oninput = function () {
        spheres[slider_charge.name].charge = slider_charge.value;
    }

    spheres.push({
        position: position,
        length: sphere.indices.length,
        charge: charge,
        mVAO: VAO
    });
}

var add_charge = document.getElementById("add-charge-button");
// change to have a charge input
add_charge.addEventListener("click", (e) => {
    addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 1.0);
}, false);

addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 1.0);

addSphere(vec3.fromValues(1.0, 2.0, 1.0), sphere_radius * 2, 1.0);

console.log("num spheres " + spheres.length);

// creating grid
var grid = createGrid(vec3.fromValues(0.0, 1.0, 0.0), 0.5, 10);

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

gl.bindBuffer(gl.ARRAY_BUFFER, aVBO);
gl.bufferData(gl.ARRAY_BUFFER, arrow.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var model_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, model_buffer);
gl.bufferData(gl.ARRAY_BUFFER, grid.matrices, gl.DYNAMIC_DRAW);

gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 16 * 4, 0);
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 16 * 4, 16);
gl.enableVertexAttribArray(3);
gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 16 * 4, 32);
gl.enableVertexAttribArray(4);
gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 16 * 4, 48);

gl.vertexAttribDivisor(1, 1);
gl.vertexAttribDivisor(2, 1);
gl.vertexAttribDivisor(3, 1);
gl.vertexAttribDivisor(4, 1);

var aEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, aEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrow.indices, gl.STATIC_DRAW);

// MVP matrices

var cam_dist = 6.0;

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

function draw(time)
{
    var seconds = time * 0.001;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // sphere
    gl.useProgram(program);

    for (var i = 0; i < spheres.length; ++i)
    {
        gl.uniformMatrix4fv(proj_loc, false, viewProj);

        var model = mat4.create();
        mat4.scalar.translate(model, model, spheres[i].position);
        gl.uniformMatrix4fv(model_loc, false, model);

        gl.uniform1f(charge_loc, spheres[i].charge);

        gl.bindVertexArray(spheres[i].mVAO);
        gl.drawElements(gl.TRIANGLES, spheres[i].length, gl.UNSIGNED_INT, 0);
    }

    // grid
    gl.useProgram(grid_program);

    gl.uniformMatrix4fv(proj_loc_grid, false, viewProj);

    var model = mat4.create();
    gl.uniformMatrix4fv(model_loc_grid, false, model);

    gl.bindVertexArray(gVAO);
    gl.drawElements(gl.LINES, grid.indices.length, gl.UNSIGNED_INT, 0);

    // arrows
    gl.useProgram(arrow_program);

    gl.uniformMatrix4fv(proj_loc_arrow, false, viewProj);

    var arrow_model = mat4.create();
    mat4.scalar.translate(arrow_model, arrow_model, vec3.fromValues(1.0, 0.0, -1.0));
    gl.uniformMatrix4fv(model_loc_arrow, false, arrow_model);

    gl.bindVertexArray(aVAO);
    gl.drawElementsInstanced(gl.TRIANGLES, arrow.indices.length, gl.UNSIGNED_INT, 0, grid.matrices.length / 16);

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

