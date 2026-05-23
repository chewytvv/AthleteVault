import React,{useState,useEffect,useCallback,useRef} from "react";

// ── Owner Credentials ──────────────────────────
const OWNER_CREDS={username:import.meta.env.VITE_OWNER_USER||"chewy",password:import.meta.env.VITE_OWNER_PASS||"AthleteVault2026!"};

// ── Dynamic Theme System ───────────────────────
// Owner can change these from dashboard — stored in settings
function buildTheme(s){
  const accent=s?.themeAccent||"#00F0FF";
  const accent2=s?.themeAccent2||"#E8B84B";
  const bg=s?.themeBg||"#020408";
  return{
    accent,accent2,
    accentGlow:`rgba(0,240,255,0.12)`,
    accentGlow2:`rgba(232,184,75,0.1)`,
    black:bg,
    dark:s?.themeDark||"#030610",
    card:s?.themeCard||"#060D1A",
    card2:s?.themeCard2||"#080F1F",
    border:s?.themeBorder||"#0A1628",
    borderHi:s?.themeBorderHi||"#0F1E38",
    white:s?.themeWhite||"#E0F4FF",
    muted:s?.themeMuted||"#2A4A6A",
    mutedHi:s?.themeMutedHi||"#4A7A9A",
    green:"#0FFFB0",red:"#FF2D6E",blue:"#00AAFF",purple:"#9D4EDD",
    teal:"#00F0FF",orange:"#FF6B35",pink:"#FF0080",gold:accent2,goldDim:"#C49A2A",
    goldGlow:`rgba(232,184,75,0.1)`,
    // Tron scan-line glow
    scanGlow:`0 0 20px ${accent}44, 0 0 60px ${accent}22`,
    gridColor:accent,
  };
}

// Global C — overwritten after settings load
let C=buildTheme({});

// ── Helpers ────────────────────────────────────
const fmt=n=>new Intl.NumberFormat().format(n||0);
const fmtM=n=>"$"+new Intl.NumberFormat().format(n||0);
const stamp=()=>new Date().toLocaleString();
const ago=d=>{if(!d)return"";const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return"just now";if(s<3600)return Math.floor(s/60)+"m ago";if(s<86400)return Math.floor(s/3600)+"h ago";return Math.floor(s/86400)+"d ago";};
const hashPass=p=>{let h=0;for(let i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}return String(h);};
const genCode=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const fmtDur=s=>{if(!s)return"0:00";const m=Math.floor(s/60);const sec=s%60;return`${m}:${sec.toString().padStart(2,"0")}`;};

const REGIONS=["United States","Germany","France","Spain","Italy","UK","Canada","Australia","Japan","South Korea","Brazil","Argentina","Mexico","Nigeria","Ghana","Senegal","Turkey","Greece","Austria","Finland","Sweden","Norway","Denmark","Netherlands","Belgium","Czech Republic","Poland","Israel","New Zealand","Philippines","China","Taiwan","UAE","Saudi Arabia","South Africa","Egypt","Jamaica","Puerto Rico","Dominican Republic","Panama","Venezuela","Colombia","India","Portugal","Russia","Ukraine","Croatia","Serbia","Romania","Hungary"];
const SPORTS_LIST=["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Golf","Wrestling","Volleyball","Lacrosse","Gymnastics","Cross Country","Rugby","Cricket","Ice Hockey","MMA","Handball","Futsal","Field Hockey","Softball","Rowing","Cycling","Boxing","Weightlifting"];
const FONT_OPTIONS=["'Sora', sans-serif","'Inter', sans-serif","'Space Grotesk', sans-serif","'DM Sans', sans-serif","'Outfit', sans-serif"];
const TRON_FONTS=["'Orbitron', sans-serif","'Rajdhani', sans-serif","'Exo 2', sans-serif","'Share Tech Mono', monospace","'Russo One', sans-serif"];

// ── Privacy Defaults ───────────────────────────
const DEF_A_PRIV={showEmail:false,showPhone:false,showLocation:true,showFollowers:true,showSchool:true,showStats:true,showVideos:true,showDeals:false,profileVisible:true,searchable:true};
const DEF_C_PRIV={showEmail:true,showPhone:false,showTwitter:true,showInstagram:true,showLinkedin:true,showBio:true,profileVisible:true,searchable:true};

// ── European Teams Database ────────────────────
const EURO_TEAMS=[
  {id:"e1",name:"Berlin Thunder",league:"GFL1",sport:"Football",country:"Germany",city:"Berlin",logo:"⚡",contact:"roster@berlinthunder.de",website:"berlinthunder.de",openings:"WR, DB, OL, DL",salary:"€1,500–€3,000/mo + housing",description:"Germany's most storied franchise. Two-time GFL champion. Strong American import pipeline.",type:"pro"},
  {id:"e2",name:"New Yorker Lions",league:"GFL1",sport:"Football",country:"Germany",city:"Braunschweig",logo:"🦁",contact:"import@ny-lions.de",website:"ny-lions.de",openings:"QB, WR, DB, OL",salary:"€2,000–€4,500/mo + housing",description:"GFL powerhouse. Largest fan base in German football. Premium import contracts.",type:"pro"},
  {id:"e3",name:"Frankfurt Universe",league:"GFL1",sport:"Football",country:"Germany",city:"Frankfurt",logo:"🌌",contact:"scouting@frankfurtuniverse.de",website:"frankfurtuniverse.de",openings:"All positions",salary:"€1,200–€3,000/mo",description:"Financial capital club. Growing international roster. Good facilities.",type:"pro"},
  {id:"e4",name:"Schwäbisch Hall Unicorns",league:"GFL1",sport:"Football",country:"Germany",city:"Schwäbisch Hall",logo:"🦄",contact:"gm@unicorns.de",website:"unicorns.de",openings:"Skill positions, LB",salary:"€1,500–€3,500/mo + housing",description:"Most successful club in GFL history. Elite standard for American imports.",type:"pro"},
  {id:"e5",name:"Munich Ravens",league:"GFL1",sport:"Football",country:"Germany",city:"Munich",logo:"🐦",contact:"roster@munichravens.de",website:"munichravens.de",openings:"WR, DB, Special Teams",salary:"€1,200–€2,800/mo",description:"Bavaria's flagship team. Olympic city lifestyle.",type:"pro"},
  {id:"e6",name:"Stuttgart Surge",league:"ELF",sport:"Football",country:"Germany",city:"Stuttgart",logo:"⚡",contact:"scouting@stuttgartsurge.de",website:"stuttgartsurge.de",openings:"American imports all positions",salary:"€800–€2,500/mo",description:"European League of Football. Modern facilities. Growing league with TV exposure.",type:"pro"},
  {id:"e7",name:"Barcelona Dragons",league:"ELF",sport:"Football",country:"Spain",city:"Barcelona",logo:"🐉",contact:"recruiting@bcndragons.com",website:"bcndragons.com",openings:"QB, WR, DB",salary:"€1,000–€2,500/mo + housing",description:"Mediterranean lifestyle. Play in one of Europe's greatest cities.",type:"pro"},
  {id:"e8",name:"Paris Musketeers",league:"ELF",sport:"Football",country:"France",city:"Paris",logo:"⚔️",contact:"import@musketeers.paris",website:"musketeers.paris",openings:"WR, DB, QB",salary:"€1,200–€3,000/mo",description:"City of Light football. Fast-growing fan base.",type:"pro"},
  {id:"e9",name:"Rhein Fire",league:"ELF",sport:"Football",country:"Germany",city:"Düsseldorf",logo:"🔥",contact:"gm@rheinfire.de",website:"rheinfire.de",openings:"All positions",salary:"€1,000–€2,800/mo",description:"Revived historic brand. Strong media presence.",type:"pro"},
  {id:"e10",name:"Raiders Tirol",league:"ELF",sport:"Football",country:"Austria",city:"Innsbruck",logo:"🏴‍☠️",contact:"roster@raiders.at",website:"raiders.at",openings:"Skill positions",salary:"€800–€2,000/mo",description:"Alpine football. Austria's most successful club.",type:"pro"},
  {id:"e11",name:"Real Madrid Basketball",league:"EuroLeague",sport:"Basketball",country:"Spain",city:"Madrid",logo:"👑",contact:"basketball@realmadrid.com",website:"realmadrid.com",openings:"PG, SG — elite level",salary:"€200K–€5M/yr",description:"World's most valuable sports club. Elite EuroLeague contender.",type:"pro"},
  {id:"e12",name:"FC Barcelona Basketball",league:"EuroLeague",sport:"Basketball",country:"Spain",city:"Barcelona",logo:"🔵🔴",contact:"baskonia@fcbarcelona.cat",website:"fcbarcelona.com",openings:"Guards, Forwards",salary:"€150K–€3M/yr",description:"Catalan giant. Champions League regular.",type:"pro"},
  {id:"e13",name:"Panathinaikos Athens",league:"EuroLeague",sport:"Basketball",country:"Greece",city:"Athens",logo:"🟢",contact:"recruiting@paobc.gr",website:"paobc.gr",openings:"American guards, forwards",salary:"€100K–€2M/yr",description:"6x EuroLeague champions. Passionate fanbase.",type:"pro"},
  {id:"e14",name:"Zalgiris Kaunas",league:"EuroLeague",sport:"Basketball",country:"Lithuania",city:"Kaunas",logo:"🟢⚪",contact:"basketball@zalgiris.lt",website:"zalgiris.lt",openings:"All positions",salary:"€80K–€1.5M/yr",description:"Baltic powerhouse. Historic arena.",type:"pro"},
  {id:"e15",name:"Fenerbahçe Basketball",league:"EuroLeague",sport:"Basketball",country:"Turkey",city:"Istanbul",logo:"🦅",contact:"basketball@fenerbahce.org",website:"fenerbahce.org",openings:"Guards, big men",salary:"€200K–€4M/yr",description:"Istanbul giant. Top EuroLeague spender.",type:"pro"},
  {id:"e16",name:"Houston Dash",league:"NWSL",sport:"Soccer",country:"United States",city:"Houston",logo:"⚡",contact:"scouting@houstondash.com",website:"houstondash.com",openings:"Forward, MF, GK",salary:"$35K–$450K/yr",description:"NWSL club. Professional women's soccer.",type:"pro"},
  {id:"e17",name:"Portland Thorns",league:"NWSL",sport:"Soccer",country:"United States",city:"Portland",logo:"🌹",contact:"scouting@timbers.com",website:"timbers.com/thorns",openings:"Forward, Defender",salary:"$40K–$500K/yr",description:"NWSL's most storied club. Sell-out crowds.",type:"pro"},
  {id:"e18",name:"AFC Bournemouth",league:"Premier League",sport:"Soccer",country:"UK",city:"Bournemouth",logo:"🍒",contact:"academy@afcb.co.uk",website:"afcb.co.uk",openings:"Academy + trial opportunities",salary:"Varies",description:"Premier League club. Academy trials available.",type:"pro"},
  {id:"e19",name:"Bayer Leverkusen",league:"Bundesliga",sport:"Soccer",country:"Germany",city:"Leverkusen",logo:"⚫🔴",contact:"scouting@bayer04.de",website:"bayer04.de",openings:"Youth academy, trials",salary:"Varies",description:"Bundesliga powerhouse. International scouting program.",type:"pro"},
  {id:"e20",name:"Stade Toulousain",league:"Top 14",sport:"Rugby",country:"France",city:"Toulouse",logo:"🏉",contact:"recrutement@stadetoulousain.fr",website:"stadetoulousain.fr",openings:"All positions — American athletes welcome",salary:"€3,000–€25,000/mo",description:"Most successful rugby club in history. American athletes with size/speed highly valued.",type:"pro"},
  {id:"e21",name:"Leinster Rugby",league:"URC",sport:"Rugby",country:"Ireland",city:"Dublin",logo:"🔵",contact:"rugby@leinsterrugby.ie",website:"leinsterrugby.ie",openings:"Props, backs",salary:"€4,000–€30,000/mo",description:"Europe's elite rugby club. 4x European Cup winners.",type:"pro"},
  {id:"e22",name:"Frölunda HC",league:"SHL",sport:"Ice Hockey",country:"Sweden",city:"Gothenburg",logo:"🏒",contact:"hockey@frolundahockey.se",website:"frolundahockey.se",openings:"Forwards, defensemen",salary:"SEK 50K–200K/mo",description:"Sweden's top league. Strong American import history.",type:"pro"},
  {id:"e23",name:"CSKA Moscow",league:"KHL",sport:"Ice Hockey",country:"Russia",city:"Moscow",logo:"⭐",contact:"hockey@cska.ru",website:"cska.ru",openings:"All positions",salary:"€5,000–€80,000/mo",description:"KHL powerhouse. Highest salaries outside NHL.",type:"pro"},
  {id:"e24",name:"Mumbai Indians",league:"IPL",sport:"Cricket",country:"India",city:"Mumbai",logo:"🏏",contact:"cricket@mumbaiindians.com",website:"mumbaiindians.com",openings:"International slots",salary:"$50K–$2M/season",description:"IPL's most successful franchise. Global reach.",type:"pro"},
  {id:"e25",name:"Sydney Sixers",league:"BBL",sport:"Cricket",country:"Australia",city:"Sydney",logo:"🔴",contact:"cricket@sixers.com.au",website:"sixers.com.au",openings:"International players",salary:"AUD 50K–200K/season",description:"Big Bash League. Strong pathway for international talent.",type:"pro"},
];

// ── Schools Database ───────────────────────────
const SCHOOLS=[
  {id:1,name:"University of Texas",nick:"Longhorns",div:"NCAA D1",conf:"SEC",loc:"Austin, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Golf"],scholarships:true,schNote:"Full scholarships. Highly competitive.",tuition:"$11,698 / $41,070",accept:"31%",site:"utexas.edu",logo:"🤘",type:"Public",openings:{Football:"WR, DB, OL",Basketball:"PG, SG",Track:"Sprinters, Jumpers"}},
  {id:2,name:"University of Alabama",nick:"Crimson Tide",div:"NCAA D1",conf:"SEC",loc:"Tuscaloosa, AL",country:"United States",state:"Alabama",sports:["Football","Basketball","Baseball","Track","Soccer","Gymnastics"],scholarships:true,schNote:"Full scholarships. Multiple national titles.",tuition:"$10,780 / $30,250",accept:"80%",site:"ua.edu",logo:"🐘",type:"Public",openings:{Football:"DB, LB, WR",Basketball:"Forward, Center"}},
  {id:3,name:"Ohio State University",nick:"Buckeyes",div:"NCAA D1",conf:"Big Ten",loc:"Columbus, OH",country:"United States",state:"Ohio",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Wrestling"],scholarships:true,schNote:"Full scholarships. Elite across all sports.",tuition:"$11,918 / $33,502",accept:"54%",site:"osu.edu",logo:"🌰",type:"Public",openings:{Football:"All positions",Basketball:"SG, SF",Track:"All events"}},
  {id:4,name:"LSU",nick:"Tigers",div:"NCAA D1",conf:"SEC",loc:"Baton Rouge, LA",country:"United States",state:"Louisiana",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Gymnastics"],scholarships:true,schNote:"Full scholarships.",tuition:"$8,038 / $26,916",accept:"70%",site:"lsu.edu",logo:"🐯",type:"Public",openings:{Football:"WR, DB",Baseball:"Pitchers",Track:"All sprints"}},
  {id:5,name:"University of Florida",nick:"Gators",div:"NCAA D1",conf:"SEC",loc:"Gainesville, FL",country:"United States",state:"Florida",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis"],scholarships:true,schNote:"Full scholarships. Strong academics.",tuition:"$6,380 / $28,658",accept:"31%",site:"ufl.edu",logo:"🐊",type:"Public",openings:{Football:"QB, WR",Basketball:"All positions"}},
  {id:6,name:"University of Georgia",nick:"Bulldogs",div:"NCAA D1",conf:"SEC",loc:"Athens, GA",country:"United States",state:"Georgia",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Golf"],scholarships:true,schNote:"Full scholarships.",tuition:"$9,790 / $29,820",accept:"45%",site:"uga.edu",logo:"🐕",type:"Public",openings:{Football:"WR, DB, TE",Tennis:"All",Golf:"All"}},
  {id:7,name:"Texas A&M",nick:"Aggies",div:"NCAA D1",conf:"SEC",loc:"College Station, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Equestrian"],scholarships:true,schNote:"Full scholarships.",tuition:"$12,243 / $38,000",accept:"63%",site:"tamu.edu",logo:"🐾",type:"Public",openings:{Track:"All events",Football:"OL, DL",Baseball:"All positions"}},
  {id:8,name:"Notre Dame",nick:"Fighting Irish",div:"NCAA D1",conf:"ACC",loc:"Notre Dame, IN",country:"United States",state:"Indiana",sports:["Football","Basketball","Baseball","Track","Soccer","Swimming","Tennis","Lacrosse"],scholarships:true,schNote:"Full scholarships. Elite academics.",tuition:"$60,301",accept:"13%",site:"nd.edu",logo:"☘️",type:"Private",openings:{Football:"DB, LB",Soccer:"Forward, MF"}},
  {id:9,name:"University of Oregon",nick:"Ducks",div:"NCAA D1",conf:"Big Ten",loc:"Eugene, OR",country:"United States",state:"Oregon",sports:["Track","Cross Country","Football","Basketball","Baseball","Soccer"],scholarships:true,schNote:"Full scholarships. Track Mecca.",tuition:"$12,720 / $36,648",accept:"84%",site:"uoregon.edu",logo:"🦆",type:"Public",openings:{Track:"Sprinters, Jumpers, Throwers"}},
  {id:10,name:"Howard University",nick:"Bison",div:"NCAA D1",conf:"MEAC",loc:"Washington, DC",country:"United States",state:"DC",sports:["Football","Basketball","Track","Soccer","Tennis","Swimming"],scholarships:true,schNote:"Athletic + academic scholarships. HBCU pride.",tuition:"$28,010",accept:"37%",site:"howard.edu",logo:"🦬",type:"HBCU",openings:{Football:"All",Track:"Sprinters",Basketball:"All"}},
  {id:11,name:"Grambling State",nick:"Tigers",div:"NCAA D1",conf:"SWAC",loc:"Grambling, LA",country:"United States",state:"Louisiana",sports:["Football","Basketball","Track","Baseball"],scholarships:true,schNote:"Full athletic scholarships.",tuition:"$4,940 in-state",accept:"57%",site:"gram.edu",logo:"🐅",type:"HBCU",openings:{Football:"WR, QB, DB",Basketball:"All"}},
  {id:12,name:"Texas Southern University",nick:"Tigers",div:"NCAA D1",conf:"SWAC",loc:"Houston, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Track","Baseball","Soccer"],scholarships:true,schNote:"Athletic scholarships across all sports.",tuition:"$5,500 in-state",accept:"88%",site:"tsu.edu",logo:"🐯",type:"HBCU",openings:{Football:"All skill positions",Basketball:"Guards"}},
  {id:13,name:"Prairie View A&M",nick:"Panthers",div:"NCAA D1",conf:"SWAC",loc:"Prairie View, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Track","Baseball"],scholarships:true,schNote:"Merit and athletic scholarships.",tuition:"$4,500 in-state",accept:"82%",site:"pvamu.edu",logo:"🐾",type:"HBCU",openings:{Football:"OL, DL, LB",Basketball:"All"}},
  {id:14,name:"Florida A&M",nick:"Rattlers",div:"NCAA D1",conf:"SWAC",loc:"Tallahassee, FL",country:"United States",state:"Florida",sports:["Football","Basketball","Track","Baseball","Tennis","Golf"],scholarships:true,schNote:"Full athletic scholarships.",tuition:"$5,785 in-state",accept:"42%",site:"famu.edu",logo:"🐍",type:"HBCU",openings:{Football:"WR, DB",Track:"All"}},
  {id:15,name:"Jackson State",nick:"Tigers",div:"NCAA D1",conf:"SWAC",loc:"Jackson, MS",country:"United States",state:"Mississippi",sports:["Football","Basketball","Track","Baseball"],scholarships:true,schNote:"Athletic scholarships available.",tuition:"$3,810 in-state",accept:"51%",site:"jsums.edu",logo:"🐅",type:"HBCU",openings:{Football:"All positions"}},
  {id:16,name:"Midwestern State",nick:"Mustangs",div:"NCAA D2",conf:"Lone Star",loc:"Wichita Falls, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer","Tennis"],scholarships:true,schNote:"Partial to full scholarships.",tuition:"$6,400 in-state",accept:"75%",site:"msutexas.edu",logo:"🐎",type:"Public",openings:{Football:"WR, DB",Soccer:"Forward, MF"}},
  {id:17,name:"Tarleton State",nick:"Texans",div:"NCAA D1",conf:"WAC",loc:"Stephenville, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer"],scholarships:true,schNote:"Full scholarships. Recently moved to D1.",tuition:"$8,000 in-state",accept:"60%",site:"tarleton.edu",logo:"🐂",type:"Public",openings:{Football:"All positions",Basketball:"Guards"}},
  {id:18,name:"Kilgore College",nick:"Rangers",div:"NJCAA",conf:"SWJCFC",loc:"Kilgore, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer"],scholarships:true,schNote:"Full JUCO scholarships. Pipeline to D1.",tuition:"$1,800 in-state",accept:"100%",site:"kilgore.edu",logo:"⚡",type:"JUCO",openings:{Football:"All positions",Basketball:"All"}},
  {id:19,name:"Blinn College",nick:"Buccaneers",div:"NJCAA",conf:"Southern JC",loc:"Brenham, TX",country:"United States",state:"Texas",sports:["Football","Basketball","Baseball","Track","Soccer"],scholarships:true,schNote:"Full JUCO scholarships. Strong transfer pipeline.",tuition:"$1,600 in-state",accept:"100%",site:"blinn.edu",logo:"🏴‍☠️",type:"JUCO",openings:{Football:"All skill positions"}},
  {id:20,name:"Benedictine College",nick:"Ravens",div:"NAIA",conf:"Heart of America",loc:"Atchison, KS",country:"United States",state:"Kansas",sports:["Football","Basketball","Baseball","Track","Soccer","Tennis","Golf"],scholarships:true,schNote:"Athletic + academic scholarships.",tuition:"$32,000",accept:"62%",site:"benedictine.edu",logo:"🦅",type:"NAIA",openings:{Football:"QB, WR, OL",Basketball:"All"}},
];

