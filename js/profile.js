/* =========================================================
   ORBIT BIZASSIST — PROFILE
   Account menu + editable workspace profile.
   ========================================================= */
(() => {
  "use strict";

  const esc = value => window.AppUtils?.esc ? window.AppUtils.esc(value) : String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
  const state = () => window.AppState?.get?.() || {};
  const user = () => state().user || {};
  const initials = name => String(name || "Owner").trim().split(/\s+/).slice(0,2).map(x => x[0]?.toUpperCase() || "").join("") || "O";

  function avatarMarkup(size="large") {
    const u=user();
    return u.avatar
      ? `<img class="profile-avatar ${size}" src="${esc(u.avatar)}" alt="${esc(u.name || "Profile photo")}">`
      : `<span class="profile-avatar ${size}">${esc(initials(u.name))}</span>`;
  }

  function modal(){
    const u=user();
    return `<div class="profile-overlay" data-profile-overlay role="dialog" aria-modal="true" aria-label="Your profile">
      <section class="profile-modal">
        <button class="profile-close" type="button" data-profile-close aria-label="Close profile">×</button>
        <div class="profile-hero">${avatarMarkup()}<div><span class="eyebrow">Account</span><h2>Your profile</h2><p>Manage how your account appears in Orbit BizAssist.</p></div></div>
        <form id="profile-form" class="profile-form">
          <label><span>Display name</span><input name="name" required maxlength="80" value="${esc(u.name || "")}" autocomplete="name"></label>
          <label><span>Email address</span><input value="${esc(u.email || "")}" readonly aria-readonly="true"></label>
          <div class="profile-meta"><span>Signed in with</span><strong>${esc(u.provider || "Google")}</strong></div>
          <div class="profile-meta"><span>Role</span><strong>${esc(u.role || "Owner / Admin")}</strong></div>
          <div class="profile-actions"><button class="secondary-btn" type="button" data-profile-close>Cancel</button><button class="primary-btn" type="submit">Save changes</button></div>
        </form>
        <button class="profile-signout" type="button" data-profile-signout>Sign out of Orbit BizAssist</button>
      </section>
    </div>`;
  }

  function open(){
    close();
    document.body.insertAdjacentHTML("beforeend",modal());
    document.body.classList.add("profile-open");
    document.querySelector("#profile-form input[name='name']")?.focus();
  }

  function close(){
    document.querySelector("[data-profile-overlay]")?.remove();
    document.body.classList.remove("profile-open");
  }

  async function save(event){
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity()) return;
    const name=new FormData(form).get("name")?.toString().trim();
    if(!name) return;
    const current=user();
    window.AppState.merge({user:{...current,name}});
    close();
    window.AppState.save?.();
    window.render?.();
    if(typeof window.toast === "function") window.toast("Profile updated successfully.");
  }

  document.addEventListener("click", event => {
    if(event.target.closest(".user-avatar")){ event.preventDefault(); open(); return; }
    if(event.target.closest("[data-profile-close]") || event.target === document.querySelector("[data-profile-overlay]")){ close(); return; }
    if(event.target.closest("[data-profile-signout]")){ close(); window.AppUI?.signOut?.(); return; }
  });

  document.addEventListener("submit", event => { if(event.target.id === "profile-form") save(event); });
  document.addEventListener("keydown", event => { if(event.key === "Escape") close(); });

  window.AppProfile=Object.freeze({open,close});
})();
