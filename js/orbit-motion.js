/* =========================================================
   ORBIT BIZASSIST — MOTION CONTROLLER
   Scroll-triggered reveals + ambient solar-system brand mark.
   ========================================================= */
(() => {
  "use strict";

  function addLandingOrbit(page) {
    if (page.dataset.orbitSignature === "1") return;

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
    page.dataset.orbitSignature = "1";
  }

  function setupRevealObserver(page) {
    if (page.dataset.orbitReveals === "1") return;

    const targets = page.querySelectorAll(
      ".landing-section-head, .landing-feature-card, .landing-company-card, .landing-bottom-cta, .landing-footer"
    );

    targets.forEach((element, index) => {
      element.classList.add("orbit-reveal");
      if (!element.style.getPropertyValue("--orbit-reveal-delay")) {
        element.style.setProperty("--orbit-reveal-delay", `${Math.min(index * 45, 220)}ms`);
      }
    });

    page.dataset.orbitReveals = "1";

    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
      targets.forEach(element => element.classList.add("orbit-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("orbit-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });

    targets.forEach(element => revealObserver.observe(element));
  }

  function enhance() {
    const page = document.querySelector(".landing-page");
    if (!page) return;
    addLandingOrbit(page);
    setupRevealObserver(page);
  }

  const mutationObserver = new MutationObserver(() => enhance());
  const start = () => {
    const root = document.querySelector("#app");
    if (root) mutationObserver.observe(root, { childList: true, subtree: true });
    enhance();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
