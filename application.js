var canvas = document.querySelector("#c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext("webgl2");

if (!gl) {
    console.error("WebGL not supported!");
}

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.viewport(0, 0, canvas.width, canvas.height);

var lg_nodes_loc;
var lg_weights_loc;
var gk_nodes_loc;
var gk_weights_loc;

// Weights and Abscissae for Gauss-Kronrod integration
/*var lg_nodes = new Float32Array([
    0.0,
    0.4058451513773971669066064120769615,
    -0.4058451513773971669066064120769615,
    0.7415311855993944398638647732807884,
    -0.7415311855993944398638647732807884,
    0.9491079123427585245261896840478513,
    -0.9491079123427585245261896840478513
]);
var lg_weights = new Float32Array([
    4.179591836734693877551020408163265e-01,
    3.818300505051189449503697754889751e-01,
    3.818300505051189449503697754889751e-01,
    2.797053914892766679014677714237796e-01,
    2.797053914892766679014677714237796e-01,
    1.294849661688696932706114326790820e-01,
    1.294849661688696932706114326790820e-01
]);
var gk_nodes = new Float32Array([
    0.0,
    2.077849550078984676006894037732449e-01,
    -2.077849550078984676006894037732449e-01,
    4.058451513773971669066064120769615e-01,
    -4.058451513773971669066064120769615e-01,
    5.860872354676911302941448382587296e-01,
    -5.860872354676911302941448382587296e-01,
    7.415311855993944398638647732807884e-01,
    -7.415311855993944398638647732807884e-01,
    8.648644233597690727897127886409262e-01,
    -8.648644233597690727897127886409262e-01,
    9.491079123427585245261896840478513e-01,
    -9.491079123427585245261896840478513e-01,
    9.914553711208126392068546975263285e-01,
    -9.914553711208126392068546975263285e-01
]);
var gk_weights = new Float32Array([
    2.094821410847278280129991748917143e-01,
    2.044329400752988924141619992346491e-01,
    2.044329400752988924141619992346491e-01,
    1.903505780647854099132564024210137e-01,
    1.903505780647854099132564024210137e-01,
    1.690047266392679028265834265985503e-01,
    1.690047266392679028265834265985503e-01,
    1.406532597155259187451895905102379e-01,
    1.406532597155259187451895905102379e-01,
    1.047900103222501838398763225415180e-01,
    1.047900103222501838398763225415180e-01,
    6.309209262997855329070066318920429e-02,
    6.309209262997855329070066318920429e-02,
    2.293532201052922496373200805896959e-02,
    2.293532201052922496373200805896959e-02
]);*/
//G25, K51
var lg_nodes = new Float32Array([
    0.0,
    1.228646926107103963873598188080368e-01,
    -1.228646926107103963873598188080368e-01,
    2.438668837209884320451903627974516e-01,
    -2.438668837209884320451903627974516e-01,
    3.611723058093878377358217301276407e-01,
    -3.611723058093878377358217301276407e-01,
    4.730027314457149605221821150091920e-01,
    -4.730027314457149605221821150091920e-01,
    5.776629302412229677236898416126541e-01,
    -5.776629302412229677236898416126541e-01,
    6.735663684734683644851206332476222e-01,
    -6.735663684734683644851206332476222e-01,
    7.592592630373576305772828652043610e-01,
    -7.592592630373576305772828652043610e-01,
    8.334426287608340014210211086935696e-01,
    -8.334426287608340014210211086935696e-01,
    8.949919978782753688510420067828050e-01,
    -8.949919978782753688510420067828050e-01,
    9.429745712289743394140111696584705e-01,
    -9.429745712289743394140111696584705e-01,
    9.766639214595175114983153864795941e-01,
    -9.766639214595175114983153864795941e-01,
    9.955569697904980979087849468939016e-01,
    -9.955569697904980979087849468939016e-01
]);
var lg_weights = new Float32Array([
    1.231760537267154512039028730790501e-01,
    1.222424429903100416889595189458515e-01,
    1.222424429903100416889595189458515e-01,
    1.194557635357847722281781265129010e-01,
    1.194557635357847722281781265129010e-01,
    1.148582591457116483393255458695558e-01,
    1.148582591457116483393255458695558e-01,
    1.085196244742636531160939570501166e-01,
    1.085196244742636531160939570501166e-01,
    1.005359490670506442022068903926858e-01,
    1.005359490670506442022068903926858e-01,
    9.102826198296364981149722070289165e-02,
    9.102826198296364981149722070289165e-02,
    8.014070033500101801323495966911130e-02,
    8.014070033500101801323495966911130e-02,
    6.803833381235691720718718565670797e-02,
    6.803833381235691720718718565670797e-02,
    5.490469597583519192593689154047332e-02,
    5.490469597583519192593689154047332e-02,
    4.093915670130631265562348771164595e-02,
    4.093915670130631265562348771164595e-02,
    2.635498661503213726190181529529914e-02,
    2.635498661503213726190181529529914e-02,
    1.139379850102628794790296411323477e-02,
    1.139379850102628794790296411323477e-02
]);
var gk_nodes = new Float32Array([
    0.0,
    6.154448300568507888654639236679663e-02,
    -6.154448300568507888654639236679663e-02,
    1.228646926107103963873598188080368e-01,
    -1.228646926107103963873598188080368e-01,
    1.837189394210488920159698887595284e-01,
    -1.837189394210488920159698887595284e-01,
    2.438668837209884320451903627974516e-01,
    -2.438668837209884320451903627974516e-01,
    3.030895389311078301674789099803393e-01,
    -3.030895389311078301674789099803393e-01,
    3.611723058093878377358217301276407e-01,
    -3.611723058093878377358217301276407e-01,
    4.178853821930377488518143945945725e-01,
    -4.178853821930377488518143945945725e-01,
    4.730027314457149605221821150091920e-01,
    -4.730027314457149605221821150091920e-01,
    5.263252843347191825996237781580102e-01,
    -5.263252843347191825996237781580102e-01,
    5.776629302412229677236898416126541e-01,
    -5.776629302412229677236898416126541e-01,
    6.268100990103174127881226816245179e-01,
    -6.268100990103174127881226816245179e-01,
    6.735663684734683644851206332476222e-01,
    -6.735663684734683644851206332476222e-01,
    7.177664068130843881866540797732978e-01,
    -7.177664068130843881866540797732978e-01,
    7.592592630373576305772828652043610e-01,
    -7.592592630373576305772828652043610e-01,
    7.978737979985000594104109049943066e-01,
    -7.978737979985000594104109049943066e-01,
    8.334426287608340014210211086935696e-01,
    -8.334426287608340014210211086935696e-01,
    8.658470652932755954489969695883401e-01,
    -8.658470652932755954489969695883401e-01,
    8.949919978782753688510420067828050e-01,
    -8.949919978782753688510420067828050e-01,
    9.207471152817015617463460845463306e-01,
    -9.207471152817015617463460845463306e-01,
    9.429745712289743394140111696584705e-01,
    -9.429745712289743394140111696584705e-01,
    9.616149864258425124181300336601672e-01,
    -9.616149864258425124181300336601672e-01,
    9.766639214595175114983153864795941e-01,
    -9.766639214595175114983153864795941e-01,
    9.880357945340772476373310145774062e-01,
    -9.880357945340772476373310145774062e-01,
    9.955569697904980979087849468939016e-01,
    -9.955569697904980979087849468939016e-01,
    9.992621049926098341934574865403406e-01,
    9.992621049926098341934574865403406e-01
]);
var gk_weights = new Float32Array([
    6.158081806783293507875982424006455e-02,
    6.147118987142531666154413196526418e-02,
    6.147118987142531666154413196526418e-02,
    6.112850971705304830585903041629271e-02,
    6.112850971705304830585903041629271e-02,
    6.053945537604586294536026751756543e-02,
    6.053945537604586294536026751756543e-02,
    5.972034032417405997909929193256185e-02,
    5.972034032417405997909929193256185e-02,
    5.868968002239420796197417585678776e-02,
    5.868968002239420796197417585678776e-02,
    5.743711636156783285358269393950647e-02,
    5.743711636156783285358269393950647e-02,
    5.595081122041231730824068638274735e-02,
    5.595081122041231730824068638274735e-02,
    5.425112988854549014454337045987561e-02,
    5.425112988854549014454337045987561e-02,
    5.236288580640747586436671213787271e-02,
    5.236288580640747586436671213787271e-02,
    5.027767908071567196332525943344008e-02,
    5.027767908071567196332525943344008e-02,
    4.798253713883671390639225575691475e-02,
    4.798253713883671390639225575691475e-02,
    4.550291304992178890987058475266039e-02,
    4.550291304992178890987058475266039e-02,
    4.287284502017004947689579243949516e-02,
    4.287284502017004947689579243949516e-02,
    4.008382550403238207483928446707565e-02,
    4.008382550403238207483928446707565e-02,
    3.711627148341554356033062536761988e-02,
    3.711627148341554356033062536761988e-02,
    3.400213027432933783674879522955120e-02,
    3.400213027432933783674879522955120e-02,
    3.079230016738748889110902021522859e-02,
    3.079230016738748889110902021522859e-02,
    2.747531758785173780294845551781108e-02,
    2.747531758785173780294845551781108e-02,
    2.400994560695321622009248916488108e-02,
    2.400994560695321622009248916488108e-02,
    2.043537114588283545656829223593897e-02,
    2.043537114588283545656829223593897e-02,
    1.684781770912829823151666753633632e-02,
    1.684781770912829823151666753633632e-02,
    1.323622919557167481365640584697624e-02,
    1.323622919557167481365640584697624e-02,
    9.473973386174151607207710523655324e-03,
    9.473973386174151607207710523655324e-03,
    5.561932135356713758040236901065522e-03,
    5.561932135356713758040236901065522e-03,
    1.987383892330315926507851882843410e-03,
    1.987383892330315926507851882843410e-03
]);


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

function createComputeProgram(vertex_source, fragment_source)
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

    gl.transformFeedbackVaryings(program, ['color', 'transform'], gl.INTERLEAVED_ATTRIBS);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    return program;
}

