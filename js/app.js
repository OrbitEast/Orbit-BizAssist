async function bootstrap(){
  state.page=AppRouter.current();
  try{
    const restored=await window.orbitCloud.init((remote,profile)=>{
      state={...remote,user:{name:profile.user_metadata?.full_name||profile.email||'Google user',role:'Owner / Admin'},page:AppRouter.current(),cart:[]};
      render();
    });
    if(!restored)render();
  }catch(error){
    document.querySelector('#app').innerHTML='<main class="auth-card error-card"><h2>Unable to connect</h2><p class="sub">Sign in with Google again to connect Orbit BizAssist to Supabase.</p><button class="google-btn full" onclick="googleAuth()">Try Google sign-in again</button></main>';
  }
}
bootstrap();