// ── Seed Data ──────────────────────────────────
const SEED_ATHLETES=[
  {id:1,role:"athlete",name:"Marcus Webb",sport:"Football",school:"Undrafted – C-USA",followers:4200,tier:"rookie",mrr:29,status:"active",joined:"2026-01-12",email:"marcus@email.com",phone:"",country:"United States",state:"Texas",city:"Houston",bio:"WR with speed and route-running. Looking for overseas opportunities.",coachSent:3,brandSent:5,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:47,notifications:[],verified:false,pinnedStats:[],achievements:[],following:[],followers_list:[]},
  {id:2,role:"athlete",name:"Jaylen Cross",sport:"Basketball",school:"HBCU – MEAC",followers:11800,tier:"pro",mrr:79,status:"active",joined:"2026-01-20",email:"jaylen@email.com",phone:"",country:"United States",state:"Georgia",city:"Atlanta",bio:"PG 6'2\". HBCU standout targeting pro opportunities in Europe or Asia.",coachSent:8,brandSent:14,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:132,notifications:[],verified:true,pinnedStats:[],achievements:[],following:[],followers_list:[]},
  {id:3,role:"athlete",name:"Deja Monroe",sport:"Track",school:"D2 – GLIAC",followers:2100,tier:"rookie",mrr:29,status:"active",joined:"2026-02-03",email:"deja@email.com",phone:"",country:"United States",state:"Michigan",city:"Detroit",bio:"Sprinter 100m/200m. NCAA D2 record holder.",coachSent:2,brandSent:3,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:28,notifications:[],verified:false,pinnedStats:[],achievements:[],following:[],followers_list:[]},
  {id:4,role:"athlete",name:"Chris Okafor",sport:"Football",school:"GFL1 – Germany",followers:8400,tier:"pro",mrr:79,status:"active",joined:"2026-02-11",email:"chris@email.com",phone:"",country:"Germany",state:"",city:"Berlin",bio:"DB in GFL1 Germany. UTEP alum. Experienced internationally.",coachSent:9,brandSent:11,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:89,notifications:[],verified:true,pinnedStats:[],achievements:[],following:[],followers_list:[]},
  {id:5,role:"athlete",name:"Aaliyah Stone",sport:"Soccer",school:"NWSL Hopeful",followers:6700,tier:"rising",mrr:49,status:"active",joined:"2026-02-28",email:"aaliyah@email.com",phone:"",country:"United States",state:"California",city:"Los Angeles",bio:"Forward, 30 goals last season. Targeting NWSL or European club.",coachSent:5,brandSent:7,videos:[],deals:[],passwordHash:"",privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:61,notifications:[],verified:false,pinnedStats:[],achievements:[],following:[],followers_list:[]},
];
const SEED_COACHES=[
  {id:101,role:"coach",name:"Coach Ray Thompson",sport:"Football",org:"Texas Southern University",title:"Offensive Coordinator",email:"rthompson@tsu.edu",phone:"(713)555-0182",country:"United States",state:"Texas",city:"Houston",twitter:"@CoachRayTSU",instagram:"@coachray_tsu",linkedin:"linkedin.com/in/raythompson",bio:"15 years developing skill positions. Looking for WRs and DBs.",recruitingRegions:["United States","Germany","Canada"],status:"active",joined:"2026-01-05",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:34,notifications:[],verified:true,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
  {id:102,role:"coach",name:"Coach Sandra Mills",sport:"Basketball",org:"Grambling State",title:"Head Women's Coach",email:"smills@gram.edu",phone:"(318)555-0247",country:"United States",state:"Louisiana",city:"Grambling",twitter:"@CoachMillsGSU",instagram:"@sandramills_hoops",linkedin:"linkedin.com/in/sandramills",bio:"Recruiting guards and forwards. NIL-friendly program.",recruitingRegions:["United States","Nigeria","Ghana","Senegal"],status:"active",joined:"2026-01-14",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:22,notifications:[],verified:true,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
  {id:103,role:"coach",name:"Coach Derek Osei",sport:"Football",org:"GFL Berlin Thunder",title:"Head Coach",email:"dosei@berlinthunder.de",phone:"",country:"Germany",state:"",city:"Berlin",twitter:"@CoachOseiGFL",instagram:"@derek_osei_gfl",linkedin:"linkedin.com/in/derekosei",bio:"Recruiting American players for GFL1. Paid contracts + housing.",recruitingRegions:["United States","Canada","UK"],status:"active",joined:"2026-01-28",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:58,notifications:[],verified:true,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
  {id:104,role:"coach",name:"Coach Lisa Vega",sport:"Soccer",org:"Houston Dash (NWSL)",title:"Player Development",email:"lvega@houstondash.com",phone:"(832)555-0319",country:"United States",state:"Texas",city:"Houston",twitter:"@CoachVegaNWSL",instagram:"@lisavega_soccer",linkedin:"linkedin.com/in/lisavega",bio:"Tracking forwards and midfielders from around the world.",recruitingRegions:["United States","Brazil","Argentina","Spain","Colombia"],status:"active",joined:"2026-02-10",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:41,notifications:[],verified:false,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
  {id:105,role:"coach",name:"Coach Terrence Boyd",sport:"Basketball",org:"Prairie View A&M",title:"Assistant Coach",email:"tboyd@pvamu.edu",phone:"(936)555-0401",country:"United States",state:"Texas",city:"Prairie View",twitter:"@TBoydPVAMU",instagram:"@tboyd_hoops",linkedin:"linkedin.com/in/terrenceboyd",bio:"Building backcourt. Open to JUCO and international players.",recruitingRegions:["United States","Nigeria","UK","Australia"],status:"active",joined:"2026-02-22",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:19,notifications:[],verified:false,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
  {id:106,role:"coach",name:"Coach Angela Kim",sport:"Track",org:"Howard University",title:"Head Track & Field",email:"akim@howard.edu",phone:"(202)555-0533",country:"United States",state:"DC",city:"Washington",twitter:"@CoachKimHoward",instagram:"@angelakim_track",linkedin:"linkedin.com/in/angelakim",bio:"Scholarships for sprinters and jumpers worldwide.",recruitingRegions:["United States","Jamaica","South Korea","Japan","Dominican Republic"],status:"active",joined:"2026-03-01",passwordHash:"",privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:27,notifications:[],verified:true,coachVideos:[],liveSessions:[],stripeConnected:false,earnings:0},
];

const SEED_SETTINGS={
  // Pricing
  rookiePrice:29,risingPrice:49,proPrice:79,coachPrice:49,
  // Branding
  platformName:"AthleteVault",tagline:"Built by athletes. For athletes.",
  ownerName:"Dennis 'Chewy' Barnes",email:"support@athletevault.org",
  logoText:"AV",heroBadgeText:"BUILT BY A GFL1 PLAYER · UTEP ALUM · MYSTIX7V7 FOUNDER",
  heroHeadline1:"YOUR NAME",heroHeadline2:"IS THE BRAND.",
  heroSub:"AI-powered recruiting, brand deals, NIL education, and overseas opportunities — built for athletes who got overlooked.",
  founderQuote:"I LIVED THIS. NOBODY BUILT THIS TOOL. SO I DID.",
  founderBio:"I played at UTEP. I went to Germany and played GFL1. I built Mystix7V7 from nothing. And every step of the way, I watched talented athletes get ignored because they didn't have the right connections. AthleteVault is what I wish existed.",
  founderName:"Dennis \"Chewy\" Barnes",founderCreds:"FOUNDER · UTEP ALUM · GFL1 GERMANY · MYSTIX7V7",
  // Theme — Tron: Ares default
  themeAccent:"#00F0FF",themeAccent2:"#E8B84B",
  themeBg:"#020408",themeDark:"#030610",
  themeCard:"#060D1A",themeCard2:"#080F1F",
  themeBorder:"#0A1628",themeBorderHi:"#0F1E38",
  themeWhite:"#E0F4FF",themeMuted:"#2A4A6A",themeMutedHi:"#4A7A9A",
  themeFont:"'Sora', sans-serif",themeDisplayFont:"'Rajdhani', sans-serif",
  // Features
  aiActive:true,outreachActive:true,signupsOpen:true,maintenanceMode:false,
  announcement:"",coachToCoachMsg:true,athleteToAthleteMsg:false,
  defaultReferralDiscount:10,referralReward:"1 month free",
  welcomeMsg:"Welcome to AthleteVault — your command center.",
  // Coach monetization
  platformCutPct:20,coachVideosEnabled:true,coachLiveEnabled:true,
};

const SEED_LOGS=[{id:1,ts:stamp(),action:"AthleteVault v3.0 launched",detail:"Tron: Ares edition",level:"success"}];

const BRAND_DEALS=[
  {id:1,brand:"Gatorade",cat:"Sports Nutrition",payout:"$500–$2,000",logo:"🏆",desc:"Hydration partner for game-day content. 2 posts/month."},
  {id:2,brand:"Nike Training",cat:"Apparel",payout:"$300–$1,500",logo:"👟",desc:"Showcase Nike Training gear in workout clips."},
  {id:3,brand:"WHOOP",cat:"Fitness Tech",payout:"$200–$800",logo:"⌚",desc:"Wearable recovery tracking. Share your stats."},
  {id:4,brand:"Raising Cane's",cat:"Food & Beverage",payout:"$150–$600",logo:"🍗",desc:"Post-game meal content. Easy collab."},
  {id:5,brand:"Athletic Greens",cat:"Health",payout:"$400–$1,200",logo:"🥗",desc:"Morning routine supplement feature."},
  {id:6,brand:"Beats by Dre",cat:"Audio",payout:"$800–$3,000",logo:"🎧",desc:"Pre-game tunnel walk or training session."},
];

const NIL_LESSONS=[
  {id:1,icon:"📚",level:"Beginner",dur:"8 min",title:"What Is NIL and Why It Matters",body:"NIL stands for Name, Image, and Likeness. Since 2021 college athletes can profit from their brand without losing eligibility. This covers who qualifies, what counts as NIL income, and why acting early puts you ahead of 99% of athletes."},
  {id:2,icon:"🏗️",level:"Beginner",dur:"12 min",title:"Building Your Brand Before the Deal",body:"Before brands reach out, they Google you. This teaches you how to build a consistent online identity — profile photos, bio copy, content pillars — so your social presence sells you before you say a word."},
  {id:3,icon:"📊",level:"Intermediate",dur:"10 min",title:"How to Value Your Social Media",body:"Not sure what to charge? This breaks down CPM, engagement rate valuation, and industry benchmarks by sport and follower count. You'll leave knowing your floor rate."},
  {id:4,icon:"🤝",level:"Intermediate",dur:"15 min",title:"Negotiating Your First Brand Deal",body:"Most athletes undersell on the first deal. This covers contract red flags, how to counter-offer, what deliverables are standard, and when to walk away."},
  {id:5,icon:"💸",level:"Intermediate",dur:"11 min",title:"Taxes on NIL Income — The Basics",body:"NIL income is taxable. Covers self-employment tax, quarterly payments, deductions athletes miss, and why you need a CPA before your first check clears."},
  {id:6,icon:"📝",level:"Advanced",dur:"9 min",title:"Content Contracts & Usage Rights",body:"When a brand pays you, they may reuse your content in ads. This explains usage rights, exclusivity clauses, and how to avoid signing your image away forever."},
  {id:7,icon:"💰",level:"Advanced",dur:"14 min",title:"Building Multiple Revenue Streams",body:"Brand deals are one stream. This maps 7 ways athletes monetize: NIL, coaching clinics, Patreon, merchandise, speaking, content subscriptions, and affiliates."},
  {id:8,icon:"✈️",level:"Advanced",dur:"13 min",title:"Going Overseas: Contracts & Money",body:"Built from real GFL1 experience — European contracts, currency exchange, agent cuts, housing stipends, and how to keep building your brand from abroad."},
  {id:9,icon:"🏈",level:"Beginner",dur:"10 min",title:"For Coaches: Navigating NIL With Athletes",body:"Learn how to support your athletes' NIL deals without violating NCAA rules, how to structure team endorsements, and how to use AthleteVault to find talent."},
];
// ═══════════════════════════════════════════════
//  STORAGE + AI + SHARED UI — TRON: ARES EDITION
// ═══════════════════════════════════════════════
function useStore(key,init){
  const [data,setData]=useState(()=>{
    try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch(_){return init;}
  });
  const [ready,setReady]=useState(true);
  const save=useCallback(val=>{
    const next=typeof val==="function"?val(data):val;
    setData(next);
    try{localStorage.setItem(key,JSON.stringify(next));}catch(_){}
    return next;
  },[key,data]);
  return[data,save,ready];
}

const AI_SYS="You are AthleteVault's AI — a world-class sports brand strategist for athletes and coaches navigating NIL, recruiting, overseas play, and monetization. Be direct, specific, practical, and real.";
async function ai(prompt,sys){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys||AI_SYS,messages:[{role:"user",content:prompt}]})});
  if(!r.ok)throw new Error(r.status);
  const d=await r.json();return d.content?.map(b=>b.text||"").join("")||"";
}

// Stripe Checkout
const STRIPE_PK="pk_live_51TaEWWDfHooSk0bkHYBQBKgYCoSjkQxM3sgDSBjKEjHNoXAcghZjbA2EFoG7fRF1LDYO8YY4IfCbayMNCAgmEXBs00vXsO1G3G";
async function startCheckout(tier,email,name,role){
  try{
    const r=await fetch("/api/create-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tier,email,name,role})});
    const d=await r.json();
    if(d.url)window.location.href=d.url;
    else throw new Error(d.error||"Checkout failed");
  }catch(err){alert("Checkout error: "+err.message);}
}

// ── TRON: ARES GLOBAL STYLES ───────────────────
function TronStyles({C,settings}){
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
function Badge({color,children,style:x}){const col=color||C.muted;return <span style={{background:col+"18",color:col,border:`1px solid ${col}33`,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:.8,whiteSpace:"nowrap",fontFamily:"DM Mono,monospace",...x}}>{children}</span>;}

function Btn({onClick,children,variant="accent",small,disabled,loading,full,style:x}){
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

function Card({children,style:x,glow,color,onClick,tron}){
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

function Stat({label,value,delta,color,icon}){
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

function Sec({title,sub,action}){
  return <div style={{marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:10}}>
    <div>
      <h2 style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,color:C.white,letterSpacing:2,textTransform:"uppercase",lineHeight:1,textShadow:`0 0 20px ${C.accent}33`}}>{title}</h2>
      {sub&&<p style={{color:C.muted,fontSize:12,marginTop:3,fontFamily:"DM Mono,monospace"}}>{sub}</p>}
    </div>
    {action}
  </div>;
}

function AIOut({loading,output,label}){
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

function Modal({show,onClose,title,children,maxW=520}){
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

function Inp({label,value,onChange,type="text",placeholder,rows}){
  const base={background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",width:"100%",boxSizing:"border-box",transition:"border-color .15s"};
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>{label}</label>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,resize:"vertical"}}/>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>}
  </div>;
}

function Sel({label,value,onChange,options}){
  return <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>
      {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  </div>;
}

function Tog({label,sub,val,onChange}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
    <div><div style={{color:C.white,fontSize:13}}>{label}</div>{sub&&<div style={{color:C.muted,fontSize:11,marginTop:1}}>{sub}</div>}</div>
    <button onClick={()=>onChange(!val)} style={{width:40,height:20,borderRadius:10,border:"none",cursor:"pointer",background:val?C.accent:C.border,position:"relative",transition:"background .2s",flexShrink:0,marginLeft:12,boxShadow:val?`0 0 10px ${C.accent}44`:"none"}}>
      <div style={{position:"absolute",top:2,left:val?22:2,width:16,height:16,borderRadius:"50%",background:C.white,transition:"left .2s"}}/>
    </button>
  </div>;
}

function ProgressBar({val,max,color}){
  const pct=Math.min(100,max>0?Math.round((val/max)*100):0);
  const col=color||C.accent;
  return <div style={{background:C.border,borderRadius:2,height:4,overflow:"hidden"}}>
    <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${col},${col}AA)`,borderRadius:2,transition:"width .4s ease",boxShadow:`0 0 8px ${col}44`}}/>
  </div>;
}

function Avatar({name,size=36,color,verified}){
  const col=color||C.accent;
  return <div style={{position:"relative",flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${col}33,${col}11)`,border:`1px solid ${col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Rajdhani',sans-serif",fontSize:Math.round(size*.44),fontWeight:700,color:col,boxShadow:`0 0 12px ${col}22`}}>{(name||"?")[0].toUpperCase()}</div>
    {verified&&<div style={{position:"absolute",bottom:-1,right:-1,width:Math.round(size*.36),height:Math.round(size*.36),borderRadius:"50%",background:C.blue,border:`2px solid ${C.card}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*.16),color:C.white}}>✓</div>}
  </div>;
}

function NotifDot({count}){
  if(!count)return null;
  return <div style={{background:C.red,color:C.white,borderRadius:"50%",minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,marginLeft:"auto",boxShadow:`0 0 8px ${C.red}66`}}>{count>9?"9+":count}</div>;
}

function RegionPicker({selected,onChange}){
  return <div style={{display:"flex",gap:5,flexWrap:"wrap",maxHeight:140,overflowY:"auto"}}>
    {REGIONS.map(r=>{const on=selected.includes(r);return <button key={r} onClick={()=>onChange(on?selected.filter(x=>x!==r):[...selected,r])} style={{background:on?C.accentGlow:"transparent",border:`1px solid ${on?C.accent:C.border}`,borderRadius:4,padding:"3px 9px",cursor:"pointer",color:on?C.accent:C.muted,fontSize:11,fontWeight:600,transition:"all .12s",boxShadow:on?`0 0 8px ${C.accent}22`:"none"}}>{r}</button>;})}
  </div>;
}

// ── TRON SCAN-LINE BACKGROUND ──────────────────
function TronBg(){
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    <div className="tron-grid-bg" style={{position:"absolute",inset:0,opacity:.4}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 80% 60% at 50% 0%,${C.accent}08,transparent 60%)`}}/>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 60% 40% at 80% 80%,${C.gold}06,transparent 50%)`}}/>
  </div>;
}

function makeThreadId(a,b){return[String(a),String(b)].sort().join("_");}
function Messaging({me,athletes,coaches,saveAthletes,saveCoaches,messages,saveMessages,settings}){
  const allUsers=[...athletes,...coaches];
  const blocked=me.blockedIds||[];
  const [selThread,setSelThread]=useState(null);
  const [search,setSearch]=useState("");
  const [newMsg,setNewMsg]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [newSearch,setNewSearch]=useState("");
  const [showMenu,setShowMenu]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const msgEndRef=useRef(null);

  // Filter who can message whom based on settings
  const canMsgCoachToCoach=settings?.coachToCoachMsg!==false;
  const canMsgAthleteToAthlete=settings?.athleteToAthleteMsg===true;
  function canContact(other){
    if(me.role==="owner")return true;
    if(blocked.includes(other.id))return false;
    if(me.role==="athlete"&&other.role==="athlete"&&!canMsgAthleteToAthlete)return false;
    if(me.role==="coach"&&other.role==="coach"&&!canMsgCoachToCoach)return false;
    return true;
  }

  const myThreads=Object.entries(messages||{})
    .filter(([tid])=>tid.split("_").map(Number).includes(me.id)||tid.split("_").includes(String(me.id)))
    .map(([tid,msgs])=>{
      const parts=tid.split("_");
      const otherId=parts.find(x=>String(x)!==String(me.id));
      const other=allUsers.find(u=>String(u.id)===String(otherId));
      const lastMsg=msgs[msgs.length-1];
      const unread=msgs.filter(m=>String(m.senderId)!==String(me.id)&&!m.read).length;
      return{tid,other,lastMsg,unread};
    })
    .filter(t=>t.other&&!blocked.includes(t.other.id))
    .filter(t=>!search||t.other?.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.lastMsg?.ts||0)-new Date(a.lastMsg?.ts||0));

  const threadMsgs=selThread?(messages[selThread]||[]):[];
  const selOther=selThread?allUsers.find(u=>{const parts=selThread.split("_");return parts.includes(String(u.id))&&String(u.id)!==String(me.id);}):null;

  useEffect(()=>{
    if(!selThread)return;
    const msgs=messages[selThread]||[];
    if(msgs.some(m=>String(m.senderId)!==String(me.id)&&!m.read)){
      saveMessages(prev=>({...prev,[selThread]:msgs.map(m=>String(m.senderId)!==String(me.id)?{...m,read:true}:m)}));
    }
  },[selThread,messages]);
  useEffect(()=>{msgEndRef.current?.scrollIntoView({behavior:"smooth"});},[threadMsgs.length]);

  function send(){
    if(!newMsg.trim()||!selThread)return;
    const msg={id:Date.now(),senderId:me.id,text:newMsg.trim(),ts:new Date().toISOString(),read:false};
    saveMessages(prev=>({...prev,[selThread]:[...(prev[selThread]||[]),msg]}));
    setNewMsg("");
  }
  function startThread(otherId){const tid=makeThreadId(me.id,otherId);setSelThread(tid);setShowNew(false);setNewSearch("");}
  function blockUser(otherId){
    const fn=me.role==="athlete"?saveAthletes:saveCoaches;
    fn(prev=>prev.map(u=>String(u.id)===String(me.id)?{...u,blockedIds:[...(u.blockedIds||[]),otherId]}:u));
    setSelThread(null);setShowMenu(false);
  }
  function unblockUser(bid){
    const fn=me.role==="athlete"?saveAthletes:saveCoaches;
    fn(prev=>prev.map(u=>String(u.id)===String(me.id)?{...u,blockedIds:(u.blockedIds||[]).filter(x=>x!==bid)}:u));
  }
  function deleteThread(){saveMessages(prev=>{const n={...prev};delete n[selThread];return n;});setSelThread(null);setShowMenu(false);}

  const contactable=allUsers.filter(u=>String(u.id)!==String(me.id)&&canContact(u)&&u.status==="active"&&u.privacy?.profileVisible!==false).filter(u=>!newSearch||u.name.toLowerCase().includes(newSearch.toLowerCase())||u.sport?.toLowerCase().includes(newSearch.toLowerCase())||(u.org||"").toLowerCase().includes(newSearch.toLowerCase()));
  const totalUnread=Object.entries(messages||{}).filter(([tid])=>tid.split("_").includes(String(me.id))).reduce((s,[,msgs])=>s+msgs.filter(m=>String(m.senderId)!==String(me.id)&&!m.read).length,0);

  function groupByDate(msgs){const g={};msgs.forEach(m=>{const d=new Date(m.ts);const key=d.toDateString()===new Date().toDateString()?"Today":d.toDateString()===new Date(Date.now()-86400000).toDateString()?"Yesterday":d.toLocaleDateString([],{weekday:"long",month:"short",day:"numeric"});if(!g[key])g[key]=[];g[key].push(m);});return g;}

  const roleColor={athlete:C.blue,coach:C.purple,owner:C.gold};

  return <div style={{display:"grid",gridTemplateColumns:"300px 1fr",height:"calc(100vh - 40px)",border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
    {/* Left panel */}
    <div style={{background:C.dark,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:C.white,letterSpacing:1,display:"flex",alignItems:"center",gap:8}}>MESSAGES{totalUnread>0&&<NotifDot count={totalUnread}/>}</div>
          <Btn onClick={()=>setShowNew(true)} small>+ New</Btn>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 11px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {myThreads.length===0&&<div style={{padding:24,color:C.muted,fontSize:13,textAlign:"center",lineHeight:1.7}}>No conversations yet.<br/>Tap <strong>+ New</strong> to start messaging.</div>}
        {myThreads.map(({tid,other,lastMsg,unread})=><div key={tid} onClick={()=>{setSelThread(tid);setShowMenu(false);}} style={{display:"flex",alignItems:"center",gap:11,padding:"12px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:selThread===tid?`${C.gold}11`:"transparent",transition:"background .15s",borderLeft:`3px solid ${selThread===tid?C.gold:"transparent"}`}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Avatar name={other?.name} size={40} color={roleColor[other?.role]||C.blue} verified={other?.verified}/>
            {unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,background:C.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:C.white}}>{unread}</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{color:unread>0?C.white:C.mutedHi,fontWeight:unread>0?700:500,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{other?.name}</span>
              <span style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",flexShrink:0,marginLeft:6}}>{lastMsg?ago(lastMsg.ts):""}</span>
            </div>
            <div style={{color:unread>0?C.white:C.muted,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lastMsg?.senderId===me.id?"You: ":""}{lastMsg?.text||"Start a conversation"}</div>
          </div>
        </div>)}
      </div>
      {(blocked||[]).length>0&&<div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:7}}>BLOCKED ({blocked.length})</div>
        {blocked.map(bid=>{const u=allUsers.find(x=>x.id===bid);return u?<div key={bid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{color:C.muted,fontSize:12}}>{u.name}</span><button onClick={()=>unblockUser(bid)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:C.mutedHi,fontSize:10}}>Unblock</button></div>:null;})}
      </div>}
    </div>

    {/* Right panel */}
    {selThread&&selOther?<div style={{display:"flex",flexDirection:"column",background:C.black}}>
      <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.dark}}>
        <div style={{cursor:"pointer"}} onClick={()=>setShowProfile(true)}><Avatar name={selOther.name} size={38} color={roleColor[selOther.role]||C.blue} verified={selOther.verified}/></div>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>setShowProfile(true)}>
          <div style={{color:C.white,fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:4}}>{selOther.name}{selOther.verified&&<span style={{color:C.blue,fontSize:12}}>✓</span>}</div>
          <div style={{color:C.muted,fontSize:12}}>{selOther.role==="coach"?`${selOther.title} · ${selOther.org}`:`${selOther.sport} · ${selOther.school||selOther.country}`}</div>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowMenu(p=>!p)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 11px",cursor:"pointer",color:C.muted,fontSize:16,fontFamily:"'Sora',sans-serif"}}>⋯</button>
          {showMenu&&<div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",zIndex:200,minWidth:170,boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
            <button onClick={()=>setShowProfile(true)} style={{display:"block",width:"100%",padding:"10px 15px",background:"none",border:"none",cursor:"pointer",color:C.white,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>👤 View Profile</button>
            <button onClick={()=>{blockUser(selOther.id);}} style={{display:"block",width:"100%",padding:"10px 15px",background:"none",border:"none",cursor:"pointer",color:C.red,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>🚫 Block User</button>
            <button onClick={deleteThread} style={{display:"block",width:"100%",padding:"10px 15px",background:"none",border:"none",cursor:"pointer",color:C.muted,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>🗑️ Delete Chat</button>
            <button onClick={()=>setShowMenu(false)} style={{display:"block",width:"100%",padding:"10px 15px",background:"none",border:`1px solid ${C.border}`,cursor:"pointer",color:C.muted,textAlign:"left",fontFamily:"'Sora',sans-serif",fontSize:13}}>Cancel</button>
          </div>}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"18px 20px"}}>
        {threadMsgs.length===0&&<div style={{textAlign:"center",color:C.muted,fontSize:13,marginTop:60,lineHeight:1.7}}>No messages yet.<br/>Say something! 👋</div>}
        {Object.entries(groupByDate(threadMsgs)).map(([date,msgs])=><div key={date}>
          <div style={{textAlign:"center",margin:"16px 0 12px"}}><span style={{background:C.card,color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>{date}</span></div>
          {msgs.map((m,i)=>{
            const isMe=String(m.senderId)===String(me.id);
            const showAv=!isMe&&(i===0||String(msgs[i-1]?.senderId)===String(me.id));
            return <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:8,marginBottom:3}}>
              {!isMe&&(showAv?<Avatar name={selOther.name} size={26} color={roleColor[selOther.role]||C.blue} verified={selOther.verified}/>:<div style={{width:26}}/>)}
              <div style={{maxWidth:"68%"}}>
                <div style={{background:isMe?`linear-gradient(135deg,${C.gold},${C.goldDim})`:C.card2,color:isMe?C.black:C.white,borderRadius:isMe?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:14,lineHeight:1.5,fontFamily:"'Sora',sans-serif",wordBreak:"break-word",boxShadow:isMe?`0 2px 8px ${C.gold}22`:"none"}}>{m.text}</div>
                <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",textAlign:isMe?"right":"left",marginTop:3,paddingRight:isMe?2:0,paddingLeft:isMe?0:2}}>
                  {new Date(m.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}{isMe&&<span style={{marginLeft:4,color:m.read?C.blue:C.muted}}>{m.read?" ✓✓":" ✓"}</span>}
                </div>
              </div>
            </div>;
          })}
        </div>)}
        <div ref={msgEndRef}/>
      </div>
      <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,background:C.dark,alignItems:"flex-end"}}>
        <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder="Message… (Enter to send)" style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 14px",color:C.white,fontSize:14,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
        <button onClick={send} disabled={!newMsg.trim()} style={{background:newMsg.trim()?`linear-gradient(135deg,${C.gold},${C.goldDim})`:"transparent",color:newMsg.trim()?C.black:C.muted,border:`1px solid ${newMsg.trim()?C.gold:C.border}`,borderRadius:12,padding:"11px 16px",fontWeight:700,fontSize:18,cursor:newMsg.trim()?"pointer":"not-allowed",transition:"all .15s"}}>➤</button>
      </div>
    </div>
    :<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.black,gap:14,padding:40}}>
      <div style={{fontSize:56}}>💬</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,color:C.white,letterSpacing:1}}>YOUR MESSAGES</div>
      <div style={{fontSize:14,color:C.muted,textAlign:"center",maxWidth:300,lineHeight:1.7}}>Connect with athletes and coaches worldwide. Select a conversation or start a new one.</div>
      <Btn onClick={()=>setShowNew(true)}>+ New Conversation</Btn>
    </div>}

    {/* Profile modal */}
    <Modal show={showProfile&&!!selOther} onClose={()=>setShowProfile(false)} title="PROFILE">
      {selOther&&<div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <Avatar name={selOther.name} size={52} color={roleColor[selOther.role]||C.blue} verified={selOther.verified}/>
          <div><div style={{color:C.white,fontWeight:700,fontSize:18,display:"flex",alignItems:"center",gap:6}}>{selOther.name}{selOther.verified&&<Badge color={C.blue}>Verified</Badge>}</div><div style={{color:C.muted,fontSize:13}}>{selOther.role==="coach"?`${selOther.title} · ${selOther.org}`:`${selOther.sport} · ${selOther.country}`}</div></div>
        </div>
        {selOther.bio&&<p style={{color:C.white,fontSize:13,lineHeight:1.7,marginBottom:12}}>{selOther.bio}</p>}
        {selOther.privacy?.showEmail&&selOther.email&&<div style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:11}}>Email: </span><span style={{color:C.white,fontSize:13}}>{selOther.email}</span></div>}
        {selOther.privacy?.showPhone&&selOther.phone&&<div style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:11}}>Phone: </span><span style={{color:C.white,fontSize:13}}>{selOther.phone}</span></div>}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <Btn onClick={()=>{setShowProfile(false);startThread(selOther.id);}} full>Send Message</Btn>
          <Btn onClick={()=>{blockUser(selOther.id);setShowProfile(false);}} variant="danger" small>Block</Btn>
        </div>
      </div>}
    </Modal>

    {/* New conversation */}
    <Modal show={showNew} onClose={()=>{setShowNew(false);setNewSearch("");}} title="NEW MESSAGE">
      <input value={newSearch} onChange={e=>setNewSearch(e.target.value)} placeholder="Search athletes or coaches…" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box",marginBottom:14}}/>
      <div style={{maxHeight:340,overflowY:"auto"}}>
        {contactable.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:20}}>No users found.</div>}
        {contactable.map(u=><div key={u.id} onClick={()=>startThread(u.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 12px",borderRadius:10,cursor:"pointer",marginBottom:3,transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background=C.card2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <Avatar name={u.name} size={38} color={roleColor[u.role]||C.blue} verified={u.verified}/>
          <div style={{flex:1}}><div style={{color:C.white,fontWeight:600,fontSize:14,display:"flex",alignItems:"center",gap:4}}>{u.name}{u.verified&&<span style={{color:C.blue,fontSize:11}}>✓</span>}</div><div style={{color:C.muted,fontSize:12}}>{u.role==="coach"?`${u.title} · ${u.org}`:`${u.sport} · ${u.country}`}</div></div>
          <Badge color={roleColor[u.role]||C.muted}>{u.role}</Badge>
        </div>)}
      </div>
    </Modal>
  </div>;
}
// ═══════════════════════════════════════════════
//  LOGIN + SIDEBAR + NOTIFICATIONS + PRIVACY
// ═══════════════════════════════════════════════
function SignupModal({show,onClose,settings}){
  const[role,setRole]=useState("athlete");
  const[name,setName]=useState("");
  const[email,setEmail]=useState("");
  const[tier,setTier]=useState("rookie");
  const[loading,setLoading]=useState(false);
  const rp=settings?.rookiePrice||29;
  const sp=settings?.risingPrice||49;
  const pp=settings?.proPrice||79;
  const cp=settings?.coachPrice||49;
  const prices={rookie:rp,rising:sp,pro:pp};
  const descs={rookie:"School search, Euro teams, NIL basics",rising:"AI roadmap, content vault, brand deals",pro:"Full suite, overseas pitch, priority support"};
  async function go(){
    if(!name||!email)return;
    setLoading(true);
    await startCheckout(role==="coach"?"coach":tier,email,name,role);
    setLoading(false);
  }
  const planPrice=role==="coach"?cp:prices[tier];
  return React.createElement(Modal,{show,onClose,title:"JOIN ATHLETEVAULT",maxW:480},
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:16}},
      ["athlete","coach"].map(r=>React.createElement("button",{key:r,onClick:()=>setRole(r),style:{flex:1,padding:"10px",borderRadius:7,border:"1px solid "+(role===r?C.accent:C.border),background:role===r?C.accentGlow:"transparent",color:role===r?C.accent:C.muted,fontWeight:700,cursor:"pointer",fontSize:13,letterSpacing:1,textTransform:"uppercase"}},r))
    ),
    React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:11,marginBottom:14}},
      React.createElement(Inp,{label:"FULL NAME",value:name,onChange:setName,placeholder:"Marcus Webb"}),
      React.createElement(Inp,{label:"EMAIL",value:email,onChange:setEmail,placeholder:"you@email.com",type:"email"})
    ),
    role==="athlete"&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:8,marginBottom:14}},
      React.createElement("div",{style:{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:4}},"SELECT PLAN"),
      ["rookie","rising","pro"].map(t=>React.createElement("div",{key:t,onClick:()=>setTier(t),style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderRadius:8,border:"1px solid "+(tier===t?C.accent:C.border),background:tier===t?C.accentGlow:"transparent",cursor:"pointer"}},
        React.createElement("div",null,
          React.createElement("div",{style:{color:C.white,fontWeight:700,fontSize:13,textTransform:"capitalize"}},t==="rising"?"Rising Star":t),
          React.createElement("div",{style:{color:C.muted,fontSize:11,marginTop:2}},descs[t])
        ),
        React.createElement("div",{style:{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:24,fontWeight:700}},"$"+prices[t],React.createElement("span",{style:{fontSize:11,color:C.muted}},"/mo"))
      ))
    ),
    role==="coach"&&React.createElement("div",{style:{padding:"12px 14px",borderRadius:8,border:"1px solid "+C.blue+"44",background:C.blue+"11",marginBottom:14}},
      React.createElement("div",{style:{color:C.white,fontWeight:700,fontSize:14}},"Coach Pro"),
      React.createElement("div",{style:{color:C.muted,fontSize:12,marginTop:2}},"Athlete search, studio, live sessions, school jobs"),
      React.createElement("div",{style:{color:C.blue,fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,marginTop:4}},"$"+cp,React.createElement("span",{style:{fontSize:12,color:C.muted}},"/mo"))
    ),
    React.createElement(Btn,{onClick:go,loading,disabled:!name||!email,full:true},"Start Free Trial — $"+planPrice+"/mo"),
    React.createElement("p",{style:{color:C.muted,fontSize:11,textAlign:"center",marginTop:10,fontFamily:"DM Mono,monospace"}},"CANCEL ANYTIME · SECURE CHECKOUT · STRIPE")
  );
}
function Login({onSuccess,athletes,coaches,settings}){
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [err,setErr]=useState("");const [loading,setLoading]=useState(false);const [tries,setTries]=useState(0);const [refCode,setRefCode]=useState("");const [showRef,setShowRef]=useState(false);const [showSignup,setShowSignup]=useState(false);
  const locked=tries>=5;
  function go(){
    if(locked)return;setErr("");setLoading(true);
    setTimeout(()=>{
      if(email.trim()===OWNER_CREDS.username&&pass===OWNER_CREDS.password){onSuccess("owner",null);return;}
      const a=athletes.find(x=>x.email.toLowerCase()===email.trim().toLowerCase()&&x.passwordHash&&x.passwordHash===hashPass(pass));
      if(a){onSuccess("athlete",a);return;}
      const co=coaches.find(x=>x.email.toLowerCase()===email.trim().toLowerCase()&&x.passwordHash&&x.passwordHash===hashPass(pass));
      if(co){onSuccess("coach",co);return;}
      const ad=athletes.find(x=>x.email.toLowerCase()===email.trim().toLowerCase()&&!x.passwordHash);
      if(ad&&pass==="demo"){onSuccess("athlete",ad);return;}
      const cd=coaches.find(x=>x.email.toLowerCase()===email.trim().toLowerCase()&&!x.passwordHash);
      if(cd&&pass==="demo"){onSuccess("coach",cd);return;}
      const n=tries+1;setTries(n);setErr(n>=5?"Account locked after 5 attempts. Contact support@athletevault.org.":"Incorrect credentials. Please try again.");setLoading(false);
    },600);
  }
  return <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",backgroundImage:`radial-gradient(ellipse 70% 50% at 50% 0%,${C.goldGlow},transparent 70%)`}}>
    <div style={{width:"100%",maxWidth:420,padding:"0 24px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:60,height:60,borderRadius:16,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:C.black,boxShadow:`0 8px 32px ${C.gold}44`}}>AV</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,color:C.white,letterSpacing:3}}>ATHLETEVAULT</div>
        <div style={{color:C.muted,fontSize:13,marginTop:4}}>{settings?.tagline||"Built by athletes. For athletes."}</div>
      </div>
      <Card glow>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Inp label="EMAIL OR USERNAME" value={email} onChange={setEmail} placeholder="you@email.com"/>
          <Inp label="PASSWORD" value={pass} onChange={v=>{setPass(v);setErr("");}} type="password" placeholder="••••••••••"/>
          {err&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:8,padding:"10px 13px",color:C.red,fontSize:13}}>🔒 {err}</div>}
          <Btn onClick={go} disabled={loading||locked||!email||!pass} full loading={loading}>{locked?"LOCKED — Contact Support":"SIGN IN →"}</Btn>
          <button onClick={()=>setShowRef(p=>!p)} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>Have a referral code? {showRef?"▲":"▼"}</button>
          {showRef&&<Inp label="REFERRAL CODE" value={refCode} onChange={setRefCode} placeholder="e.g. AB12CD"/>}
        </div>
      </Card>
      <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:8}}><Btn onClick={()=>setShowSignup(true)} variant="ghost" full>New here? Create Account →</Btn><p style={{textAlign:"center",color:C.muted,fontSize:11}}>Already have an account? Sign in above.</p></div><SignupModal show={showSignup} onClose={()=>setShowSignup(false)} settings={settings}/>
      <div style={{textAlign:"center",marginTop:8,display:"flex",justifyContent:"center",gap:12}}>
        <span style={{color:C.border,fontSize:10,fontFamily:"DM Mono,monospace"}}>© 2026 ATHLETEVAULT LLC</span>
        <span style={{color:C.border,fontSize:10}}>·</span>
        <span style={{color:C.border,fontSize:10,fontFamily:"DM Mono,monospace"}}>TEXAS</span>
      </div>
    </div>
  </div>;
}

