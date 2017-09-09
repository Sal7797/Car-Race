/// <reference path="js/babylon.max.js" />
/// <reference path="js/cannon.max.js" />

document.addEventListener("DOMContentLoaded", startGame, false);

var canvas;
var engine;

var Game = {};
Game.scenes = [];
Game.activeScene = 0;
Game.previouslevel = 0;
Game.score = 0;
var isWPressed = false;
var isSPressed = false;
var isDPressed = false;
var isAPressed = false;
var isBPressed = false;
var isEnterPressed = false;

const NEG_Z_VECTOR = new BABYLON.Vector3(0, -1, -1);

Game.startscene = function () {

    scene = new BABYLON.Scene(engine);
    scene.clearolor = new BABYLON.Color3(1, 1, 1);

    fakeanimi(scene);

    var sceneIndex = Game.scenes.push(scene) - 1;

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -2), scene);

    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 5, 0), scene);

    var mesh = new BABYLON.Mesh.CreatePlane('plane', 0.7, scene);
    mesh.scaling.y = 2.3;
    mesh.scaling.x = 4.5;
    mesh.material = new BABYLON.StandardMaterial('material', scene);
    mesh.material.diffuseTexture = new BABYLON.Texture("images/startscene.png", scene);

    camera.lockedTarget = mesh;

    Game.scenes[sceneIndex].moveToFirstScene = function () {

        if (isEnterPressed)
            Game.activeScene = 1;
    }

    Game.scenes[sceneIndex].renderLoop = function () {

        this.moveToFirstScene();
        this.render();
    }
    
    return scene;
}

Game.createFirstScene = function () {

    scene = new BABYLON.Scene(engine);

    var speed1 = Math.random() + 2;
    var speed2 = Math.random() + 2;
    var speed3 = Math.random() + 2;

    var car1 = createCar(scene, speed1, 3, new BABYLON.Color3.Red);
    var car2 = createCar(scene, speed2, 6, new BABYLON.Color3.Blue);
    var car3 = createCar(scene, speed3, -0.3, new BABYLON.Color3(1, 1, 1));

    var skybox = createSkyBox("textures/sky/TropicalSunnyDay", scene);

    scene.index = sceneIndex

    var freeCamera = createFreeCamera();

    scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.CannonJSPlugin());
    scene.gravity = new BABYLON.Vector3(0, -10, 0);

    var ground = createConfiguredGround("images/TropicalSunnyDay_ny.jpg", scene);
    var load = fakeanimi(scene);
    var endline = createEndLine(-2500, "images/checker_large.gif");
   
    var light1 = new BABYLON.HemisphericLight("l1", new BABYLON.Vector3(0, 5, 0), scene);

    var followCamera = createFollowCamera(car1, scene);
    scene.activeCameras.push(followCamera);
    followCamera.attachControl(canvas);

    var sceneIndex = Game.scenes.push(scene) - 1;

    Game.scenes[sceneIndex].applyTankMovements = function (car1, car2, car3) {

        if (isWPressed) {
            car1.moveWithCollisions(car1.frontVector.multiplyByFloats(car1.speed, car1.speed, car1.speed));
            car2.moveWithCollisions(car2.frontVector.multiplyByFloats(car2.speed, car2.speed, car2.speed));
            car3.moveWithCollisions(car3.frontVector.multiplyByFloats(car3.speed, car3.speed, car3.speed));
        }
        if (isSPressed) {
            var reverseVector = car1.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car1.speed, car1.speed, car1.speed);
            car1.moveWithCollisions(reverseVector);
            var reverseVector = car2.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car2.speed, car2.speed, car2.speed);
            car2.moveWithCollisions(reverseVector);
            var reverseVector = car3.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car3.speed, car3.speed, car3.speed);
            car3.moveWithCollisions(reverseVector);

        }
        if (isDPressed) {
            car1.rotation.y += .1 * car1.rotationSensitivity;
            car2.rotation.y += .1 * car2.rotationSensitivity;
            car3.rotation.y += .1 * car3.rotationSensitivity;
        }
        if (isAPressed) {
            car1.rotation.y -= .1 * car1.rotationSensitivity;
            car2.rotation.y -= .1 * car2.rotationSensitivity;
            car3.rotation.y -= .1 * car3.rotationSensitivity;
        }

        car1.frontVector.x = Math.sin(car1.rotation.y) * -1;
        car1.frontVector.z = Math.cos(car1.rotation.y) * -1;
        car1.frontVector.y = -4;

        car2.frontVector.x = Math.sin(car2.rotation.y) * -1;
        car2.frontVector.z = Math.cos(car2.rotation.y) * -1;
        car2.frontVector.y = -4;

        car3.frontVector.x = Math.sin(car3.rotation.y) * -1;
        car3.frontVector.z = Math.cos(car3.rotation.y) * -1;
        car3.frontVector.y = -4;
    }

    Game.scenes[sceneIndex].gameover = function (car2, car3) {

        if( car2.position.x > endline.position.x - 30 &&
            car2.position.x < endline.position.x + 30 &&
            car2.position.z > endline.position.z - 30 &&
            car2.position.z < endline.position.z + 30){

            Game.previouslevel = 1;
            Game.activeScene = 5;
        }

        else if(car3.position.z > endline.position.z - 30 &&
                car3.position.z < endline.position.z + 30) {

            Game.previouslevel = 1.5;
            Game.activeScene = 5;
        }

    }

    Game.scenes[sceneIndex].checkMoveToNextLevel = function (car1, endline) {
        if (car1.position.x > endline.position.x - 30 &&
            car1.position.x < endline.position.x + 30 &&
            car1.position.z > endline.position.z - 30 &&
            car1.position.z < endline.position.z + 30) {

            Game.score += 10;
            Game.activeScene = 2;
        }

    }

    Game.scenes[sceneIndex].renderLoop = function () {
        engine.displayLoadingUI();
        if (Game.scenes[0].isLoaded) {
            engine.hideLoadingUI();
        }
        this.applyTankMovements(car1, car2, car3);
        this.checkMoveToNextLevel(car1, endline);
        this.gameover(car2, car3);
        this.render();
    }

    return scene;

}

