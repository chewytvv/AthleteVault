import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase.js";
const C = {
  gold:"#E8B84B",goldDim:"#B8902A",goldGlow:"rgba(232,184,75,0.13)",
  black:"#070710",dark:"#0C0C1A",card:"#111120",card2:"#16162A",
  border:"#1C1C34",white:"#EEEEFA",muted:"#5E5E88",mutedHi:"#8888AA",
  green:"#22D47A",red:"#EF4466",blue:"#4A8FFF",purple:"#9B6AFF",
};
const fmt  = n => new Intl.NumberFormat().format(n);
const fmtM = n => "$"+new Intl.NumberFormat().format(n);
const stamp= () => new Date().toLocaleString();
const tsShort=()=>new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const dateLabel=d=>{const now=new Date(),msg=new Date(d),diff=Math.floor((now-msg)/864e5);if(diff===0)return"Today";if(diff===1)return"Yesterday";if(diff<7)return msg.toLocaleDateString([],{weekday:"long"});return msg.toLocaleDateString([],{month:"short",day:"numeric"});};

const REGIONS=["United States","Germany","France","Spain","Italy","UK","Canada","Australia","Japan","South Korea","Brazil","Argentina","Mexico","Nigeria","Ghana","Senegal","Turkey","Greece","Austria","Finland","Sweden","Norway","Denmark","Netherlands","Belgium","Czech Republic","Poland","Israel","New Zealand","Philippines","China","Taiwan","UAE","Saudi Arabia","South Africa","Egypt","Jamaica","Puerto Rico","Dominican Republic","Panama","Venezuela","Colombia"];

const DEF_A_PRIV={showEmail:false,showPhone:false,showLocation:true,showFollowers:true,showSchool:true,showStats:true,showVideos:true,showDeals:false,profileVisible:true,searchable:true};
const DEF_C_PRIV={showEmail:true,showPhone:false,showTwitter:true,showInstagram:true,showLinkedin:true,showBio:true,profileVisible:true,searchable:true};

const SEED_ATHLETES=[
  {id:1,role:"athlete",name:"Marcus Webb",sport:"Football",school:"Undrafted – C-USA",followers:4200,tier:"Rookie",mrr:29,status:"active",joined:"2026-01-12",email:"marcus@email.com",phone:"",country:"United States",state:"Texas",city:"Houston",bio:"WR with speed and route-running. Looking for overseas opportunities.",coachSent:3,brandSent:5,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[]},
  {id:2,role:"athlete",name:"Jaylen Cross",sport:"Basketball",school:"HBCU – MEAC",followers:11800,tier:"Pro",mrr:79,status:"active",joined:"2026-01-20",email:"jaylen@email.com",phone:"",country:"United States",state:"Georgia",city:"Atlanta",bio:"PG 6'2\". HBCU standout targeting pro opportunities in Europe or Asia.",coachSent:8,brandSent:14,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[]},
  {id:3,role:"athlete",name:"Deja Monroe",sport:"Track",school:"D2 – GLIAC",followers:2100,tier:"Rookie",mrr:29,status:"active",joined:"2026-02-03",email:"deja@email.com",phone:"",country:"United States",state:"Michigan",city:"Detroit",bio:"Sprinter 100m/200m. NCAA D2 record holder.",coachSent:2,brandSent:3,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[]},
  {id:4,role:"athlete",name:"Chris Okafor",sport:"Football",school:"GFL1 – Germany",followers:8400,tier:"Pro",mrr:79,status:"active",joined:"2026-02-11",email:"chris@email.com",phone:"",country:"Germany",state:"",city:"Berlin",bio:"DB in GFL1 Germany. UTEP alum. Experienced internationally.",coachSent:9,brandSent:11,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[]},
  {id:5,role:"athlete",name:"Aaliyah Stone",sport:"Soccer",school:"NWSL Hopeful",followers:6700,tier:"Rising",mrr:49,status:"active",joined:"2026-02-28",email:"aaliyah@email.com",phone:"",country:"United States",state:"California",city:"Los Angeles",bio:"Forward, 30 goals last season. Targeting NWSL or European club.",coachSent:5,brandSent:7,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[]},
];
const SEED_COACHES=[
  {id:101,role:"coach",name:"Coach Ray Thompson",sport:"Football",org:"Texas Southern University",title:"Offensive Coordinator",email:"rthompson@tsu.edu",phone:"(713)555-0182",country:"United States",state:"Texas",city:"Houston",twitter:"@CoachRayTSU",instagram:"@coachray_tsu",linkedin:"linkedin.com/in/raythompson",bio:"15 years developing skill positions. Looking for WRs and DBs.",recruitingRegions:["United States","Germany","Canada"],status:"active",joined:"2026-01-05",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
  {id:102,role:"coach",name:"Coach Sandra Mills",sport:"Basketball",org:"Grambling State",title:"Head Women's Coach",email:"smills@gram.edu",phone:"(318)555-0247",country:"United States",state:"Louisiana",city:"Grambling",twitter:"@CoachMillsGSU",instagram:"@sandramills_hoops",linkedin:"linkedin.com/in/sandramills",bio:"Recruiting guards and forwards. NIL-friendly program.",recruitingRegions:["United States","Nigeria","Ghana","Senegal"],status:"active",joined:"2026-01-14",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
  {id:103,role:"coach",name:"Coach Derek Osei",sport:"Football",org:"GFL Berlin Thunder",title:"Head Coach",email:"dosei@berlinthunder.de",phone:"",country:"Germany",state:"",city:"Berlin",twitter:"@CoachOseiGFL",instagram:"@derek_osei_gfl",linkedin:"linkedin.com/in/derekosei",bio:"Recruiting American players for GFL1. Paid contracts + housing.",recruitingRegions:["United States","Canada","UK"],status:"active",joined:"2026-01-28",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
  {id:104,role:"coach",name:"Coach Lisa Vega",sport:"Soccer",org:"Houston Dash (NWSL)",title:"Player Development",email:"lvega@houstondash.com",phone:"(832)555-0319",country:"United States",state:"Texas",city:"Houston",twitter:"@CoachVegaNWSL",instagram:"@lisavega_soccer",linkedin:"linkedin.com/in/lisavega",bio:"Tracking forwards and midfielders from around the world.",recruitingRegions:["United States","Brazil","Argentina","Spain","Colombia"],status:"active",joined:"2026-02-10",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
  {id:105,role:"coach",name:"Coach Terrence Boyd",sport:"Basketball",org:"Prairie View A&M",title:"Assistant Coach",email:"tboyd@pvamu.edu",phone:"(936)555-0401",country:"United States",state:"Texas",city:"Prairie View",twitter:"@TBoydPVAMU",instagram:"@tboyd_hoops",linkedin:"linkedin.com/in/terrenceboyd",bio:"Building backcourt. Open to JUCO and international players.",recruitingRegions:["United States","Nigeria","UK","Australia"],status:"active",joined:"2026-02-22",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
  {id:106,role:"coach",name:"Coach Angela Kim",sport:"Track",org:"Howard University",title:"Head Track & Field",email:"akim@howard.edu",phone:"(202)555-0533",country:"United States",state:"DC",city:"Washington",twitter:"@CoachKimHoward",instagram:"@angelakim_track",linkedin:"linkedin.com/in/angelakim",bio:"Scholarships for sprinters and jumpers worldwide.",recruitingRegions:["United States","Jamaica","South Korea","Japan","Dominican Republic"],status:"active",joined:"2026-03-01",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[]},
];
const SEED_LOGS=[{id:1,ts:"2026-05-20 09:14",action:"Owner login",detail:"Authenticated",level:"info"}];
const SEED_SET={rookiePrice:29,risingPrice:49,proPrice:79,platformName:"AthleteVault",tagline:"Built by athletes. For athletes.",ownerName:"Dennis 'Chewy' Barnes",email:"support@athletevault.com",aiActive:true,outreachActive:true,signupsOpen:true,notifyNewSub:true,notifyChurn:true,notifyDaily:false,welcomeMsg:"Welcome to AthleteVault — your all-in-one platform to build your brand, find coaches, and monetize your athletic career."};
const BRAND_DEALS=[
  {id:1,brand:"Gatorade",category:"Sports Nutrition",payout:"$500–$2,000",logo:"🏆",desc:"Hydration partner for game-day content. 2 posts/month."},
  {id:2,brand:"Nike Training",category:"Apparel",payout:"$300–$1,500",logo:"👟",desc:"Showcase Nike Training gear in workout clips."},
  {id:3,brand:"WHOOP",category:"Fitness Tech",payout:"$200–$800",logo:"⌚",desc:"Wearable recovery tracking. Share your stats."},
  {id:4,brand:"Raising Cane's",category:"Food & Beverage",payout:"$150–$600",logo:"🍗",desc:"Post-game meal content. Easy collab."},
  {id:5,brand:"Athletic Greens",category:"Health",payout:"$400–$1,200",logo:"🥗",desc:"Morning routine supplement feature."},
  {id:6,brand:"Beats by Dre",category:"Audio",payout:"$800–$3,000",logo:"🎧",desc:"Pre-game tunnel walk or training session."},
];
const NIL_LESSONS=[
  {id:1,icon:"📚",level:"Beginner",dur:"8 min",title:"What Is NIL and Why It Matters",content:"NIL stands for Name, Image, and Likeness. Since 2021 college athletes can profit from their brand without losing eligibility. This covers who qualifies, what counts as NIL income, and why acting early puts you ahead of 99% of athletes."},
  {id:2,icon:"🏗️",level:"Beginner",dur:"12 min",title:"Building Your Brand Before the Deal",content:"Before brands reach out, they Google you. This teaches you how to build a consistent online identity — profile photos, bio copy, content pillars — so your social presence sells you before you say a word."},
  {id:3,icon:"📊",level:"Intermediate",dur:"10 min",title:"How to Value Your Social Media",content:"Not sure what to charge? This breaks down CPM, engagement rate valuation, and industry benchmarks by sport and follower count. You'll leave knowing your floor rate."},
  {id:4,icon:"🤝",level:"Intermediate",dur:"15 min",title:"Negotiating Your First Brand Deal",content:"Most athletes undersell on the first deal. This covers contract red flags, how to counter-offer, what deliverables are standard, and when to walk away."},
  {id:5,icon:"💸",level:"Intermediate",dur:"11 min",title:"Taxes on NIL Income — The Basics",content:"NIL income is taxable. Covers self-employment tax, quarterly payments, deductions athletes miss, and why you need a CPA before your first check clears."},
  {id:6,icon:"📝",level:"Advanced",dur:"9 min",title:"Content Contracts & Usage Rights",content:"When a brand pays you, they may reuse your content in ads. This explains usage rights, exclusivity clauses, and how to avoid signing your image away forever."},
  {id:7,icon:"💰",level:"Advanced",dur:"14 min",title:"Building Multiple Revenue Streams",content:"Brand deals are one stream. This maps 7 ways athletes monetize: NIL deals, coaching clinics, Patreon, merchandise, speaking, content subscriptions, and affiliates."},
  {id:8,icon:"✈️",level:"Advanced",dur:"13 min",title:"Going Overseas: Contracts & Money",content:"Built from real GFL1 experience — European contracts, currency exchange, agent cuts, housing stipends, and how to keep building your brand from abroad."},
  {id:9,icon:"🏈",level:"Beginner",dur:"10 min",title:"For Coaches: Navigating NIL With Athletes",content:"Learn how to support your athletes' NIL deals without violating NCAA rules, how to structure team endorsements, and how to use AthleteVault to find and connect with talent."},
];
const HELP_FAQS=[
  {q:"How does in-app messaging work?",ans:"Go to Messages in your sidebar. Search for any athlete or coach on the platform and start a conversation. All messages are private and stay inside AthleteVault."},
  {q:"Can I block someone?",ans:"Yes. Open any conversation, tap the menu (⋯), and select Block. Blocked users cannot message you or view your contact info."},
  {q:"Can I control what others see on my profile?",ans:"Yes. Go to Privacy & Security. You choose exactly what to show or hide: email, phone, location, stats, videos, and more."},
  {q:"How do coaches find international athletes?",ans:"Coaches use the Find Athletes tab and filter by country, region, and US state. Athletes who set themselves as searchable will appear in results."},
  {q:"What is the NIL Academy?",ans:"A self-paced education center for athletes and coaches covering NIL from basics to deal negotiation, taxes, and going overseas."},
  {q:"Is my data private?",ans:"Yes. You control every privacy setting. Contact info is hidden by default. AthleteVault never sells your data."},
  {q:"How do I contact support?",ans:"Use the form below or email support@athletevault.com. Owner Dennis 'Chewy' Barnes reviews every message within 24 hours."},
];

// ── Storage ──────────────────────────────────
function useStore(key,init){
  const [data,setData]=useState(init);
  const [ready,setReady]=useState(false);
  useEffect(()=>{(async()=>{try{const r=await window.storage.get(key);if(r?.value)setData(JSON.parse(r.value));}catch(_){}setReady(true);})();},[key]);
  const save=useCallback(async val=>{const next=typeof val==="function"?val(data):val;setData(next);try{await window.storage.set(key,JSON.stringify(next));}catch(_){}return next;},[key,data]);
  return [data,save,ready];
}

// ── AI ───────────────────────────────────────
const AI_SYS="You are AthleteVault's AI — a world-class sports brand strategist for athletes and coaches navigating NIL, recruiting, overseas play, and monetization. Be direct, specific, practical.";
async function ai(system,user){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages:[{role:"user",content:user}]})});
  if(!r.ok)throw new Error(r.status);
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}

const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL || "";

// ── Shared UI ────────────────────────────────
function Badge({color=C.muted,children}){return <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:700,letterSpacing:.5,whiteSpace:"nowrap"}}>{children}</span>;}
function Btn({onClick,children,variant="primary",small,disabled,full,style:x}){
  const vs={primary:{background:C.gold,color:C.black},ghost:{background:"transparent",color:C.white,border:`1px solid ${C.border}`},danger:{background:C.red+"22",color:C.red,border:`1px solid ${C.red}44`},success:{background:C.green+"22",color:C.green,border:`1px solid ${C.green}44`}};
  return <button onClick={disabled?undefined:onClick} style={{border:"none",borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,letterSpacing:.4,fontFamily:"'Sora',sans-serif",opacity:disabled?.45:1,padding:small?"7px 13px":"11px 20px",fontSize:small?12:14,width:full?"100%":"auto",...vs[variant],...x}}>{children}</button>;
}
function Card({children,style:x,glow,onClick}){return <div onClick={onClick} style={{background:C.card,border:`1px solid ${glow?C.gold+"66":C.border}`,borderRadius:14,padding:20,boxShadow:glow?`0 0 22px ${C.goldGlow}`:"none",cursor:onClick?"pointer":"default",...x}}>{children}</div>;}
function Stat({label,value,delta,color=C.gold,icon}){
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,right:0,width:70,height:70,background:`radial-gradient(circle at 80% 20%,${color}18,transparent 70%)`}}/>
    <div style={{fontSize:17,marginBottom:5}}>{icon}</div>
    <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:3,fontFamily:"DM Mono,monospace"}}>{label}</div>
    <div style={{color,fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,lineHeight:1}}>{value}</div>
    {delta&&<div style={{color:C.green,fontSize:11,marginTop:4,fontFamily:"DM Mono,monospace"}}>{delta}</div>}
  </div>;
}
function Sec({title,sub}){return <div style={{marginBottom:20}}><h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:C.white,letterSpacing:2,textTransform:"uppercase",lineHeight:1}}>{title}</h2>{sub&&<p style={{color:C.muted,fontSize:13,marginTop:4}}>{sub}</p>}</div>;}
function AIOut({loading,output,label}){
  if(!loading&&!output)return null;
  return <Card glow={!!output} style={{marginTop:13}}>
    <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>AI — {label}</div>
    {loading?<div style={{color:C.muted,fontFamily:"DM Mono,monospace",fontSize:13}}>⟳ Claude is working…</div>
    :<><p style={{color:C.white,fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Sora',sans-serif"}}>{output}</p>
    <Btn variant="ghost" small onClick={()=>navigator.clipboard?.writeText(output)} style={{marginTop:10}}>📋 Copy</Btn></>}
  </Card>;
}
function Modal({show,onClose,title,children,maxW=500}){
  if(!show)return null;
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <Card style={{width:"100%",maxWidth:maxW,maxHeight:"88vh",overflowY:"auto"}} glow>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:C.white,letterSpacing:1}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      {children}
    </Card>
  </div>;
}
function Inp({label,value,onChange,type="text",placeholder,rows}){
  const base={background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",width:"100%",boxSizing:"border-box"};
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace"}}>{label}</label>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,resize:"vertical"}}/>:<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>}
  </div>;
}
function Sel({label,value,onChange,options}){
  return <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>;
}
function Tog({label,sub,val,onChange}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
    <div><div style={{color:C.white,fontSize:13}}>{label}</div>{sub&&<div style={{color:C.muted,fontSize:11,marginTop:2}}>{sub}</div>}</div>
    <button onClick={()=>onChange(!val)} style={{width:40,height:21,borderRadius:10,border:"none",cursor:"pointer",background:val?C.green:C.border,position:"relative",transition:"background .2s",flexShrink:0,marginLeft:12}}>
      <div style={{position:"absolute",top:2,left:val?20:2,width:17,height:17,borderRadius:"50%",background:C.white,transition:"left .2s"}}/>
    </button>
  </div>;
}
function RegionPicker({selected,onChange}){
  return <div style={{display:"flex",gap:6,flexWrap:"wrap",maxHeight:130,overflowY:"auto"}}>
    {REGIONS.map(r=>{const on=selected.includes(r);return <button key={r} onClick={()=>onChange(on?selected.filter(x=>x!==r):[...selected,r])} style={{background:on?C.goldGlow:"transparent",border:`1px solid ${on?C.gold:C.border}`,borderRadius:6,padding:"5px 10px",cursor:"pointer",color:on?C.gold:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:11,marginBottom:4}}>{r}</button>;})}
  </div>;
}
function Avatar({name,size=36,color=C.gold}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:Math.round(size*0.45),fontWeight:900,color:C.black,flexShrink:0}}>{(name||"?")[0].toUpperCase()}</div>;
}
// ═══════════════════════════════════════════════
//  MESSAGING SYSTEM
// ═══════════════════════════════════════════════
// threadId = sorted join of two user IDs e.g. "1_101"
function makeThreadId(a,b){return [a,b].sort((x,y)=>Number(x)-Number(y)).join("_");}