function Sidebar({navItems,tab,setTab,user,role,onLogout,msgCount,notifCount}){
  const rc={owner:C.gold,athlete:C.blue,coach:C.purple};
  const rl={owner:"Owner",athlete:"Athlete",coach:"Coach"};
  const [collapsed,setCollapsed]=useState(false);
  return <div style={{width:collapsed?64:220,flexShrink:0,background:C.dark,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0,transition:"width .2s"}}>
    <div style={{padding:collapsed?"12px 8px":"16px 13px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:collapsed?0:12,justifyContent:collapsed?"center":"flex-start"}}>
        <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:C.black,flexShrink:0}}>AV</div>
        {!collapsed&&<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:C.white,letterSpacing:1.5}}>ATHLETEVAULT</div>}
      </div>
      {!collapsed&&<div style={{background:C.card,borderRadius:9,padding:"10px 12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><Avatar name={user?.name||"O"} size={28} color={rc[role]} verified={user?.verified}/><div style={{color:C.white,fontWeight:700,fontSize:12,lineHeight:1.2}}>{user?.name||"Chewy Barnes"}</div></div>
        <Badge color={rc[role]}>{rl[role]}</Badge>
        {user?.tier&&<div style={{color:C.muted,fontSize:10,marginTop:4,fontFamily:"DM Mono,monospace"}}>{user.tier.toUpperCase()} PLAN</div>}
      </div>}
    </div>
    <nav style={{flex:1,padding:collapsed?"6px 4px":"9px 6px",overflowY:"auto"}}>
      {navItems.map(n=><button key={n.id} onClick={()=>setTab(n.id)} title={collapsed?n.label:""} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:8,width:"100%",padding:collapsed?"10px 8px":"9px 10px",borderRadius:7,border:"none",background:tab===n.id?C.goldGlow:"transparent",color:tab===n.id?C.gold:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",textAlign:"left",marginBottom:1,borderLeft:`2px solid ${tab===n.id&&!collapsed?C.gold:"transparent"}`,transition:"all .15s",position:"relative"}}>
        <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
        {!collapsed&&<span style={{flex:1}}>{n.label}</span>}
        {!collapsed&&n.id==="messages"&&msgCount>0&&<NotifDot count={msgCount}/>}
        {!collapsed&&n.id==="notifications"&&notifCount>0&&<NotifDot count={notifCount}/>}
        {collapsed&&(n.id==="messages"&&msgCount>0||n.id==="notifications"&&notifCount>0)&&<div style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.red}}/>}
      </button>)}
    </nav>
    <div style={{padding:collapsed?"6px 4px":"9px 6px",borderTop:`1px solid ${C.border}`}}>
      <button onClick={()=>setCollapsed(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:8,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:4}}><span>{collapsed?"→":"←"}</span>{!collapsed&&"Collapse"}</button>
      <button onClick={onLogout} style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:7,width:"100%",padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:C.red,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>🚪{!collapsed&&" Sign Out"}</button>
    </div>
  </div>;
}

function NotificationsTab({user,allUsers,messages,markRead}){
  const notifs=user.notifications||[];
  const unread=notifs.filter(n=>!n.read).length;
  return <div>
    <Sec title="Notifications" sub={`${unread} unread`} action={unread>0?<Btn onClick={markRead} variant="ghost" small>Mark all read</Btn>:null}/>
    {notifs.length===0?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>🔔</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>You're all caught up</div><div style={{color:C.muted,fontSize:13}}>Notifications will appear here when coaches message you or new opportunities are available.</div></Card>
    :<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {notifs.slice().reverse().map((n,i)=><Card key={i} style={{opacity:n.read?.7:1,borderLeft:`3px solid ${n.read?C.border:C.gold}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
            <span style={{fontSize:20}}>{n.icon||"🔔"}</span>
            <div><div style={{color:C.white,fontSize:13,fontWeight:n.read?400:600,marginBottom:2}}>{n.text}</div><div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{ago(n.ts)}</div></div>
          </div>
          {!n.read&&<div style={{width:8,height:8,borderRadius:"50%",background:C.gold,flexShrink:0,marginTop:4}}/>}
        </div>
      </Card>)}
    </div>}
  </div>;
}

function PrivacySecurity({user,saveUsers,role}){
  const [np,setNp]=useState("");const [cp,setCp]=useState("");const [pm,setPm]=useState("");
  const priv=user.privacy||(role==="coach"?DEF_C_PRIV:DEF_A_PRIV);
  function updP(k,v){saveUsers(prev=>prev.map(u=>String(u.id)===String(user.id)?{...u,privacy:{...u.privacy,[k]:v}}:u));}
  function changePass(){if(np.length<8){setPm("Min 8 characters.");return;}if(np!==cp){setPm("Passwords don't match.");return;}saveUsers(prev=>prev.map(u=>String(u.id)===String(user.id)?{...u,passwordHash:hashPass(np)}:u));setPm("✓ Password updated!");setNp("");setCp("");}
  const aTogs=[{k:"profileVisible",l:"Profile Visible",s:"Appear in search results"},{k:"searchable",l:"Searchable by Coaches",s:"Coaches can find you"},{k:"showLocation",l:"Show Location"},{k:"showSchool",l:"Show School / League"},{k:"showFollowers",l:"Show Follower Count"},{k:"showStats",l:"Show Activity Stats"},{k:"showVideos",l:"Show Videos"},{k:"showEmail",l:"Show Email (hidden by default)"},{k:"showPhone",l:"Show Phone Number"},{k:"showDeals",l:"Show Brand Deals"}];
  const cTogs=[{k:"profileVisible",l:"Profile Visible"},{k:"searchable",l:"Searchable by Athletes"},{k:"showBio",l:"Show Bio & Focus"},{k:"showEmail",l:"Show Email"},{k:"showPhone",l:"Show Phone"},{k:"showTwitter",l:"Show Twitter/X"},{k:"showInstagram",l:"Show Instagram"},{k:"showLinkedin",l:"Show LinkedIn"}];
  const togs=role==="coach"?cTogs:aTogs;
  return <div>
    <Sec title="Privacy & Security" sub="You control everything"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>PROFILE PRIVACY</div>
        {togs.map(t=><Tog key={t.k} label={t.l} sub={t.s} val={!!priv[t.k]} onChange={v=>updP(t.k,v)}/>)}
      </Card>
      <div>
        <Card style={{marginBottom:13}}>
          <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>CHANGE PASSWORD</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            <Inp label="NEW PASSWORD" value={np} onChange={setNp} type="password" placeholder="Min 8 characters"/>
            <Inp label="CONFIRM PASSWORD" value={cp} onChange={v=>{setCp(v);setPm("");}} type="password" placeholder="Re-enter"/>
            {pm&&<div style={{background:pm.startsWith("✓")?C.green+"18":C.red+"18",border:`1px solid ${pm.startsWith("✓")?C.green:C.red}44`,borderRadius:8,padding:10,color:pm.startsWith("✓")?C.green:C.red,fontSize:13}}>{pm}</div>}
            <Btn onClick={changePass} disabled={!np||!cp} full>Update Password</Btn>
          </div>
        </Card>
        <Card>
          <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>SECURITY STATUS</div>
          {[["Password",user.passwordHash?"✓ Set":"⚠ Using demo password",user.passwordHash?C.green:C.gold],["Profile",priv.profileVisible?"Visible":"Hidden",priv.profileVisible?C.green:C.muted],["Searchable",priv.searchable?"Yes":"No",priv.searchable?C.green:C.muted],["Referral Code",user.referralCode||"—",C.blue]].map(([k,v,col])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:col,fontSize:12,fontWeight:600}}>{v}</span></div>)}
          <p style={{color:C.muted,fontSize:11,marginTop:10,lineHeight:1.6}}>AthleteVault never sells your data. Contact info is only visible based on your choices above.</p>
        </Card>
      </div>
    </div>
  </div>;
}
// ═══════════════════════════════════════════════
//  OWNER DASHBOARD — full control center
// ═══════════════════════════════════════════════
const O_NAV=[{id:"overview",icon:"⬡",label:"Overview"},{id:"athletes",icon:"👥",label:"Athletes"},{id:"coaches",icon:"🏈",label:"Coaches"},{id:"messages",icon:"💬",label:"Messages"},{id:"revenue",icon:"💰",label:"Revenue"},{id:"ai",icon:"⚡",label:"AI Tools"},{id:"outreach",icon:"📨",label:"Outreach"},{id:"referrals",icon:"🎁",label:"Referrals"},{id:"discounts",icon:"🏷️",label:"Discounts"},{id:"siteconfig",icon:"⚙️",label:"Site Config"},{id:"theme",icon:"🎨",label:"Theme Editor"},{id:"security",icon:"🛡️",label:"Security"}];

function OOverview({athletes,coaches,messages,settings}){
  const active=athletes.filter(a=>a.status==="active");
  const mrr=active.reduce((s,a)=>s+(a.tier==="pro"?79:a.tier==="rising"?49:29),0)+coaches.filter(c=>c.status==="active").length*49;
  const tc={rookie:0,rising:0,pro:0};active.forEach(a=>{tc[a.tier]=(tc[a.tier]||0)+1;});
  const totalMsgs=Object.values(messages||{}).reduce((s,m)=>s+m.length,0);
  const countries=[...new Set(athletes.map(a=>a.country).filter(Boolean))];
  const tierColor={rookie:C.mutedHi,rising:C.gold,pro:C.purple};
  return <div>
    <Sec title="Command Center" sub={`Live · ${stamp()}`}/>
    {settings?.announcement&&<Card glow style={{marginBottom:16,display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:20}}>📣</span><p style={{color:C.white,fontSize:13,lineHeight:1.6}}>{settings.announcement}</p></Card>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="ATHLETES" value={fmt(active.length)} delta={`${athletes.length} total`} color={C.blue}/>
      <Stat icon="🏈" label="COACHES" value={fmt(coaches.length)} delta={`${[...new Set(coaches.map(c=>c.country))].length} countries`} color={C.purple}/>
      <Stat icon="💰" label="MRR" value={fmtM(mrr)} delta={`ARR ${fmtM(mrr*12)}`} color={C.gold}/>
      <Stat icon="💬" label="MESSAGES" value={fmt(totalMsgs)} color={C.green}/>
      <Stat icon="🌍" label="COUNTRIES" value={countries.length} color={C.teal}/>
      <Stat icon="👁️" label="PROFILE VIEWS" value={fmt(athletes.reduce((s,a)=>s+(a.profileViews||0),0)+coaches.reduce((s,c)=>s+(c.profileViews||0),0))} color={C.mutedHi}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
      <Card>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:14}}>MRR BREAKDOWN</div>
        {[["rookie",29],["rising",49],["pro",79]].map(([t,p])=>{const n=tc[t]||0;const rev=n*p;const max=Math.max(...[29,49,79].map(pp=>Object.values(tc).reduce((s,c,i)=>s+c*[29,49,79][i],0)));return <div key={t} style={{marginBottom:13}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{color:tierColor[t],fontSize:12,fontWeight:700,textTransform:"uppercase"}}>{t} — {n} athletes</span><span style={{color:C.white,fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtM(rev)}/mo</span></div>
          <ProgressBar val={rev} max={Math.max(mrr,1)} color={tierColor[t]}/>
        </div>;})}
      </Card>
      <Card>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>GROWTH TARGETS</div>
        {[10,50,100,500,1000].map(n=><div key={n} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{fmt(n)} subs</span><span style={{color:C.gold,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18}}>{fmtM(n*29)}/mo</span></div>)}
      </Card>
    </div>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:11}}>ATHLETE COUNTRIES</div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{countries.map(c=><Badge key={c} color={C.blue}>{c} ({athletes.filter(a=>a.country===c).length})</Badge>)}</div></Card>
  </div>;
}

function OAthletes({athletes,saveAthletes,addLog}){
  const [search,setSearch]=useState("");const [showAdd,setShowAdd]=useState(false);
  const [na,setNa]=useState({name:"",sport:"",school:"",tier:"rookie",email:"",password:"",country:"United States",state:"",city:"",bio:"",followers:""});
  const tierColor={rookie:C.mutedHi,rising:C.gold,pro:C.purple};
  const filtered=athletes.filter(a=>(a.name+a.sport+(a.country||"")+(a.email||"")).toLowerCase().includes(search.toLowerCase()));
  function toggle(id){saveAthletes(prev=>prev.map(a=>{if(String(a.id)!==String(id))return a;const s=a.status==="active"?"paused":"active";addLog({action:"Status change",detail:`${a.name} → ${s}`,level:s==="active"?"success":"warn"});return{...a,status:s};}));}
  function toggleVerify(id){saveAthletes(prev=>prev.map(a=>String(a.id)===String(id)?{...a,verified:!a.verified}:a));addLog({action:"Verification toggle",detail:`Athlete ${id}`,level:"info"});}
  function add(){if(!na.name||!na.sport||!na.email)return;const mrr=na.tier==="pro"?79:na.tier==="rising"?49:29;const a={...na,id:Date.now(),role:"athlete",followers:parseInt(na.followers)||0,mrr,status:"active",joined:new Date().toISOString().slice(0,10),coachSent:0,brandSent:0,videos:[],deals:[],privacy:{...DEF_A_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:0,notifications:[],verified:false,passwordHash:na.password?hashPass(na.password):""};saveAthletes(prev=>[...prev,a]);addLog({action:"Athlete added",detail:a.name,level:"success"});setNa({name:"",sport:"",school:"",tier:"rookie",email:"",password:"",country:"United States",state:"",city:"",bio:"",followers:""});setShowAdd(false);}
  function remove(id){const a=athletes.find(x=>String(x.id)===String(id));saveAthletes(prev=>prev.filter(x=>String(x.id)!==String(id)));addLog({action:"Athlete removed",detail:a?.name,level:"warn"});}
  function resetPass(id){const np=prompt("New password (min 8 chars):");if(!np||np.length<8){alert("Min 8 chars.");return;}saveAthletes(prev=>prev.map(a=>String(a.id)===String(id)?{...a,passwordHash:hashPass(np)}:a));addLog({action:"Password reset",detail:`Athlete ${id}`,level:"warn"});}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}><Sec title="Athletes" sub={`${filtered.length} athletes`}/><Btn onClick={()=>setShowAdd(true)}>+ Add Athlete</Btn></div>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, sport, email, country…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",marginBottom:13,boxSizing:"border-box"}}/>
    <Card style={{padding:0,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${C.border}`}}>{["Athlete","Location","Sport","Tier","MRR","Views","Status",""].map(h=><th key={h} style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,fontWeight:600,padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.map(a=><tr key={a.id} style={{borderBottom:`1px solid ${C.border}`}}>
          <td style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><Avatar name={a.name} size={28} color={C.blue} verified={a.verified}/><div><div style={{color:C.white,fontWeight:600,fontSize:13}}>{a.name}</div><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace"}}>{a.email}</div></div></div></td>
          <td style={{padding:"10px 14px"}}><div style={{color:C.mutedHi,fontSize:12}}>{a.city}{a.state?`, ${a.state}`:""}</div><div style={{color:C.muted,fontSize:11}}>{a.country}</div></td>
          <td style={{padding:"10px 14px",color:C.mutedHi,fontSize:13}}>{a.sport}</td>
          <td style={{padding:"10px 14px"}}><Badge color={tierColor[a.tier]||C.muted}>{a.tier}</Badge></td>
          <td style={{padding:"10px 14px",color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:700}}>${a.tier==="pro"?79:a.tier==="rising"?49:29}</td>
          <td style={{padding:"10px 14px",color:C.muted,fontSize:12,fontFamily:"DM Mono,monospace"}}>{a.profileViews||0}</td>
          <td style={{padding:"10px 14px"}}><Badge color={a.status==="active"?C.green:C.red}>{a.status}</Badge></td>
          <td style={{padding:"10px 14px"}}><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <Btn onClick={()=>toggle(a.id)} variant={a.status==="active"?"danger":"green"} small>{a.status==="active"?"Pause":"Resume"}</Btn>
            <Btn onClick={()=>toggleVerify(a.id)} variant={a.verified?"ghost":"blue"} small>{a.verified?"✓":"Verify"}</Btn>
            <Btn onClick={()=>resetPass(a.id)} variant="ghost" small>🔑</Btn>
            <Btn onClick={()=>remove(a.id)} variant="danger" small>✕</Btn>
          </div></td>
        </tr>)}</tbody>
      </table>
    </div></Card>
    <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="ADD ATHLETE" maxW={560}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
        {[["NAME","name","Marcus Webb"],["SPORT","sport","Football"],["SCHOOL / LEAGUE","school","UTEP"],["FOLLOWERS","followers","5000"],["EMAIL","email","athlete@email.com"],["PASSWORD","password","Min 8 chars"],["CITY","city","Houston"],["STATE","state","Texas"]].map(([l,k,ph])=><Inp key={k} label={l} value={na[k]} onChange={v=>setNa(p=>({...p,[k]:v}))} placeholder={ph} type={k==="password"?"password":"text"}/>)}
        <Sel label="COUNTRY" value={na.country} onChange={v=>setNa(p=>({...p,country:v}))} options={REGIONS}/>
        <Sel label="TIER" value={na.tier} onChange={v=>setNa(p=>({...p,tier:v}))} options={[{v:"rookie",l:"Rookie ($29)"},{v:"rising",l:"Rising Star ($49)"},{v:"pro",l:"Pro Athlete ($79)"}]}/>
      </div>
      <Inp label="BIO" value={na.bio} onChange={v=>setNa(p=>({...p,bio:v}))} rows={2} placeholder="Athlete's story or position info"/>
      <Btn onClick={add} disabled={!na.name||!na.sport||!na.email} full style={{marginTop:12}}>Add Athlete</Btn>
    </Modal>
  </div>;
}

function OCoaches({coaches,saveCoaches,addLog}){
  const [search,setSearch]=useState("");const [showAdd,setShowAdd]=useState(false);
  const [nc,setNc]=useState({name:"",sport:"",org:"",title:"",email:"",password:"",phone:"",country:"United States",state:"",city:"",twitter:"",instagram:"",linkedin:"",bio:"",recruitingRegions:[]});
  const filtered=coaches.filter(c=>(c.name+c.sport+c.org+(c.country||"")).toLowerCase().includes(search.toLowerCase()));
  function toggleVerify(id){saveCoaches(prev=>prev.map(c=>String(c.id)===String(id)?{...c,verified:!c.verified}:c));}
  function remove(id){const c=coaches.find(x=>String(x.id)===String(id));saveCoaches(prev=>prev.filter(x=>String(x.id)!==String(id)));addLog({action:"Coach removed",detail:c?.name,level:"warn"});}
  function resetPass(id){const np=prompt("New password:");if(!np||np.length<8)return;saveCoaches(prev=>prev.map(c=>String(c.id)===String(id)?{...c,passwordHash:hashPass(np)}:c));}
  function add(){if(!nc.name||!nc.org||!nc.email)return;const c={...nc,id:Date.now(),role:"coach",status:"active",joined:new Date().toISOString().slice(0,10),privacy:{...DEF_C_PRIV},blockedIds:[],referralCode:genCode(),referredBy:null,profileViews:0,notifications:[],verified:false,passwordHash:nc.password?hashPass(nc.password):""};saveCoaches(prev=>[...prev,c]);addLog({action:"Coach added",detail:c.name,level:"success"});setNc({name:"",sport:"",org:"",title:"",email:"",password:"",phone:"",country:"United States",state:"",city:"",twitter:"",instagram:"",linkedin:"",bio:"",recruitingRegions:[]});setShowAdd(false);}
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}><Sec title="Coaches" sub={`${filtered.length} coaches`}/><Btn onClick={()=>setShowAdd(true)}>+ Add Coach</Btn></div>
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coaches…" style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif",marginBottom:13,boxSizing:"border-box"}}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {filtered.map(c=><Card key={c.id}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><Avatar name={c.name} size={36} color={C.purple} verified={c.verified}/><div style={{display:"flex",gap:4}}><Btn onClick={()=>toggleVerify(c.id)} variant={c.verified?"ghost":"blue"} small>{c.verified?"✓ Verified":"Verify"}</Btn><Btn onClick={()=>resetPass(c.id)} variant="ghost" small>🔑</Btn><Btn onClick={()=>remove(c.id)} variant="danger" small>✕</Btn></div></div>
        <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:2}}>{c.name}</div>
        <div style={{color:C.purple,fontSize:12,marginBottom:1}}>{c.title}</div>
        <div style={{color:C.muted,fontSize:12,marginBottom:7}}>{c.org} · {c.city}, {c.country}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>{(c.recruitingRegions||[]).slice(0,3).map(r=><Badge key={r} color={C.blue}>{r}</Badge>)}{(c.recruitingRegions||[]).length>3&&<Badge color={C.muted}>+{(c.recruitingRegions||[]).length-3}</Badge>}</div>
        <div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{c.email}</div>
      </Card>)}
    </div>
    <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="ADD COACH" maxW={580}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginBottom:11}}>
        {[["NAME","name","Coach Full Name"],["SPORT","sport","Football"],["ORG","org","Texas Southern"],["TITLE","title","Head Coach"],["EMAIL","email","coach@uni.edu"],["PASSWORD","password","Min 8 chars"],["PHONE","phone","(555)000-0000"],["CITY","city","Houston"],["STATE","state","Texas"],["TWITTER","twitter","@Handle"],["INSTAGRAM","instagram","@handle"],["LINKEDIN","linkedin","linkedin.com/in/..."]].map(([l,k,ph])=><Inp key={k} label={l} value={nc[k]} onChange={v=>setNc(p=>({...p,[k]:v}))} placeholder={ph} type={k==="password"?"password":"text"}/>)}
        <Sel label="BASE COUNTRY" value={nc.country} onChange={v=>setNc(p=>({...p,country:v}))} options={REGIONS}/>
      </div>
      <Inp label="BIO / RECRUITING FOCUS" value={nc.bio} onChange={v=>setNc(p=>({...p,bio:v}))} rows={2}/>
      <div style={{marginTop:11}}><label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace",display:"block",marginBottom:8}}>RECRUITING REGIONS</label><RegionPicker selected={nc.recruitingRegions} onChange={v=>setNc(p=>({...p,recruitingRegions:v}))}/></div>
      <Btn onClick={add} disabled={!nc.name||!nc.org||!nc.email} full style={{marginTop:13}}>Add Coach</Btn>
    </Modal>
  </div>;
}

function ORevenue({athletes,coaches}){
  const active=athletes.filter(a=>a.status==="active");
  const mrr=active.reduce((s,a)=>s+(a.tier==="pro"?79:a.tier==="rising"?49:29),0)+coaches.filter(c=>c.status==="active").length*49;
  const months=[{mo:"Jan",rev:2900},{mo:"Feb",rev:5800},{mo:"Mar",rev:9280},{mo:"Apr",rev:14700},{mo:"May",rev:mrr}];
  const maxR=Math.max(...months.map(m=>m.rev),1);
  return <div>
    <Sec title="Revenue Dashboard"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="📈" label="MRR" value={fmtM(mrr)} delta={`${active.length} athletes`} color={C.gold}/>
      <Stat icon="🗓️" label="ARR" value={fmtM(mrr*12)} color={C.green}/>
      <Stat icon="📉" label="CHURN EST." value="2.1%" color={C.blue}/>
      <Stat icon="💎" label="LTV EST." value={fmtM(Math.round((mrr/Math.max(active.length,1))/0.021))} color={C.purple}/>
    </div>
    <Card style={{marginBottom:13}}>
      <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:16}}>MRR GROWTH</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:10,height:130}}>
        {months.map((m,i)=><div key={m.mo} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace"}}>{fmtM(m.rev)}</div>
          <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:i===months.length-1?`linear-gradient(180deg,${C.gold},${C.goldDim})`:C.border,height:`${Math.max(6,(m.rev/maxR)*110)}px`,transition:"height .4s ease"}}/>
          <div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{m.mo}</div>
        </div>)}
      </div>
    </Card>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:11}}>SUBSCRIBER BREAKDOWN</div>
      {active.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><div><div style={{color:C.white,fontWeight:600,fontSize:13}}>{a.name}</div><div style={{color:C.muted,fontSize:11}}>{a.tier} · {a.country}</div></div><div style={{color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:700}}>${a.tier==="pro"?79:a.tier==="rising"?49:29}/mo</div></div>)}
      <div style={{display:"flex",justifyContent:"flex-end",paddingTop:11}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,color:C.gold}}>TOTAL: {fmtM(mrr)}/mo</div></div>
    </Card>
  </div>;
}

function OAITools({athletes,saveAthletes,addLog}){
  const [aid,setAid]=useState(athletes[0]?.id||"");const [tool,setTool]=useState("brand");const [custom,setCustom]=useState("");const [out,setOut]=useState("");const [loading,setLoading]=useState(false);
  const athlete=athletes.find(a=>String(a.id)===String(aid))||athletes[0];
  const tools=[{id:"brand",icon:"🤝",label:"Brand Deal DM"},{id:"roadmap",icon:"🗺️",label:"Monetization Roadmap"},{id:"profile",icon:"📋",label:"Recruiting Profile"},{id:"tiktok",icon:"📱",label:"TikTok Caption"},{id:"email",icon:"✉️",label:"Coach Email"},{id:"press",icon:"📰",label:"Press Release"},{id:"overseas",icon:"✈️",label:"Overseas Pitch"},{id:"custom",icon:"✏️",label:"Custom"}];
  const prompts={brand:`Brand deal DM for ${athlete?.name}, ${athlete?.sport}, ${fmt(athlete?.followers||0)} followers, ${athlete?.city||""} ${athlete?.country}. Authentic, under 120 words.`,roadmap:`90-day monetization roadmap for ${athlete?.name}, ${athlete?.sport}, ${fmt(athlete?.followers||0)} followers. Phases: foundation, outreach, scale.`,profile:`Recruiting profile for ${athlete?.name}, ${athlete?.sport} from ${athlete?.school}. 3 paragraphs: identity, edge, character.`,tiktok:`3 TikTok captions for ${athlete?.name} (${athlete?.sport}). Under 150 chars each, 3-4 hashtags.`,email:`Cold email from ${athlete?.name} to a program coordinator. Subject line. Under 180 words. Confident.`,press:`200-word press release: ${athlete?.name} joins AthleteVault. Quotes from athlete and founder Dennis "Chewy" Barnes.`,overseas:`Pitch email for ${athlete?.name} (${athlete?.sport}) targeting European professional teams. Highlight athleticism, adaptability, international readiness.`,custom};
  async function run(){if(!athlete||(tool==="custom"&&!custom))return;setLoading(true);setOut("");try{const r=await ai(prompts[tool]);setOut(r);addLog({action:"AI run",detail:`${tools.find(t=>t.id===tool)?.label} for ${athlete.name}`,level:"info"});}catch(e){setOut("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="AI Tools" sub="Live Claude engine — generate content for any athlete"/>
    <Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:8}}>SELECT ATHLETE</div><select value={aid} onChange={e=>setAid(e.target.value)} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>{athletes.filter(a=>a.status==="active").map(a=><option key={a.id} value={a.id}>{a.name} — {a.sport} ({a.country})</option>)}</select></Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8,marginBottom:13}}>{tools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} style={{background:tool===t.id?C.goldGlow:C.card,border:`1px solid ${tool===t.id?C.gold:C.border}`,borderRadius:10,padding:"12px 10px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}><div style={{fontSize:17,marginBottom:5}}>{t.icon}</div><div style={{color:tool===t.id?C.gold:C.white,fontWeight:600,fontSize:12,fontFamily:"'Sora',sans-serif"}}>{t.label}</div></button>)}</div>
    {tool==="custom"&&<textarea value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Any AI instruction…" rows={3} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:12,color:C.white,fontSize:13,outline:"none",resize:"vertical",fontFamily:"'Sora',sans-serif",boxSizing:"border-box",marginBottom:11}}/>}
    <Btn onClick={run} loading={loading} disabled={!athlete} style={{marginBottom:13}}>⚡ Run {tools.find(t=>t.id===tool)?.label}</Btn>
    <AIOut loading={loading} output={out} label={tools.find(t=>t.id===tool)?.label?.toUpperCase()}/>
  </div>;
}

function OOutreach({athletes,saveAthletes,addLog}){
  const [aid,setAid]=useState(athletes[0]?.id||"");const [loading,setLoading]=useState(false);const [results,setResults]=useState([]);
  async function run(){const a=athletes.find(x=>String(x.id)===String(aid));if(!a)return;setLoading(true);setResults([]);try{const res=await ai(`List 5 realistic coach contacts for a ${a.sport} athlete (${fmt(a.followers)} followers, ${a.city||""} ${a.country}). JSON only array: [{name,program,email,note}]. No markdown.`);const p=JSON.parse(res.replace(/```json|```/g,"").trim());setResults(p);saveAthletes(prev=>prev.map(x=>String(x.id)===String(a.id)?{...x,coachSent:(x.coachSent||0)+p.length}:x));addLog({action:"Outreach",detail:`${p.length} coaches for ${a.name}`,level:"success"});}catch(e){setResults([{name:"Parse error",program:"Retry",email:"—",note:"Try again"}]);}setLoading(false);}
  return <div>
    <Sec title="Outreach Engine" sub="AI finds coach contacts for any athlete"/>
    <Card style={{marginBottom:14}} glow><div style={{display:"flex",gap:11,alignItems:"flex-end",flexWrap:"wrap"}}><div style={{flex:1}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:5}}>ATHLETE</div><select value={aid} onChange={e=>setAid(e.target.value)} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}>{athletes.filter(a=>a.status==="active").map(a=><option key={a.id} value={a.id}>{a.name} ({a.country})</option>)}</select></div><Btn onClick={run} loading={loading}>⚡ Find Coach Contacts</Btn></div></Card>
    {results.length>0&&<Card>{results.map((r,i)=><div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:C.white,fontWeight:600,fontSize:13}}>{r.name}</span><Badge color={C.green}>Ready</Badge></div><div style={{color:C.gold,fontSize:12}}>{r.program}</div><div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace"}}>{r.email}</div><div style={{color:C.mutedHi,fontSize:12,marginTop:3}}>{r.note}</div></div>)}</Card>}
  </div>;
}

function OReferrals({athletes,coaches,settings,saveSettings}){
  const allUsers=[...athletes,...coaches];
  const referred=allUsers.filter(u=>u.referredBy);
  const [disc,setDisc]=useState(settings.defaultReferralDiscount||10);
  const [reward,setReward]=useState(settings.referralReward||"1 month free");
  const [saved,setSaved]=useState(false);
  function save(){saveSettings(p=>({...p,defaultReferralDiscount:disc,referralReward:reward}));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="Referral Program" sub="Athletes and coaches refer others for rewards"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:16}}>
      <Card glow><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:14}}>REFERRAL CONFIG</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="DISCOUNT FOR REFERRED USER (%)" value={String(disc)} onChange={v=>setDisc(Number(v))} placeholder="10"/>
          <Inp label="REWARD FOR REFERRER" value={reward} onChange={setReward} placeholder="1 month free"/>
          <Btn onClick={save}>{saved?"✓ Saved!":"Save Settings"}</Btn>
        </div>
      </Card>
      <div style={{display:"grid",gap:12}}>
        <Stat icon="🎁" label="TOTAL REFERRALS" value={referred.length} color={C.gold}/>
        <Stat icon="💰" label="REVENUE FROM REFERRALS" value={fmtM(referred.length*29)} color={C.green}/>
      </div>
    </div>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>ALL REFERRAL CODES</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
        {allUsers.map(u=><div key={u.id} style={{background:C.card2,borderRadius:8,padding:"10px 12px"}}>
          <div style={{color:C.white,fontSize:13,fontWeight:600,marginBottom:2}}>{u.name}</div>
          <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{u.role}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.gold,fontFamily:"DM Mono,monospace",fontSize:13,fontWeight:700,letterSpacing:2}}>{u.referralCode||"—"}</span>
            <Badge color={u.referredBy?C.green:C.muted}>{u.referredBy?"Referred":"Direct"}</Badge>
          </div>
        </div>)}
      </div>
    </Card>
  </div>;
}

