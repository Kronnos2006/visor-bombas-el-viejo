// Coordenadas de presentación, no corresponden a un plano de ingeniería.
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function plantLayout(pumps,demo=false){
 const right=p=>['destilacion','alcohol'].includes(normalize(p.area));
 const tanks=[false,true].flatMap(side=>(demo?[0]:[-7,0,7]).map(z=>({side,x:side?5:-9,z,radius:side?1.22:1.56,height:side?4.7:2.3})));
 const positioned=pumps.map(p=>{
  const side=right(p),group=pumps.filter(q=>right(q)===side),index=group.indexOf(p);
  const x=(side?8.5:-5.5)+(index%2)*3;
  const rows=Math.ceil(group.length/2),z=(Math.floor(index/2)-(rows-1)/2)*4;
  const tank=tanks.filter(t=>t.side===side).sort((a,b)=>Math.abs(a.z-z)-Math.abs(b.z-z))[0];
  return {tag:p.tag,side,x,z,tank,baseWidth:1.7,baseDepth:.9};
 });
 return {tanks,pumps:positioned};
}