function compileArrowCompute(vertex_source, fragment_source, shapes)
{
    var vertexShaderSource = document.querySelector(vertex_source).text.trim();
    var fragmentShaderSource = document.querySelector(fragment_source).text.trim();

    var shapes_text = "";
    var calculate_text = "";
    for (var i = 0; i < shapes.length; ++i)
    {
        switch (shapes[i].name)
        {
            case "sphere":
                shapes_text += "uniform Point Q" + i + ";\n";
                calculate_text += "z += computePoint(Q" + i + ", vpos);\n";
                break;
            case "line segment":
                shapes_text += "uniform LineSegment Q" + i + ";\n";
                calculate_text += "z += computeLineSegment(Q" + i + ", vpos);\n";
                break;
            case "plane":
                shapes_text += "uniform Plane Q" + i + ";\n";
                calculate_text += "z += computePlane(Q" + i + ", vpos);\n";
                break;
            case "ring":
                shapes_text += "uniform Ring Q" + i + ";\n";
                calculate_text += "z += computeGKRing(Q" + i + ", vpos);\n";
                break;
            case "disc":
                shapes_text += "uniform Disc Q" + i + ";\n";
                calculate_text += "z += computeGKDisc(Q" + i + ", vpos);\n";
                break;
            case "washer":
                shapes_text += "uniform Washer Q" + i + ";\n";
                calculate_text += "z += computeGKWasher(Q" + i + ", vpos);\n";
        }
    }

    vertexShaderSource = vertexShaderSource.replace("[shapes]", shapes_text);
    vertexShaderSource = vertexShaderSource.replace("[calculate]", calculate_text);

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

    // setting uniform locations
    for (var i = 0; i < shapes.length; ++i)
    {
        switch (shapes[i].name)
        {
            case "sphere":
                shapes[i].pos_loc = gl.getUniformLocation(program, "Q" + i + ".pos");
                shapes[i].charge_loc = gl.getUniformLocation(program, "Q" + i + ".q");
                break;
            case "line segment":
                shapes[i].a_loc = gl.getUniformLocation(program, "Q" + i + ".a");
                shapes[i].b_loc = gl.getUniformLocation(program, "Q" + i + ".b");
                shapes[i].charge_loc = gl.getUniformLocation(program, "Q" + i + ".q");
                break;
            case "plane":
                shapes[i].normal_loc = gl.getUniformLocation(program, "Q" + i + ".normal");
                shapes[i].pos_loc = gl.getUniformLocation(program, "Q" + i + ".pos");
                shapes[i].sigma_loc = gl.getUniformLocation(program, "Q" + i + ".sigma");
                break;
            case "ring":
            case "disc":
                shapes[i].normal_loc = gl.getUniformLocation(program, "Q" + i + ".normal");
                shapes[i].pos_loc = gl.getUniformLocation(program, "Q" + i + ".pos");
                shapes[i].radius_loc = gl.getUniformLocation(program, "Q" + i + ".radius");
                shapes[i].charge_loc = gl.getUniformLocation(program, "Q" + i + ".q");
                shapes[i].model_loc = gl.getUniformLocation(program, "Q" + i + ".model");
                shapes[i].inverse_loc = gl.getUniformLocation(program, "Q" + i + ".inverse");
                break;
            case "washer":
                shapes[i].normal_loc = gl.getUniformLocation(program, "Q" + i + ".normal");
                shapes[i].pos_loc = gl.getUniformLocation(program, "Q" + i + ".pos");
                shapes[i].inner_loc = gl.getUniformLocation(program, "Q" + i + ".inner");
                shapes[i].outer_loc = gl.getUniformLocation(program, "Q" + i + ".outer");
                shapes[i].charge_loc = gl.getUniformLocation(program, "Q" + i + ".q");
                shapes[i].model_loc = gl.getUniformLocation(program, "Q" + i + ".model");
                shapes[i].inverse_loc = gl.getUniformLocation(program, "Q" + i + ".inverse");
        }
    }

    return program;

}

