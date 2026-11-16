const encode=new TextEncoder();
const xml=value=>String(value??'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[c]);
const sheetNs='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const relNs='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageNs='http://schemas.openxmlformats.org/package/2006';
const declaration='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const crcTable=Uint32Array.from({length:256},(_,v)=>{
 for(let i=0;i<8;i++)v=(v>>>1)^((v&1)?0xedb88320:0);
 return v>>>0;
});
function crc32(data){
 let crc=0xffffffff;
 for(const value of data)crc=(crc>>>8)^crcTable[(crc^value)&255];
 return (crc^0xffffffff)>>>0;
}
function zip(entries){
 let offset=0,directorySize=0;
 const files=[],directory=[];
 for(const [filename,content] of entries){
  const name=encode.encode(filename),data=encode.encode(declaration+content),crc=crc32(data);
  const local=new DataView(new ArrayBuffer(30)),central=new DataView(new ArrayBuffer(46));
  local.setUint32(0,0x04034b50,true);local.setUint16(4,20,true);local.setUint16(12,33,true);
  local.setUint32(14,crc,true);local.setUint32(18,data.length,true);local.setUint32(22,data.length,true);local.setUint16(26,name.length,true);
  central.setUint32(0,0x02014b50,true);central.setUint16(4,20,true);central.setUint16(6,20,true);central.setUint16(14,33,true);
  central.setUint32(16,crc,true);central.setUint32(20,data.length,true);central.setUint32(24,data.length,true);
  central.setUint16(28,name.length,true);central.setUint32(42,offset,true);
  files.push(local.buffer,name,data);directory.push(central.buffer,name);
  offset+=30+name.length+data.length;directorySize+=46+name.length;
 }
 const end=new DataView(new ArrayBuffer(22));
 end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);
 end.setUint32(12,directorySize,true);end.setUint32(16,offset,true);
 return new Blob([...files,...directory,end.buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function sheet(rows){
 return `<worksheet xmlns="${sheetNs}"><sheetData>${rows.map((row,i)=>`<row r="${i+1}">${row.map((cell,j)=>{
  const ref=String.fromCharCode(65+j)+(i+1);
  // Se escriben los datos ingresados como texto literal, incluso si empiezan con "=".
  return typeof cell==='number'&&Number.isFinite(cell)?`<c r="${ref}"><v>${cell}</v></c>`:`<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(String(cell??'').slice(0,32767))}</t></is></c>`;
 }).join('')}</row>`).join('')}</sheetData></worksheet>`;
}
export function plantWorkbook(sheets){
 const entries=Object.entries(sheets);
 const refs=entries.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${relNs}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('');
 return zip([
  ['[Content_Types].xml',`<Types xmlns="${packageNs}/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${entries.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
  ['_rels/.rels',`<Relationships xmlns="${packageNs}/relationships"><Relationship Id="rId1" Type="${relNs}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
  ['xl/workbook.xml',`<workbook xmlns="${sheetNs}" xmlns:r="${relNs}"><sheets>${entries.map(([name],i)=>`<sheet name="${xml(name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`],
  ['xl/_rels/workbook.xml.rels',`<Relationships xmlns="${packageNs}/relationships">${refs}</Relationships>`],
  ...entries.map(([,rows],i)=>[`xl/worksheets/sheet${i+1}.xml`,sheet(rows)]),
 ]);
}
