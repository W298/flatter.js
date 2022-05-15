import {
  Angle,
  BoxRenderer,
  Camera,
  CircleRenderer,
  Core,
  GameObject,
  MovementController,
  SceneObject,
  Sprite,
  SpriteRenderer,
  TextRenderer,
  Vector,
} from "./src/flatter";

Core.init();

for (let i = 0; i < 10; i++) {
  let g = new GameObject();
  g.transform.position = new Vector(i * 50, i * 50);
  g.attach(
    new TextRenderer({
      text: `(${i * 50}, ${i * 50})`,
      style: { fontSize: 10 },
    })
  );
}

let keypressed = { up: false, down: false, right: false, left: false };

window.addEventListener("keydown", (e) => {
  if (e.key === "d") {
    keypressed.right = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "d") {
    keypressed.right = false;
  }
});

// window.addEventListener("keypress", (e) => {
//   let dir = Vector.zero;
//   switch (e.key) {
//     case "d":
//       dir = Vector.right;
//       break;
//     case "a":
//       dir = Vector.left;
//       break;
//     case "w":
//       dir = Vector.up;
//       break;
//     case "s":
//       dir = Vector.down;
//   }
//   dir.mul(10);
//   Camera.current.position.add(dir);
// });

let vel = Vector.zero;
let dur = 60;
let cur = 0;

Core.update = () => {
  if (keypressed.right) {
    if (cur < dur) cur++;
  } else {
    if (cur > 0) cur--;
  }

  vel = Vector.Lerp(Vector.zero, Vector.one.mul(2), cur / dur);
  Camera.current.transform.position.add(vel);
};

// let mc = new MovementController({ gameObject: Camera.current.gameObject });
// Camera.current.gameObject.attach(mc);

// mc.vel = new Vector(10, 10);
