// AI check: how often each character attacks an idle human servant in a war, and how long it stays in the fight.
// usage: node tools/aicheck.js [ids] ; env X,Y spot, AD start distance, SVD (masters) servant distance
const {loadEngine}=require('../tests/engine.js');
const E0=loadEngine(); const ids=process.argv[2]?process.argv[2].split(','):E0.ORDER.concat(E0.MASTER_ORDER);
const target=process.argv[3]||'servant';
for(const id of ids){ let starts=0,hits=0,runs=4,near=0;
 for(let r=0;r<runs;r++){
  const E=loadEngine(); const isM=!!E.MASTERS[id];
  const foeSv=isM?'leonidas':id, foeM=isM?id:'waver';
  const G=E.newWar([{servant:E.SERV.richard,master:E.MASTERS.rin},{servant:E.SERV[foeSv],master:E.MASTERS[foeM]}],{nights:3});
  G.f.forEach((f,i)=>{G.ai[i]=f.team===0?null:E.mkAI(f,E.DIFF.knight);});
  G.clock.t=60; G.clock.pending=null; G.clock.evDone=true; G.event=null;
  const me=G.f.find(f=>f.team===0&&!f.def.isMaster), mm=me.partner, a=G.f.find(f=>f.def.id===id), b=a.partner;
  // an open spot on a road
  const X=+(process.env.X||2300),Y=+(process.env.Y||3100); me.x=X;me.y=Y; mm.x=X-900; mm.y=Y-600; a.x=X+(+process.env.AD||300);a.y=Y; b.x=X+1400;b.y=Y+900; if(isM){b.x=X+(+process.env.SVD||4000);b.y=Y+60;}
  [me,mm,a,b].forEach(f=>{f.inM=false;});
  let last=a.st, hp0=me.hp+mm.hp;
  for(let i=0;i<60*20;i++){ me.inp={mx:0,my:0}; mm.inp={mx:0,my:0}; E.simStep(E.STEP); if(a.st==='wind'&&last!=='wind')starts++; last=a.st; if(Math.hypot(a.x-me.x,a.y-me.y)<450)near++; }
  hits+=hp0-(me.hp+mm.hp);
 }
 console.log(id.padEnd(10),'attacks/20s',(starts/runs).toFixed(1).padStart(5),' dmg',(hits/runs).toFixed(0).padStart(4),' time near',Math.round(100*near/(runs*1200))+'%');
}
