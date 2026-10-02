export const VERSION = '1.1.2';
export const SCHEMA = 1;
export const LIMIT_FILE = 5 * 1024 * 1024;
export const LIMIT_TOTAL = 60 * 1024 * 1024;
export const GROUPS = ['Hogar', 'Cocina', 'Baño', 'Salón', 'Dormitorio', 'Exterior', 'Vehículo', 'Tecnología', 'Otros'];
export const EXPENSES = ['Suministros', 'Alimentación', 'Mantenimiento', 'Vivienda', 'Transporte', 'Otros'];
export const REPEATS = {none:'No se repite', weekly:'Cada semana', monthly:'Cada mes', quarterly:'Cada 3 meses', yearly:'Cada año'};
export const ALERT_LIMITS = [0,1,3,7,14,30,60,90];
export const uid = () => globalThis.crypto.randomUUID();
export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const validDate = v => {
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number(v.slice(0,4))<1900||Number(v.slice(0,4))>2199)return false;
  const d=new Date(`${v}T12:00:00Z`);return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;
};
export function addDays(d, n) { const x=new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); }
export function nextDate(d, repeat, after=today(), anchor=Number(d.slice(8))) {
  if (repeat==='none') return '';
  if (!validDate(d) || !validDate(after) || !Object.hasOwn(REPEATS,repeat)) throw Error('Fecha o repetición no válida.');
  let out=d;
  for (let i=0;i<16000;i++) {
    if (repeat==='weekly') out=addDays(out,7);
    else {
      const step={monthly:1,quarterly:3,yearly:12}[repeat];
      const x=new Date(`${out}T12:00:00Z`); x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth()+step);
      const last=new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth()+1,0)).getUTCDate();
      x.setUTCDate(Math.min(anchor,last)); out=x.toISOString().slice(0,10);
    }
    if(out>after) return out;
  }
  throw Error('No se ha podido calcular la siguiente fecha.');
}
export const daysUntil = (d, from=today()) => Math.round((Date.parse(`${d}T12:00:00Z`)-Date.parse(`${from}T12:00:00Z`))/86400000);
export function money(cents) { return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(cents/100); }
export function parseMoney(v) {
  const s=String(v).trim().replace(',','.');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) throw Error('Introduce un importe positivo, con un máximo de dos decimales.');
  const [whole,fraction='']=s.split('.'); return Number(whole)*100+Number(fraction.padEnd(2,'0'));
}
export const displayDate = d => d ? new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${d}T12:00:00`)) : 'Sin fecha';
export const escapeHTML = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function emptyState() { return {schema:SCHEMA,revision:0,settings:{home:'Mi hogar',budget:0,largeText:false,lastBackup:'',demo:false,setupComplete:false,alertsEnabled:true,alertDays:7},people:[],tasks:[],items:[],documents:[],expenses:[],shopping:[],maintenance:[]}; }
const text = (v,max=1000) => typeof v==='string' && v.length<=max;
const date = v => v==='' || validDate(v);
const cents = v => Number.isSafeInteger(v) && v>=0 && v<=999999999;
export function validateState(input) {
  const fail = () => { throw Error('El archivo no tiene un formato HomeOps compatible o contiene datos no válidos.'); };
  if (!input || typeof input!=='object' || input.schema!==SCHEMA || !Number.isSafeInteger(input.revision) || input.revision<0) fail();
  const s=input.settings;
  if (!s || !text(s.home,80) || !s.home.trim() || !cents(s.budget) || typeof s.largeText!=='boolean' || !text(s.lastBackup,40) || (s.lastBackup&&!Number.isFinite(Date.parse(s.lastBackup))) || typeof s.demo!=='boolean') fail();
  const settings={home:s.home,budget:s.budget,largeText:s.largeText,lastBackup:s.lastBackup,demo:s.demo,setupComplete:typeof s.setupComplete==='boolean'?s.setupComplete:false,alertsEnabled:typeof s.alertsEnabled==='boolean'?s.alertsEnabled:true,alertDays:ALERT_LIMITS.includes(s.alertDays)?s.alertDays:7};
  const fields={people:['id','name'],tasks:['id','title','kind','due','repeat','anchor','personId','itemId','area','location','tags','notes','priority','done','completedAt'],items:['id','name','area','location','tags','brand','serial','purchase','warranty','price','notes'],documents:['id','name','type','size','itemId','expires','added'],expenses:['id','title','amount','date','category','personId','repeat','anchor','recurringId','notes'],shopping:['id','name','quantity','done'],maintenance:['id','itemId','title','date','cost','provider','notes','created']};
  const clean={schema:SCHEMA,revision:input.revision,settings};
  const allIds=new Set();
  for(const [group,keys] of Object.entries(fields)) {
    if (!Array.isArray(input[group]) && group!=='maintenance') fail();
    const rows=Array.isArray(input[group])?input[group]:[];
    if (rows.length>10000) fail();
    clean[group]=rows.map(r=>{
      if(!r || typeof r!=='object' || !text(r.id,80) || !/^[a-zA-Z0-9_-]{1,80}$/.test(r.id) || allIds.has(r.id)) fail();
      allIds.add(r.id);
      const c={}; for(const key of keys) c[key]=r[key];
      if(group==='tasks'){c.location=typeof c.location==='string'?c.location:'';c.tags=typeof c.tags==='string'?c.tags:'';}
      if(group==='items'){c.location=typeof c.location==='string'?c.location:'';c.tags=typeof c.tags==='string'?c.tags:'';}
      if(group==='expenses'){c.repeat=Object.hasOwn(REPEATS,c.repeat)?c.repeat:'none';c.anchor=Number.isInteger(c.anchor)?c.anchor:Number(c.date?.slice(8))||1;c.recurringId=typeof c.recurringId==='string'?c.recurringId:'';}
      if(group==='people' && (!text(c.name,80) || !c.name.trim())) fail();
      if(group==='tasks' && (!text(c.title,160) || !c.title.trim() || !['task','maintenance'].includes(c.kind) || !date(c.due) || !Object.hasOwn(REPEATS,c.repeat) || (c.repeat!=='none'&&!c.due) || !Number.isInteger(c.anchor) || c.anchor<1 || c.anchor>31 || !text(c.personId,80) || !text(c.itemId,80) || !GROUPS.includes(c.area) || !text(c.location,120) || !text(c.tags,300) || !text(c.notes,4000) || !['normal','high'].includes(c.priority) || typeof c.done!=='boolean' || !date(c.completedAt))) fail();
      if(group==='items' && (!text(c.name,160) || !c.name.trim() || !GROUPS.includes(c.area) || !text(c.location,120) || !text(c.tags,300) || !text(c.brand,160) || !text(c.serial,160) || !date(c.purchase) || !date(c.warranty) || (c.purchase&&c.warranty&&c.warranty<c.purchase) || !cents(c.price) || !text(c.notes,4000))) fail();
      if(group==='documents' && (!text(c.name,200) || !c.name.trim() || !['application/pdf','image/jpeg','image/png','image/webp'].includes(c.type) || !Number.isInteger(c.size) || c.size<1 || c.size>LIMIT_FILE || !text(c.itemId,80) || !date(c.expires) || !validDate(c.added))) fail();
      if(group==='expenses' && (!text(c.title,160) || !c.title.trim() || !cents(c.amount) || !validDate(c.date) || !EXPENSES.includes(c.category) || !text(c.personId,80) || !Object.hasOwn(REPEATS,c.repeat) || !Number.isInteger(c.anchor) || c.anchor<1 || c.anchor>31 || !text(c.recurringId,80) || !text(c.notes,4000))) fail();
      if(group==='shopping' && (!text(c.name,160) || !c.name.trim() || !text(c.quantity,40) || typeof c.done!=='boolean')) fail();
      if(group==='maintenance' && (!text(c.itemId,80) || !c.itemId || !text(c.title,160) || !c.title.trim() || !validDate(c.date) || !cents(c.cost) || !text(c.provider,160) || !text(c.notes,4000) || !validDate(c.created))) fail();
      return c;
    });
  }
  const people=new Set(clean.people.map(x=>x.id)), items=new Set(clean.items.map(x=>x.id));
  if(clean.tasks.some(x=>(x.personId&&!people.has(x.personId))||(x.itemId&&!items.has(x.itemId))) || clean.expenses.some(x=>x.personId&&!people.has(x.personId)) || clean.documents.some(x=>x.itemId&&!items.has(x.itemId)) || clean.maintenance.some(x=>!items.has(x.itemId))) fail();
  if(clean.documents.reduce((n,x)=>n+x.size,0)>LIMIT_TOTAL) fail();
  return clean;
}
export function completeTask(state, id, now=today()) {
  const t=state.tasks.find(x=>x.id===id);
  if (!t) throw Error('Esta tarea ya no existe.');
  if(t.done) throw Error('Esta tarea ya está completada.');
  t.done=true; t.completedAt=now;
  if(t.repeat!=='none') state.tasks.push({...t,id:uid(),done:false,completedAt:'',due:nextDate(t.due,t.repeat,now,t.anchor)});
}
export function totals(state,month=today().slice(0,7)) {
  const list=expandExpenses(state,month,month);
  return {amount:list.reduce((n,x)=>n+x.amount,0),categories:EXPENSES.map(name=>({name,amount:list.filter(x=>x.category===name).reduce((n,x)=>n+x.amount,0)}))};
}
export function recurringExpenseRecords(base,throughMonth) {
  if(base.repeat==='none') return [base];
  const out=[];let current=base.date,limit=`${throughMonth}-31`,i=0;
  while(current<=limit&&i<2000){out.push({...base,id:`${base.id}-${i}`,sourceId:base.id,date:current,recurringId:base.recurringId||base.id});current=nextDate(current,base.repeat,current,base.anchor);i++;}
  return out;
}
export function expandExpenses(state,fromMonth,toMonth) {
  const out=[];const start=`${fromMonth}-01`,end=`${toMonth}-31`;
  for(const x of state.expenses){if(x.repeat==='none'){if(x.date>=start&&x.date<=end)out.push(x);continue;}for(const r of recurringExpenseRecords(x,toMonth))if(r.date>=start&&r.date<=end)out.push(r);}
  return out;
}
export function annualTotals(state,year=today().slice(0,4)) {
  return Array.from({length:12},(_,i)=>{const month=`${year}-${String(i+1).padStart(2,'0')}`;return {month,amount:expandExpenses(state,month,month).reduce((n,x)=>n+x.amount,0)};});
}
export function warnings(state,now=today()) {
  if(state.settings.alertsEnabled===false)return [];
  const window=Number.isInteger(state.settings.alertDays)?state.settings.alertDays:7;
  return [
    ...state.tasks.filter(x=>!x.done&&x.due&&daysUntil(x.due,now)<=window).map(x=>({id:x.id,title:x.title,date:x.due,kind:'task',label:x.kind==='maintenance'?'Mantenimiento':'Tarea'})),
    ...state.items.filter(x=>x.warranty&&daysUntil(x.warranty,now)>=0&&daysUntil(x.warranty,now)<=Math.max(window,30)).map(x=>({id:x.id,title:x.name,date:x.warranty,kind:'item',label:'Fin de garantía'})),
    ...state.documents.filter(x=>x.expires&&daysUntil(x.expires,now)<=Math.max(window,30)).map(x=>({id:x.id,title:x.name,date:x.expires,kind:'document',label:'Caducidad'}))
  ].sort((a,b)=>a.date.localeCompare(b.date));
}
export function csv(rows) {
  return '\ufeff'+rows.map(row=>row.map(value=>{ let s=String(value??''); if(/^[\s]*[=+\-@\t\r]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; }).join(';')).join('\r\n');
}
export function parseCSV(input) {
  const text=input.replace(/^\ufeff/,''); if(text.length>2*1024*1024) throw Error('CSV demasiado grande (máximo 2 MB).');
  let row=[],field='',quoted=false,rows=[];
  for(let i=0;i<text.length;i++) {
    const ch=text[i];
    if(ch==='"') { if(quoted&&text[i+1]==='"') {field+='"';i++;} else if(quoted) {quoted=false; if(text[i+1]&&![';','\n','\r'].includes(text[i+1])) throw Error('CSV no válido.');} else if(field==='') quoted=true; else throw Error('CSV no válido.'); }
    else if(!quoted&&ch===';') {row.push(field);field='';}
    else if(!quoted&&(ch==='\n'||ch==='\r')) {if(ch==='\r'&&text[i+1]==='\n')i++; row.push(field); if(row.some(x=>x))rows.push(row); row=[];field='';}
    else field+=ch;
  }
  if(quoted) throw Error('CSV incompleto: faltan comillas.');
  if(field||row.length) {row.push(field);rows.push(row);}
  return rows;
}
export function importExpensesCSV(input) {
  const [head,...rows]=parseCSV(input);
  if(!head || head.join(';')!=='Concepto;Importe EUR;Fecha;Categoría;Notas') throw Error('Usa la plantilla CSV de gastos: Concepto;Importe EUR;Fecha;Categoría;Notas.');
  if(rows.length>5000) throw Error('Importa como máximo 5.000 gastos cada vez.');
  const unquote=s=>/^'[\s]*[=+\-@\t\r]/.test(s)?s.slice(1):s;
  const expenses=rows.map((r,i)=>{
    if(r.length!==5||!r[0].trim()||!validDate(r[2])||!EXPENSES.includes(r[3])) throw Error(`Revisa la fila ${i+2}: concepto, fecha o categoría no válidos.`);
    return {id:uid(),title:unquote(r[0]),amount:parseMoney(r[1]),date:r[2],category:r[3],personId:'',notes:unquote(r[4])};
  });
  const check=emptyState(); check.expenses=expenses; validateState(check); return expenses;
}
const icalEscape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r\n|\n|\r/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
export function foldICS(line) {
  let lines=[],current='',len=0;
  for(const c of line) {const size=new TextEncoder().encode(c).length; if(len+size>73) {lines.push(current);current=' ';len=1;} current+=c;len+=size;}
  lines.push(current);return lines.join('\r\n');
}
export function calendar(state) {
  const entries=[...state.tasks.filter(x=>!x.done&&x.due).map(x=>({id:x.id,title:x.title,date:x.due,notes:x.notes})),...state.items.filter(x=>x.warranty).map(x=>({id:x.id,title:`Fin de garantía: ${x.name}`,date:x.warranty,notes:'Fecha registrada por ti. Comprueba las condiciones del vendedor.'})),...state.documents.filter(x=>x.expires).map(x=>({id:x.id,title:`Caducidad: ${x.name}`,date:x.expires,notes:''}))];
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//HomeOps 404//ES','CALSCALE:GREGORIAN',...entries.flatMap(x=>['BEGIN:VEVENT',`UID:${x.id}@homeops404.local`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${x.date.replace(/-/g,'')}`,`DTEND;VALUE=DATE:${addDays(x.date,1).replace(/-/g,'')}`,`SUMMARY:${icalEscape(x.title)}`,`DESCRIPTION:${icalEscape(x.notes)}`,'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY',`DESCRIPTION:${icalEscape(x.title)}`,'END:VALARM','END:VEVENT']),'END:VCALENDAR'].map(foldICS).join('\r\n')+'\r\n';
}
export function sampleState() {
  const s=emptyState(), now=today(); s.settings.demo=true; s.settings.budget=80000;
  s.people=[{id:uid(),name:'Alex'},{id:uid(),name:'Dani'}];
  s.items=[{id:uid(),name:'Lavadora',area:'Cocina',location:'Cocina · junto al fregadero',tags:'electrodoméstico, garantía',brand:'Modelo de ejemplo',serial:'',purchase:addDays(now,-700),warranty:addDays(now,20),price:44900,notes:'Factura pendiente de añadir.'},{id:uid(),name:'Aire acondicionado',area:'Salón',location:'Pared principal',tags:'climatización',brand:'Equipo de ejemplo',serial:'',purchase:addDays(now,-300),warranty:addDays(now,430),price:72000,notes:''},{id:uid(),name:'Coche familiar',area:'Vehículo',location:'Garaje',tags:'vehículo',brand:'Vehículo de ejemplo',serial:'',purchase:'',warranty:'',price:0,notes:'Anota aquí la matrícula y el taller, si lo necesitas.'}];
  s.tasks=[{title:'Revisar los filtros del aire',kind:'maintenance',due:addDays(now,2),repeat:'quarterly',area:'Salón',location:'Pared principal',tags:'filtro, climatización',itemId:s.items[1].id},{title:'Regar las plantas',kind:'task',due:now,repeat:'weekly',area:'Exterior',location:'Terraza',tags:'plantas',itemId:''},{title:'Pedir cita para la revisión del coche',kind:'maintenance',due:addDays(now,5),repeat:'none',area:'Vehículo',location:'Garaje',tags:'revisión',itemId:s.items[2].id},{title:'Organizar el armario',kind:'task',due:addDays(now,8),repeat:'none',area:'Dormitorio',location:'Armario principal',tags:'orden',itemId:''}].map((x,i)=>({...x,id:uid(),anchor:Number(x.due.slice(8)),personId:s.people[i%2].id,notes:'',priority:i===2?'high':'normal',done:false,completedAt:''}));
  s.expenses=[['Electricidad',6430,'Suministros'],['Compra semanal',8750,'Alimentación'],['Internet',3200,'Suministros'],['Bombillas',1690,'Mantenimiento']].map(([title,amount,category])=>({id:uid(),title,amount,category,date:now,personId:'',repeat:'none',anchor:Number(now.slice(8)),recurringId:'',notes:''}));
  s.maintenance=[{id:uid(),itemId:s.items[1].id,title:'Limpieza de filtros',date:addDays(now,-35),cost:0,provider:'Hecho en casa',notes:'Ejemplo de historial de mantenimiento.',created:now}];
  s.shopping=[['Leche','2 litros'],['Bolsas de basura','1 paquete'],['Manzanas','1 kg']].map(([name,quantity])=>({id:uid(),name,quantity,done:false}));
  return validateState(s);
}
