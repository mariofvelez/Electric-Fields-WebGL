// geometry

// Change to be created from icosahedron
function createSphere(width, height, rho) {
    var vertex_size = 6 * (width + 1) * (height + 1);
    var index_size = 6 * width * height;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    var vertex_index = 0;
    var indices_index = 0;

    for (var h = 0; h <= height; ++h) {
        for (var w = 0; w <= width; ++w) {
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

    for (var h = 0; h < height; ++h) {
        for (var w = 0; w < width; ++w) {
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

function createGrid(norm, scale, width) {
    var vertex_size = 12 * width + 12;
    var index_size = 4 * (width + 1);
    // model uniforms for instanced arrows
    var arrow_size = 3 * (width + 1) * (width + 1) * (width + 1);
    var matrix_size = (16 + 3) * (width + 1) * (width + 1) * (width + 1); // stores color and transform f each arrow, interleaved

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);
    var arrow_vertices = new Float32Array(arrow_size);
    var matrices = new Float32Array(matrix_size);

    var normal = vec3.create();
    vec3.normalize(normal, norm);

    var x_dir = vec3.create();
    vec3.cross(x_dir, normal, vec3.fromValues(0.0, 1.0, 0.01));
    vec3.normalize(x_dir, x_dir);

    var y_dir = vec3.create();
    vec3.cross(y_dir, normal, x_dir);
    vec3.normalize(y_dir, y_dir);

    var dist = (width * scale) / 2.0;

    var grid_matrix = mat3.fromValues(x_dir[0], x_dir[1], x_dir[2],
        y_dir[0], y_dir[1], y_dir[2],
        normal[0], normal[1], normal[2]);

    for (var i = 0; i < width + 1; ++i) {
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

        vertices[i * 12 + 0] = pos_x1[0];
        vertices[i * 12 + 1] = pos_x1[1];
        vertices[i * 12 + 2] = pos_x1[2];

        vertices[i * 12 + 3] = pos_x2[0];
        vertices[i * 12 + 4] = pos_x2[1];
        vertices[i * 12 + 5] = pos_x2[2];

        vertices[i * 12 + 6] = pos_y1[0];
        vertices[i * 12 + 7] = pos_y1[1];
        vertices[i * 12 + 8] = pos_y1[2];

        vertices[i * 12 + 9] = pos_y2[0];
        vertices[i * 12 + 10] = pos_y2[1];
        vertices[i * 12 + 11] = pos_y2[2];
    }

    for (var i = 0; i < indices.length; ++i) {
        indices[i] = i;
    }

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
    for (var z = 0; z < width + 1; ++z) {
        var pz = ((z / width) - 0.5) * dist * 2;
        for (var y = 0; y < width + 1; ++y) {
            var py = ((y / width) - 0.5) * dist * 2;
            for (var x = 0; x < width + 1; ++x) {
                var px = ((x / width) - 0.5) * dist * 2;

                var pos = vec4.fromValues(px, py, pz, 1.0);

                vec4.transformMat4(pos, pos, grid_mat);

                arrow_vertices[index * 3 + 0] = pos[0];
                arrow_vertices[index * 3 + 1] = pos[1];
                arrow_vertices[index * 3 + 2] = pos[2];

                ++index;
            }
        }
    }


    return {
        vertices: vertices,
        indices: indices,
        arrow_vertices: arrow_vertices,
        matrices: matrices,
        grid_matrix: grid_mat
    }
}

function createArrow() {
    var width = 8;
    var inside_r = 0.015;
    var outside_r = 0.04;
    var point_height = 0.4;
    var height = 0.5


    var vertex_size = 3 * 3 * width + 6;
    var index_size = 18 * width;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    for (var i = 0; i < width; ++i) {
        var angle = (i / width) * 2 * Math.PI;
        var x = Math.cos(angle);
        var y = Math.sin(angle);

        // bottom
        vertices[i * 9 + 0] = x * inside_r;
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

    for (var i = 0; i < width; ++i) {
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

function createLineSegment()
{
    var vertex_size = 6;
    var index_size = 2;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    vertices[0] = 0.0;
    vertices[1] = 0.0;
    vertices[2] = 0.0;
    vertices[3] = 0.0;
    vertices[4] = 0.0;
    vertices[5] = 1.0;

    indices[0] = 0;
    indices[1] = 1;

    return {
        vertices: vertices,
        indices: indices
    }
}

function createRing()
{
    var subdivisions = 32;

    var vertex_size = 3 * subdivisions;
    var index_size = 2 * subdivisions;

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    for (var i = 0; i < subdivisions; ++i)
    {
        var theta = 2.0 * Math.PI * (i / subdivisions);
        vertices[i * 3 + 0] = Math.cos(theta);
        vertices[i * 3 + 1] = Math.sin(theta);
        vertices[i * 3 + 2] = 0.0;

        indices[i * 2 + 0] = i;
        indices[i * 2 + 1] = i + 1;
        if (i === subdivisions - 1)
            indices[i * 2 + 1] = 0;
    }

    return {
        vertices: vertices,
        indices: indices
    }
}

function createDisc()
{
    var subdivisions = 32;

    var vertex_size = 6 * subdivisions;
    var index_size = 3 * (subdivisions - 2);

    var vertices = new Float32Array(vertex_size);
    var indices = new Uint32Array(index_size);

    for (var i = 0; i < subdivisions; ++i)
    {
        var theta = 2.0 * Math.PI * i / subdivisions;
        vertices[i * 6 + 0] = Math.cos(theta);
        vertices[i * 6 + 1] = Math.sin(theta);
        vertices[i * 6 + 2] = 0.0;
        vertices[i * 6 + 3] = 0.0;
        vertices[i * 6 + 4] = 0.0;
        vertices[i * 6 + 5] = 1.0;

        if (i < subdivisions - 2)
        {
            indices[i * 3 + 0] = 0;
            indices[i * 3 + 1] = i + 1;
            indices[i * 3 + 2] = i + 2;
        }
    }

    return {
        vertices: vertices,
        indices: indices
    }
}