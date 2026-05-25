// ── Dynamic Theme System ───────────────────────
// Owner can change these from dashboard — stored in settings
export function buildTheme(s){
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
export let C=buildTheme({});

export function setTheme(s){ C=buildTheme(s); }

export default C;