function Messaging({me,athletes,coaches,saveAthletes,saveCoaches,messages,saveMessages}){
  const allUsers=[...athletes,...coaches];
  const blocked=me.blockedIds||[];
  const [selThread,setSelThread]=useState(null);
  const [search,setSearch]=useState("");
  const [newMsg,setNewMsg]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [newSearch,setNewSearch]=useState("");
  const [showMenu,setShowMenu]=useState(false);
  const msgEndRef=useRef(null);

  // All threads this user is part of
  const myThreads=Object.entries(messages||{})
    .filter(([tid])=>tid.split("_").includes(String(me.id)))
    .map(([tid,msgs])=>{
      const otherId=Number(tid.split("_").find(x=>Number(x)!==me.id));
      const other=allUsers.find(u=>u.id===otherId);
      const lastMsg=msgs[msgs.length-1];
      const unread=msgs.filter(m=>m.senderId!==me.id&&!m.read).length;
      return {tid,other,lastMsg,unread};
    })
    .filter(t=>t.other&&!blocked.includes(t.other.id))
    .filter(t=>!search||t.other?.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.lastMsg?.ts||0)-new Date(a.lastMsg?.ts||0));

  const threadMsgs=selThread?(messages[selThread]||[]):[];
  const selOther=selThread?allUsers.find(u=>u.id===Number(selThread.split("_").find(x=>Number(x)!==me.id))):null;

  // Mark read
  useEffect(()=>{
    if(!selThread)return;
    const msgs=messages[selThread]||[];
    const hasUnread=msgs.some(m=>m.senderId!==me.id&&!m.read);
    if(hasUnread){
      saveMessages(prev=>({...prev,[selThread]:msgs.map(m=>m.senderId!==me.id?{...m,read:true}:m)}));
    }
  },[selThread,messages]);

  useEffect(()=>{msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[threadMsgs.length]);

  function send(){
    if(!newMsg.trim()||!selThread)return;
    const msg={id:Date.now(),senderId:me.id,text:newMsg.trim(),ts:new Date().toISOString(),read:false};
    saveMessages(prev=>({...prev,[selThread]:[...(prev[selThread]||[]),msg]}));
    setNewMsg("");
  }

  function startThread(otherId){
    const tid=makeThreadId(me.id,otherId);
    setSelThread(tid);
    setShowNew(false);
    setNewSearch("");
  }

  function blockUser(otherId){
    const saveFn=me.role==="athlete"?saveAthletes:saveCoaches;
    saveFn(prev=>prev.map(u=>u.id===me.id?{...u,blockedIds:[...(u.blockedIds||[]),otherId]}:u));
    setSelThread(null);
    setShowMenu(false);
  }

  function unblockUser(bid){
    const saveFn=me.role==="athlete"?saveAthletes:saveCoaches;
    saveFn(prev=>prev.map(u=>u.id===me.id?{...u,blockedIds:(u.blockedIds||[]).filter(x=>x!==bid)}:u));
  }

  function deleteThread(){
    saveMessages(prev=>{const n={...prev};delete n[selThread];return n;});
    setSelThread(null);
    setShowMenu(false);
  }

  // New message: who can you message?
  const contactable=allUsers
    .filter(u=>u.id!==me.id&&!blocked.includes(u.id)&&u.status==="active"&&u.privacy?.profileVisible!==false)
    .filter(u=>!newSearch||u.name.toLowerCase().includes(newSearch.toLowerCase())||u.sport?.toLowerCase().includes(newSearch.toLowerCase()));

  const totalUnread=Object.entries(messages||{}).filter(([tid])=>tid.split("_").includes(String(me.id))).reduce((s,[,msgs])=>s+msgs.filter(m=>m.senderId!==me.id&&!m.read).length,0);

  // group messages by date
  function groupByDate(msgs){
    const groups={};
    msgs.forEach(m=>{const d=dateLabel(m.ts);if(!groups[d])groups[d]=[];groups[d].push(m);});
    return groups;
  }

  return <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:0,height:"calc(100vh - 80px)",border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
    {/* Left: thread list */}
    <div style={{background:C.dark,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:C.white,letterSpacing:1}}>MESSAGES {totalUnread>0&&<span style={{background:C.red,color:C.white,borderRadius:"50%",padding:"2px 7px",fontSize:11,marginLeft:6}}>{totalUnread}</span>}</div>
          <button onClick={()=>setShowNew(true)} style={{background:C.gold,color:C.black,border:"none",borderRadius:8,padding:"6px 12px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>+ New</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 11px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {myThreads.length===0&&<div style={{padding:24,color:C.muted,fontSize:13,textAlign:"center"}}>No conversations yet.<br/>Tap + New to start messaging.</div>}
        {myThreads.map(({tid,other,lastMsg,unread})=><div key={tid} onClick={()=>setSelThread(tid)} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:selThread===tid?C.goldGlow:"transparent",transition:"background .15s"}}>
          <div style={{position:"relative"}}>
            <Avatar name={other?.name} size={40} color={other?.role==="coach"?C.purple:C.blue}/>
            {unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,background:C.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.white}}>{unread}</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{color:C.white,fontWeight:unread>0?700:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{other?.name}</span>
              <span style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",flexShrink:0,marginLeft:6}}>{lastMsg?new Date(lastMsg.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):""}</span>
            </div>
            <div style={{color:unread>0?C.white:C.muted,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lastMsg?.senderId===me.id?"You: ":""}{lastMsg?.text||"Start a conversation"}</div>
          </div>
        </div>)}
      </div>
      {/* Blocked users */}
      {blocked.length>0&&<div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:8}}>BLOCKED ({blocked.length})</div>
        {blocked.map(bid=>{const u=allUsers.find(x=>x.id===bid);return u?<div key={bid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{color:C.muted,fontSize:12}}>{u.name}</span><button onClick={()=>unblockUser(bid)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",color:C.mutedHi,fontSize:11}}>Unblock</button></div>:null;})}
      </div>}
    </div>

    {/* Right: chat */}
    {selThread&&selOther?<div style={{display:"flex",flexDirection:"column",background:C.black}}>
      {/* Header */}
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.dark}}>
        <Avatar name={selOther.name} size={38} color={selOther.role==="coach"?C.purple:C.blue}/>
        <div style={{flex:1}}>
          <div style={{color:C.white,fontWeight:700,fontSize:15}}>{selOther.name}</div>
          <div style={{color:C.muted,fontSize:12}}>{selOther.role==="coach"?`${selOther.title} · ${selOther.org}`:`${selOther.sport} · ${selOther.school}`}</div>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowMenu(p=>!p)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:C.muted,fontSize:16}}>⋯</button>
          {showMenu&&<div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",zIndex:100,minWidth:150}}>
            <button onClick={()=>{blockUser(selOther.id);}} style={{display:"block",width:"100%",padding:"10px 14px",background:"none",border:"none",cursor:"pointer",color:C.red,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>🚫 Block User</button>
            <button onClick={deleteThread} style={{display:"block",width:"100%",padding:"10px 14px",background:"none",border:"none",cursor:"pointer",color:C.muted,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>🗑️ Delete Conversation</button>
            <button onClick={()=>setShowMenu(false)} style={{display:"block",width:"100%",padding:"10px 14px",background:"none",border:"none",cursor:"pointer",color:C.muted,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>Cancel</button>
          </div>}
        </div>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 20px",display:"flex",flexDirection:"column",gap:0}}>
        {threadMsgs.length===0&&<div style={{textAlign:"center",color:C.muted,fontSize:13,marginTop:40}}>No messages yet. Say hello!</div>}
        {Object.entries(groupByDate(threadMsgs)).map(([date,msgs])=><div key={date}>
          <div style={{textAlign:"center",color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace",margin:"16px 0 10px"}}>{date}</div>
          {msgs.map((m,i)=>{
            const isMe=m.senderId===me.id;
            const showAvatar=!isMe&&(i===0||msgs[i-1]?.senderId!==m.senderId);
            return <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:8,marginBottom:4}}>
              {!isMe&&(showAvatar?<Avatar name={selOther.name} size={28} color={selOther.role==="coach"?C.purple:C.blue}/>:<div style={{width:28}}/>)}
              <div style={{maxWidth:"68%"}}>
                <div style={{background:isMe?C.gold:C.card2,color:isMe?C.black:C.white,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",fontSize:14,lineHeight:1.5,fontFamily:"'Sora',sans-serif",wordBreak:"break-word"}}>{m.text}</div>
                <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",textAlign:isMe?"right":"left",marginTop:3}}>
                  {new Date(m.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}{isMe&&<span style={{marginLeft:5,color:m.read?C.blue:C.muted}}>{m.read?"✓✓":"✓"}</span>}
                </div>
              </div>
            </div>;
          })}
        </div>)}
        <div ref={msgEndRef}/>
      </div>
      {/* Input */}
      <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,background:C.dark}}>
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder="Type a message… (Enter to send)" style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.white,fontSize:14,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
        <button onClick={send} disabled={!newMsg.trim()} style={{background:C.gold,color:C.black,border:"none",borderRadius:10,padding:"0 18px",fontWeight:700,fontSize:20,cursor:newMsg.trim()?"pointer":"not-allowed",opacity:newMsg.trim()?1:.4}}>➤</button>
      </div>
    </div>
    :<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.black,color:C.muted,gap:12}}>
      <div style={{fontSize:48}}>💬</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:C.white,letterSpacing:1}}>YOUR MESSAGES</div>
      <div style={{fontSize:14,color:C.muted,textAlign:"center",maxWidth:280}}>Select a conversation or start a new one to connect with athletes and coaches worldwide.</div>
      <button onClick={()=>setShowNew(true)} style={{background:C.gold,color:C.black,border:"none",borderRadius:10,padding:"12px 24px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Sora',sans-serif",marginTop:8}}>+ Start New Conversation</button>
    </div>}

    {/* New conversation modal */}
    <Modal show={showNew} onClose={()=>{setShowNew(false);setNewSearch("");}} title="NEW MESSAGE">
      <input value={newSearch} onChange={e=>setNewSearch(e.target.value)} placeholder="Search athletes or coaches…" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box",marginBottom:14}}/>
      <div style={{maxHeight:320,overflowY:"auto"}}>
        {contactable.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:20}}>No users found.</div>}
        {contactable.map(u=><div key={u.id} onClick={()=>startThread(u.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:10,cursor:"pointer",marginBottom:4,background:"transparent",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.card2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <Avatar name={u.name} size={38} color={u.role==="coach"?C.purple:C.blue}/>
          <div>
            <div style={{color:C.white,fontWeight:600,fontSize:14}}>{u.name}</div>
            <div style={{color:C.muted,fontSize:12}}>{u.role==="coach"?`${u.title} · ${u.org}`:`${u.sport} · ${u.school}`}</div>
          </div>
          <Badge color={u.role==="coach"?C.purple:C.blue} style={{marginLeft:"auto"}}>{u.role}</Badge>
        </div>)}
      </div>
    </Modal>
  </div>;
}
// ═══════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════════
// LEGAL TERMS DATA (condensed for onboarding modal)
// ═══════════════════════════════════════════════════
const TERMS_SUMMARY = [
  {icon:"🏟️",title:"Platform Purpose",text:"AthleteVault is a networking and brand-building platform — NOT a licensed recruiting agency, sports agent, or legal advisor. Nothing here constitutes legal, financial, or recruiting advice."},
  {icon:"🎯",title:"No Outcome Guarantee",text:"We do not guarantee recruitment, scholarships, contracts, brand deals, or NIL income. All opportunities listed are for informational and networking purposes only."},
  {icon:"🤖",title:"AI-Generated Content",text:"AI-generated messages, profiles, and roadmaps are illustrative only. Verify all AI content before using it professionally. We are not liable for AI output."},
  {icon:"⚖️",title:"NIL Compliance",text:"NIL rules vary by state, school, and governing body. You are solely responsible for your own compliance. Always consult a qualified sports attorney."},
  {icon:"🏫",title:"Coach & School Listings",text:"We do not verify coach credentials or guarantee school information accuracy. Always confirm details directly with institutions before making decisions."},
  {icon:"🔒",title:"Your Data & Privacy",text:"You control what others see on your profile. Your contact info is hidden by default. We never sell your personal data to advertisers."},
  {icon:"💳",title:"Subscriptions & Billing",text:"Fees are billed monthly or annually. Non-refundable except where required by law. Cancel anytime. Pricing may change with 30 days' notice."},
  {icon:"📋",title:"Your Responsibilities",text:"You agree to provide accurate info, keep your account secure, not impersonate others, and not use AthleteVault for any illegal purpose."},
  {icon:"⚡",title:"Limitation of Liability",text:"AthleteVault LLC's liability is limited to amounts paid in the prior 12 months. We are not liable for indirect, incidental, or consequential damages."},
  {icon:"🗺️",title:"Governing Law",text:"These terms are governed by Texas law. Disputes resolved by binding arbitration in Houston, TX. You waive the right to class action lawsuits."},
];

const TIER_MEDIA_LIMITS = {
  free:   {photos:0,  videos:0,  bio:false, highlight:false},
  rookie: {photos:3,  videos:2,  bio:true,  highlight:false},
  rising: {photos:10, videos:10, bio:true,  highlight:true},
  pro:    {photos:999,videos:999,bio:true,  highlight:true},
};

// ═══════════════════════════════════════════════════
// ONBOARDING / TERMS AGREEMENT (shown before login)
// ═══════════════════════════════════════════════════
function OnboardingTerms({onAccept}){
  const [step,setStep]=useState(1); // 1=welcome, 2=terms, 3=done
  const [checked,setChecked]=useState({terms:false,privacy:false,age:false});
  const [scrolled,setScrolled]=useState(false);
  const scrollRef=useRef(null);

  function handleScroll(){
    const el=scrollRef.current;
    if(!el)return;
    if(el.scrollTop+el.clientHeight>=el.scrollHeight-20)setScrolled(true);
  }

  const allChecked=checked.terms&&checked.privacy&&checked.age;

  return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",backgroundImage:`radial-gradient(ellipse 70% 50% at 50% 0%,${C.goldGlow},transparent 70%)`,padding:20}}>
      <div style={{width:"100%",maxWidth:560}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:58,height:58,borderRadius:16,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:C.black}}>AV</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:C.white,letterSpacing:3}}>ATHLETEVAULT</div>
          <div style={{color:C.muted,fontSize:13,marginTop:4}}>Built by athletes. For athletes.</div>
        </div>

        {step===1&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:32}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:C.white,letterSpacing:1,marginBottom:6}}>WELCOME TO ATHLETEVAULT</div>
            <div style={{color:C.muted,fontSize:13,lineHeight:1.7,marginBottom:22}}>Before you create your account, please review our terms of service and privacy policy. This takes about 2 minutes and protects both you and the platform.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:22}}>
              {[{icon:"🏆",label:"Build Your Brand"},{icon:"📡",label:"Find Coaches"},{icon:"🏫",label:"Search Schools"},{icon:"💰",label:"Monetize NIL"}].map(f=>(
                <div key={f.label} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{f.icon}</span><span style={{color:C.white,fontSize:13,fontWeight:600}}>{f.label}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:C.gold,color:C.black,border:"none",borderRadius:10,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'Sora',sans-serif",letterSpacing:.4}}>Review Terms & Get Started →</button>
          </div>
        )}

        {step===2&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:C.white,letterSpacing:1,marginBottom:4}}>TERMS & CONDITIONS</div>
            <div style={{color:C.muted,fontSize:12,marginBottom:14}}>Scroll through to read. Check all boxes to continue.</div>

            {/* Scrollable terms */}
            <div ref={scrollRef} onScroll={handleScroll} style={{height:320,overflowY:"auto",background:C.dark,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px 18px",marginBottom:16}}>
              {TERMS_SUMMARY.map((t,i)=>(
                <div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:i<TERMS_SUMMARY.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6}}>
                    <span style={{fontSize:17}}>{t.icon}</span>
                    <span style={{color:C.gold,fontWeight:700,fontSize:13}}>{t.title}</span>
                  </div>
                  <p style={{color:C.mutedHi,fontSize:12,lineHeight:1.7}}>{t.text}</p>
                </div>
              ))}
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",marginTop:8}}>
                <p style={{color:C.muted,fontSize:11,lineHeight:1.6}}>Full Terms of Service and Privacy Policy available at any time in the Legal section of the app. AthleteVault LLC · support@athletevault.com · Governed by Texas law.</p>
              </div>
            </div>

            {!scrolled&&<div style={{color:C.muted,fontSize:11,textAlign:"center",marginBottom:12,fontFamily:"DM Mono,monospace"}}>↓ Scroll to the bottom to continue</div>}

            {/* Checkboxes */}
            <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:20}}>
              {[
                {k:"terms",  label:"I have read and agree to the Terms of Service and all platform disclaimers"},
                {k:"privacy",label:"I agree to the Privacy Policy and understand how my data is used"},
                {k:"age",    label:"I am 16 years of age or older (or have parental consent if under 18)"},
              ].map(({k,label})=>(
                <label key={k} style={{display:"flex",alignItems:"flex-start",gap:11,cursor:"pointer",opacity:scrolled?1:.4}}>
                  <div onClick={()=>scrolled&&setChecked(p=>({...p,[k]:!p[k]}))} style={{width:20,height:20,borderRadius:5,border:`2px solid ${checked[k]?C.green:C.border}`,background:checked[k]?C.green+"22":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer",transition:"all .15s"}}>
                    {checked[k]&&<span style={{color:C.green,fontSize:12,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{color:C.mutedHi,fontSize:12,lineHeight:1.5}}>{label}</span>
                </label>
              ))}
            </div>

            <button onClick={()=>{if(allChecked)onAccept();}} disabled={!allChecked} style={{width:"100%",background:allChecked?C.gold:"transparent",color:allChecked?C.black:C.muted,border:`1px solid ${allChecked?C.gold:C.border}`,borderRadius:10,padding:"13px",fontWeight:800,fontSize:14,cursor:allChecked?"pointer":"not-allowed",fontFamily:"'Sora',sans-serif",transition:"all .2s"}}>
              {allChecked?"✓ I AGREE — CONTINUE TO SIGN IN →":"Check all boxes above to continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ATHLETE PROFILE — with photos, film, bio, tier gates
// ═══════════════════════════════════════════════════
function AProfile({athlete,saveAthletes}){
  const tier=athlete.tier?.toLowerCase()||"rookie";
  const limits=TIER_MEDIA_LIMITS[tier]||TIER_MEDIA_LIMITS.rookie;
  const photos=athlete.photos||[];
  const films=athlete.films||[];

  const [f,setF]=useState({
    name:athlete.name,sport:athlete.sport,school:athlete.school,
    city:athlete.city||"",state:athlete.state||"",country:athlete.country||"United States",
    bio:athlete.bio||"",phone:athlete.phone||"",followers:String(athlete.followers||0),
    height:athlete.height||"",weight:athlete.weight||"",position:athlete.position||"",
    gradYear:athlete.gradYear||"",gpa:athlete.gpa||"",highlightUrl:athlete.highlightUrl||"",
  });
  const [saved,setSaved]=useState(false);
  const [photoUrl,setPhotoUrl]=useState("");
  const [filmUrl,setFilmUrl]=useState("");
  const [filmTitle,setFilmTitle]=useState("");
  const [activeTab,setActiveTab]=useState("info");

  function save(){
    saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,...f,followers:Number(f.followers)}:a));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  }
  function addPhoto(){
    if(!photoUrl||photos.length>=limits.photos)return;
    saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,photos:[...(a.photos||[]),{id:Date.now(),url:photoUrl,added:new Date().toISOString().slice(0,10)}]}:a));
    setPhotoUrl("");
  }
  function removePhoto(pid){saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,photos:(a.photos||[]).filter(p=>p.id!==pid)}:a));}
  function addFilm(){
    if(!filmUrl||films.length>=limits.videos)return;
    saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,films:[...(a.films||[]),{id:Date.now(),url:filmUrl,title:filmTitle||"Highlight Film",added:new Date().toISOString().slice(0,10)}]}:a));
    setFilmUrl("");setFilmTitle("");
  }
  function removeFilm(fid){saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,films:(a.films||[]).filter(f=>f.id!==fid)}:a));}

  const tabs=[{id:"info",label:"📋 Info"},{id:"media",label:"📸 Photos & Film"},{id:"athletic",label:"🏈 Athletic Stats"},{id:"academic",label:"🎓 Academic"}];

  return <div>
    <Sec title="My Profile" sub="Your public-facing recruiting profile"/>

    {/* Tier media indicator */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 16px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{{rookie:"⚡",rising:"🌟",pro:"👑",free:"🏃"}[tier]||"⚡"}</span>
        <span style={{color:C.white,fontWeight:600,fontSize:13}}>{athlete.tier||"Rookie"} Plan</span>
      </div>
      <div style={{display:"flex",gap:12}}>
        <span style={{color:C.muted,fontSize:12}}>Photos: <span style={{color:limits.photos===999?C.green:photos.length>=limits.photos?C.red:C.white,fontWeight:600}}>{photos.length}/{limits.photos===999?"∞":limits.photos}</span></span>
        <span style={{color:C.muted,fontSize:12}}>Videos: <span style={{color:limits.videos===999?C.green:films.length>=limits.videos?C.red:C.white,fontWeight:600}}>{films.length}/{limits.videos===999?"∞":limits.videos}</span></span>
        <span style={{color:C.muted,fontSize:12}}>Bio: <span style={{color:limits.bio?C.green:C.red,fontWeight:600}}>{limits.bio?"✓":"✗"}</span></span>
      </div>
    </div>

    {/* Profile preview card */}
    <Card glow style={{marginBottom:18,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:C.black,flexShrink:0,overflow:"hidden"}}>
        {photos[0]?.url?<img src={photos[0].url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:athlete.name[0]}
      </div>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:C.white,letterSpacing:1}}>{athlete.name}</div>
        <div style={{color:C.gold,fontSize:13,marginBottom:3}}>{athlete.sport}{athlete.position?` · ${athlete.position}`:""}</div>
        <div style={{color:C.muted,fontSize:12}}>{athlete.school}{athlete.city?` · ${athlete.city}`:""}{ athlete.country?`, ${athlete.country}`:""}</div>
        {f.bio&&<div style={{color:C.mutedHi,fontSize:12,marginTop:6,lineHeight:1.5}}>{f.bio.slice(0,120)}{f.bio.length>120?"…":""}</div>}
      </div>
      {films[0]&&<div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
        <div style={{fontSize:20}}>🎬</div><div style={{color:C.muted,fontSize:11}}>Highlight on file</div>
      </div>}
    </Card>

    {/* Tabs */}
    <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
      {tabs.map(t=><Btn key={t.id} onClick={()=>setActiveTab(t.id)} variant={activeTab===t.id?"gold":"ghost"} small>{t.label}</Btn>)}
    </div>

    {activeTab==="info"&&(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>PERSONAL INFO</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["FULL NAME","name"],["SPORT","sport"],["POSITION","position","e.g. Wide Receiver"],["SCHOOL / LEAGUE","school"],["SOCIAL FOLLOWING","followers"],["PHONE (private by default)","phone"]].map(([l,k,ph])=><Inp key={k} label={l} value={f[k]||""} onChange={v=>setF(p=>({...p,[k]:v}))} placeholder={ph}/>)}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>LOCATION</div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <Inp label="CITY" value={f.city} onChange={v=>setF(p=>({...p,city:v}))} placeholder="Houston"/>
              <Inp label="STATE / REGION" value={f.state} onChange={v=>setF(p=>({...p,state:v}))} placeholder="Texas"/>
              <Sel label="COUNTRY" value={f.country} onChange={v=>setF(p=>({...p,country:v}))} options={REGIONS}/>
            </div>
          </Card>
          <Card style={{flex:1}}>
            <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>BIO {!limits.bio&&<span style={{color:C.red,fontSize:10}}>(Rookie Pro+ only)</span>}</div>
            {limits.bio?<Inp value={f.bio} onChange={v=>setF(p=>({...p,bio:v}))} placeholder="Tell coaches and brands your story — where you're from, what you've accomplished, where you want to go. Be real." rows={5}/>
            :<div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px",textAlign:"center"}}>
              <div style={{color:C.muted,fontSize:13,marginBottom:10}}>Bio is available on Rookie Pro and above</div>
              <div style={{color:C.gold,fontSize:12}}>Upgrade to add your story → $29/mo</div>
            </div>}
          </Card>
        </div>
      </div>
    )}

    {activeTab==="media"&&(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        {/* Photos */}
        <Card>
          <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>
            PHOTOS ({photos.length}/{limits.photos===999?"∞":limits.photos})
            {limits.photos===0&&<span style={{color:C.red,marginLeft:6}}>— Upgrade to add photos</span>}
          </div>
          {limits.photos>0?(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:13}}>
                {photos.map(p=><div key={p.id} style={{position:"relative",aspectRatio:"1",borderRadius:8,overflow:"hidden",background:C.card2}}>
                  <img src={p.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>
                  <button onClick={()=>removePhoto(p.id)} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,.7)",border:"none",borderRadius:"50%",width:20,height:20,color:C.red,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>)}
                {photos.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:20,color:C.muted,fontSize:13}}>No photos yet. Add a profile or action photo.</div>}
              </div>
              {photos.length<limits.photos&&(
                <div style={{display:"flex",gap:8}}>
                  <input value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} placeholder="Paste image URL or link…" style={{flex:1,background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
                  <Btn onClick={addPhoto} disabled={!photoUrl} small variant="gold">Add</Btn>
                </div>
              )}
              {photos.length>=limits.photos&&limits.photos!==999&&<div style={{color:C.muted,fontSize:12,textAlign:"center",marginTop:6}}>Limit reached. Upgrade for more photos.</div>}
            </>
          ):<div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>📸</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:8}}>Photos unlock on Rookie Pro ($29/mo)</div>
            <div style={{color:C.gold,fontSize:12}}>Up to 3 photos with your plan</div>
          </div>}
        </Card>

        {/* Film / Highlight Reels */}
        <Card>
          <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>
            HIGHLIGHT FILMS ({films.length}/{limits.videos===999?"∞":limits.videos})
            {limits.videos===0&&<span style={{color:C.red,marginLeft:6}}>— Upgrade to add films</span>}
          </div>
          {limits.videos>0?(
            <>
              {films.map(fi=><div key={fi.id} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:24,flexShrink:0}}>🎬</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.white,fontWeight:600,fontSize:13,marginBottom:2}}>{fi.title}</div>
                  <a href={fi.url} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:11,fontFamily:"DM Mono,monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{fi.url.slice(0,40)}{fi.url.length>40?"…":""}</a>
                  <div style={{color:C.muted,fontSize:10,marginTop:2}}>{fi.added}</div>
                </div>
                <button onClick={()=>removeFilm(fi.id)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 8px",color:C.red,cursor:"pointer",fontSize:11}}>✕</button>
              </div>)}
              {films.length===0&&<div style={{textAlign:"center",padding:20,color:C.muted,fontSize:13}}>No highlight films yet. Add a YouTube, Hudl, or direct video link.</div>}
              {films.length<limits.videos&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <input value={filmTitle} onChange={e=>setFilmTitle(e.target.value)} placeholder="Film title (e.g. Spring Highlight Reel 2026)" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
                  <div style={{display:"flex",gap:8}}>
                    <input value={filmUrl} onChange={e=>setFilmUrl(e.target.value)} placeholder="YouTube, Hudl, or video link…" style={{flex:1,background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
                    <Btn onClick={addFilm} disabled={!filmUrl} small variant="gold">Add</Btn>
                  </div>
                </div>
              )}
            </>
          ):<div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:20,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🎬</div>
            <div style={{color:C.muted,fontSize:13,marginBottom:8}}>Film vault unlocks on Rookie Pro ($29/mo)</div>
          </div>}

          {/* Highlight reel URL shortcut */}
          {limits.highlight&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
              <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:8}}>PRIMARY HIGHLIGHT REEL URL</div>
              <input value={f.highlightUrl} onChange={e=>setF(p=>({...p,highlightUrl:e.target.value}))} placeholder="Your best highlight reel link" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
            </div>
          )}
        </Card>
      </div>
    )}

    {activeTab==="athletic"&&(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>MEASURABLES</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["HEIGHT (e.g. 6'2\")","height"],["WEIGHT (lbs)","weight"],["POSITION","position"],["GRADUATION YEAR","gradYear","2026"],["40-YARD DASH","fortyTime","4.45s"],["VERTICAL (in)","vertical","36\""]].map(([l,k,ph])=><Inp key={k} label={l} value={f[k]||""} onChange={v=>setF(p=>({...p,[k]:v}))} placeholder={ph||""}/>)}
          </div>
        </Card>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>STATS & ACHIEVEMENTS</div>
          <Inp label="KEY STATS" value={f.stats||""} onChange={v=>setF(p=>({...p,stats:v}))} placeholder="e.g. 48 receptions, 820 yards, 9 TDs (2025 season)" rows={3}/>
          <div style={{marginTop:11}}><Inp label="AWARDS / HONORS" value={f.awards||""} onChange={v=>setF(p=>({...p,awards:v}))} placeholder="All-Conference, Regional MVP, etc." rows={3}/></div>
          <div style={{marginTop:11}}><Inp label="RECRUITING STATUS" value={f.recruitingStatus||""} onChange={v=>setF(p=>({...p,recruitingStatus:v}))} placeholder="e.g. Available, Committed to Texas, Playing Overseas" rows={2}/></div>
        </Card>
      </div>
    )}

    {activeTab==="academic"&&(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>ACADEMIC INFO</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[["GPA","gpa","3.2"],["SAT SCORE","sat","1150"],["ACT SCORE","act","24"],["MAJOR / FIELD OF STUDY","major","Business Administration"],["HIGH SCHOOL / COLLEGE","schoolName","UTEP"],["GRADUATION YEAR","gradYear","2026"]].map(([l,k,ph])=><Inp key={k} label={l} value={f[k]||""} onChange={v=>setF(p=>({...p,[k]:v}))} placeholder={ph}/>)}
          </div>
        </Card>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>NCAA ELIGIBILITY</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px"}}>
              <div style={{color:C.gold,fontSize:12,fontWeight:700,marginBottom:6}}>NCAA Eligibility Center</div>
              <div style={{color:C.mutedHi,fontSize:12,lineHeight:1.6,marginBottom:10}}>Register at eligibilitycenter.org to ensure you can compete at the NCAA level. Required for D1 and D2 programs.</div>
              <a href="https://eligibilitycenter.org" target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:12}}>eligibilitycenter.org ↗</a>
            </div>
            {[["NCAA ELIGIBILITY STATUS","eligibility","Registered / Cleared / Pending"],["ELIGIBILITY YEAR(S) REMAINING","eligYears","2"],["TRANSFER STATUS","transferStatus","Not transferred / Once / Grad transfer"]].map(([l,k,ph])=><Inp key={k} label={l} value={f[k]||""} onChange={v=>setF(p=>({...p,[k]:v}))} placeholder={ph}/>)}
          </div>
        </Card>
      </div>
    )}

    <div style={{marginTop:16,display:"flex",gap:10}}>
      <Btn onClick={save} variant="gold">{saved?"✓ Profile Saved!":"Save Profile"}</Btn>
      {saved&&<span style={{color:C.green,fontSize:13,alignSelf:"center"}}>Changes saved and visible to coaches.</span>}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════
