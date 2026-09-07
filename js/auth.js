function auth() {
  return `
    <div class="auth-page">

      <section class="auth-showcase">
        <div class="auth-grid"></div>

        <div class="auth-content">
          <div class="brand">
            <span class="brand-mark">O</span>
            <span>ORBIT EAST</span>
          </div>

          <div class="auth-hero">
            <span class="eyebrow">BUSINESS MANAGEMENT, REIMAGINED</span>

            <h1>
              Run your business.
              <span>Better.</span>
            </h1>

            <p>
              Sales, inventory, Khata, expenses and insights —
              everything your business needs in one place.
            </p>
          </div>

          <div class="auth-features">
            <span>✓ Local-first</span>
            <span>✓ Cloud-ready</span>
            <span>✓ Built for growing businesses</span>
          </div>
        </div>
      </section>

      <section class="auth-panel">

        <div class="login-box">

          <div class="login-brand">
            <span class="brand-mark">O</span>
            <div>
              <strong>Orbit BizAssist</strong>
              <small>by Orbit East</small>
            </div>
          </div>

          <div class="login-copy">
            <span class="eyebrow">WELCOME BACK</span>
            <h2>Let's get your business moving.</h2>
            <p>
              Sign in securely with your Google account.
            </p>
          </div>

          <button
            id="google-login"
            class="google-btn"
            onclick="googleAuth()"
          >
            <span class="google-mark">G</span>
            <span class="google-label">Continue with Google</span>
            <span class="login-spinner"></span>
          </button>

          <p class="secure-note">
            Secure authentication powered by Google & Supabase.
          </p>

        </div>

      </section>

    </div>
  `;
}


function googleAuth() {
  const button = document.querySelector('#google-login');

  if (button) {
    button.disabled = true;
    button.classList.add('loading');

    const label = button.querySelector('.google-label');

    if (label) {
      label.textContent = 'Connecting...';
    }
  }

  window.orbitCloud.signInGoogle();
}
