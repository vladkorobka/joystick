class Joystick {
  constructor(container, options = {}) {
    this.baseSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    this.container = document.querySelector(container);
    this.toggleSizeElement = document.querySelector("#toggle-size");
    this.radiusElement = document.querySelector("#radius");
    this.vibrationElement = document.querySelector("#vibration");
    this.onVibrate = this.vibrationElement.checked;

    this.options = {
      name: options.name,
      radius: options.radius,
      toggleSize: options.toggleSize,
      baseColor: options.baseColor || "#ccc",
      toggleColor: options.toggleColor || "#333",
      constraint: options.constraint || "free", // "free" | "horizontal" | "vertical"
    };

    this.activeTouches = new Map();
  }

  init() {
    this.joystickBase = document.createElement("div");
    this.joystickBase.classList.add("joystick-base", "joystick");
    this.joystickBase.style.setProperty(
      "--radius",
      `${this.options.radius}rem`
    );
    this.joystickBase.style.setProperty("--base-color", this.options.baseColor);

    this.joystickToggle = document.createElement("div");
    this.joystickToggle.classList.add("joystick-toggle");
    this.joystickToggle.style.setProperty(
      "--toggle-size",
      `${this.options.toggleSize}rem`
    );
    this.joystickToggle.style.setProperty(
      "--toggle-color",
      this.options.toggleColor
    );

    this.joystickBase.appendChild(this.joystickToggle);
    this.container.appendChild(this.joystickBase);

    this.center = {
      x: (this.options.radius * this.baseSize) / 2,
      y: (this.options.radius * this.baseSize) / 2,
    };
    this.isDragging = false;
    this.initEvents();

    this.toggleSizeElement.value = this.options.toggleSize;
    this.radiusElement.value = this.options.radius;
  }

  initEvents() {
    const startEvent = (e) => {
      e.preventDefault();
      const id = e.pointerId || 0;
      if (this.activeTouches.has(id)) return;
      this.activeTouches.set(id, e);

      if (this.activeTouches.size === 1) {
        this.isDragging = true;
        this.updatePosition(e);
        if (this.onVibrate && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    };

    const moveEvent = (e) => {
      const id = e.pointerId || 0;
      if (!this.activeTouches.has(id)) return;
      if (this.isDragging) this.updatePosition(e);
    };

    const endEvent = (e) => {
      const id = e.pointerId || 0;
      this.activeTouches.delete(id);

      if (this.activeTouches.size === 0) {
        this.isDragging = false;
        this.resetPosition();
      }
    };

    this.joystickBase.addEventListener("pointerdown", startEvent);
    document.addEventListener("pointermove", moveEvent);
    document.addEventListener("pointerup", endEvent);
    document.addEventListener("pointercancel", endEvent);

    document
      .querySelector("#joystick-color")
      .addEventListener("change", (e) => {
        this.options.toggleColor = e.target.value;
        this.joystickToggle.style.setProperty(
          "--toggle-color",
          this.options.toggleColor
        );
      });

    this.toggleSizeElement.addEventListener("change", (e) => {
      this.options.toggleSize = e.target.value;
      this.joystickToggle.style.setProperty(
        "--toggle-size",
        `${this.options.toggleSize}rem`
      );
    });

    this.radiusElement.addEventListener("change", (e) => {
      this.options.radius = e.target.value;
      this.joystickBase.style.setProperty(
        "--radius",
        `${this.options.radius}rem`
      );
    });

    this.vibrationElement.addEventListener("change", (e) => {
      this.onVibrate = e.target.checked;
    });
  }

  updatePosition(event) {
    const rect = this.joystickBase.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let dx = x - this.center.x;
    let dy = y - this.center.y;

    if (this.options.constraint === "horizontal") dy = 0;
    if (this.options.constraint === "vertical") dx = 0;

    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const maxDistance =
      (this.options.radius * this.baseSize) / 2 -
      (this.options.toggleSize * this.baseSize) / 2;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = maxDistance * Math.cos(angle);
      dy = maxDistance * Math.sin(angle);
    }

    this.joystickToggle.style.transform = `translate(${dx}px, ${dy}px)`;
    const normalizedX = dx / maxDistance;
    const normalizedY = dy / maxDistance;

    this.emit("move", { x: normalizedX, y: normalizedY });
  }

  resetPosition() {
    this.joystickToggle.style.transform = "translate(0, 0)";
    this.emit("end", { x: 0, y: 0 });
  }

  emit(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    this.joystickBase.dispatchEvent(event);
  }
}

const joystick = new Joystick("#joystick-container", {
  name: "j1",
  radius: 14,
  toggleSize: 6.5,
  constraint: "free", // free, horizontal, vertical
  baseColor: "#f0f0f0",
  toggleColor: "#007bff",
});

joystick.init();

const joystick2 = new Joystick("#joystick-container2", {
  name: "j2",
  radius: 14,
  toggleSize: 6.5,
  constraint: "free", // free, horizontal, vertical
  baseColor: "#f0f0f0",
  toggleColor: "#007bff",
});

joystick2.init();
