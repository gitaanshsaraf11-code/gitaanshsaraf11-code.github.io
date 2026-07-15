document.getElementById("year").textContent = new Date().getFullYear();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

/* Theme toggle */

const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  applyTheme(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const current =
    root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* Custom cursor */

if (!isCoarsePointer) {
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let targetX = ringX;
  let targetY = ringY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursorDot.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
  });

  function animateRing() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll(".magnetic, .carousel-track").forEach((el) => {
    el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
    el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
  });
}

/* Magnetic hover pull */

if (!isCoarsePointer && !prefersReducedMotion) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

/* Scroll reveal */

const revealEls = document.querySelectorAll("[data-reveal]");

if (prefersReducedMotion) {
  revealEls.forEach((el) => el.classList.add("in-view"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => observer.observe(el));
}

/* Experience carousel — autoplay, pause on hover, drag to explore */

const track = document.getElementById("experienceTrack");

if (track) {
  let autoDir = 1;
  let paused = false;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  function autoScrollStep() {
    if (!paused && !dragging && !prefersReducedMotion) {
      const max = track.scrollWidth - track.clientWidth;
      if (max > 0) {
        track.scrollLeft += autoDir * 0.5;
        if (track.scrollLeft >= max) autoDir = -1;
        if (track.scrollLeft <= 0) autoDir = 1;
      }
    }
    requestAnimationFrame(autoScrollStep);
  }
  requestAnimationFrame(autoScrollStep);

  track.addEventListener("mouseenter", () => {
    paused = true;
  });
  track.addEventListener("mouseleave", () => {
    paused = false;
    dragging = false;
  });

  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startScroll - dx;
  });
  track.addEventListener("pointerup", () => {
    dragging = false;
  });
  track.addEventListener("pointercancel", () => {
    dragging = false;
  });
}
