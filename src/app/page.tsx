'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// Base path for GitHub Pages deployment
const basePath = process.env.NODE_ENV === 'production' ? '/zedo-world' : '';

// Portfolio Data
const portfolioData = {
  biodata: {
    name: "Zaki Elyasa Djauhari",
    role: "Full Stack Developer",
    bio: "Passionate developer creating amazing digital experiences. Highly curious and fast-learning software engineer. Calm under pressure and committed to continuous improvement. Enjoys sharing knowledge, collaborating with teams, and adapting quickly to new technologies.",
    skills: ["HTML", "CSS", "Javascript", "Typescript", "React", "Next.js", "Node.js", "Nest.js", "Java", "SpringBoot", "PostgreSQL", "RabbitMQ", "Git"]
  },
  experience: [
    { title: "Freelance Full Stack Developer", company: "PT. Etos Indonusa", period: "2025 - present" },
    { title: "Full Stack Developer", company: "PT. Tiga Daya Digital", period: "2022 - 2025" },
    { title: "Frontend Developer", company: "PT. Eigen Tri Mathema", period: "2020 - 2022" },
    { title: "Frontend Developer", company: "PT. HolaHalo Mekar Konsep", period: "2020 - 2020" }
  ],
  projects: [
    { name: "SPEED Dashboard for PT. Autopedia Sukses Lestari", description: "Dashboard for PT. Autopedia Sukses Lestari", tech: ["Next.js", "Bootstrap", "Typescript"] },
    { name: "GAINS Application for PT. Autopedia Sukses Gadai", description: "Application for PT. Autopedia Sukses Gadai", tech: ["Java", "Spring Boot", "HTML", "CSS", "Javascript", "Jquery", "RabbitMQ", "PostgreSQL"] },
    { name: "PT. Siap Textile", description: "Landing Page for PT. Siap Textile", tech: ["HTML", "CSS", "JavaScript", "React"] }
  ],
  contact: {
    email: "zakielyasadj@gmail.com",
    github: "github.com/zedomaru",
    linkedin: "www.linkedin.com/in/zaki-elyasa-djauhari-20095a134/"
  }
};

// Sprite config - 4x4 grid (128x128, 32x32 per frame)
// Spritesheet layout: Row 0=down, Row 1=left, Row 2=right, Row 3=up(back)
const SPRITE = { w: 32, h: 32, cols: 4, rows: 4, scale: 2 };
const WORLD_W = 960, WORLD_H = 640;

// Direction to sprite row mapping - CORRECT layout
const dirRow: Record<string, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3
};

// Buildings - 2x2 grid layout
// Row 1: BIO | EXP
// Row 2: PRO | CON
const buildings = [
  { id: 'biodata', x: 200, y: 50, w: 150, h: 140, label: 'PROFILE', img: `${basePath}/building2.png` },
  { id: 'experience', x: 610, y: 50, w: 150, h: 140, label: 'EXPERIENCE', img: `${basePath}/building3.png` },
  { id: 'projects', x: 200, y: 410, w: 150, h: 150, label: 'PROJECTS', img: `${basePath}/building4.png` },
  { id: 'contact', x: 610, y: 410, w: 150, h: 140, label: 'CONTACT', img: `${basePath}/building1.png` }
];



type Dir = 'up' | 'down' | 'left' | 'right';

