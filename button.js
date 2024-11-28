const buttons = Array.from(document.querySelectorAll(".button"));

for (const button of buttons) {
  button.addEventListener("mousedown", () =>
    button.classList.add("on-button-press")
  );

  button.addEventListener("mouseup", () =>
    button.classList.remove("on-button-press")
  );

  button.addEventListener("touchstart", () =>
    button.classList.add("on-button-press")
  );

  button.addEventListener("touchend", () =>
    button.classList.remove("on-button-press")
  );
}
