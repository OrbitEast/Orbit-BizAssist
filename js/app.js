async function bootstrap(){
  state.page=AppRouter.current();

  try{
    const restored=await window.orbitCloud.init((remote,profile)=>{
      const base=window.AppState.initial();
      const cloudState=(remote&&typeof remote==="object")?remote:{};

      // Cloud data is authoritative when present, but never replace
      // the application with an incomplete/empty object for a new user.
      state={
        ...base,
        ...cloudState,
        businesses:Array.isArray(cloudState.businesses)&&cloudState.businesses.length
          ? cloudState.businesses
          : base.businesses,
        activeBusiness:cloudState.activeBusiness||base.activeBusiness,
        onboarding:cloudState.onboarding||base.onboarding,
        user:{
          name:profile.user_metadata?.full_name||profile.email||"Google user",
          email:profile.email||"",
          id:profile.id||null,
          role:"Owner / Admin"
        },
        page:AppRouter.current(),
        cart:[]
      };

      render();
    });

    if(!restored)render();
  }catch(error){
    console.error("Orbit BizAssist bootstrap failed:",error);

    document.querySelector('#app').innerHTML='<main class="auth-card error-card"><h2>Unable to connect</h2><p class="sub">Sign in with Google again to connect Orbit BizAssist to Supabase.</p><button class="google-btn full" onclick="googleAuth()">Try Google sign-in again</button></main>';
  }
}

bootstrap();
