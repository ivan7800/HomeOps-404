import {emptyState,validateState,LIMIT_TOTAL} from './core.mjs';
let database;
export async function openDB() {
  if(database)return database;
  database=await new Promise((resolve,reject)=>{
    const r=indexedDB.open('homeops404-v1',1);
    r.onupgradeneeded=()=>{r.result.createObjectStore('state');r.result.createObjectStore('files',{keyPath:'id'});};
    r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();database=null;};resolve(r.result);};
    r.onerror=()=>reject(r.error);
    r.onblocked=()=>reject(Error('Cierra las otras pestañas de HomeOps y vuelve a abrirla.'));
  });return database;
}
export async function readState() {
  const db=await openDB();
  return new Promise((resolve,reject)=>{const tx=db.transaction('state','readonly'),r=tx.objectStore('state').get('main'); r.onsuccess=()=>{try{resolve(r.result?validateState(r.result):emptyState());}catch(e){reject(e);}};r.onerror=()=>reject(r.error);});
}
export async function changeState(mutator,expectedRevision,files={}) {
  const db=await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(['state','files'],'readwrite'); let result,error;
    const store=tx.objectStore('state'),r=store.get('main');
    r.onsuccess=()=>{try{
      const current=r.result||emptyState();
      if(expectedRevision!==undefined&&current.revision!==expectedRevision)throw Error('Los datos cambiaron en otra pestaña. Cierra este formulario, revisa los datos actualizados y vuelve a intentarlo.');
      result=mutator(structuredClone(current))||current; result.revision=current.revision+1; result=validateState(result);
      if(result.documents.reduce((a,b)=>a+b.size,0)>LIMIT_TOTAL)throw Error('El límite de documentos es 60 MB. Exporta una copia y elimina los que ya no necesites.');
      const fs=tx.objectStore('files');if(files.clear)fs.clear();
      for(const id of files.remove||[])fs.delete(id);
      for(const f of files.put||[])fs.put(f);
      store.put(result,'main');
    }catch(e){error=e;tx.abort();}};
    tx.oncomplete=()=>resolve(result);
    tx.onabort=()=>reject(error||tx.error||Error('No se ha guardado. Puede faltar espacio. Tus datos anteriores siguen intactos.'));
    tx.onerror=()=>{error=error||tx.error;};
  });
}
export async function readFile(id) {
  const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('files','readonly').objectStore('files').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
}
export async function snapshot() {
  const db=await openDB();return new Promise((resolve,reject)=>{
    const tx=db.transaction(['state','files'],'readonly'),rs=tx.objectStore('state').get('main'),rf=tx.objectStore('files').getAll();
    tx.oncomplete=()=>resolve({state:validateState(rs.result||emptyState()),files:rf.result});tx.onerror=()=>reject(tx.error);
  });
}
// Backup metadata is not a record edit: it must not invalidate an open restore/reset form.
export async function markBackup(timestamp) {
  const db=await openDB();return new Promise((resolve,reject)=>{
    const tx=db.transaction('state','readwrite'),store=tx.objectStore('state'),r=store.get('main');let result;
    r.onsuccess=()=>{result=r.result||emptyState();result.settings.lastBackup=timestamp;store.put(result,'main');};
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
