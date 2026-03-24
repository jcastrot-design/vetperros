"use client";

import { useEffect, useRef, useState } from "react";
import { submitGameScore } from "@/lib/actions/game";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gift, Trophy, RotateCcw, Loader2 } from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const W = 800, H = 300, GROUND_Y = 230;
const GRAVITY = 1700, JUMP_VEL = -600, DOUBLE_JUMP_VEL = -560, MAX_JUMPS = 2;
const INIT_SPEED = 300, MAX_SPEED = 850, SPEED_INC = 14, SCORE_PER_SEC = 10;
const SPAWN_MIN = 900, SPAWN_MAX = 2400;
const MILESTONE_SCORES = [100, 250, 500, 1000, 2500, 5000];
const COLORS = {
  sky: "#f0ede6", wall: "#e8e4dc", floor: "#c8c4bc", grout: "#b0aca4",
  dog: "#c8843c", dogDark: "#a0602c", dogSnout: "#e0a870", collar: "#00c8b4",
  cat: "#555566", catDark: "#333344", catEye: "#ffdd44",
  syringe: "#88ddcc", syringeBody: "#cceeee",
  shampoo: "#ff6b6b", shampooLabel: "#fff",
  bubble: "rgba(120,200,255,0.7)", particle: "#ffcc44",
  text: "#333", accent: "#00c8b4", death: "#ff4466",
};
const GAME_STATE = { START: 0, PLAYING: 1, DEAD: 2 } as const;
type GameState = typeof GAME_STATE[keyof typeof GAME_STATE];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// ─── AUDIO ────────────────────────────────────────────────────────────────────
class AudioEngine {
  private ctx: AudioContext | null = null;
  private init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  private play(type: OscillatorType, freqStart: number, freqEnd: number, duration: number, gainVal = 0.15) {
    try {
      this.init();
      const ac = this.ctx!;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, ac.currentTime);
      osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + duration);
      gain.gain.setValueAtTime(gainVal, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
      osc.start(ac.currentTime); osc.stop(ac.currentTime + duration);
    } catch (_) {}
  }
  jump() { this.play("sine", 200, 420, 0.10); }
  doubleJump() { this.play("sine", 420, 700, 0.10); }
  land() { this.play("sine", 120, 80, 0.06, 0.08); }
  death() { this.play("sawtooth", 350, 60, 0.45, 0.20); }
  milestone() {
    if (!this.ctx) this.init();
    [0, 0.07, 0.14].forEach((t, i) => {
      const freq = [400, 500, 650][i];
      setTimeout(() => this.play("sine", freq, freq, 0.12), t * 1000);
    });
  }
}

