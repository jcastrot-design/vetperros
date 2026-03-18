import { useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { api } from "@/lib/api/client";
import { Gamepad2, Trophy, Gift, X, RotateCcw } from "lucide-react-native";
import Toast from "react-native-toast-message";

const GAME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#1a1a2e; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
  canvas { width:100%; max-height:100vh; display:block; touch-action:none; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const W=800,H=300,GY=230;
const GRAVITY=1700,JV=-600,DJV=-560,INIT_SPEED=300,MAX_SPEED=850,SPEED_INC=14,SPF=10;
const SPAWN_MIN=900,SPAWN_MAX=2400;
const MILESTONES=[100,250,500,1000,2500,5000];
const C={sky:"#f0ede6",wall:"#e8e4dc",floor:"#c8c4bc",grout:"#b0aca4",dog:"#c8843c",dogDark:"#a0602c",dogSnout:"#e0a870",collar:"#00c8b4",cat:"#555566",catDark:"#333344",catEye:"#ffdd44",syringe:"#88ddcc",syringeBody:"#cceeee",shampoo:"#ff6b6b",bubble:"rgba(120,200,255,0.7)",text:"#333",accent:"#00c8b4",death:"#ff4466"};
const GS={START:0,PLAYING:1,DEAD:2};

function rr(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

// Background
const bg={offset:0,tileW:60,pawOffset:0};
function bgUpdate(dt,spd){bg.offset=(bg.offset+spd*dt)%bg.tileW;bg.pawOffset=(bg.pawOffset+spd*0.3*dt)%300;}
function bgDraw(ctx){
  ctx.fillStyle=C.wall;ctx.fillRect(0,0,W,GY);
  ctx.fillStyle="rgba(0,200,180,0.08)";ctx.fillRect(0,GY-30,W,30);
  ctx.fillStyle="rgba(0,200,180,0.12)";
  for(const cx of[100,300,500,700]){const x=((cx-bg.pawOffset*0.2)%800+800)%800;ctx.fillRect(x-2,20,4,20);ctx.fillRect(x-10,28,20,4);}
  ctx.fillStyle="rgba(180,150,120,0.15)";
  for(const px of[200,450,650]){const x=((px-bg.pawOffset*0.3)%800+800)%800;const y=60;ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x-8,y-6,3,0,Math.PI*2);ctx.arc(x+8,y-6,3,0,Math.PI*2);ctx.arc(x-14,y,3,0,Math.PI*2);ctx.arc(x+14,y,3,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle=C.floor;ctx.fillRect(0,GY,W,H-GY);
  ctx.fillStyle=C.grout;
  for(let x=-bg.offset;x<W;x+=bg.tileW)ctx.fillRect(x,GY,2,H-GY);
  for(let y=GY;y<H;y+=30)ctx.fillRect(0,y,W,2);
}

// Dog
const dog={x:90,y:GY,vy:0,ju:0,onGround:true,dead:false,deadT:0,deadA:0,animT:0,inv:0,hat:false,hatT:0};
function dogReset(){Object.assign(dog,{x:90,y:GY,vy:0,ju:0,onGround:true,dead:false,deadT:0,deadA:0,animT:0,inv:0,hat:false,hatT:0});}
function dogJump(){
  if(dog.dead)return;
  if(dog.ju===0){dog.vy=JV;dog.ju=1;dog.onGround=false;playSound("jump");}
  else if(dog.ju===1){dog.vy=DJV;dog.ju=2;playSound("djump");}
}
function dogUpdate(dt){
  dog.animT+=dt;if(dog.inv>0)dog.inv-=dt;
  if(dog.hat){dog.hatT-=dt;if(dog.hatT<=0)dog.hat=false;}
  if(dog.dead){dog.deadT+=dt;dog.deadA=Math.min(Math.PI,dog.deadA+dt*8);return;}
  dog.vy+=GRAVITY*dt;dog.y+=dog.vy*dt;
  if(dog.y>=GY){dog.y=GY;dog.vy=0;dog.ju=0;dog.onGround=true;}
}
function dogBounds(){return{x:dog.x-14,y:dog.y-44,w:28,h:40};}
function dogDraw(ctx,speed){
  const x=dog.x,y=dog.y,t=dog.animT,dead=dog.dead,inAir=!dog.onGround&&!dead;
  if(dog.inv>0&&Math.floor(dog.inv*10)%2===0)return;
  ctx.save();ctx.translate(x,y-24);
  if(dead)ctx.rotate(dog.deadA);else if(inAir)ctx.rotate(-0.12);
  ctx.fillStyle=C.dog;rr(ctx,-20,-18,40,26,8);ctx.fill();
  ctx.fillStyle=C.dogSnout;rr(ctx,-10,-8,20,14,6);ctx.fill();
  ctx.fillStyle=C.collar;ctx.fillRect(-20,-4,40,5);
  ctx.fillStyle="#fff";ctx.font="3px monospace";ctx.textAlign="center";ctx.fillText("VET",0,0);
  const tw=dead?0:Math.sin(t*7)*0.4;
  ctx.save();ctx.translate(20,-10);ctx.rotate(tw);ctx.fillStyle=C.dogDark;rr(ctx,0,-12,8,12,4);ctx.fill();ctx.restore();
  ctx.fillStyle=C.dog;ctx.beginPath();ctx.arc(16,-20,16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=C.dogDark;ctx.save();ctx.translate(8,-32);
  const ef=dead?0.3:inAir?-0.3:Math.sin(t*4)*0.1;ctx.rotate(ef);ctx.beginPath();ctx.ellipse(0,0,7,11,-0.3,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.fillStyle=C.dogSnout;rr(ctx,22,-16,14,10,4);ctx.fill();
  ctx.fillStyle="#333";ctx.beginPath();ctx.arc(30,-12,3,0,Math.PI*2);ctx.fill();
  if(dead){ctx.strokeStyle="#333";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,-26);ctx.lineTo(20,-18);ctx.moveTo(20,-26);ctx.lineTo(12,-18);ctx.stroke();}
  else{ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(18,-22,5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#333";ctx.beginPath();ctx.arc(19,-22,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(20,-23,1,0,Math.PI*2);ctx.fill();}
  if(!dead&&speed>=620){ctx.fillStyle="#111";rr(ctx,11,-27,10,7,2);ctx.fill();rr(ctx,23,-27,10,7,2);ctx.fill();ctx.strokeStyle="#555";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(21,-23);ctx.lineTo(23,-23);ctx.stroke();ctx.beginPath();ctx.moveTo(11,-23);ctx.lineTo(8,-21);ctx.stroke();ctx.beginPath();ctx.moveTo(33,-23);ctx.lineTo(36,-21);ctx.stroke();}
  if(dog.hat&&!dead){const a=Math.min(1,dog.hatT/0.5);ctx.globalAlpha=a;ctx.save();ctx.translate(14,-36);ctx.fillStyle="#ff4466";ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-10,0);ctx.lineTo(10,0);ctx.closePath();ctx.fill();ctx.fillStyle="#ffcc44";ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(-4,-10);ctx.lineTo(4,-10);ctx.closePath();ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,-18,2.5,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;}
  const showT=dead||(inAir&&dog.ju===2);
  if(showT){ctx.fillStyle="#ff8899";ctx.beginPath();ctx.moveTo(26,-6);ctx.quadraticCurveTo(30,dead?8:2,28,dead?14:4);ctx.quadraticCurveTo(26,dead?14:4,24,dead?8:2);ctx.closePath();ctx.fill();}
  const ls=dead?0.5:inAir?0.2:Math.sin(t*10)*0.3;
  for(const[bx,sw]of[[-14,ls],[-6,-ls],[4,ls],[12,-ls]]){ctx.save();ctx.translate(bx,8);if(dead)ctx.rotate(sw+0.5);else ctx.rotate(sw);ctx.fillStyle=C.dog;rr(ctx,-3,0,6,14,3);ctx.fill();ctx.fillStyle=C.dogDark;ctx.beginPath();ctx.arc(0,14,4,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.restore();
}

// Obstacles
const pool=Array.from({length:6},()=>({active:false,type:"cat",x:0,y:0,w:0,h:0,at:0}));
let spawnT=0,nextSpawn=1500;
function getInterval(spd){const t=(spd-INIT_SPEED)/(MAX_SPEED-INIT_SPEED);return SPAWN_MAX-(SPAWN_MAX-SPAWN_MIN)*Math.min(1,t);}
function getType(score){if(score<300)return"cat";const t=["cat","cat","shampoo"];if(score>=500)t.push("syringe");if(score>=1000)t.push("syringe");return t[Math.floor(Math.random()*t.length)];}
function spawnObs(type,x){const o=pool.find(o=>!o.active);if(!o)return;o.type=type;o.x=x;o.active=true;o.at=0;if(type==="cat"){o.w=36;o.h=55;}else if(type==="syringe"){o.w=60;o.h=22;}else{o.w=30;o.h=50;}o.y=GY-o.h;}
function obsUpdate(dt,spd,score){
  spawnT+=dt*1000;
  if(spawnT>=nextSpawn){spawnT=0;nextSpawn=getInterval(spd)+(Math.random()-0.5)*300;spawnObs(getType(score),W+20);if(score>=1000&&Math.random()<0.25)spawnObs(getType(score),W+80);}
  for(const o of pool)if(o.active){o.x-=spd*dt;o.at+=dt;if(o.x+o.w<-20)o.active=false;}
}
function obsBounds(o){const p=6;return{x:o.x+p,y:o.y+p,w:o.w-p*2,h:o.h-p*2};}
function obsDraw(ctx){for(const o of pool)if(o.active){if(o.type==="cat")drawCat(ctx,o);else if(o.type==="syringe")drawSyringe(ctx,o);else drawShampoo(ctx,o);}}
function drawCat(ctx,o){const{x,y,w,h,at:t}=o,cx=x+w/2;ctx.fillStyle=C.cat;rr(ctx,x+4,y+20,w-8,h-20,8);ctx.fill();ctx.beginPath();ctx.arc(cx,y+16,16,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.catDark;ctx.beginPath();ctx.moveTo(cx-14,y+8);ctx.lineTo(cx-8,y-6);ctx.lineTo(cx-2,y+4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(cx+14,y+8);ctx.lineTo(cx+8,y-6);ctx.lineTo(cx+2,y+4);ctx.closePath();ctx.fill();ctx.fillStyle="#ff99aa";ctx.beginPath();ctx.moveTo(cx-12,y+8);ctx.lineTo(cx-8,y-2);ctx.lineTo(cx-3,y+5);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(cx+12,y+8);ctx.lineTo(cx+8,y-2);ctx.lineTo(cx+3,y+5);ctx.closePath();ctx.fill();ctx.fillStyle=C.catEye;ctx.beginPath();ctx.arc(cx-6,y+15,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+6,y+15,4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#111";ctx.beginPath();ctx.ellipse(cx-6,y+15,1.5,3,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(cx+6,y+15,1.5,3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.cat;ctx.fillRect(cx-11,y+10,10,4);ctx.fillRect(cx+1,y+10,10,4);ctx.fillStyle="#ffaaaa";ctx.beginPath();ctx.arc(cx,y+20,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#aaa";ctx.lineWidth=1;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*4,y+19);ctx.lineTo(cx+s*18,y+17);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+s*4,y+21);ctx.lineTo(cx+s*18,y+23);ctx.stroke();}ctx.strokeStyle=C.catDark;ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();const curl=Math.sin(t*1.5)*8;ctx.moveTo(x+w-2,y+h-10);ctx.quadraticCurveTo(x+w+18,y+h-30+curl,x+w+12,y+h-50+curl);ctx.stroke();if(Math.floor(t*2)%4===0){ctx.fillStyle="rgba(255,255,255,0.9)";rr(ctx,cx-22,y-28,44,18,5);ctx.fill();ctx.fillStyle="#555";ctx.font="7px monospace";ctx.textAlign="center";ctx.fillText("MEOW",cx,y-15);}}
function drawSyringe(ctx,o){const{x,y,w,h,at:t}=o;ctx.fillStyle=C.syringeBody;ctx.strokeStyle="#88cccc";ctx.lineWidth=1.5;rr(ctx,x+14,y+6,w-26,h-8,4);ctx.fill();ctx.stroke();const lH=(h-14)*(0.6+Math.sin(t*3)*0.05);ctx.fillStyle="rgba(0,200,180,0.5)";ctx.save();rr(ctx,x+16,y+h-8-lH,w-30,lH,2);ctx.clip();ctx.fillRect(x+16,y+h-8-lH,w-30,lH);ctx.restore();ctx.strokeStyle="rgba(0,100,90,0.5)";ctx.lineWidth=1;for(let i=1;i<=3;i++){const ly=y+6+(h-14)*i/4;ctx.beginPath();ctx.moveTo(x+16,ly);ctx.lineTo(x+22,ly);ctx.stroke();}ctx.fillStyle="#aaa";ctx.fillRect(x,y+5,16,h-6);ctx.fillStyle="#888";ctx.fillRect(x-2,y+4,5,h-4);ctx.fillRect(x-2,y+4,16,5);ctx.fillRect(x-2,y+h-4,16,5);ctx.fillStyle="#ccc";ctx.beginPath();ctx.moveTo(x+w-12,y+h/2-2);ctx.lineTo(x+w,y+h/2);ctx.lineTo(x+w-12,y+h/2+2);ctx.closePath();ctx.fill();}
function drawShampoo(ctx,o){const{x,y,w,h,at:t}=o,cx=x+w/2;ctx.fillStyle=C.shampoo;rr(ctx,x+2,y+14,w-4,h-14,8);ctx.fill();ctx.fillStyle="#ee5555";rr(ctx,x+6,y+6,w-12,14,4);ctx.fill();ctx.fillStyle="#fff";rr(ctx,x+8,y,w-16,10,3);ctx.fill();ctx.fillStyle="#ddd";ctx.fillRect(x+11,y+3,w-22,4);ctx.fillStyle="rgba(255,255,255,0.85)";rr(ctx,x+5,y+22,w-10,20,3);ctx.fill();ctx.fillStyle=C.shampoo;ctx.font="bold 5px sans-serif";ctx.textAlign="center";ctx.fillText("PERRO",cx,y+31);ctx.fillText("CLEAN",cx,y+38);ctx.fillStyle="rgba(255,255,255,0.3)";rr(ctx,x+6,y+16,6,h-22,3);ctx.fill();ctx.fillStyle=C.bubble;for(const b of[{ox:-6,oy:-12+Math.sin(t*2)*4,r:4},{ox:4,oy:-20+Math.sin(t*2.5+1)*4,r:3},{ox:10,oy:-8+Math.sin(t*1.8+2)*4,r:2.5}]){ctx.beginPath();ctx.arc(cx+b.ox,y+b.oy,b.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(100,180,255,0.5)";ctx.lineWidth=0.5;ctx.stroke();}}

// Particles
const parts=[];
function emitParts(x,y,type,n=8){for(let i=0;i<n;i++){const a=(Math.PI*2/n)*i+(Math.random()-0.5)*0.5,spd=60+Math.random()*120,cols=type==="star"?["#ffcc44","#ff6644","#44ccff","#ff44aa","#00c8b4"]:["#c8c4bc","#b0aca4"];parts.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-(type==="star"?80:0),life:1,color:cols[Math.floor(Math.random()*cols.length)],size:type==="star"?4+Math.random()*4:2+Math.random()*3,grav:type==="star"?300:150,type});}}
function emitText(x,y,text){parts.push({x,y,vx:0,vy:-60,life:1.2,maxLife:1.2,color:"#ffcc44",size:14,type:"text",text,grav:0});}
function partsUpdate(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.grav*dt;p.life-=dt/(p.maxLife||0.8);if(p.life<=0)parts.splice(i,1);}}
function partsDraw(ctx){for(const p of parts){ctx.globalAlpha=Math.max(0,p.life);if(p.type==="text"){ctx.fillStyle=p.color;ctx.font="bold "+p.size+"px monospace";ctx.textAlign="center";ctx.fillText(p.text,p.x,p.y);}else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}}ctx.globalAlpha=1;}

// Audio
let audioCtx=null;
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
function playTone(type,f0,f1,dur,gain=0.15){try{initAudio();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type=type;o.frequency.setValueAtTime(f0,audioCtx.currentTime);o.frequency.linearRampToValueAtTime(f1,audioCtx.currentTime+dur);g.gain.setValueAtTime(gain,audioCtx.currentTime);g.gain.linearRampToValueAtTime(0,audioCtx.currentTime+dur);o.start(audioCtx.currentTime);o.stop(audioCtx.currentTime+dur);}catch(e){}}
function playSound(n){if(n==="jump")playTone("sine",200,420,0.10);else if(n==="djump")playTone("sine",420,700,0.10);else if(n==="death")playTone("sawtooth",350,60,0.45,0.20);else if(n==="milestone"){[0,70,140].forEach((t,i)=>{const f=[400,500,650][i];setTimeout(()=>playTone("sine",f,f,0.12),t);});}}

// UI overlay
let milestoneFlash=0,milestoneText="";
function drawUI(ctx,score,hi,state,at){
  const font="monospace";
  if(state!==GS.START){ctx.fillStyle="#555";ctx.font="10px "+font;ctx.textAlign="right";ctx.fillText("PUNTOS: "+Math.floor(score),W-10,22);ctx.fillText("MEJOR: "+Math.floor(hi),W-10,38);}
  if(state===GS.START){
    ctx.fillStyle="rgba(240,237,230,0.85)";ctx.fillRect(0,0,W,H);
    ctx.fillStyle=C.accent;ctx.font="bold 28px "+font;ctx.textAlign="center";ctx.fillText("PERRO",W/2,H/2-40);
    ctx.fillStyle=C.dogDark;ctx.fillText("CORREDOR",W/2,H/2-10);
    ctx.fillStyle="#666";ctx.font="8px "+font;
    if(Math.floor(at*2)%2===0)ctx.fillText("TAP PARA CORRER!",W/2,H/2+20);
    ctx.fillStyle=C.accent;ctx.font="6px "+font;ctx.fillText("200pts = cupón de descuento",W/2,H-12);
  } else if(state===GS.DEAD){
    ctx.fillStyle="rgba(20,10,10,0.6)";ctx.fillRect(0,0,W,H);
    ctx.fillStyle=C.death;ctx.font="bold 20px "+font;ctx.textAlign="center";ctx.fillText("¡OH NO!",W/2,H/2-45);
    const msgs=["¡El gato ganó!","¡Más entrenamiento!","¡A urgencias!","¡Bad dog... con amor!"];
    ctx.fillStyle="#fff";ctx.font="6px "+font;ctx.fillText(msgs[Math.floor(score/50)%msgs.length],W/2,H/2-20);
    ctx.fillStyle="#ffcc44";ctx.font="9px "+font;ctx.fillText("PUNTOS: "+Math.floor(score),W/2,H/2+2);
    if(score>=hi&&score>0){ctx.fillStyle=C.accent;ctx.font="8px "+font;ctx.fillText("¡NUEVO RÉCORD!",W/2,H/2+18);}
    else{ctx.fillStyle="#aaa";ctx.font="7px "+font;ctx.fillText("MEJOR: "+Math.floor(hi),W/2,H/2+18);}
    ctx.fillStyle="#ddd";ctx.font="6px "+font;ctx.fillText("TAP PARA INTENTAR OTRA VEZ",W/2,H/2+40);
  }
  if(milestoneFlash>0){ctx.globalAlpha=Math.min(1,milestoneFlash);ctx.fillStyle=C.accent;ctx.font="bold 18px "+font;ctx.textAlign="center";ctx.fillText(milestoneText,W/2,H/2-30);ctx.globalAlpha=1;milestoneFlash-=0.03;}
}

// Game state
let state=GS.START,score=0,hi=0,speed=INIT_SPEED,animT=0,lastT=0,deathReported=false;
const milestonesHit=new Set();

function startGame(){state=GS.PLAYING;score=0;speed=INIT_SPEED;milestonesHit.clear();deathReported=false;dogReset();for(const o of pool)o.active=false;spawnT=0;nextSpawn=1500;parts.length=0;}

function die(){
  state=GS.DEAD;dog.dead=true;dog.deadT=0;dog.deadA=0;
  playSound("death");emitParts(dog.x,dog.y-24,"star",16);
  if(score>hi)hi=score;
  if(!deathReported){deathReported=true;window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:"score",score:Math.floor(score)}));}
}

function update(dt){
  animT+=dt;
  if(state===GS.DEAD){dogUpdate(dt);return;}
  if(state!==GS.PLAYING)return;
  speed=Math.min(MAX_SPEED,speed+SPEED_INC*dt);
  score+=SPF*dt;
  bgUpdate(dt,speed);dogUpdate(dt);obsUpdate(dt,speed,score);partsUpdate(dt);
  const db=dogBounds();
  for(const o of pool)if(o.active&&overlap(db,obsBounds(o))){die();return;}
  for(const m of MILESTONES){if(score>=m&&!milestonesHit.has(m)){milestonesHit.add(m);playSound("milestone");milestoneText="¡"+m+"!";milestoneFlash=2;emitText(W/2,H/2-20,"¡"+m+"!");dog.hat=true;dog.hatT=2.5;}}
}

function draw(ctx){
  ctx.clearRect(0,0,W,H);
  bgDraw(ctx);partsDraw(ctx);obsDraw(ctx);dogDraw(ctx,speed);drawUI(ctx,score,hi,state,animT);
}

const canvas=document.getElementById("c");
canvas.width=W;canvas.height=H;
const ctx=canvas.getContext("2d");

canvas.addEventListener("touchstart",e=>{e.preventDefault();if(state===GS.START||state===GS.DEAD)startGame();else dogJump();},{passive:false});
canvas.addEventListener("mousedown",e=>{if(state===GS.START||state===GS.DEAD)startGame();else dogJump();});
document.addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();if(state===GS.START||state===GS.DEAD)startGame();else dogJump();}});

// Receive hi score from RN
window.addEventListener("message",e=>{try{const d=JSON.parse(e.data);if(d.type==="hi")hi=d.score;}catch(e){}});

function loop(ts){
  const dt=Math.min((ts-lastT)/1000,0.05);lastT=ts;
  update(dt);draw(ctx);
  requestAnimationFrame(loop);
}
requestAnimationFrame(ts=>{lastT=ts;requestAnimationFrame(loop);});
</script>
</body>
</html>`;

type CouponResult =
  | { type: "coupon"; code: string; discount: number }
  | { type: "alreadyEarned"; existingCode: string }
  | { type: "none" }
  | null;

export default function GameScreen() {
  const queryClient = useQueryClient();
  const webViewRef = useRef<any>(null);
  const [couponResult, setCouponResult] = useState<CouponResult>(null);
  const [finalScore, setFinalScore] = useState(0);

  const { data: gameData } = useQuery({
    queryKey: ["game-data"],
    queryFn: () => api.get("/mobile/game").then(r => r.data),
    onSuccess: (data: any) => {
      webViewRef.current?.injectJavaScript(
        `window.dispatchEvent(new MessageEvent('message',{data:JSON.stringify({type:'hi',score:${data.topScore}})}));true;`
      );
    },
  } as any);

  const scoreMutation = useMutation({
    mutationFn: (score: number) => api.post("/mobile/game", { score }).then(r => r.data),
    onSuccess: (data: any, score: number) => {
      setFinalScore(score);
      if (data.coupon) {
        setCouponResult({ type: "coupon", code: data.coupon.code, discount: data.coupon.discount });
        queryClient.invalidateQueries({ queryKey: ["game-data"] });
      } else if (data.alreadyEarned) {
        setCouponResult({ type: "alreadyEarned", existingCode: data.existingCode });
      } else {
        setCouponResult({ type: "none" });
      }
    },
  });

  function handleMessage(event: any) {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "score") {
        scoreMutation.mutate(msg.score);
      }
    } catch {}
  }

  function handleRestart() {
    setCouponResult(null);
    setFinalScore(0);
    webViewRef.current?.injectJavaScript("startGame();true;");
  }

  const topScore = (gameData as any)?.topScore ?? 0;
  const coupons: any[] = (gameData as any)?.coupons ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1a1a2e" }}>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Gamepad2 size={22} color="#00c8b4" />
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#fff" }}>Perro Corredor</Text>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={22} color="#9ca3af" />
        </Pressable>
      </View>

      {/* Game WebView */}
      <View style={{ marginHorizontal: 12, borderRadius: 16, overflow: "hidden", aspectRatio: 800 / 300 }}>
        <WebView
          ref={webViewRef}
          source={{ html: GAME_HTML }}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          style={{ backgroundColor: "#1a1a2e" }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>

      {/* Score tiers */}
      <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 12, marginTop: 12 }}>
        {[{ pts: "200+", pct: "5%", bg: "#fef3c7", text: "#d97706" }, { pts: "500+", pct: "10%", bg: "#ffedd5", text: "#f97316" }, { pts: "1000+", pct: "15%", bg: "#fee2e2", text: "#dc2626" }].map(({ pts, pct, bg, text }) => (
          <View key={pts} style={{ flex: 1, backgroundColor: bg, borderRadius: 10, padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: text }}>{pct}</Text>
            <Text style={{ fontSize: 11, color: text, fontWeight: "500", marginTop: 2 }}>{pts} pts</Text>
          </View>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, gap: 10 }} showsVerticalScrollIndicator={false}>

        {/* Personal best */}
        {topScore > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 12 }}>
            <Trophy size={18} color="#fbbf24" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Tu récord personal</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>{topScore} puntos</Text>
            </View>
          </View>
        )}

        {/* Active coupons */}
        {coupons.length > 0 && (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Gift size={15} color="#f97316" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>Cupones disponibles</Text>
            </View>
            {coupons.map((c: any) => (
              <View key={c.code} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: "#f97316", fontVariant: ["tabular-nums"], letterSpacing: 1 }}>{c.code}</Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    Vence: {new Date(c.expiresAt).toLocaleDateString("es-CL")}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#f97316", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{c.discount}% OFF</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 11, color: "#6b7280", textAlign: "center", paddingTop: 4 }}>
          Máx. 1 cupón/día · Válido 7 días · Úsalo al pagar en marketplace
        </Text>
      </ScrollView>

      {/* Coupon result overlay */}
      {scoreMutation.isPending && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#00c8b4" size="large" />
          <Text style={{ color: "#fff", marginTop: 10, fontSize: 13 }}>Calculando cupón...</Text>
        </View>
      )}

      {couponResult && couponResult.type !== "none" && !scoreMutation.isPending && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", alignItems: "center", gap: 12 }}>
            {couponResult.type === "coupon" ? (
              <>
                <Text style={{ fontSize: 40 }}>🎁</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>¡Ganaste un cupón!</Text>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>Puntuación: {finalScore}</Text>
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316", letterSpacing: 2 }}>{couponResult.code}</Text>
                  <Text style={{ fontSize: 14, color: "#ea580c", fontWeight: "600", marginTop: 4 }}>{couponResult.discount}% de descuento</Text>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Válido 7 días. Úsalo al pagar en marketplace.</Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 40 }}>🏆</Text>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Ya tienes cupón de hoy</Text>
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 14, padding: 16, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#fed7aa" }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: "#f97316", letterSpacing: 2 }}>{(couponResult as any).existingCode}</Text>
                </View>
                <Text style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>Solo 1 cupón por día.</Text>
              </>
            )}
            <View style={{ flexDirection: "row", gap: 10, width: "100%", marginTop: 4 }}>
              <Pressable onPress={handleRestart} style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}>
                <RotateCcw size={14} color="#374151" />
                <Text style={{ fontWeight: "600", color: "#374151" }}>Otra vez</Text>
              </Pressable>
              <Pressable onPress={() => { setCouponResult(null); router.push("/(owner)/(tabs)/marketplace"); }} style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: "#f97316", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", color: "#fff" }}>Usar cupón</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}
