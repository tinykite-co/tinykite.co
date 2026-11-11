import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerInterest,updatePreferences,newReceipt,readReceipt,rememberReceipt} from './interest-api.ts';
test('signup uses the write-only RPC and explicit purpose, never credentials',async()=>{
 let request:RequestInit|undefined;let url='';
 await registerInterest('https://example.com/',' parent@example.com ','opaque',async(input,init)=>{url=String(input);request=init;return new Response('{"saved":true}');});
 assert.equal(url,'https://example.com/gloss.marketing.v1.InterestService/RegisterInterest');
 assert.equal(request?.credentials,'omit');assert.deepEqual(JSON.parse(String(request?.body)),{email:'parent@example.com',receiptToken:'opaque',consentVersion:'family-interest-2026-11-11',product:'gloss'});
});
test('preferences send only receipt and optional choices',async()=>{
 await updatePreferences('https://example.com','opaque',['Welsh'],'supporter',async(_,init)=>{assert.deepEqual(JSON.parse(String(init?.body)),{receiptToken:'opaque',languages:['Welsh'],rewardId:'supporter'});return new Response('{"saved":true}');});
});
test('network, rejection, rate limit and missing acknowledgement never report saved',async()=>{
 for(const response of [new Response('{}'),new Response('{"saved":false}'),new Response('{}',{status:429}),new Response('{}',{status:500})]) await assert.rejects(()=>registerInterest('https://example.com','a@example.com','opaque',async()=>response));
 await assert.rejects(()=>registerInterest('https://example.com','a@example.com','opaque',async()=>{throw new Error('network');}),/connection/);
});
test('receipt storage expires and does not contain email',()=>{
 let stored:string|null=null;
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:()=>stored,setItem:(_:string,value:string)=>{stored=value;}}});
 const receipt={...newReceipt(),saved:true};rememberReceipt(receipt);assert.deepEqual(readReceipt(),receipt);assert.doesNotMatch(stored!,/email/);
 rememberReceipt({...receipt,createdAt:Date.now()-86400001});assert.equal(readReceipt(),null);
 rememberReceipt({...receipt,createdAt:Date.now()+5000});assert.equal(readReceipt(),null);
 stored='{broken';assert.equal(readReceipt(),null);
 stored='{"token":"bad"}';assert.equal(readReceipt(),null);
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,get(){throw new Error('disabled');}});assert.equal(readReceipt(),null);assert.doesNotThrow(()=>rememberReceipt(receipt));
});
