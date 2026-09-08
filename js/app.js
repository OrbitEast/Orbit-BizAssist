async function bootstrap(){
  state.page=AppRouter.current();

  try{
    const restored=await window.orbitCloud.init((remote,profile)=>{
      const base=window.AppState.initial();
      const cloudState=(remote&&typeof remote==="object")?remote:{};
      const metadata=profile?.user_metadata||{};
      const cloudUser=cloudState.user&&typeof cloudState.user==="object"?cloudState.user:{};
      const businesses=Array.isArray(cloudState.businesses)&&cloudState.businesses.length
        ? cloudState.businesses
        : base.businesses;
      const requestedActive=cloudState.activeBusiness;
      const activeBusiness=businesses.some(b=>b?.id===requestedActive)
        ? requestedActive
        : businesses[0]?.id||base.activeBusiness;

      state={
        ...base,
        ...cloudState,
        businesses,
        activeBusiness,
        onboarding:cloudState.onboarding||{completed:false,step:1},
        user:{
          id:profile?.id||cloudUser.id||null,
          name:cloudUser.name||metadata.full_name||metadata.name||profile?.email||"Google user",
          email:profile?.email||cloudUser.email||"",
          avatar:cloudUser.avatar||metadata.avatar_url||metadata.picture||"",
          provider:cloudUser.provider||"Google",
          role:cloudUser.role||"Owner / Admin"
        },
        page:AppRouter.current(),
        cart:[]
      };

      render();
    });

    if(!restored)render();
  }catch(error){
    console.error("Orbit BizAssist bootstrap failed:",error);
    const root=document.querySelector('#app');
    if(!root)return;
    root.innerHTML='<main class="auth-card error-card"><h2>We couldn’t open your workspace</h2><p class="sub">Please sign in with Google again to reconnect your account.</p><button class="google-btn full" onclick="googleAuth()">Continue with Google</button></main>';
    root.setAttribute("aria-busy","false");
  }
}

bootstrap();
