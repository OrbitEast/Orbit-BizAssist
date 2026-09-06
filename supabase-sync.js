/* Orbit BizAssist cloud adapter. Local mode remains available until Supabase is configured. */
(() => {
  const config={url:'https://tquanlpmtvizjbdounnj.supabase.co',key:'sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq'};
  let token,userId,enabled=false;
  const jsonHeaders=()=>({apikey:config.key,'Content-Type':'application/json',Authorization:`Bearer ${token}`});
  const setSession=session=>{
    token=session?.access_token;
    userId=session?.user?.id;
    if(token)localStorage.setItem('orbit-biz-session',JSON.stringify(session));
    return !!token;
  };
  async function request(path,options={}){
    const response=await fetch(config.url+path,options);
    if(!response.ok)throw new Error(await response.text());
    return response.status===204?null:response.json();
  }
  async function signInEmail(email,password,signup=false){
    const path=signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
    return setSession(await request(path,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password})}));
  }
  async function sendEmailOtp(email){
    return request('/auth/v1/otp',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,create_user:true})});
  }
  async function verifyEmailOtp(email,tokenValue){
    return setSession(await request('/auth/v1/verify',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,token:tokenValue,type:'email'})}));
  }
  function signInGoogle(){
    const redirect=window.location.origin+window.location.pathname;
    window.location.href=`${config.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
  }
  function readOAuthSession(){
    const params=new URLSearchParams(window.location.hash.slice(1));
    if(!params.get('access_token'))return false;
    const session=setSession({access_token:params.get('access_token'),refresh_token:params.get('refresh_token')});
    history.replaceState(null,'',window.location.pathname);
    return session;
  }
  async function init(onCloudState){
    try{
      const fromOAuth=readOAuthSession();
      const saved=fromOAuth||setSession(JSON.parse(localStorage.getItem('orbit-biz-session')||'null'));
      if(!saved)return;
      if(!userId){
        const profile=await request('/auth/v1/user',{headers:jsonHeaders()});
        userId=profile.id;
        const stored=JSON.parse(localStorage.getItem('orbit-biz-session')||'{}');
        stored.user=profile;
        localStorage.setItem('orbit-biz-session',JSON.stringify(stored));
      }
      const rows=await request(`/rest/v1/orbit_bizassist_state?user_id=eq.${userId}&select=state`,{headers:jsonHeaders()});
      enabled=true;
      onCloudState?.(rows?.[0]?.state,JSON.parse(localStorage.getItem('orbit-biz-session')||'{}').user);
    }catch(err){console.info('Orbit cloud sync deferred:',err.message)}
  }
  async function push(state){
    if(!enabled||!token)return;
    try{await request('/rest/v1/orbit_bizassist_state?on_conflict=user_id',{method:'POST',headers:{...jsonHeaders(),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:userId,state,updated_at:new Date().toISOString()})})}
    catch(err){console.info('Cloud save queued locally.')}
  }
  function signOut(){localStorage.removeItem('orbit-biz-session');token=null;userId=null;enabled=false}
  window.orbitCloud={signInEmail,sendEmailOtp,verifyEmailOtp,signInGoogle,init,push,signOut,session:()=>!!token};
})();
