// box
var box_prefab = createCube(0.2);
console.log(box_prefab);

var boxVBO = gl.createBuffer();

var boxVAO = gl.createVertexArray();

gl.bindVertexArray(boxVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, boxVBO);
gl.bufferData(gl.ARRAY_BUFFER, box_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var boxEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, box_prefab.indices, gl.STATIC_DRAW);

var gizmos_program = createProgram("#GizmosVertex-shader", "#GizmosFragment-shader");

var proj_loc_gizmos = gl.getUniformLocation(gizmos_program, "uViewProjection");
var model_loc_gizmos = gl.getUniformLocation(gizmos_program, "uModel");
var color_loc_gizmos = gl.getUniformLocation(gizmos_program, "uColor");

// arrow
var arrow_prefab = createArrow(2.0);
console.log(arrow_prefab);

var arrowVBO = gl.createBuffer();

var arrowVAO = gl.createVertexArray();

gl.bindVertexArray(arrowVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, arrowVBO);
gl.bufferData(gl.ARRAY_BUFFER, arrow_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var arrowEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrow_prefab.indices, gl.STATIC_DRAW);

var gizmos_shape;

function drawTransformGizmo(proj)
{
    if (!gizmos_shape)
        return;

    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.useProgram(gizmos_program);

    // draw box
    gl.bindVertexArray(boxVAO);

    var model = mat4.create();

    mat4.scalar.translate(model, model, gizmos_shape.position);

    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniformMatrix4fv(proj_loc_gizmos, false, proj);
    gl.uniform3f(color_loc_gizmos, 0.5, 0.5, 0.5);

    gl.drawElements(gl.TRIANGLES, box_prefab.indices.length, gl.UNSIGNED_INT, 0);

    // draw arrow
    gl.bindVertexArray(arrowVAO);

    // z
    gl.uniform3f(color_loc_gizmos, 0.0, 0.0, 1.0);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);

    // y
    mat4.rotate(model, model, Math.PI / 2.0, vec3.fromValues(-1.0, 0.0, 0.0));
    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniform3f(color_loc_gizmos, 0.0, 1.0, 0.0);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);

    // x
    mat4.rotate(model, model, Math.PI / 2.0, vec3.fromValues(0.0, 1.0, 0.0));
    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniform3f(color_loc_gizmos, 1.0, 0.0, 0.0);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);
}