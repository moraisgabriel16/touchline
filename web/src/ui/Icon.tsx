const paths: Record<string,string>={
  world:'M3 10l9-6 9 6-9 6-9-6zm0 5l9 6 9-6M12 16v5',
  club:'M3 21V7l9-4 9 4v14M3 11h18M8 21v-6h8v6M9 7h6',
  team:'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8m7-7a4 4 0 010 7m6 10v-2a4 4 0 00-3-3.87',
  tactics:'M4 3h16v18H4V3zm0 9h16M9 3v4h6V3M9 21v-4h6v4',
  table:'M4 4h16v16H4V4zm0 5h16M4 14h16M10 9v11',
  matches:'M4 5h16v16H4V5zm4-3v6m8-6v6M4 11h16M8 15h2m4 0h2',
  journal:'M4 3h13l3 3v15H4V3zm4 5h7M8 12h8m-8 4h6',
  download:'M12 3v12m-5-5l5 5 5-5M4 16v5h16v-5',
  upload:'M12 16V4m-5 5l5-5 5 5M4 16v5h16v-5',
  reset:'M3 10a9 9 0 119 11M3 4v6h6',
  arrow:'M4 12h16m-6-6l6 6-6 6',
};
export function Icon({name,size=20}:{name:string;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]??paths.world}/></svg>;
}
export function Crest({small=false}:{small?:boolean}) {
  return <svg className={small?'crest small':'crest'} viewBox="0 0 64 72" aria-hidden="true"><path d="M4 3h56v43L32 68 4 46Z" fill="currentColor"/><path d="M10 9h44v34L32 61 10 43Z" fill="#18333f" stroke="#d5ae68" strokeWidth="1"/><path d="M19 23h26v6H35v23h-6V29H19Z" fill="#e6c17f"/><path d="m27 16 5-4 5 4-5 4Z" fill="#e6c17f"/></svg>;
}
