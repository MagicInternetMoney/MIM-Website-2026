<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
};

const canvas = ref<HTMLCanvasElement | null>(null);
const palette = [
  "102, 248, 255",
  "154, 54, 255",
  "246, 168, 58",
  "146, 240, 82",
  "255, 107, 45",
];
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let frame = 0;
let width = 0;
let height = 0;
let pixelRatio = 1;
const mouse = { x: -9999, y: -9999 };

function countParticles() {
  return Math.min(140, Math.max(56, Math.floor((width * height) / 12000)));
}

function createParticle(): Particle {
  const color = palette[Math.floor(Math.random() * palette.length)];

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2.4 + 0.9,
    alpha: Math.random() * 0.42 + 0.24,
    color,
  };
}

function resize() {
  if (!canvas.value) return;

  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.value.width = Math.floor(width * pixelRatio);
  canvas.value.height = Math.floor(height * pixelRatio);
  canvas.value.style.width = `${width}px`;
  canvas.value.style.height = `${height}px`;

  ctx = canvas.value.getContext("2d");
  ctx?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const nextCount = countParticles();
  particles = Array.from({ length: nextCount }, (_, index) => particles[index] ?? createParticle());
}

function drawConnections() {
  if (!ctx) return;

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance > 118) continue;

      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(second.x, second.y);
      ctx.strokeStyle = `rgba(${first.color}, ${(1 - distance / 118) * 0.16})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawCursorHalo() {
  if (!ctx || mouse.x < 0 || mouse.y < 0) return;

  const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
  gradient.addColorStop(0, "rgba(102, 248, 255, 0.16)");
  gradient.addColorStop(0.38, "rgba(154, 54, 255, 0.08)");
  gradient.addColorStop(1, "rgba(154, 54, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
  ctx.fill();
}

function tick() {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  drawCursorHalo();
  drawConnections();

  for (const particle of particles) {
    const dx = particle.x - mouse.x;
    const dy = particle.y - mouse.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 150) {
      const force = (150 - distance) / 150;
      const angle = Math.atan2(dy, dx);
      particle.vx += Math.cos(angle) * force * 0.03;
      particle.vy += Math.sin(angle) * force * 0.03;
    }

    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${particle.color}, 0.42)`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  frame = window.requestAnimationFrame(tick);
}

function handlePointerMove(event: PointerEvent) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
}

function hidePointer() {
  mouse.x = -9999;
  mouse.y = -9999;
}

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", hidePointer);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frame = window.requestAnimationFrame(tick);
  }
});

onUnmounted(() => {
  window.cancelAnimationFrame(frame);
  window.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerleave", hidePointer);
});
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none fixed inset-0 z-0 opacity-80 mix-blend-screen" aria-hidden="true" />
</template>