Game.createSecondScene = function () {

    scene = new BABYLON.Scene(engine);
    var speed1 = Math.random() + 2.1;
    var speed2 = Math.random() + 2;
    var speed3 = Math.random() + 2;

    var car1 = createCar(scene, speed1, 3, new BABYLON.Color3.Red);
    var car2 = createCar(scene, speed2, 6, new BABYLON.Color3.Blue);
    var car3 = createCar(scene, speed3, -0.3, new BABYLON.Color3(1, 1, 1));

    scene.gravity = new BABYLON.Vector3(0, -10, 0);
    
    var skybox = createSkyBox("textures/sky/snow", scene);

    var freeCamera = createFreeCamera();

    var ground = createConfiguredGround("images/download.jpg", scene);
    
    var endline = createEndLine(-3000, "images/checker_large.gif");

    var light1 = new BABYLON.HemisphericLight("l1", new BABYLON.Vector3(0, 5, 0), scene);

    var followCamera = createFollowCamera(car1, scene);
    scene.activeCameras.push(followCamera);
    followCamera.attachControl(canvas);

    var sceneIndex = Game.scenes.push(scene) - 1;

    Game.scenes[sceneIndex].applyTankMovements = function (car1, car2, car3) {

        if (isWPressed) {
            car1.moveWithCollisions(car1.frontVector.multiplyByFloats(car1.speed, car1.speed, car1.speed));
            car2.moveWithCollisions(car2.frontVector.multiplyByFloats(car2.speed, car2.speed, car2.speed));
            car3.moveWithCollisions(car3.frontVector.multiplyByFloats(car3.speed, car3.speed, car3.speed));
        }
        if (isSPressed) {
            var reverseVector = car1.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car1.speed, car1.speed, car1.speed);
            car1.moveWithCollisions(reverseVector);
            var reverseVector = car2.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car2.speed, car2.speed, car2.speed);
            car2.moveWithCollisions(reverseVector);
            var reverseVector = car3.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car3.speed, car3.speed, car3.speed);
            car3.moveWithCollisions(reverseVector);

        }
        if (isDPressed) {
            car1.rotation.y += .1 * car1.rotationSensitivity;
            car2.rotation.y += .1 * car2.rotationSensitivity;
            car3.rotation.y += .1 * car3.rotationSensitivity;
        }
        if (isAPressed) {
            car1.rotation.y -= .1 * car1.rotationSensitivity;
            car2.rotation.y -= .1 * car2.rotationSensitivity;
            car3.rotation.y -= .1 * car3.rotationSensitivity;
        }

        car1.frontVector.x = Math.sin(car1.rotation.y) * -1;
        car1.frontVector.z = Math.cos(car1.rotation.y) * -1;
        car1.frontVector.y = -4;

        car2.frontVector.x = Math.sin(car2.rotation.y) * -1;
        car2.frontVector.z = Math.cos(car2.rotation.y) * -1;
        car2.frontVector.y = -4;

        car3.frontVector.x = Math.sin(car3.rotation.y) * -1;
        car3.frontVector.z = Math.cos(car3.rotation.y) * -1;
        car3.frontVector.y = -4;
    }

    Game.scenes[sceneIndex].gameover = function (car2, car3) {

        if (car2.position.x > endline.position.x - 30 &&
            car2.position.x < endline.position.x + 30 &&
            car2.position.z > endline.position.z - 30 &&
            car2.position.z < endline.position.z + 30) {

            Game.previouslevel = 2;
            Game.activeScene = 5;
        }

        else if(car3.position.z > endline.position.z - 30 &&
                car3.position.z < endline.position.z + 30) {

            Game.previouslevel = 2.5;
            Game.activeScene = 5;
        }

    }

    Game.scenes[sceneIndex].checkMoveToNextLevel = function (car1, endline) {
        if (car1.position.x > endline.position.x - 30 &&
            car1.position.x < endline.position.x + 30 &&
            car1.position.z > endline.position.z - 30 &&
            car1.position.z < endline.position.z + 30) {

            Game.score += 20;
            Game.activeScene = 3;
        }

    }

    Game.scenes[sceneIndex].renderLoop = function () {

        this.applyTankMovements(car1, car2, car3);
        this.gameover(car2, car3);
        this.checkMoveToNextLevel(car1, endline);
        this.render();
    }

    return scene;

}