// ─── BACKGROUND ───────────────────────────────────────────────────────────────
class Background {
  offset = 0; tileW = 60; pawOffset = 0;
  update(dt: number, speed: number) {
    this.offset = (this.offset + speed * dt) % this.tileW;
    this.pawOffset = (this.pawOffset + speed * 0.3 * dt) % 300;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = COLORS.wall; ctx.fillRect(0, 0, W, GROUND_Y);
    ctx.fillStyle = "rgba(0,200,180,0.08)"; ctx.fillRect(0, GROUND_Y - 30, W, 30);
    this._drawWallDeco(ctx);
    ctx.fillStyle = COLORS.floor; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = COLORS.grout;
    for (let x = -this.offset; x < W; x += this.tileW) ctx.fillRect(x, GROUND_Y, 2, H - GROUND_Y);
    for (let y = GROUND_Y; y < H; y += 30) ctx.fillRect(0, y, W, 2);
  }
  private _drawWallDeco(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(0,200,180,0.12)";
    for (const cx of [100, 300, 500, 700]) {
      const x = ((cx - this.pawOffset * 0.2) % 800 + 800) % 800;
      ctx.fillRect(x - 2, 20, 4, 20); ctx.fillRect(x - 10, 28, 20, 4);
    }
    ctx.fillStyle = "rgba(180,150,120,0.15)";
    for (const px of [200, 450, 650]) {
      const x = ((px - this.pawOffset * 0.3) % 800 + 800) % 800;
      const y = 60;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(x - 8, y - 6, 3, 0, Math.PI * 2);
      ctx.arc(x + 8, y - 6, 3, 0, Math.PI * 2);
      ctx.arc(x - 14, y, 3, 0, Math.PI * 2);
      ctx.arc(x + 14, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── DOG ──────────────────────────────────────────────────────────────────────
class Dog {
  x = 90; y = GROUND_Y; vy = 0; jumpsUsed = 0; onGround = true;
  isDead = false; deadTimer = 0; deadAngle = 0; animTime = 0; invincible = 0;
  hasPartyHat = false; partyHatTimer = 0;

  reset() {
    this.x = 90; this.y = GROUND_Y; this.vy = 0; this.jumpsUsed = 0;
    this.onGround = true; this.isDead = false; this.deadTimer = 0;
    this.deadAngle = 0; this.animTime = 0; this.invincible = 0;
    this.hasPartyHat = false; this.partyHatTimer = 0;
  }

  jump(audio: AudioEngine): boolean {
    if (this.isDead) return false;
    if (this.jumpsUsed === 0) {
      this.vy = JUMP_VEL; this.jumpsUsed = 1; this.onGround = false;
      audio.jump(); return true;
    } else if (this.jumpsUsed === 1) {
      this.vy = DOUBLE_JUMP_VEL; this.jumpsUsed = 2;
      audio.doubleJump(); return true;
    }
    return false;
  }

  update(dt: number) {
    this.animTime += dt;
    if (this.invincible > 0) this.invincible -= dt;
    if (this.hasPartyHat) {
      this.partyHatTimer -= dt;
      if (this.partyHatTimer <= 0) this.hasPartyHat = false;
    }
    if (this.isDead) { this.deadTimer += dt; this.deadAngle = Math.min(Math.PI, this.deadAngle + dt * 8); return; }
    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y) { this.y = GROUND_Y; this.vy = 0; this.jumpsUsed = 0; this.onGround = true; }
  }

  getBounds() { return { x: this.x - 14, y: this.y - 44, w: 28, h: 40 }; }
  triggerDeath() { this.isDead = true; this.deadTimer = 0; }
  showPartyHat() { this.hasPartyHat = true; this.partyHatTimer = 2.5; }

  draw(ctx: CanvasRenderingContext2D, speed: number) {
    const x = this.x, y = this.y, t = this.animTime;
    const dead = this.isDead, inAir = !this.onGround && !dead;
    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;
    ctx.save();
    ctx.translate(x, y - 24);
    if (dead) ctx.rotate(this.deadAngle);
    else if (inAir) ctx.rotate(-0.12);

    // Body
    ctx.fillStyle = COLORS.dog; roundRect(ctx, -20, -18, 40, 26, 8); ctx.fill();
    ctx.fillStyle = COLORS.dogSnout; roundRect(ctx, -10, -8, 20, 14, 6); ctx.fill();

    // Collar
    ctx.fillStyle = COLORS.collar; ctx.fillRect(-20, -4, 40, 5);
    ctx.fillStyle = "#fff"; ctx.font = "3px monospace"; ctx.textAlign = "center";
    ctx.fillText("VET", 0, 0);

    // Tail
    const tailWag = dead ? 0 : Math.sin(t * 7) * 0.4;
    ctx.save(); ctx.translate(20, -10); ctx.rotate(tailWag);
    ctx.fillStyle = COLORS.dogDark; roundRect(ctx, 0, -12, 8, 12, 4); ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = COLORS.dog; ctx.beginPath(); ctx.arc(16, -20, 16, 0, Math.PI * 2); ctx.fill();

    // Ear
    ctx.fillStyle = COLORS.dogDark;
    ctx.save(); ctx.translate(8, -32);
    const earFlop = dead ? 0.3 : inAir ? -0.3 : Math.sin(t * 4) * 0.1;
    ctx.rotate(earFlop);
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 11, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Snout
    ctx.fillStyle = COLORS.dogSnout; roundRect(ctx, 22, -16, 14, 10, 4); ctx.fill();
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(30, -12, 3, 0, Math.PI * 2); ctx.fill();

    // Eye
    if (dead) {
      ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, -26); ctx.lineTo(20, -18);
      ctx.moveTo(20, -26); ctx.lineTo(12, -18);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(18, -22, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(19, -22, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(20, -23, 1, 0, Math.PI * 2); ctx.fill();
    }

    // Sunglasses at high speed
    if (!dead && speed >= 620) {
      ctx.fillStyle = "#111";
      roundRect(ctx, 11, -27, 10, 7, 2); ctx.fill();
      roundRect(ctx, 23, -27, 10, 7, 2); ctx.fill();
      ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(21, -23); ctx.lineTo(23, -23); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(11, -23); ctx.lineTo(8, -21); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(33, -23); ctx.lineTo(36, -21); ctx.stroke();
    }

    // Party hat at milestone
    if (this.hasPartyHat && !dead) {
      const alpha = Math.min(1, this.partyHatTimer / 0.5);
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(14, -36);
      ctx.fillStyle = "#ff4466";
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-10, 0); ctx.lineTo(10, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#ffcc44";
      ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(-4, -10); ctx.lineTo(4, -10); ctx.closePath(); ctx.fill();
      // Star on top
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -18, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Tongue
    const showTongue = dead || (inAir && this.jumpsUsed === 2);
    if (showTongue) {
      ctx.fillStyle = "#ff8899";
      ctx.beginPath();
      ctx.moveTo(26, -6);
      ctx.quadraticCurveTo(30, dead ? 8 : 2, 28, dead ? 14 : 4);
      ctx.quadraticCurveTo(26, dead ? 14 : 4, 24, dead ? 8 : 2);
      ctx.closePath(); ctx.fill();
    }

    // Legs
    const legSwing = dead ? 0.5 : inAir ? 0.2 : Math.sin(t * 10) * 0.3;
    for (const [bx, sw] of [[-14, legSwing], [-6, -legSwing], [4, legSwing], [12, -legSwing]] as [number, number][]) {
      ctx.save(); ctx.translate(bx, 8);
      if (dead) ctx.rotate(sw + 0.5); else ctx.rotate(sw);
      ctx.fillStyle = COLORS.dog; roundRect(ctx, -3, 0, 6, 14, 3); ctx.fill();
      ctx.fillStyle = COLORS.dogDark; ctx.beginPath(); ctx.arc(0, 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

// ─── OBSTACLE ─────────────────────────────────────────────────────────────────
class Obstacle {
  active = false; type = "cat"; x = 0; y = 0; w = 0; h = 0; animTime = 0;

  spawn(type: string, x: number) {
    this.type = type; this.x = x; this.active = true; this.animTime = 0;
    if (type === "cat") { this.w = 36; this.h = 55; }
    else if (type === "syringe") { this.w = 60; this.h = 22; }
    else { this.w = 30; this.h = 50; }
    this.y = GROUND_Y - this.h;
  }

  update(dt: number, speed: number) {
    this.x -= speed * dt; this.animTime += dt;
    if (this.x + this.w < -20) this.active = false;
  }

  getBounds() {
    const pad = 6;
    return { x: this.x + pad, y: this.y + pad, w: this.w - pad * 2, h: this.h - pad * 2 };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    if (this.type === "cat") this._drawCat(ctx);
    else if (this.type === "syringe") this._drawSyringe(ctx);
    else this._drawShampoo(ctx);
  }

  private _drawCat(ctx: CanvasRenderingContext2D) {
    const { x, y, w, h, animTime: t } = this;
    const cx = x + w / 2;
    ctx.fillStyle = COLORS.cat; roundRect(ctx, x + 4, y + 20, w - 8, h - 20, 8); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, y + 16, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.catDark;
    ctx.beginPath(); ctx.moveTo(cx - 14, y + 8); ctx.lineTo(cx - 8, y - 6); ctx.lineTo(cx - 2, y + 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 14, y + 8); ctx.lineTo(cx + 8, y - 6); ctx.lineTo(cx + 2, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ff99aa";
    ctx.beginPath(); ctx.moveTo(cx - 12, y + 8); ctx.lineTo(cx - 8, y - 2); ctx.lineTo(cx - 3, y + 5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + 12, y + 8); ctx.lineTo(cx + 8, y - 2); ctx.lineTo(cx + 3, y + 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COLORS.catEye;
    ctx.beginPath(); ctx.arc(cx - 6, y + 15, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 6, y + 15, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.ellipse(cx - 6, y + 15, 1.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 6, y + 15, 1.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLORS.cat; ctx.fillRect(cx - 11, y + 10, 10, 4); ctx.fillRect(cx + 1, y + 10, 10, 4);
    ctx.fillStyle = "#ffaaaa"; ctx.beginPath(); ctx.arc(cx, y + 20, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(cx + s * 4, y + 19); ctx.lineTo(cx + s * 18, y + 17); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + s * 4, y + 21); ctx.lineTo(cx + s * 18, y + 23); ctx.stroke();
    }
    ctx.strokeStyle = COLORS.catDark; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath();
    const curl = Math.sin(t * 1.5) * 8;
    ctx.moveTo(x + w - 2, y + h - 10);
    ctx.quadraticCurveTo(x + w + 18, y + h - 30 + curl, x + w + 12, y + h - 50 + curl);
    ctx.stroke();
    if (Math.floor(t * 2) % 4 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.9)"; roundRect(ctx, cx - 22, y - 28, 44, 18, 5); ctx.fill();
      ctx.fillStyle = "#555"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("MEOW", cx, y - 15);
    }
  }

  private _drawSyringe(ctx: CanvasRenderingContext2D) {
    const { x, y, w, h, animTime: t } = this;
    ctx.fillStyle = COLORS.syringeBody; ctx.strokeStyle = "#88cccc"; ctx.lineWidth = 1.5;
    roundRect(ctx, x + 14, y + 6, w - 26, h - 8, 4); ctx.fill(); ctx.stroke();
    const liquidH = (h - 14) * (0.6 + Math.sin(t * 3) * 0.05);
    ctx.fillStyle = "rgba(0,200,180,0.5)";
    ctx.save(); roundRect(ctx, x + 16, y + h - 8 - liquidH, w - 30, liquidH, 2);
    ctx.clip(); ctx.fillRect(x + 16, y + h - 8 - liquidH, w - 30, liquidH); ctx.restore();
    ctx.strokeStyle = "rgba(0,100,90,0.5)"; ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const ly = y + 6 + (h - 14) * i / 4;
      ctx.beginPath(); ctx.moveTo(x + 16, ly); ctx.lineTo(x + 22, ly); ctx.stroke();
    }
    ctx.fillStyle = "#aaa"; ctx.fillRect(x, y + 5, 16, h - 6);
    ctx.fillStyle = "#888";
    ctx.fillRect(x - 2, y + 4, 5, h - 4);
    ctx.fillRect(x - 2, y + 4, 16, 5);
    ctx.fillRect(x - 2, y + h - 4, 16, 5);
    ctx.fillStyle = "#ccc"; ctx.beginPath();
    ctx.moveTo(x + w - 12, y + h / 2 - 2); ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - 12, y + h / 2 + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 18, y + 9); ctx.lineTo(x + w - 16, y + 9); ctx.stroke();
  }

  private _drawShampoo(ctx: CanvasRenderingContext2D) {
    const { x, y, w, h, animTime: t } = this;
    const cx = x + w / 2;
    ctx.fillStyle = COLORS.shampoo; roundRect(ctx, x + 2, y + 14, w - 4, h - 14, 8); ctx.fill();
    ctx.fillStyle = "#ee5555"; roundRect(ctx, x + 6, y + 6, w - 12, 14, 4); ctx.fill();
    ctx.fillStyle = "#fff"; roundRect(ctx, x + 8, y, w - 16, 10, 3); ctx.fill();
    ctx.fillStyle = "#ddd"; ctx.fillRect(x + 11, y + 3, w - 22, 4);
    ctx.fillStyle = "rgba(255,255,255,0.85)"; roundRect(ctx, x + 5, y + 22, w - 10, 20, 3); ctx.fill();
    ctx.fillStyle = COLORS.shampoo; ctx.font = "bold 5px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("PERRO", cx, y + 31); ctx.fillText("CLEAN", cx, y + 38);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; roundRect(ctx, x + 6, y + 16, 6, h - 22, 3); ctx.fill();
    ctx.fillStyle = COLORS.bubble;
    for (const b of [{ ox: -6, oy: -12 + Math.sin(t * 2) * 4, r: 4 }, { ox: 4, oy: -20 + Math.sin(t * 2.5 + 1) * 4, r: 3 }, { ox: 10, oy: -8 + Math.sin(t * 1.8 + 2) * 4, r: 2.5 }]) {
      ctx.beginPath(); ctx.arc(cx + b.ox, y + b.oy, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(100,180,255,0.5)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
  }
}

// ─── OBSTACLE MANAGER ─────────────────────────────────────────────────────────
class ObstacleManager {
  pool = Array.from({ length: 6 }, () => new Obstacle());
  spawnTimer = 0; nextSpawn = 1500;

  private getInterval(speed: number) {
    const t = (speed - INIT_SPEED) / (MAX_SPEED - INIT_SPEED);
    return SPAWN_MAX - (SPAWN_MAX - SPAWN_MIN) * Math.min(1, t);
  }

  private getType(score: number) {
    if (score < 300) return "cat";
    const types = ["cat", "cat", "shampoo"];
    if (score >= 500) types.push("syringe");
    if (score >= 1000) types.push("syringe");
    return types[Math.floor(Math.random() * types.length)];
  }

  update(dt: number, speed: number, score: number) {
    this.spawnTimer += dt * 1000;
    if (this.spawnTimer >= this.nextSpawn) {
      this.spawnTimer = 0;
      this.nextSpawn = this.getInterval(speed) + (Math.random() - 0.5) * 300;
      const obs = this.pool.find(o => !o.active);
      if (obs) obs.spawn(this.getType(score), W + 20);
      if (score >= 1000 && Math.random() < 0.25) {
        const obs2 = this.pool.find(o => !o.active);
        if (obs2) obs2.spawn(this.getType(score), W + 80);
      }
    }
    for (const o of this.pool) if (o.active) o.update(dt, speed);
  }

  draw(ctx: CanvasRenderingContext2D) { for (const o of this.pool) o.draw(ctx); }
  getActive() { return this.pool.filter(o => o.active); }
  reset() { for (const o of this.pool) o.active = false; this.spawnTimer = 0; this.nextSpawn = 1500; }
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife?: number; color: string; size: number; gravity: number; type: string; text?: string };

class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, type: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const speed = 60 + Math.random() * 120;
      const colors = type === "star" ? ["#ffcc44", "#ff6644", "#44ccff", "#ff44aa", "#00c8b4"] : ["#c8c4bc", "#b0aca4"];
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - (type === "star" ? 80 : 0), life: 1, color: colors[Math.floor(Math.random() * colors.length)], size: type === "star" ? 4 + Math.random() * 4 : 2 + Math.random() * 3, gravity: type === "star" ? 300 : 150, type });
    }
  }

  emitText(x: number, y: number, text: string) {
    this.particles.push({ x, y, vx: 0, vy: -60, life: 1.2, maxLife: 1.2, color: "#ffcc44", size: 14, type: "text", text, gravity: 0 });
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt / (p.maxLife || 0.8);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.type === "text") {
        ctx.fillStyle = p.color; ctx.font = `bold ${p.size}px 'Press Start 2P', monospace`;
        ctx.textAlign = "center"; ctx.fillText(p.text!, p.x, p.y);
      } else {
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
}

// ─── UI ───────────────────────────────────────────────────────────────────────
class UI {
  milestoneFlash = 0; milestoneText = "";
  draw(ctx: CanvasRenderingContext2D, score: number, hiScore: number, state: GameState, animTime: number) {
    const font = "'Press Start 2P', monospace";
    if (state !== GAME_STATE.START) {
      ctx.fillStyle = "#555"; ctx.font = `10px ${font}`; ctx.textAlign = "right";
      ctx.fillText(`PUNTOS: ${Math.floor(score)}`, W - 10, 22);
      ctx.fillText(`MEJOR: ${Math.floor(hiScore)}`, W - 10, 38);
    }
    if (state === GAME_STATE.START) this._drawStart(ctx, animTime);
    else if (state === GAME_STATE.DEAD) this._drawDead(ctx, score, hiScore);
    if (this.milestoneFlash > 0) {
      ctx.globalAlpha = Math.min(1, this.milestoneFlash);
      ctx.fillStyle = COLORS.accent; ctx.font = `bold 18px ${font}`; ctx.textAlign = "center";
      ctx.fillText(this.milestoneText, W / 2, H / 2 - 30);
      ctx.globalAlpha = 1;
      this.milestoneFlash -= 0.03;
    }
  }
  private _drawStart(ctx: CanvasRenderingContext2D, t: number) {
    const font = "'Press Start 2P', monospace";
    ctx.fillStyle = "rgba(240,237,230,0.85)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.accent; ctx.font = `bold 28px ${font}`; ctx.textAlign = "center";
    ctx.fillText("PERRO", W / 2, H / 2 - 40);
    ctx.fillStyle = COLORS.dogDark; ctx.fillText("CORREDOR", W / 2, H / 2 - 10);
    ctx.fillStyle = "#666"; ctx.font = `8px ${font}`;
    if (Math.floor(t * 2) % 2 === 0) ctx.fillText("ESPACIO / TAP PARA CORRER!", W / 2, H / 2 + 20);
    ctx.fillStyle = COLORS.accent; ctx.font = `6px ${font}`;
    ctx.fillText("© VETPERROS — 200pts = cupón de descuento", W / 2, H - 12);
  }
  private _drawDead(ctx: CanvasRenderingContext2D, score: number, hiScore: number) {
    const font = "'Press Start 2P', monospace";
    ctx.fillStyle = "rgba(20,10,10,0.6)"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.death; ctx.font = `bold 20px ${font}`; ctx.textAlign = "center";
    ctx.fillText("¡OH NO!", W / 2, H / 2 - 45);
    const msgs = ["¡El gato ganó esta vez!", "¡Necesitas más entrenamiento!", "¡A la sala de urgencias!", "¡El veterinario necesita veterinario!", "¡Bad dog... pero con amor!"];
    ctx.fillStyle = "#fff"; ctx.font = `6px ${font}`;
    ctx.fillText(msgs[Math.floor(score / 50) % msgs.length], W / 2, H / 2 - 20);
    ctx.fillStyle = "#ffcc44"; ctx.font = `9px ${font}`;
    ctx.fillText(`PUNTOS: ${Math.floor(score)}`, W / 2, H / 2 + 2);
    if (score >= hiScore && score > 0) {
      ctx.fillStyle = COLORS.accent; ctx.font = `8px ${font}`; ctx.fillText("¡NUEVO RÉCORD!", W / 2, H / 2 + 18);
    } else {
      ctx.fillStyle = "#aaa"; ctx.font = `7px ${font}`; ctx.fillText(`MEJOR: ${Math.floor(hiScore)}`, W / 2, H / 2 + 18);
    }
    ctx.fillStyle = "#ddd"; ctx.font = `6px ${font}`;
    ctx.fillText("ESPACIO / TAP PARA INTENTAR OTRA VEZ", W / 2, H / 2 + 40);
  }
  showMilestone(text: string) { this.milestoneText = text; this.milestoneFlash = 2; }
}

// ─── GAME CONTROLLER ──────────────────────────────────────────────────────────
class GameController {
  private ctx: CanvasRenderingContext2D;
  private audio = new AudioEngine();
  private bg = new Background();
  private dog = new Dog();
  private obstacles = new ObstacleManager();
  private particles = new ParticleSystem();
  private ui = new UI();

  private state: GameState = GAME_STATE.START;
  private score = 0;
  private hiScore: number;
  private speed = INIT_SPEED;
  private animTime = 0;
  private lastTime = 0;
  private milestonesHit = new Set<number>();
  private rafId = 0;
  private deathReported = false;
  private onDeath: (score: number) => void;

  constructor(canvas: HTMLCanvasElement, onDeath: (score: number) => void, serverHi: number) {
    this.ctx = canvas.getContext("2d")!;
    this.onDeath = onDeath;
    this.hiScore = serverHi;
    this._bindInput(canvas);
    this.rafId = requestAnimationFrame(ts => this._loop(ts));
  }

  private _bindInput(canvas: HTMLCanvasElement) {
    const act = () => this._handleAction();
    this._keyHandler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); act(); }
    };
    this._touchHandler = (e: TouchEvent) => { e.preventDefault(); act(); };
    this._mouseHandler = (e: MouseEvent) => { e.preventDefault(); act(); };
    document.addEventListener("keydown", this._keyHandler);
    canvas.addEventListener("touchstart", this._touchHandler, { passive: false });
    canvas.addEventListener("mousedown", this._mouseHandler);
  }

  private _keyHandler!: (e: KeyboardEvent) => void;
  private _touchHandler!: (e: TouchEvent) => void;
  private _mouseHandler!: (e: MouseEvent) => void;

  private _handleAction() {
    if (this.state === GAME_STATE.START) this._start();
    else if (this.state === GAME_STATE.PLAYING) this.dog.jump(this.audio);
    else if (this.state === GAME_STATE.DEAD) this._start();
  }

  private _start() {
    this.state = GAME_STATE.PLAYING;
    this.score = 0; this.speed = INIT_SPEED;
    this.milestonesHit.clear(); this.deathReported = false;
    this.dog.reset(); this.obstacles.reset();
    this.particles.particles = [];
  }

  restart() {
    this.deathReported = false;
    this._start();
  }

  private _die() {
    this.state = GAME_STATE.DEAD;
    this.dog.triggerDeath();
    this.audio.death();
    this.particles.emit(this.dog.x, this.dog.y - 24, "star", 16);
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
    }
    if (!this.deathReported) {
      this.deathReported = true;
      this.onDeath(this.score);
    }
  }

  private _update(dt: number) {
    this.animTime += dt;
    if (this.state !== GAME_STATE.PLAYING) {
      if (this.state === GAME_STATE.DEAD) this.dog.update(dt);
      return;
    }
    this.speed = Math.min(MAX_SPEED, this.speed + SPEED_INC * dt);
    this.score += SCORE_PER_SEC * dt;
    this.bg.update(dt, this.speed);
    this.dog.update(dt);
    this.obstacles.update(dt, this.speed, this.score);
    this.particles.update(dt);

    // Collisions
    const db = this.dog.getBounds();
    for (const obs of this.obstacles.getActive()) {
      if (rectsOverlap(db, obs.getBounds())) { this._die(); return; }
    }

    // Milestones
    for (const m of MILESTONE_SCORES) {
      if (this.score >= m && !this.milestonesHit.has(m)) {
        this.milestonesHit.add(m);
        this.audio.milestone();
        this.ui.showMilestone(`¡${m}!`);
        this.particles.emitText(W / 2, H / 2 - 20, `¡${m}!`);
        this.dog.showPartyHat();
      }
    }
  }

  private _draw() {
    this.ctx.clearRect(0, 0, W, H);
    this.bg.draw(this.ctx);
    this.particles.draw(this.ctx);
    this.obstacles.draw(this.ctx);
    this.dog.draw(this.ctx, this.speed);
    this.ui.draw(this.ctx, this.score, this.hiScore, this.state, this.animTime);
  }

  private _loop(ts: number) {
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;
    this._update(dt);
    this._draw();
    this.rafId = requestAnimationFrame(t => this._loop(t));
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    document.removeEventListener("keydown", this._keyHandler);
  }
}

// ─── REACT COMPONENT ──────────────────────────────────────────────────────────
type CouponResult =
  | { type: "coupon"; code: string; discount: number }
  | { type: "alreadyEarned"; existingCode: string }
  | { type: "none" }
  | null;

export function GameClient({ serverTopScore }: { serverTopScore: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameController | null>(null);
  const [couponResult, setCouponResult] = useState<CouponResult>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    async function handleDeath(score: number) {
      setFinalScore(Math.floor(score));
      if (score < 200) { setCouponResult({ type: "none" }); return; }
      setSubmitting(true);
      try {
        const result = await submitGameScore(score);
        if ("error" in result) { setCouponResult({ type: "none" }); return; }
        if (result.coupon) {
          setCouponResult({ type: "coupon", code: result.coupon.code, discount: result.coupon.discount });
        } else if (result.alreadyEarned && result.existingCode) {
          setCouponResult({ type: "alreadyEarned", existingCode: result.existingCode });
        } else {
          setCouponResult({ type: "none" });
        }
      } finally {
        setSubmitting(false);
      }
    }

    const game = new GameController(canvas, handleDeath, serverTopScore);
    gameRef.current = game;
    return () => { game.destroy(); };
  }, [serverTopScore]);

  function handleRestart() {
    setCouponResult(null);
    setFinalScore(0);
    gameRef.current?.restart();
  }

  const showModal = couponResult && !submitting && couponResult.type !== "none";

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="w-full h-auto rounded-lg"
        style={{ boxShadow: "0 0 40px rgba(0,200,180,0.3)", touchAction: "none" }}
      />

      {/* Loading overlay while submitting */}
      {submitting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="font-medium">Calculando cupón...</span>
          </div>
        </div>
      )}

      {/* Coupon modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-xs w-full mx-4 text-center space-y-4 shadow-2xl">
            {couponResult.type === "coupon" ? (
              <>
                <div className="text-4xl">🎁</div>
                <h3 className="text-lg font-bold">¡Ganaste un cupón!</h3>
                <p className="text-sm text-muted-foreground">Puntuación: {finalScore}</p>
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <p className="text-xl font-bold font-mono text-orange-600 tracking-wider">{couponResult.code}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1 font-semibold">{couponResult.discount}% de descuento</p>
                </div>
                <p className="text-xs text-muted-foreground">Válido 7 días. Úsalo al pagar en marketplace.</p>
              </>
            ) : couponResult.type === "alreadyEarned" ? (
              <>
                <div className="text-4xl">🏆</div>
                <h3 className="text-lg font-bold">Ya tienes un cupón de hoy</h3>
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                  <p className="text-xl font-bold font-mono text-orange-600 tracking-wider">{couponResult.existingCode}</p>
                </div>
                <p className="text-xs text-muted-foreground">Solo se puede ganar 1 cupón por día.</p>
              </>
            ) : null}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleRestart} variant="outline" className="flex-1" size="sm">
                <RotateCcw className="h-3 w-3 mr-1" /> Otra vez
              </Button>
              <Link href="/marketplace/checkout" className="flex-1">
                <Button className="w-full bg-orange-500 hover:bg-orange-600" size="sm">Usar cupón</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subtle restart hint when score < 200 and dead */}
      {couponResult?.type === "none" && !submitting && (
        <p className="text-center mt-3 text-xs text-muted-foreground">
          Llega a <span className="font-semibold text-orange-500">200 puntos</span> para ganar un cupón de descuento
        </p>
      )}
    </div>
  );
}
