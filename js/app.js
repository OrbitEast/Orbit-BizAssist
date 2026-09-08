async function bootstrap(){
  state.page=AppRouter.current();

  try{
    const localState=window.AppStorage?.restore?.();

    const restored=await window.orbitCloud.init((remote,profile)=>{
      const base=window.AppState.initial();
      const metadata=profile?.user_metadata||{};
      const cloudState=(remote&&typeof remote==="object")?remote:{};
      const storedLocal=(localState&&typeof localState==="object")?localState:{};
      const localBelongsToUser=Boolean(
        profile?.id &&
        storedLocal?.user?.id &&
        storedLocal.user.id===profile.id
      );
      const fallbackState=localBelongsToUser?storedLocal:{};
      const resolvedState={...fallbackState,...cloudState};
      const cloudUser=resolvedState.user&&typeof resolvedState.user==="object"?resolvedState.user:{};
      const businesses=Array.isArray(resolvedState.businesses)&&resolvedState.businesses.length
        ? resolvedState.businesses
        : base.businesses;
      const requestedActive=resolvedState.activeBusiness;
      const activeBusiness=businesses.some(b=>b?.id===requestedActive)
        ? requestedActive
        : businesses[0]?.id||base.activeBusiness;

      state={
        ...base,
        ...resolvedState,
        businesses,
        activeBusiness,
        onboarding:resolvedState.onboarding||{completed:false,step:1},
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