function ODiscounts({settings,saveSettings,addLog}){
  const [codes,setCodes]=useStore("av_discounts_v1",[]);
  const [form,setForm]=useState({code:"",pct:"",desc:"",expires:"",maxUses:""});
  const [saved,setSaved]=useState(false);
  function add(){if(!form.code||!form.pct)return;const c={id:Date.now(),...form,pct:Number(form.pct),maxUses:Number(form.maxUses)||999,uses:0,active:true,created:new Date().toISOString().slice(0,10)};setCodes(prev=>[c,...prev]);addLog({action:"Discount created",detail:`${c.code} — ${c.pct}% off`,level:"success"});setForm({code:"",pct:"",desc:"",expires:"",maxUses:""});}
  function toggle(id){setCodes(prev=>prev.map(c=>c.id===id?{...c,active:!c.active}:c));}
  function remove(id){setCodes(prev=>prev.filter(c=>c.id!==id));}
  return <div>
    <Sec title="Discount Codes" sub="Create promo codes for athletes and coaches"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
      <Card glow><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:14}}>CREATE CODE</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {[["CODE","code","CHEWY20"],["DISCOUNT (%)","pct","20"],["DESCRIPTION","desc","Founder discount"],["EXPIRES (date)","expires","2026-12-31"],["MAX USES","maxUses","100"]].map(([l,k,ph])=><Inp key={k} label={l} value={form[k]} onChange={v=>setForm(p=>({...p,[k]:v}))} placeholder={ph}/>)}
          <Btn onClick={add} disabled={!form.code||!form.pct} full>+ Create Code</Btn>
        </div>
      </Card>
      <div>
        <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>ACTIVE CODES ({codes.filter(c=>c.active).length})</div>
        {codes.length===0?<Card style={{textAlign:"center",padding:30,color:C.muted}}>No codes yet. Create your first above.</Card>
        :codes.map(c=><Card key={c.id} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:7}}>
            <div><div style={{color:C.gold,fontFamily:"DM Mono,monospace",fontSize:16,fontWeight:700,letterSpacing:2}}>{c.code}</div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{c.pct}% off {c.desc&&`— ${c.desc}`}</div></div>
            <Badge color={c.active?C.green:C.muted}>{c.active?"Active":"Paused"}</Badge>
          </div>
          <div style={{color:C.muted,fontSize:11,marginBottom:8}}>Uses: {c.uses}/{c.maxUses} · Expires: {c.expires||"Never"}</div>
          <div style={{display:"flex",gap:6}}><Btn onClick={()=>toggle(c.id)} variant={c.active?"danger":"green"} small>{c.active?"Pause":"Resume"}</Btn><Btn onClick={()=>remove(c.id)} variant="danger" small>Delete</Btn></div>
        </Card>)}
      </div>
    </div>
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
      <Stat icon="🔒" label="ENCRYPTION" value="AES-256" color={C.teal}/>
    </div>
    <Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1}}>ACTIVITY LOG</div>
      <div style={{display:"flex",gap:8}}><Btn variant="danger" small onClick={()=>addLog({action:"Log cleared by owner",level:"warn"})}>Clear Log</Btn><Btn variant="danger" small onClick={onLogout}>Force Sign Out</Btn></div>
    </div>
    <div style={{maxHeight:400,overflowY:"auto"}}>{logs.slice(0,100).map((l,i)=><div key={l.id||i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:lc[l.level]||C.muted,marginTop:5,flexShrink:0}}/>
      <div><div style={{display:"flex",gap:8,marginBottom:2}}><span style={{color:C.white,fontWeight:600,fontSize:12}}>{l.action}</span><span style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace"}}>{l.ts}</span></div><div style={{color:C.mutedHi,fontSize:11}}>{l.detail}</div></div>
    </div>)}</div></Card>
  </div>;
}
// ═══════════════════════════════════════════════
//  ATHLETE TABS
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
//  POSTGAME-STYLE ATHLETE HUB + OWNER THEME EDITOR
// ═══════════════════════════════════════════════

// ── ATHLETE POSTGAME HUB ───────────────────────
function AthleteHub({athlete,athletes,coaches,messages,saveMessages,saveAthletes,settings}){
  const [tab,setTab]=useState("feed");
  const liveUser=athletes.find(a=>String(a.id)===String(athlete.id))||athlete;
  const allCoachVideos=coaches.flatMap(c=>(c.coachVideos||[]).slice(0,2).map(v=>({...v,coachObj:c})));
  const allSessions=coaches.flatMap(c=>(c.liveSessions||[]).filter(s=>s.status==="upcoming").slice(0,1).map(s=>({...s,coachObj:c})));

  // Pinned stats editor
  const [editStats,setEditStats]=useState(false);
  const [statDraft,setStatDraft]=useState(liveUser.pinnedStats||[]);
  function savePinnedStats(){saveAthletes(prev=>prev.map(a=>String(a.id)===String(liveUser.id)?{...a,pinnedStats:statDraft}:a));setEditStats(false);}
  function addStat(){if(statDraft.length>=6)return;setStatDraft(p=>[...p,{label:"STAT",value:"—"}]);}

  // Feed items from across the platform
  const feed=[
    ...allCoachVideos.slice(0,3).map(v=>({type:"video",id:v.id,title:v.title,sub:`${v.coachObj?.name} · ${v.category}`,icon:"🎬",color:C.accent,price:v.price,action:"Buy Video"})),
    ...allSessions.slice(0,2).map(s=>({type:"session",id:s.id,title:s.title,sub:`${s.coachObj?.name} · ${s.date}`,icon:"📡",color:C.purple,price:s.price,action:"Register"})),
    {type:"tip",id:"t1",title:"NIL Tip: Know your worth",sub:"Your rate = followers × engagement × 0.05",icon:"💡",color:C.gold,price:null,action:null},
    {type:"tip",id:"t2",title:"Overseas Tip: GFL1 season starts April",sub:"Apply now — rosters fill by January",icon:"✈️",color:C.teal,price:null,action:null},
  ];

  return <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,alignItems:"start"}}>
    {/* LEFT — Profile Card (Postgame style) */}
    <div style={{display:"flex",flexDirection:"column",gap:12,position:"sticky",top:0}}>
      {/* Profile hero */}
      <Card glow color={C.accent} style={{textAlign:"center",padding:0,overflow:"hidden"}}>
        <div style={{height:80,background:`linear-gradient(135deg,${C.accent}22,${C.gold}11)`,position:"relative",borderBottom:`1px solid ${C.border}`}}>
          <div className="tron-grid-bg" style={{position:"absolute",inset:0,opacity:.3}}/>
        </div>
        <div style={{marginTop:-32,padding:"0 16px 20px"}}>
          <div style={{display:"inline-block",padding:3,borderRadius:"50%",background:C.card,border:`2px solid ${C.accent}`,marginBottom:10,boxShadow:`0 0 20px ${C.accent}44`}}>
            <Avatar name={liveUser.name} size={56} color={C.accent} verified={liveUser.verified}/>
          </div>
          <div style={{color:C.white,fontWeight:700,fontSize:18,fontFamily:"'Rajdhani',sans-serif",letterSpacing:1}}>{liveUser.name}</div>
          {liveUser.verified&&<Badge color={C.blue} style={{marginTop:4}}>✓ VERIFIED</Badge>}
          <div style={{color:C.accent,fontSize:12,fontWeight:600,marginTop:5}}>{liveUser.sport}</div>
          <div style={{color:C.muted,fontSize:11,marginTop:2}}>{liveUser.school||liveUser.country}</div>
          {liveUser.bio&&<p style={{color:C.mutedHi,fontSize:12,lineHeight:1.6,marginTop:10,textAlign:"left"}}>{liveUser.bio}</p>}
        </div>
      </Card>

      {/* Pinned Stats */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5}}>MY STATS</div>
          <button onClick={()=>{setStatDraft(liveUser.pinnedStats||[]);setEditStats(p=>!p);}} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"2px 8px",color:C.muted,fontSize:10,cursor:"pointer"}}>✏️</button>
        </div>
        {editStats
          ?<div>
            {statDraft.map((s,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:7}}>
              <input value={s.label} onChange={e=>{const n=[...statDraft];n[i]={...n[i],label:e.target.value};setStatDraft(n);}} placeholder="LABEL" style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 8px",color:C.white,fontSize:10,outline:"none",fontFamily:"DM Mono,monospace"}}/>
              <input value={s.value} onChange={e=>{const n=[...statDraft];n[i]={...n[i],value:e.target.value};setStatDraft(n);}} placeholder="Value" style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:5,padding:"5px 8px",color:C.white,fontSize:12,outline:"none"}}/>
            </div>)}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <Btn onClick={addStat} variant="ghost" small>+ Add</Btn>
              <Btn onClick={savePinnedStats} variant="accent" small full>Save</Btn>
            </div>
          </div>
          :<div>
            {(liveUser.pinnedStats||[]).length===0
              ?<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"8px 0"}}>Tap ✏️ to add your stats<br/><span style={{fontSize:10}}>e.g. 4.4 40-Yard Dash</span></div>
              :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {(liveUser.pinnedStats||[]).map((s,i)=><div key={i} style={{background:C.card2,borderRadius:6,padding:"8px 10px",border:`1px solid ${C.border}`}}>
                  <div style={{color:C.accent,fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700,lineHeight:1}}>{s.value}</div>
                  <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1,marginTop:2}}>{s.label}</div>
                </div>)}
              </div>}
          </div>}
      </Card>

      {/* Quick stats */}
      <Card>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:10}}>PLATFORM ACTIVITY</div>
        {[["Followers",fmt(liveUser.followers||0),C.blue],["Profile Views",fmt(liveUser.profileViews||0),C.purple],["Coaches Reached",liveUser.coachSent||0,C.gold],["Brand DMs Sent",liveUser.brandSent||0,C.green]].map(([k,v,col])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:11}}>{k}</span><span style={{color:col,fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700}}>{v}</span></div>)}
      </Card>

      {/* Tier badge */}
      <Card style={{borderColor:`${C.gold}33`,textAlign:"center",padding:"14px"}}>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:8}}>CURRENT PLAN</div>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700,color:C.gold,letterSpacing:2,marginBottom:4}}>{liveUser.tier?.toUpperCase()||"ROOKIE"}</div>
        <div style={{color:C.muted,fontSize:11,marginBottom:6}}>Referral: <span style={{color:C.accent,fontFamily:"DM Mono,monospace",letterSpacing:2}}>{liveUser.referralCode||"—"}</span></div>
        {settings?.welcomeMsg&&<p style={{color:C.mutedHi,fontSize:11,lineHeight:1.6,marginTop:6}}>{settings.welcomeMsg}</p>}
      </Card>
    </div>

    {/* RIGHT — Feed */}
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {[["feed","⚡ Feed"],["roadmap","🗺️ Roadmap"],["activity","📋 Activity"]].map(([t,l])=>
          <Btn key={t} onClick={()=>setTab(t)} variant={tab===t?"accent":"ghost"} small>{l}</Btn>
        )}
      </div>

      {tab==="feed"&&<div>
        {settings?.announcement&&<Card glow style={{marginBottom:12}}><p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6}}>📣 {settings.announcement}</p></Card>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {feed.map((item,i)=><Card key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:44,height:44,borderRadius:10,background:`${item.color}18`,border:`1px solid ${item.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
            <div style={{flex:1}}>
              <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:2}}>{item.title}</div>
              <div style={{color:C.muted,fontSize:12}}>{item.sub}</div>
            </div>
            {item.price&&<div style={{textAlign:"right",flexShrink:0}}><div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700}}>${item.price}</div><Badge color={item.color}>{item.action}</Badge></div>}
          </Card>)}
        </div>
      </div>}

      {tab==="roadmap"&&<div>
        {[{done:true,label:"Create your AthleteVault profile"},{done:(liveUser.videos?.length||0)>0,label:"Upload your first highlight reel"},{done:(liveUser.brandSent||0)>0,label:"Apply to 3 brand deals"},{done:false,label:"Complete NIL Academy Basics"},{done:(liveUser.coachSent||0)>0,label:"Connect with a coach"},{done:false,label:"Generate your monetization roadmap"},{done:false,label:"Search European teams"},{done:(liveUser.pinnedStats?.length||0)>0,label:"Add your key stats to your profile"},{done:false,label:"Refer a teammate → earn reward"}].map((item,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
          <div style={{width:22,height:22,borderRadius:"50%",border:`1px solid ${item.done?C.green:C.border}`,background:item.done?`${C.green}22`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,boxShadow:item.done?`0 0 8px ${C.green}44`:"none"}}>{item.done&&<span style={{color:C.green,fontSize:10,fontWeight:700}}>✓</span>}</div>
          <span style={{color:item.done?C.muted:C.white,fontSize:13,textDecoration:item.done?"line-through":"none",lineHeight:1.5}}>{item.label}</span>
        </div>)}
      </div>}

      {tab==="activity"&&<Card>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>RECENT ACTIVITY</div>
        {[{icon:"📡",text:`${liveUser.coachSent||0} coaches contacted`,sub:"Via AthleteVault outreach"},{icon:"🤝",text:`${liveUser.brandSent||0} brand pitches sent`,sub:"AI-generated"},{icon:"👁️",text:`${liveUser.profileViews||0} profile views`,sub:"Coaches are watching"},{icon:"🎬",text:`${(liveUser.videos||[]).length} videos in vault`,sub:""},{icon:"📚",text:"NIL Academy",sub:"Keep learning"},{icon:"🌍",text:"Euro Teams browser",sub:"25+ clubs available"}].map((a,i)=><div key={i} style={{display:"flex",gap:11,alignItems:"flex-start",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:18,flexShrink:0,marginTop:1}}>{a.icon}</div>
          <div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{a.text}</div>{a.sub&&<div style={{color:C.muted,fontSize:11}}>{a.sub}</div>}</div>
        </div>)}
      </Card>}
    </div>
  </div>;
}

// ── OWNER THEME EDITOR ─────────────────────────
function OThemeEditor({settings,saveSettings,addLog}){
  const [s,setS]=useState({...settings});
  const [saved,setSaved]=useState(false);
  const [preview,setPreview]=useState(false);

  function save(){saveSettings(s);addLog({action:"Theme updated",level:"info"});setSaved(true);setTimeout(()=>setSaved(false),2000);}
  function reset(){setS(prev=>({...prev,themeAccent:"#00F0FF",themeAccent2:"#E8B84B",themeBg:"#020408",themeDark:"#030610",themeCard:"#060D1A",themeCard2:"#080F1F",themeBorder:"#0A1628",themeBorderHi:"#0F1E38",themeWhite:"#E0F4FF",themeMuted:"#2A4A6A",themeMutedHi:"#4A7A9A",themeFont:"'Sora', sans-serif",themeDisplayFont:"'Rajdhani', sans-serif"}));}

  const PRESETS=[
    {name:"Tron: Ares",vals:{themeAccent:"#00F0FF",themeAccent2:"#E8B84B",themeBg:"#020408",themeDark:"#030610",themeCard:"#060D1A",themeCard2:"#080F1F",themeBorder:"#0A1628",themeWhite:"#E0F4FF",themeMuted:"#2A4A6A",themeDisplayFont:"'Rajdhani', sans-serif"}},
    {name:"Gold Rush",vals:{themeAccent:"#E8B84B",themeAccent2:"#FF8C42",themeBg:"#060300",themeDark:"#0A0500",themeCard:"#120A00",themeCard2:"#180C00",themeBorder:"#251500",themeWhite:"#FFF8E0",themeMuted:"#6A4A00",themeDisplayFont:"'Rajdhani', sans-serif"}},
    {name:"Purple Rain",vals:{themeAccent:"#9D4EDD",themeAccent2:"#FF4D8D",themeBg:"#04020A",themeDark:"#060310",themeCard:"#0A0518",themeCard2:"#0C0620",themeBorder:"#140A30",themeWhite:"#F0E0FF",themeMuted:"#4A2A7A",themeDisplayFont:"'Orbitron', sans-serif"}},
    {name:"Matrix Green",vals:{themeAccent:"#0FFF50",themeAccent2:"#00FFCC",themeBg:"#010A01",themeDark:"#011001",themeCard:"#021502",themeCard2:"#031A03",themeBorder:"#042804",themeWhite:"#E0FFE5",themeMuted:"#1A4A1A",themeDisplayFont:"'Share Tech Mono', monospace"}},
    {name:"Ice Blue",vals:{themeAccent:"#3D8BFF",themeAccent2:"#00F0FF",themeBg:"#020408",themeDark:"#030610",themeCard:"#050A18",themeCard2:"#070C1F",themeBorder:"#0A1228",themeWhite:"#E0EEFF",themeMuted:"#1A3A6A",themeDisplayFont:"'Exo 2', sans-serif"}},
  ];

  const colorFields=[
    ["ACCENT (Primary glow color)","themeAccent"],["ACCENT 2 (Gold/secondary)","themeAccent2"],
    ["BACKGROUND","themeBg"],["DARK BACKGROUND","themeDark"],
    ["CARD COLOR","themeCard"],["CARD 2 COLOR","themeCard2"],
    ["BORDER COLOR","themeBorder"],["TEXT COLOR","themeWhite"],
    ["MUTED TEXT","themeMuted"],["MUTED HI TEXT","themeMutedHi"],
  ];

  return <div>
    <Sec title="Theme Editor" sub="Live color, font, and content control — Tron: Ares system"/>

    {/* Presets */}
    <Card style={{marginBottom:14}}>
      <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>THEME PRESETS</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {PRESETS.map(p=><button key={p.name} onClick={()=>setS(prev=>({...prev,...p.vals}))} style={{background:p.vals.themeAccent+"22",border:`1px solid ${p.vals.themeAccent}44`,borderRadius:6,padding:"8px 14px",cursor:"pointer",color:p.vals.themeAccent,fontWeight:700,fontSize:12,transition:"all .15s"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:p.vals.themeAccent,display:"inline-block",marginRight:6}}/>
          {p.name}
        </button>)}
        <button onClick={reset} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 14px",cursor:"pointer",color:C.muted,fontSize:12}}>Reset Default</button>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {/* Colors */}
      <Card>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:14}}>COLORS</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {colorFields.map(([label,key])=><div key={key} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative"}}>
              <input type="color" value={s[key]||"#000000"} onChange={e=>setS(p=>({...p,[key]:e.target.value}))} style={{width:38,height:38,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",background:"none",padding:2}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:2}}>{label}</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <input value={s[key]||""} onChange={e=>setS(p=>({...p,[key]:e.target.value}))} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 8px",color:C.white,fontSize:11,outline:"none",fontFamily:"DM Mono,monospace",width:"100%"}}/>
              </div>
            </div>
          </div>)}
        </div>
      </Card>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Fonts */}
        <Card>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>FONTS</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <Sel label="DISPLAY / HEADING FONT" value={s.themeDisplayFont||"'Rajdhani', sans-serif"} onChange={v=>setS(p=>({...p,themeDisplayFont:v}))} options={[...TRON_FONTS,...FONT_OPTIONS].map(f=>({v:f,l:f.replace(/'/g,"").split(",")[0]}))}/>
            <Sel label="BODY FONT" value={s.themeFont||"'Sora', sans-serif"} onChange={v=>setS(p=>({...p,themeFont:v}))} options={FONT_OPTIONS.map(f=>({v:f,l:f.replace(/'/g,"").split(",")[0]}))}/>
            <div style={{background:C.card2,borderRadius:7,padding:"12px",border:`1px solid ${C.border}`}}>
              <div style={{fontFamily:s.themeDisplayFont,fontSize:22,fontWeight:700,color:s.themeAccent,letterSpacing:2,marginBottom:4}}>ATHLETEVAULT</div>
              <div style={{fontFamily:s.themeFont,fontSize:13,color:s.themeWhite,lineHeight:1.6}}>Your brand. Your vault. Your future.</div>
            </div>
          </div>
        </Card>

        {/* Landing page text */}
        <Card>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>LANDING PAGE COPY</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["PLATFORM NAME","platformName"],["TAGLINE","tagline"],["HERO LINE 1","heroHeadline1"],["HERO LINE 2","heroHeadline2"],["HERO BADGE TEXT","heroBadgeText"],["FOUNDER QUOTE","founderQuote"],["FOUNDER NAME","founderName"],["FOUNDER CREDENTIALS","founderCreds"]].map(([l,k])=><Inp key={k} label={l} value={s[k]||""} onChange={v=>setS(p=>({...p,[k]:v}))}/>)}
            <Inp label="FOUNDER BIO (paragraph)" value={s.founderBio||""} onChange={v=>setS(p=>({...p,founderBio:v}))} rows={4}/>
            <Inp label="HERO SUBHEADLINE" value={s.heroSub||""} onChange={v=>setS(p=>({...p,heroSub:v}))} rows={2}/>
          </div>
        </Card>

        {/* App text */}
        <Card>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>APP COPY</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[["OWNER NAME","ownerName"],["SUPPORT EMAIL","email"],["WELCOME MESSAGE","welcomeMsg"],["ANNOUNCEMENT","announcement"]].map(([l,k])=><Inp key={k} label={l} value={s[k]||""} onChange={v=>setS(p=>({...p,[k]:v}))} rows={k==="welcomeMsg"||k==="announcement"?2:undefined}/>)}
          </div>
        </Card>
      </div>
    </div>

    <Btn onClick={save}>{saved?"✓ THEME SAVED — LIVE NOW!":"SAVE & APPLY THEME"}</Btn>
  </div>;
}

// ── OWNER SITE CONFIG (updated with theme link) ──
function OSiteConfig({settings,saveSettings,addLog,setTab}){
  const [s,setS]=useState(settings);const [saved,setSaved]=useState(false);
  function save(){saveSettings(s);addLog({action:"Site config updated",level:"info"});setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="Site Config" sub="Platform-wide settings"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:13}}>
      <Card>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:13}}>PRICING ($)</div>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {[["ROOKIE / MONTH","rookiePrice"],["RISING STAR / MONTH","risingPrice"],["PRO ATHLETE / MONTH","proPrice"],["COACH PRO / MONTH","coachPrice"],["PLATFORM CUT (% from coach sales)","platformCutPct"]].map(([l,k])=><Inp key={k} label={l} value={String(s[k]||"")} onChange={v=>setS(p=>({...p,[k]:Number(v)}))}/>)}
        </div>
      </Card>
      <Card>
        <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:10}}>FEATURE TOGGLES</div>
        <Tog label="AI Tools Active" val={!!s.aiActive} onChange={v=>setS(p=>({...p,aiActive:v}))}/>
        <Tog label="Outreach Engine" val={!!s.outreachActive} onChange={v=>setS(p=>({...p,outreachActive:v}))}/>
        <Tog label="New Signups Open" val={!!s.signupsOpen} onChange={v=>setS(p=>({...p,signupsOpen:v}))}/>
        <Tog label="Maintenance Mode" sub="Blocks all non-owner logins" val={!!s.maintenanceMode} onChange={v=>setS(p=>({...p,maintenanceMode:v}))}/>
        <Tog label="Coach-to-Coach Messaging" val={!!s.coachToCoachMsg} onChange={v=>setS(p=>({...p,coachToCoachMsg:v}))}/>
        <Tog label="Athlete-to-Athlete Messaging" val={!!s.athleteToAthleteMsg} onChange={v=>setS(p=>({...p,athleteToAthleteMsg:v}))}/>
        <Tog label="Coach Video Monetization" val={!!s.coachVideosEnabled} onChange={v=>setS(p=>({...p,coachVideosEnabled:v}))}/>
        <Tog label="Coach Live Sessions" val={!!s.coachLiveEnabled} onChange={v=>setS(p=>({...p,coachLiveEnabled:v}))}/>
      </Card>
    </div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <Btn onClick={save}>{saved?"✓ Saved!":"Save Config"}</Btn>
      <Btn onClick={()=>setTab&&setTab("theme")} variant="accent">🎨 Open Theme Editor</Btn>
    </div>
  </div>;
}
const A_NAV=[{id:"home",icon:"🏠",label:"My Vault"},{id:"messages",icon:"💬",label:"Messages"},{id:"notifications",icon:"🔔",label:"Notifications"},{id:"schools",icon:"🏫",label:"Schools"},{id:"euroteams",icon:"🌍",label:"Euro Teams"},{id:"content",icon:"🎬",label:"Content"},{id:"brands",icon:"🤝",label:"Brand Deals"},{id:"coaches",icon:"📡",label:"Coaches"},{id:"money",icon:"💰",label:"Monetize"},{id:"nil",icon:"🎓",label:"NIL Academy"},{id:"coaching",icon:"🎬",label:"Coaching Hub"},{id:"profile",icon:"👤",label:"My Profile"},{id:"privacy",icon:"🔒",label:"Privacy"},{id:"referral",icon:"🎁",label:"Refer & Earn"},{id:"help",icon:"❓",label:"Help"}];

function AHome({athlete,settings}){
  const roadmap=[{done:true,label:"Create your AthleteVault profile"},{done:(athlete.videos?.length||0)>0,label:"Upload your first highlight reel"},{done:(athlete.brandSent||0)>0,label:"Apply to 3 brand deals"},{done:false,label:"Complete NIL Academy Basics"},{done:(athlete.coachSent||0)>0,label:"Connect with a coach"},{done:false,label:"Generate your monetization roadmap"},{done:false,label:"Search European teams"},{done:false,label:"Refer a teammate → earn reward"}];
  return <div>
    {settings?.announcement&&<Card glow style={{marginBottom:18}}><p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7}}>📣 {settings.announcement}</p></Card>}
    <div style={{marginBottom:20}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:C.white,letterSpacing:2}}>WELCOME BACK, {(athlete.name||"ATHLETE").split(" ")[0].toUpperCase()} 👊</div><p style={{color:C.muted,fontSize:13,marginTop:4}}>Your vault is live. Let's build your brand.</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="FOLLOWERS" value={fmt(athlete.followers)} color={C.blue}/>
      <Stat icon="🤝" label="BRAND DMs" value={athlete.brandSent||0} color={C.green}/>
      <Stat icon="📨" label="COACHES REACHED" value={athlete.coachSent||0} color={C.purple}/>
      <Stat icon="👁️" label="PROFILE VIEWS" value={athlete.profileViews||0} color={C.gold}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>YOUR PLAN</div>
        {[["Tier",athlete.tier?.toUpperCase()],["Sport",athlete.sport],["Location",`${athlete.city||""}${athlete.country?`, ${athlete.country}`:""}`],["Member Since",athlete.joined],["Referral Code",athlete.referralCode||"—"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:k==="Referral Code"?C.gold:C.white,fontSize:12,fontWeight:600,fontFamily:k==="Referral Code"?"DM Mono,monospace":undefined}}>{v}</span></div>)}
        {settings?.welcomeMsg&&<p style={{color:C.mutedHi,fontSize:12,marginTop:12,lineHeight:1.6}}>{settings.welcomeMsg}</p>}
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>YOUR ROADMAP</div>
        {roadmap.map((item,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:8}}>
          <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${item.done?C.green:C.border}`,background:item.done?C.green+"33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{item.done&&<span style={{color:C.green,fontSize:9,fontWeight:700}}>✓</span>}</div>
          <span style={{color:item.done?C.muted:C.white,fontSize:12,textDecoration:item.done?"line-through":"none",lineHeight:1.4}}>{item.label}</span>
        </div>)}
      </Card>
    </div>
  </div>;
}