Game.createThirdScene = function () {

    scene = new BABYLON.Scene(engine);
    var speed1 = Math.random() + 2.2;
    var speed2 = Math.random() + 2;
    var speed3 = Math.random() + 2;

    var car1 = createCar(scene, speed1, 3, new BABYLON.Color3.Red);
    var car2 = createCar(scene, speed2, 6, new BABYLON.Color3.Blue);
    var car3 = createCar(scene, speed3, -0.3, new BABYLON.Color3(1, 1, 1));
    scene.gravity = new BABYLON.Vector3(0, -10, 0);

    var skybox = createSkyBox("textures/sky/nebula", scene);

    var freeCamera = createFreeCamera();

    var ground = createConfiguredGround("images/field_of_stars_full.jpg", scene);
    var endline = createEndLine(-3500, "images/checker_large.gif");

    var light1 = new BABYLON.HemisphericLight("light 1", new BABYLON.Vector3(0, 5, 0), scene);

    var followCamera = createFollowCamera(car1, scene);
    scene.activeCameras.push(followCamera);
    followCamera.attachControl(canvas);

    var sceneIndex = Game.scenes.push(scene) - 1;

    Game.scenes[sceneIndex].applyTankMovements = function (car1, car2, car3) {

        if (isWPressed) {
            car1.moveWithCollisions(car1.frontVector.multiplyByFloats(car1.speed, car1.speed, car1.speed));
            car2.moveWithCollisions(car2.frontVector.multiplyByFloats(car2.speed, car2.speed, car2.speed));
            car3.moveWithCollisions(car3.frontVector.multiplyByFloats(car3.speed, car3.speed, car3.speed));
        }
        if (isSPressed) {
            var reverseVector = car1.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car1.speed, car1.speed, car1.speed);
            car1.moveWithCollisions(reverseVector);
            var reverseVector = car2.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car2.speed, car2.speed, car2.speed);
            car2.moveWithCollisions(reverseVector);
            var reverseVector = car3.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car3.speed, car3.speed, car3.speed);
            car3.moveWithCollisions(reverseVector);

        }
        if (isDPressed) {
            car1.rotation.y += .1 * car1.rotationSensitivity;
        }
        if (isAPressed)
            car1.rotation.y -= .1 * car1.rotationSensitivity;

        car1.frontVector.x = Math.sin(car1.rotation.y) * -1;
        car1.frontVector.z = Math.cos(car1.rotation.y) * -1;
        car1.frontVector.y = -4;

    }

    Game.scenes[sceneIndex].gameover = function (car2, car3) {

        if (car2.position.x > endline.position.x - 30 &&
            car2.position.x < endline.position.x + 30 &&
            car2.position.z > endline.position.z - 30 &&
            car2.position.z < endline.position.z + 30) {

            Game.previouslevel = 3;
            Game.activeScene = 5;
        }

        else if(car3.position.z > endline.position.z - 30 &&
                car3.position.z < endline.position.z + 30) {

            Game.previouslevel = 3.5;
            Game.activeScene = 5;
        }

    }

    Game.scenes[sceneIndex].checkMoveToNextLevel = function (car1, endline) {
        if (car1.position.x > endline.position.x - 30 &&
            car1.position.x < endline.position.x + 30 &&
            car1.position.z > endline.position.z - 30 &&
            car1.position.z < endline.position.z + 30) {

            Game.score += 30;
            Game.activeScene = 4;
        }

    }

    Game.scenes[sceneIndex].renderLoop = function () {

        this.applyTankMovements(car1, car2, car3);
        this.gameover(car2, car3);
        this.checkMoveToNextLevel(car1, endline);
        this.render();
    }

    return scene;

}

