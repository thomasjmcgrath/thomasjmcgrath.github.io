import test from 'node:test';
import assert from 'node:assert/strict';
import {hippos} from '../lib/catalog.ts';
import {questions,axes,archetypes,MIN_ANSWERS,answerCount,answerLabel,validateAnswers,scoreQuiz,parseDraft,validHippo,resultLink,resultText,duoNotes,type Answers} from '../lib/quiz.ts';
const base=()=>Object.fromEntries(questions.map(q=>[q.id,q.kind==='range'?50:q.options[0].id])) as Answers;
const paths:Record<string,Answers>={
 fritz:{arrival:'settle','free-hour':'wander','group-role':'organizer',rain:'dance',snack:'share','new-place':'together',battery:50,pace:'everywhere',souvenir:'odd','extra-loop':'quiet-look',planner:75,'thank-you':'calm'},
 fiona:{arrival:'welcome','free-hour':'local','group-role':'organizer',rain:'dance',snack:'drama','new-place':'research',battery:100,pace:'learn',souvenir:'book','extra-loop':'rest',planner:50,'thank-you':'calm'},
 maple:{arrival:'observe','free-hour':'local','group-role':'host',rain:'discover',snack:'share','new-place':'together',battery:0,pace:'mix',souvenir:'odd','extra-loop':'quiet-look',planner:75,'thank-you':'calm'},
 toni:{arrival:'settle','free-hour':'anchor','group-role':'host',rain:'discover',snack:'drama','new-place':'research',battery:75,pace:'unhurried',souvenir:'book','extra-loop':'again',planner:0,'thank-you':'plan'},
 haggis:{arrival:'observe','free-hour':'anchor','group-role':'scout',rain:'discover',snack:'share','new-place':'research',battery:25,pace:'learn',souvenir:'small','extra-loop':'again',planner:25,'thank-you':'discovery'},
 poppy:{arrival:'welcome','free-hour':'pause','group-role':'independent',rain:'dance',snack:'share','new-place':'together',battery:50,pace:'mix',souvenir:'book','extra-loop':'meal',planner:50,'thank-you':'plan'},
 'moo-deng':{arrival:'welcome','free-hour':'wander','group-role':'host',rain:'cafe',snack:'share','new-place':'solo',battery:25,pace:'unhurried',souvenir:'loud','extra-loop':'again',planner:25,'thank-you':'occasion'}
};
test('every quiz question has valid, unique controls and bounded trait contributions',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){
  if(q.kind==='range')assert.ok(axes.some(a=>a.id===q.axis));
  else{assert.equal(new Set(q.options.map(o=>o.id)).size,q.options.length);for(const option of q.options)for(const [key,value] of Object.entries(option.traits)){assert.ok(axes.some(a=>a.id===key));assert.ok(Number.isFinite(value)&&value>=0&&value<=100);}}
 }
});
for(const [id,answers] of Object.entries(paths))test('a reproducible answer path can match '+id,()=>{const r=scoreQuiz(answers);assert.equal(r.winner.id,id);assert.equal(r.count,questions.length);assert.ok(hippos.some(h=>h.id===r.winner.id));});
test('all seven archetypes correspond to existing animals and have complete result content',()=>{
 assert.deepEqual([...archetypes.map(a=>a.id)].sort(),[...hippos.map(h=>h.id)].sort());
 for(const a of archetypes){assert.ok(a.story.length>120&&a.chaos.length>40&&a.day.length>40);assert.equal(a.gifts.length,3);assert.equal(a.tags.length,3);}
});
test('scoring is deterministic and leaves the answer object unchanged',()=>{
 const answers=Object.freeze(paths.fiona),original=JSON.stringify(answers),first=scoreQuiz(answers);
 for(let i=0;i<5;i++)assert.deepEqual(scoreQuiz(answers),first);
 assert.equal(JSON.stringify(answers),original);
});
test('a zero slider value is an explicit answer rather than a skipped question',()=>{
 const answers={...base(),battery:0,planner:0};assert.equal(answerCount(answers),questions.length);
 const battery=questions.find(q=>q.id==='battery')!;assert.match(answerLabel(battery,0),/^0\/100/);assert.ok(scoreQuiz(answers));
});
test('changing a tempo answer changes the measured tempo in the expected direction',()=>{
 const low=scoreQuiz({...base(),arrival:'settle'}),high=scoreQuiz({...base(),arrival:'entrance'});
 assert.ok(high.traits.energy>low.traits.energy);assert.ok(high.traits.spotlight>low.traits.spotlight);
});
test('partial answers require a minimum and explicitly omit unmeasured dimensions',()=>{
 const answers={...base(),arrival:'entrance','group-role':null,'new-place':null,battery:null,'thank-you':null,'extra-loop':'rest'};
 const r=scoreQuiz(answers);assert.equal(r.count,8);assert.equal(r.weights.social,0);assert.equal(r.traits.social,50);
 const insufficient=Object.fromEntries(Object.entries(base()).slice(0,MIN_ANSWERS-1));assert.throws(()=>scoreQuiz(insufficient),/at least/);
 assert.throws(()=>scoreQuiz(Object.fromEntries(questions.map(q=>[q.id,null]))));
});
test('invalid options, unknown questions and invalid sliders are rejected',()=>{
 for(const answer of [{...base(),arrival:'invented'},{...base(),intruder:'x'},{...base(),battery:'50'},{...base(),battery:-1},{...base(),battery:101},{...base(),battery:NaN},{...base(),battery:25.5}])assert.throws(()=>validateAnswers(answer));
 for(const value of [null,[],42,'answers'])assert.throws(()=>validateAnswers(value));
});
test('overlap scores stay bounded, sorted and distinct from global rankings',()=>{
 let seed=211;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<150;i++){const a=Object.fromEntries(questions.map(q=>[q.id,q.kind==='range'?Math.round(random()*100):q.options[Math.floor(random()*q.options.length)].id])),r=scoreQuiz(a);
  assert.equal(new Set(r.ranked.map(x=>x.id)).size,7);
  assert.ok(r.ranked.every((x,n)=>x.score>=0&&x.score<=100&&(n===0||x.score<=r.ranked[n-1].score)));
 }
});
test('tied top matches have a stable editorial order and a visible tie flag',()=>{
 const answers={arrival:'settle','free-hour':'pause','group-role':'independent',rain:'cafe',snack:'solve','new-place':'research',battery:0,pace:'learn',souvenir:'odd','extra-loop':'quiet-look',planner:50,'thank-you':'occasion'};
 const r=scoreQuiz(answers);assert.equal(r.tied,true);assert.equal(r.ranked[0].score,r.ranked[1].score);assert.equal(r.winner.id,'maple');
});
test('saved progress round-trips without losing zeroes or skipped answers',()=>{
 const draft={version:1,answers:{...base(),battery:0,planner:null},index:10,stage:'questions'};
 assert.deepEqual(parseDraft(JSON.stringify(draft)),draft);
});
test('invalid, oversized and incompatible local saves are rejected',()=>{
 for(const raw of ['{',JSON.stringify({version:9,answers:base(),index:0,stage:'questions'}),JSON.stringify({version:1,answers:base(),index:12,stage:'questions'}),JSON.stringify({version:1,answers:{},index:0,stage:'result'}),JSON.stringify({version:1,answers:base(),index:1,stage:'invented'}),' '.repeat(12001)])assert.throws(()=>parseDraft(raw));
});
test('shared links contain only a known archetype and quiz version',()=>{
 const link=new URL(resultLink('https://hippos.example.com/private?answers=secret','fiona'));
 assert.equal(link.pathname,'/quiz');assert.equal(link.origin,'https://hippos.example.com');assert.deepEqual([...link.searchParams.keys()],['result','v']);
 assert.equal(link.searchParams.get('result'),'fiona');assert.equal(link.username,'');assert.ok(!link.toString().includes('secret'));
});
test('result links and shared result IDs reject unsafe or unknown values',()=>{
 for(const id of ['<script>','constructor','unknown',null,1]){assert.equal(validHippo(id),null);assert.throws(()=>resultLink('https://example.com',id as string));}
 for(const origin of ['file:///tmp/site','javascript:alert(1)','https://user:pass@example.com'])assert.throws(()=>resultLink(origin,'maple'));
});
test('copyable result text uses the actual animal name and labels the playful format',()=>{
 for(const h of hippos){const text=resultText(h.id);assert.ok(text.includes(h.name));assert.match(text,/just-for-fun/);}
 assert.throws(()=>resultText('unknown'));
});
test('friend comparison responds to differences in tempo, planning and social preference',()=>{
 const a=archetypes[0].traits,b=Object.fromEntries(axes.map(x=>[x.id,100-a[x.id]])) as typeof a;
 const same=duoNotes(a,a),different=duoNotes(a,b);assert.equal(same.length,3);assert.equal(different.length,3);assert.notDeepEqual(same,different);
});

