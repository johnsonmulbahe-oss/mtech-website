import {json,getCookie,sha256Hex,ensureMemberSchema} from '../../_lib/memberAuth.js';
export async function onRequestPost({request,env}){if(env.DB){await ensureMemberSchema(env.DB);const token=getCookie(request,'mtech_member_session');if(token){const h=await sha256Hex(token);await env.DB.prepare('DELETE FROM member_sessions WHERE session_token_hash=?').bind(h).run()}}return json({ok:true},200,{'set-cookie':'mtech_member_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'})}
export function onRequest(){return json({ok:false,error:'Method not allowed.'},405,{allow:'POST'})}
