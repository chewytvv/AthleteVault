import React from "react";
import { C } from "../lib/theme.js";

// ── TRON: ARES GLOBAL STYLES ───────────────────
export function TronStyles({C,settings}){
  const accent=C.accent||"#00F0FF";
  const accent2=C.gold||"#E8B84B";
  const displayFont=settings?.themeDisplayFont||"'Rajdhani', sans-serif";
  const bodyFont=settings?.themeFont||"'Sora', sans-serif";
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&family=Sora:wght@300;400;600;700&family=DM+Mono:wght@400;500&family=Exo+2:wght@400;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:${bodyFont};background:${C.black};color:${C.white};}
    ::-webkit-scrollbar{width:4px;height:4px;}
    ::-webkit-scrollbar-track{background:${C.dark};}
    ::-webkit-scrollbar-thumb{background:${accent}33;border-radius:2px;}
    ::-webkit-scrollbar-thumb:hover{background:${accent}66;}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes scanline{0%{transform:translateY(-100%);}100%{transform:translateY(100vh);}}
    @keyframes tronPulse{0%,100%{box-shadow:0 0 8px ${accent}44,0 0 24px ${accent}22;}50%{box-shadow:0 0 16px ${accent}88,0 0 48px ${accent}33;}}
    @keyframes flicker{0%,100%{opacity:1;}92%{opacity:1;}93%{opacity:.7;}94%{opacity:1;}97%{opacity:.85;}98%{opacity:1;}}
    @keyframes gridScroll{from{background-position:0 0;}to{background-position:0 40px;}}
    @keyframes dataIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .tron-grid-bg{
      background-image:linear-gradient(${accent}08 1px,transparent 1px),linear-gradient(90deg,${accent}08 1px,transparent 1px);
      background-size:40px 40px;animation:gridScroll 6s linear infinite;
    }
    .tron-glow{animation:tronPulse 3s ease-in-out infinite;}
    .tron-flicker{animation:flicker 8s ease-in-out infinite;}
    select option{background:${C.dark};color:${C.white};}
    button:focus,input:focus,textarea:focus,select:focus{outline:none;}
    input::placeholder,textarea::placeholder{color:${C.muted};}
    input:focus,textarea:focus,select:focus{border-color:${accent}55!important;}
    .reveal-data{animation:dataIn .4s ease both;}
  `}</style>;
}

// ── UI COMPONENTS — Tron: Ares ─────────────────
export function Badge({color,children,style:x}){const col=color||C.muted;return <span style={{background:col+"18",color:col,border:`1px solid ${col}33`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:.8,whiteSpace:"nowrap",fontFamily:"DM Mono,monospace",...x}}>{children}</span>;}

export function Btn({onClick,children,variant="accent",small,disabled,loading,full,style:x}){
  const vs={
    accent:{background:`linear-gradient(135deg,${C.accent},${C.accent}AA)`,color:C.black,border:"none",boxShadow:`0 0 20px ${C.accent}44`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:1},
    gold:{background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,color:C.black,border:"none",boxShadow:`0 4px 14px ${C.gold}33`,fontFamily:"'Rajdhani',sans-serif",letterSpacing:1},
    ghost:{background:"transparent",color:C.white,border:`1px solid ${C.border}`},
    danger:{background:C.red+"18",color:C.red,border:`1px solid ${C.red}33`},
    green:{background:C.green+"18",color:C.green,border:`1px solid ${C.green}33`},
    blue:{background:C.blue+"18",color:C.blue,border:`1px solid ${C.blue}33`},
    purple:{background:C.purple+"18",color:C.purple,border:`1px solid ${C.purple}33`},
    teal:{background:C.teal+"18",color:C.teal,border:`1px solid ${C.teal}33`},
  };
  return <button onClick={disabled||loading?undefined:onClick} style={{...vs[variant||"ghost"],borderRadius:6,cursor:disabled||loading?"not-allowed":"pointer",fontWeight:700,fontFamily:"'Sora',sans-serif",opacity:disabled?.35:1,padding:small?"6px 13px":"10px 20px",fontSize:small?11:13,width:full?"100%":"auto",transition:"all .15s",...x}}>{loading?"⟳ Working…":children}</button>;
}

export function Card({children,style:x,glow,color,onClick,tron}){
  const glowColor=color||C.accent;
  return <div onClick={onClick} className={tron?"tron-glow":""} style={{
    background:C.card,
    border:`1px solid ${glow?glowColor+"44":C.border}`,
    borderRadius:10,padding:18,
    boxShadow:glow?`0 0 30px ${glowColor}18,inset 0 1px 0 ${glowColor}11`:"none",
    cursor:onClick?"pointer":"default",
    position:"relative",overflow:"hidden",
    transition:"border-color .15s,box-shadow .15s",
    ...x
  }}>{children}</div>;
}

export function Stat({label,value,delta,color,icon}){
  const col=color||C.accent;
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`radial-gradient(circle at 80% 20%,${col}15,transparent 70%)`}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${col}44,transparent)`}}/>
    {icon&&<div style={{fontSize:16,marginBottom:4}}>{icon}</div>}
    <div style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:1.5,marginBottom:4,fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>{label}</div>
    <div style={{color:col,fontFamily:"'Rajdhani',sans-serif",fontSize:32,fontWeight:700,lineHeight:1}}>{value}</div>
    {delta&&<div style={{color:C.mutedHi,fontSize:10,marginTop:3,fontFamily:"DM Mono,monospace"}}>{delta}</div>}
  </div>;
}

