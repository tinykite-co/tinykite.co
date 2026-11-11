const CONSENT_VERSION = 'family-interest-2026-11-11';
const RECEIPT_KEY = 'tinykite-interest-receipt-v1';
const RECEIPT_LIFETIME = 24 * 60 * 60 * 1000;
const SERVICE = '/gloss.marketing.v1.InterestService/';
export interface InterestReceipt { token: string; saved: boolean; createdAt: number; languages: string[]; rewardId: string; }
/** An opaque receipt permits preference updates without creating an account. */
export function newReceipt(): InterestReceipt {
  return {token:crypto.randomUUID(),saved:false,createdAt:Date.now(),languages:[],rewardId:''};
}
/** Store no email in browser storage or URLs. Storage denial does not block signup. */
export function rememberReceipt(receipt: InterestReceipt): void {
  try {sessionStorage.setItem(RECEIPT_KEY,JSON.stringify(receipt));} catch { /* This page retains its in-memory receipt. */ }
}
/** Keep the optional next step in the same tab, bounded to one day. */
export function readReceipt(): InterestReceipt | null {
  try {
    const value=JSON.parse(sessionStorage.getItem(RECEIPT_KEY) ?? 'null');
    if(!value || typeof value.token!=='string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value.token) || value.saved!==true || typeof value.createdAt!=='number' || Date.now()-value.createdAt>RECEIPT_LIFETIME || value.createdAt>Date.now() || !Array.isArray(value.languages) || value.languages.length>8 || !value.languages.every((language:unknown)=>typeof language==='string' && language.length<=160) || typeof value.rewardId!=='string') return null;
    return value as InterestReceipt;
  } catch {return null;}
}
async function save(endpoint: string, method: string, payload: object, fetcher: typeof fetch): Promise<void> {
  let response: Response;
  try {
    response=await fetcher(endpoint.replace(/\/$/,'')+SERVICE+method,{method:'POST',headers:{'Content-Type':'application/json','Connect-Protocol-Version':'1'},body:JSON.stringify(payload),credentials:'omit',signal:AbortSignal.timeout(15000)});
  } catch { throw new Error('We couldn’t connect. Check your connection and try again; your details are still here.'); }
  if(!response.ok) throw new Error(response.status===429 ? 'Please wait a minute and try again.' : 'We couldn’t save this yet. Check your details and try again.');
  const result: unknown=await response.json();
  if(!result || typeof result!=='object' || !('saved' in result) || result.saved!==true) throw new Error('Saving wasn’t confirmed. Please try again.');
}
/** A positive server acknowledgement is required before revealing optional backing. */
export function registerInterest(endpoint:string,email:string,receiptToken:string,fetcher:typeof fetch=fetch):Promise<void>{
  return save(endpoint,'RegisterInterest',{email:email.trim(),receiptToken,consentVersion:CONSENT_VERSION,product:'gloss'},fetcher);
}
/** Save optional language/reward choices using the receipt, without resending email. */
export function updatePreferences(endpoint:string,receiptToken:string,languages:string[],rewardId:string,fetcher:typeof fetch=fetch):Promise<void>{
  return save(endpoint,'UpdatePreferences',{receiptToken,languages,rewardId},fetcher);
}