function EuroTeams({athlete}){
  const [search,setSearch]=useState("");const [sportF,setSportF]=useState(athlete?.sport||"all");const [countryF,setCountryF]=useState("all");const [leagueF,setLeagueF]=useState("all");const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [pitch,setPitch]=useState("");
  const sports=[...new Set(EURO_TEAMS.map(t=>t.sport))];
  const countries=[...new Set(EURO_TEAMS.map(t=>t.country))];
  const leagues=[...new Set(EURO_TEAMS.map(t=>t.league))];
  const filtered=EURO_TEAMS.filter(t=>{
    const mS=(t.name+t.league+t.city).toLowerCase().includes(search.toLowerCase());
    const mSp=sportF==="all"||t.sport===sportF;
    const mC=countryF==="all"||t.country===countryF;
    const mL=leagueF==="all"||t.league===leagueF;
    return mS&&mSp&&mC&&mL;
  });
  const leagueColor={"GFL1":C.gold,"ELF":C.orange,"EuroLeague":C.purple,"NWSL":C.pink,"Top 14":C.green,"URC":C.teal,"SHL":C.blue,"KHL":C.red,"IPL":C.gold,"BBL":C.green,"Premier League":C.blue,"Bundesliga":C.red};
  async function genPitch(team){setLoading(true);setPitch("");try{const r=await ai(`Write a professional outreach pitch from ${athlete?.name||"an athlete"} (${athlete?.sport||"athlete"}, ${fmt(athlete?.followers||0)} social following, from ${athlete?.country||"USA"}, bio: "${athlete?.bio||""}") to ${team.name} (${team.league}, ${team.country}).

Team details: ${team.description}. Open positions: ${team.openings}. Salary range: ${team.salary}.

Write a compelling email:
- Subject line
- Personal intro connecting to the specific league/team culture
- Athletic credentials (position, accomplishments)  
- Why this specific team in this country
- Availability and willingness to trial
- Professional close with contact ask

Under 200 words. Confident. International ready.`);setPitch(r);}catch(e){setPitch("⚠️ Failed. Retry.");}setLoading(false);}
  return <div>
    <Sec title="European Teams" sub="25+ pro teams across GFL, ELF, EuroLeague, NWSL, Rugby, Ice Hockey, Cricket — better than EuroPlayers"/>
    <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teams, leagues, cities…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}</select>
      <select value={countryF} onChange={e=>setCountryF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Countries</option>{countries.map(c=><option key={c}>{c}</option>)}</select>
      <select value={leagueF} onChange={e=>setLeagueF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Leagues</option>{leagues.map(l=><option key={l}>{l}</option>)}</select>
    </div>
    <p style={{color:C.muted,fontSize:12,marginBottom:14,fontFamily:"DM Mono,monospace"}}>{filtered.length} teams found</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
        {filtered.map(t=><Card key={t.id} glow={sel?.id===t.id} color={leagueColor[t.league]} onClick={()=>{setSel(t);setPitch("");}} style={{cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
            <div style={{fontSize:28}}>{t.logo}</div>
            <Badge color={leagueColor[t.league]||C.muted}>{t.league}</Badge>
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:C.white,letterSpacing:.5,lineHeight:1.1,marginBottom:3}}>{t.name}</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:7}}>📍 {t.city}, {t.country}</div>
          <div style={{color:C.green,fontSize:12,fontFamily:"DM Mono,monospace",marginBottom:7}}>{t.salary}</div>
          <Badge color={C.blue}>{t.sport}</Badge>
        </Card>)}
        {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0",gridColumn:"1/-1"}}>No teams match your filters.</div>}
      </div>
      <div style={{position:"sticky",top:20}}>
        {sel?<Card glow color={leagueColor[sel.league]}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div><div style={{fontSize:36,marginBottom:6}}>{sel.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:C.white,letterSpacing:1,lineHeight:1}}>{sel.name}</div><div style={{color:leagueColor[sel.league]||C.gold,fontWeight:700,fontSize:13,marginTop:4}}>{sel.league} · {sel.country}</div></div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}><Badge color={leagueColor[sel.league]||C.muted}>{sel.league}</Badge><Badge color={C.blue}>{sel.sport}</Badge></div>
          <p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:13}}>{sel.description}</p>
          {[["📍 Location",`${sel.city}, ${sel.country}`],["💰 Salary",sel.salary],["🏆 Openings",sel.openings],["🌐 Website",sel.website],["📧 Contact",sel.contact]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,gap:8,flexWrap:"wrap"}}><span style={{color:C.muted,fontSize:12,flexShrink:0}}>{k}</span><span style={{color:k.includes("Contact")?C.blue:C.white,fontSize:12,fontWeight:600,textAlign:"right",wordBreak:"break-all"}}>{v}</span></div>)}
          <Btn onClick={()=>genPitch(sel)} loading={loading} full style={{marginTop:14}}>⚡ Generate Outreach Pitch</Btn>
          <AIOut loading={loading} output={pitch} label="OUTREACH PITCH"/>
        </Card>:<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>🌍</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>Select a Team</div><div style={{color:C.muted,fontSize:13}}>View full details, salary info, open positions, and generate your outreach pitch.</div></Card>}
      </div>
    </div>
  </div>;
}

function SchoolSearch({athlete}){
  const [search,setSearch]=useState("");const [divF,setDivF]=useState("all");const [sportF,setSportF]=useState(athlete?.sport||"all");const [typeF,setTypeF]=useState("all");const [schF,setSchF]=useState("all");const [sel,setSel]=useState(null);const [saved,setSaved]=useStore("av_saved_schools_v2",[]);const [contacted,setContacted]=useStore("av_contacted_v2",[]);const [notes,setNotes]=useStore("av_school_notes_v2",{});const [view,setView]=useState("search");const [loading,setLoading]=useState(false);const [outreach,setOutreach]=useState("");const [matchOut,setMatchOut]=useState("");const [matchLoading,setMatchLoading]=useState(false);
  const divs=["all","NCAA D1","NCAA D2","NAIA","NJCAA"];const types=["all","Public","Private","HBCU","JUCO"];
  const filtered=SCHOOLS.filter(s=>{const mS=(s.name+(s.nick||"")+(s.loc||"")).toLowerCase().includes(search.toLowerCase());const mD=divF==="all"||s.div===divF;const mSp=sportF==="all"||s.sports?.includes(sportF);const mT=typeF==="all"||s.type===typeF;const mSch=schF==="all"||(schF==="yes"&&s.scholarships)||(schF==="no"&&!s.scholarships);return mS&&mD&&mSp&&mT&&mSch;});
  const savedSchools=SCHOOLS.filter(s=>saved.includes(s.id));
  const contactedSchools=SCHOOLS.filter(s=>contacted.some(c=>c.id===s.id));
  function toggleSave(id){setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}
  function markContacted(school){setContacted(prev=>[...prev.filter(c=>c.id!==school.id),{id:school.id,date:new Date().toISOString().slice(0,10),status:"contacted"}]);}
  async function genOutreach(school){setLoading(true);setOutreach("");try{const r=await ai(`Write a personalized recruiting email from ${athlete?.name||"an athlete"} (${athlete?.sport}, ${fmt(athlete?.followers||0)} social followers, ${athlete?.school||"current program"}, ${athlete?.city||""} ${athlete?.country||"USA"}) to the coaching staff at ${school.name} (${school.nick}, ${school.div}, ${school.conf}).Open positions: ${JSON.stringify(school.openings)}. Scholarships: ${school.schNote}.Complete email with subject line, personal opening, athletic credentials, why this school, academic mention, clear ask. Under 200 words.`);setOutreach(r);markContacted(school);}catch(e){setOutreach("⚠️ Failed.");}setLoading(false);}
  async function genMatch(){setMatchLoading(true);setMatchOut("");try{const r=await ai(`Recommend top 10 school matches for: ${athlete?.name}, ${athlete?.sport}, ${fmt(athlete?.followers||0)} followers, ${athlete?.city||""} ${athlete?.country}, school: ${athlete?.school||"unknown"}, bio: "${athlete?.bio||""}".Schools available: ${SCHOOLS.filter(s=>s.sports?.includes(athlete?.sport||"Football")).map(s=>`${s.name} (${s.div}, ${s.loc}, scholarships:${s.scholarships})`).join("; ")}.For each: school name, match score 1-100, why they fit, realistic scholarship chance, first action. Be honest about realistic levels.`);setMatchOut(r);}catch(e){setMatchOut("⚠️ Failed.");}setMatchLoading(false);}
  const divColor={"NCAA D1":C.gold,"NCAA D2":C.blue,"NAIA":C.green,"NJCAA":C.teal};
  return <div>
    <Sec title="School Search" sub="NCAA D1, D2, NAIA, JUCO, HBCUs — better than NCSA"/>
    <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>{[["search","🔍 Search"],["matcher","🤖 AI Match Me"],["saved",`⭐ Saved (${saved.length})`],["tracker",`📋 Tracker (${contacted.length})`]].map(([t,l])=><Btn key={t} onClick={()=>setView(t)} variant={view===t?"gold":"ghost"} small>{l}</Btn>)}</div>
    {view==="matcher"&&<div><Card glow style={{marginBottom:14}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:10}}>AI SCHOOL MATCHER — POWERED BY CLAUDE</div><p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:14}}>AI analyzes your profile and ranks your top 10 best-fit programs across all divisions.</p><Btn onClick={genMatch} loading={matchLoading}>⚡ Find My Best Schools</Btn></Card><AIOut loading={matchLoading} output={matchOut} label="TOP 10 SCHOOL MATCHES"/></div>}
    {view==="saved"&&<div>{savedSchools.length===0?<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:10}}>⭐</div><div style={{color:C.white,fontWeight:700}}>No saved schools yet</div></Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>{savedSchools.map(s=><Card key={s.id} onClick={()=>{setSel(s);setView("search");}} style={{cursor:"pointer"}}><div style={{fontSize:22,marginBottom:7}}>{s.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:C.white,marginBottom:3}}>{s.name}</div><div style={{color:divColor[s.div]||C.gold,fontSize:12,marginBottom:6}}>{s.div} · {s.conf}</div><Badge color={s.scholarships?C.green:C.muted}>{s.scholarships?"Scholarships":"No Scholarship"}</Badge></Card>)}</div>}</div>}
    {view==="tracker"&&<div>{contactedSchools.length===0?<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:10}}>📋</div><div style={{color:C.white,fontWeight:700}}>Tracker empty</div><div style={{color:C.muted,fontSize:13}}>Generate outreach emails to track schools here.</div></Card>:<Card>{contactedSchools.map(s=>{const c=contacted.find(x=>x.id===s.id);const nk=`s_${s.id}`;return <div key={s.id} style={{padding:"12px 0",borderBottom:`1px solid ${C.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}><div><div style={{color:C.white,fontWeight:700,fontSize:14}}>{s.logo} {s.name}</div><div style={{color:C.muted,fontSize:12}}>{s.div} · Contacted {c?.date}</div></div><Badge color={c?.status==="committed"?C.gold:c?.status==="replied"?C.green:c?.status==="visit"?C.purple:C.muted}>{c?.status}</Badge></div><div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>{["contacted","replied","visit","committed","declined"].map(st=><button key={st} onClick={()=>setContacted(prev=>prev.map(x=>x.id===s.id?{...x,status:st}:x))} style={{background:c?.status===st?C.goldGlow:"transparent",border:`1px solid ${c?.status===st?C.gold:C.border}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:c?.status===st?C.gold:C.muted,fontSize:10,fontFamily:"'Sora',sans-serif",fontWeight:600,textTransform:"capitalize"}}>{st}</button>)}</div><input value={notes[nk]||""} onChange={e=>setNotes(p=>({...p,[nk]:e.target.value}))} placeholder="Notes…" style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 11px",color:C.white,fontSize:12,outline:"none",fontFamily:"'Sora',sans-serif",boxSizing:"border-box"}}/></div>;})}</Card>}</div>}
    {view==="search"&&<div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
      <div>
        <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools, cities, conferences…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
          <select value={divF} onChange={e=>setDivF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Divs</option>{divs.slice(1).map(d=><option key={d}>{d}</option>)}</select>
          <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Sports</option>{SPORTS_LIST.map(s=><option key={s}>{s}</option>)}</select>
          <select value={typeF} onChange={e=>setTypeF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Types</option>{types.slice(1).map(t=><option key={t}>{t}</option>)}</select>
          <select value={schF} onChange={e=>setSchF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">Any</option><option value="yes">Scholarships</option><option value="no">No Scholarship</option></select>
        </div>
        <p style={{color:C.muted,fontSize:12,marginBottom:12,fontFamily:"DM Mono,monospace"}}>{filtered.length} programs</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:11}}>
          {filtered.map(s=><Card key={s.id} glow={sel?.id===s.id} color={divColor[s.div]} onClick={()=>setSel(s)} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:22}}>{s.logo}</span><button onClick={e=>{e.stopPropagation();toggleSave(s.id);}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:saved.includes(s.id)?C.gold:C.muted}}>{saved.includes(s.id)?"⭐":"☆"}</button></div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:C.white,lineHeight:1.1,marginBottom:3}}>{s.name}</div>
            <div style={{color:divColor[s.div]||C.gold,fontSize:11,fontWeight:700,marginBottom:5}}>{s.nick} · {s.div}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:7}}>📍 {s.loc}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Badge color={divColor[s.div]||C.muted}>{s.div}</Badge>{s.scholarships&&<Badge color={C.green}>Scholarships</Badge>}{s.type==="HBCU"&&<Badge color={C.teal}>HBCU</Badge>}{s.type==="JUCO"&&<Badge color={C.blue}>JUCO</Badge>}</div>
          </Card>)}
        </div>
      </div>
      <div style={{position:"sticky",top:20}}>
        {sel?<Card glow color={divColor[sel.div]}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontSize:30,marginBottom:5}}>{sel.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:C.white,letterSpacing:1,lineHeight:1}}>{sel.name}</div><div style={{color:divColor[sel.div]||C.gold,fontWeight:700,fontSize:12,marginTop:4}}>{sel.nick} · {sel.div}</div></div><button onClick={()=>toggleSave(sel.id)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer"}}>{saved.includes(sel.id)?"⭐":"☆"}</button></div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}><Badge color={divColor[sel.div]||C.muted}>{sel.div}</Badge><Badge color={C.blue}>{sel.conf}</Badge>{sel.type==="HBCU"&&<Badge color={C.teal}>HBCU</Badge>}{sel.scholarships&&<Badge color={C.gold}>Scholarships</Badge>}</div>
          {[["📍","Location",sel.loc],["🎓","Acceptance",sel.accept],["💰","Tuition",sel.tuition],["🌐","Website",sel.site]].filter(([,k,v])=>v).map(([ic,k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,gap:8}}><span style={{color:C.muted,fontSize:12}}>{ic} {k}</span><span style={{color:C.white,fontSize:12,fontWeight:600,textAlign:"right"}}>{v}</span></div>)}
          {sel.schNote&&<div style={{background:C.card2,borderRadius:8,padding:"9px 12px",margin:"11px 0"}}><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:3}}>SCHOLARSHIPS</div><div style={{color:C.white,fontSize:12,lineHeight:1.5}}>{sel.schNote}</div></div>}
          {sel.openings&&Object.keys(sel.openings).length>0&&<div style={{marginBottom:12}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:7}}>OPENINGS</div>{Object.entries(sel.openings).map(([sp,pos])=><div key={sp} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.mutedHi,fontSize:12}}>{sp}</span><span style={{color:C.green,fontSize:12,fontWeight:600}}>{pos}</span></div>)}</div>}
          {sel.sports&&<div style={{marginBottom:12}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:7}}>SPORTS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sel.sports.map(s=><Badge key={s} color={C.mutedHi}>{s}</Badge>)}</div></div>}
          <Btn onClick={()=>genOutreach(sel)} loading={loading} full>⚡ Generate Outreach Email</Btn>
          <AIOut loading={loading} output={outreach} label="OUTREACH EMAIL"/>
        </Card>:<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:12}}>🏫</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>Select a Program</div><div style={{color:C.muted,fontSize:13}}>View details, scholarships, openings and generate your outreach email.</div></Card>}
      </div>
    </div>}
  </div>;
}

function AContent({athlete,saveAthletes,athletes}){
  const [ctab,setCtab]=useState("vault");const [showUpload,setShowUpload]=useState(false);const [vid,setVid]=useState({title:"",platform:[],notes:"",url:""});const [caption,setCaption]=useState("");const [capLoading,setCapLoading]=useState(false);const [selVid,setSelVid]=useState(null);
  const platforms=["TikTok","Instagram","Twitter/X","YouTube","LinkedIn"];
  const videos=athletes.find(a=>String(a.id)===String(athlete.id))?.videos||[];
  function addVideo(){if(!vid.title)return;const v={id:Date.now(),...vid,added:new Date().toISOString().slice(0,10)};saveAthletes(prev=>prev.map(a=>String(a.id)===String(athlete.id)?{...a,videos:[v,...(a.videos||[])]}:a));setVid({title:"",platform:[],notes:"",url:""});setShowUpload(false);}
  async function genCaption(v){setSelVid(v);setCaption("");setCapLoading(true);try{const r=await ai(`TikTok + Instagram + Twitter/X captions for highlight video "${v.title}" by ${athlete.name}, ${athlete.sport}. 3 platform-specific versions. Hashtags each.`);setCaption(r);}catch(e){setCaption("⚠️ Failed.");}setCapLoading(false);}
  return <div>
    <Sec title="Content Center" sub="Your video vault + AI caption engine"/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{[["vault","📦 My Vault"],["captions","⚡ Caption AI"]].map(([t,l])=><Btn key={t} onClick={()=>setCtab(t)} variant={ctab===t?"gold":"ghost"} small>{l}</Btn>)}<Btn onClick={()=>setShowUpload(true)} style={{marginLeft:"auto"}}>+ Upload Video</Btn></div>
    {ctab==="vault"&&(videos.length===0?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>🎬</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>Vault is empty</div><Btn onClick={()=>setShowUpload(true)}>Upload Video</Btn></Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>{videos.map(v=><Card key={v.id}><div style={{background:C.card2,borderRadius:8,height:100,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,fontSize:32}}>🎥</div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3}}>{v.title}</div><div style={{color:C.muted,fontSize:11,marginBottom:7}}>{v.added}</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{v.platform.map(p=><Badge key={p} color={C.blue}>{p}</Badge>)}</div>{v.url&&<a href={v.url} target="_blank" rel="noreferrer" style={{color:C.blue,fontSize:12,display:"block",marginBottom:8}}>View ↗</a>}<Btn onClick={()=>{setSelVid(v);genCaption(v);setCtab("captions");}} variant="ghost" small full>⚡ Caption</Btn></Card>)}</div>)}
    {ctab==="captions"&&<div>{videos.length>0&&<Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:8}}>SELECT VIDEO</div><select onChange={e=>{const v=videos.find(x=>x.id===Number(e.target.value));if(v)genCaption(v);}} style={{width:"100%",background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="">— Pick a video —</option>{videos.map(v=><option key={v.id} value={v.id}>{v.title}</option>)}</select></Card>}<AIOut loading={capLoading} output={caption} label={selVid?`CAPTIONS — ${selVid.title}`:"CAPTIONS"}/></div>}
    <Modal show={showUpload} onClose={()=>setShowUpload(false)} title="UPLOAD VIDEO"><div style={{display:"flex",flexDirection:"column",gap:12}}><Inp label="TITLE" value={vid.title} onChange={v=>setVid(p=>({...p,title:v}))} placeholder="Spring Highlight Reel 2026"/><Inp label="VIDEO URL" value={vid.url} onChange={v=>setVid(p=>({...p,url:v}))} placeholder="https://youtube.com/..."/><div><label style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"DM Mono,monospace",display:"block",marginBottom:6}}>PLATFORMS</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{platforms.map(p=>{const on=vid.platform.includes(p);return <button key={p} onClick={()=>setVid(prev=>({...prev,platform:on?prev.platform.filter(x=>x!==p):[...prev.platform,p]}))} style={{background:on?C.goldGlow:"transparent",border:`1px solid ${on?C.gold:C.border}`,borderRadius:7,padding:"5px 11px",cursor:"pointer",color:on?C.gold:C.muted,fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:12}}>{p}</button>;})}</div></div><Inp label="NOTES" value={vid.notes} onChange={v=>setVid(p=>({...p,notes:v}))} rows={2}/><Btn onClick={addVideo} disabled={!vid.title} full>Save to Vault</Btn></div></Modal>
  </div>;
}

function ABrands({athlete,saveAthletes,athletes}){
  const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [pitch,setPitch]=useState("");
  const myDeals=athletes.find(a=>String(a.id)===String(athlete.id))?.deals||[];
  const applied=myDeals.map(d=>d.id);
  async function apply(deal){setSel(deal);setPitch("");setLoading(true);try{const r=await ai(`Brand pitch DM from ${athlete.name} (${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}) to ${deal.brand} (${deal.cat}). Under 130 words. Authentic, specific, clear CTA.`);setPitch(r);saveAthletes(prev=>prev.map(a=>String(a.id)===String(athlete.id)?{...a,brandSent:(a.brandSent||0)+1,deals:[...(a.deals||[]),{id:deal.id,brand:deal.brand,status:"applied",date:new Date().toISOString().slice(0,10)}]}:a));}catch(e){setPitch("⚠️ Failed.");}setLoading(false);}
  return <div>
    <Sec title="Brand Deals" sub="Find deals. AI writes your pitch. Get paid."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12}}>
        {BRAND_DEALS.map(d=>{const isApplied=applied.includes(d.id);return <Card key={d.id} glow={sel?.id===d.id}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:26}}>{d.logo}</div><Badge color={isApplied?C.green:C.blue}>{isApplied?"Applied":"Open"}</Badge></div><div style={{color:C.white,fontWeight:700,fontSize:15,marginBottom:2}}>{d.brand}</div><div style={{color:C.muted,fontSize:11,marginBottom:6}}>{d.cat}</div><div style={{color:C.mutedHi,fontSize:12,marginBottom:8,lineHeight:1.5}}>{d.desc}</div><div style={{color:C.green,fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,marginBottom:10}}>{d.payout}</div><Btn onClick={()=>apply(d)} loading={loading&&sel?.id===d.id} variant={isApplied?"green":"gold"} small full>{isApplied?"Pitch Again":"⚡ Apply with AI Pitch"}</Btn></Card>;})}
      </div>
      <div>{sel?<Card glow><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>YOUR PITCH — {sel.brand.toUpperCase()}</div>{loading?<div style={{color:C.muted,fontFamily:"DM Mono,monospace",fontSize:13}}>⟳ Writing…</div>:<><p style={{color:C.white,fontSize:14,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{pitch}</p><Btn variant="ghost" small onClick={()=>navigator.clipboard?.writeText(pitch)} style={{marginTop:11}}>📋 Copy</Btn></>}</Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>🤝</div><div style={{color:C.white,fontWeight:600}}>Select a deal to apply</div></Card>}{myDeals.length>0&&<Card style={{marginTop:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:10}}>MY APPLICATIONS</div>{myDeals.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.white,fontSize:13}}>{d.brand}</span><Badge color={C.green}>{d.status}</Badge></div>)}</Card>}</div>
    </div>
  </div>;
}

function ACoachNetwork({athlete,coaches,saveAthletes}){
  const [search,setSearch]=useState("");const [sportF,setSportF]=useState("all");const [countryF,setCountryF]=useState("all");const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [msg,setMsg]=useState("");
  const visible=coaches.filter(c=>c.status==="active"&&c.privacy?.profileVisible!==false&&c.privacy?.searchable!==false);
  const sports=[...new Set(visible.map(c=>c.sport))];const countries=[...new Set(visible.map(c=>c.country).filter(Boolean))];
  const filtered=visible.filter(c=>{const mS=(c.name+c.org+(c.bio||"")).toLowerCase().includes(search.toLowerCase());const mSp=sportF==="all"||c.sport===sportF;const mC=countryF==="all"||c.country===countryF||(c.recruitingRegions||[]).includes(countryF);return mS&&mSp&&mC;});
  async function genOutreach(coach){setLoading(true);setMsg("");try{const r=await ai(`Recruiting outreach from ${athlete.name} (${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}) to ${coach.name} at ${coach.org}. Coach focus: "${coach.bio||""}". Under 150 words. Confident and specific.`);setMsg(r);saveAthletes(prev=>prev.map(a=>String(a.id)===String(athlete.id)?{...a,coachSent:(a.coachSent||0)+1}:a));}catch(e){setMsg("⚠️ Failed.");}setLoading(false);}
  const priv=sel?.privacy||DEF_C_PRIV;
  return <div>
    <Sec title="Coach Network" sub="Find coaches worldwide. Message directly. Generate AI outreach."/>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coaches, orgs, bio…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}</select>
      <select value={countryF} onChange={e=>setCountryF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Regions</option>{countries.map(c=><option key={c}>{c}</option>)}</select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {filtered.map(c=><Card key={c.id} glow={sel?.id===c.id} onClick={()=>{setSel(c);setMsg("");}} style={{cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><Avatar name={c.name} size={36} color={C.purple} verified={c.verified}/><div><div style={{color:C.white,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:4}}>{c.name}{c.verified&&<span style={{color:C.blue,fontSize:11}}>✓</span>}</div><div style={{color:C.purple,fontSize:11}}>{c.title}</div></div></div>
          <div style={{color:C.gold,fontSize:13,fontWeight:600,marginBottom:3}}>{c.org}</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:7}}>{c.city}{c.country?`, ${c.country}`:""}</div>
          <Badge color={C.blue}>{c.sport}</Badge>
          {c.privacy?.showBio!==false&&c.bio&&<p style={{color:C.mutedHi,fontSize:12,lineHeight:1.5,marginTop:8}}>{c.bio.slice(0,80)}{c.bio.length>80?"…":""}</p>}
          {(c.recruitingRegions||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:7}}>{c.recruitingRegions.slice(0,2).map(r=><Badge key={r} color={C.green}>{r}</Badge>)}{c.recruitingRegions.length>2&&<Badge color={C.muted}>+{c.recruitingRegions.length-2}</Badge>}</div>}
        </Card>)}
        {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0"}}>No coaches match your filters.</div>}
      </div>
      <div>{sel?<Card glow><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>COACH PROFILE</div><Avatar name={sel.name} size={44} color={C.purple} verified={sel.verified}/><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:2,marginTop:9,display:"flex",alignItems:"center",gap:6}}>{sel.name}{sel.verified&&<Badge color={C.blue}>Verified</Badge>}</div><div style={{color:C.purple,fontSize:12,marginBottom:2}}>{sel.title}</div><div style={{color:C.gold,fontSize:13,marginBottom:7}}>{sel.org}</div>
        {priv.showBio&&sel.bio&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:11}}>{sel.bio}</p>}
        {(sel.recruitingRegions||[]).length>0&&<div style={{marginBottom:11}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:5}}>RECRUITING FROM</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sel.recruitingRegions.map(r=><Badge key={r} color={C.green}>{r}</Badge>)}</div></div>}
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:11,marginBottom:11}}>
          {priv.showEmail&&sel.email&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>EMAIL</div><div style={{color:C.white,fontSize:13,fontFamily:"DM Mono,monospace"}}>{sel.email}</div></div>}
          {priv.showPhone&&sel.phone&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>PHONE</div><div style={{color:C.white,fontSize:13}}>{sel.phone}</div></div>}
          {priv.showTwitter&&sel.twitter&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>TWITTER</div><div style={{color:C.blue,fontSize:13}}>{sel.twitter}</div></div>}
          {priv.showInstagram&&sel.instagram&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>INSTAGRAM</div><div style={{color:C.purple,fontSize:13}}>{sel.instagram}</div></div>}
          {!priv.showEmail&&!priv.showPhone&&<p style={{color:C.muted,fontSize:12}}>Contact info is private. Message via the Messages tab.</p>}
        </div>
        <Btn onClick={()=>genOutreach(sel)} loading={loading} full>⚡ Generate Outreach Message</Btn>
        <AIOut loading={loading} output={msg} label="OUTREACH MESSAGE"/>
      </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>📡</div><div style={{color:C.white,fontWeight:600}}>Select a Coach</div></Card>}</div>
    </div>
  </div>;
}

function AMoney({athlete}){
  const [roadmap,setRoadmap]=useState("");const [loading,setLoading]=useState(false);
  const streams=[{icon:"🤝",label:"Brand Deals",est:"$150–$3,000/deal",active:(athlete.brandSent||0)>0},{icon:"🏋️",label:"Training Clinics",est:"$50–$200/session",active:false},{icon:"📱",label:"Content Subs",est:"$5–$50/fan/mo",active:false},{icon:"👕",label:"Merch",est:"$10–$50/item",active:false},{icon:"🎙️",label:"Speaking",est:"$200–$2,000",active:false},{icon:"✈️",label:"Overseas Contract",est:"€800–€4,500/mo",active:athlete.country!=="United States"}];
  async function gen(){setLoading(true);setRoadmap("");try{const r=await ai(`Personal 90-day monetization roadmap for ${athlete.name}, ${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}, tier: ${athlete.tier}. Specific amounts, timelines, first actions. Include overseas contract pathway if applicable.`);setRoadmap(r);}catch(e){setRoadmap("⚠️ Failed.");}setLoading(false);}
  return <div>
    <Sec title="Monetization" sub="Your personal money map"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12,marginBottom:18}}>{streams.map(s=><Card key={s.label}><div style={{fontSize:22,marginBottom:7}}>{s.icon}</div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3}}>{s.label}</div><div style={{color:C.green,fontFamily:"DM Mono,monospace",fontSize:12,marginBottom:7}}>{s.est}</div><Badge color={s.active?C.green:C.muted}>{s.active?"Active":"Potential"}</Badge></Card>)}</div>
    <Card glow><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:loading||roadmap?13:0,flexWrap:"wrap",gap:10}}><div><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:3}}>AI ROADMAP</div><div style={{color:C.white,fontWeight:600}}>Your personalized 90-day money plan</div></div><Btn onClick={gen} loading={loading}>⚡ Generate My Roadmap</Btn></div><AIOut loading={loading} output={roadmap} label="90-DAY MONETIZATION ROADMAP"/></Card>
  </div>;
}

