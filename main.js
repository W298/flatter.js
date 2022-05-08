import {
  BoxRenderer,
  Camera,
  CircleRenderer,
  Core,
  GameObject,
  Sprite,
  SpriteRenderer,
  TextRenderer,
  Vector,
} from "./src/flatter";

Core.init();

let g = new GameObject();
let c = new BoxRenderer();
let c2 = new CircleRenderer();
let t = new TextRenderer();

let sp = new Sprite(
  "https://i.pinimg.com/originals/a8/cb/bb/a8cbbbdb73615f16068de2cb077bb143.jpg"
);
let s = new SpriteRenderer({ sprite: sp });
sp.width = 100;
sp.height = 100;

s.transform.scale = new Vector(0.5, 0.5);

c.style.fill.color = "darkslateblue";
c.transform.scale = new Vector(100, 100);

c2.style.fill.enabled = false;
c2.style.stroke = {
  enabled: true,
  color: "darkslateblue",
};
c2.transform.scale = new Vector(100, 80);

t.text = "Hel";
t.style.color = "white";

g.attach(c);
g.attach(c2);
g.attach(t);
g.attach(s);

Camera.current.distance = 1;
