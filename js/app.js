async function bootstrap(){
  state.page=AppRouter.current();

  try{
    const restored=await window.orbitCloud.init((remote,profile)=>{
      const base=window.AppState.initial();
      const cloudState=(remote&&typeof remote==="object")?remote:{};
      const metadata=profile?.user_metadata||{};

      state={
        ...base,
        ...cloudState,
        businesses:Array.isArray(cloudState.businesses)&&cloudState.businesses.length
          ? cloudState.businesses
          : base.businesses,
        activeBusiness:cloudState.activeBusiness||base.activeBusiness,
        onboarding:cloudState.onboarding||{completed:false,step:1},
        user:{
          id:profile?.id||null,
          name:metadata.full_name||metadata.name||profile?.email||"Google user",
          email:profile?.email||"",
          avatar:metadata.avatar_url||metadata.picture||"",
          provider:"Google",
          role:cloudState.user?.role||"Owner / Admin"
        },
        page:AppRouter.current(),
        cart:[]
      };

      render();
    });

    if(!restored)render();
  }catch(error){
    console.error("Orbit BizAssist bootstrap failed:",error);
    document.querySelector('#app').innerHTML='<main class="auth-card error-card"><h2>We couldn’t open your workspace</h2><p class="sub">Please sign in with Google again to reconnect your account.</p><button class="google-btn full" onclick="googleAuth()">Continue with Google</button></main>';
  }
}

bootstrap();
