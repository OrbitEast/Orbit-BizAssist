/* OrbitBiz — minimal public entry screen */
(()=>{
  "use strict";
  const root=document.getElementById("app");
  if(!root)return;

  const render=()=>{
    root.innerHTML=`
      <section id="orbit-biz-landing" class="underdev" aria-labelledby="underdev-title">
        <div class="underdev-orbit orbit-a"></div>
        <div class="underdev-orbit orbit-b"></div>
        <div class="underdev-card">
          <div class="underdev-mark" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div class="underdev-kicker">ORBITBIZ</div>
          <h1 id="underdev-title">Under development<span>.</span></h1>
          <p>We are building something better.</p>
          <div class="underdev-line" aria-hidden="true"></div>
          <small>Orbit East · 2026</small>
        </div>
      </section>`;
  };

  render();
})();