export default function Home() {
  const [pos, setPos] = useState({ x: 432, y: 280 });
  const [dir, setDir] = useState<Dir>('down');
  const [walking, setWalking] = useState(false);
  const [frame, setFrame] = useState(0);
  const [modal, setModal] = useState<string | null>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const CW = SPRITE.w * SPRITE.scale;
  const CH = SPRITE.h * SPRITE.scale;
  const SPEED = 3;

  // Animation
  useEffect(() => {
    if (!walking) { setFrame(0); return; }
    const id = setInterval(() => setFrame(f => (f + 1) % 4), 100);
    return () => clearInterval(id);
  }, [walking]);

  // Collision
  const boxes = useMemo(() => {
    const b: { x: number; y: number; w: number; h: number }[] = [];
    buildings.forEach(bld => {
      // Building body (top part)
      b.push({ x: bld.x, y: bld.y, w: bld.w, h: bld.h - 45 });
      // Left of door
      b.push({ x: bld.x, y: bld.y + bld.h - 45, w: bld.w / 2 - 30, h: 45 });
      // Right of door
      b.push({ x: bld.x + bld.w / 2 + 30, y: bld.y + bld.h - 45, w: bld.w / 2 - 30, h: 45 });
    });
    // Walls
    b.push({ x: -20, y: 0, w: 20, h: WORLD_H });
    b.push({ x: WORLD_W, y: 0, w: 20, h: WORLD_H });
    b.push({ x: 0, y: -20, w: WORLD_W, h: 20 });
    b.push({ x: 0, y: WORLD_H, w: WORLD_W, h: 20 });
    return b;
  }, []);

  const collides = useCallback((nx: number, ny: number) => {
    const cx = nx + 12, cy = ny + CH - 12, cw = CW - 24, ch = 12;
    return boxes.some(b => cx < b.x + b.w && cx + cw > b.x && cy < b.y + b.h && cy + ch > b.y);
  }, [boxes, CW, CH]);

  const nearDoor = useCallback((x: number, y: number) => {
    for (const b of buildings) {
      const dx = b.x + b.w / 2, dy = b.y + b.h;
      if (Math.abs(x + CW / 2 - dx) < 50 && Math.abs(y + CH - dy) < 40) return b.id;
    }
    return null;
  }, [CW, CH]);

  // Input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'enter', ' '].includes(k)) {
        e.preventDefault();
        setKeys(p => new Set(p).add(k));
      }
      if ((k === 'enter' || k === ' ') && !modal) {
        const n = nearDoor(pos.x, pos.y);
        if (n) setModal(n);
      }
      if (k === 'escape') setModal(null);
    };
    const up = (e: KeyboardEvent) => setKeys(p => { const n = new Set(p); n.delete(e.key.toLowerCase()); return n; });
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [modal, pos, nearDoor]);

  // Game loop
  useEffect(() => {
    if (modal) return;
    const loop = setInterval(() => {
      setPos(p => {
        let nx = p.x, ny = p.y, moved = false, nd: Dir = dir;

        if ((keys.has('a') || keys.has('arrowleft')) && !collides(p.x - SPEED, p.y)) { nx -= SPEED; nd = 'left'; moved = true; }
        if ((keys.has('d') || keys.has('arrowright')) && !collides(p.x + SPEED, p.y)) { nx += SPEED; nd = 'right'; moved = true; }
        if ((keys.has('w') || keys.has('arrowup')) && !collides(nx, p.y - SPEED)) { ny -= SPEED; nd = 'up'; moved = true; }
        if ((keys.has('s') || keys.has('arrowdown')) && !collides(nx, p.y + SPEED)) { ny += SPEED; nd = 'down'; moved = true; }

        nx = Math.max(0, Math.min(WORLD_W - CW, nx));
        ny = Math.max(0, Math.min(WORLD_H - CH, ny));
        setWalking(moved);
        if (moved) setDir(nd);
        return { x: nx, y: ny };
      });
    }, 16);
    return () => clearInterval(loop);
  }, [keys, modal, collides, dir, CW, CH]);

  const near = nearDoor(pos.x, pos.y);

  // Sprite calculation
  const spriteRow = dirRow[dir];
  const offsetX = frame * SPRITE.w * SPRITE.scale;
  const offsetY = spriteRow * SPRITE.h * SPRITE.scale;

  return (
    <div className="game-container">
      <h1 className="game-title">★ ZEDO'S WORLD ★</h1>

      <div className="game-world">
        {/* Grass background */}
        <div className="grass-layer" />

        {/* Paths - horizontal and vertical */}
        <div className="paths">
          {/* Top horizontal path - below BIO/EXP */}
          <div className="path-segment" style={{ left: 0, top: 200, width: 960, height: 50 }} />
          {/* Bottom horizontal path - above PRO/CON */}
          <div className="path-segment" style={{ left: 0, top: 355, width: 960, height: 50 }} />
          {/* Left vertical path - BIO to PRO */}
          <div className="path-segment" style={{ left: 150, top: 0, width: 50, height: 640 }} />
          {/* Right vertical path - EXP to CON */}
          <div className="path-segment" style={{ left: 760, top: 0, width: 50, height: 640 }} />
        </div>



        {/* Buildings with images */}
        {buildings.map(b => (
          <div
            key={b.id}
            className={`building-img ${near === b.id ? 'near' : ''}`}
            style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
            onClick={() => setModal(b.id)}
          >
            <img src={b.img} alt={b.label} />
            <span className="bld-label">{b.label}</span>
          </div>
        ))}

        {/* Character */}
        <div className="character" style={{ left: pos.x, top: pos.y, width: CW, height: CH }}>
          <div
            className="char-sprite"
            style={{
              width: SPRITE.w * SPRITE.cols * SPRITE.scale,
              height: SPRITE.h * SPRITE.rows * SPRITE.scale,
              backgroundImage: `url(${basePath}/character.png)`,
              backgroundSize: '100% 100%',
              transform: `translate(${-offsetX}px, ${-offsetY}px)`,
            }}
          />
        </div>
      </div>

      <div className={`instructions ${near ? 'highlight' : ''}`}>
        {near ? '▶ PRESS ENTER' : '▲▼◄► MOVE'}
      </div>

      {modal && <Modal type={modal} onClose={() => setModal(null)} />}

      {/* Asset Credits */}
      <div className="asset-credits">
        Assets by <a href="https://scarloxy.itch.io/mpwsp01" target="_blank" rel="noopener noreferrer">scarloxy</a>
      </div>
    </div>
  );
}

