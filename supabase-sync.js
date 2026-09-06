/* Orbit BizAssist cloud adapter. It gracefully stays local until Supabase is configured. */
(() => {
  const config={url:'https://tquanlpmtvizjbdounnj.supabase.co',key:'sb_publishable_sjDaL7MyAXoYoM1KIbYLbg_EGfo6Omq'};
  let token, userId, enabled=false;
  const jsonHeaders=()=>({apikey:config.key,'Content-Type':'application/json',Authorization:`Bearer ${token}`});
  const setSession=session=>{token=session?.access_token;userId=session?.user?.id;if(token)localStorage.setItem('orbit-biz-session',JSON.stringify(session));return !!token};
  async function request(path,options={}){const r=await fetch(config.url+path,options);if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json()}
  async function signInEmail(email,password,signup=false){const path=signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password';return setSession(await request(path,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email,password})}))}
  async function sendOtp(phone){return request('/auth/v1/otp',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({phone})})}
  async function verifyOtp(phone,tokenValue){return setSession(await request('/auth/v1/verify',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({phone,token:tokenValue,type:'sms'})}))}
  async function init(onCloudState){try{const saved=JSON.parse(localStorage.getItem('orbit-biz-session')||'null');if(!setSession(saved))return;const rows=await request(`/rest/v1/orbit_bizassist_state?user_id=eq.${userId}&select=state`,{headers:jsonHeaders()});enabled=true;if(rows?.[0]?.state)onCloudState(rows[0].state)}catch(err){console.info('Orbit cloud sync deferred:',err.message)}}
  async function push(state){if(!enabled||!token)return;try{await request('/rest/v1/orbit_bizassist_state?on_conflict=user_id',{method:'POST',headers:{...jsonHeaders(),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:userId,state,updated_at:new Date().toISOString()})})}catch(err){console.info('Cloud save queued locally.')}}
  function signOut(){localStorage.removeItem('orbit-biz-session');token=null;userId=null;enabled=false}
  window.orbitCloud={signInEmail,sendOtp,verifyOtp,init,push,signOut,session:()=>!!token};
})();