Game.createFourthScene = function () {

        scene = new BABYLON.Scene(engine);
        var speed1 = Math.random() + 2.3;
        var speed2 = Math.random() + 2;
        var speed3 = Math.random() + 2;

        var car1 = createCar(scene, speed1, 3, new BABYLON.Color3.Red);
        var car2 = createCar(scene, speed2, 6, new BABYLON.Color3.Blue);
        var car3 = createCar(scene, speed3, -0.3, new BABYLON.Color3(1, 1, 1));
        scene.gravity = new BABYLON.Vector3(0, -10, 0);

        var skybox = createSkyBox("textures/sky/sky", scene);

        var freeCamera = createFreeCamera();

        var ground = createConfiguredGround("images/grasslight-big.jpg", scene);
        var finishline = createEndLine(-4000, scene);

        var light1 = new BABYLON.HemisphericLight("light 1", new BABYLON.Vector3(0, 5, 0), scene);

        var followCamera = createFollowCamera(car1, scene);
        scene.activeCameras.push(followCamera);
        followCamera.attachControl(canvas);

        var sceneIndex = Game.scenes.push(scene) - 1;

        Game.scenes[sceneIndex].applyTankMovements = function (car1, car2, car3) {

            if (isWPressed) {
                car1.moveWithCollisions(car1.frontVector.multiplyByFloats(car1.speed, car1.speed, car1.speed));
                car2.moveWithCollisions(car2.frontVector.multiplyByFloats(car2.speed, car2.speed, car2.speed));
                car3.moveWithCollisions(car3.frontVector.multiplyByFloats(car3.speed, car3.speed, car3.speed));
            }
            if (isSPressed) {
                var reverseVector = car1.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car1.speed, car1.speed, car1.speed);
                car1.moveWithCollisions(reverseVector);
                var reverseVector = car2.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car2.speed, car2.speed, car2.speed);
                car2.moveWithCollisions(reverseVector);
                var reverseVector = car3.frontVector.multiplyByFloats(-1, 1, -1).multiplyByFloats(car3.speed, car3.speed, car3.speed);
                car3.moveWithCollisions(reverseVector);

            }
            if (isDPressed) {
                car1.rotation.y += .1 * car1.rotationSensitivity;
            }
            if (isAPressed)
                car1.rotation.y -= .1 * car1.rotationSensitivity;

            car1.frontVector.x = Math.sin(car1.rotation.y) * -1;
            car1.frontVector.z = Math.cos(car1.rotation.y) * -1;
            car1.frontVector.y = -4;

        }

        Game.scenes[sceneIndex].gameover = function (car2, car3) {

            if (car2.position.x > finishline.position.x - 30 &&
                car2.position.x < finishline.position.x + 30 &&
                car2.position.z > finishline.position.z - 30 &&
                car2.position.z < finishline.position.z + 30) {

                Game.previouslevel = 4;
                Game.activeScene = 5;
            }

            else if (car3.position.z > finishline.position.z - 30 &&
                     car3.position.z < finishline.position.z + 30) {

                Game.previouslevel = 4.5;
                Game.activeScene = 5;
            }

        }

        Game.scenes[sceneIndex].checkMoveToNextLevel = function (car1, finishline) {
            if (car1.position.x > finishline.position.x - 30 &&
                car1.position.x < finishline.position.x + 30 &&
                car1.position.z > finishline.position.z - 30 &&
                car1.position.z < finishline.position.z + 30) {

                Game.score += 40;
                Game.previouslevel = 5;
                Game.activeScene = 5;
            }

        }

        Game.scenes[sceneIndex].renderLoop = function () {

            this.applyTankMovements(car1, car2, car3);
            this.gameover(car2, car3);
            this.checkMoveToNextLevel(car1,finishline)
            this.render();
        }

        return scene;
}

