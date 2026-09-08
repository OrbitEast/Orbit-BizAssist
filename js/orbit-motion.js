/* =========================================================
   ORBIT BIZASSIST — MOTION CONTROLLER
   Scroll-triggered reveals + ambient solar-system brand mark.
   ========================================================= */
(() => {
  "use strict";

  function addLandingOrbit() {
    const page = document.querySelector(".landing-page");
    if (!page || page.querySelector(".landing-orbit-signature")) return;

    const orbit = document.createElement("div");
    orbit.className = "landing-orbit-signature";
    orbit.setAttribute("aria-hidden", "true");
    orbit.innerHTML = `
      <span class="orbit-core"></span>
      <span class="ring ring-a"></span>
      <span class="ring ring-b"></span>
      <span class="ring ring-c"></span>
      <span class="planet planet-a"></span>
      <span class="planet planet-b"></span>
      <span class="planet planet-c"></span>
    `;

    page.appendChild(orbit);
  }

  function setupRevealObserver() {
    const targets = document.querySelectorAll(
      ".landing-section-head, .landing-feature-card, .landing-company-card, .landing-bottom-cta, .landing-footer"
    );

    targets.forEach((element, index) => {
      element.classList.add("orbit-reveal");
      if (!element.style.getPropertyValue("--orbit-reveal-delay")) {
        element.style.setProperty("--orbit-reveal-delay", `${Math.min(index * 45, 220)}ms`);
      }
    });

    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(element => element.classList.add("orbit-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("orbit-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    targets.forEach(element => observer.observe(element));
  }

  function enhance() {
    if (!document.querySelector(".landing-page")) return;
    addLandingOrbit();
    setupRevealObserver();
  }

  const observer = new MutationObserver(() => enhance());
  const start = () => {
    const root = document.querySelector("#app");
    if (root) observer.observe(root, { childList: true, subtree: true });
    enhance();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
