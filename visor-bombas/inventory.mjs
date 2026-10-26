export function inventorySummary(rows,registeredTags,referenceCount,totalB){
 const b=rows.filter(r=>r.kind==='B'),p=rows.filter(r=>r.kind==='P'),available=new Set(b.map(r=>r.tag));
 return {registeredB:registeredTags.length,availableB:b.length,availableP:p.length,progressTotal:rows.length,reference3D:referenceCount,viewerTotal:registeredTags.length+referenceCount,unmappedB:Math.max(0,totalB-registeredTags.length),missingB:registeredTags.filter(tag=>!available.has(tag))};
}
