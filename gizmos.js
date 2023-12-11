// move box
var box_prefab = createCube(0.2);
console.log(box_prefab);

var boxVBO = gl.createBuffer();

var boxVAO = gl.createVertexArray();

gl.bindVertexArray(boxVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, boxVBO);
gl.bufferData(gl.ARRAY_BUFFER, box_prefab.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var boxEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, box_prefab.indices, gl.STATIC_DRAW);

var gizmos_program = createProgram("#GizmosVertex-shader", "#GizmosFragment-shader");

var proj_loc_gizmos = gl.getUniformLocation(gizmos_program, "uViewProjection");
var model_loc_gizmos = gl.getUniformLocation(gizmos_program, "uModel");
var color_loc_gizmos = gl.getUniformLocation(gizmos_program, "uColor");

// translate arrow
var arrow_prefab = createArrow(scale=2.0);
console.log(arrow_prefab);

var arrowVBO = gl.createBuffer();

var arrowVAO = gl.createVertexArray();

gl.bindVertexArray(arrowVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, arrowVBO);
gl.bufferData(gl.ARRAY_BUFFER, arrow_prefab.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var arrowEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrow_prefab.indices, gl.STATIC_DRAW);

// picking translate arrow
var arrow_pick_prefab = createArrow(scale = 2.0, in_r = 0.04, out_r = 0.08);
console.log(arrow_pick_prefab);

var arrow_pickVBO = gl.createBuffer();

var arrow_pickVAO = gl.createVertexArray();

gl.bindVertexArray(arrow_pickVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, arrow_pickVBO);
gl.bufferData(gl.ARRAY_BUFFER, arrow_pick_prefab.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var arrow_pickEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrow_pickEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrow_pick_prefab.indices, gl.STATIC_DRAW);

// rotate ring
var rotate_prefab = createRing();

var rotateVBO = gl.createBuffer();

var rotateVAO = gl.createVertexArray();

gl.bindVertexArray(rotateVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, rotateVBO);
gl.bufferData(gl.ARRAY_BUFFER, rotate_prefab.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
gl.enableVertexAttribArray(0);

var rotateEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rotateEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rotate_prefab.indices, gl.STATIC_DRAW);

// rotate washer
var rotate_washer_prefab = createWasher(0.8, 1.2);

var rotate_washerVBO = gl.createBuffer();

var rotate_washerVAO = gl.createVertexArray();

gl.bindVertexArray(rotate_washerVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, rotate_washerVBO);
gl.bufferData(gl.ARRAY_BUFFER, rotate_washer_prefab.vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);
gl.enableVertexAttribArray(0);

gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
gl.enableVertexAttribArray(1);

var rotate_washerEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rotate_washerEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rotate_washer_prefab.indices, gl.STATIC_DRAW);

var gizmos_shape;

var current_gizmo_action = "none";

var rotate_pos = vec3.create();

function drawTransformGizmo(proj, scale, options)
{
    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.useProgram(gizmos_program);

    // draw box
    gl.bindVertexArray(boxVAO);

    var model = mat4.create();

    var position = gizmos_shape.position;
    if (position === undefined)
        position = gizmos_shape.position_a;
    
    mat4.scalar.translate(model, model, position);
    mat4.scale(model, model, scale);

    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniformMatrix4fv(proj_loc_gizmos, false, proj);
    gl.uniform4f(color_loc_gizmos, 0.5, 0.5, 0.5, 1.0);

    gl.drawElements(gl.TRIANGLES, box_prefab.indices.length, gl.UNSIGNED_INT, 0);

    gl.disable(gl.CULL_FACE);

    // z
    gl.uniform4f(color_loc_gizmos, options.tz_color[0], options.tz_color[1], options.tz_color[2], 1.0);
    gl.bindVertexArray(options.translateVAO);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);

    if (gizmos_shape.normal)
    {
        gl.uniform4f(color_loc_gizmos, options.rz_color[0], options.rz_color[1], options.rz_color[2], 1.0);
        gl.bindVertexArray(options.rotateVAO);
        gl.drawElements(options.draw_mode, options.length, gl.UNSIGNED_INT, 0);
    }

    // y
    mat4.rotate(model, model, Math.PI / 2.0, vec3.fromValues(-1.0, 0.0, 0.0));
    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniform4f(color_loc_gizmos, options.ty_color[0], options.ty_color[1], options.ty_color[2], 1.0);
    gl.bindVertexArray(options.translateVAO);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);

    if (gizmos_shape.normal)
    {
        gl.uniform4f(color_loc_gizmos, options.ry_color[0], options.ry_color[1], options.ry_color[2], 1.0);
        gl.bindVertexArray(options.rotateVAO);
        gl.drawElements(options.draw_mode, options.length, gl.UNSIGNED_INT, 0);
    }

    // x
    mat4.rotate(model, model, Math.PI / 2.0, vec3.fromValues(0.0, 1.0, 0.0));
    gl.uniformMatrix4fv(model_loc_gizmos, false, model);
    gl.uniform4f(color_loc_gizmos, options.tx_color[0], options.tx_color[1], options.tx_color[2], 1.0);
    gl.bindVertexArray(options.translateVAO);
    gl.drawElements(gl.TRIANGLES, arrow_prefab.indices.length, gl.UNSIGNED_INT, 0);

    if (gizmos_shape.normal)
    {
        gl.uniform4f(color_loc_gizmos, options.rx_color[0], options.rx_color[1], options.rx_color[2], 1.0);
        gl.bindVertexArray(options.rotateVAO);
        gl.drawElements(options.draw_mode, options.length, gl.UNSIGNED_INT, 0);
    }

    gl.enable(gl.CULL_FACE);
}