// SCHOOL SEARCH — full recruiting center
// ═══════════════════════════════════════════════════
const SCHOOLS=[
  {id:1,name:"University of Texas",nickname:"Longhorns",division:"NCAA D1",conference:"SEC",location:"Austin, TX",country:"United States",state:"Texas",city:"Austin",enrollment:51000,avgGPA:"3.5-3.9",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming"],scholarships:true,scholarshipNote:"Full scholarships. Highly competitive.",tuition:"$11,698 in-state / $41,070 out-of-state",acceptRate:"31%",website:"utexas.edu",logo:"🤘",type:"Public",recruitingContact:"recruiting@athletics.utexas.edu",openings:{"Football":"WR, DB, OL","Basketball":"PG, SG","Track":"Sprinters"}},
  {id:2,name:"University of Alabama",nickname:"Crimson Tide",division:"NCAA D1",conference:"SEC",location:"Tuscaloosa, AL",country:"United States",state:"Alabama",city:"Tuscaloosa",enrollment:38000,avgGPA:"3.3-3.8",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Gymnastics"],scholarships:true,scholarshipNote:"Full scholarships. Multiple national championships.",tuition:"$10,780 / $30,250",acceptRate:"80%",website:"ua.edu",logo:"🐘",type:"Public",recruitingContact:"athletics@ua.edu",openings:{"Football":"DB, LB, WR","Basketball":"Forward, Center"}},
  {id:3,name:"Ohio State University",nickname:"Buckeyes",division:"NCAA D1",conference:"Big Ten",location:"Columbus, OH",country:"United States",state:"Ohio",city:"Columbus",enrollment:61000,avgGPA:"3.5-4.0",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Wrestling"],scholarships:true,scholarshipNote:"Full scholarships. Elite across sports.",tuition:"$11,918 / $33,502",acceptRate:"54%",website:"osu.edu",logo:"🌰",type:"Public",recruitingContact:"recruiting@athletics.osu.edu",openings:{"Football":"All positions","Basketball":"SG, SF"}},
  {id:4,name:"LSU",nickname:"Tigers",division:"NCAA D1",conference:"SEC",location:"Baton Rouge, LA",country:"United States",state:"Louisiana",city:"Baton Rouge",enrollment:37000,avgGPA:"3.0-3.6",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Gymnastics"],scholarships:true,scholarshipNote:"Full scholarships. Baseball and Track national powers.",tuition:"$8,038 / $26,916",acceptRate:"70%",website:"lsu.edu",logo:"🐯",type:"Public",recruitingContact:"athletics@lsu.edu",openings:{"Football":"WR, DB","Baseball":"Pitchers","Track":"All sprints"}},
  {id:5,name:"Howard University",nickname:"Bison",division:"NCAA D1",conference:"MEAC",location:"Washington, DC",country:"United States",state:"DC",city:"Washington",enrollment:11000,avgGPA:"3.2-3.8",sports:["Football","Basketball","Track","Soccer","Tennis","Swimming"],scholarships:true,scholarshipNote:"Athletic + academic scholarships. Strong HBCU tradition.",tuition:"$28,010",acceptRate:"37%",website:"howard.edu",logo:"🦬",type:"Private HBCU",recruitingContact:"athletics@howard.edu",openings:{"Football":"All positions","Track":"Sprinters","Basketball":"All"}},
  {id:6,name:"Grambling State University",nickname:"Tigers",division:"NCAA D1",conference:"SWAC",location:"Grambling, LA",country:"United States",state:"Louisiana",city:"Grambling",enrollment:5000,avgGPA:"2.5-3.2",sports:["Football","Basketball","Track","Baseball"],scholarships:true,scholarshipNote:"Full athletic scholarships available.",tuition:"$4,940 in-state",acceptRate:"57%",website:"gram.edu",logo:"🐅",type:"Public HBCU",recruitingContact:"athletics@gram.edu",openings:{"Football":"WR, QB, DB","Basketball":"All"}},
  {id:7,name:"Texas Southern University",nickname:"Tigers",division:"NCAA D1",conference:"SWAC",location:"Houston, TX",country:"United States",state:"Texas",city:"Houston",enrollment:10000,avgGPA:"2.5-3.3",sports:["Football","Basketball","Track","Baseball","Soccer"],scholarships:true,scholarshipNote:"Athletic scholarships across all sports.",tuition:"$5,500 in-state",acceptRate:"88%",website:"tsu.edu",logo:"🐯",type:"Public HBCU",recruitingContact:"athletics@tsu.edu",openings:{"Football":"All skill positions","Track":"All events"}},
  {id:8,name:"Prairie View A&M",nickname:"Panthers",division:"NCAA D1",conference:"SWAC",location:"Prairie View, TX",country:"United States",state:"Texas",city:"Prairie View",enrollment:9000,avgGPA:"2.5-3.2",sports:["Football","Basketball","Track","Baseball"],scholarships:true,scholarshipNote:"Merit and athletic scholarships.",tuition:"$4,500 in-state",acceptRate:"82%",website:"pvamu.edu",logo:"🐾",type:"Public HBCU",recruitingContact:"athletics@pvamu.edu",openings:{"Football":"OL, DL, LB","Basketball":"All"}},
  {id:9,name:"Florida A&M University",nickname:"Rattlers",division:"NCAA D1",conference:"SWAC",location:"Tallahassee, FL",country:"United States",state:"Florida",city:"Tallahassee",enrollment:13000,avgGPA:"2.8-3.5",sports:["Football","Basketball","Track","Baseball","Tennis"],scholarships:true,scholarshipNote:"Full athletic scholarships. Strong sports culture.",tuition:"$5,785 in-state",acceptRate:"42%",website:"famu.edu",logo:"🐍",type:"Public HBCU",recruitingContact:"athletics@famu.edu",openings:{"Football":"WR, DB","Track":"All","Basketball":"All"}},
  {id:10,name:"Jackson State University",nickname:"Tigers",division:"NCAA D1",conference:"SWAC",location:"Jackson, MS",country:"United States",state:"Mississippi",city:"Jackson",enrollment:7000,avgGPA:"2.5-3.2",sports:["Football","Basketball","Track","Baseball"],scholarships:true,scholarshipNote:"Athletic scholarships available.",tuition:"$3,810 in-state",acceptRate:"51%",website:"jsums.edu",logo:"🐅",type:"Public HBCU",recruitingContact:"athletics@jsums.edu",openings:{"Football":"All positions","Basketball":"Guards, Forwards"}},
  {id:11,name:"University of Oregon",nickname:"Ducks",division:"NCAA D1",conference:"Pac-12",location:"Eugene, OR",country:"United States",state:"Oregon",city:"Eugene",enrollment:23000,avgGPA:"3.3-3.8",sports:["Track","Football","Basketball","Baseball","Soccer"],scholarships:true,scholarshipNote:"Full scholarships. Track Mecca — Hayward Field.",tuition:"$12,720 / $36,648",acceptRate:"84%",website:"uoregon.edu",logo:"🦆",type:"Public",recruitingContact:"trackrecruiting@uoregon.edu",openings:{"Track":"Sprinters, Jumpers, Throwers"}},
  {id:12,name:"Texas A&M",nickname:"Aggies",division:"NCAA D1",conference:"SEC",location:"College Station, TX",country:"United States",state:"Texas",city:"College Station",enrollment:75000,avgGPA:"3.5-4.0",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming"],scholarships:true,scholarshipNote:"Full scholarships. Largest university in USA.",tuition:"$12,243 in-state",acceptRate:"63%",website:"tamu.edu",logo:"🐾",type:"Public",recruitingContact:"athletics@tamu.edu",openings:{"Track":"All events","Football":"OL, DL"}},
  {id:13,name:"Notre Dame",nickname:"Fighting Irish",division:"NCAA D1",conference:"ACC",location:"Notre Dame, IN",country:"United States",state:"Indiana",city:"South Bend",enrollment:13000,avgGPA:"3.8-4.0",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Lacrosse"],scholarships:true,scholarshipNote:"Full scholarships. Elite academics + athletics.",tuition:"$60,301",acceptRate:"13%",website:"nd.edu",logo:"☘️",type:"Private",recruitingContact:"athletics@nd.edu",openings:{"Football":"DB, LB","Soccer":"Forward, MF"}},
  {id:14,name:"Kilgore College",nickname:"Rangers",division:"NJCAA",conference:"SWJCFC",location:"Kilgore, TX",country:"United States",state:"Texas",city:"Kilgore",enrollment:5000,avgGPA:"2.0-3.0",sports:["Football","Basketball","Baseball","Track","Soccer"],scholarships:true,scholarshipNote:"Full JUCO scholarships. Pipeline to D1.",tuition:"$1,800 in-state",acceptRate:"100%",website:"kilgore.edu",logo:"⚡",type:"Community College",recruitingContact:"athletics@kilgore.edu",openings:{"Football":"All positions","Basketball":"All"}},
  {id:15,name:"Blinn College",nickname:"Buccaneers",division:"NJCAA",conference:"Southern JC",location:"Brenham, TX",country:"United States",state:"Texas",city:"Brenham",enrollment:18000,avgGPA:"2.0-3.0",sports:["Football","Basketball","Baseball","Track"],scholarships:true,scholarshipNote:"Full JUCO scholarships. Strong transfer pipeline.",tuition:"$1,600 in-state",acceptRate:"100%",website:"blinn.edu",logo:"🏴‍☠️",type:"Community College",recruitingContact:"athletics@blinn.edu",openings:{"Football":"All skill positions"}},
  {id:16,name:"Benedictine College",nickname:"Ravens",division:"NAIA",conference:"Heart of America",location:"Atchison, KS",country:"United States",state:"Kansas",city:"Atchison",enrollment:2400,avgGPA:"2.8-3.5",sports:["Football","Basketball","Baseball","Track","Soccer"],scholarships:true,scholarshipNote:"Athletic + academic scholarships. Strong football culture.",tuition:"$32,000",acceptRate:"62%",website:"benedictine.edu",logo:"🦅",type:"Private",recruitingContact:"athletics@benedictine.edu",openings:{"Football":"QB, WR, OL","Basketball":"All"}},
  {id:17,name:"GFL Berlin Thunder",nickname:"Thunder",division:"GFL1",conference:"GFL North",location:"Berlin, Germany",country:"Germany",state:"",city:"Berlin",enrollment:0,avgGPA:"N/A",sports:["Football"],scholarships:false,scholarshipNote:"Paid contracts. Housing + stipend provided.",tuition:"N/A — paid contract",acceptRate:"Tryout based",website:"berlinthunder.de",logo:"⚡",type:"Professional",recruitingContact:"roster@berlinthunder.de",openings:{"Football":"American skill players, OL, DL"}},
  {id:18,name:"Stuttgart Surge",nickname:"Surge",division:"ELF",conference:"ELF Central",location:"Stuttgart, Germany",country:"Germany",state:"",city:"Stuttgart",enrollment:0,avgGPA:"N/A",sports:["Football"],scholarships:false,scholarshipNote:"European League of Football. Paid contracts.",tuition:"N/A — paid contract",acceptRate:"Tryout based",website:"stuttgartsurge.de",logo:"⚡",type:"Professional",recruitingContact:"scouting@stuttgartsurge.de",openings:{"Football":"American imports"}},
  {id:19,name:"Barcelona Dragons",nickname:"Dragons",division:"ELF",conference:"ELF South",location:"Barcelona, Spain",country:"Spain",state:"",city:"Barcelona",enrollment:0,avgGPA:"N/A",sports:["Football"],scholarships:false,scholarshipNote:"ELF team. Paid + European experience.",tuition:"N/A",acceptRate:"Tryout based",website:"bcndragons.com",logo:"🐉",type:"Professional",recruitingContact:"recruiting@bcndragons.com",openings:{"Football":"American skill players"}},
  {id:20,name:"Paris Musketeers",nickname:"Musketeers",division:"ELF",conference:"ELF West",location:"Paris, France",country:"France",state:"",city:"Paris",enrollment:0,avgGPA:"N/A",sports:["Football"],scholarships:false,scholarshipNote:"Play in Paris. Paid contracts.",tuition:"N/A",acceptRate:"Tryout based",website:"musketeers.paris",logo:"⚔️",type:"Professional",recruitingContact:"import@musketeers.paris",openings:{"Football":"WR, DB, QB"}},
  {id:21,name:"Vienna Vikings",nickname:"Vikings",division:"AFL",conference:"AFL",location:"Vienna, Austria",country:"Austria",state:"",city:"Vienna",enrollment:0,avgGPA:"N/A",sports:["Football"],scholarships:false,scholarshipNote:"Austria's top football team.",tuition:"N/A — paid",acceptRate:"Tryout based",website:"viennavikings.com",logo:"⚔️",type:"Professional",recruitingContact:"gm@viennavikings.com",openings:{"Football":"American imports"}},
  {id:22,name:"Houston Dash",nickname:"Dash",division:"NWSL",conference:"NWSL",location:"Houston, TX",country:"United States",state:"Texas",city:"Houston",enrollment:0,avgGPA:"N/A",sports:["Soccer"],scholarships:false,scholarshipNote:"Professional NWSL contracts.",tuition:"N/A — professional",acceptRate:"Pro level",website:"houstondash.com",logo:"⚡",type:"Professional",recruitingContact:"scouting@houstondash.com",openings:{"Soccer":"Forward, Midfielder, GK"}},
  {id:23,name:"Portland Thorns",nickname:"Thorns",division:"NWSL",conference:"NWSL",location:"Portland, OR",country:"United States",state:"Oregon",city:"Portland",enrollment:0,avgGPA:"N/A",sports:["Soccer"],scholarships:false,scholarshipNote:"NWSL's most storied club.",tuition:"N/A — professional",acceptRate:"Pro level",website:"timbers.com/thorns",logo:"🌹",type:"Professional",recruitingContact:"scouting@timbers.com",openings:{"Soccer":"Forward, Defender"}},
];

const DIVISIONS_ORDER=["NCAA D1","NCAA D2","NCAA D3","NAIA","NJCAA","GFL1","ELF","EuroLeague","AFL","NWSL","Professional"];
const SPORTS_LIST=["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Golf","Wrestling","Volleyball","Lacrosse"];

function SchoolSearch({athlete}){
  const [search,setSearch]=useState("");
  const [divFilter,setDivFilter]=useState("all");
  const [sportFilter,setSportFilter]=useState(athlete?.sport||"all");
  const [countryFilter,setCountryFilter]=useState("all");
  const [typeFilter,setTypeFilter]=useState("all");
  const [schFilter,setSchFilter]=useState("all");
  const [sel,setSel]=useState(null);
  const [saved,setSaved]=useStore("av_saved_schools_v2",[]);
  const [contacted,setContacted]=useStore("av_contacted_v2",[]);
  const [notes,setNotes]=useStore("av_school_notes_v2",{});
  const [activeView,setActiveView]=useState("search");
  const [outreachLoading,setOutreachLoading]=useState(false);
  const [outreachOut,setOutreachOut]=useState("");
  const [matchLoading,setMatchLoading]=useState(false);
  const [matchOut,setMatchOut]=useState("");

  const divColor={"NCAA D1":C.gold,"NCAA D2":C.blue,"NCAA D3":C.mutedHi,"NAIA":C.green,"NJCAA":C.teal,"GFL1":C.purple,"ELF":C.purple,"EuroLeague":C.purple,"AFL":C.purple,"NWSL":C.red,"Professional":C.red};
  const countries=["all","United States","Germany","Spain","France","Austria"];

  const filtered=SCHOOLS.filter(s=>{
    const mS=(s.name+s.nickname+s.location+s.conference).toLowerCase().includes(search.toLowerCase());
    const mD=divFilter==="all"||s.division===divFilter;
    const mSp=sportFilter==="all"||s.sports.includes(sportFilter);
    const mC=countryFilter==="all"||s.country===countryFilter;
    const mT=typeFilter==="all"||s.type===typeFilter;
    const mSch=schFilter==="all"||(schFilter==="yes"&&s.scholarships)||(schFilter==="no"&&!s.scholarships);
    return mS&&mD&&mSp&&mC&&mT&&mSch;
  });

  function toggleSave(id){setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}
  function markContacted(school){setContacted(prev=>[...prev.filter(c=>c.id!==school.id),{id:school.id,date:new Date().toISOString().slice(0,10),status:"contacted"}]);}

  async function genOutreach(school){
    setOutreachLoading(true);setOutreachOut("");
    try{const r=await ai(
      "You are AthleteVault's AI recruiting engine. Write powerful, coach-specific outreach emails that stand out.",
      `Write a personalized recruiting email from ${athlete?.name||"an athlete"} (${athlete?.sport||"athlete"}, ${fmt(athlete?.followers||0)} social followers, ${athlete?.school||"current program"}, ${athlete?.city||""} ${athlete?.country||"USA"}) to the coaching staff at ${school.name} (${school.nickname}, ${school.division}). Open positions: ${JSON.stringify(school.openings)}. Scholarship: ${school.scholarshipNote}. Include subject line, personal opening, athletic accomplishments, why this specific program, academic mention, clear ask, professional closing. Under 200 words.`
    );setOutreachOut(r);markContacted(school);}catch(e){setOutreachOut("⚠️ Failed. Retry.");}
    setOutreachLoading(false);
  }

  async function genMatch(){
    setMatchLoading(true);setMatchOut("");
    try{const r=await ai(
      "You are AthleteVault's AI school matching engine. Analyze athlete profiles and recommend best-fit schools.",
      `Top 10 school matches for: ${athlete?.name||"Athlete"}, ${athlete?.sport||"Football"}, ${fmt(athlete?.followers||0)} followers, from ${athlete?.city||""} ${athlete?.country||"USA"}, school: ${athlete?.school||"Unknown"}, tier: ${athlete?.tier||"Rookie"}, bio: "${athlete?.bio||""}". Available programs: ${SCHOOLS.filter(s=>s.sports?.includes(athlete?.sport||"Football")).slice(0,15).map(s=>`${s.name} (${s.division})`).join("; ")}. For each: name, match score 1-100, why they fit (2 sentences), realistic scholarship chance, first action step.`
    );setMatchOut(r);}catch(e){setMatchOut("⚠️ Failed. Retry.");}
    setMatchLoading(false);
  }

  const savedSchools=SCHOOLS.filter(s=>saved.includes(s.id));
  const contactedSchools=SCHOOLS.filter(s=>contacted.some(c=>c.id===s.id));

  return <div>
    <Sec title="School & Program Search" sub="Search 23+ programs — domestic, HBCU, JUCO, NAIA, and international"/>
    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
      {[["search","🔍 Search"],["matcher","🤖 AI Match Me"],["saved",`⭐ Saved (${saved.length})`],["tracker",`📋 Tracker (${contacted.length})`]].map(([t,l])=><Btn key={t} onClick={()=>setActiveView(t)} variant={activeView===t?"gold":"ghost"} small>{l}</Btn>)}
    </div>

    {activeView==="matcher"&&<div>
      <Card glow style={{marginBottom:14}}>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>AI SCHOOL MATCHER</div>
        <p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:14}}>Claude analyzes your sport, location, level, and bio to find your top 10 best-fit programs — including overseas pro leagues that NCSA doesn't cover.</p>
        <Btn onClick={genMatch} disabled={matchLoading} variant="gold">{matchLoading?"⟳ Analyzing…":"⚡ Find My Best-Fit Programs"}</Btn>
      </Card>
      <AIOut loading={matchLoading} output={matchOut}/>
    </div>}

    {activeView==="saved"&&(savedSchools.length===0
      ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>⭐</div><div style={{color:C.white,fontWeight:700,marginBottom:6}}>No saved programs</div><div style={{color:C.muted,fontSize:13}}>Search and tap ⭐ to save programs here.</div></Card>
      :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>{savedSchools.map(s=><SchoolCard key={s.id} school={s} saved={saved} onSave={toggleSave} onSelect={()=>{setSel(s);setActiveView("search");}} divColor={divColor}/>)}</div>
    )}

    {activeView==="tracker"&&(contactedSchools.length===0
      ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>📋</div><div style={{color:C.white,fontWeight:700,marginBottom:6}}>Tracker empty</div><div style={{color:C.muted,fontSize:13}}>Generate outreach emails and schools appear here automatically.</div></Card>
      :<Card>{contactedSchools.map(s=>{const c=contacted.find(x=>x.id===s.id);return <div key={s.id} style={{padding:"13px 0",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
          <div><div style={{color:C.white,fontWeight:700,fontSize:14}}>{s.logo} {s.name}</div><div style={{color:C.muted,fontSize:12}}>{s.division} · Contacted {c?.date}</div></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["contacted","replied","visit","committed","declined"].map(st=><button key={st} onClick={()=>setContacted(prev=>prev.map(x=>x.id===s.id?{...x,status:st}:x))} style={{background:c?.status===st?C.goldGlow:"transparent",border:`1px solid ${c?.status===st?C.gold:C.border}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:c?.status===st?C.gold:C.muted,fontSize:10,fontFamily:"'Sora',sans-serif",fontWeight:600,textTransform:"capitalize"}}>{st}</button>)}
          </div>
        </div>
        <input value={notes[`school_${s.id}`]||""} onChange={e=>setNotes(p=>({...p,[`school_${s.id}`]:e.target.value}))} placeholder="Add a note…" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 11px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
      </div>;})}
      </Card>
    )}

    {activeView==="search"&&<div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,alignItems:"start"}}>
      <div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:13}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools, programs, cities, conferences…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {[["divFilter","All Divisions",[["all","All Divisions"],...DIVISIONS_ORDER.map(d=>[d,d])]],["sportFilter","All Sports",[["all","All Sports"],...SPORTS_LIST.map(s=>[s,s])]],["countryFilter","All Countries",countries.map(c=>[c,c==="all"?"All Countries":c])],["typeFilter","All Types",[["all","All Types"],["Public","Public"],["Private","Private"],["Public HBCU","HBCU"],["Community College","JUCO / Community"],["Professional","Professional"]]],["schFilter","Any Scholarship",[["all","Any Scholarship"],["yes","Has Scholarships"],["no","No Scholarship"]]]].map(([key,placeholder,opts])=><select key={key} value={key==="divFilter"?divFilter:key==="sportFilter"?sportFilter:key==="countryFilter"?countryFilter:key==="typeFilter"?typeFilter:schFilter} onChange={e=>{key==="divFilter"?setDivFilter(e.target.value):key==="sportFilter"?setSportFilter(e.target.value):key==="countryFilter"?setCountryFilter(e.target.value):key==="typeFilter"?setTypeFilter(e.target.value):setSchFilter(e.target.value);}} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 11px",color:C.white,fontSize:12,outline:"none"}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>)}
          </div>
        </div>
        <div style={{color:C.muted,fontSize:11,marginBottom:12,fontFamily:"DM Mono,monospace"}}>{filtered.length} programs found</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:11}}>
          {filtered.map(s=><SchoolCard key={s.id} school={s} saved={saved} onSave={toggleSave} onSelect={()=>setSel(s)} selected={sel?.id===s.id} divColor={divColor}/>)}
          {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0",gridColumn:"1/-1"}}>No programs match. Try broadening your search.</div>}
        </div>
      </div>

      <div style={{position:"sticky",top:20}}>
        {sel?<Card glow color={divColor[sel.division]}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:28,marginBottom:5}}>{sel.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:C.white,letterSpacing:1,lineHeight:1}}>{sel.name}</div><div style={{color:divColor[sel.division]||C.gold,fontWeight:700,fontSize:12,marginTop:3}}>{sel.nickname} · {sel.division}</div></div>
            <button onClick={()=>toggleSave(sel.id)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{saved.includes(sel.id)?"⭐":"☆"}</button>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            <Badge color={divColor[sel.division]||C.muted}>{sel.division}</Badge>
            <Badge color={C.blue}>{sel.conference}</Badge>
            {sel.scholarships&&<Badge color={C.gold}>Scholarships</Badge>}
            {sel.type?.includes("HBCU")&&<Badge color={C.teal}>HBCU</Badge>}
            {sel.type==="Community College"&&<Badge color={C.blue}>JUCO</Badge>}
            {sel.type==="Professional"&&<Badge color={C.purple}>Pro</Badge>}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:11,marginBottom:11}}>
            {[["📍",sel.location],["🏛️",sel.enrollment>0?fmt(sel.enrollment)+" students":"Professional Team"],["📊",sel.avgGPA&&sel.avgGPA!=="N/A"?"Avg GPA: "+sel.avgGPA:null],["🎓",sel.acceptRate&&sel.acceptRate!=="N/A"?"Accept Rate: "+sel.acceptRate:null],["💰",sel.tuition&&sel.tuition!=="N/A"?sel.tuition:null],["🌐",sel.website]].filter(([,v])=>v).map(([k,v])=><div key={k} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}><span style={{flexShrink:0}}>{k}</span><span style={{color:C.white,fontSize:12}}>{v}</span></div>)}
          </div>
          {sel.scholarshipNote&&<div style={{background:C.card2,borderRadius:7,padding:"9px 12px",marginBottom:11}}><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:3}}>SCHOLARSHIPS</div><div style={{color:C.white,fontSize:12,lineHeight:1.5}}>{sel.scholarshipNote}</div></div>}
          {Object.keys(sel.openings||{}).length>0&&<div style={{marginBottom:11}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:7}}>CURRENT OPENINGS</div>{Object.entries(sel.openings).map(([sp,pos])=><div key={sp} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.mutedHi,fontSize:12}}>{sp}</span><span style={{color:C.green,fontSize:12,fontWeight:600}}>{pos}</span></div>)}</div>}
          <Btn onClick={()=>genOutreach(sel)} disabled={outreachLoading} variant="gold" full style={{marginBottom:8}}>{outreachLoading?"Writing…":"⚡ Generate Outreach Email"}</Btn>
          {sel.recruitingContact&&<div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",textAlign:"center"}}>{sel.recruitingContact}</div>}
          <AIOut loading={outreachLoading} output={outreachOut}/>
        </Card>
        :<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:10}}>🏫</div><div style={{color:C.white,fontWeight:700,fontSize:15,marginBottom:6}}>Select a Program</div><div style={{color:C.muted,fontSize:13}}>View details, scholarship info, openings, and generate a personalized outreach email.</div></Card>}
      </div>
    </div>}
  </div>;
}

function SchoolCard({school,saved,onSave,onSelect,selected,divColor}){
  return <Card onClick={onSelect} glow={selected} color={divColor?.[school.division]} style={{cursor:"pointer",transition:"border-color .15s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
      <span style={{fontSize:22}}>{school.logo}</span>
      <button onClick={e=>{e.stopPropagation();onSave(school.id);}} style={{background:"none",border:"none",fontSize:15,cursor:"pointer",color:saved.includes(school.id)?C.gold:C.muted}}>{saved.includes(school.id)?"⭐":"☆"}</button>
    </div>
    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:C.white,letterSpacing:.5,lineHeight:1.1,marginBottom:2}}>{school.name}</div>
    <div style={{color:(divColor?.[school.division])||C.gold,fontSize:11,fontWeight:700,marginBottom:5}}>{school.nickname} · {school.division}</div>
    <div style={{color:C.muted,fontSize:11,marginBottom:7}}>📍 {school.location}</div>
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {school.scholarships&&<Badge color={C.green}>Scholarships</Badge>}
      {school.type?.includes("HBCU")&&<Badge color={C.teal}>HBCU</Badge>}
      {school.type==="Professional"&&<Badge color={C.purple}>Pro</Badge>}
      {school.type==="Community College"&&<Badge color={C.blue}>JUCO</Badge>}
    </div>
  </Card>;
}

// Quick recruiting timeline as a lightweight component
function RecruitingTimeline(){
  const [open,setOpen]=useState(null);
  const TL=[
    {year:"9th Grade",icon:"🌱",title:"Build Your Foundation",items:["Focus on academics — GPA matters as much as athletics","Begin strength and conditioning","Create your first highlight reel","Register with NCAA Eligibility Center (ncaa.org)"]},
    {year:"10th Grade",icon:"📈",title:"Build Your Resume",items:["Update stats on your AthleteVault profile","Attend camps and showcases","Start following target coaches on social","Research scholarship limits by division"]},
    {year:"11th Grade",icon:"🚀",title:"Make Your Move",items:["Begin direct coach outreach via AthleteVault Messages","Attend official and unofficial campus visits","Take SAT/ACT","June 15: D1 coaches can contact you in most sports"]},
    {year:"12th Grade",icon:"🏆",title:"Close the Deal",items:["Official visits paid by schools","Understand your NLI before signing","National Signing Day varies by sport — know your date"]},
    {year:"Post-College / Undrafted",icon:"✈️",title:"The Next Chapter",items:["Research overseas leagues (GFL, ELF, basketball leagues)","Build your brand with NIL — it doesn't stop after college","Reach out to overseas scouts via AthleteVault Coach Network"]},
  ];
  return <div>
    <Sec title="Recruiting Timeline" sub="Year-by-year roadmap — from 9th grade to overseas pro"/>
    {TL.map((t,i)=><Card key={i} glow={open===i} onClick={()=>setOpen(open===i?null:i)} style={{cursor:"pointer",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{fontSize:24}}>{t.icon}</div><div><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:2}}>{t.year.toUpperCase()}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:C.white,letterSpacing:1}}>{t.title}</div></div></div>
        <span style={{color:C.muted,fontSize:18}}>{open===i?"−":"+"}</span>
      </div>
      {open===i&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>{t.items.map((item,j)=><div key={j} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}><span style={{color:C.green,flexShrink:0,marginTop:1}}>✓</span><span style={{color:C.white,fontSize:13,lineHeight:1.6}}>{item}</span></div>)}</div>}
    </Card>)}
  </div>;
}

// Legal doc viewer (available in-app but not prominent)
function LegalInApp(){
  const [doc,setDoc]=useState("summary");
  const FULL_TERMS=`TERMS OF SERVICE — AthleteVault LLC

1. ACCEPTANCE: By using AthleteVault you agree to these Terms. If you do not agree, do not use the platform. We may update these terms; continued use constitutes acceptance.

2. PLATFORM PURPOSE & LIMITATIONS: AthleteVault is an informational and networking platform. It is NOT a licensed recruiting agency, sports agent, law firm, or financial advisor. Nothing constitutes legal, financial, or professional recruiting advice. Users verify all opportunities independently.

3. NO OUTCOME GUARANTEE: AthleteVault does not guarantee recruitment, scholarships, contracts, brand deals, NIL income, or any athletic/financial outcome. All listings are informational only. We do not verify, endorse, or guarantee any school, coach, team, or brand partnership.

4. ACCOUNT SECURITY: You are responsible for your login credentials and all account activity. Notify us immediately of unauthorized use. We are not liable for losses from your failure to secure your account.

5. USER CONTENT: You retain ownership of your content. By submitting, you grant AthleteVault a non-exclusive license to display it within the platform. Content must not infringe third-party rights, contain false information, or violate any law. We may remove violating content without notice.

6. AI-GENERATED CONTENT DISCLAIMER: All AI outputs (pitches, profiles, roadmaps, captions, NIL guidance) are for informational purposes only. AI content may be inaccurate or inappropriate for your situation. Independently verify all AI content. AthleteVault is not liable for outcomes from AI-generated content.

7. NIL & FINANCIAL DISCLAIMER: NIL rules vary by state, school, conference, and governing body. Regulations change frequently. Nothing here constitutes legal advice. Athletes are solely responsible for compliance. AthleteVault bears no responsibility for NCAA eligibility, contract disputes, tax obligations, or NIL-related financial outcomes.

8. COACH & SCHOOL LISTINGS: Profiles and listings are for networking purposes. We do not verify coach credentials, employment, or authority to offer scholarships/contracts. School information may not reflect current conditions. Verify all information directly with institutions. AthleteVault is not responsible for any misrepresentation.

9. INTERNATIONAL USE: Users outside the US are responsible for local law compliance. Overseas opportunities are informational only. AthleteVault does not act as an employment agency or sports agent in any jurisdiction. Consult a licensed agent before signing any professional contract.

10. PAYMENTS: Fees are non-refundable except where required by law. Pricing may change with 30 days' notice. Cancellation stops future billing but does not entitle partial-period refunds.

11. PRIVACY: We never sell your personal data. Contact info is hidden by default. You control your visibility settings. See Privacy Policy for full details.

12. PROHIBITED CONDUCT: No impersonation, false information, harassment, illegal use, unauthorized system access, data scraping, soliciting minors, or spam. Violations may result in immediate termination and legal action.

13. LIMITATION OF LIABILITY: TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATHLETEVAULT LLC AND ITS OWNER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. TOTAL LIABILITY SHALL NOT EXCEED AMOUNTS PAID IN THE PRIOR 12 MONTHS.

14. INDEMNIFICATION: You agree to indemnify AthleteVault LLC, its owner Dennis Barnes, officers, and agents from claims arising from your use, your content, or your violation of these Terms.

15. GOVERNING LAW & DISPUTES: Governed by Texas law. Disputes resolved by binding arbitration in Houston, TX under JAMS Rules. Class action waiver applies. Small claims exempt.

16. CONTACT: AthleteVault LLC · support@athletevault.com

PRIVACY POLICY — AthleteVault LLC

We collect account info you provide, usage data, and payment info (processed by Stripe — we never store raw card data). Your data is used to provide the service, match athletes with coaches, generate AI content, and process payments. We do NOT sell your data.

You control your visibility. All contact info is hidden by default. You choose what to display in Privacy & Security settings.

Data retained while account is active. Request deletion by emailing support@athletevault.com — processed within 30 days.

Third-party services: Stripe (payments), Anthropic Claude API (AI features). These have their own privacy policies.

EU/UK users have GDPR/UK GDPR rights including access, correction, and deletion.

Contact: support@athletevault.com`;

  return <div>
    <Sec title="Legal & Terms" sub="Platform terms, privacy policy, and disclaimers"/>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[["summary","📋 Quick Summary"],["full","📄 Full Terms"]].map(([t,l])=><Btn key={t} onClick={()=>setDoc(t)} variant={doc===t?"gold":"ghost"} small>{l}</Btn>)}
    </div>
    {doc==="summary"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {TERMS_SUMMARY.map((t,i)=><Card key={i}><div style={{display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:20,flexShrink:0}}>{t.icon}</span><div><div style={{color:C.gold,fontWeight:700,fontSize:13,marginBottom:5}}>{t.title}</div><div style={{color:C.mutedHi,fontSize:12,lineHeight:1.6}}>{t.text}</div></div></div></Card>)}
      <Card style={{gridColumn:"1/-1"}}><div style={{color:C.muted,fontSize:12,lineHeight:1.7,textAlign:"center"}}>© 2026 AthleteVault LLC · Not a licensed recruiting agency · AI content is illustrative only · Governed by Texas law · All disputes: binding arbitration, Houston TX · support@athletevault.com</div></Card>
    </div>}
    {doc==="full"&&<Card><pre style={{color:C.mutedHi,fontSize:11,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"DM Mono,monospace"}}>{FULL_TERMS}</pre></Card>}
  </div>;
}

function ForgotPassword({onBack}){
  const [email,setEmail]=useState(""); const [sent,setSent]=useState(false); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  async function send(){
    if(!email)return; setErr(""); setLoading(true);
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin});
    setLoading(false);
    if(error){setErr(error.message);return;}
    setSent(true);
  }
  if(sent)return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>📬</div>
        <div style={{color:C.white,fontWeight:700,fontSize:18,marginBottom:8}}>Check your email</div>
        <div style={{color:C.muted,fontSize:13,lineHeight:1.6,marginBottom:24}}>We sent a password reset link to <strong style={{color:C.gold}}>{email}</strong>. Click the link to set a new password.</div>
        <Btn onClick={onBack} variant="ghost" full>← Back to Sign In</Btn>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{color:C.white,fontWeight:700,fontSize:20,marginBottom:6}}>Reset Password</div>
          <div style={{color:C.muted,fontSize:13}}>Enter your email and we'll send a reset link.</div>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="EMAIL" value={email} onChange={setEmail} placeholder="you@email.com"/>
            {err&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 13px",color:C.red,fontSize:13}}>{err}</div>}
            <Btn onClick={send} disabled={loading||!email} full>{loading?"Sending…":"Send Reset Link"}</Btn>
            <Btn onClick={onBack} variant="ghost" full>← Back to Sign In</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResetPassword({onDone}){
  const [np,setNp]=useState(""); const [cp,setCp]=useState(""); const [err,setErr]=useState(""); const [ok,setOk]=useState(false); const [loading,setLoading]=useState(false);
  async function go(){
    if(np.length<8){setErr("Min 8 characters.");return;}if(np!==cp){setErr("Passwords don't match.");return;}
    setErr(""); setLoading(true);
    const {error}=await supabase.auth.updateUser({password:np});
    setLoading(false);
    if(error){setErr(error.message);return;}
    setOk(true);setTimeout(onDone,2000);
  }
  return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{color:C.white,fontWeight:700,fontSize:20,marginBottom:6}}>Set New Password</div>
          <div style={{color:C.muted,fontSize:13}}>Choose a strong password for your account.</div>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {ok?<div style={{color:C.green,textAlign:"center",padding:"8px 0"}}>✓ Password updated! Signing you in…</div>:<>
              <Inp label="NEW PASSWORD" value={np} onChange={setNp} type="password" placeholder="Min 8 characters"/>
              <Inp label="CONFIRM PASSWORD" value={cp} onChange={v=>{setCp(v);setErr("");}} type="password" placeholder="Re-enter"/>
              {err&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 13px",color:C.red,fontSize:13}}>{err}</div>}
              <Btn onClick={go} disabled={loading||!np||!cp} full>{loading?"Updating…":"Set Password"}</Btn>
            </>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Login(){
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [showForgot,setShowForgot]=useState(false);
  if(showForgot)return<ForgotPassword onBack={()=>setShowForgot(false)}/>;
  async function go(){
    if(!email||!pass)return; setErr(""); setLoading(true);
    const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pass});
    setLoading(false);
    if(error){setErr(error.message==="Invalid login credentials"?"Incorrect email or password.":error.message);}
  }
  return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",backgroundImage:`radial-gradient(ellipse 60% 40% at 50% 0%,${C.goldGlow},transparent 70%)`}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:54,height:54,borderRadius:14,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,color:C.black}}>AV</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:C.white,letterSpacing:3}}>ATHLETEVAULT</div>
          <div style={{color:C.muted,fontSize:13,marginTop:4}}>Sign in to your account</div>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="EMAIL" value={email} onChange={setEmail} placeholder="you@email.com"/>
            <Inp label="PASSWORD" value={pass} onChange={v=>{setPass(v);setErr("");}} type="password" placeholder="••••••••••"/>
            {err&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 13px",color:C.red,fontSize:13}}>🔒 {err}</div>}
            <Btn onClick={go} disabled={loading||!email||!pass} full>{loading?"Signing in…":"SIGN IN →"}</Btn>
            <button onClick={()=>setShowForgot(true)} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif",textAlign:"center",padding:"4px 0"}}>Forgot password?</button>
          </div>
        </Card>
        <p style={{textAlign:"center",color:C.muted,fontSize:11,marginTop:14}}>New? Contact support@athletevault.com to get set up.</p>
        <p style={{textAlign:"center",color:C.border,fontSize:11,marginTop:6,fontFamily:"DM Mono,monospace"}}>© 2026 ATHLETEVAULT</p>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────
function Sidebar({navItems,tab,setTab,user,role,onLogout,msgCount}){
  const rc={owner:C.gold,athlete:C.blue,coach:C.purple};
  const rl={owner:"Owner",athlete:"Athlete",coach:"Coach"};
  return(
    <div style={{width:215,flexShrink:0,background:C.dark,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0}}>
      <div style={{padding:"16px 13px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:C.black}}>AV</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:C.white,letterSpacing:1.5}}>ATHLETEVAULT</div>
        </div>
        <div style={{background:C.card,borderRadius:9,padding:"10px 12px"}}>
          <Avatar name={user?.name||"O"} size={32} color={rc[role]}/>
          <div style={{color:C.white,fontWeight:700,fontSize:13,marginBottom:2,marginTop:7}}>{user?.name||"Chewy Barnes"}</div>
          <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{user?.sport||""}{user?.org?` · ${user.org}`:""}</div>
          <Badge color={rc[role]}>{rl[role]}</Badge>
        </div>
      </div>
      <nav style={{flex:1,padding:"9px 6px"}}>
        {navItems.map(n=><button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"9px 10px",borderRadius:7,border:"none",background:tab===n.id?C.goldGlow:"transparent",color:tab===n.id?C.gold:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",textAlign:"left",marginBottom:1,borderLeft:`2px solid ${tab===n.id?C.gold:"transparent"}`,transition:"all .15s"}}>
          <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13}}>{n.icon}</span>{n.label}</span>
          {n.id==="messages"&&msgCount>0&&<span style={{background:C.red,color:C.white,borderRadius:"50%",minWidth:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{msgCount}</span>}
        </button>)}
      </nav>
      <div style={{padding:"9px 6px",borderTop:`1px solid ${C.border}`}}>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.red,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PRIVACY & SECURITY
// ═══════════════════════════════════════════════
function PrivacySecurity({user,saveUsers,role}){
  const [np,setNp]=useState(""); const [cp,setCp]=useState(""); const [pm,setPm]=useState("");
  const priv=user.privacy||(role==="coach"?DEF_C_PRIV:DEF_A_PRIV);
  function updP(k,v){saveUsers(prev=>prev.map(u=>u.id===user.id?{...u,privacy:{...u.privacy,[k]:v}}:u));}
  async function changePass(){if(np.length<8){setPm("Min 8 characters.");return;}if(np!==cp){setPm("Passwords don't match.");return;}const{error}=await supabase.auth.updateUser({password:np});if(error){setPm("Error: "+error.message);return;}setPm("✓ Password updated!");setNp("");setCp("");}
  const aTog=[{k:"profileVisible",l:"Profile Visible",s:"Appear on the platform"},{k:"searchable",l:"Searchable by Coaches",s:"Coaches can find you"},{k:"showLocation",l:"Show Location",s:"City and country"},{k:"showSchool",l:"Show School / League"},{k:"showFollowers",l:"Show Follower Count"},{k:"showStats",l:"Show Activity Stats"},{k:"showVideos",l:"Show Videos"},{k:"showEmail",l:"Show Email (hidden by default)"},{k:"showPhone",l:"Show Phone Number"},{k:"showDeals",l:"Show Brand Deals"}];
  const cTog=[{k:"profileVisible",l:"Profile Visible",s:"Appear on the platform"},{k:"searchable",l:"Searchable by Athletes"},{k:"showBio",l:"Show Bio & Recruiting Focus"},{k:"showEmail",l:"Show Email Address"},{k:"showPhone",l:"Show Phone Number"},{k:"showTwitter",l:"Show Twitter/X"},{k:"showInstagram",l:"Show Instagram"},{k:"showLinkedin",l:"Show LinkedIn"}];
  const togs=role==="coach"?cTog:aTog;
  return <div>
    <Sec title="Privacy & Security" sub="You control what others see"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>PROFILE PRIVACY</div>
        {togs.map(t=><Tog key={t.k} label={t.l} sub={t.s} val={!!priv[t.k]} onChange={v=>updP(t.k,v)}/>)}
      </Card>
      <div>
        <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>CHANGE PASSWORD</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Inp label="NEW PASSWORD" value={np} onChange={setNp} type="password" placeholder="Min 8 characters"/>
            <Inp label="CONFIRM" value={cp} onChange={v=>{setCp(v);setPm("");}} type="password" placeholder="Re-enter"/>
            {pm&&<div style={{background:pm.startsWith("✓")?C.green+"18":C.red+"18",border:`1px solid ${pm.startsWith("✓")?C.green:C.red}44`,borderRadius:8,padding:"9px",color:pm.startsWith("✓")?C.green:C.red,fontSize:13}}>{pm}</div>}
            <Btn onClick={changePass} disabled={!np||!cp} full>Update Password</Btn>
          </div>
        </Card>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>SECURITY STATUS</div>
          {[["Password","✓ Managed by Supabase Auth",C.green],["Profile",priv.profileVisible?"Visible":"Hidden",priv.profileVisible?C.green:C.muted],["Searchable",priv.searchable?"Yes":"No",priv.searchable?C.green:C.muted]].map(([k,v,col])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:col,fontSize:12,fontWeight:600}}>{v}</span></div>)}
          <p style={{color:C.muted,fontSize:11,marginTop:10,lineHeight:1.6}}>AthleteVault never sells your data. Contact info is only shared based on your privacy choices above.</p>
        </Card>
      </div>
    </div>
  </div>;
}
// ═══════════════════════════════════════════════
//  OWNER TABS
// ═══════════════════════════════════════════════
const O_NAV=[{id:"overview",icon:"⬡",label:"Overview"},{id:"athletes",icon:"👥",label:"Athletes"},{id:"coaches",icon:"🏈",label:"Coaches"},{id:"messages",icon:"💬",label:"Messages"},{id:"ai",icon:"⚡",label:"AI Tools"},{id:"revenue",icon:"💰",label:"Revenue"},{id:"outreach",icon:"📨",label:"Outreach"},{id:"siteconfig",icon:"🎨",label:"Site Config"},{id:"security",icon:"🛡️",label:"Security"}];

function OOverview({athletes,coaches,messages}){
  const active=athletes.filter(a=>a.status==="active"); const mrr=active.reduce((s,a)=>s+a.mrr,0);
  const tc={Rookie:0,Rising:0,Pro:0}; active.forEach(a=>{tc[a.tier]=(tc[a.tier]||0)+1;});
  const tr={Rookie:tc.Rookie*29,Rising:tc.Rising*49,Pro:tc.Pro*79}; const maxR=Math.max(...Object.values(tr),1);
  const tierColor={Rookie:C.white,Rising:C.gold,Pro:C.purple};
  const countries=[...new Set(athletes.map(a=>a.country).filter(Boolean))];
  const totalMsgs=Object.values(messages||{}).reduce((s,m)=>s+m.length,0);
  return <div>
    <Sec title="Command Overview" sub={`Live · ${stamp()}`}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="ACTIVE ATHLETES" value={fmt(active.length)} delta={`${athletes.length} total`} color={C.blue}/>
      <Stat icon="🏈" label="COACHES" value={fmt(coaches.length)} delta={`${[...new Set(coaches.map(c=>c.country))].length} countries`} color={C.purple}/>
      <Stat icon="💰" label="MRR" value={fmtM(mrr)} delta={`ARR ${fmtM(mrr*12)}`} color={C.gold}/>
      <Stat icon="💬" label="MESSAGES SENT" value={fmt(totalMsgs)} delta="Platform total" color={C.green}/>
      <Stat icon="🌍" label="COUNTRIES" value={countries.length} color={C.mutedHi}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>MRR BY TIER</div>
        {[["Rookie",29],["Rising",49],["Pro",79]].map(([t,p])=><div key={t} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:tierColor[t],fontSize:12,fontWeight:600}}>{t} — {tc[t]||0} athletes</span><span style={{color:C.white,fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtM((tc[t]||0)*p)}/mo</span></div>
          <div style={{background:C.border,borderRadius:3,height:5}}><div style={{background:tierColor[t],height:"100%",borderRadius:3,width:`${(tr[t]/maxR)*100}%`}}/></div>
        </div>)}
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:11}}>GROWTH MATH</div>
        {[100,500,1000,5000].map(n=><div key={n} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{fmt(n)}</span><span style={{color:C.gold,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",fontSize:17}}>{fmtM(n*29)}/mo</span></div>)}
      </Card>
    </div>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:11}}>ATHLETE COUNTRIES</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{countries.map(c=><Badge key={c} color={C.blue}>{c} ({athletes.filter(a=>a.country===c).length})</Badge>)}</div></Card>
  </div>;
}

function OAthletes({athletes,saveAthletes,addLog}){
  const [search,setSearch]=useState(""); const [showAdd,setShowAdd]=useState(false); const [addErr,setAddErr]=useState("");
  const [na,setNa]=useState({name:"",sport:"",school:"",followers:"",tier:"Rookie",email:"",password:"",country:"United States",state:"",city:"",bio:""});
  const tierColor={Rookie:C.white,Rising:C.gold,Pro:C.purple};
  const filtered=athletes.filter(a=>(a.name+a.sport+(a.country||"")).toLowerCase().includes(search.toLowerCase()));
  function toggle(id){saveAthletes(prev=>prev.map(a=>{if(a.id!==id)return a;const s=a.status==="active"?"paused":"active";addLog({action:"Status",detail:`${a.name}→${s}`,level:s==="active"?"success":"warn"});return{...a,status:s};}));}
  async function add(){
    if(!na.name||!na.sport||!na.email||!na.password){setAddErr("Name, sport, email, and password are required.");return;}
    if(na.password.length<8){setAddErr("Password must be at least 8 characters.");return;}
    setAddErr("");
    const {data:{session}}=await supabase.auth.getSession();
    const res=await fetch("/api/auth-create-user",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({email:na.email,password:na.password,role:"athlete"})});
    const json=await res.json();
    if(!res.ok){setAddErr(json.error||"Failed to create auth account.");return;}
    const mrr=na.tier==="Rookie"?29:na.tier==="Rising"?49:79;
    const a={...na,id:Date.now(),authId:json.authId,role:"athlete",followers:parseInt(na.followers)||0,mrr,status:"active",joined:new Date().toISOString().slice(0,10),coachSent:0,brandSent:0,videos:[],deals:[],privacy:{...DEF_A_PRIV},blockedIds:[]};
    delete a.password;
    saveAthletes(prev=>[...prev,a]);addLog({action:"Athlete added",detail:a.name,level:"success"});
    setNa({name:"",sport:"",school:"",followers:"",tier:"Rookie",email:"",password:"",country:"United States",state:"",city:"",bio:""});setShowAdd(false);
  }
  function remove(id){const a=athletes.find(x=>x.id===id);saveAthletes(prev=>prev.filter(x=>x.id!==id));addLog({action:"Athlete removed",detail:a?.name,level:"warn"});}
  async function resetPass(a){
    const np=prompt(`New password for ${a.name} (min 8):`);
    if(!np||np.length<8){alert("Min 8 chars.");return;}
    const {data:{session}}=await supabase.auth.getSession();
    const res=await fetch("/api/auth-create-user",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({email:a.email,password:np,role:"athlete"})});
    if(!res.ok){const j=await res.json();alert("Error: "+(j.error||"Failed"));return;}
    const {authId}=await res.json();
    if(authId&&!a.authId)saveAthletes(prev=>prev.map(x=>x.id===a.id?{...x,authId}:x));
    addLog({action:"Pass reset",detail:a.name,level:"warn"});
  }
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}><Sec title="Athletes" sub={`${filtered.length} total`}/><Btn onClick={()=>setShowAdd(true)}>+ Add Athlete</Btn></div>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, sport, country…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",marginBottom:13,boxSizing:"border-box"}}/>
    <Card style={{padding:0,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["Athlete","Location","Sport","Tier","MRR","Status",""].map(h=><th key={h} style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,fontWeight:600,padding:"10px 14px",textAlign:"left"}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(a=><tr key={a.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <td style={{padding:"11px 14px"}}><div style={{color:C.white,fontWeight:600,fontSize:13}}>{a.name}</div><div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{a.email}</div></td>
          <td style={{padding:"11px 14px"}}><div style={{color:C.mutedHi,fontSize:12}}>{a.city}{a.state?`, ${a.state}`:""}</div><div style={{color:C.muted,fontSize:11}}>{a.country}</div></td>
          <td style={{padding:"11px 14px",color:C.mutedHi,fontSize:13}}>{a.sport}</td>
          <td style={{padding:"11px 14px"}}><Badge color={tierColor[a.tier]}>{a.tier}</Badge></td>
          <td style={{padding:"11px 14px",color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>${a.mrr}</td>
          <td style={{padding:"11px 14px"}}><Badge color={a.status==="active"?C.green:C.red}>{a.status}</Badge></td>
          <td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}>
            <Btn onClick={()=>toggle(a.id)} variant={a.status==="active"?"danger":"success"} small>{a.status==="active"?"Pause":"Resume"}</Btn>
            <Btn onClick={()=>resetPass(a)} variant="ghost" small>🔑</Btn>
            <Btn onClick={()=>remove(a.id)} variant="danger" small>✕</Btn>
          </div></td>
        </tr>)}</tbody>
      </table>
    </div></Card>
    <Modal show={showAdd} onClose={()=>{setShowAdd(false);setAddErr("");}} title="ADD ATHLETE" maxW={560}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
        {[["NAME","name","First Last"],["SPORT","sport","Football"],["SCHOOL","school","UTEP"],["FOLLOWERS","followers","5000"],["EMAIL","email","athlete@email.com"],["INITIAL PASSWORD","password","Min 8 chars"],["CITY","city","Houston"],["STATE","state","Texas"]].map(([l,k,ph])=><Inp key={k} label={l} value={na[k]} onChange={v=>setNa(p=>({...p,[k]:v}))} placeholder={ph} type={k==="password"?"password":"text"}/>)}
        <Sel label="COUNTRY" value={na.country} onChange={v=>setNa(p=>({...p,country:v}))} options={REGIONS}/>
        <div style={{display:"flex",flexDirection:"column",gap:4}}><label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace"}}>TIER</label><select value={na.tier} onChange={e=>setNa(p=>({...p,tier:e.target.value}))} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option>Rookie</option><option>Rising</option><option>Pro</option></select></div>
      </div>
      <Inp label="BIO" value={na.bio} onChange={v=>setNa(p=>({...p,bio:v}))} rows={2} placeholder="Athlete's story or position"/>
      {addErr&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 13px",color:C.red,fontSize:13,marginTop:10}}>{addErr}</div>}
      <Btn onClick={add} disabled={!na.name||!na.sport||!na.email||!na.password} full style={{marginTop:12}}>Add Athlete</Btn>
    </Modal>
  </div>;
}

function OCoaches({coaches,saveCoaches,addLog}){
  const [search,setSearch]=useState(""); const [showAdd,setShowAdd]=useState(false); const [addErr,setAddErr]=useState("");
  const [nc,setNc]=useState({name:"",sport:"",org:"",title:"",email:"",password:"",phone:"",country:"United States",state:"",city:"",twitter:"",instagram:"",linkedin:"",bio:"",recruitingRegions:[]});
  const filtered=coaches.filter(c=>(c.name+c.sport+c.org+(c.country||"")).toLowerCase().includes(search.toLowerCase()));
  async function add(){
    if(!nc.name||!nc.org||!nc.email||!nc.password){setAddErr("Name, org, email, and password are required.");return;}
    if(nc.password.length<8){setAddErr("Password must be at least 8 characters.");return;}
    setAddErr("");
    const {data:{session}}=await supabase.auth.getSession();
    const res=await fetch("/api/auth-create-user",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({email:nc.email,password:nc.password,role:"coach"})});
    const json=await res.json();
    if(!res.ok){setAddErr(json.error||"Failed to create auth account.");return;}
    const c={...nc,id:Date.now(),authId:json.authId,role:"coach",status:"active",joined:new Date().toISOString().slice(0,10),privacy:{...DEF_C_PRIV},blockedIds:[]};
    delete c.password;
    saveCoaches(prev=>[...prev,c]);addLog({action:"Coach added",detail:c.name,level:"success"});
    setNc({name:"",sport:"",org:"",title:"",email:"",password:"",phone:"",country:"United States",state:"",city:"",twitter:"",instagram:"",linkedin:"",bio:"",recruitingRegions:[]});setShowAdd(false);
  }
  function remove(id){const c=coaches.find(x=>x.id===id);saveCoaches(prev=>prev.filter(x=>x.id!==id));addLog({action:"Coach removed",detail:c?.name,level:"warn"});}
  async function resetPass(c){
    const np=prompt(`New password for ${c.name} (min 8):`);
    if(!np||np.length<8){alert("Min 8 chars.");return;}
    const {data:{session}}=await supabase.auth.getSession();
    const res=await fetch("/api/auth-create-user",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},body:JSON.stringify({email:c.email,password:np,role:"coach"})});
    if(!res.ok){const j=await res.json();alert("Error: "+(j.error||"Failed"));return;}
    const {authId}=await res.json();
    if(authId&&!c.authId)saveCoaches(prev=>prev.map(x=>x.id===c.id?{...x,authId}:x));
    addLog({action:"Coach pass reset",detail:c.name,level:"warn"});
  }
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}><Sec title="Coaches" sub={`${filtered.length} coaches`}/><Btn onClick={()=>setShowAdd(true)}>+ Add Coach</Btn></div>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coaches…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",marginBottom:13,boxSizing:"border-box"}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {filtered.map(c=><Card key={c.id}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><Avatar name={c.name} size={36} color={C.purple}/><div style={{display:"flex",gap:5}}><Btn onClick={()=>resetPass(c)} variant="ghost" small>🔑</Btn><Btn onClick={()=>remove(c.id)} variant="danger" small>✕</Btn></div></div>
        <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:2}}>{c.name}</div>
        <div style={{color:C.purple,fontSize:12,marginBottom:1}}>{c.title}</div>
        <div style={{color:C.muted,fontSize:12,marginBottom:7}}>{c.org} · {c.city}, {c.country}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>{(c.recruitingRegions||[]).slice(0,3).map(r=><Badge key={r} color={C.blue}>{r}</Badge>)}{(c.recruitingRegions||[]).length>3&&<Badge color={C.muted}>+{c.recruitingRegions.length-3}</Badge>}</div>
        {c.email&&<div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{c.email}</div>}
      </Card>)}
    </div>
    <Modal show={showAdd} onClose={()=>{setShowAdd(false);setAddErr("");}} title="ADD COACH" maxW={580}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
        {[["NAME","name","Coach Full Name"],["SPORT","sport","Football"],["ORG","org","Texas Southern"],["TITLE","title","Head Coach"],["EMAIL","email","coach@uni.edu"],["INITIAL PASSWORD","password","Min 8 chars"],["PHONE","phone","(555)000-0000"],["CITY","city","Houston"],["STATE","state","Texas"],["TWITTER","twitter","@Handle"],["INSTAGRAM","instagram","@handle"],["LINKEDIN","linkedin","linkedin.com/in/..."]].map(([l,k,ph])=><Inp key={k} label={l} value={nc[k]} onChange={v=>setNc(p=>({...p,[k]:v}))} placeholder={ph} type={k==="password"?"password":"text"}/>)}
        <Sel label="BASE COUNTRY" value={nc.country} onChange={v=>setNc(p=>({...p,country:v}))} options={REGIONS}/>
      </div>
      <Inp label="BIO / RECRUITING FOCUS" value={nc.bio} onChange={v=>setNc(p=>({...p,bio:v}))} rows={2}/>
      <div style={{marginTop:11}}><label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace",display:"block",marginBottom:8}}>RECRUITING REGIONS</label><RegionPicker selected={nc.recruitingRegions} onChange={v=>setNc(p=>({...p,recruitingRegions:v}))}/></div>
      {addErr&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"9px 13px",color:C.red,fontSize:13,marginTop:10}}>{addErr}</div>}
      <Btn onClick={add} disabled={!nc.name||!nc.org||!nc.email||!nc.password} full style={{marginTop:13}}>Add Coach</Btn>
    </Modal>
  </div>;
}

function OAITools({athletes,saveAthletes,addLog}){
  const [aid,setAid]=useState(athletes[0]?.id||""); const [tool,setTool]=useState("brand"); const [custom,setCustom]=useState(""); const [out,setOut]=useState(""); const [loading,setLoading]=useState(false);
  const athlete=athletes.find(a=>a.id===Number(aid))||athletes[0];
  const tools=[{id:"brand",icon:"🤝",label:"Brand Deal DM"},{id:"roadmap",icon:"🗺️",label:"Monetization Roadmap"},{id:"profile",icon:"📋",label:"Recruiting Profile"},{id:"tiktok",icon:"📱",label:"TikTok Caption"},{id:"email",icon:"✉️",label:"Coach Cold Email"},{id:"press",icon:"📰",label:"Press Release"},{id:"custom",icon:"✏️",label:"Custom Prompt"}];
  const prompts={brand:`Brand deal DM for ${athlete?.name}, ${athlete?.sport}, ${fmt(athlete?.followers||0)} followers, ${athlete?.city||""} ${athlete?.country}. Authentic, under 120 words, clear ask.`,roadmap:`90-day monetization roadmap for ${athlete?.name}, ${athlete?.sport}, ${fmt(athlete?.followers||0)} followers. Phases: foundation, outreach, deals.`,profile:`Recruiting profile for ${athlete?.name}, ${athlete?.sport} from ${athlete?.school}. 3 paragraphs: identity, edge, character.`,tiktok:`3 TikTok captions for ${athlete?.name} (${athlete?.sport}, ${fmt(athlete?.followers||0)} followers). Under 150 chars, 3-4 hashtags each.`,email:`Cold email from ${athlete?.name} to a program coordinator. Subject line. Under 180 words. Confident.`,press:`200-word press release: ${athlete?.name} joins AthleteVault. Quotes from athlete and founder Dennis "Chewy" Barnes.`,custom};
  async function run(){if(!athlete||(tool==="custom"&&!custom))return;setLoading(true);setOut("");try{const r=await ai(AI_SYS,prompts[tool]);setOut(r);addLog({action:"AI run",detail:`${tools.find(t=>t.id===tool)?.label} for ${athlete.name}`,level:"info"});}catch(e){setOut("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="AI Tools" sub="Live Claude engine"/>
    <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:8}}>ATHLETE</div><select value={aid} onChange={e=>setAid(e.target.value)} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>{athletes.filter(a=>a.status==="active").map(a=><option key={a.id} value={a.id}>{a.name} — {a.sport} ({a.country})</option>)}</select></Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:12}}>{tools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} style={{background:tool===t.id?C.goldGlow:C.card,border:`1px solid ${tool===t.id?C.gold:C.border}`,borderRadius:9,padding:"12px 10px",cursor:"pointer",textAlign:"left"}}><div style={{fontSize:17,marginBottom:5}}>{t.icon}</div><div style={{color:tool===t.id?C.gold:C.white,fontWeight:600,fontSize:12,fontFamily:"'Sora',sans-serif"}}>{t.label}</div></button>)}</div>
    {tool==="custom"&&<textarea value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Any AI instruction…" rows={3} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:12,color:C.white,fontSize:13,outline:"none",resize:"vertical",fontFamily:"'Sora',sans-serif",boxSizing:"border-box",marginBottom:11}}/>}
    <Btn onClick={run} disabled={loading||!athlete} style={{marginBottom:13}}>{loading?"⚡ Generating…":`⚡ Run ${tools.find(t=>t.id===tool)?.label}`}</Btn>
    <AIOut loading={loading} output={out} label={tools.find(t=>t.id===tool)?.label?.toUpperCase()}/>
  </div>;
}

function ORevenue({athletes}){
  const active=athletes.filter(a=>a.status==="active"); const mrr=active.reduce((s,a)=>s+a.mrr,0);
  const months=[{mo:"Jan",rev:2900},{mo:"Feb",rev:5800},{mo:"Mar",rev:9280},{mo:"Apr",rev:14700},{mo:"May",rev:mrr}]; const maxR=Math.max(...months.map(m=>m.rev));
  return <div>
    <Sec title="Revenue"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="📈" label="MRR" value={fmtM(mrr)} delta={`${active.length} athletes`} color={C.gold}/>
      <Stat icon="🗓️" label="ARR" value={fmtM(mrr*12)} color={C.green}/>
      <Stat icon="📉" label="CHURN" value="2.1%" color={C.blue}/>
      <Stat icon="💎" label="LTV" value={fmtM(Math.round((mrr/Math.max(active.length,1))/0.021))} color={C.purple}/>
    </div>
    <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:15}}>MRR GROWTH</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:10,height:120}}>
        {months.map((m,i)=><div key={m.mo} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace"}}>{fmtM(m.rev)}</div>
          <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:i===months.length-1?`linear-gradient(180deg,${C.gold},${C.goldDim})`:C.border,height:`${Math.max(6,(m.rev/maxR)*100)}px`}}/>
          <div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{m.mo}</div>
        </div>)}
      </div>
    </Card>
    <Card>{active.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><div><div style={{color:C.white,fontWeight:600,fontSize:13}}>{a.name}</div><div style={{color:C.muted,fontSize:11}}>{a.tier} · {a.country}</div></div><div style={{color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>${a.mrr}/mo</div></div>)}
    <div style={{display:"flex",justifyContent:"flex-end",paddingTop:10}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:C.gold}}>TOTAL: {fmtM(mrr)}/mo</div></div></Card>
  </div>;
}

function OOutreach({athletes,saveAthletes,addLog}){
  const [aid,setAid]=useState(athletes[0]?.id||""); const [loading,setLoading]=useState(false); const [results,setResults]=useState([]);
  async function run(){const a=athletes.find(x=>x.id===Number(aid));if(!a)return;setLoading(true);setResults([]);try{const res=await ai(AI_SYS,`List 5 realistic coach contacts for a ${a.sport} athlete (${fmt(a.followers)} followers, ${a.city||""} ${a.country}). JSON only: [{name,program,email,note}]. No markdown.`);const p=JSON.parse(res.replace(/```json|```/g,"").trim());setResults(p);saveAthletes(prev=>prev.map(x=>x.id===a.id?{...x,coachSent:x.coachSent+p.length}:x));addLog({action:"Outreach",detail:`${p.length} coaches for ${a.name}`,level:"success"});}catch(e){setResults([{name:"Error",program:"Retry",email:"—",note:"Unexpected format"}]);}setLoading(false);}
  return <div>
    <Sec title="Outreach Engine"/>
    <Card style={{marginBottom:14}} glow>
      <div style={{display:"flex",gap:11,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:5}}>ATHLETE</div><select value={aid} onChange={e=>setAid(e.target.value)} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>{athletes.filter(a=>a.status==="active").map(a=><option key={a.id} value={a.id}>{a.name} ({a.country})</option>)}</select></div>
        <Btn onClick={run} disabled={loading}>{loading?"Matching…":"⚡ Run Coach Match"}</Btn>
      </div>
    </Card>
    {results.length>0&&<Card>{results.map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:C.white,fontWeight:600,fontSize:13}}>{r.name}</span><Badge color={C.green}>Ready</Badge></div><div style={{color:C.gold,fontSize:12}}>{r.program}</div><div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{r.email}</div></div>)}</Card>}
  </div>;
}

function OSiteConfig({settings,saveSettings,addLog}){
  const [s,setS]=useState(settings); const [saved,setSaved]=useState(false);
  function save(){saveSettings(s);addLog({action:"Site config updated",level:"info"});setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="Site Config" sub="Change anything about the platform — live"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>BRANDING</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>{[["PLATFORM NAME","platformName"],["TAGLINE","tagline"],["OWNER NAME","ownerName"],["SUPPORT EMAIL","email"]].map(([l,k])=><Inp key={k} label={l} value={s[k]||""} onChange={v=>setS(p=>({...p,[k]:v}))}/> )}</div>
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>PRICING</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>{[["ROOKIE ($)","rookiePrice"],["RISING ($)","risingPrice"],["PRO ($)","proPrice"]].map(([l,k])=><Inp key={k} label={l} value={String(s[k]||"")} onChange={v=>setS(p=>({...p,[k]:Number(v)}))}/> )}</div>
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>FEATURE TOGGLES</div>
        <Tog label="AI Tools Active" val={!!s.aiActive} onChange={v=>setS(p=>({...p,aiActive:v}))}/>
        <Tog label="Outreach Engine" val={!!s.outreachActive} onChange={v=>setS(p=>({...p,outreachActive:v}))}/>
        <Tog label="New Signups Open" val={!!s.signupsOpen} onChange={v=>setS(p=>({...p,signupsOpen:v}))}/>
        <Tog label="Notify New Subs" val={!!s.notifyNewSub} onChange={v=>setS(p=>({...p,notifyNewSub:v}))}/>
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>WELCOME MESSAGE</div><Inp value={s.welcomeMsg||""} onChange={v=>setS(p=>({...p,welcomeMsg:v}))} rows={4}/></Card>
    </div>
    <Btn onClick={save}>{saved?"✓ Saved!":"Save All Changes"}</Btn>
  </div>;
}

function OSecurity({logs,addLog,onLogout}){
  const lc={info:C.blue,success:C.green,warn:C.gold,error:C.red};
  return <div>
    <Sec title="Security & Audit"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="🛡️" label="STATUS" value="SECURE" color={C.green}/>
      <Stat icon="📋" label="LOG ENTRIES" value={fmt(logs.length)} color={C.blue}/>
      <Stat icon="🚫" label="BREACHES" value="0" color={C.purple}/>
    </div>
    <Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1}}>ACTIVITY LOG</div>
      <div style={{display:"flex",gap:8}}><Btn variant="danger" small onClick={()=>addLog({action:"Log cleared",level:"warn"})}>Clear</Btn><Btn variant="danger" small onClick={onLogout}>Force Sign Out</Btn></div>
    </div>
    <div style={{maxHeight:360,overflowY:"auto"}}>{logs.map((l,i)=><div key={l.id||i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{width:6,height:6,borderRadius:"50%",background:lc[l.level]||C.muted,marginTop:5,flexShrink:0}}/>
      <div><div style={{display:"flex",gap:8,marginBottom:2}}><span style={{color:C.white,fontWeight:600,fontSize:12}}>{l.action}</span><span style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace"}}>{l.ts}</span></div><div style={{color:C.mutedHi,fontSize:11}}>{l.detail}</div></div>
    </div>)}</div></Card>
  </div>;
}
// ═══════════════════════════════════════════════
//  ATHLETE NAV + TABS
// ═══════════════════════════════════════════════
const A_NAV=[
  {id:"home",    icon:"🏠", label:"My Vault"      },
  {id:"messages",icon:"💬", label:"Messages"       },
  {id:"schools", icon:"🏫", label:"School Search"  },
  {id:"content", icon:"🎬", label:"Content Center" },
  {id:"brands",  icon:"🤝", label:"Brand Deals"    },
  {id:"coaches", icon:"📡", label:"Coach Network"  },
  {id:"money",   icon:"💰", label:"Monetization"   },
  {id:"nil",     icon:"🎓", label:"NIL Academy"    },
  {id:"timeline",icon:"📅", label:"Recruiting Path"},
  {id:"profile", icon:"👤", label:"My Profile"     },
  {id:"privacy", icon:"🔒", label:"Privacy & Security"},
  {id:"legal",   icon:"⚖️", label:"Legal & Terms"  },
  {id:"help",    icon:"❓", label:"Help Center"     },
];

function AHome({athlete,settings}){
  const roadmap=[{done:true,label:"Create your AthleteVault profile"},{done:athlete.videos?.length>0,label:"Upload your first highlight reel"},{done:athlete.brandSent>0,label:"Apply to 3 brand deals"},{done:false,label:"Complete NIL Academy Basics"},{done:athlete.coachSent>0,label:"Connect with a coach"},{done:false,label:"Generate your monetization roadmap"}];
  return <div>
    {settings.welcomeMsg&&<Card glow style={{marginBottom:18}}><p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7}}>{settings.welcomeMsg}</p></Card>}
    <div style={{marginBottom:20}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:C.white,letterSpacing:2}}>WELCOME BACK, {athlete.name.split(" ")[0].toUpperCase()} 👊</div><p style={{color:C.muted,fontSize:13,marginTop:4}}>Your vault is live. Let's build your brand.</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="FOLLOWERS" value={fmt(athlete.followers)} color={C.blue}/>
      <Stat icon="🤝" label="BRAND DMs" value={athlete.brandSent} color={C.green}/>
      <Stat icon="📨" label="COACHES" value={athlete.coachSent} color={C.purple}/>
      <Stat icon="🎬" label="VIDEOS" value={athlete.videos?.length||0} color={C.gold}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>YOUR PLAN</div>
        {[["Tier",athlete.tier],["Sport",athlete.sport],["Location",`${athlete.city||""}${athlete.country?`, ${athlete.country}`:""}`],["Since",athlete.joined],["Monthly",`$${athlete.mrr}/mo`]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{v}</span></div>)}
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>YOUR ROADMAP</div>
        {roadmap.map((item,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:9}}>
          <div style={{width:17,height:17,borderRadius:"50%",border:`2px solid ${item.done?C.green:C.border}`,background:item.done?C.green+"33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{item.done&&<span style={{color:C.green,fontSize:9}}>✓</span>}</div>
          <span style={{color:item.done?C.muted:C.white,fontSize:13,textDecoration:item.done?"line-through":"none"}}>{item.label}</span>
        </div>)}
      </Card>
    </div>
  </div>;
}

function AContent({athlete,saveAthletes,athletes}){
  const [ctab,setCtab]=useState("vault"); const [showUpload,setShowUpload]=useState(false);
  const [vid,setVid]=useState({title:"",platform:[],notes:"",url:""});
  const [caption,setCaption]=useState(""); const [capLoading,setCapLoading]=useState(false); const [selVid,setSelVid]=useState(null);
  const platforms=["TikTok","Instagram","Twitter/X","YouTube","LinkedIn"];
  const videos=athletes.find(a=>a.id===athlete.id)?.videos||[];
  function addVideo(){if(!vid.title)return;const v={id:Date.now(),...vid,added:new Date().toISOString().slice(0,10)};saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,videos:[v,...(a.videos||[])]}:a));setVid({title:"",platform:[],notes:"",url:""});setShowUpload(false);}
  async function genCaption(v){setSelVid(v);setCaption("");setCapLoading(true);try{const r=await ai(AI_SYS,`TikTok + Instagram caption for highlight video "${v.title}" by ${athlete.name}, ${athlete.sport}. Two versions. Include hashtags.`);setCaption(r);}catch(e){setCaption("⚠️ Failed. Retry.");}setCapLoading(false);}
  return <div>
    <Sec title="Content Center" sub="Your video vault + AI caption engine"/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      {[["vault","📦 My Vault"],["captions","⚡ Caption AI"],["schedule","🗓️ Schedule"]].map(([t,l])=><Btn key={t} onClick={()=>setCtab(t)} variant={ctab===t?"primary":"ghost"} small>{l}</Btn>)}
      <Btn onClick={()=>setShowUpload(true)} style={{marginLeft:"auto"}}>+ Upload Video</Btn>
    </div>
    {ctab==="vault"&&(videos.length===0?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>🎬</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>Your vault is empty</div><Btn onClick={()=>setShowUpload(true)}>Upload Video</Btn></Card>
    :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:13}}>
      {videos.map(v=><Card key={v.id}><div style={{background:C.card2,borderRadius:8,height:100,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,fontSize:32}}>🎥</div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3}}>{v.title}</div><div style={{color:C.muted,fontSize:11,marginBottom:7}}>{v.added}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{v.platform.map(p=><Badge key={p} color={C.blue}>{p}</Badge>)}</div>{v.url&&<a href={v.url} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:12,display:"block",marginBottom:8}}>View Link ↗</a>}<Btn onClick={()=>genCaption(v)} variant="ghost" small full>⚡ Generate Caption</Btn></Card>)}
    </div>)}
    {ctab==="captions"&&<div>
      {videos.length>0&&<Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:8}}>SELECT VIDEO</div><select onChange={e=>{const v=videos.find(x=>x.id===Number(e.target.value));if(v)genCaption(v);}} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="">— Pick a video —</option>{videos.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></Card>}
      <AIOut loading={capLoading} output={caption} label={selVid?`CAPTION — ${selVid.title}`:"CAPTION"}/>
    </div>}
    {ctab==="schedule"&&<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>🗓️</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>Post Scheduler Coming Soon</div><div style={{color:C.muted,fontSize:13}}>Use AI captions and post directly to your platforms for now.</div></Card>}
    <Modal show={showUpload} onClose={()=>setShowUpload(false)} title="UPLOAD VIDEO">
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Inp label="TITLE" value={vid.title} onChange={v=>setVid(p=>({...p,title:v}))} placeholder="Spring Highlight Reel 2026"/>
        <Inp label="VIDEO URL / LINK" value={vid.url} onChange={v=>setVid(p=>({...p,url:v}))} placeholder="https://youtube.com/..."/>
        <div><label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace",display:"block",marginBottom:6}}>PLATFORMS</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{platforms.map(p=>{const on=vid.platform.includes(p);return <button key={p} onClick={()=>setVid(prev=>({...prev,platform:on?prev.platform.filter(x=>x!==p):[...prev.platform,p]}))} style={{background:on?C.goldGlow:"transparent",border:`1px solid ${on?C.gold:C.border}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",color:on?C.gold:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12}}>{p}</button>;})}</div>
        </div>
        <Inp label="NOTES" value={vid.notes} onChange={v=>setVid(p=>({...p,notes:v}))} rows={2}/>
        <Btn onClick={addVideo} disabled={!vid.title} full>Save to Vault</Btn>
      </div>
    </Modal>
  </div>;
}

function ABrands({athlete,saveAthletes,athletes}){
  const [sel,setSel]=useState(null); const [loading,setLoading]=useState(false); const [pitch,setPitch]=useState("");
  const myDeals=athletes.find(a=>a.id===athlete.id)?.deals||[];
  async function apply(deal){setSel(deal);setPitch("");setLoading(true);try{const r=await ai(AI_SYS,`Brand pitch DM from ${athlete.name} (${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}) to ${deal.brand} (${deal.category}). Under 130 words. Authentic, specific, clear CTA.`);setPitch(r);saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,brandSent:a.brandSent+1,deals:[...(a.deals||[]),{id:deal.id,brand:deal.brand,status:"applied",date:new Date().toISOString().slice(0,10)}]}:a));}catch(e){setPitch("⚠️ Failed. Retry.");}setLoading(false);}
  const applied=myDeals.map(d=>d.id);
  return <div>
    <Sec title="Brand Deals" sub="Find deals. AI writes your pitch. Get paid."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {BRAND_DEALS.map(d=>{const isApplied=applied.includes(d.id);return <Card key={d.id} glow={sel?.id===d.id}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:26}}>{d.logo}</div><Badge color={isApplied?C.green:C.blue}>{isApplied?"Applied":"Open"}</Badge></div><div style={{color:C.white,fontWeight:700,fontSize:15,marginBottom:2}}>{d.brand}</div><div style={{color:C.muted,fontSize:11,marginBottom:6}}>{d.category}</div><div style={{color:C.mutedHi,fontSize:12,marginBottom:8,lineHeight:1.5}}>{d.desc}</div><div style={{color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,marginBottom:10}}>{d.payout}</div><Btn onClick={()=>apply(d)} disabled={loading&&sel?.id===d.id} variant={isApplied?"success":"primary"} small full>{loading&&sel?.id===d.id?"Writing…":isApplied?"Pitch Again":"⚡ Apply with AI Pitch"}</Btn></Card>;})}
      </div>
      <div>
        {sel?<Card glow><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>YOUR PITCH — {sel.brand.toUpperCase()}</div>{loading?<div style={{color:C.muted,fontFamily:"DM Mono,monospace",fontSize:13}}>⟳ Writing…</div>:<><p style={{color:C.white,fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Sora',sans-serif"}}>{pitch}</p><Btn variant="ghost" small onClick={()=>navigator.clipboard?.writeText(pitch)} style={{marginTop:11}}>📋 Copy Pitch</Btn></>}</Card>
        :<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>🤝</div><div style={{color:C.white,fontWeight:600,marginBottom:6}}>Select a deal to apply</div><div style={{color:C.muted,fontSize:13}}>AI writes your personalized pitch instantly.</div></Card>}
        {myDeals.length>0&&<Card style={{marginTop:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>MY APPLICATIONS</div>{myDeals.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.white,fontSize:13}}>{d.brand}</span><Badge color={C.green}>{d.status}</Badge></div>)}</Card>}
      </div>
    </div>
  </div>;
}

function ACoachNetwork({athlete,coaches,saveAthletes}){
  const [search,setSearch]=useState(""); const [sportF,setSportF]=useState("all"); const [countryF,setCountryF]=useState("all");
  const [sel,setSel]=useState(null); const [loading,setLoading]=useState(false); const [msg,setMsg]=useState("");
  const sports=[...new Set(coaches.map(c=>c.sport))];
  const countries=[...new Set(coaches.filter(c=>c.privacy?.searchable!==false).map(c=>c.country).filter(Boolean))];
  const visible=coaches.filter(c=>c.status==="active"&&c.privacy?.profileVisible!==false&&c.privacy?.searchable!==false);
  const filtered=visible.filter(c=>{const mS=(c.name+c.org+(c.bio||"")).toLowerCase().includes(search.toLowerCase());const mSp=sportF==="all"||c.sport===sportF;const mC=countryF==="all"||c.country===countryF||(c.recruitingRegions||[]).includes(countryF);return mS&&mSp&&mC;});
  const priv=sel?.privacy||DEF_C_PRIV;
  async function genOutreach(coach){setLoading(true);setMsg("");try{const r=await ai(AI_SYS,`Recruiting outreach from ${athlete.name} (${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}) to ${coach.name} at ${coach.org}. Coach focus: "${coach.bio||""}". Under 150 words.`);setMsg(r);saveAthletes(prev=>prev.map(a=>a.id===athlete.id?{...a,coachSent:a.coachSent+1}:a));}catch(e){setMsg("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="Coach Network" sub="Find coaches worldwide. See contact info. Generate AI outreach."/>
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coaches, orgs, focus…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
      <Btn onClick={()=>setSportF("all")} variant={sportF==="all"?"primary":"ghost"} small>All Sports</Btn>
      {sports.map(s=><Btn key={s} onClick={()=>setSportF(s)} variant={sportF===s?"primary":"ghost"} small>{s}</Btn>)}
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <Btn onClick={()=>setCountryF("all")} variant={countryF==="all"?"primary":"ghost"} small>All Regions</Btn>
      {countries.map(c=><Btn key={c} onClick={()=>setCountryF(c)} variant={countryF===c?"primary":"ghost"} small>{c}</Btn>)}
      {REGIONS.filter(r=>!countries.includes(r)&&visible.some(c=>(c.recruitingRegions||[]).includes(r))).map(r=><Btn key={r} onClick={()=>setCountryF(r)} variant={countryF===r?"primary":"ghost"} small>Recruits: {r}</Btn>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
        {filtered.map(c=><Card key={c.id} glow={sel?.id===c.id} onClick={()=>{setSel(c);setMsg("");}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Avatar name={c.name} size={36} color={C.purple}/><div><div style={{color:C.white,fontWeight:700,fontSize:13}}>{c.name}</div><div style={{color:C.purple,fontSize:11}}>{c.title}</div></div></div>
          <div style={{color:C.gold,fontSize:13,fontWeight:600,marginBottom:3}}>{c.org}</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:7}}>{c.city}{c.country?`, ${c.country}`:""}</div>
          <Badge color={C.blue}>{c.sport}</Badge>
          {c.privacy?.showBio!==false&&c.bio&&<p style={{color:C.mutedHi,fontSize:12,lineHeight:1.5,marginTop:8,marginBottom:8}}>{c.bio.slice(0,80)}{c.bio.length>80?"…":""}</p>}
          {(c.recruitingRegions||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:6}}>{c.recruitingRegions.slice(0,2).map(r=><Badge key={r} color={C.green}>{r}</Badge>)}{c.recruitingRegions.length>2&&<Badge color={C.muted}>+{c.recruitingRegions.length-2}</Badge>}</div>}
        </Card>)}
        {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0"}}>No coaches match your filters.</div>}
      </div>
      <div>
        {sel?<Card glow>
          <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>COACH PROFILE</div>
          <Avatar name={sel.name} size={44} color={C.purple}/>
          <div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:2,marginTop:9}}>{sel.name}</div>
          <div style={{color:C.purple,fontSize:12,marginBottom:2}}>{sel.title}</div>
          <div style={{color:C.gold,fontSize:13,marginBottom:7}}>{sel.org}</div>
          {priv.showBio&&sel.bio&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:11}}>{sel.bio}</p>}
          {(sel.recruitingRegions||[]).length>0&&<div style={{marginBottom:11}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:5}}>RECRUITING FROM</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sel.recruitingRegions.map(r=><Badge key={r} color={C.green}>{r}</Badge>)}</div></div>}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:11,marginBottom:11}}>
            {priv.showEmail&&sel.email&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>EMAIL</div><div style={{color:C.white,fontSize:13,fontFamily:"DM Mono,monospace"}}>{sel.email}</div></div>}
            {priv.showPhone&&sel.phone&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>PHONE</div><div style={{color:C.white,fontSize:13}}>{sel.phone}</div></div>}
            {priv.showTwitter&&sel.twitter&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>TWITTER / X</div><div style={{color:C.blue,fontSize:13}}>{sel.twitter}</div></div>}
            {priv.showInstagram&&sel.instagram&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>INSTAGRAM</div><div style={{color:C.purple,fontSize:13}}>{sel.instagram}</div></div>}
            {priv.showLinkedin&&sel.linkedin&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>LINKEDIN</div><div style={{color:C.blue,fontSize:13}}>{sel.linkedin}</div></div>}
            {!priv.showEmail&&!priv.showPhone&&!priv.showTwitter&&!priv.showInstagram&&<p style={{color:C.muted,fontSize:12}}>Coach contact info is private. Send them a message via the Messages tab.</p>}
          </div>
          <Btn onClick={()=>genOutreach(sel)} disabled={loading} full>{loading?"Writing…":"⚡ Generate Outreach Message"}</Btn>
          <AIOut loading={loading} output={msg} label="OUTREACH MESSAGE"/>
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>📡</div><div style={{color:C.white,fontWeight:600,marginBottom:6}}>Select a coach</div><div style={{color:C.muted,fontSize:13}}>See contact info and generate your outreach.</div></Card>}
      </div>
    </div>
  </div>;
}

function AMoney({athlete}){
  const [roadmap,setRoadmap]=useState(""); const [loading,setLoading]=useState(false);
  const streams=[{icon:"🤝",label:"Brand Deals",est:"$150–$3,000/deal",active:athlete.brandSent>0},{icon:"🏋️",label:"Training Clinics",est:"$50–$200/session",active:false},{icon:"📱",label:"Content Subs",est:"$5–$50/fan/mo",active:false},{icon:"👕",label:"Merch",est:"$10–$50/item",active:false},{icon:"🎙️",label:"Speaking",est:"$200–$2,000",active:false},{icon:"🔗",label:"Affiliate",est:"$50–$500/mo",active:false}];
  async function gen(){setLoading(true);setRoadmap("");try{const r=await ai(AI_SYS,`Personal 90-day monetization roadmap for ${athlete.name}, ${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}, tier: ${athlete.tier}. Specific amounts, timelines, first actions.`);setRoadmap(r);}catch(e){setRoadmap("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="Monetization" sub="Your personal money map"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:18}}>
      {streams.map(s=><Card key={s.label}><div style={{fontSize:22,marginBottom:7}}>{s.icon}</div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3}}>{s.label}</div><div style={{color:C.green,fontFamily:"DM Mono,monospace",fontSize:12,marginBottom:7}}>{s.est}</div><Badge color={s.active?C.green:C.muted}>{s.active?"Active":"Potential"}</Badge></Card>)}
    </div>
    <Card glow style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:loading||roadmap?13:0,flexWrap:"wrap",gap:10}}>
        <div><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:3}}>AI ROADMAP</div><div style={{color:C.white,fontWeight:600}}>Your personalized 90-day money plan</div></div>
        <Btn onClick={gen} disabled={loading}>{loading?"Building…":"⚡ Generate My Roadmap"}</Btn>
      </div>
      <AIOut loading={loading} output={roadmap} label="90-DAY MONETIZATION ROADMAP"/>
    </Card>
  </div>;
}

function ANIL(){
  const [sel,setSel]=useState(null); const [q,setQ]=useState(""); const [ans,setAns]=useState(""); const [loading,setLoading]=useState(false);
  const levelColor={Beginner:C.green,Intermediate:C.gold,Advanced:C.purple};
  async function ask(){if(!q)return;setLoading(true);setAns("");try{const r=await ai("You are a NIL expert for athletes and coaches. Clear, practical, legally-aware. Always recommend consulting a sports attorney for binding decisions.",q);setAns(r);}catch(e){setAns("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="NIL Academy" sub="Learn how to legally profit from your Name, Image & Likeness"/>
    {sel?<div>
      <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:16}}>← Back to lessons</button>
      <Card glow><div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}><div style={{fontSize:28}}>{sel.icon}</div><div><div style={{color:C.white,fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,letterSpacing:1}}>{sel.title}</div><div style={{display:"flex",gap:7,marginTop:5}}><Badge color={levelColor[sel.level]}>{sel.level}</Badge><span style={{color:C.muted,fontSize:12}}>{sel.dur}</span></div></div></div>
      <p style={{color:C.white,fontSize:14,lineHeight:1.85,fontFamily:"'Sora',sans-serif"}}>{sel.content}</p></Card>
    </div>:<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12,marginBottom:20}}>
        {NIL_LESSONS.map(l=><Card key={l.id} onClick={()=>setSel(l)} style={{cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}><div style={{fontSize:22}}>{l.icon}</div><Badge color={levelColor[l.level]}>{l.level}</Badge></div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3,lineHeight:1.3}}>{l.title}</div><div style={{color:C.muted,fontSize:12}}>{l.dur}</div></Card>)}
      </div>
      <Card glow><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>ASK THE NIL AI</div>
        <div style={{display:"flex",gap:9}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Can I sign a brand deal while in college?" style={{flex:1,background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
          <Btn onClick={ask} disabled={loading||!q}>{loading?"…":"Ask"}</Btn>
        </div>
        <AIOut loading={loading} output={ans} label="NIL AI"/>
      </Card>
    </div>}
  </div>;
}

function AHelp({settings}){
  const [open,setOpen]=useState(null); const [msg,setMsg]=useState(""); const [sent,setSent]=useState(false);
  return <div>
    <Sec title="Help Center" sub="Got questions? We've got answers."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
      <div>{HELP_FAQS.map((f,i)=><Card key={i} style={{marginBottom:8,cursor:"pointer"}} onClick={()=>setOpen(open===i?null:i)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.white,fontWeight:600,fontSize:13,flex:1,paddingRight:10}}>{f.q}</span><span style={{color:C.gold,fontSize:16}}>{open===i?"−":"+"}</span></div>
        {open===i&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7,marginTop:10}}>{f.ans}</p>}
      </Card>)}</div>
      <div>
        <Card glow style={{marginBottom:12}}>
          <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>CONTACT SUPPORT</div>
          <div style={{color:C.white,fontWeight:600,marginBottom:3}}>{settings.ownerName||"Support"}</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:12}}>Responds within 24 hrs · {settings.email||"support@athletevault.com"}</div>
          {sent?<div style={{background:C.green+"22",border:`1px solid ${C.green}44`,borderRadius:8,padding:"10px",color:C.green,fontSize:14}}>✓ Message sent. We'll respond within 24 hrs.</div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}><Inp value={msg} onChange={setMsg} placeholder="Describe your issue…" rows={4}/><Btn onClick={()=>{if(msg)setSent(true);}} disabled={!msg} full>Send Message</Btn></div>}
        </Card>
      </div>
    </div>
  </div>;
}
// ═══════════════════════════════════════════════
//  COACH TABS
// ═══════════════════════════════════════════════
const C_NAV=[
  {id:"home",    icon:"🏠", label:"My Dashboard"     },
  {id:"messages",icon:"💬", label:"Messages"          },
  {id:"athletes",icon:"👥", label:"Find Athletes"     },
  {id:"nil",     icon:"🎓", label:"NIL Academy"       },
  {id:"profile", icon:"👤", label:"My Profile"        },
  {id:"privacy", icon:"🔒", label:"Privacy & Security"},
  {id:"legal",   icon:"⚖️", label:"Legal & Terms"     },
  {id:"help",    icon:"❓", label:"Help Center"        },
];