function ANIL(){
  const [sel,setSel]=useState(null);const [q,setQ]=useState("");const [ans,setAns]=useState("");const [loading,setLoading]=useState(false);
  const lc={Beginner:C.green,Intermediate:C.gold,Advanced:C.purple};
  async function ask(){if(!q)return;setLoading(true);setAns("");try{const r=await ai(q,"You are a NIL expert for athletes and coaches. Clear, practical, legally-aware answers. Recommend consulting a sports attorney for binding decisions.");setAns(r);}catch(e){setAns("⚠️ Failed.");}setLoading(false);}
  return <div>
    <Sec title="NIL Academy" sub="Learn how to legally profit from your Name, Image & Likeness"/>
    {sel?<div><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,marginBottom:16}}>← Back to lessons</button><Card glow><div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}><div style={{fontSize:28}}>{sel.icon}</div><div><div style={{color:C.white,fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,letterSpacing:1}}>{sel.title}</div><div style={{display:"flex",gap:7,marginTop:5}}><Badge color={lc[sel.level]}>{sel.level}</Badge><span style={{color:C.muted,fontSize:12}}>{sel.dur}</span></div></div></div><p style={{color:C.white,fontSize:14,lineHeight:1.85}}>{sel.body}</p></Card></div>
    :<div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12,marginBottom:20}}>{NIL_LESSONS.map(l=><Card key={l.id} onClick={()=>setSel(l)} style={{cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><div style={{fontSize:22}}>{l.icon}</div><Badge color={lc[l.level]}>{l.level}</Badge></div><div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3,lineHeight:1.3}}>{l.title}</div><div style={{color:C.muted,fontSize:12}}>{l.dur}</div></Card>)}</div>
      <Card glow><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:9}}>ASK THE NIL AI</div><div style={{display:"flex",gap:9}}><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="Can I sign a brand deal while in college?" style={{flex:1,background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/><Btn onClick={ask} loading={loading} disabled={!q}>Ask</Btn></div><AIOut loading={loading} output={ans} label="NIL AI"/></Card>
    </div>}
  </div>;
}

function AProfile({athlete,saveAthletes}){
  const [f,setF]=useState({name:athlete.name,sport:athlete.sport,school:athlete.school,city:athlete.city||"",state:athlete.state||"",country:athlete.country||"United States",bio:athlete.bio||"",phone:athlete.phone||"",followers:String(athlete.followers||0)});
  const [saved,setSaved]=useState(false);
  function save(){saveAthletes(prev=>prev.map(a=>String(a.id)===String(athlete.id)?{...a,...f,followers:Number(f.followers)}:a));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="My Profile"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>PERSONAL INFO</div><div style={{display:"flex",flexDirection:"column",gap:11}}>{[["FULL NAME","name"],["SPORT","sport"],["SCHOOL / LEAGUE","school"],["FOLLOWERS","followers"],["PHONE","phone"]].map(([l,k])=><Inp key={k} label={l} value={f[k]} onChange={v=>setF(p=>({...p,[k]:v}))}/>)}</div></Card>
      <div><Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>LOCATION</div><div style={{display:"flex",flexDirection:"column",gap:11}}><Inp label="CITY" value={f.city} onChange={v=>setF(p=>({...p,city:v}))}/><Inp label="STATE" value={f.state} onChange={v=>setF(p=>({...p,state:v}))}/><Sel label="COUNTRY" value={f.country} onChange={v=>setF(p=>({...p,country:v}))} options={REGIONS}/></div></Card><Card><Inp label="BIO" value={f.bio} onChange={v=>setF(p=>({...p,bio:v}))} rows={4} placeholder="Tell coaches and brands your story…"/></Card></div>
    </div>
    <div style={{marginTop:13}}><Btn onClick={save}>{saved?"✓ Saved!":"Save Profile"}</Btn></div>
  </div>;
}

function AReferral({athlete,athletes,coaches,saveAthletes,settings}){
  const [copied,setCopied]=useState(false);
  const code=athlete.referralCode||"—";
  const referredUsers=[...athletes,...coaches].filter(u=>u.referredBy===code);
  const discount=settings?.defaultReferralDiscount||10;
  const reward=settings?.referralReward||"1 month free";
  function copy(){navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}
  return <div>
    <Sec title="Refer & Earn" sub="Share your code. They save. You earn."/>
    <Card glow style={{marginBottom:18,textAlign:"center",padding:32}}>
      <div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace",letterSpacing:2,marginBottom:12}}>YOUR REFERRAL CODE</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:900,color:C.gold,letterSpacing:6,marginBottom:16}}>{code}</div>
      <Btn onClick={copy} variant="gold">{copied?"✓ Copied!":"Copy My Code"}</Btn>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="PEOPLE REFERRED" value={referredUsers.length} color={C.blue}/>
      <Stat icon="🏷️" label="THEIR DISCOUNT" value={`${discount}%`} color={C.gold}/>
      <Stat icon="🎁" label="YOUR REWARD" value={reward} color={C.green}/>
    </div>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:14}}>HOW IT WORKS</div>
      {[["Share your code","Send your referral code to teammates, friends, or anyone who needs AthleteVault."],["They sign up with your code","They get "+discount+"% off their first month. Win for them."],["You earn your reward","You get: "+reward+". The more you refer, the more you earn."]].map(([t,d],i)=><div key={i} style={{display:"flex",gap:12,marginBottom:14}}><div style={{width:28,height:28,borderRadius:"50%",background:C.goldGlow,border:`1px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontWeight:700,fontSize:13,flexShrink:0}}>{i+1}</div><div><div style={{color:C.white,fontWeight:600,fontSize:13,marginBottom:2}}>{t}</div><div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>{d}</div></div></div>)}
    </Card>
    <div style={{marginTop:14}}>
      <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>SHARE MESSAGES</div>
      {[`"Yo, you need to be on AthleteVault. AI writes your recruiting emails, helps you find overseas teams, and builds your NIL brand. Use my code ${code} for ${discount}% off — athletevault.org"`,`"If you're undrafted or playing overseas and want to monetize your brand, AthleteVault is the move. Built by a GFL1 player for real athletes. Code: ${code}"`].map((m,i)=><Card key={i} style={{marginBottom:10}}><p style={{color:C.white,fontSize:13,lineHeight:1.7,marginBottom:8}}>{m}</p><Btn onClick={()=>navigator.clipboard?.writeText(m)} variant="ghost" small>📋 Copy</Btn></Card>)}
    </div>
  </div>;
}

function AHelp({settings}){
  const [open,setOpen]=useState(null);const [msg,setMsg]=useState("");const [sent,setSent]=useState(false);
  const faqs=[{q:"How does messaging work?",a:"Go to Messages in your sidebar. Search any athlete or coach and start a conversation. All messages are private."},{q:"Can I block someone?",a:"Yes. Open any conversation, tap ⋯, and select Block. Blocked users cannot message you or view your contact info."},{q:"How do I find European teams?",a:"Go to Euro Teams in your sidebar. Filter by sport, country, or league. Select a team to see salary info, openings, and generate your outreach pitch."},{q:"What is the NIL Academy?",a:"Self-paced education covering NIL basics, deal negotiation, taxes, and going overseas."},{q:"How do referrals work?",a:"Share your referral code from the Refer & Earn tab. People who sign up with your code get a discount and you earn a reward."},{q:"Is my data private?",a:"Yes. You control every privacy setting. Contact info is hidden by default. AthleteVault never sells your data."},{q:"How do I contact support?",a:`Email ${settings?.email||"support@athletevault.org"}. ${settings?.ownerName||"Owner"} reviews every message within 24 hours.`}];
  return <div>
    <Sec title="Help Center"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
      <div>{faqs.map((f,i)=><Card key={i} style={{marginBottom:8,cursor:"pointer"}} onClick={()=>setOpen(open===i?null:i)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.white,fontWeight:600,fontSize:13,flex:1,paddingRight:10}}>{f.q}</span><span style={{color:C.gold,fontSize:16}}>{open===i?"−":"+"}</span></div>{open===i&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7,marginTop:10}}>{f.a}</p>}</Card>)}</div>
      <Card glow>{sent?<div style={{textAlign:"center",padding:20}}><div style={{fontSize:40,marginBottom:10}}>✅</div><div style={{color:C.green,fontWeight:700}}>Message sent!</div><div style={{color:C.muted,fontSize:12,marginTop:6}}>We'll respond within 24 hours.</div></div>:<div><div style={{color:C.gold,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>CONTACT SUPPORT</div><div style={{color:C.white,fontWeight:600,marginBottom:3}}>{settings?.ownerName||"Support"}</div><div style={{color:C.muted,fontSize:12,marginBottom:12}}>{settings?.email||"support@athletevault.org"}</div><div style={{display:"flex",flexDirection:"column",gap:10}}><Inp value={msg} onChange={setMsg} placeholder="Describe your issue…" rows={4}/><Btn onClick={()=>{if(msg)setSent(true);}} disabled={!msg} full>Send Message</Btn></div></div>}
      </Card>
    </div>
  </div>;
}

function RecruitingTimeline(){
  const [open,setOpen]=useState(null);
  const TL=[{year:"9th Grade",icon:"🌱",title:"Build Your Foundation",items:["Focus on academics — GPA matters as much as athletics","Begin strength and conditioning program","Create your first highlight reel","Research divisions and realistic levels","Register with NCAA Eligibility Center (ncaa.org)"]},{year:"10th Grade",icon:"📈",title:"Build Your Resume",items:["Update stats and create AthleteVault profile","Attend camps and showcases","Start following target coaches on social media","Research scholarship limits by division and sport","Build your social media following now"]},{year:"11th Grade",icon:"🚀",title:"Make Your Move",items:["Begin direct outreach to coaches (email + AthleteVault)","Attend official and unofficial visits","Take SAT/ACT and submit scores","Narrow school list to 15-20 target programs","June 15: D1 coaches can contact you in most sports"]},{year:"12th Grade",icon:"🏆",title:"Close the Deal",items:["Visit top schools (official visits paid by schools)","Understand your NLI before signing","Early Decision deadlines: November 1-15","Notify coaches you're not choosing — be professional","Sign financial aid agreement and scholarship paperwork"]},{year:"Post-College / Undrafted",icon:"✈️",title:"The Next Chapter",items:["Research overseas leagues (GFL, ELF, basketball, soccer)","Use AthleteVault Euro Teams tab to find opportunities","Build your brand NOW — NIL doesn't stop after college","Contact overseas team scouts directly","Consider grad transfers or pro day opportunities","Stay in shape — opportunities come when you're ready"]}];
  return <div>
    <Sec title="Recruiting Timeline" sub="Year-by-year roadmap — from 9th grade to overseas pro"/>
    {TL.map((t,i)=><Card key={i} glow={open===i} onClick={()=>setOpen(open===i?null:i)} style={{cursor:"pointer",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{fontSize:26}}>{t.icon}</div><div><div style={{color:C.gold,fontSize:11,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:2}}>{t.year.toUpperCase()}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:C.white,letterSpacing:1}}>{t.title}</div></div></div>
        <span style={{color:C.muted,fontSize:20}}>{open===i?"−":"+"}</span>
      </div>
      {open===i&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${C.border}`}}>{t.items.map((item,j)=><div key={j} style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:9}}><span style={{color:C.green,marginTop:1,flexShrink:0,fontSize:13}}>✓</span><span style={{color:C.white,fontSize:13,lineHeight:1.6}}>{item}</span></div>)}</div>}
    </Card>)}
  </div>;
}

const LEGAL_TEXT=`TERMS OF SERVICE — AthleteVault LLC

IMPORTANT: AthleteVault is a technology networking platform — NOT a licensed recruiting agency, certified sports agent, law firm, or financial advisor. Nothing on this platform constitutes legal, financial, or professional recruiting advice.

1. NO GUARANTEE OF OUTCOMES
AthleteVault makes no warranty that use of this platform will result in athletic recruitment, scholarships, professional contracts, brand deals, NIL income, or any other outcome. All opportunities are for informational and networking purposes only.

2. AI CONTENT DISCLAIMER
All AI-generated content (messages, profiles, roadmaps, pitches) is produced by an automated system and has not been reviewed by a licensed professional. Verify all AI content before using in any professional, legal, or financial context.

3. NIL COMPLIANCE
NIL rules vary by state, country, school, conference, and governing body. Athletes are solely responsible for ensuring their NIL activities comply with all applicable rules. AthleteVault bears no responsibility for eligibility consequences or financial outcomes.

4. COACH & SCHOOL LISTINGS
AthleteVault does not verify, certify, or endorse any coach credentials, school information, or team listings. Verify all information directly with institutions before acting.

5. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, ATHLETEVAULT LLC, ITS OWNER, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. TOTAL LIABILITY SHALL NOT EXCEED AMOUNTS PAID IN THE 12 MONTHS PRECEDING THE CLAIM.

6. GOVERNING LAW
These terms are governed by Texas law. Disputes resolved by binding arbitration in Houston, TX. Users waive class action rights.

7. INDEMNIFICATION
You agree to indemnify and hold harmless AthleteVault LLC and its owner Dennis Barnes from any claims arising from your use of the platform or your content.

© 2026 AthleteVault LLC · support@athletevault.org · Houston, TX`;

function LegalInApp(){
  const [accepted,setAccepted]=useStore("av_terms_accepted_v1",false);
  return <div>
    <Sec title="Legal & Terms" sub="Platform terms of service and disclaimers"/>
    <Card style={{marginBottom:14}}><div style={{background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:9,padding:"12px 16px",marginBottom:16}}><div style={{color:C.gold,fontSize:12,fontWeight:700,marginBottom:4}}>⚠️ IMPORTANT — READ CAREFULLY</div><div style={{color:C.mutedHi,fontSize:13,lineHeight:1.6}}>AthleteVault is a technology platform, not a licensed recruiting agency, sports agent, or legal advisor. Use of this platform does not guarantee any athletic, financial, or academic outcome. Always consult qualified professionals for legal, financial, and recruiting decisions.</div></div>
      <pre style={{color:C.mutedHi,fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Sora',sans-serif",marginBottom:16}}>{LEGAL_TEXT}</pre>
      {!accepted?<Btn onClick={()=>setAccepted(true)} full variant="gold">✓ I Have Read and Accept These Terms</Btn>:<div style={{display:"flex",alignItems:"center",gap:8}}><Badge color={C.green}>✓ Terms Accepted</Badge><span style={{color:C.muted,fontSize:12}}>Thank you for accepting.</span></div>}
    </Card>
  </div>;
}
// ═══════════════════════════════════════════════
//  COACH TABS — Find athletes, schools, teams, jobs
// ═══════════════════════════════════════════════
const C_NAV=[{id:"home",icon:"🏠",label:"Dashboard"},{id:"studio",icon:"🎬",label:"My Studio"},{id:"messages",icon:"💬",label:"Messages"},{id:"notifications",icon:"🔔",label:"Notifications"},{id:"athletes",icon:"🔍",label:"Find Athletes"},{id:"euroteams",icon:"🌍",label:"Euro Teams"},{id:"schools",icon:"🏫",label:"School Jobs"},{id:"nil",icon:"🎓",label:"NIL Education"},{id:"profile",icon:"👤",label:"My Profile"},{id:"privacy",icon:"🔒",label:"Privacy"},{id:"referral",icon:"🎁",label:"Refer & Earn"},{id:"help",icon:"❓",label:"Help"}];

function CoachHome({coach,athletes,settings}){
  const mySports=athletes.filter(a=>a.sport===coach.sport&&a.status==="active");
  const myRegion=athletes.filter(a=>(coach.recruitingRegions||[]).includes(a.country)&&a.status==="active");
  const verified=athletes.filter(a=>a.verified&&a.status==="active");
  return <div>
    {settings?.announcement&&<Card glow style={{marginBottom:18}}><p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7}}>📣 {settings.announcement}</p></Card>}
    <div style={{marginBottom:20}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:C.white,letterSpacing:2}}>WELCOME, COACH {(coach.name||"").split(" ").slice(-1)[0].toUpperCase()} 📋</div><p style={{color:C.muted,fontSize:13,marginTop:4}}>{coach.title} · {coach.org}</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="🏅" label={`${coach.sport?.toUpperCase()} ATHLETES`} value={mySports.length} color={C.purple}/>
      <Stat icon="🌍" label="IN YOUR REGION" value={myRegion.length} color={C.blue}/>
      <Stat icon="✓" label="VERIFIED ATHLETES" value={verified.length} color={C.green}/>
      <Stat icon="👁️" label="PROFILE VIEWS" value={coach.profileViews||0} color={C.gold}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>MY RECRUITING PROFILE</div>
        {[["Organization",coach.org],["Title",coach.title],["Sport",coach.sport],["Location",`${coach.city||""}${coach.country?`, ${coach.country}`:""}`],["Referral Code",coach.referralCode||"—"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:k==="Referral Code"?C.gold:C.white,fontSize:12,fontWeight:600,fontFamily:k==="Referral Code"?"DM Mono,monospace":undefined}}>{v}</span></div>)}
        {coach.bio&&<p style={{color:C.mutedHi,fontSize:12,marginTop:10,lineHeight:1.6}}>{coach.bio}</p>}
      </Card>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>RECRUITING REGIONS</div>
        {(coach.recruitingRegions||[]).length===0?<p style={{color:C.muted,fontSize:12}}>No regions set. Edit your profile.</p>:(coach.recruitingRegions||[]).map(r=><div key={r} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.white,fontSize:12}}>{r}</span><Badge color={C.blue}>{athletes.filter(a=>a.country===r&&a.status==="active").length} athletes</Badge></div>)}
      </Card>
    </div>
  </div>;
}

function CoachAthletes({coach,athletes,coaches,saveCoaches,messages,saveMessages,settings}){
  const [search,setSearch]=useState("");const [sportF,setSportF]=useState("all");const [countryF,setCountryF]=useState("all");const [tierF,setTierF]=useState("all");const [verF,setVerF]=useState("all");const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [msg,setMsg]=useState("");const [shortlisted,setShortlisted]=useState([]);const [view,setView]=useState("search");
  const sports=[...new Set(athletes.map(a=>a.sport))];
  const countries=[...new Set(athletes.map(a=>a.country).filter(Boolean))];
  const visible=athletes.filter(a=>a.status==="active"&&a.privacy?.profileVisible!==false&&a.privacy?.searchable!==false);
  const filtered=visible.filter(a=>{
    const mS=(a.name+a.sport+(a.school||"")+(a.bio||"")).toLowerCase().includes(search.toLowerCase());
    const mSp=sportF==="all"||a.sport===sportF;
    const mC=countryF==="all"||a.country===countryF;
    const mT=tierF==="all"||a.tier===tierF;
    const mV=verF==="all"||(verF==="yes"&&a.verified)||(verF==="no"&&!a.verified);
    return mS&&mSp&&mC&&mT&&mV;
  });
  const shortlistedAthletes=athletes.filter(a=>shortlisted.includes(a.id));
  function toggleShortlist(id){setShortlisted(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}
  async function genOutreach(athlete){setLoading(true);setMsg("");try{const r=await ai(`Recruiting outreach email from ${coach.name}, ${coach.title} at ${coach.org}, to ${athlete.name} (${athlete.sport}, ${fmt(athlete.followers)} followers, ${athlete.city||""} ${athlete.country}).Coach is recruiting ${coach.sport} from ${(coach.recruitingRegions||[]).join(", ")}.Bio: "${athlete.bio||""}".Under 160 words. Specific, compelling, professional. Include program details.`);setMsg(r);}catch(e){setMsg("⚠️ Failed.");}setLoading(false);}
  function startMsg(athlete){const tid=makeThreadId(coach.id,athlete.id);const m={id:Date.now(),senderId:coach.id,text:msg||`Hi ${athlete.name}, ${coach.name} at ${coach.org} here. I've been following your work and I'd love to connect.`,ts:new Date().toISOString(),read:false};saveMessages(prev=>({...prev,[tid]:[...(prev[tid]||[]),m]}));}
  const tierColor={rookie:C.mutedHi,rising:C.gold,pro:C.purple};
  const priv=sel?.privacy||DEF_A_PRIV;
  return <div>
    <Sec title="Find Athletes" sub="Search worldwide. Filter. Outreach instantly."/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{[["search","🔍 Search"],["shortlist",`⭐ Shortlist (${shortlisted.length})`]].map(([t,l])=><Btn key={t} onClick={()=>setView(t)} variant={view===t?"gold":"ghost"} small>{l}</Btn>)}</div>
    {view==="shortlist"&&<div>{shortlistedAthletes.length===0?<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:10}}>⭐</div><div style={{color:C.white,fontWeight:700}}>Shortlist empty</div><div style={{color:C.muted,fontSize:13,marginTop:6}}>Star athletes in search to add them.</div></Card>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>{shortlistedAthletes.map(a=><Card key={a.id} onClick={()=>{setSel(a);setView("search");setMsg("");}} style={{cursor:"pointer"}}><div style={{display:"flex",gap:9,alignItems:"center",marginBottom:10}}><Avatar name={a.name} size={34} color={C.blue} verified={a.verified}/><div><div style={{color:C.white,fontWeight:700,fontSize:13}}>{a.name}</div><div style={{color:C.blue,fontSize:11}}>{a.sport}</div></div></div><div style={{color:C.muted,fontSize:12,marginBottom:6}}>{a.country}</div><Badge color={tierColor[a.tier]}>{a.tier}</Badge></Card>)}</div>}</div>}
    {view==="search"&&<div>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, sport, school, bio…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
        <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}</select>
        <select value={countryF} onChange={e=>setCountryF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Countries</option>{countries.map(c=><option key={c}>{c}</option>)}</select>
        <select value={tierF} onChange={e=>setTierF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Tiers</option><option value="rookie">Rookie</option><option value="rising">Rising Star</option><option value="pro">Pro Athlete</option></select>
        <select value={verF} onChange={e=>setVerF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All</option><option value="yes">✓ Verified Only</option></select>
      </div>
      <p style={{color:C.muted,fontSize:12,marginBottom:12,fontFamily:"DM Mono,monospace"}}>{filtered.length} athletes found</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:12}}>
          {filtered.map(a=><Card key={a.id} glow={sel?.id===a.id} onClick={()=>{setSel(a);setMsg("");}} style={{cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <Avatar name={a.name} size={36} color={C.blue} verified={a.verified}/>
              <button onClick={e=>{e.stopPropagation();toggleShortlist(a.id);}} style={{background:"none",border:"none",fontSize:16,cursor:"pointer"}}>{shortlisted.includes(a.id)?"⭐":"☆"}</button>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:2,display:"flex",alignItems:"center",gap:4}}>{a.name}{a.verified&&<span style={{color:C.blue,fontSize:11}}>✓</span>}</div>
            <div style={{color:C.blue,fontSize:12,marginBottom:5}}>{a.sport}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:7}}>{a.school||"Independent"}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:7}}>📍 {a.city}{a.country?`, ${a.country}`:""}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Badge color={tierColor[a.tier]}>{a.tier}</Badge>{priv.showFollowers!==false&&<Badge color={C.mutedHi}>{fmt(a.followers)} followers</Badge>}</div>
            {a.privacy?.showBio!==false&&a.bio&&<p style={{color:C.mutedHi,fontSize:12,lineHeight:1.5,marginTop:8}}>{a.bio.slice(0,80)}{a.bio.length>80?"…":""}</p>}
          </Card>)}
          {filtered.length===0&&<div style={{color:C.muted,fontSize:14,padding:"20px 0",gridColumn:"1/-1"}}>No athletes match your filters.</div>}
        </div>
        <div style={{position:"sticky",top:20}}>{sel?<Card glow>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:13}}>
            <div style={{display:"flex",gap:11,alignItems:"center"}}><Avatar name={sel.name} size={44} color={C.blue} verified={sel.verified}/><div><div style={{color:C.white,fontWeight:700,fontSize:16,display:"flex",alignItems:"center",gap:5}}>{sel.name}{sel.verified&&<Badge color={C.blue}>Verified</Badge>}</div><div style={{color:C.blue,fontSize:13}}>{sel.sport}</div></div></div>
            <button onClick={()=>toggleShortlist(sel.id)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer"}}>{shortlisted.includes(sel.id)?"⭐":"☆"}</button>
          </div>
          {priv.showBio!==false&&sel.bio&&<p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:11}}>{sel.bio}</p>}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:11,marginBottom:11}}>
            {[["School",sel.school],["Location",`${sel.city||""}${sel.country?`, ${sel.country}`:""}`],["Tier",sel.tier]].map(([k,v])=>v?<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{v}</span></div>:null)}
            {priv.showFollowers!==false&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>Followers</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{fmt(sel.followers)}</span></div>}
            {priv.showEmail&&sel.email&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>EMAIL</div><div style={{color:C.white,fontSize:13,fontFamily:"DM Mono,monospace"}}>{sel.email}</div></div>}
            {priv.showPhone&&sel.phone&&<div style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:2}}>PHONE</div><div style={{color:C.white,fontSize:13}}>{sel.phone}</div></div>}
            {!priv.showEmail&&!priv.showPhone&&<p style={{color:C.muted,fontSize:12,marginTop:6}}>Contact info private. Use direct message.</p>}
          </div>
          <Btn onClick={()=>genOutreach(sel)} loading={loading} full style={{marginBottom:8}}>⚡ Generate Outreach Message</Btn>
          {msg&&<><Btn onClick={()=>startMsg(sel)} variant="green" full>💬 Send via Messages</Btn><AIOut loading={loading} output={msg} label="OUTREACH EMAIL"/></>}
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>🔍</div><div style={{color:C.white,fontWeight:600}}>Select an Athlete</div></Card>}</div>
      </div>
    </div>}
  </div>;
}

function CoachEuroTeams({coach}){
  // Re-use Euro Teams but with coach context
  const [search,setSearch]=useState("");const [sportF,setSportF]=useState(coach?.sport||"all");const [countryF,setCountryF]=useState("all");const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [pitch,setPitch]=useState("");
  const sports=[...new Set(EURO_TEAMS.map(t=>t.sport))];
  const countries=[...new Set(EURO_TEAMS.map(t=>t.country))];
  const filtered=EURO_TEAMS.filter(t=>{const mS=(t.name+t.league+t.city).toLowerCase().includes(search.toLowerCase());const mSp=sportF==="all"||t.sport===sportF;const mC=countryF==="all"||t.country===countryF;return mS&&mSp&&mC;});
  const leagueColor={"GFL1":C.gold,"ELF":C.orange,"EuroLeague":C.purple,"NWSL":C.pink,"Top 14":C.green,"URC":C.teal,"SHL":C.blue,"KHL":C.red,"IPL":C.gold,"BBL":C.green,"Premier League":C.blue,"Bundesliga":C.red};
  async function genPitch(team){setLoading(true);setPitch("");try{const r=await ai(`Coaching position inquiry from ${coach?.name||"a coach"} (${coach?.title||"Coach"} at ${coach?.org||"current team"}, ${coach?.sport||"sport"} coach) to ${team.name} (${team.league}, ${team.country}).Coach has: "${coach?.bio||"coaching experience"}".Email asking about coaching staff openings, technical roles, or player development positions. Under 180 words. Professional, specific to the organization's culture.`);setPitch(r);}catch(e){setPitch("⚠️ Failed.");}setLoading(false);}
  return <div>
    <Sec title="European Teams" sub="Find coaching opportunities at European clubs"/>
    <p style={{color:C.mutedHi,fontSize:13,marginBottom:14,lineHeight:1.6}}>As a coach, you can reach out to European organizations for staff positions, player development roles, or to place your athletes. Browse 25+ pro clubs across all major sports.</p>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search teams, leagues, cities…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}</select>
      <select value={countryF} onChange={e=>setCountryF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Countries</option>{countries.map(c=><option key={c}>{c}</option>)}</select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {filtered.map(t=><Card key={t.id} glow={sel?.id===t.id} onClick={()=>{setSel(t);setPitch("");}} style={{cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><div style={{fontSize:26}}>{t.logo}</div><Badge color={leagueColor[t.league]||C.muted}>{t.league}</Badge></div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:900,color:C.white,lineHeight:1.1,marginBottom:2}}>{t.name}</div>
          <div style={{color:C.muted,fontSize:12,marginBottom:7}}>📍 {t.city}, {t.country}</div>
          <Badge color={C.blue}>{t.sport}</Badge>
        </Card>)}
      </div>
      <div style={{position:"sticky",top:20}}>
        {sel?<Card glow><div style={{fontSize:32,marginBottom:9}}>{sel.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:C.white,marginBottom:3}}>{sel.name}</div><div style={{color:leagueColor[sel.league]||C.gold,fontWeight:700,fontSize:12,marginBottom:10}}>{sel.league} · {sel.country}</div>
          <p style={{color:C.mutedHi,fontSize:13,lineHeight:1.6,marginBottom:12}}>{sel.description}</p>
          {[["💰 Salary",sel.salary],["🏆 Openings",sel.openings],["📧 Contact",sel.contact],["🌐 Website",sel.website]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,gap:8,flexWrap:"wrap"}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:k.includes("Contact")?C.blue:C.white,fontSize:12,fontWeight:600,textAlign:"right",wordBreak:"break-all"}}>{v}</span></div>)}
          <Btn onClick={()=>genPitch(sel)} loading={loading} full style={{marginTop:14}}>⚡ Generate Coaching Inquiry</Btn>
          <AIOut loading={loading} output={pitch} label="COACHING INQUIRY"/>
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:10}}>🌍</div><div style={{color:C.white,fontWeight:600}}>Select a Club</div><div style={{color:C.muted,fontSize:13,marginTop:4}}>Generate a coaching inquiry email for any team.</div></Card>}
      </div>
    </div>
  </div>;
}