function drawGizmoPicking(proj)
{
    var options = {
        rotateVAO: rotate_washerVAO,
        translateVAO: arrow_pickVAO,
        draw_mode: gl.TRIANGLES,
        length: rotate_washer_prefab.indices.length,
        rx_color: vec3.fromValues(0.0, 1.0, 1.0),
        ry_color: vec3.fromValues(1.0, 0.0, 1.0),
        rz_color: vec3.fromValues(1.0, 1.0, 0.0),
        tx_color: vec3.fromValues(1.0, 0.0, 0.0),
        ty_color: vec3.fromValues(0.0, 1.0, 0.0),
        tz_color: vec3.fromValues(0.0, 0.0, 1.0)
    };

    // draw to gizmo picking framebuffer
    drawTransformGizmo(proj, vec3.fromValues(1.0, 1.0, 1.0), options);
}

function drawGizmoScreen(proj)
{
    options = {
        rotateVAO: rotateVAO,
        translateVAO: arrowVAO,
        draw_mode: gl.LINES,
        length: rotate_prefab.indices.length,
        rx_color: vec3.fromValues(1.0, 0.36, 0.29),
        ry_color: vec3.fromValues(0.5843, 1.0, 0.29),
        rz_color: vec3.fromValues(0.29, 0.5137, 1.0),
        tx_color: vec3.fromValues(1.0, 0.0, 0.0),
        ty_color: vec3.fromValues(0.0, 1.0, 0.0),
        tz_color: vec3.fromValues(0.0, 0.0, 1.0)
    };

    drawTransformGizmo(proj, vec3.fromValues(1.0, 1.0, 1.0), options);
}

function isGizmoActive()
{
    if (!gizmos_shape || gizmos_shape === null)
    {
        return false;
    }
    return true;
}

function drawGizmo(proj, fb)
{
    if (!gizmos_shape || gizmos_shape === null)
    {
        /*gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);*/

        return;
    }

    var options = {
        rotateVAO: rotate_washerVAO,
        translateVAO: arrow_pickVAO,
        draw_mode: gl.TRIANGLES,
        length: rotate_washer_prefab.indices.length,
        rx_color: vec3.fromValues(0.0, 1.0, 1.0),
        ry_color: vec3.fromValues(1.0, 0.0, 1.0),
        rz_color: vec3.fromValues(1.0, 1.0, 0.0),
        tx_color: vec3.fromValues(1.0, 0.0, 0.0),
        ty_color: vec3.fromValues(0.0, 1.0, 0.0),
        tz_color: vec3.fromValues(0.0, 0.0, 1.0)
    };

    // draw to gizmo picking framebuffer
    drawTransformGizmo(proj, vec3.fromValues(1.0, 1.0, 1.0), options);

    options = {
        rotateVAO: rotateVAO,
        translateVAO: arrowVAO,
        draw_mode: gl.LINES,
        length: rotate_prefab.indices.length,
        rx_color: vec3.fromValues(1.0, 0.36, 0.29),
        ry_color: vec3.fromValues(0.5843, 1.0, 0.29),
        rz_color: vec3.fromValues(0.29, 0.5137, 1.0),
        tx_color: vec3.fromValues(1.0, 0.0, 0.0),
        ty_color: vec3.fromValues(0.0, 1.0, 0.0),
        tz_color: vec3.fromValues(0.0, 0.0, 1.0)
    };

    // draw to canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    drawTransformGizmo(proj, vec3.fromValues(1.0, 1.0, 1.0), options);
}

const x_axis = vec3.fromValues(1.0, 0.0, 0.0);
const y_axis = vec3.fromValues(0.0, 1.0, 0.0);
const z_axis = vec3.fromValues(0.0, 0.0, 1.0);

