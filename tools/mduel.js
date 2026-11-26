// Arena master duels: every pair, sides alternating. usage: node tools/mduel.js [runs per pair]; env PATCH='E.MDUEL.x = {...}' to try numbers
const {loadEngine}=require('../tests/engine.js');
const R=+(process.argv[2]||4); const E0=loadEngine(); const ids=E0.MASTER_ORDER; const win={},games={},dur={};
ids.forEach(i=>{win[i]=0;games[i]=0;dur[i]=0;});
const t0=Date.now();
for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++)for(let r=0;r<R;r++){
  const E=loadEngine(); if(process.env.PATCH) (new Function('E',process.env.PATCH))(E);
  const [x,y]=r%2?[ids[b],ids[a]]:[ids[a],ids[b]];
  const G=E.newGame(E.MASTERS[x],E.MASTERS[y],{map:'arena'}); G.f.forEach((f,i)=>G.ai[i]=E.mkAI(f,E.DIFF.knight));
  let i=0; for(;i<60*150&&!G.over;i++)E.simStep(E.STEP);
  const A=G.f[0],B=G.f[1]; let wx;
  if(B.st==='dead'&&A.st!=='dead')wx=x; else if(A.st==='dead'&&B.st!=='dead')wx=y; else wx=(A.hp/A.def.hp>=B.hp/B.def.hp)?x:y;
  win[wx]++; games[x]++;games[y]++; dur[x]+=i/60;dur[y]+=i/60;
}
ids.map(i=>[i,win[i]/games[i]]).sort((p,q)=>q[1]-p[1]).forEach(([i,w])=>console.log(i.padEnd(10),(100*w).toFixed(0)+'%','avg '+(dur[i]/games[i]).toFixed(0)+'s'));
console.log('time',((Date.now()-t0)/1000).toFixed(0)+'s');
