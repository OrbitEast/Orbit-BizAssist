(() => {
  "use strict";
  const root = document.querySelector("#app");
  const core = window.OrbitV2;
  if (!root || !core) return;

  const start = () => {
    root.innerHTML = `
      <main class="v2-shell">
        <section class="v2-panel">
          <div class="v2-orbit" aria-hidden="true"><span></span><i class="v2-core"></i></div>
          <h1>Orbit <span>BizAssist</span></h1>
          <p>A ground-up rebuild by Orbit East. The new product foundation is in place; every business workflow will be added on top of this clean architecture.</p>
          <div class="v2-badge">Orbit East · V2 Foundation</div>
          <p class="v2-note">No legacy feature UI or runtime is loaded in this build.</p>
        </section>
      </main>`;
  };

  try {
    core.bootstrap?.start?.();
    start();
  } catch (error) {
    console.error("Orbit BizAssist V2 failed to start:", error);
    root.innerHTML = `<main class="v2-shell"><section class="v2-panel"><h1>Orbit <span>BizAssist</span></h1><p>The new application foundation could not start. Check the browser console for the exact error.</p></section></main>`;
  }
})();
