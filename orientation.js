function checkOrientation() {
  const isLandscape = window.matchMedia("(orientation: landscape)").matches;
  document.querySelector("main").style.display = isLandscape ? "block" : "none";
  document.querySelector(".rotate-msg").style.display = isLandscape
    ? "none"
    : "flex";
}

window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
