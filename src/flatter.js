export class Vector {
  static get zero() {
    return new Vector(0, 0);
  }

  static get one() {
    return new Vector(1, 1);
  }

  static get right() {
    return new Vector(1, 0);
  }

  static get left() {
    return new Vector(-1, 0);
  }

  static get up() {
    return new Vector(0, -1);
  }

  static get down() {
    return new Vector(0, 1);
  }

  static Add(v, w) {
    return new Vector(v.x + w.x, v.y + w.y);
  }

  static Sub(v, w) {
    return new Vector(v.x - w.x, v.y - w.y);
  }

  static Mul(vector, scalar) {
    return new Vector(vector.x * scalar, vector.y * scalar);
  }

  static Distance(v, w) {
    return Vector.Sub(v, w).magnitude;
  }

  static Lerp(v, w, t) {
    return Vector.Add(v, Vector.Mul(Vector.Sub(w, v), t));
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get magnitude() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }

  get normalized() {
    return Vector.Mul(this, 1 / this.magnitude);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  normalize() {
    this.x /= this.magnitude;
    this.y /= this.magnitude;
  }

  copy() {
    return new Vector(this.x, this.y);
  }
}

export class Angle {
  static Add(a, b) {
    return new Angle({ degrees: a.degrees + b.degrees });
  }

  static Sub(a, b) {
    return new Angle({ degrees: a.degrees - b.degrees });
  }

  #degrees = 0;
  constructor({ degrees = null, radians = null } = {}) {
    if (!(degrees && radians)) {
      this.degrees = 0;
    }
    if (degrees) this.degrees = degrees;
    if (radians) this.radians = radians;
  }
  get degrees() {
    return this.#degrees;
  }
  set degrees(newVal) {
    const val = newVal % 360;
    this.#degrees = val < 0 ? 360 + val : val;
  }
  get radians() {
    return (this.#degrees * Math.PI) / 180;
  }
  set radians(newVal) {
    this.degrees = (newVal * 180) / Math.PI;
  }

  add(a) {
    this.degrees += a.degrees;
    return this;
  }

  sub(a) {
    this.degrees -= a.degrees;
    return this;
  }

  copy() {
    return new Angle({ degrees: this.degrees });
  }
}

export class RootObject {
  static #rootObjectList = [];
  static Update() {
    RootObject.#rootObjectList.forEach((r) => {
      if (!(r instanceof SceneObject)) r.update();
    });
    SceneObject.Update();
  }
  constructor({ name = "", isActive = true } = {}) {
    this.name = name;
    this.isActive = isActive;
    this.updateFunc = null;
    RootObject.#rootObjectList.push(this);
  }

  update() {
    this.updateFunc && this.updateFunc();
  }
}

export class SceneObject extends RootObject {
  static #sceneObjectList = [];
  static Update() {
    SceneObject.#sceneObjectList.forEach((s) => s.update());
  }

  #layer = 0;
  constructor({ transform = new Transform(), layer = 0, ...args } = {}) {
    super(args);
    this.transform = transform;
    this.transform.gameObject = this;
    this.layer = layer;
    SceneObject.#sceneObjectList.push(this);
  }

  get layer() {
    return this.#layer;
  }

  set layer(newVal) {
    this.#layer = newVal;
    this.sortWithLayer();
  }

  sortWithLayer() {
    SceneObject.#sceneObjectList.sort((a, b) => a.layer - b.layer);
  }
}

export class Module extends RootObject {
  constructor({ gameObject = null, ...args } = {}) {
    super(args);
    this.gameObject = gameObject;
  }
}

export class MovementController extends Module {
  constructor({ vel = Vector.zero, acc = Vector.zero, ...args }) {
    super(args);
    this.vel = vel;
    this.acc = acc;
  }

  update() {
    this.vel.add(this.acc);
    this.gameObject.transform.position.add(this.vel);
  }
}

export class Transform extends Module {
  constructor({
    position = Vector.zero,
    rotation = new Angle(),
    scale = Vector.one,
    ...args
  } = {}) {
    super(args);
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}

export class Component extends SceneObject {
  constructor({ gameObject = null, ...args } = {}) {
    super(args);
    this.gameObject = gameObject;
  }
}

export class Camera extends Component {
  static current = null;
  constructor(args = {}) {
    super(args);
    if (!Camera.current) Camera.current = this;
  }
}

export class Renderer extends Component {
  constructor(args = {}) {
    super(args);
  }

  get renderTransform() {
    let root = this.gameObject;

    let position = this.transform.position.copy();
    let rotation = this.transform.rotation.copy();
    let scale = this.transform.scale.copy();

    while (root != null) {
      position.add(root.transform.position);
      rotation.add(root.transform.rotation);
      scale = new Vector(
        scale.x * root.transform.scale.x,
        scale.y * root.transform.scale.y
      );

      root = root.parent;
    }

    position.sub(Camera.current.transform.position);
    position.add(new Vector(Core.canvas.width / 2, Core.canvas.height / 2));
    scale.mul(scale, Camera.current.transform.scale.x);

    return new Transform({ position, rotation, scale });
  }