var program = createProgram("#Vertex-shader", "#Fragment-shader");

var grid_program = createProgram("#GridVertex-shader", "#GridFragment-shader");

var arrow_program = createProgram("#ArrowVertex-shader", "#ArrowFragment-shader");

var arrow_compute_program;
var arrow_compute_vertex_source = "#ArrowComputeVertex-shader";
var arrow_compute_fragment_source = "#ArrowComputeFragment-shader";

function updateComputeProgram()
{
    gl.deleteProgram(arrow_compute_program);
    arrow_compute_program = compileArrowCompute(arrow_compute_vertex_source, arrow_compute_fragment_source, shapes);

    // gauss quadrature uniforms
    var lg_nodes_loc = gl.getUniformLocation(arrow_compute_program, "lg_nodes");
    var lg_weights_loc = gl.getUniformLocation(arrow_compute_program, "lg_weights");

    var gk_nodes_loc = gl.getUniformLocation(arrow_compute_program, "gk_nodes");
    var gk_weights_loc = gl.getUniformLocation(arrow_compute_program, "gk_weights");

    gl.useProgram(arrow_compute_program);

    gl.uniform1fv(lg_nodes_loc, lg_nodes);
    gl.uniform1fv(lg_weights_loc, lg_weights);

    gl.uniform1fv(gk_nodes_loc, gk_nodes);
    gl.uniform1fv(gk_weights_loc, gk_weights);

    // grid uniform
    grid_loc_arrow_compute = gl.getUniformLocation(arrow_compute_program, "grid_matrix");
}

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