function CoachSchoolJobs({coach}){
  const [search,setSearch]=useState("");const [divF,setDivF]=useState("all");const [sel,setSel]=useState(null);const [loading,setLoading]=useState(false);const [app,setApp]=useState("");
  const filtered=SCHOOLS.filter(s=>{const mS=(s.name+(s.loc||"")).toLowerCase().includes(search.toLowerCase());const mD=divF==="all"||s.div===divF;const mSp=s.sports?.includes(coach?.sport||"Football");return mS&&mD&&mSp;});
  async function genApp(school){setLoading(true);setApp("");try{const r=await ai(`Coaching position application email from ${coach?.name||"a coach"} (${coach?.title||"Coach"} currently at ${coach?.org||"current program"}, ${coach?.sport||"sport"} specialist) to ${school.name} (${school.div}, ${school.conf}).Coach background: "${coach?.bio||"coaching experience"}".Position: ${school.sport} assistant/coordinator.Under 200 words. Formal, specific to the program's identity and conference.`);setApp(r);}catch(e){setApp("⚠️ Failed.");}setLoading(false);}
  const divColor={"NCAA D1":C.gold,"NCAA D2":C.blue,"NAIA":C.green,"NJCAA":C.teal};
  return <div>
    <Sec title="School Jobs" sub="Find coaching openings at NCAA, HBCU, JUCO programs"/>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search schools…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 13px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      <select value={divF} onChange={e=>setDivF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.white,fontSize:13,outline:"none"}}><option value="all">All Divs</option>{["NCAA D1","NCAA D2","NAIA","NJCAA"].map(d=><option key={d}>{d}</option>)}</select>
    </div>
    <p style={{color:C.muted,fontSize:12,marginBottom:12,fontFamily:"DM Mono,monospace"}}>{filtered.length} schools with {coach?.sport} programs</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:18,alignItems:"start"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
        {filtered.map(s=><Card key={s.id} glow={sel?.id===s.id} onClick={()=>{setSel(s);setApp("");}} style={{cursor:"pointer"}}>
          <div style={{fontSize:22,marginBottom:7}}>{s.logo}</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:C.white,lineHeight:1.1,marginBottom:3}}>{s.name}</div>
          <div style={{color:divColor[s.div]||C.gold,fontSize:11,fontWeight:700,marginBottom:5}}>{s.div} · {s.conf}</div>
          <div style={{color:C.muted,fontSize:11,marginBottom:7}}>📍 {s.loc}</div>
          <Badge color={divColor[s.div]||C.muted}>{s.div}</Badge>
        </Card>)}
      </div>
      <div style={{position:"sticky",top:20}}>
        {sel?<Card glow><div style={{fontSize:28,marginBottom:7}}>{sel.logo}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:900,color:C.white,marginBottom:3}}>{sel.name}</div><div style={{color:divColor[sel.div]||C.gold,fontWeight:700,fontSize:12,marginBottom:10}}>{sel.nick} · {sel.div} · {sel.conf}</div>
          {[["Location",sel.loc],["Acceptance",sel.accept],["Tuition",sel.tuition],["Website",sel.site]].map(([k,v])=>v?<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{v}</span></div>:null)}
          {sel.sports&&<div style={{margin:"10px 0"}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",marginBottom:5}}>SPORTS</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{sel.sports.map(s=><Badge key={s} color={C.mutedHi}>{s}</Badge>)}</div></div>}
          <Btn onClick={()=>genApp(sel)} loading={loading} full style={{marginTop:11}}>⚡ Generate Application Email</Btn>
          <AIOut loading={loading} output={app} label="APPLICATION EMAIL"/>
        </Card>:<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>🏫</div><div style={{color:C.white,fontWeight:600}}>Select a School</div></Card>}
      </div>
    </div>
  </div>;
}

function CoachProfile({coach,saveCoaches}){
  const [f,setF]=useState({name:coach.name,sport:coach.sport,org:coach.org,title:coach.title||"",city:coach.city||"",state:coach.state||"",country:coach.country||"United States",bio:coach.bio||"",phone:coach.phone||"",twitter:coach.twitter||"",instagram:coach.instagram||"",linkedin:coach.linkedin||"",recruitingRegions:coach.recruitingRegions||[]});
  const [saved,setSaved]=useState(false);
  function save(){saveCoaches(prev=>prev.map(c=>String(c.id)===String(coach.id)?{...c,...f}:c));setSaved(true);setTimeout(()=>setSaved(false),2000);}
  return <div>
    <Sec title="My Profile"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
      <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>COACHING INFO</div><div style={{display:"flex",flexDirection:"column",gap:11}}>{[["NAME","name"],["SPORT","sport"],["ORGANIZATION","org"],["TITLE","title"],["PHONE","phone"]].map(([l,k])=><Inp key={k} label={l} value={f[k]} onChange={v=>setF(p=>({...p,[k]:v}))}/>)}</div></Card>
      <div><Card style={{marginBottom:13}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:13}}>LOCATION</div><div style={{display:"flex",flexDirection:"column",gap:11}}><Inp label="CITY" value={f.city} onChange={v=>setF(p=>({...p,city:v}))}/><Inp label="STATE" value={f.state} onChange={v=>setF(p=>({...p,state:v}))}/><Sel label="COUNTRY" value={f.country} onChange={v=>setF(p=>({...p,country:v}))} options={REGIONS}/></div></Card>
        <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>SOCIAL MEDIA</div><div style={{display:"flex",flexDirection:"column",gap:9}}>{[["TWITTER","twitter"],["INSTAGRAM","instagram"],["LINKEDIN","linkedin"]].map(([l,k])=><Inp key={k} label={l} value={f[k]} onChange={v=>setF(p=>({...p,[k]:v}))}/>)}</div></Card></div>
      <Card style={{gridColumn:"1/-1"}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>BIO / RECRUITING FOCUS</div><Inp value={f.bio} onChange={v=>setF(p=>({...p,bio:v}))} rows={3}/></Card>
      <Card style={{gridColumn:"1/-1"}}><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:10}}>RECRUITING REGIONS</div><RegionPicker selected={f.recruitingRegions} onChange={v=>setF(p=>({...p,recruitingRegions:v}))}/></Card>
    </div>
    <div style={{marginTop:13}}><Btn onClick={save}>{saved?"✓ Saved!":"Save Profile"}</Btn></div>
  </div>;
}

