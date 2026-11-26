// one master's team-0 results over the same seeded servant draws, for comparing masters in the war. usage: node tools/masterwar.js master [wars] [RYU.perDmg RYU.kill]
const {loadEngine}=require('../tests/engine.js');
const M=process.argv[2], N=+process.argv[3]||20, pd=process.argv[4], kl=process.argv[5];
const SV=['cu','richard','medea','heracles','caerwyn','emiya','iskandar','hassan','medusa','gilles','diarmuid','kojirou'];
let win=0, alive=0, place=0;
for(let w=0;w<N;w++){ const E=loadEngine(); if(pd){E.RYU.perDmg=+pd;E.RYU.kill=+kl;}
  let s=1+w*7919; Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};
  const G=E.newWar(E.warTeams(SV[w%SV.length],M,7),{nights:3}); G.f.forEach((f,i)=>G.ai[i]=E.mkAI(f,E.DIFF.knight));
  let deadAt=null; for(let i=0;i<60*1800&&!G.over;i++){E.simStep(E.STEP); if(deadAt===null&&G.f.filter(f=>f.team===0).every(f=>f.st==='dead'))deadAt=i;}
  if(G.winner&&G.winner.team===0)win++; if(deadAt===null)alive++; place+=deadAt===null?1800*60:deadAt;}
console.log(M,pd||'',kl||'','wins',win+'/'+N,'survived',alive,'avg life',(place/N/60).toFixed(0)+'s');
