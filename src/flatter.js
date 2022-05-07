export class Vector {
  static get zero() {
    return new Vector(0, 0);
  }

  static get one() {
    return new Vector(1, 1);
  }

  static Add(v, w) {
    return new Vector(v.x + w.x, v.y + w.y);
  }

  static Mul(vector, scalar) {
    return new Vector(vector.x * scalar, vector.y * scalar);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class Angle {
  static Add(a, b) {
    return new Angle(a.degrees + b.degrees);
  }

  #degrees = 0;
  constructor(degrees = 0) {
    this.degrees = degrees;
  }
  get degrees() {
    return this.#degrees;
  }
  set degrees(newVal) {
    const val = newVal % 360;
    this.#degrees = val < 0 ? 360 + val : val;
  }
}

export class RootObject {
  constructor({ name = "", isActive = true } = {}) {
    this.name = name;
    this.isActive = isActive;
  }
}

export class SceneObject extends RootObject {
  constructor({ transform = new Transform(), layer = 0, ...args } = {}) {
    super(args);
    this.transform = transform;
    this.transform.gameObject = this;
    this.layer = layer;
  }

  update() {}
}

export class Module extends RootObject {
  constructor({ gameObject = null, ...args } = {}) {
    super(args);
    this.gameObject = gameObject;
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

export class Renderer extends Component {
  constructor(args) {
    super(args);
  }

  get worldTransform() {
    let root = this.gameObject;

    let position = this.transform.position;
    let rotation = this.transform.rotation;
    let scale = this.transform.scale;

    while (root != null) {
      position = Vector.Add(position, root.transform.position);
      rotation = Angle.Add(rotation, root.transform.rotation);
      scale = new Vector(
        scale.x * root.transform.scale.x,
        scale.y * root.transform.scale.y
      );

      root = root.parent;
    }

    return new Transform({ position, rotation, scale });
  }

  update() {}
  _draw() {}
}

export class ShapeRenderer extends Renderer {
  constructor({ style, ...args }) {
    super(args);
    this.style = style;
  }
}

export class BoxRenderer extends ShapeRenderer {
  constructor(args) {
    super(args);
  }
}

export class CircleRenderer extends ShapeRenderer {
  constructor(args) {
    super(args);
  }
}

export class Sprite {
  constructor(src, w = 0, h = 0) {
    this.img = new Image();
    this.img.src = src;
    this.img.width = w;
    this.img.height = h;
  }
}

export class SpriteRenderer extends Renderer {
  constructor({ sprite, ...args }) {
    super(args);
    this.sprite = sprite;
  }

  _draw() {}
}

export class Collider extends Component {
  constructor({ onEnter = null, onExit = null, ...args }) {
    super(args);
    this.onEnter = onEnter;
    this.onExit = onExit;
  }
}

export class BoxCollider extends Collider {
  constructor(args) {
    super(args);
  }
}

export class CircleCollider extends Collider {
  constructor(args) {
    super(args);
  }
}

export class GameObject extends SceneObject {
  #componentList = [];
  constructor({ parent = null, children = [], ...args } = {}) {
    super(args);
    this.parent = parent;
    this.children = children;
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
