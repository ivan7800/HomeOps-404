import {SCHEMA,LIMIT_FILE,validateState} from './core.mjs';
const ITERATIONS=210000;
const bytesToBase64=bytes=>{let out='';for(let i=0;i<bytes.length;i+=16384)out+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(out);};
const base64ToBytes=value=>{if(typeof value!=='string'||value.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(value))throw Error('La copia cifrada está dañada.');let raw;try{raw=atob(value);}catch{throw Error('La copia cifrada no se puede leer.');}return Uint8Array.from(raw,c=>c.charCodeAt(0));};
const passwordKey=async(password,salt,usage)=>crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},await crypto.subtle.importKey('raw',new TextEncoder().encode(password),{name:'PBKDF2'},false,['deriveKey']),{name:'AES-GCM',length:256},false,usage);
export async function sniffFile(blob){
  const bytes=new Uint8Array(await blob.slice(0,16).arrayBuffer()),ascii=String.fromCharCode(...bytes);
  if(ascii.startsWith('%PDF-'))return 'application/pdf';
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'image/jpeg';
  if([137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))return 'image/png';
  if(ascii.startsWith('RIFF')&&ascii.slice(8,12)==='WEBP')return 'image/webp';
  throw Error('El contenido no corresponde a un PDF, JPG, PNG o WebP compatible.');
}
export const digest=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
async function toBase64(blob){const bytes=new Uint8Array(await blob.arrayBuffer()),chunks=[];for(let i=0;i<bytes.length;i+=16384)chunks.push(String.fromCharCode(...bytes.subarray(i,i+16384)));return btoa(chunks.join(''));}
export async function packSnapshot(snapshot,exportedAt=new Date().toISOString()){
  const state=validateState(snapshot.state),byId=new Map(snapshot.files.map(x=>[x.id,x.blob])),files=[];
  for(const meta of state.documents){const blob=byId.get(meta.id);if(!blob||blob.size!==meta.size)throw Error(`Falta el archivo de ${meta.name}. No se ha generado una copia incompleta.`);if(await sniffFile(blob)!==meta.type)throw Error(`El archivo de ${meta.name} no tiene el formato esperado.`);files.push({id:meta.id,base64:await toBase64(blob),sha256:await digest(blob)});}
  return {format:'homeops404-backup',version:SCHEMA,exportedAt,state,files};
}
export async function packEncryptedSnapshot(snapshot,password,exportedAt=new Date().toISOString()){
  if(typeof password!=='string'||password.length<8||password.length>200)throw Error('La contraseña debe tener entre 8 y 200 caracteres.');
  const plain=JSON.stringify(await packSnapshot(snapshot,exportedAt)),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await passwordKey(password,salt,['encrypt']);
  const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128},key,new TextEncoder().encode(plain)));
  return {format:'homeops404-encrypted-backup',version:SCHEMA,exportedAt,algorithm:'AES-GCM-256',kdf:'PBKDF2-SHA-256',iterations:ITERATIONS,salt:bytesToBase64(salt),iv:bytesToBase64(iv),ciphertext:bytesToBase64(ciphertext)};
}
export async function unpackEncryptedBackup(data,password){
  if(!data||data.format!=='homeops404-encrypted-backup'||data.version!==SCHEMA||data.algorithm!=='AES-GCM-256'||data.kdf!=='PBKDF2-SHA-256'||data.iterations!==ITERATIONS)throw Error('No es una copia cifrada compatible con HomeOps 404.');
  if(typeof password!=='string'||password.length<8)throw Error('Introduce la contraseña de la copia cifrada.');
  let plain;try{const salt=base64ToBytes(data.salt),iv=base64ToBytes(data.iv),ciphertext=base64ToBytes(data.ciphertext);if(salt.length!==16||iv.length!==12||ciphertext.length>120*1024*1024)throw Error();const key=await passwordKey(password,salt,['decrypt']);plain=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv,tagLength:128},key,ciphertext));}catch{throw Error('No se ha podido descifrar la copia. Comprueba la contraseña o el archivo.');}
  let decoded;try{decoded=JSON.parse(plain);}catch{throw Error('La copia descifrada no contiene un formato válido.');}return unpackBackup(decoded);
}
export async function unpackAnyBackup(data,password=''){return data?.format==='homeops404-encrypted-backup'?unpackEncryptedBackup(data,password):unpackBackup(data);}
export async function unpackBackup(data){
  if(!data||data.format!=='homeops404-backup'||data.version!==SCHEMA||!Array.isArray(data.files))throw Error('No es una copia compatible de HomeOps 404.');
  const state=validateState(data.state);
  if(data.files.length!==state.documents.length)throw Error('El número de archivos no coincide con la copia.');
  const docs=new Map(state.documents.map(x=>[x.id,x])),seen=new Set(),files=[];
  for(const f of data.files){
    const meta=docs.get(f?.id);
    if(!meta||seen.has(f.id)||typeof f.base64!=='string'||f.base64.length>Math.ceil(LIMIT_FILE/3)*4||f.base64.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.base64))throw Error('La copia contiene un adjunto no válido.');
    seen.add(f.id);let raw;try{raw=atob(f.base64);}catch{throw Error('Un documento no se puede decodificar.');}
    if(raw.length!==meta.size)throw Error('Un documento tiene un tamaño incorrecto.');
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),blob=new Blob([bytes],{type:meta.type});
    if(await sniffFile(blob)!==meta.type||await digest(blob)!==f.sha256)throw Error('Un documento está dañado o ha sido modificado.');
    files.push({id:f.id,blob});
  }
  return {state,files};
}
