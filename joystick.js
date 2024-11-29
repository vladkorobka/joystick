class Joystick {
  constructor(container, options = {}) {
    this.baseSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    this.container = document.querySelector(container);
    this.toggleSizeElement = document.querySelector("#toggle-size");
    this.radiusElement = document.querySelector("#radius");
    this.vibrationElement = document.querySelector("#vibration");
    (this.onVibrate = this.vibrationElement.checked),
      (this.options = {
        name: options.name,
        radius: options.radius,
        toggleSize: options.toggleSize,
        constraint: options.constraint || "free", // "free" | "horizontal" | "vertical" |
      });
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
      this.isDragging = true;
      this.currentJoystick = e.target;
      this.updatePosition(e.touches?.[0] || e);
      if (this.onVibrate && navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    const moveEvent = (e) => {
      if (!this.isDragging || this.currentJoystick !== this.joystickToggle)
        return;
      e.preventDefault();
      this.updatePosition(e.touches?.[0] || e);
    };

    const endEvent = () => {
      if (this.currentJoystick !== this.joystickToggle) return;
      this.isDragging = false;
      this.resetPosition();
      console.log(this.options.name, ":", [0, 0]);
    };

    this.joystickBase.addEventListener("mousedown", startEvent);
    this.joystickBase.addEventListener("mousemove", moveEvent);
    document.addEventListener("mouseup", endEvent);

    this.joystickBase.addEventListener("touchstart", startEvent);
    this.joystickBase.addEventListener("touchmove", moveEvent);
    document.addEventListener("touchend", endEvent);

    document
      .querySelector("#joystick-color")
      .addEventListener("change", (e) => {
        document.querySelector("body").style.background = e.target.value;
      });

    document.querySelector("#toggle-size").addEventListener("change", (e) => {
      this.options.toggleSize = e.target.value;
      this.joystickToggle.style.setProperty(
        "--toggle-size",
        `${this.options.toggleSize}rem`
      );
    });

    document.querySelector("#radius").addEventListener("change", (e) => {
      this.options.radius = e.target.value;
      this.joystickBase.style.setProperty(
        "--radius",
        `${this.options.radius}rem`
      );
    });

    document.querySelector("#vibration").addEventListener("change", (e) => {
      console.log(this.onVibrate);

      this.onVibrate = e.target.checked;
      console.log(this.onVibrate);
    });
  }

  updatePosition(event) {
    const rect = this.joystickBase.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let dx, dy;

    switch (this.options.constraint) {
      case "free":
        dx = x - this.center.x;
        dy = y - this.center.y;
        break;

      case "horizontal":
        dx = x - this.center.x;
        dy = 0;
        break;

      case "vertical":
        dx = 0;
        dy = y - this.center.y;
        break;

      default:
        dx = x - this.center.x;
        dy = y - this.center.y;
    }

    const distance = Math.sqrt(dx * dx + dy * dy);
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
    console.log(this.options.name, ":", [parseInt(dx), parseInt(dy)]);
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
});

joystick.init();