function CoachHome({coach}){
  return <div>
    <div style={{marginBottom:20}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:C.white,letterSpacing:2}}>WELCOME, {coach.name.split(" ").slice(-1)[0].toUpperCase()} 🏈</div><p style={{color:C.muted,fontSize:13,marginTop:4}}>{coach.title} · {coach.org}</p></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
      <Card glow><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>YOUR PROFILE</div>
        {[["Name",coach.name],["Title",coach.title],["Organization",coach.org],["Sport",coach.sport],["Location",`${coach.city||""}${coach.country?`, ${coach.country}`:""}`]].filter(([,v])=>v).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{v}</span></div>)}
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>RECRUITING REGIONS</div>
        {(coach.recruitingRegions||[]).length>0?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{coach.recruitingRegions.map(r=><Badge key={r} color={C.green}>{r}</Badge>)}</div>:<p style={{color:C.muted,fontSize:13}}>No regions set. Edit your profile to add recruiting regions.</p>}
      </Card>
    </div>
    {coach.bio&&<Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>RECRUITING FOCUS</div><p style={{color:C.white,fontSize:14,lineHeight:1.7}}>{coach.bio}</p></Card>}
  </div>;
}

function CoachProfile({coach,saveCoaches}){
  const [f,setF]=useState({name:coach.name,sport:coach.sport||"",org:coach.org,title:coach.title,city:coach.city||"",state:coach.state||"",country:coach.country||"United States",phone:coach.phone||"",twitter:coach.twitter||"",instagram:coach.instagram||"",linkedin:coach.linkedin||"",bio:coach.bio||"",recruitingRegions:coach.recruitingRegions||[]});
  const [saved,setSaved]=useState(false);
  function save(){saveCoaches(prev=>prev.map(c=>c.id===coach.id?{...c,...f}:c));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="My Profile" sub="Edit your public coaching profile"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>COACH INFO</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {[["FULL NAME","name"],["SPORT","sport"],["ORGANIZATION","org"],["TITLE","title"],["PHONE (private by default)","phone"],["TWITTER","twitter"],["INSTAGRAM","instagram"],["LINKEDIN","linkedin"]].map(([l,k])=><Inp key={k} label={l} value={f[k]} onChange={v=>setF(p=>({...p,[k]:v}))}/>)}
        </div>
      </Card>
      <div>
        <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>LOCATION</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Inp label="CITY" value={f.city} onChange={v=>setF(p=>({...p,city:v}))} placeholder="Houston"/>
            <Inp label="STATE / REGION" value={f.state} onChange={v=>setF(p=>({...p,state:v}))} placeholder="Texas"/>
            <Sel label="BASE COUNTRY" value={f.country} onChange={v=>setF(p=>({...p,country:v}))} options={REGIONS}/>
          </div>
        </Card>
        <Card><Inp label="BIO / RECRUITING FOCUS" value={f.bio} onChange={v=>setF(p=>({...p,bio:v}))} placeholder="What positions and athletes are you looking for?" rows={4}/></Card>
      </div>
    </div>
    <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>RECRUITING REGIONS</div><RegionPicker selected={f.recruitingRegions} onChange={v=>setF(p=>({...p,recruitingRegions:v}))}/></Card>
    <Btn onClick={save}>{saved?"✓ Saved!":"Save Profile"}</Btn>
  </div>;
}

function CoachAthletes({athletes,coach}){
  const [search,setSearch]=useState(""); const [sportF,setSportF]=useState("all"); const [countryF,setCountryF]=useState("all"); const [stateF,setStateF]=useState("all"); const [sel,setSel]=useState(null);
  const sports=[...new Set(athletes.map(a=>a.sport))];
  const visible=athletes.filter(a=>a.status==="active"&&a.privacy?.searchable!==false&&a.privacy?.profileVisible!==false);
  const countries=[...new Set(visible.map(a=>a.country).filter(Boolean))];
  const usStates=[...new Set(visible.filter(a=>a.country==="United States").map(a=>a.state).filter(Boolean))];
  const filtered=visible.filter(a=>{const mS=(a.name+(a.school||"")+(a.bio||"")).toLowerCase().includes(search.toLowerCase());const mSp=sportF==="all"||a.sport===sportF;const mC=countryF==="all"||a.country===countryF;const mSt=stateF==="all"||a.state===stateF;return mS&&mSp&&mC&&mSt;});
  const priv=sel?.privacy||DEF_A_PRIV;
  return <div>
    <Sec title="Find Athletes" sub="Search athletes worldwide — filter by sport, country, and region"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:14}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, school, bio…" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>
        <option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}
      </select>
      <select value={countryF} onChange={e=>{setCountryF(e.target.value);setStateF("all");}} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>
        <option value="all">All Countries</option>{countries.map(c=><option key={c}>{c}</option>)}
      </select>
      {countryF==="United States"&&<select value={stateF} onChange={e=>setStateF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>
        <option value="all">All States</option>{usStates.map(s=><option key={s}>{s}</option>)}
      </select>}
    </div>
    <p style={{color:C.muted,fontSize:12,marginBottom:14,fontFamily:"DM Mono,monospace"}}>{filtered.length} athletes found</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
        {filtered.map(a=><Card key={a.id} glow={sel?.id===a.id} onClick={()=>setSel(a)} style={{cursor:"pointer"}}>
          <Avatar name={a.name} size={34} color={C.blue}/>
          <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:2,marginTop:8}}>{a.name}</div>
          <div style={{color:C.gold,fontSize:12,marginBottom:2}}>{a.sport}</div>
          {a.privacy?.showLocation!==false&&<div style={{color:C.muted,fontSize:12,marginBottom:5}}>{a.city}{a.state?`, ${a.state}`:""}{a.country?`, ${a.country}`:""}</div>}
          {a.privacy?.showSchool!==false&&<div style={{color:C.mutedHi,fontSize:12,marginBottom:7}}>{a.school}</div>}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {a.privacy?.showFollowers!==false&&<Badge color={C.blue}>{fmt(a.followers)} followers</Badge>}
            <Badge color={{Rookie:C.white,Rising:C.gold,Pro:C.purple}[a.tier]}>{a.tier}</Badge>
          </div>
        </Card>)}
        {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0"}}>No athletes match your search.</div>}
      </div>
      <div>
        {sel?<Card glow>
          <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>ATHLETE PROFILE</div>
          <Avatar name={sel.name} size={44} color={C.blue}/>
          <div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:2,marginTop:9}}>{sel.name}</div>
          <div style={{color:C.gold,fontSize:13,marginBottom:7}}>{sel.sport}</div>
          {priv.showSchool&&sel.school&&<div style={{color:C.mutedHi,fontSize:13,marginBottom:7}}>{sel.school}</div>}
          {priv.showLocation&&<div style={{color:C.muted,fontSize:12,marginBottom:10}}>{sel.city}{sel.state?`, ${sel.state}`:""}{sel.country?`, ${sel.country}`:""}</div>}
          {sel.bio&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:12}}>{sel.bio}</p>}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:11,marginBottom:11}}>
            {priv.showFollowers&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>Followers</span><span style={{color:C.white,fontWeight:600,fontSize:13}}>{fmt(sel.followers)}</span></div>}
            {priv.showStats&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>Member Since</span><span style={{color:C.white,fontWeight:600,fontSize:13}}>{sel.joined}</span></div>}
            {priv.showEmail&&sel.email&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>EMAIL</div><div style={{color:C.blue,fontSize:13,fontFamily:"DM Mono,monospace"}}>{sel.email}</div></div>}
            {priv.showPhone&&sel.phone&&<div style={{padding:"7px 0"}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>PHONE</div><div style={{color:C.white,fontSize:13}}>{sel.phone}</div></div>}
            {!priv.showEmail&&!priv.showPhone&&<p style={{color:C.muted,fontSize:12}}>Athlete contact info is private. Message them via the Messages tab.</p>}
          </div>
          {priv.showEmail&&sel.email&&<Btn variant="ghost" small onClick={()=>navigator.clipboard?.writeText(sel.email)} full>📋 Copy Email</Btn>}
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>👥</div><div style={{color:C.white,fontWeight:600,marginBottom:6}}>Select an athlete</div><div style={{color:C.muted,fontSize:13}}>View full profile and contact info based on their privacy settings.</div></Card>}
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════
export default function App(){
  useEffect(()=>{const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=DM+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap";if(!document.querySelector('link[href*="Barlow"]'))document.head.appendChild(l);},[]);

  const [termsAccepted,setTermsAccepted]=useStore("av_terms_accepted_v1",false);
  const [athletes,saveAthletes,aReady]=useStore("av_ath_v5",SEED_ATHLETES);
  const [coaches,saveCoaches,cReady]=useStore("av_coa_v5",SEED_COACHES);
  const [logs,saveLogs]=useStore("av_logs_v5",SEED_LOGS);
  const [settings,saveSettings]=useStore("av_set_v5",SEED_SET);
  const [messages,saveMessages]=useStore("av_msgs_v5",{});
  const [session,setSession]=useState(null);
  const [authReady,setAuthReady]=useState(false);
  const [recovering,setRecovering]=useState(false);
  const [oTab,setOTab]=useState("overview");
  const [aTab,setATab]=useState("home");
  const [coachTab,setCoachTab]=useState("home");

  const athletesRef=useRef(athletes); useEffect(()=>{athletesRef.current=athletes;},[athletes]);
  const coachesRef=useRef(coaches); useEffect(()=>{coachesRef.current=coaches;},[coaches]);

  function addLog(e){saveLogs(prev=>[{id:Date.now(),ts:stamp(),...e},...prev.slice(0,99)]);}

  const resolveSession=useCallback((supaUser)=>{
    if(!supaUser){setSession(null);return;}
    if(OWNER_EMAIL&&supaUser.email===OWNER_EMAIL){setSession({role:"owner",user:null});return;}
    const as=athletesRef.current;const cs=coachesRef.current;
    const a=as.find(x=>x.authId===supaUser.id||x.email===supaUser.email);
    if(a){setSession({role:"athlete",user:a});return;}
    const c=cs.find(x=>x.authId===supaUser.id||x.email===supaUser.email);
    if(c){setSession({role:"coach",user:c});return;}
    supabase.auth.signOut();
  },[]);

  useEffect(()=>{
    if(!aReady||!cReady)return;
    supabase.auth.getSession().then(({data:{session:s}})=>{
      if(s?.user)resolveSession(s.user);
      setAuthReady(true);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{
      if(event==="PASSWORD_RECOVERY"){setRecovering(true);return;}
      if(event==="SIGNED_OUT"){setSession(null);setRecovering(false);return;}
      if(s?.user)resolveSession(s.user);
    });
    return()=>subscription.unsubscribe();
  },[aReady,cReady,resolveSession]);

  async function logout(){addLog({action:"Logout",detail:session?.user?.name||"Owner",level:"info"});await supabase.auth.signOut();}

  if(!aReady||!cReady||!authReady)return(
    <div style={{minHeight:"100vh",background:C.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{color:C.gold,fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,letterSpacing:2}}>LOADING VAULT…</div>
    </div>
  );

  // ── STEP 1: Terms must be accepted before anything else ──
  if(!termsAccepted)return(
    <OnboardingTerms onAccept={()=>setTermsAccepted(true)}/>
  );

  // ── STEP 1b: Password recovery (user clicked reset link in email) ──
  if(recovering)return<ResetPassword onDone={()=>setRecovering(false)}/>;

  // ── STEP 2: Login ──
  if(!session)return<Login/>;

  const {role,user}=session;
  const liveAthlete=role==="athlete"?athletes.find(a=>user&&(a.id===user.id||a.authId===user.authId||a.email===user.email))||user:null;
  const liveCoach=role==="coach"?coaches.find(c=>user&&(c.id===user.id||c.authId===user.authId||c.email===user.email))||user:null;
  const me=liveAthlete||liveCoach;

  function unreadCount(uid){
    return Object.entries(messages).filter(([tid])=>tid.split("_").includes(String(uid))).reduce((s,[,msgs])=>s+msgs.filter(m=>m.senderId!==uid&&!m.read).length,0);
  }
  const msgCount=me?unreadCount(me.id):0;

  const STYLES=`*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${C.dark}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}select option{background:${C.dark};color:${C.white}}input::placeholder,textarea::placeholder{color:${C.muted}}`;

  if(role==="owner"){
    const ownerTabs={
      overview:<OOverview athletes={athletes} coaches={coaches} messages={messages}/>,
      athletes:<OAthletes athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>,
      coaches:<OCoaches coaches={coaches} saveCoaches={saveCoaches} addLog={addLog}/>,
      messages:<Messaging me={{id:0,name:"Owner",role:"owner",blockedIds:[]}} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages}/>,
      ai:<OAITools athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>,
      revenue:<ORevenue athletes={athletes}/>,
      outreach:<OOutreach athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>,
      siteconfig:<OSiteConfig settings={settings} saveSettings={saveSettings} addLog={addLog}/>,
      security:<OSecurity logs={logs} addLog={addLog} onLogout={logout}/>,
    };
    return<div style={{display:"flex",minHeight:"100vh",background:C.black,fontFamily:"'Sora',sans-serif"}}>
      <style>{STYLES}</style>
      <Sidebar navItems={O_NAV} tab={oTab} setTab={setOTab} user={null} role="owner" onLogout={logout} msgCount={0}/>
      <main style={{flex:1,padding:oTab==="messages"?"20px":"26px 30px",overflowY:"auto"}}>{ownerTabs[oTab]}</main>
    </div>;
  }

  if(role==="athlete"){
    const athleteTabs={
      home:     <AHome athlete={liveAthlete} settings={settings}/>,
      messages: <Messaging me={liveAthlete} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages}/>,
      schools:  <SchoolSearch athlete={liveAthlete}/>,
      content:  <AContent athlete={liveAthlete} saveAthletes={saveAthletes} athletes={athletes}/>,
      brands:   <ABrands athlete={liveAthlete} saveAthletes={saveAthletes} athletes={athletes}/>,
      coaches:  <ACoachNetwork athlete={liveAthlete} coaches={coaches} saveAthletes={saveAthletes}/>,
      money:    <AMoney athlete={liveAthlete}/>,
      nil:      <ANIL/>,
      timeline: <RecruitingTimeline/>,
      profile:  <AProfile athlete={liveAthlete} saveAthletes={saveAthletes}/>,
      privacy:  <PrivacySecurity user={liveAthlete} saveUsers={saveAthletes} role="athlete"/>,
      legal:    <LegalInApp/>,
      help:     <AHelp settings={settings}/>,
    };
    return<div style={{display:"flex",minHeight:"100vh",background:C.black,fontFamily:"'Sora',sans-serif"}}>
      <style>{STYLES}</style>
      <Sidebar navItems={A_NAV} tab={aTab} setTab={setATab} user={liveAthlete} role="athlete" onLogout={logout} msgCount={msgCount}/>
      <main style={{flex:1,padding:aTab==="messages"?"20px":"26px 30px",overflowY:"auto"}}>{athleteTabs[aTab]}</main>
    </div>;
  }

  // COACH
  const coachTabs={
    home:    <CoachHome coach={liveCoach}/>,
    messages:<Messaging me={liveCoach} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages}/>,
    athletes:<CoachAthletes athletes={athletes} coach={liveCoach}/>,
    nil:     <ANIL/>,
    profile: <CoachProfile coach={liveCoach} saveCoaches={saveCoaches}/>,
    privacy: <PrivacySecurity user={liveCoach} saveUsers={saveCoaches} role="coach"/>,
    legal:   <LegalInApp/>,
    help:    <AHelp settings={settings}/>,
  };
  return<div style={{display:"flex",minHeight:"100vh",background:C.black,fontFamily:"'Sora',sans-serif"}}>
    <style>{STYLES}</style>
    <Sidebar navItems={C_NAV} tab={coachTab} setTab={setCoachTab} user={liveCoach} role="coach" onLogout={logout} msgCount={msgCount}/>
    <main style={{flex:1,padding:coachTab==="messages"?"20px":"26px 30px",overflowY:"auto"}}>{coachTabs[coachTab]}</main>
  </div>;
}