function Modal({ type, onClose }: { type: string; onClose: () => void }) {
  const cfg: Record<string, { title: string; color: string }> = {
    biodata: { title: '📋 BIODATA', color: '#f85858' },
    experience: { title: '🏆 EXPERIENCE', color: '#6898f8' },
    projects: { title: '🔬 PROJECTS', color: '#58c858' },
    contact: { title: '📧 CONTACT', color: '#4a9a4a' }
  };
  const c = cfg[type];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head" style={{ background: c.color }}>
          <span>{c.title}</span>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {type === 'biodata' && <Biodata />}
          {type === 'experience' && <Experience />}
          {type === 'projects' && <Projects />}
          {type === 'contact' && <Contact />}
        </div>
      </div>
    </div>
  );
}

function Biodata() {
  const d = portfolioData.biodata;
  return (
    <>
      <div className="profile">
        <div className="avatar">👨‍💻</div>
        <div><h3>{d.name}</h3><p className="role">{d.role}</p><p>{d.bio}</p></div>
      </div>
      <h4>SKILLS</h4>
      <div className="tags">{d.skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
    </>
  );
}

function Experience() {
  return (
    <>
      {portfolioData.experience.map((e, i) => (
        <div key={i} className="card">
          <h4>{e.title}</h4>
          <p className="meta">{e.company} • {e.period}</p>
        </div>
      ))}
      <a href={`${basePath}/CV_Zaki_Elyasa_Djauhari_-_Software_Engineer.pdf`} download className="download-cv-btn">
        📄 Download CV
      </a>
    </>
  );
}

function Projects() {
  return <>{portfolioData.projects.map((p, i) => (
    <div key={i} className="proj"><h4>{p.name}</h4><p>{p.description}</p>
      <div className="tags">{p.tech.map(t => <span key={t} className="tag sm">{t}</span>)}</div>
    </div>
  ))}</>;
}

function Contact() {
  const c = portfolioData.contact;
  return (
    <div className="contacts">
      <a href={`mailto:${c.email}`}>📧 {c.email}</a>
      <a href={`https://${c.github}`} target="_blank">🐙 {c.github}</a>
      <a href={`https://${c.linkedin}`} target="_blank">💼 {c.linkedin}</a>
    </div>
  );
}