var grid_loc_arrow_compute;

// creating shapes

var sphere_subdivisions = 8;
var sphere_radius = 0.1;

const shapes = [];

arrow_compute_program = compileArrowCompute(arrow_compute_vertex_source, arrow_compute_fragment_source, shapes);

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
var disc_prefab = createDisc();
console.log(disc_prefab);

var discVBO = gl.createBuffer();

var discVAO = gl.createVertexArray();

gl.bindVertexArray(discVAO);

gl.bindBuffer(gl.ARRAY_BUFFER, discVBO);
gl.bufferData(gl.ARRAY_BUFFER, disc_prefab.vertices, gl.STATIC_DRAW);

// position
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * 4, 0);
gl.enableVertexAttribArray(0);

// normal
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
gl.enableVertexAttribArray(1);

var discEBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, discEBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, disc_prefab.indices, gl.STATIC_DRAW);


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

    updateComputeProgram();
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

    updateComputeProgram();
}

function addPlane(position, normal, charge)
{
    updateComputeProgram();
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

    updateComputeProgram();
}

function addDisc(position, radius, normal, charge)
{
    shapes.push({
        name: "disc",
        position: position,
        radius: radius,
        normal: normal,
        length: disc_prefab.indices.length,
        charge: charge,
        mVAO: discVAO
    });

    updateComputeProgram();
}

function addWasher(position, inner, outer, normal, charge)
{
    updateComputeProgram();
}

var add_charge = document.getElementById("add-charge-button");
// change to have a charge input
add_charge.addEventListener("click", (e) => {
    addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 1.0);
}, false);

//addSphere(vec3.fromValues(0.0, 0.0, 0.0), sphere_radius, 5.0);

//addSphere(vec3.fromValues(1.0, 2.0, 1.0), sphere_radius, -5.0);

addDisc(vec3.fromValues(0.0, 0.0, 0.0), 2.0, vec3.fromValues(1.0, 0.0, 0.0), 20.0);