export function Sec({title,sub,action}){
  return <div style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:10}}>
    <div>
      <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,color:C.white,letterSpacing:2,textTransform:"uppercase",lineHeight:1,textShadow:`0 0 20px ${C.accent}33`}}>{title}</h2>
      {sub&&<p style={{color:C.muted,fontSize:12,marginTop:3,fontFamily:"DM Mono,monospace"}}>{sub}</p>}
    </div>
    {action}
  </div>;
}

export function AIOut({loading,output,label}){
  if(!loading&&!output)return null;
  return <div style={{background:C.card2,border:`1px solid ${C.accent}22`,borderRadius:8,padding:16,marginTop:12,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.accent}66,transparent)`}}/>
    <div style={{color:C.accent,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:8}}>⚡ {label||"AI OUTPUT"}</div>
    {loading
      ?<div style={{color:C.muted,fontSize:12,fontFamily:"DM Mono,monospace",display:"flex",alignItems:"center",gap:8}}><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>◈</span> CLAUDE IS PROCESSING…</div>
      :<><p style={{color:C.white,fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{output}</p><button onClick={()=>navigator.clipboard?.writeText(output)} style={{marginTop:8,background:"none",border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 10px",color:C.muted,fontSize:11,cursor:"pointer"}}>◈ COPY</button></>
    }
  </div>;
}

export function Modal({show,onClose,title,children,maxW=520}){
  if(!show)return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(2,4,8,.9)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <Card style={{width:"100%",maxWidth:maxW,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.accent}33`}} glow>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700,color:C.white,letterSpacing:2,textTransform:"uppercase"}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer"}}>✕</button>
      </div>
      {children}
    </Card>
  </div>;
}

export function Inp({label,value,onChange,type="text",placeholder,rows}){
  const base={background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",width:"100%",boxSizing:"border-box",transition:"border-color .15s"};
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>{label}</label>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,resize:"vertical"}}/>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>}
  </div>;
}

export function Sel({label,value,onChange,options}){
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  </div>;
}

export function Avatar({name,size=36,color,verified,photo}){
  const col=color||C.accent;
  return <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${col}33,${col}11)`,border:`1px solid ${col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",fontSize:Math.round(size*.44),fontWeight:700,color:col,boxShadow:`0 0 12px ${col}22`,overflow:"hidden"}}>
      {photo?<img src={photo} style={{width:size,height:size,objectFit:"cover"}} alt={name}/>:<span>{(name||"?")[0].toUpperCase()}</span>}
    </div>
    {verified&&<div style={{position:"absolute",bottom:-1,right:-1,width:Math.round(size*.36),height:Math.round(size*.36),borderRadius:"50%",background:C.blue,border:`2px solid ${C.card}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*.16),color:C.white}}>✓</div>}
  </div>;
}

export function NotifDot({count}){
  if(!count)return null;
  return <div style={{background:C.red,color:C.white,borderRadius:"50%",minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,marginLeft:"auto",boxShadow:`0 0 8px ${C.red}66`}}>{count>9?"9+":count}</div>;
}

// ── TRON SCAN-LINE BACKGROUND ──────────────────
export function TronBg(){
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    <div className="tron-grid-bg" style={{position:"absolute",inset:0,opacity:.4}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 80% 60% at 50% 0%,${C.accent}08,transparent 60%)`}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 60% 40% at 80% 80%,${C.gold}06,transparent 50%)`}}/>
  </div>;
}
