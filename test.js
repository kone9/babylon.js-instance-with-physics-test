/// <reference path="babylon.d.ts" />

var canvas = document.getElementById("renderCanvas");
let divFps = document.getElementById("fps");
let conteoCubos = document.getElementById("cantidad");

var engine = null;
var scene = null;
var sceneToRender = null;


var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); };


var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Blue();
    
    CrearCamaraRotadora();
    //CrearScenaDeBlenderCamara();
    CrearIluminacion();

    // Esto activa la física en la escena y es muy importante para que los objetos se muevan y reaccionen a las colisiones
    scene.enablePhysics(
        new BABYLON.Vector3(0,-9.81 * 6, 1),
        new BABYLON.AmmoJSPlugin());//work with MeshImpostor and BoxImpostor**
    ////////////////////////////////////

    //CrearSuelo();//crea un suelo con propiedades físicas
   
    //CrearScenaDeBlenderGltimport(scene);
    CrearSueloBlenderBabylonImport(scene);

    
    // Esto es para instanciar objetos a la escena
    instanciarCadaCiertoTiempo(500);//recibe como parametro cantidad de objetos


    return scene;
}



function CrearIluminacion()//crea una iluminación en la escena
{
    var light = new BABYLON.DirectionalLight("dir02", new BABYLON.Vector3(0.2, 0, 0), scene);
    light.position = new BABYLON.Vector3(0, 80, 0);
    light.range = 50;

    var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
}
function CrearCamaraRotadora()//agrega una camara con propiedades de rotación
{
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 1, new BABYLON.Vector3(0,2,0), scene);
    camera.attachControl(canvas, true);
    camera.position = new BABYLON.Vector3(40,40,0);
    camera.rotation = new BABYLON.Vector3(0,45,0);
}
function CrearSombras(mesh)//esto no funciona por ahora
{
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.getShadowMap().renderList.push(mesh);
	shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 64;
}
function materialPelota()//material de las pelotas
{

    var materialAmiga = new BABYLON.StandardMaterial("amiga", scene);
    materialAmiga.diffuseTexture = new BABYLON.Texture("textures/amiga.jpg", scene);
    materialAmiga.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    materialAmiga.diffuseTexture.uScale = 5;
    materialAmiga.diffuseTexture.vScale = 5;
    return materialAmiga;
}
function materialMadera()//material de madera original
{
    var materialWood = new BABYLON.StandardMaterial("wood", scene);
    materialWood.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);
    materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    return materialWood;
}
function materialWireframe()//material de madera original
{
    var wireframe = new BABYLON.StandardMaterial("wireframe", scene);
    wireframe.emissiveColor = new BABYLON.Color3(1, 1, 1);
    wireframe.wireframe = true;
    return wireframe;
}
function CrearScenaDeBlenderGltimport(scene)//esto no funciona la colisión es para instanciar el suelo con física desde el glTF2
{
    BABYLON.SceneLoader.ImportMesh("",
         "./",
          "caja_para_prueba_instancias.glb",
           scene,
           function(meshes){
                const root = meshes.find(function (mesh) {return mesh.name === "caja"});    
                root.checkCollisions = true;
                root.material = materialWireframe();
                root.physicsImpostor = new BABYLON.PhysicsImpostor(root, BABYLON.PhysicsImpostor.ConvexHullImpostor, { mass: 0}, scene);
            });
}
function CrearScenaDeBlenderCamara(scene)//esto no funciona pero tendría que importar la camara de Blender3D en su posición original
{
    BABYLON.SceneLoader.ImportMesh("",
         "./",
          "CamaraPrincipal.babylon",
           scene, 
           function(meshes){
            const root = meshes.find(function (mesh) {return mesh.name === "CamaraPrincipal"});
            //root.checkCollisions = true;
            //root.material = materialWireframe()
            //root.physicsImpostor = new BABYLON.PhysicsImpostor(root, BABYLON.PhysicsImpostor.NoImpostor, { mass: 0}, scene);
    }); 
}
function CrearSueloBlenderBabylonImport(scene)//funcion para importar con el plugin de babylon escenas desde Blender3D
{
    BABYLON.SceneLoader.ImportMesh("",
         "./",
          "contenedor.babylon",
           scene, 
           function(meshes){
            const root = meshes.find(function (mesh) {return mesh.name === "caja"});
            root.checkCollisions = true;//para activar colisiones
            root.material = materialMadera();//para cambiar material
            //para crear las formas de colisión
            root.physicsImpostor = new BABYLON.PhysicsImpostor(root,
                 BABYLON.PhysicsImpostor.MeshImpostor,
                  { mass: 0},
                   scene);
    }); 
}
function CrearSuelo()//esto es para crear suelo con físicas
{
    var ground = BABYLON.Mesh.CreateBox("Ground", 1, scene);
    ground.scaling = new BABYLON.Vector3(100, 1, 100);
    ground.position.y = -5.0;
    ground.checkCollisions = true;
    ground.material = materialMadera();
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);
    ground.receiveShadows = true;
}
function CrearEsfera()//esto es para crear esfera con físicas
{

    var sphere = BABYLON.Mesh.CreateSphere("Sphere0", 16, 3, scene);

    sphere.material = materialPelota();

    sphere.position = new BABYLON.Vector3(0, 20, 0);

    sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, friction: 1, restitution: 0 }, scene);
    return sphere;
}
function CrearCubo()//esto es para crear cubo con físicas
{
    var box0 = BABYLON.Mesh.CreateBox("Box0", 3, scene);
    box0.position = new BABYLON.Vector3(0, 40, 0);
    box0.material = materialMadera();
    box0.physicsImpostor = new BABYLON.PhysicsImpostor(box0, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 1, restitution: 0 }, scene);
    return box0;
}
const sleep = (milliseconds) => //esto es una función para ejectuar cada cierto tiempo
{
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
const instanciarCadaCiertoTiempo = async (CantidadDeInstancias = 10) => //esta función asincronica es para instanciar cada cierto tiempo
{
    var y = 0;
    
    for (var index = 0; index < CantidadDeInstancias; index++) {
        //instanciarEsfera();
        conteoCubos.innerHTML = "Cantidad de cubos = " + (index + 1);
        CrearCubo();
        //CrearEsfera();
        await sleep(100);
    }
}


var engine;
try {
    engine = createDefaultEngine();
} catch (e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    engine = createDefaultEngine();
}
if (!engine) throw 'engine should not be null.';
scene = createScene();;
sceneToRender = scene

engine.runRenderLoop(function () {
    if (sceneToRender) {
        sceneToRender.render();
        divFps.innerHTML = engine.getFps().toFixed() + " fps";//muestra los fps en la pantalla
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});