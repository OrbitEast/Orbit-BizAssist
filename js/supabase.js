(() => {
  const config={url:'https://tquanlpmtvizjbdounnj.supabase.co',key:'sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq'};
  let token,userId,enabled=false;
  const headers=()=>({apikey:config.key,'Content-Type':'application/json',Authorization:'Bearer '+token});
  const setSession=session=>{token=session?.access_token;userId=session?.user?.id;return !!token};
  async function request(path,options={}){
    const response=await fetch(config.url+path,options);
    if(!response.ok)throw new Error(await response.text());
    return response.status===204?null:response.json();
  }
  function signInGoogle(){
    const redirect=window.location.origin+window.location.pathname;
    window.location.href=config.url+'/auth/v1/authorize?provider=google&redirect_to='+encodeURIComponent(redirect);
  }
  function readOAuthSession(){
    const params=new URLSearchParams(window.location.hash.slice(1));
    if(!params.get('access_token'))return false;
    const ok=setSession({access_token:params.get('access_token'),refresh_token:params.get('refresh_token')});
    history.replaceState(null,'',window.location.pathname);
    return ok;
  }
  async function init(onCloudState){
    if(!readOAuthSession())return false;
    const profile=await request('/auth/v1/user',{headers:headers()});
    userId=profile.id;
    enabled=true;
    const rows=await request('/rest/v1/orbit_bizassist_state?user_id=eq.'+userId+'&select=state',{headers:headers()});
    const cloudState=rows?.[0]?.state||window.AppState.initial();
    if(!rows?.[0])await push(cloudState);
    onCloudState(cloudState,profile);
    return true;
  }
  async function push(nextState){
    if(!enabled||!token)throw new Error('Supabase session is not active.');
    await request('/rest/v1/orbit_bizassist_state?on_conflict=user_id',{
      method:'POST',
      headers:{...headers(),Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({user_id:userId,state:nextState,updated_at:new Date().toISOString()})
    });
  }
  function signOut(){token=null;userId=null;enabled=false}
  window.orbitCloud={signInGoogle,init,push,signOut,session:()=>enabled};
})();
