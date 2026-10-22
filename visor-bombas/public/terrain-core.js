export const EARTH=6371008.8;
export function grid(lat,lon,size,n){
 if(![lat,lon,size,n].every(Number.isFinite)||Math.abs(lat)>80||Math.abs(lon)>180||size<180||size>10000||!Number.isInteger(n)||n<3||n>41)throw Error('Usa latitud entre -80 y 80, longitud entre -180 y 180 y un área de 180 a 10000 metros.');
 const rad=Math.PI/180,points=[];
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
 const x=(i/(n-1)-.5)*size,y=(j/(n-1)-.5)*size;
 const longitude=lon+x/(EARTH*Math.cos(lat*rad))/rad;
 points.push({x,y,lat:lat+y/EARTH/rad,lon:((longitude+540)%360)-180,z:null});}
 return points;
}
export function contours(points,n,interval){
 if(!Number.isFinite(interval)||interval<=0)throw Error('Intervalo inválido');
 const values=points.map(p=>p.z);if(values.some(z=>!Number.isFinite(z)))throw Error('Elevaciones incompletas');
 const min=Math.min(...values),max=Math.max(...values),lines=[];
 if((max-min)/interval>3000)throw Error('Aumenta el intervalo de curvas.');
 function triangle(a,b,c,h){const hits=[];for(const [u,v] of [[a,b],[b,c],[c,a]])if((u.z<h&&v.z>=h)||(v.z<h&&u.z>=h)){const t=(h-u.z)/(v.z-u.z);hits.push({x:u.x+t*(v.x-u.x),y:u.y+t*(v.y-u.y),z:h});}if(hits.length===2)lines.push(hits);}
 for(let h=Math.ceil(min/interval)*interval;h<=max;h+=interval)for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=points[j*n+i],b=points[j*n+i+1],c=points[(j+1)*n+i],d=points[(j+1)*n+i+1];triangle(a,b,c,h);triangle(b,d,c,h);}
 return lines;
}
export function csv(points){return 'x_m,y_m,z_m,latitude,longitude\n'+points.map(p=>[p.x,p.y,p.z,p.lat,p.lon].join(',')).join('\n');}
export function obj(points,n){let s='# VOCATUS terrain; local ENU meters; X east Y north Z elevation\n';s+=points.map(p=>'v '+p.x+' '+p.y+' '+p.z).join('\n')+'\n';for(let j=0;j<n-1;j++)for(let i=0;i<n-1;i++){const a=j*n+i+1,b=a+1,c=a+n,d=c+1;s+='f '+a+' '+b+' '+c+'\nf '+b+' '+d+' '+c+'\n';}return s;}
export function dxf(lines){let s='0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n6\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';for(const [a,b]of lines)s+='0\nLINE\n8\nCURVA_'+a.z.toFixed(2)+'\n10\n'+a.x+'\n20\n'+a.y+'\n30\n'+a.z+'\n11\n'+b.x+'\n21\n'+b.y+'\n31\n'+b.z+'\n';return s+'0\nENDSEC\n0\nEOF\n';}
export function revit(points,meta){return '# -*- coding: utf-8 -*-\n# Ejecutar en pyRevit, Revit 2024+. Coordenadas locales en metros.\n# Origen horizontal WGS84: '+meta.lat+', '+meta.lon+'; cota absoluta conservada.\n# La malla NO esta alineada automaticamente con coordenadas compartidas.\nfrom Autodesk.Revit.DB import (XYZ, Toposolid, ToposolidType, Level, FilteredElementCollector, Transaction, UnitUtils, UnitTypeId)\nfrom System.Collections.Generic import List\ndoc = __revit__.ActiveUIDocument.Document\nraw = '+JSON.stringify(points.map(p=>[p.x,p.y,p.z]))+'\nlevels = sorted(list(FilteredElementCollector(doc).OfClass(Level)), key=lambda level: level.Elevation)\ntypes = list(FilteredElementCollector(doc).OfClass(ToposolidType))\nif not levels or not types:\n    raise Exception("El proyecto necesita un nivel y un tipo de Toposolid. No funciona en documentos de familia.")\npoints = List[XYZ]()\nfor x,y,z in raw:\n    points.Add(XYZ(UnitUtils.ConvertToInternalUnits(x, UnitTypeId.Meters),UnitUtils.ConvertToInternalUnits(y, UnitTypeId.Meters),UnitUtils.ConvertToInternalUnits(z, UnitTypeId.Meters)))\ntransaction = Transaction(doc, "VOCATUS - Terreno satelital")\ntransaction.Start()\ntry:\n    terrain = Toposolid.Create(doc, points, types[0].Id, levels[0].Id)\n    transaction.Commit()\n    print("Toposolid creado. Ajusta coordenadas compartidas, nivel y curvas en Revit; DEM de referencia 90 m.")\nexcept:\n    transaction.RollBack()\n    raise\n';}
