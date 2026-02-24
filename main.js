const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene;
let vehicle;
let inputMap = {};

async function createScene() {

    scene = new BABYLON.Scene(engine);

    // 空
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.diffuseColor = new BABYLON.Color3(0.4,0.6,1);
    skybox.material = skyMat;

    // カメラ
    const camera = new BABYLON.FollowCamera("cam",
        new BABYLON.Vector3(0,5,-10),
        scene
    );
    camera.radius = 20;
    camera.heightOffset = 6;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 20;

    // 光
    const light = new BABYLON.DirectionalLight("dir",
        new BABYLON.Vector3(-1,-2,-1),
        scene
    );
    light.position = new BABYLON.Vector3(50,100,50);

    // 地面
    const ground = BABYLON.MeshBuilder.CreateGround("ground",
        {width:2000,height:2000},
        scene
    );

    // 物理
    const havok = await HavokPhysics();
    const hk = new BABYLON.HavokPlugin(true, havok);
    scene.enablePhysics(new BABYLON.Vector3(0,-9.8,0), hk);

    ground.physicsAggregate =
        new BABYLON.PhysicsAggregate(
            ground,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 0 },
            scene
        );

    // GLB読み込み
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "./assets/",
        "car.glb",
        scene
    );

    vehicle = result.meshes[0];
    vehicle.position.y = 2;

    vehicle.physicsAggregate =
        new BABYLON.PhysicsAggregate(
            vehicle,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 1200, restitution: 0.1 },
            scene
        );

    camera.lockedTarget = vehicle;

    setupControls();
    setupVirtualJoystick();

    // 昼夜サイクル
    let t = 0;
    scene.registerBeforeRender(() => {
        t += 0.0005;
        light.direction =
            new BABYLON.Vector3(
                Math.sin(t),
                -1,
                Math.cos(t)
            );
    });

    return scene;
}

function setupControls() {
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyDownTrigger,
            evt => inputMap[evt.sourceEvent.key] = true
        )
    );

    scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnKeyUpTrigger,
            evt => inputMap[evt.sourceEvent.key] = false
        )
    );

    scene.onBeforeRenderObservable.add(() => {

        if (!vehicle) return;

        const force = 15000;

        if (inputMap["w"]) {
            vehicle.physicsAggregate.body.applyForce(
                vehicle.forward.scale(force),
                vehicle.getAbsolutePosition()
            );
        }

        if (inputMap["s"]) {
            vehicle.physicsAggregate.body.applyForce(
                vehicle.forward.scale(-force),
                vehicle.getAbsolutePosition()
            );
        }

        if (inputMap["a"]) {
            vehicle.rotate(BABYLON.Axis.Y, -0.03);
        }

        if (inputMap["d"]) {
            vehicle.rotate(BABYLON.Axis.Y, 0.03);
        }

    });
}

function setupVirtualJoystick() {

    if (!("ontouchstart" in window)) return;

    const joystick = new BABYLON.VirtualJoystick(true);
    joystick.setJoystickColor("white");

    scene.onBeforeRenderObservable.add(() => {

        if (!vehicle) return;

        const delta = joystick.deltaPosition;

        if (delta.y > 10)
            vehicle.physicsAggregate.body.applyForce(
                vehicle.forward.scale(-12000),
                vehicle.getAbsolutePosition()
            );

        if (delta.y < -10)
            vehicle.physicsAggregate.body.applyForce(
                vehicle.forward.scale(12000),
                vehicle.getAbsolutePosition()
            );

        if (delta.x > 10)
            vehicle.rotate(BABYLON.Axis.Y, 0.03);

        if (delta.x < -10)
            vehicle.rotate(BABYLON.Axis.Y, -0.03);
    });
}

createScene().then(() => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", () => {
    engine.resize();
});