function computeGizmoAction(proj, id, ray, dx, dy)
{
    if (!gizmos_shape)
        return;

    var position = gizmos_shape.position;
    if (position === undefined)
        position = gizmos_shape.position_a;

    var normal = gizmos_shape.normal;
    //if (normal === undefined)

    var inverse = mat4.create();
    mat4.scalar.invert(inverse, proj);
    var dv = vec4.fromValues(dx, dy, 0.0, 0.0);
    vec4.transformMat4(dv, dv, inverse);


    // rotation calculations
    var b = vec3.create(); // closest point on circle

    var p_a = vec3.create();
    vec3.subtract(p_a, position, ray.pos);
    var l = vec3.dot(ray.dir, p_a);

    var c = vec3.create(); // closest point on the sphere to the ray
    vec3.scale(c, ray.dir, l);
    vec3.subtract(c, c, p_a);
    vec3.normalize(c, c);
    vec3.scale(c, c, 1.0); // radius of sphere

    var rotate_axis = null;

    //console.log(dv);
    var vec = vec3.fromValues(dv[0], dv[1], dv[2]);

    switch (id)
    {
        // x
        case -16776961:
            current_gizmo_action = "translate_x";
            console.log("x");
            var x_amount = vec3.dot(vec, x_axis) * 10.0;
            position[0] += x_amount
            break;
        // y
        case -16711936:
            current_gizmo_action = "translate_y";
            console.log("y");
            var y_amount = vec3.dot(vec, y_axis) * 10.0;
            position[1] += y_amount
            break;
        // z
        case -65536:
            current_gizmo_action = "translate_z";
            console.log("z");
            var z_amount = vec3.dot(vec, z_axis) * 10.0;
            position[2] += z_amount
            break;
        // move
        case -8355712:
            current_gizmo_action = "move";
            position[0] += dv[0] * 10.0;
            position[1] += dv[1] * 10.0;
            position[2] += dv[2] * 10.0;
            break;
        case -256:
            current_gizmo_action = "rotate_x";
            console.log("rotate x");
            rotate_axis = x_axis;
            break;
        case -65281:
            current_gizmo_action = "rotate_y";
            console.log("rotate y");
            rotate_axis = y_axis;
            break;
        case -16711681:
            current_gizmo_action = "rotate_z";
            console.log("rotate z");
            rotate_axis = z_axis;
    }

    if (rotate_axis !== null)
    {
        var i_hat = vec3.create(); // i, j, k unit vectors
        vec3.cross(i_hat, rotate_axis, up);
        vec3.normalize(i_hat, i_hat);
        var j_hat = vec3.create();
        vec3.cross(j_hat, i_hat, rotate_axis);

        var c_prime = vec3.create(); // projecting c onto the plane
        var c_i = vec3.dot(c, i_hat);
        var c_j = vec3.dot(c, j_hat);
        var i_prime = vec3.create();
        vec3.scale(i_prime, i_hat, c_i);
        var j_prime = vec3.create();
        vec3.scale(j_prime, j_hat, c_j);
        vec3.add(c_prime, i_prime, j_prime);
        vec3.normalize(c_prime, c_prime);
        vec3.scale(c_prime, c_prime, 1.0); // radius of circle
        vec3.add(b, c_prime, position);


        if (rotate_axis != null && vec3.length(rotate_pos) !== 0.0)
        {
            // compute angle between b and rotate_pos
            var va = vec3.create();
            vec3.subtract(va, rotate_pos, position);
            var vb = vec3.create();
            vec3.subtract(vb, b, position);

            var angle = Math.acos(vec3.dot(va, vb) / (vec3.length(va) * vec3.length(vb)));
            var cross = vec3.create();
            vec3.cross(cross, va, vb);
            var dot = vec3.dot(rotate_axis, cross);
            if (dot < 0)
                angle = -angle;

            if (rotate_axis === x_axis)
                vec3.rotateX(gizmos_shape.normal, normal, vec3.fromValues(0.0, 0.0, 0.0), angle);
            else if (rotate_axis === y_axis)
                vec3.rotateY(gizmos_shape.normal, normal, vec3.fromValues(0.0, 0.0, 0.0), angle);
            else if (rotate_axis === z_axis)
                vec3.rotateZ(gizmos_shape.normal, normal, vec3.fromValues(0.0, 0.0, 0.0), angle);
        }
        rotate_pos = b;
        rotate_axis = null;
    }
}

function gizmosMouseUp()
{
    vec3.set(rotate_pos, 0.0, 0.0, 0.0);
    rotate_axis = null;
}