  _draw() {}
  _rotate() {
    const { position, rotation } = this.renderTransform;

    Core.ctx.translate(position.x, position.y);
    Core.ctx.rotate(rotation.radians);
    Core.ctx.translate(-position.x, -position.y);

    Core.ctx.setTransform(1, 0, 0, 1, 0, 0);

    const cw = Core.canvas.width / 2;
    const ch = Core.canvas.height / 2;
    Core.ctx.translate(cw, ch);
    Core.ctx.rotate(Camera.current.transform.rotation.radians);
    Core.ctx.translate(-cw, -ch);
  }
  update() {
    super.update();

    Core.ctx.beginPath();
    this._rotate();
    this._draw();
    Core.ctx.closePath();
    Core.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

export class TextRenderer extends Renderer {
  constructor({ text = "Example Text", style, ...args } = {}) {
    super(args);
    this.text = text;
    this.style = {
      fontFamily: "Consolas",
      fontSize: 20,
      color: "black",
      align: {
        horizontal: "center",
        vertical: "middle",
      },
      ...style,
    };
  }

  _draw() {
    const { position, scale } = this.renderTransform;

    Core.ctx.font = `${this.style.fontSize * scale.x}px ${
      this.style.fontFamily
    }`;
    Core.ctx.fillStyle = this.style.color;
    Core.ctx.textAlign = this.style.align.horizontal;
    Core.ctx.textBaseline = this.style.align.vertical;
    Core.ctx.fillText(this.text, position.x, position.y);
  }
}

export class ShapeRenderer extends Renderer {
  constructor({ style, ...args }) {
    super(args);
    this.style = {
      fill: {
        enabled: true,
        color: "black",
      },
      stroke: {
        enabled: false,
        color: "black",
        weight: 1,
      },
      ...style,
    };
  }
}

export class BoxRenderer extends ShapeRenderer {
  constructor(args = {}) {
    super(args);
  }

  _draw() {
    const { position, scale } = this.renderTransform;

    Core.ctx.rect(
      position.x - scale.x / 2,
      position.y - scale.y / 2,
      scale.x,
      scale.y
    );

    if (this.style.fill.enabled) {
      Core.ctx.fillStyle = this.style.fill.color;
      Core.ctx.fill();
    }

    if (this.style.stroke.enabled) {
      Core.ctx.strokeStyle = this.style.stroke.color;
      Core.ctx.lineWidth = this.style.stroke.weight;
      Core.ctx.stroke();
    }
  }
}

export class CircleRenderer extends ShapeRenderer {
  constructor(args = {}) {
    super(args);
  }

  _draw() {
    const { position, scale } = this.renderTransform;

    Core.ctx.ellipse(
      position.x,
      position.y,
      scale.x,
      scale.y,
      0,
      0,
      2 * Math.PI
    );

    if (this.style.fill.enabled) {
      Core.ctx.fillStyle = this.style.fill.color;
      Core.ctx.fill();
    }

    if (this.style.stroke.enabled) {
      Core.ctx.strokeStyle = this.style.stroke.color;
      Core.ctx.lineWidth = this.style.stroke.weight;
      Core.ctx.stroke();
    }
  }
}

export class Sprite {
  constructor(src, w = 0, h = 0) {
    this.img = new Image();
    this.img.src = src;
    if (w) this.width = w;
    if (h) this.height = h;
  }

  get width() {
    return this.img.width;
  }

  set width(newVal) {
    this.img.width = newVal;
  }

  get height() {
    return this.img.height;
  }

  set height(newVal) {
    this.img.height = newVal;
  }
}

export class SpriteRenderer extends Renderer {
  constructor({ sprite, ...args }) {
    super(args);
    this.sprite = sprite;
  }

  _draw() {
    const { position, scale } = this.renderTransform;
    const width = this.sprite.img.width * scale.x;
    const height = this.sprite.img.height * scale.y;

    Core.ctx.drawImage(
      this.sprite.img,
      position.x - width / 2,
      position.y - height / 2,
      width,
      height
    );
  }
}

export class Collider extends Component {
  constructor({ onEnter = null, onExit = null, ...args }) {
    super(args);
    this.onEnter = onEnter;
    this.onExit = onExit;
  }
}

export class BoxCollider extends Collider {
  constructor(args = {}) {
    super(args);
  }
}

export class CircleCollider extends Collider {
  constructor(args = {}) {
    super(args);
  }
}

export class GameObject extends SceneObject {
  static #gameObjectList = [];
  #componentList = [];
  constructor({ parent = null, children = [], ...args } = {}) {
    super(args);
    this.parent = parent;
    this.children = children;
    GameObject.#gameObjectList.push(this);
  }

  setChild(gameObject) {
    this.children.push(gameObject);
    gameObject.parent = this;
  }

  attach(component) {
    this.#componentList.push(component);
    component.gameObject = this;
  }
}

export const Core = {
  init(width = innerWidth - 20, height = innerHeight - 20) {
    this.canvas = document.querySelector("canvas");
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      document.body.appendChild(this.canvas);
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");

    let camObj = new GameObject({ name: "MainCamObj" });
    let cam = new Camera({ name: "MainCam" });
    camObj.attach(cam);

    this.TICK = 0;

    this.animate();
  },
  animate() {
    Core.ctx.clearRect(0, 0, Core.canvas.width, Core.canvas.height);
    requestAnimationFrame(() => {
      this.animate();
    });
    this.update();
    RootObject.Update();
    this.TICK++;
  },
  update() {},
};