Game.createGameEnding = function () {

    scene = new BABYLON.Scene(engine);
    scene.clearolor = new BABYLON.Color3(1, 1, 1);

    var sceneIndex = Game.scenes.push(scene) - 1;

    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -2), scene);

    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 5, 0), scene);

    var mesh = new BABYLON.Mesh.CreatePlane('plane', 0.7, scene);
    mesh.scaling.y = 2.3;
    mesh.scaling.x = 4.5;
    mesh.material = new BABYLON.StandardMaterial('material', scene);

    Game.scenes[sceneIndex].loadingimage = function (scene) {
        if (Game.previouslevel == 1 || Game.previouslevel == 2 || Game.previouslevel == 3 || Game.previouslevel == 4) {
            mesh.material.diffuseTexture = new BABYLON.Texture("images/download1.png", scene);
            loadendmessages(scene);
        }
        else if (Game.previouslevel == 1.5 || Game.previouslevel == 2.5 || Game.previouslevel == 3.5 || Game.previouslevel == 4.5) {
            mesh.material.diffuseTexture = new BABYLON.Texture("images/download1.png", scene);
            loadendmessages(scene);
        }
        else if (Game.previouslevel == 5) {
            mesh.material.diffuseTexture = new BABYLON.Texture("images/winner.jpg", scene);
            loadendmessages(scene);
        }
    }

    camera.lockedTarget = mesh;

    Game.scenes[sceneIndex].renderLoop = function () {

        this.loadingimage(scene);
        this.render();
    }

    return scene;
}

function startGame() {
    canvas = document.getElementById("renderCanvas");
    engine = new BABYLON.Engine(canvas, true);
    engine.isPointerLock = true;
    //engine.displayLoadingUI();
    Game.startscene();
    Game.createFirstScene();
    Game.createSecondScene();
    Game.createThirdScene();
    Game.createFourthScene();
    Game.createGameEnding();

    engine.runRenderLoop(function () {
       /* if (Game.scenes[0].isLoaded) {
            engine.hideLoadingUI();
        }
        else return;*/

        Game.scenes[Game.activeScene].renderLoop();
    });

}

function createFreeCamera() {
    var camera = new BABYLON.FreeCamera("c1", new BABYLON.Vector3(0, 5, 0), scene);
    camera.keysUp.push('w'.charCodeAt(0));
    camera.keysUp.push('W'.charCodeAt(0));
    camera.keysDown.push('s'.charCodeAt(0));
    camera.keysDown.push('S'.charCodeAt(0));
    camera.keysRight.push('d'.charCodeAt(0));
    camera.keysRight.push('D'.charCodeAt(0));
    camera.keysLeft.push('a'.charCodeAt(0));
    camera.keysLeft.push('A'.charCodeAt(0));
    camera.checkCollisions = true;
    return camera;
}

function createConfiguredGround(texture, scene) {

    var ground = new BABYLON.Mesh.CreateGroundFromHeightMap("ground", "images/height1.png", 1000, 10000, 50, 0, 10, scene, false, onGroundCreated);

    ground.material = new BABYLON.StandardMaterial("gm", scene);
    ground.material.diffuseTexture = new BABYLON.Texture(texture, scene);
    ground.material.diffuseTexture.uScale = 10;
    ground.material.diffuseTexture.vScale = 25;

    function onGroundCreated() {
        ground.checkCollisions = true;
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 10, restitution: .2 }, scene);
        ground.isPickable = false;
    }

    return ground;
}

function createCar(scene, carspeed, carx, carcolor) {
    var car = new BABYLON.Mesh.CreateBox("car", 2.3, scene);
    car.material = new BABYLON.StandardMaterial("cm", scene);
    car.material.diffuseColor = carcolor;

    car.position.y += 2;
    car.position.x = carx;
    car.scaling.y *= .5;
    car.scaling.x = 1;
    car.scaling.z = 2;

    car.rotationSensitivity = .3;
    car.speed = carspeed;
    car.frontVector = new BABYLON.Vector3(0, 0, -1);
    car.checkCollisions = true;
    car.applyGravity = true;

    return car;
}

