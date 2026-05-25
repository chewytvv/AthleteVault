import React,{useState,useEffect} from "react";
import { C } from "../lib/theme.js";
import { Avatar, Badge, NotifDot } from "./ui.jsx";

export function useMobile(){
  const [m,setM]=useState(()=>typeof window!=="undefined"&&window.innerWidth<640);
  useEffect(()=>{const f=()=>setM(window.innerWidth<640);window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f);},[]);
  return m;
}

const MOBILE_PRIMARY={
  athlete:[{id:"home",icon:"🏠",label:"Vault"},{id:"schools",icon:"🏫",label:"Schools"},{id:"messages",icon:"💬",label:"Messages"},{id:"profile",icon:"👤",label:"Profile"}],
  coach:[{id:"home",icon:"🏠",label:"Home"},{id:"athletes",icon:"🔍",label:"Athletes"},{id:"messages",icon:"💬",label:"Messages"},{id:"profile",icon:"👤",label:"Profile"}],
  owner:[{id:"overview",icon:"⬡",label:"Overview"},{id:"athletes",icon:"👥",label:"Athletes"},{id:"revenue",icon:"💰",label:"Revenue"},{id:"ai",icon:"⚡",label:"AI"}],
};

export function BottomNav({role,tab,setTab,navItems,msgCount,notifCount,user,onLogout}){
  const [moreOpen,setMoreOpen]=useState(false);
  const primary=MOBILE_PRIMARY[role]||MOBILE_PRIMARY.athlete;
  const primaryIds=new Set(primary.map(t=>t.id));
  const secondary=navItems.filter(n=>!primaryIds.has(n.id));
  const isFree=role==="athlete"&&user?.plan==="free";
  return <>
    {moreOpen&&<div onClick={()=>setMoreOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:198}}/>}
    <div style={{position:"fixed",bottom:58,left:0,right:0,background:C.dark,borderTop:`1px solid ${C.border}`,zIndex:199,padding:"12px 16px 8px",display:moreOpen?"block":"none",maxHeight:"60vh",overflowY:"auto",borderRadius:"16px 16px 0 0"}}>
      <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:2,marginBottom:10}}>ALL TABS</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {secondary.map(n=>{const locked=isFree&&n.pro;return <button key={n.id} onClick={()=>{if(!locked){setTab(n.id);setMoreOpen(false);}}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",borderRadius:9,border:"none",background:tab===n.id?C.goldGlow:C.card,color:locked?C.muted:tab===n.id?C.gold:C.mutedHi,cursor:locked?"not-allowed":"pointer",fontFamily:"'Sora',sans-serif",fontSize:10,fontWeight:600}}>
          <span style={{fontSize:18}}>{n.icon}</span>
          <span style={{textAlign:"center",lineHeight:1.2}}>{n.label}</span>
          {locked&&<span style={{fontSize:9,color:C.muted}}>🔒</span>}
        </button>;})}
        <button onClick={()=>{onLogout();setMoreOpen(false);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 4px",borderRadius:9,border:"none",background:C.card,color:C.red,cursor:"pointer",fontFamily:"'Sora',sans-serif",fontSize:10,fontWeight:600}}>
          <span style={{fontSize:18}}>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </div>
    <div style={{position:"fixed",bottom:0,left:0,right:0,height:58,background:C.dark,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:200,alignItems:"stretch",padding:"0 4px",paddingBottom:"env(safe-area-inset-bottom)"}}>
      {primary.map(t=>{const count=t.id==="messages"?msgCount:t.id==="notifications"?notifCount:0;const active=tab===t.id;return <button key={t.id} onClick={()=>{setTab(t.id);setMoreOpen(false);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,border:"none",background:"transparent",cursor:"pointer",position:"relative",borderTop:`2px solid ${active?C.gold:"transparent"}`}}>
        <span style={{fontSize:21}}>{t.icon}</span>
        <span style={{fontFamily:"'Sora',sans-serif",fontSize:9,fontWeight:600,color:active?C.gold:C.muted}}>{t.label}</span>
        {count>0&&<div style={{position:"absolute",top:4,right:"18%",minWidth:16,height:16,borderRadius:8,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",fontWeight:700,padding:"0 3px"}}>{count>9?"9+":count}</div>}
      </button>;})}
      <button onClick={()=>setMoreOpen(p=>!p)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,border:"none",background:"transparent",cursor:"pointer",borderTop:`2px solid ${moreOpen?C.gold:"transparent"}`}}>
        <span style={{fontSize:21,letterSpacing:-2,color:moreOpen?C.gold:C.muted}}>•••</span>
        <span style={{fontFamily:"'Sora',sans-serif",fontSize:9,fontWeight:600,color:moreOpen?C.gold:C.muted}}>More</span>
      </button>
    </div>
  </>;
}

export function Sidebar({navItems,tab,setTab,user,role,onLogout,msgCount,notifCount}){
  const rc={owner:C.gold,athlete:C.blue,coach:C.purple};
  const rl={owner:"Owner",athlete:"Athlete",coach:"Coach"};
  const [collapsed,setCollapsed]=useState(false);
  const isFree=role==="athlete"&&user?.plan==="free";
  return <div style={{width:collapsed?64:220,flexShrink:0,background:C.dark,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0,transition:"width .2s"}}>
    <div style={{padding:collapsed?"12px 8px":"16px 13px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:collapsed?0:12,justifyContent:collapsed?"center":"flex-start"}}>
        <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:C.black,flexShrink:0}}>AV</div>
        {!collapsed&&<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:C.white,letterSpacing:1.5}}>ATHLETEVAULT</div>}
      </div>
      {!collapsed&&<div style={{background:C.card,borderRadius:9,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Avatar name={user?.name||"O"} size={28} color={rc[role]} verified={user?.verified}/><div style={{color:C.white,fontWeight:700,fontSize:12,lineHeight:1.2}}>{user?.name||"Chewy Barnes"}</div></div>
        <Badge color={rc[role]}>{rl[role]}</Badge>
        {isFree&&<div style={{color:C.gold,fontSize:10,marginTop:5,fontFamily:"DM Mono,monospace",background:C.goldGlow,borderRadius:4,padding:"2px 6px",display:"inline-block"}}>FREE PLAN — UPGRADE</div>}
        {!isFree&&user?.tier&&<div style={{color:C.muted,fontSize:10,marginTop:4,fontFamily:"DM Mono,monospace"}}>{user.tier.toUpperCase()} PLAN</div>}
      </div>}
    </div>
    <nav style={{flex:1,padding:collapsed?"6px 4px":"9px 6px",overflowY:"auto"}}>
      {navItems.map(n=>{const locked=isFree&&n.pro;return <button key={n.id} onClick={()=>setTab(n.id)} title={collapsed?n.label:""} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:8,width:"100%",padding:collapsed?"10px 8px":"9px 10px",borderRadius:7,border:"none",background:tab===n.id?C.goldGlow:"transparent",color:tab===n.id?C.gold:locked?C.border:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",textAlign:"left",marginBottom:1,borderLeft:`2px solid ${tab===n.id&&!collapsed?C.gold:"transparent"}`,transition:"all .15s",position:"relative"}}>
        <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
        {!collapsed&&<span style={{flex:1}}>{n.label}</span>}
        {!collapsed&&locked&&<span style={{fontSize:10,color:C.muted}}>🔒</span>}
        {!collapsed&&!locked&&n.id==="messages"&&msgCount>0&&<NotifDot count={msgCount}/>}
        {!collapsed&&!locked&&n.id==="notifications"&&notifCount>0&&<NotifDot count={notifCount}/>}
        {collapsed&&(n.id==="messages"&&msgCount>0||n.id==="notifications"&&notifCount>0)&&<div style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.red}}/>}
      </button>;})}
    </nav>
    <div style={{padding:collapsed?"6px 4px":"9px 6px",borderTop:`1px solid ${C.border}`}}>
      <button onClick={()=>setCollapsed(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:8,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:4}}><span>{collapsed?"→":"←"}</span>{!collapsed&&"Collapse"}</button>
      <button onClick={onLogout} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:7,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.red,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>🚪{!collapsed&&" Sign Out"}</button>
    </div>
  </div>;
}
