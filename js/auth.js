/* =========================================================
   ORBIT BIZASSIST — AUTH UI
   Google OAuth / Supabase compatible
   ========================================================= */

function auth() {
  return `
    <section class="auth-page" aria-label="Orbit BizAssist sign in">

      <!-- =================================================
           LEFT — PRODUCT SHOWCASE
           ================================================= -->

      <div class="auth-showcase">
        <div class="auth-grid" aria-hidden="true"></div>

        <div class="auth-content">

          <a class="brand" href="#" aria-label="Orbit East home">
            <span class="brand-mark" aria-hidden="true">O</span>
            <span>Orbit East</span>
          </a>

          <div class="auth-hero">
            <span class="eyebrow">Everyday business, simplified</span>

            <h1>
              Run your business
              <span>with confidence.</span>
            </h1>

            <p>
              One clean workspace for sales, inventory, customers,
              expenses and everything your business needs to stay organized.
            </p>
          </div>

          <div class="auth-features" aria-label="Product benefits">
            <span>✓ Simple</span>
            <span>✓ Secure</span>
            <span>✓ Built for growing businesses</span>
          </div>

        </div>
      </div>


      <!-- =================================================
           RIGHT — LOGIN
           ================================================= -->

      <div class="auth-panel">

        <main class="login-box">

          <div class="login-brand">
            <span class="brand-mark" aria-hidden="true">O</span>

            <div>
              <div>Orbit BizAssist</div>
              <small>Powered by Orbit East</small>
            </div>
          </div>


          <div class="login-copy">
            <span class="eyebrow">Welcome back</span>

            <h2>Let's get your business moving.</h2>

            <p>
              Sign in with your Google account to access your workspace.
            </p>
          </div>


          <button
            id="google-login"
            class="google-btn"
            type="button"
            onclick="googleAuth()"
            aria-label="Continue with Google"
          >
            <span class="google-mark" aria-hidden="true">G</span>

            <span class="google-label">
              Continue with Google
            </span>

            <span
              class="login-spinner"
              aria-hidden="true"
            ></span>
          </button>


          <p class="secure-note">
            Your account is authenticated securely through
            Google and Supabase.
          </p>

        </main>

      </div>

    </section>
  `;
}


/* =========================================================
   GOOGLE AUTH
   IMPORTANT:
   Keep this function name because the existing
   Supabase connection calls window.orbitCloud.signInGoogle().
   ========================================================= */

function googleAuth() {
  const button = document.querySelector("#google-login");

  if (button) {
    button.disabled = true;
    button.classList.add("loading");

    const label = button.querySelector(".google-label");

    if (label) {
      label.textContent = "Connecting to Google…";
    }
  }

  if (
    window.orbitCloud &&
    typeof window.orbitCloud.signInGoogle === "function"
  ) {
    window.orbitCloud.signInGoogle();
    return;
  }

  /* Fails gracefully instead of throwing a fatal JS error. */
  if (button) {
    button.disabled = false;
    button.classList.remove("loading");

    const label = button.querySelector(".google-label");

    if (label) {
      label.textContent = "Continue with Google";
    }
  }

  if (typeof toast === "function") {
    toast("Authentication service is unavailable.");
  } else {
    console.error("Orbit Cloud authentication is unavailable.");
  }
}