function createFollowCamera(target, scene) {
    var camera = new BABYLON.FollowCamera("fc", new BABYLON.Vector3(0, 2, -20), scene);
    camera.lockedTarget = target;
    camera.radius = 10; 
    camera.heightOffset = 2; 
    camera.rotationOffset = 0; 
    camera.cameraAcceleration = 0.05 
    camera.maxCameraSpeed = 20
    return camera;
}

function createEndLine(positionz, texture) {

    var endline = new BABYLON.Mesh.CreateBox("endline", 2.3, scene);
    endline.position = new BABYLON.Vector3(20, 5, -100);
    endline.material = new BABYLON.StandardMaterial("elm", scene);
    endline.material.diffuseTexture = new BABYLON.Texture(texture, scene);

    endline.position.y += 0;
    endline.position.z = positionz;
    endline.scaling.y *= 10;
    endline.scaling.x = 100;
    endline.scaling.z = .5;

    return endline;
}

function fakeanimi(scene) {
    BABYLON.SceneLoader.ImportMesh("Rabbit", "scenes/", "Rabbit.babylon", scene, function (newMeshes, particleSystems, skeletons) {
        var rabbit = newMeshes[1];

        rabbit.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
        shadowGenerator.getShadowMap().renderList.push(rabbit);

        var rabbit2 = rabbit.clone("rabbit2");
        var rabbit3 = rabbit.clone("rabbit2");

        rabbit2.position = new BABYLON.Vector3(-50, 0, -20);
        rabbit2.skeleton = rabbit.skeleton.clone("clonedSkeleton");

        rabbit3.position = new BABYLON.Vector3(50, 0, -20);
        rabbit3.skeleton = rabbit.skeleton.clone("clonedSkeleton2");

        scene.beginAnimation(skeletons[0], 0, 100, true, 0.8);
        scene.beginAnimation(rabbit2.skeleton, 73, 100, true, 0.8);
        scene.beginAnimation(rabbit3.skeleton, 0, 72, true, 0.8);
    });
    scene.isLoaded = true;
}

document.addEventListener("keydown", function (event) {

    if (event.key == 'a' || event.key == 'A') {
        isAPressed = true;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = true;
    }
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = true;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = true;
    }
    if (event.keyCode == '13') {
        isEnterPressed = true;
    }

});

document.addEventListener("keyup", function () {

    if (event.key == 'a' || event.key == 'A') {
        isAPressed = false;
    }
    if (event.key == 'd' || event.key == 'D') {
        isDPressed = false;
    }
    if (event.key == 'w' || event.key == 'W') {
        isWPressed = false;
    }
    if (event.key == 's' || event.key == 'S') {
        isSPressed = false;
    }
    if (event.keyCode == '13') {
        isEnterPressed = false;
    }
});

function createSkyBox(texture, scene) {

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(texture, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    return skybox;

}

function loadendmessages(scene) {

    if (Game.previouslevel == 1 || Game.previouslevel == 2 || Game.previouslevel == 3 || Game.previouslevel == 4) {

        var message = confirm("Game Over! 😪😪😪 Blue Car Wins! Your Score: " + Game.score);
        if (message == true) {
            var replay = confirm("Replay?!")
            if (replay == true) {
                window.location.reload();
            }
        }
    }

    else if (Game.previouslevel == 1.5 || Game.previouslevel == 2.5 || Game.previouslevel == 3.5 || Game.previouslevel == 4.5) {

        var message = confirm("Game Over! 😪😪😪 White Car Wins! Your Score: " + Game.score);
        if (message == true) {
            var replay = confirm("Replay?!")
            if (replay == true) {
                window.location.reload();
            }
        }
    }

    else if (Game.previouslevel == 5) {

        //mesh.material.diffuseTexture = new BABYLON.Texture("images/winner.jpg", scene);
        var message = confirm("CONGRATULATIONS! You Won! 😄🎊🎉 Your Score: " + Game.score);
        if (message == true) {
            var replay = confirm("Replay?!")
            if (replay == true) {
                window.location.reload();
            }
        }
    }
}