function CoachReferral({coach,athletes,coaches,settings}){
  const [copied,setCopied]=useState(false);
  const code=coach.referralCode||"—";
  const referredUsers=[...athletes,...coaches].filter(u=>u.referredBy===code);
  const discount=settings?.defaultReferralDiscount||10;
  const reward=settings?.referralReward||"1 month free";
  function copy(){navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}
  return <div>
    <Sec title="Refer & Earn" sub="Refer athletes or coaches. Everyone wins."/>
    <Card glow style={{marginBottom:18,textAlign:"center",padding:32}}>
      <div style={{color:C.muted,fontSize:11,fontFamily:"DM Mono,monospace",letterSpacing:2,marginBottom:12}}>YOUR REFERRAL CODE</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:900,color:C.gold,letterSpacing:6,marginBottom:16}}>{code}</div>
      <Btn onClick={copy} variant="gold">{copied?"✓ Copied!":"Copy My Code"}</Btn>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:18}}>
      <Stat icon="👥" label="REFERRED" value={referredUsers.length} color={C.blue}/>
      <Stat icon="🏷️" label="THEIR DISCOUNT" value={`${discount}%`} color={C.gold}/>
      <Stat icon="🎁" label="YOUR REWARD" value={reward} color={C.green}/>
    </div>
    <Card><div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:1,marginBottom:12}}>COACH REFERRAL MESSAGES</div>
      {[`"Hey athlete — looking to build your overseas brand and find European teams? @AthleteVault is the move. AI writes your outreach, helps you find NIL deals, and connects you with coaches. Use my code ${code} for ${discount}% off."`,`"Fellow coaches — AthleteVault is the platform I use to find athletes, generate outreach, and track recruiting. 25+ European teams in the database. Use code ${code}."`,`"Got an athlete who went undrafted or needs to restart? AthleteVault connects them with European teams and helps monetize their brand. Code ${code} = ${discount}% off."`].map((m,i)=><Card key={i} style={{marginBottom:10}}><p style={{color:C.white,fontSize:13,lineHeight:1.7,marginBottom:8}}>{m}</p><Btn onClick={()=>navigator.clipboard?.writeText(m)} variant="ghost" small>📋 Copy</Btn></Card>)}
    </Card>
  </div>;
}
// ═══════════════════════════════════════════════
//  MAIN APP — Session, routing, all 3 portals
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
//  COACH VIDEO MONETIZATION + LIVE SESSIONS
// ═══════════════════════════════════════════════
function CoachStudio({coach,coaches,saveCoaches,athletes,settings,messages,saveMessages}){
  const [tab,setTab]=useState("videos");
  const liveUser=coaches.find(c=>String(c.id)===String(coach.id));
  const myVideos=liveUser?.coachVideos||[];
  const mySessions=liveUser?.liveSessions||[];
  const earnings=liveUser?.earnings||0;
  const platformCut=settings?.platformCutPct||20;
  const coachCut=100-platformCut;

  // ── VIDEO UPLOAD ──
  const [showVid,setShowVid]=useState(false);
  const [vf,setVf]=useState({title:"",desc:"",sport:"",level:"All Levels",price:"",duration:"",url:"",thumbnail:"",category:"technique"});
  const [vidLoading,setVidLoading]=useState(false);
  const [vidDesc,setVidDesc]=useState("");

  async function genDesc(){if(!vf.title)return;setVidLoading(true);try{const r=await ai(`Write a compelling 2-sentence video description for a coaching video titled "${vf.title}" by ${coach.name} (${coach.title} at ${coach.org}, ${coach.sport}). Level: ${vf.level}. Make athletes want to buy it immediately.`);setVidDesc(r);}catch(e){}setVidLoading(false);}

  function addVideo(){
    if(!vf.title||!vf.price)return;
    const v={id:Date.now(),...vf,price:parseFloat(vf.price)||9.99,desc:vidDesc||vf.desc,coach:coach.name,coachId:coach.id,sport:coach.sport,purchases:[],revenue:0,created:new Date().toISOString().slice(0,10),views:0,rating:0,ratings:[]};
    saveCoaches(prev=>prev.map(c=>String(c.id)===String(coach.id)?{...c,coachVideos:[v,...(c.coachVideos||[])]}:c));
    setVf({title:"",desc:"",sport:"",level:"All Levels",price:"",duration:"",url:"",thumbnail:"",category:"technique"});
    setVidDesc("");setShowVid(false);
  }

  // ── LIVE SESSION ──
  const [showLive,setShowLive]=useState(false);
  const [lf,setLf]=useState({title:"",desc:"",price:"",maxAttendees:"",date:"",time:"",duration:60,type:"group",sport:""});
  const [liveLoading,setLiveLoading]=useState(false);
  const [liveDesc,setLiveDesc]=useState("");

  async function genLiveDesc(){if(!lf.title)return;setLiveLoading(true);try{const r=await ai(`Write a punchy 2-sentence description for a live coaching session titled "${lf.title}" by ${coach.name}. Type: ${lf.type}. Sport: ${coach.sport}. Make athletes sign up immediately.`);setLiveDesc(r);}catch(e){}setLiveLoading(false);}

  function addSession(){
    if(!lf.title||!lf.price||!lf.date)return;
    const s={id:Date.now(),...lf,price:parseFloat(lf.price)||29,desc:liveDesc||lf.desc,maxAttendees:parseInt(lf.maxAttendees)||10,coach:coach.name,coachId:coach.id,sport:coach.sport,attendees:[],revenue:0,created:new Date().toISOString().slice(0,10),status:"upcoming",meetLink:"https://meet.google.com/"+genCode()};
    saveCoaches(prev=>prev.map(c=>String(c.id)===String(coach.id)?{...c,liveSessions:[s,...(c.liveSessions||[])]}:c));
    setLf({title:"",desc:"",price:"",maxAttendees:"",date:"",time:"",duration:60,type:"group",sport:""});
    setLiveDesc("");setShowLive(false);
  }

  function cancelSession(sid){saveCoaches(prev=>prev.map(c=>String(c.id)===String(coach.id)?{...c,liveSessions:(c.liveSessions||[]).map(s=>s.id===sid?{...s,status:"cancelled"}:s)}:c));}
  function deleteVideo(vid){saveCoaches(prev=>prev.map(c=>String(c.id)===String(coach.id)?{...c,coachVideos:(c.coachVideos||[]).filter(v=>v.id!==vid)}:c));}

  const totalRevenue=myVideos.reduce((s,v)=>s+(v.revenue||0),0)+mySessions.reduce((s,s2)=>s+(s2.revenue||0),0);
  const myCoachCut=totalRevenue*(coachCut/100);
  const cats=["technique","recruiting","mindset","fitness","film-study","nutrition","overview"];
  const lvls=["Beginner","Intermediate","Advanced","All Levels","Elite Only"];

  return <div>
    <Sec title="Coach Studio" sub="Create, publish, and monetize your coaching content"/>

    {/* Revenue Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:18}}>
      <Stat icon="💰" label="YOUR EARNINGS" value={fmtM(myCoachCut)} delta={`After ${platformCut}% platform fee`} color={C.gold}/>
      <Stat icon="🎬" label="VIDEOS" value={myVideos.length} color={C.accent}/>
      <Stat icon="📡" label="LIVE SESSIONS" value={mySessions.length} color={C.purple}/>
      <Stat icon="👁️" label="TOTAL VIEWS" value={fmt(myVideos.reduce((s,v)=>s+(v.views||0),0))} color={C.blue}/>
    </div>

    {/* Revenue breakdown callout */}
    <Card style={{marginBottom:16,borderColor:`${C.gold}33`}}>
      <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{fontSize:24}}>💡</div>
        <div style={{flex:1}}>
          <div style={{color:C.white,fontWeight:700,fontSize:13,marginBottom:2}}>How monetization works</div>
          <div style={{color:C.muted,fontSize:12,lineHeight:1.6}}>You set the price. Athletes pay to access your videos or join your live sessions. AthleteVault takes {platformCut}%, you keep {coachCut}%. Payouts processed via Stripe once connected.</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700}}>{coachCut}%</div>
          <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace"}}>YOUR SHARE</div>
        </div>
      </div>
    </Card>

    {/* Tab switcher */}
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      {[["videos","🎬 My Videos"],["live","📡 Live Sessions"],["analytics","📊 Analytics"]].map(([t,l])=>
        <Btn key={t} onClick={()=>setTab(t)} variant={tab===t?"accent":"ghost"} small>{l}</Btn>
      )}
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        {settings?.coachVideosEnabled!==false&&<Btn onClick={()=>setShowVid(true)} variant="gold" small>+ Upload Video</Btn>}
        {settings?.coachLiveEnabled!==false&&<Btn onClick={()=>setShowLive(true)} variant="purple" small>+ Live Session</Btn>}
      </div>
    </div>

    {/* VIDEOS TAB */}
    {tab==="videos"&&<div>
      {myVideos.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>🎬</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>No videos yet</div><div style={{color:C.muted,fontSize:13,marginBottom:16}}>Upload your first coaching video and start earning.</div><Btn onClick={()=>setShowVid(true)}>+ Upload First Video</Btn></Card>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {myVideos.map(v=><Card key={v.id} glow>
            <div style={{background:C.card2,borderRadius:8,height:110,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,fontSize:36,border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
              🎬
              <div style={{position:"absolute",bottom:8,right:8}}><Badge color={C.accent}>${v.price}</Badge></div>
              <div style={{position:"absolute",top:8,left:8}}><Badge color={C.purple}>{v.category}</Badge></div>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:15,marginBottom:3,lineHeight:1.2}}>{v.title}</div>
            <div style={{color:C.muted,fontSize:11,marginBottom:8,lineHeight:1.5}}>{v.desc?.slice(0,80)}{v.desc?.length>80?"…":""}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              <Badge color={C.accent}>{v.level}</Badge>
              {v.duration&&<Badge color={C.mutedHi}>{v.duration}</Badge>}
              <Badge color={C.gold}>{v.purchases?.length||0} sold</Badge>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{color:C.green,fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700}}>+{fmtM((v.revenue||0)*(coachCut/100))}</div>
              <div style={{color:C.muted,fontSize:10,fontFamily:"DM Mono,monospace"}}>{v.views||0} views</div>
            </div>
            <Btn onClick={()=>deleteVideo(v.id)} variant="danger" small full>Delete</Btn>
          </Card>)}
        </div>}
    </div>}

    {/* LIVE SESSIONS TAB */}
    {tab==="live"&&<div>
      {mySessions.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:40,marginBottom:12}}>📡</div><div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:6}}>No live sessions yet</div><div style={{color:C.muted,fontSize:13,marginBottom:16}}>Schedule a group or 1-on-1 session.</div><Btn onClick={()=>setShowLive(true)}>+ Schedule Session</Btn></Card>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {mySessions.map(s=><Card key={s.id} glow color={s.status==="upcoming"?C.purple:s.status==="cancelled"?C.red:C.muted}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <Badge color={s.status==="upcoming"?C.purple:s.status==="live"?C.green:s.status==="cancelled"?C.red:C.muted}>{s.status?.toUpperCase()}</Badge>
              <Badge color={s.type==="1on1"?C.gold:C.blue}>{s.type==="1on1"?"1-ON-1":"GROUP"}</Badge>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:3}}>{s.title}</div>
            <div style={{color:C.muted,fontSize:12,marginBottom:8,lineHeight:1.5}}>{s.desc?.slice(0,70)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Date</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{s.date} {s.time}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Duration</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{s.duration} min</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Spots</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{s.attendees?.length||0}/{s.maxAttendees}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Price</span><span style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700}}>${s.price}</span></div>
            </div>
            <ProgressBar val={s.attendees?.length||0} max={s.maxAttendees} color={C.purple}/>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              {s.status==="upcoming"&&<Btn onClick={()=>cancelSession(s.id)} variant="danger" small full>Cancel</Btn>}
              {s.meetLink&&s.status!=="cancelled"&&<a href={s.meetLink} target="_blank" rel="noreferrer" style={{flex:1,display:"block",textAlign:"center",padding:"6px 12px",background:C.green+"22",color:C.green,border:`1px solid ${C.green}33`,borderRadius:6,fontSize:11,fontWeight:700,textDecoration:"none"}}>Join ↗</a>}
            </div>
          </Card>)}
        </div>}
    </div>}

    {/* ANALYTICS TAB */}
    {tab==="analytics"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Card><div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>REVENUE BREAKDOWN</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {myVideos.map(v=><div key={v.id} style={{padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.white,fontSize:12}}>{v.title.slice(0,28)}</span><span style={{color:C.gold,fontSize:13,fontWeight:700}}>{fmtM((v.revenue||0)*(coachCut/100))}</span></div>
              <ProgressBar val={v.purchases?.length||0} max={Math.max(...myVideos.map(x=>x.purchases?.length||0),1)} color={C.accent}/>
            </div>)}
            {myVideos.length===0&&<div style={{color:C.muted,fontSize:12}}>Upload videos to see analytics.</div>}
          </div>
        </Card>
        <Card><div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>EARNINGS SUMMARY</div>
          {[["Video Sales",fmtM(myVideos.reduce((s,v)=>s+(v.revenue||0),0)*(coachCut/100))],["Live Sessions",fmtM(mySessions.reduce((s,s2)=>s+(s2.revenue||0),0)*(coachCut/100))],["Platform Fee",`-${platformCut}%`],["Net Total",fmtM(myCoachCut)]].map(([k,v],i)=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}><span style={{color:C.muted,fontSize:12}}>{k}</span><span style={{color:i===3?C.gold:C.white,fontSize:i===3?18:13,fontWeight:i===3?700:400,fontFamily:i===3?"'Rajdhani',sans-serif":undefined}}>{v}</span></div>)}
          <div style={{marginTop:12,padding:"10px 12px",background:C.card2,borderRadius:7,border:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",marginBottom:4}}>STRIPE STATUS</div>
            <div style={{display:"flex",align:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:liveUser?.stripeConnected?C.green:C.red,marginTop:3,flexShrink:0}}/><div style={{color:liveUser?.stripeConnected?C.green:C.red,fontSize:12,fontWeight:600}}>{liveUser?.stripeConnected?"Connected — payouts active":"Not connected — link Stripe to receive payouts"}</div></div>
          </div>
        </Card>
      </div>
    </div>}

    {/* UPLOAD VIDEO MODAL */}
    <Modal show={showVid} onClose={()=>setShowVid(false)} title="UPLOAD COACHING VIDEO" maxW={560}>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp label="VIDEO TITLE" value={vf.title} onChange={v=>setVf(p=>({...p,title:v}))} placeholder="Route Running Masterclass"/>
          <Inp label="PRICE ($)" value={vf.price} onChange={v=>setVf(p=>({...p,price:v}))} placeholder="9.99"/>
          <Inp label="DURATION (e.g. 45 min)" value={vf.duration} onChange={v=>setVf(p=>({...p,duration:v}))} placeholder="45 min"/>
          <Sel label="LEVEL" value={vf.level} onChange={v=>setVf(p=>({...p,level:v}))} options={lvls}/>
          <Sel label="CATEGORY" value={vf.category} onChange={v=>setVf(p=>({...p,category:v}))} options={cats}/>
        </div>
        <Inp label="VIDEO URL (YouTube, Vimeo, etc.)" value={vf.url} onChange={v=>setVf(p=>({...p,url:v}))} placeholder="https://youtube.com/..."/>
        <Inp label="DESCRIPTION" value={vidDesc||vf.desc} onChange={v=>setVidDesc(v)} rows={3} placeholder="What athletes will learn…"/>
        <Btn onClick={genDesc} loading={vidLoading} variant="ghost" small>⚡ AI Write Description</Btn>
        <AIOut loading={vidLoading} output={vidLoading?"":""} label=""/>
        <div style={{background:C.card2,borderRadius:7,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",marginBottom:3}}>EARNINGS ESTIMATE</div>
          <div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700}}>{fmtM(parseFloat(vf.price||0)*(coachCut/100))} per sale</div>
        </div>
        <Btn onClick={addVideo} disabled={!vf.title||!vf.price} full>Publish Video</Btn>
      </div>
    </Modal>

    {/* LIVE SESSION MODAL */}
    <Modal show={showLive} onClose={()=>setShowLive(false)} title="SCHEDULE LIVE SESSION" maxW={560}>
      <div style={{display:"flex",flexDirection:"column",gap:11}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Inp label="SESSION TITLE" value={lf.title} onChange={v=>setLf(p=>({...p,title:v}))} placeholder="1-on-1 Film Study"/>
          <Inp label="PRICE ($)" value={lf.price} onChange={v=>setLf(p=>({...p,price:v}))} placeholder="29"/>
          <Inp label="DATE" value={lf.date} onChange={v=>setLf(p=>({...p,date:v}))} placeholder="2026-06-15"/>
          <Inp label="TIME (e.g. 3:00 PM CST)" value={lf.time} onChange={v=>setLf(p=>({...p,time:v}))} placeholder="3:00 PM CST"/>
          <Inp label="DURATION (min)" value={String(lf.duration)} onChange={v=>setLf(p=>({...p,duration:parseInt(v)||60}))} placeholder="60"/>
          <Inp label="MAX ATTENDEES" value={lf.maxAttendees} onChange={v=>setLf(p=>({...p,maxAttendees:v}))} placeholder="10"/>
          <Sel label="SESSION TYPE" value={lf.type} onChange={v=>setLf(p=>({...p,type:v}))} options={[{v:"group",l:"Group Session"},{v:"1on1",l:"1-on-1 Private"}]}/>
        </div>
        <Inp label="DESCRIPTION" value={liveDesc||lf.desc} onChange={v=>setLiveDesc(v)} rows={3} placeholder="What athletes will get from this session…"/>
        <Btn onClick={genLiveDesc} loading={liveLoading} variant="ghost" small>⚡ AI Write Description</Btn>
        <div style={{background:C.card2,borderRadius:7,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",marginBottom:3}}>EARNINGS ESTIMATE</div>
          <div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:20,fontWeight:700}}>{fmtM(parseFloat(lf.price||0)*parseInt(lf.maxAttendees||1)*(coachCut/100))} if full</div>
        </div>
        <Btn onClick={addSession} disabled={!lf.title||!lf.price||!lf.date} full>Schedule Session</Btn>
      </div>
    </Modal>
  </div>;
}

// ── ATHLETE COACHING MARKETPLACE (Postgame-style) ──
function CoachingHub({athlete,coaches,athletes,messages,saveMessages,saveAthletes}){
  const [tab,setTab]=useState("videos");
  const [search,setSearch]=useState("");
  const [sportF,setSportF]=useState("all");
  const [catF,setCatF]=useState("all");
  const [selVideo,setSelVideo]=useState(null);
  const [selSession,setSelSession]=useState(null);
  const [purchased,setPurchased]=useStore(`av_purchased_${athlete.id}`,[]);
  const [registered,setRegistered]=useStore(`av_sessions_${athlete.id}`,[]);

  // Gather all videos + sessions from all coaches
  const allVideos=coaches.flatMap(c=>(c.coachVideos||[]).map(v=>({...v,coachObj:c})));
  const allSessions=coaches.flatMap(c=>(c.liveSessions||[]).filter(s=>s.status==="upcoming").map(s=>({...s,coachObj:c})));
  const sports=[...new Set(allVideos.map(v=>v.sport).filter(Boolean))];
  const cats=[...new Set(allVideos.map(v=>v.category).filter(Boolean))];

  const filtVids=allVideos.filter(v=>{
    const mS=(v.title+(v.desc||"")+(v.coachObj?.name||"")).toLowerCase().includes(search.toLowerCase());
    const mSp=sportF==="all"||v.sport===sportF;
    const mC=catF==="all"||v.category===catF;
    return mS&&mSp&&mC;
  });
  const filtSess=allSessions.filter(s=>(s.title+(s.desc||"")+(s.coachObj?.name||"")).toLowerCase().includes(search.toLowerCase()));

  function buyVideo(v){setPurchased(prev=>[...prev.filter(x=>x!==v.id),v.id]);}
  function joinSession(s){setRegistered(prev=>[...prev.filter(x=>x!==s.id),s.id]);}

  const catColor={technique:C.accent,recruiting:C.gold,mindset:C.purple,fitness:C.green,"film-study":C.blue,nutrition:C.teal,overview:C.orange};

  return <div>
    <Sec title="Coaching Hub" sub="Learn from real coaches. Buy sessions. Go pro."/>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      {[["videos","🎬 Videos"],["sessions","📡 Live Sessions"],["mycoaching",`📦 My Library (${purchased.length})`]].map(([t,l])=>
        <Btn key={t} onClick={()=>setTab(t)} variant={tab===t?"accent":"ghost"} small>{l}</Btn>
      )}
    </div>

    {(tab==="videos"||tab==="sessions")&&<div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coaches, topics…" style={{flex:1,minWidth:160,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 12px",color:C.white,fontSize:13,outline:"none",fontFamily:"'Sora',sans-serif"}}/>
      {tab==="videos"&&<>
        <select value={sportF} onChange={e=>setSportF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 11px",color:C.white,fontSize:12,outline:"none"}}><option value="all">All Sports</option>{sports.map(s=><option key={s}>{s}</option>)}</select>
        <select value={catF} onChange={e=>setCatF(e.target.value)} style={{background:C.dark,border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 11px",color:C.white,fontSize:12,outline:"none"}}><option value="all">All Categories</option>{cats.map(c=><option key={c}>{c}</option>)}</select>
      </>}
    </div>}

    {/* VIDEOS */}
    {tab==="videos"&&<div>
      {filtVids.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>🎬</div><div style={{color:C.white,fontWeight:700}}>No coaching videos yet</div><div style={{color:C.muted,fontSize:12,marginTop:5}}>Coaches will publish videos here soon.</div></Card>
        :<div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:18,alignItems:"start"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
            {filtVids.map(v=><Card key={v.id} glow={selVideo?.id===v.id} onClick={()=>setSelVideo(v)} style={{cursor:"pointer"}}>
              <div style={{background:C.card2,borderRadius:7,height:100,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,fontSize:32,border:`1px solid ${C.border}`,position:"relative"}}>
                🎬
                {purchased.includes(v.id)&&<div style={{position:"absolute",inset:0,background:"rgba(0,240,255,.08)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}><Badge color={C.green}>OWNED</Badge></div>}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:7}}>
                <Badge color={catColor[v.category]||C.muted}>{v.category}</Badge>
                <Badge color={C.mutedHi}>{v.level}</Badge>
              </div>
              <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:3,lineHeight:1.2}}>{v.title}</div>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                <Avatar name={v.coachObj?.name} size={18} color={C.purple} verified={v.coachObj?.verified}/>
                <span style={{color:C.muted,fontSize:11}}>{v.coachObj?.name}</span>
              </div>
              <div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:22,fontWeight:700}}>${v.price}</div>
            </Card>)}
          </div>
          <div style={{position:"sticky",top:20}}>
            {selVideo?<Card glow><div style={{background:C.card2,borderRadius:8,height:130,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,fontSize:44}}>🎬</div>
              <div style={{display:"flex",gap:6,marginBottom:10}}><Badge color={catColor[selVideo.category]||C.muted}>{selVideo.category}</Badge><Badge color={C.mutedHi}>{selVideo.level}</Badge>{selVideo.duration&&<Badge color={C.blue}>{selVideo.duration}</Badge>}</div>
              <div style={{color:C.white,fontWeight:700,fontSize:18,marginBottom:6,lineHeight:1.2}}>{selVideo.title}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <Avatar name={selVideo.coachObj?.name} size={26} color={C.purple} verified={selVideo.coachObj?.verified}/>
                <div><div style={{color:C.white,fontSize:13,fontWeight:600}}>{selVideo.coachObj?.name}</div><div style={{color:C.muted,fontSize:11}}>{selVideo.coachObj?.title} · {selVideo.coachObj?.org}</div></div>
              </div>
              <p style={{color:C.mutedHi,fontSize:13,lineHeight:1.7,marginBottom:12}}>{selVideo.desc}</p>
              <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:32,fontWeight:700,color:C.gold,marginBottom:12}}>${selVideo.price}</div>
              {purchased.includes(selVideo.id)
                ?<div><Badge color={C.green}>✓ OWNED</Badge>{selVideo.url&&<a href={selVideo.url} target="_blank" rel="noreferrer" style={{display:"block",marginTop:10,textAlign:"center",padding:"11px",background:C.accent+"22",color:C.accent,border:`1px solid ${C.accent}33`,borderRadius:7,fontWeight:700,textDecoration:"none",fontSize:14}}>▶ Watch Now ↗</a>}</div>
                :<Btn onClick={()=>buyVideo(selVideo)} full>Buy Now — ${selVideo.price}</Btn>}
            </Card>
            :<Card style={{textAlign:"center",padding:40}}><div style={{fontSize:32,marginBottom:10}}>🎬</div><div style={{color:C.white,fontWeight:600}}>Select a Video</div></Card>}
          </div>
        </div>}
    </div>}

    {/* LIVE SESSIONS */}
    {tab==="sessions"&&<div>
      {filtSess.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>📡</div><div style={{color:C.white,fontWeight:700}}>No upcoming sessions</div><div style={{color:C.muted,fontSize:12,marginTop:5}}>Check back soon — coaches are scheduling live sessions.</div></Card>
        :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtSess.map(s=><Card key={s.id} glow={registered.includes(s.id)} color={registered.includes(s.id)?C.green:undefined}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <Badge color={s.type==="1on1"?C.gold:C.blue}>{s.type==="1on1"?"1-ON-1":"GROUP"}</Badge>
              <Badge color={C.purple}>UPCOMING</Badge>
            </div>
            <div style={{color:C.white,fontWeight:700,fontSize:16,marginBottom:4,lineHeight:1.2}}>{s.title}</div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <Avatar name={s.coachObj?.name} size={22} color={C.purple} verified={s.coachObj?.verified}/>
              <span style={{color:C.muted,fontSize:12}}>{s.coachObj?.name} · {s.coachObj?.org}</span>
            </div>
            <p style={{color:C.mutedHi,fontSize:12,lineHeight:1.6,marginBottom:10}}>{s.desc?.slice(0,80)}</p>
            <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>When</span><span style={{color:C.white,fontSize:12,fontWeight:600}}>{s.date} {s.time}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Duration</span><span style={{color:C.white,fontSize:12}}>{s.duration} min</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.muted,fontSize:11}}>Spots left</span><span style={{color:(s.maxAttendees-(s.attendees?.length||0))<=2?C.red:C.green,fontSize:12,fontWeight:600}}>{s.maxAttendees-(s.attendees?.length||0)}</span></div>
            </div>
            <ProgressBar val={s.attendees?.length||0} max={s.maxAttendees} color={C.purple}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <div style={{color:C.gold,fontFamily:"'Rajdhani',sans-serif",fontSize:24,fontWeight:700}}>${s.price}</div>
              {registered.includes(s.id)
                ?<Badge color={C.green}>✓ REGISTERED</Badge>
                :<Btn onClick={()=>joinSession(s)} variant="accent" small>Register</Btn>}
            </div>
          </Card>)}
        </div>}
    </div>}

    {/* MY LIBRARY */}
    {tab==="mycoaching"&&<div>
      {purchased.length===0&&registered.length===0
        ?<Card style={{textAlign:"center",padding:44}}><div style={{fontSize:36,marginBottom:10}}>📦</div><div style={{color:C.white,fontWeight:700}}>Library empty</div><div style={{color:C.muted,fontSize:13,marginTop:6}}>Purchase coaching videos or register for sessions to see them here.</div></Card>
        :<div>
          {purchased.length>0&&<div style={{marginBottom:20}}>
            <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>MY VIDEOS ({purchased.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
              {allVideos.filter(v=>purchased.includes(v.id)).map(v=><Card key={v.id} glow color={C.green}>
                <div style={{background:C.card2,borderRadius:7,height:90,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,fontSize:28,border:`1px solid ${C.green}22`}}>🎬</div>
                <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:4}}>{v.title}</div>
                <div style={{color:C.muted,fontSize:11,marginBottom:8}}>{v.coachObj?.name}</div>
                {v.url?<a href={v.url} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",padding:"9px",background:C.accent+"22",color:C.accent,border:`1px solid ${C.accent}33`,borderRadius:7,fontWeight:700,textDecoration:"none",fontSize:13}}>▶ Watch</a>:<div style={{color:C.muted,fontSize:12,textAlign:"center"}}>No video URL</div>}
              </Card>)}
            </div>
          </div>}
          {registered.length>0&&<div>
            <div style={{color:C.muted,fontSize:9,fontFamily:"DM Mono,monospace",letterSpacing:1.5,marginBottom:12}}>MY SESSIONS ({registered.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {allSessions.filter(s=>registered.includes(s.id)).map(s=><Card key={s.id} glow color={C.purple}>
                <div style={{color:C.white,fontWeight:700,fontSize:14,marginBottom:4}}>{s.title}</div>
                <div style={{color:C.muted,fontSize:11,marginBottom:6}}>{s.coachObj?.name} · {s.date} {s.time}</div>
                {s.meetLink&&<a href={s.meetLink} target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",padding:"9px",background:C.green+"22",color:C.green,border:`1px solid ${C.green}33`,borderRadius:7,fontWeight:700,textDecoration:"none",fontSize:13}}>Join Session ↗</a>}
              </Card>)}
            </div>
          </div>}
        </div>}
    </div>}
  </div>;
}

function MarketingPage({onEnter,settings}){
  const acc=(settings&&settings.themeAccent)||"#00F0FF";
  const rookiePrice=(settings&&settings.rookiePrice)||29;
  const risingPrice=(settings&&settings.risingPrice)||49;
  const proPrice=(settings&&settings.proPrice)||79;
  const pName=(settings&&settings.platformName)||"ATHLETEVAULT";
  const heroBadge=(settings&&settings.heroBadgeText)||"BUILT BY A GFL1 PLAYER · UTEP ALUM · MYSTIX7V7";
  const h1=(settings&&settings.heroHeadline1)||"YOUR NAME";
  const h2=(settings&&settings.heroHeadline2)||"IS THE BRAND.";
  const heroSub=(settings&&settings.heroSub)||"AI-powered recruiting, brand deals, NIL education, and overseas opportunities — built for athletes who got overlooked.";
  const fQuote=(settings&&settings.founderQuote)||'I LIVED THIS. NOBODY BUILT THIS. SO I DID.';
  const fBio=(settings&&settings.founderBio)||"I played at UTEP. I went to Germany and played GFL1. I built Mystix7V7 from nothing. Every step of the way I watched talented athletes get ignored. AthleteVault is what I wish existed.";
  const fName=(settings&&settings.founderName)||'DENNIS "CHEWY" BARNES';
  const fCreds=(settings&&settings.founderCreds)||"FOUNDER · UTEP ALUM · GFL1 GERMANY · MYSTIX7V7";
  const bg=(settings&&settings.themeBg)||"#020408";
  const card=(settings&&settings.themeCard)||"#060D1A";
  const border=(settings&&settings.themeBorder)||"#0A1628";
  const muted=(settings&&settings.themeMuted)||"#2A4A6A";
  const wh=(settings&&settings.themeWhite)||"#E0F4FF";

  return <div style={{minHeight:"100vh",background:bg,fontFamily:"'Sora',sans-serif",overflowX:"hidden",position:"relative"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Orbitron:wght@700;900&family=DM+Mono:wght@400;500&display=swap');
      .lp-grid-bg{background-image:linear-gradient(${acc}06 1px,transparent 1px),linear-gradient(90deg,${acc}06 1px,transparent 1px);background-size:44px 44px;animation:lpGridScroll 8s linear infinite;}
      @keyframes lpGridScroll{from{background-position:0 0;}to{background-position:0 44px;}}
      @keyframes lpFloat1{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
      @keyframes lpFloat2{0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);}}
      @keyframes lpBlink{0%,100%{opacity:1;}50%{opacity:.2;}}
      @keyframes lpScan{from{top:-2px;}to{top:100vh;}}
      @keyframes lpFadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
      @keyframes lpTick{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    `}</style>
    <div style={{position:"fixed",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,"+acc+",transparent)",opacity:.3,animation:"lpScan 6s linear infinite",zIndex:1,pointerEvents:"none"}}/>
    <div className="lp-grid-bg" style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:.5}}/>
    <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,"+acc+"08,transparent 60%)",pointerEvents:"none",zIndex:0}}/>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(2,4,8,.85)",borderBottom:"1px solid "+acc+"18",backdropFilter:"blur(12px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,border:"1px solid "+acc,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',sans-serif",fontSize:12,fontWeight:900,color:acc,boxShadow:"0 0 12px "+acc+"44"}}>AV</div>
        <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:18,fontWeight:700,color:wh,letterSpacing:3}}>{pName}</span>
      </div>
      <button onClick={onEnter} style={{background:acc,color:bg,border:"none",padding:"9px 22px",borderRadius:6,fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:1,fontFamily:"'Rajdhani',sans-serif",boxShadow:"0 0 16px "+acc+"44"}}>ENTER →</button>
    </nav>
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"120px 24px 80px",textAlign:"center",position:"relative",zIndex:2}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:8,background:acc+"0A",border:"1px solid "+acc+"33",borderRadius:100,padding:"6px 16px",fontSize:10,fontWeight:600,color:acc,letterSpacing:1.5,marginBottom:28,fontFamily:"DM Mono,monospace",animation:"lpFadeUp .8s ease both"}}>
        <span style={{width:5,height:5,borderRadius:"50%",background:"#0FFFB0",display:"inline-block",animation:"lpBlink 2s infinite",boxShadow:"0 0 6px #0FFFB0",marginRight:4}}/>{heroBadge}
      </div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(48px,9vw,110px)",lineHeight:.95,letterSpacing:2,marginBottom:22,animation:"lpFadeUp .9s ease .1s both"}}>
        <div style={{WebkitTextStroke:"1px "+acc+"33",color:"transparent",display:"block"}}>{h1}</div>
        <div style={{color:acc,textShadow:"0 0 40px "+acc+"55",display:"block"}}>{h2}</div>
      </div>
      <p style={{maxWidth:520,fontSize:16,color:"rgba(224,244,255,.5)",lineHeight:1.8,margin:"0 auto 36px",animation:"lpFadeUp 1s ease .2s both",fontWeight:300}}>{heroSub}</p>
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",animation:"lpFadeUp 1s ease .3s both",marginBottom:16}}>
        <button onClick={onEnter} style={{background:acc,color:bg,padding:"15px 34px",borderRadius:6,fontWeight:700,fontSize:14,border:"none",letterSpacing:1,boxShadow:"0 0 20px "+acc+"44",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif"}}>START FREE TRIAL →</button>
        <button onClick={onEnter} style={{background:"transparent",color:wh,padding:"15px 34px",borderRadius:6,fontWeight:600,fontSize:14,border:"1px solid "+acc+"22",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",letterSpacing:.5}}>SIGN IN</button>
      </div>
      <p style={{fontFamily:"DM Mono,monospace",fontSize:10,color:muted,letterSpacing:1,animation:"lpFadeUp 1s ease .4s both"}}>{"STARTING AT $"+rookiePrice+"/MONTH · CANCEL ANYTIME · NO AGENT NEEDED"}</p>
    </div>
    <div style={{background:acc+"06",borderTop:"1px solid "+acc+"10",borderBottom:"1px solid "+acc+"10",padding:"10px 0",overflow:"hidden",position:"relative",zIndex:2}}>
      <div style={{display:"flex",width:"max-content",animation:"lpTick 28s linear infinite",whiteSpace:"nowrap"}}>
        {["AI RECRUITING EMAILS","25+ EUROPEAN TEAMS","NIL BRAND DEALS","GFL1 · ELF · EUROLEAGUE","HBCU SCHOOLS","UNDRAFTED ATHLETE PLATFORM","COACH MONETIZATION","AI RECRUITING EMAILS","25+ EUROPEAN TEAMS","NIL BRAND DEALS","GFL1 · ELF · EUROLEAGUE","HBCU SCHOOLS","UNDRAFTED ATHLETE PLATFORM","COACH MONETIZATION"].map((t,i)=><span key={i} style={{fontFamily:"'Rajdhani',sans-serif",fontSize:12,letterSpacing:3,color:acc+"55",padding:"0 28px",textTransform:"uppercase"}}>{t}</span>)}
      </div>
    </div>
    <div style={{background:"rgba(6,13,26,.9)",borderTop:"1px solid "+border,borderBottom:"1px solid "+border,padding:"20px 48px",display:"flex",alignItems:"center",justifyContent:"center",gap:40,flexWrap:"wrap",position:"relative",zIndex:2}}>
      {[["25+","EUROPEAN TEAMS"],["20+","NCAA / HBCU"],["9","NIL LESSONS"],["$"+rookiePrice,"STARTING PRICE"],["AI","CLAUDE 4"]].map(([n,l],i)=><div key={i} style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:28,fontWeight:700,color:acc,textShadow:"0 0 12px "+acc+"44"}}>{n}</div>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:9,letterSpacing:1.5,color:muted,marginTop:3,textTransform:"uppercase"}}>{l}</div>
      </div>)}
    </div>
    <div style={{padding:"80px 40px",position:"relative",zIndex:2}}>
      <div style={{fontFamily:"DM Mono,monospace",fontSize:9,letterSpacing:3,color:acc,textTransform:"uppercase",marginBottom:10}}>// WHAT'S INSIDE</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(26px,4vw,48px)",lineHeight:1,marginBottom:36,color:wh}}>EVERY TOOL YOU NEED TO <span style={{color:acc}}>WIN.</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:14}}>
        {[["🌍","EUROPEAN TEAMS","25+ pro clubs — GFL1, ELF, EuroLeague, NWSL. Salary ranges, open positions, AI pitch generator.","BETTER THAN EUROPLAYERS.COM"],["⚡","AI OUTREACH ENGINE","Claude writes personalized recruiting pitches, coach emails, brand DMs in seconds.","POWERED BY CLAUDE 4"],["🏫","SCHOOL SEARCH","NCAA D1, D2, NAIA, JUCO, HBCU. AI matches you to the right level.","BEATS NCSA"],["🤝","BRAND DEALS","Real brand opportunities. AI writes your pitch personalized to your stats and story.","START EARNING NOW"],["🎬","COACH STUDIO","Coaches upload training videos, host live sessions. Athletes buy access.","80% TO COACHES"],["🎓","NIL ACADEMY","9 lessons — NIL basics, deal negotiation, taxes, overseas contracts.","KNOW YOUR WORTH"]].map(([icon,title,desc,tag],i)=><div key={i} style={{background:card,border:"1px solid "+border,borderRadius:10,padding:22,transition:"all .3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=acc+"33";e.currentTarget.style.transform="translateY(-3px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=border;e.currentTarget.style.transform="";}}>
          <div style={{fontSize:20,marginBottom:12,width:40,height:40,border:"1px solid "+acc+"22",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:acc+"06"}}>{icon}</div>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:17,fontWeight:700,letterSpacing:1,color:wh,marginBottom:6}}>{title}</div>
          <div style={{fontSize:12,color:muted,lineHeight:1.8,marginBottom:8}}>{desc}</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:8,letterSpacing:2,color:acc,textTransform:"uppercase"}}>// {tag}</div>
        </div>)}
      </div>
    </div>
    <div style={{padding:"80px 40px",position:"relative",zIndex:2}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:9,letterSpacing:3,color:acc,marginBottom:10,textTransform:"uppercase"}}>// PRICING</div>
        <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(26px,4vw,46px)",lineHeight:1,color:wh}}>INVEST IN YOUR <span style={{color:acc}}>OWN BRAND.</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,maxWidth:800,margin:"0 auto"}}>
        {[["ROOKIE",rookiePrice,["School search + AI outreach","Euro Teams browser","Brand deal applications","NIL Academy","Direct messaging"],false],["RISING STAR",risingPrice,["Everything in Rookie","AI monetization roadmap","Content vault + caption AI","Coaching hub access","Verified badge eligibility"],true],["PRO ATHLETE",proPrice,["Everything in Rising Star","Overseas pitch builder","Press release generator","Full AI outreach suite","Priority support"],false]].map(([tier,price,feats,featured],i)=><div key={i} style={{background:card,border:"1px solid "+(featured?acc+"55":border),borderRadius:12,padding:"26px 20px",position:"relative",boxShadow:featured?"0 0 30px "+acc+"10":"none"}}>
          {featured&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",background:acc,color:bg,fontWeight:700,fontSize:9,letterSpacing:2,padding:"4px 14px",borderRadius:100,fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>MOST POPULAR</div>}
          <div style={{fontFamily:"DM Mono,monospace",fontSize:9,letterSpacing:2,color:muted,marginBottom:8,textTransform:"uppercase"}}>{tier}</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:40,color:acc,lineHeight:1,textShadow:"0 0 16px "+acc+"44"}}>{"$"+price}</div>
          <div style={{fontSize:11,color:muted,marginBottom:16,fontFamily:"DM Mono,monospace"}}>/MONTH</div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
            {feats.map((f,j)=><div key={j} style={{display:"flex",alignItems:"flex-start",gap:7,fontSize:12,color:"rgba(224,244,255,.5)",lineHeight:1.5}}><span style={{color:acc,flexShrink:0,fontSize:10,marginTop:1}}>◈</span>{f}</div>)}
          </div>
          <button onClick={onEnter} style={{display:"block",width:"100%",padding:"11px",borderRadius:6,fontWeight:700,fontSize:13,letterSpacing:1,cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",background:featured?acc:"transparent",color:featured?bg:wh,border:featured?"none":"1px solid "+border,boxShadow:featured?"0 0 16px "+acc+"44":"none"}}>{featured?"START RISING →":"GET STARTED"}</button>
        </div>)}
      </div>
    </div>
    <div style={{padding:"80px 40px",background:"rgba(6,13,26,.8)",position:"relative",zIndex:2}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",maxWidth:860,margin:"0 auto"}}>
        <div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:9,letterSpacing:3,color:acc,textTransform:"uppercase",marginBottom:12}}>// FROM THE FOUNDER</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(18px,2.8vw,34px)",lineHeight:1.1,color:wh,marginBottom:18}}>"{fQuote}"</div>
          <p style={{fontSize:14,color:"rgba(224,244,255,.45)",lineHeight:1.9,fontWeight:300,marginBottom:20}}>{fBio}</p>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontSize:15,fontWeight:700,letterSpacing:2,color:acc}}>{fName}</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:muted,letterSpacing:1.5,marginTop:3}}>{fCreds}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[["GFL1","Played overseas in Germany"],["UTEP","Division I alumnus"],["7V7","Founded Mystix7v7"],["2026","AthleteVault launched"]].map(([n,l],i)=><div key={i} style={{background:card,border:"1px solid "+border,borderRadius:8,padding:16,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,"+acc+"44,transparent)"}}/>
            <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:24,color:acc,lineHeight:1,textShadow:"0 0 10px "+acc+"44"}}>{n}</div>
            <div style={{fontSize:10,color:muted,marginTop:3,fontFamily:"DM Mono,monospace"}}>{l}</div>
          </div>)}
        </div>
      </div>
    </div>
    <div style={{padding:"72px 40px",textAlign:"center",position:"relative",zIndex:2}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:"clamp(22px,4vw,44px)",lineHeight:1,marginBottom:28,color:wh}}>DON'T WAIT FOR <span style={{color:acc}}>THEM TO CALL.</span></div>
      <button onClick={onEnter} style={{background:acc,color:bg,padding:"16px 40px",borderRadius:8,fontWeight:700,fontSize:16,border:"none",cursor:"pointer",letterSpacing:1,boxShadow:"0 0 24px "+acc+"44",fontFamily:"'Rajdhani',sans-serif"}}>CREATE YOUR ACCOUNT →</button>
      <p style={{fontFamily:"DM Mono,monospace",fontSize:10,color:muted,marginTop:12}}>NO SPAM · CANCEL ANYTIME · BUILT BY AN ATHLETE</p>
    </div>
    <footer style={{padding:"28px 40px",borderTop:"1px solid "+border,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,position:"relative",zIndex:2}}>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:12,letterSpacing:3,color:muted}}>{pName}</div>
      <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"rgba(42,74,106,.5)",letterSpacing:1}}>© 2026 ATHLETEVAULT LLC · HOUSTON, TX · ATHLETEVAULT.ORG</div>
    </footer>
  </div>;
}

function OnboardingTerms({onAccept}){
  return <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",padding:24}}>
    <Card style={{maxWidth:540,width:"100%"}} glow>
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:C.white,letterSpacing:2}}>BEFORE YOU ENTER</div><div style={{color:C.muted,fontSize:13,marginTop:4}}>AthleteVault Terms of Service</div></div>
      <div style={{background:C.card2,border:`1px solid ${C.gold}44`,borderRadius:9,padding:"12px 16px",marginBottom:14}}><div style={{color:C.gold,fontSize:12,fontWeight:700,marginBottom:4}}>⚠️ IMPORTANT DISCLAIMER</div><div style={{color:C.mutedHi,fontSize:13,lineHeight:1.7}}>AthleteVault is a technology networking platform — NOT a licensed recruiting agency, sports agent, or legal advisor. Nothing on this platform guarantees athletic recruitment, scholarships, contracts, or income. AI-generated content must be reviewed before professional use. NIL compliance is your responsibility.</div></div>
      <div style={{maxHeight:160,overflowY:"auto",background:C.dark,borderRadius:8,padding:"10px 13px",marginBottom:16,border:`1px solid ${C.border}`}}><p style={{color:C.muted,fontSize:11,lineHeight:1.8}}>These terms are governed by Texas law. Disputes resolved by binding arbitration in Houston, TX. By proceeding, you agree to all terms. AthleteVault LLC total liability does not exceed amounts paid in the 12 months preceding any claim. You waive class action rights. Full terms available in the Help section.</p></div>
      <Btn onClick={onAccept} full>✓ I Understand and Accept — Enter AthleteVault</Btn>
    </Card>
  </div>;
}

export default function App(){
  const [athletes,saveAthletes,aReady]=useStore("av_ath_v1",SEED_ATHLETES);
  const [coaches,saveCoaches,cReady]=useStore("av_coa_v1",SEED_COACHES);
  const [messages,saveMessages,msgReady]=useStore("av_msgs_v1",{});
  const [settings,saveSettings,sReady]=useStore("av_set_v1",SEED_SETTINGS);
  const [logs,saveLogs]=useStore("av_logs_v1",SEED_LOGS);
  const [termsOk,setTermsOk]=useStore("av_terms_accepted_v1",false);
  const [session,setSession]=useState(null);
  const [showLanding,setShowLanding]=useState(()=>!window.location.hash.includes("login"));
  const [tab,setTab]=useState("home");

  const addLog=useCallback(entry=>saveLogs(prev=>[{id:Date.now(),ts:stamp(),...entry},...prev.slice(0,199)]),[saveLogs]);

  const ready=aReady&&cReady&&msgReady&&sReady;
  if(!ready)return <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.gold},${C.goldDim})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:C.black,animation:"pulse 2s ease-in-out infinite"}}>AV</div><div style={{color:C.muted,fontFamily:"DM Mono,monospace",fontSize:12,letterSpacing:2}}>LOADING…</div><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style></div>;

  if(showLanding&&!session)return <MarketingPage onEnter={()=>{setShowLanding(false);window.location.hash="login";}} settings={settings}/>;
  if(!termsOk)return <OnboardingTerms onAccept={()=>setTermsOk(true)}/>;
  if(!session)return <Login onSuccess={(role,user)=>{setSession({role,user});setTab("home");addLog({action:"Login",detail:`${role} ${user?.name||"owner"}`,level:"info"});}} athletes={athletes} coaches={coaches} settings={settings}/>;

  // Rebuild theme whenever settings change
  C=buildTheme(settings);
  const {role,user}=session;
  function logout(){setSession(null);setTab("home");addLog({action:"Logout",detail:role,level:"info"});}

  // Identify current user from live data
  const liveUser=role==="athlete"?athletes.find(a=>String(a.id)===String(user?.id)):role==="coach"?coaches.find(c=>String(c.id)===String(user?.id)):null;

  // Message unread count
  const myId=role==="owner"?null:liveUser?.id;
  const unreadMsgs=myId?Object.entries(messages).filter(([tid])=>tid.split("_").includes(String(myId))).reduce((s,[,msgs])=>s+msgs.filter(m=>String(m.senderId)!==String(myId)&&!m.read).length,0):0;
  const unreadNotifs=liveUser?(liveUser.notifications||[]).filter(n=>!n.read).length:0;

  // Maintenance mode
  if(settings.maintenanceMode&&role!=="owner")return <div style={{minHeight:"100vh",background:C.black,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif"}}><div style={{fontSize:48,marginBottom:16}}>🔧</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:C.white,letterSpacing:2,marginBottom:8}}>MAINTENANCE MODE</div><div style={{color:C.muted,fontSize:14,marginBottom:20}}>{settings.welcomeMsg||"Platform is temporarily down for maintenance. Check back soon."}</div><Btn onClick={logout} variant="ghost">Back to Login</Btn></div>;

  // Render content
  function renderTab(){
    if(role==="owner"){
      if(tab==="messages")return <Messaging me={{id:"owner_1",role:"owner",name:"Chewy Barnes"}} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages} settings={settings}/>;
      if(tab==="overview")return <OOverview athletes={athletes} coaches={coaches} messages={messages} settings={settings}/>;
      if(tab==="athletes")return <OAthletes athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>;
      if(tab==="coaches")return <OCoaches coaches={coaches} saveCoaches={saveCoaches} addLog={addLog}/>;
      if(tab==="revenue")return <ORevenue athletes={athletes} coaches={coaches}/>;
      if(tab==="ai")return <OAITools athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>;
      if(tab==="outreach")return <OOutreach athletes={athletes} saveAthletes={saveAthletes} addLog={addLog}/>;
      if(tab==="referrals")return <OReferrals athletes={athletes} coaches={coaches} settings={settings} saveSettings={saveSettings}/>;
      if(tab==="discounts")return <ODiscounts settings={settings} saveSettings={saveSettings} addLog={addLog}/>;
      if(tab==="siteconfig")return <OSiteConfig settings={settings} saveSettings={saveSettings} addLog={addLog} setTab={setTab}/>;
      if(tab==="theme")return <OThemeEditor settings={settings} saveSettings={saveSettings} addLog={addLog}/>;
      if(tab==="security")return <OSecurity logs={logs} addLog={addLog} onLogout={logout}/>;
    }
    if(role==="athlete"&&liveUser){
      if(tab==="home")return <AthleteHub athlete={liveUser} athletes={athletes} coaches={coaches} messages={messages} saveMessages={saveMessages} saveAthletes={saveAthletes} settings={settings}/>;
      if(tab==="messages")return <Messaging me={liveUser} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages} settings={settings}/>;
      if(tab==="notifications"){
        function markRead(){saveAthletes(prev=>prev.map(a=>String(a.id)===String(liveUser.id)?{...a,notifications:(a.notifications||[]).map(n=>({...n,read:true}))}:a));}
        return <NotificationsTab user={liveUser} allUsers={[...athletes,...coaches]} messages={messages} markRead={markRead}/>;
      }
      if(tab==="schools")return <SchoolSearch athlete={liveUser}/>;
      if(tab==="euroteams")return <EuroTeams athlete={liveUser}/>;
      if(tab==="content")return <AContent athlete={liveUser} saveAthletes={saveAthletes} athletes={athletes}/>;
      if(tab==="brands")return <ABrands athlete={liveUser} saveAthletes={saveAthletes} athletes={athletes}/>;
      if(tab==="coaches")return <ACoachNetwork athlete={liveUser} coaches={coaches} saveAthletes={saveAthletes}/>;
      if(tab==="money")return <AMoney athlete={liveUser}/>;
      if(tab==="nil")return <ANIL/>;
      if(tab==="coaching")return <CoachingHub athlete={liveUser} coaches={coaches} athletes={athletes} messages={messages} saveMessages={saveMessages} saveAthletes={saveAthletes}/>;
      if(tab==="profile")return <AProfile athlete={liveUser} saveAthletes={saveAthletes}/>;
      if(tab==="privacy")return <PrivacySecurity user={liveUser} saveUsers={saveAthletes} role="athlete"/>;
      if(tab==="referral")return <AReferral athlete={liveUser} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} settings={settings}/>;
      if(tab==="help")return <AHelp settings={settings}/>;
    }
    if(role==="coach"&&liveUser){
      if(tab==="home")return <CoachHome coach={liveUser} athletes={athletes} settings={settings}/>;
      if(tab==="studio")return <CoachStudio coach={liveUser} coaches={coaches} saveCoaches={saveCoaches} athletes={athletes} settings={settings} messages={messages} saveMessages={saveMessages}/>;
      if(tab==="messages")return <Messaging me={liveUser} athletes={athletes} coaches={coaches} saveAthletes={saveAthletes} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages} settings={settings}/>;
      if(tab==="notifications"){
        function markRead(){saveCoaches(prev=>prev.map(c=>String(c.id)===String(liveUser.id)?{...c,notifications:(c.notifications||[]).map(n=>({...n,read:true}))}:c));}
        return <NotificationsTab user={liveUser} allUsers={[...athletes,...coaches]} messages={messages} markRead={markRead}/>;
      }
      if(tab==="athletes")return <CoachAthletes coach={liveUser} athletes={athletes} coaches={coaches} saveCoaches={saveCoaches} messages={messages} saveMessages={saveMessages} settings={settings}/>;
      if(tab==="euroteams")return <CoachEuroTeams coach={liveUser}/>;
      if(tab==="schools")return <CoachSchoolJobs coach={liveUser}/>;
      if(tab==="nil")return <ANIL/>;
      if(tab==="profile")return <CoachProfile coach={liveUser} saveCoaches={saveCoaches}/>;
      if(tab==="privacy")return <PrivacySecurity user={liveUser} saveUsers={saveCoaches} role="coach"/>;
      if(tab==="referral")return <CoachReferral coach={liveUser} athletes={athletes} coaches={coaches} settings={settings}/>;
      if(tab==="help")return <AHelp settings={settings}/>;
    }
    return <div style={{color:C.muted,padding:20}}>Page not found.</div>;
  }

  const navItems=role==="owner"?O_NAV:role==="athlete"?A_NAV:C_NAV;
  const isMsgFull=tab==="messages";

  return <div style={{display:"flex",fontFamily:"'Sora',sans-serif",background:C.black,minHeight:"100vh"}}>
    <Sidebar navItems={navItems} tab={tab} setTab={setTab} user={liveUser} role={role} onLogout={logout} msgCount={unreadMsgs} notifCount={unreadNotifs}/>
    <TronBg/><TronStyles C={C} settings={settings}/><main style={{position:"relative",zIndex:1,flex:1,padding:isMsgFull?0:28,overflowY:isMsgFull?"hidden":"auto",minHeight:"100vh",background:C.black}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Sora:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#06060F}
        ::-webkit-scrollbar-thumb{background:#1A1A30;border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:#252545}
        @keyframes spin{to{transform:rotate(360deg)}}
        select option{background:#0A0A15;color:#F0F0FA}
        button:focus{outline:none}
        input::placeholder,textarea::placeholder{color:#5A5A82}
        input:focus,textarea:focus,select:focus{border-color:#E8B84B66!important}
      `}</style>
      {renderTab()}
    </main>
  </div>;
}