//addLineSegment(vec3.fromValues(3.0, 3.0, 3.0), vec3.fromValues(-3.0, -3.0, -3.0), 1.0);

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
        var model = mat4.create();
        switch (shapes[i].name)
        {
            case "sphere":
                {
                    mat4.scalar.translate(model, model, shapes[i].position);
                    gl.uniformMatrix4fv(model_loc, false, model);

                    gl.uniform1f(charge_loc, shapes[i].charge);
                    gl.uniform1f(radius_loc, 1.0);

                    gl.bindVertexArray(shapes[i].mVAO);
                    gl.drawElements(gl.TRIANGLES, shapes[i].length, gl.UNSIGNED_INT, 0);
                }
                break;
            case "line segment":
                {
                    console.log("drawing line segment");
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
                break;
            case "plane":
                {

                }
                break;
            case "ring":
                {
                    var target = vec3.clone(shapes[i].position);
                    vec3.add(target, target, shapes[i].normal);
                    mat4.lookAt(model, shapes[i].position, target, up);

                    // setting transform for computing electric field
                    gl.useProgram(arrow_compute_program);
                    gl.uniformMatrix4fv(shapes[i].inverse_loc, false, model);
                    mat4.scalar.invert(model, model);
                    gl.uniformMatrix4fv(shapes[i].model_loc, false, model);
                    gl.useProgram(program);

                    gl.uniformMatrix4fv(model_loc, false, model);

                    gl.uniform1f(charge_loc, shapes[i].charge);
                    gl.uniform1f(radius_loc, shapes[i].radius);

                    gl.bindVertexArray(shapes[i].mVAO);
                    gl.drawElements(gl.LINES, shapes[i].length, gl.UNSIGNED_INT, 0);
                }
                break;
            case "disc":
                {
                    gl.disable(gl.CULL_FACE);

                    var target = vec3.clone(shapes[i].position);
                    vec3.add(target, target, shapes[i].normal);
                    mat4.lookAt(model, shapes[i].position, target, up);

                    // setting transform for computing electric field
                    gl.useProgram(arrow_compute_program);

                    gl.uniformMatrix4fv(shapes[i].inverse_loc, false, model);
                    mat4.scalar.invert(model, model);
                    gl.uniformMatrix4fv(shapes[i].model_loc, false, model);

                    gl.useProgram(program);

                    gl.uniformMatrix4fv(model_loc, false, model);

                    gl.uniform1f(charge_loc, shapes[i].charge);
                    gl.uniform1f(radius_loc, shapes[i].radius);

                    gl.bindVertexArray(shapes[i].mVAO);
                    gl.drawElements(gl.TRIANGLES, shapes[i].length, gl.UNSIGNED_INT, 0);

                    gl.enable(gl.CULL_FACE);
                }
                break;
            case "washer":
                {
                    
                }
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

    for (var i = 0; i < shapes.length; ++i)
    {
        switch (shapes[i].name)
        {
            case "sphere":
                gl.uniform3f(shapes[i].pos_loc, shapes[i].position[0], shapes[i].position[1], shapes[i].position[2]);
                gl.uniform1f(shapes[i].charge_loc, shapes[i].charge);
                break;
            case "line segment":
                gl.uniform3f(shapes[i].a_loc, shapes[i].position_a[0], shapes[i].position_a[1], shapes[i].position_a[2]);
                gl.uniform3f(shapes[i].b_loc, shapes[i].position_b[0], shapes[i].position_b[1], shapes[i].position_b[2]);
                gl.uniform1f(shapes[i].charge_loc, shapes[i].charge);
                break;
            case "plane":
                gl.uniform3f(shapes[i].normal_loc, shapes[i].normal[0], shapes[i].normal[1], shapes[i].normal[2]);
                gl.uniform3f(shapes[i].pos_loc, shapes[i].position[0], shapes[i].position[1], shapes[i].position[2]);
                gl.uniform1f(shapes[i].sigma_loc, shapes[i].sigma);
                break;
            case "ring":
            case "disc":
                gl.uniform3f(shapes[i].normal_loc, shapes[i].normal[0], shapes[i].normal[1], shapes[i].normal[2]);
                gl.uniform3f(shapes[i].pos_loc, shapes[i].position[0], shapes[i].position[1], shapes[i].position[2]);
                gl.uniform1f(shapes[i].radius_loc, shapes[i].radius);
                gl.uniform1f(shapes[i].charge_loc, shapes[i].charge);
                break;
            case "washer":
                gl.uniform3f(shapes[i].normal_loc, shapes[i].normal[0], shapes[i].normal[1], shapes[i].normal[2]);
                gl.uniform3f(shapes[i].pos_loc, shapes[i].position[0], shapes[i].position[1], shapes[i].position[2]);
                gl.uniform1f(shapes[i].inner_loc, shapes[i].inner);
                gl.uniform1f(shapes[i].outer_loc, shapes[i].outer);
                gl.uniform1f(shapes[i].charge_loc, shapes[i].charge);
        }
    }

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

