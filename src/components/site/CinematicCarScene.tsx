import { type RefObject, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CREST_X,
  DURATION,
  HORIZON_Y,
  LANE,
  VP,
  depthScale,
  distancePoint,
  distanceTangent,
  frameAt,
  roadY,
  staticFrame,
  type Frame,
} from "./sceneTimeline";

/* ---------- static geometry (world units, viewBox 1000x900) ---------- */

// A road sample with its perspective scale: 1 on the climb, shrinking to 0 on the horizon
type Pt = { x: number; y: number; s: number };

// Offsets are measured from the line the car rides on: +32 is the near edge, -42 the far edge
function sampleRoad(off: number, from = -500, to = CREST_X, step = 10) {
  const pts: Pt[] = [];
  for (let x = from; x < to; x += step) pts.push({ x, y: roadY(x) - LANE + off, s: 1 });
  return pts;
}
function sampleDistance(off: number, steps = 48) {
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const d = i / steps;
    const p = distancePoint(d);
    const dir = distanceTangent(d);
    const s = depthScale(d);
    // offset along the road's normal; at the crest that is straight down, like on the climb
    const k = (off * s) / (Math.hypot(dir.x, dir.y) || 1);
    pts.push({ x: p.x - dir.y * k, y: p.y + dir.x * k, s });
  }
  return pts;
}
const roadLine = (off: number) => [...sampleRoad(off), ...sampleDistance(off)];
const crestPoint = (off: number) => sampleDistance(off, 1)[0]!;

const xy = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
const polyline = (pts: Pt[]) => `M${pts.map(xy).join(" L")}`;
const dist = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
const lengthOf = (pts: Pt[]) => pts.reduce((sum, p, i) => (i ? sum + dist(pts[i - 1]!, p) : 0), 0);

/** Fillable outline of a line `width` wide that narrows with distance. */
function ribbon(pts: Pt[], width: number) {
  const left: string[] = [];
  const right: string[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    const k = ((width / 2) * p.s) / (Math.hypot(b.x - a.x, b.y - a.y) || 1);
    left.push(xy({ x: p.x - (b.y - a.y) * k, y: p.y + (b.x - a.x) * k }));
    right.push(xy({ x: p.x + (b.y - a.y) * k, y: p.y - (b.x - a.x) * k }));
  });
  return `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
}

/** Leading `frac` of a line by length, for draw-on reveals. */
function revealer(pts: Pt[]) {
  const at = [0];
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1]! + dist(pts[i - 1]!, pts[i]!));
  const total = at[at.length - 1]!;
  return (frac: number) => {
    const target = total * frac;
    const end = at.findIndex((l) => l >= target);
    if (end <= 0) return pts.slice(0, 2);
    const a = pts[end - 1]!;
    const b = pts[end]!;
    const k = (target - at[end - 1]!) / (at[end]! - at[end - 1]! || 1);
    const tip = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, s: a.s + (b.s - a.s) * k };
    return [...pts.slice(0, end), tip];
  };
}

/** Lane dashes on the distant road: the climb's 26-on/22-off rhythm, shrinking with distance. */
function perspectiveDashes(pts: Pt[], startAt: number, width: number) {
  const dashes: Pt[][] = [];
  let run: Pt[] = [];
  let walked = startAt;
  pts.forEach((p, i) => {
    const q = pts[i - 1];
    if (q) walked += dist(q, p) / Math.max(0.04, (p.s + q.s) / 2);
    if (walked % 48 < 26 && p.s > 0.05) run.push(p);
    else {
      if (run.length > 1) dashes.push(run);
      run = [];
    }
  });
  if (run.length > 1) dashes.push(run);
  return dashes.map((dash) => ribbon(dash, width)).join(" ");
}

const NEAR_LINE = roadLine(32);
const FAR_LINE = roadLine(-42);
const ROAD_SURFACE = `${polyline(NEAR_LINE)} L${[...FAR_LINE].reverse().map(xy).join(" L")} Z`;
const NEAR_EDGE = ribbon(NEAR_LINE, 3);
const NEAR_EDGE_GLOW = ribbon(NEAR_LINE, 14);
const FAR_EDGE = ribbon(FAR_LINE, 1.5);
const LANE_CLIMB = [...sampleRoad(-4), crestPoint(-4)];
const LANE_PATH = polyline(LANE_CLIMB);
const LANE_DISTANCE = perspectiveDashes(sampleDistance(-4, 240), lengthOf(LANE_CLIMB), 3);

// Ground behind the road, and the hillside in front of it all the way to the horizon. Both share
// one terrain gradient, so they meet without a seam.
const GROUND = `M-1000,${HORIZON_Y} L2000,${HORIZON_Y} L2000,1800 L-1000,1800 Z`;
const HILL_FACE = `M-500,1700 L${NEAR_LINE.map(xy).join(" L")} L2000,${HORIZON_Y} L2000,1800 L-500,1800 Z`;
// The ranges' base runs below the horizon, so parallax never lifts them off the ground
const MOUNTAINS = `M-700,${HORIZON_Y + 90} L-700,340 L-400,330 L-150,300 L60,350 L250,280 L430,345 L640,300 L860,350 L1060,290 L1300,340 L1700,320 L1700,${HORIZON_Y + 90} Z`;
// Rolls in from the left and sinks behind the road before the crest
const NEAR_HILLS =
  "M-700,1700 L-700,520 C-450,450 -250,440 -60,462 C120,483 300,470 420,520 C500,553 560,620 620,760 L620,1700 Z";

// Convergence point on the road ahead of the car
const KX = 520;
const K = { x: KX, y: roadY(KX) - LANE - 6 };
const UPWORK_PATH = `M-60,760 C120,720 260,640 ${K.x},${K.y}`;
const LINKEDIN_PATH = `M1080,250 C900,330 700,520 ${K.x},${K.y}`;
// The LinkedIn stream flies in right to left; its label runs the other way so it reads upright
const LINKEDIN_LABEL_PATH = `M${K.x},${K.y} C700,520 900,330 1080,250`;
const MERGED_LINE: Pt[] = [{ ...K, s: 1 }, ...sampleRoad(-6, KX + 10), ...sampleDistance(-6)];
const MERGED_CLIMB = polyline([{ ...K, s: 1 }, ...sampleRoad(-6, KX + 10), crestPoint(-6)]);
const revealMerged = revealer(MERGED_LINE);

/* ---------- car ---------- */

// Multi-spoke rim: ten slim spokes over a dark wheel face
function Wheel({ cx, rot, uid }: { cx: number; rot: number; uid: string }) {
  return (
    <g transform={`rotate(${rot % 360} ${cx} -34)`}>
      <circle cx={cx} cy={-34} r={34} fill="var(--obsidian)" />
      <circle cx={cx} cy={-34} r={32} fill="none" stroke="var(--graphite)" strokeWidth={3} />
      <circle cx={cx} cy={-34} r={23} fill="var(--graphite-2)" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={cx - 1.8} y={-56} width={3.6} height={18} rx={1.8} fill={`url(#${uid}-rim)`} transform={`rotate(${i * 36} ${cx} -34)`} />
      ))}
      <circle cx={cx} cy={-34} r={23} fill="none" stroke="var(--ash)" strokeOpacity={0.55} strokeWidth={1.5} />
      <circle cx={cx} cy={-34} r={4.5} fill="var(--lime)" opacity={0.85} />
    </g>
  );
}

function Car({ f, uid }: { f: Frame; uid: string }) {
  const { car } = f;
  const blur = Math.min(10, f.speed / 90);
  const trailLen = Math.max(f.speed * 0.32, f.trail * 140);
  return (
    <g transform={`translate(${car.x} ${car.y + car.bob}) rotate(${car.angle}) scale(${0.78 * car.scale}) translate(-200 0)`}>
      {/* contact shadow */}
      <ellipse cx={206} cy={2} rx={212} ry={13} fill="var(--obsidian)" opacity={0.75} />
      {/* light trails stretching backward */}
      {trailLen > 4 && (
        <g opacity={Math.min(1, 0.35 + f.trail)}>
          {[-26, -38, -48].map((y, i) => (
            <rect key={y} x={10 - trailLen * (1 - i * 0.18)} y={y} width={trailLen * (1 - i * 0.18)} height={i === 0 ? 4 : 2} fill={`url(#${uid}-trail)`} />
          ))}
        </g>
      )}
      {/* headlight cone */}
      <path d="M398,-60 L760,-136 L760,34 Z" fill={`url(#${uid}-beamCone)`} opacity={0.35 + 0.65 * f.roadLit} />
      <g filter={blur > 0.6 ? `url(#${uid}-mblur)` : undefined}>
        {/* body: long hood, cabin set back, short tail with an integrated lip */}
        <path
          d="M18,-16 C12,-18 9,-26 9,-34 C9,-42 10,-48 14,-53 L26,-58 C50,-62 74,-66 98,-70 C120,-80 146,-104 172,-116 C190,-123 214,-125 236,-122 C252,-118 266,-104 282,-86 C310,-79 350,-74 380,-68 C394,-65 402,-58 404,-50 C406,-40 404,-28 398,-21 L392,-18 L358,-18 A39,39 0 1 0 286,-18 L132,-18 A39,39 0 1 0 60,-18 L24,-17 Z"
          fill={`url(#${uid}-body)`}
        />
        {/* side glass with a straight beltline, split by a slim B-pillar */}
        <path d="M278,-87 C266,-99 254,-110 238,-116 C220,-120 198,-120 178,-114 C162,-108 150,-98 140,-88 Z" fill={`url(#${uid}-glass)`} />
        <path d="M197,-118 L201,-88" stroke="var(--obsidian)" strokeWidth={4} />
        {/* door cut, flush handle and mirror */}
        <path d="M282,-85 C284,-62 284,-40 280,-19 M201,-88 C200,-64 199,-40 197,-19" fill="none" stroke="var(--obsidian)" strokeWidth={1.5} opacity={0.6} />
        <path d="M214,-76 L228,-76" stroke="var(--ash)" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
        <path d="M282,-87 C276,-94 266,-95 260,-91 C260,-87 264,-84 270,-83 Z" fill="var(--graphite)" />
        {/* glint along the roofline, and wheel-arch lips */}
        <path d="M282,-86 C266,-104 252,-118 236,-122 C214,-125 190,-123 172,-116 C146,-104 120,-80 98,-70" fill="none" stroke="var(--snow)" strokeOpacity={0.22} strokeWidth={2} />
        <path d="M60,-18 A39,39 0 1 1 132,-18 M286,-18 A39,39 0 1 1 358,-18" fill="none" stroke="var(--ash)" strokeOpacity={0.3} strokeWidth={2} />
        {/* crisp shoulder line from the headlight back to the tail */}
        <path d="M394,-60 C330,-68 250,-72 160,-73 C110,-73 70,-68 30,-60" fill="none" stroke="var(--snow)" strokeOpacity={0.3} strokeWidth={2.5} />
        <path d="M62,-42 C150,-48 270,-48 396,-40" fill="none" stroke="var(--snow)" strokeOpacity={0.1} strokeWidth={1.5} />
        {/* lower sill shadow */}
        <path d="M133,-18 L285,-18 L282,-25 L136,-25 Z" fill="var(--obsidian)" opacity={0.6} />
        {/* slim LED tail light */}
        <path d="M10,-47 L32,-55 L32,-52 L11,-44 Z" fill="var(--destructive)" opacity={0.95} />
        <rect x={4} y={-59} width={32} height={13} rx={5} fill="var(--destructive)" opacity={0.25 + 0.3 * f.struggle} />
        {/* slim LED headlight */}
        <path d="M368,-70 L398,-61 L397,-57 L366,-66 Z" fill="var(--lime)" />
        {/* lime accent line activated by brand */}
        <path d="M136,-29 L282,-29" stroke="var(--lime)" strokeWidth={2.5} opacity={0.15 + 0.85 * f.roadLit} />
      </g>
      <Wheel cx={96} rot={car.wheel} uid={uid} />
      <Wheel cx={322} rot={car.wheel} uid={uid} />
    </g>
  );
}

/* ---------- scene ---------- */

function Scene({ f, mobile, uid, safeLeft }: { f: Frame; mobile: boolean; uid: string; safeLeft: number }) {
  const { fx, fy, z } = f.cam;
  const X2 = 490;
  // While the car would sit under the hero text (desktop), slide the world right to keep it clear,
  // easing off as the logo rises so the logo's right edge (X2 + 255) always stays in frame
  const carScreenX = 500 + (f.car.x - fx) * z;
  const logoRoom = Math.max(0, 485 - (X2 + 255 - fx) * z);
  const cap = 260 + (logoRoom - 260) * f.logoGuard;
  const shift = Math.max(0, Math.min(cap, safeLeft + 150 * z * f.car.scale + 24 - carScreenX));
  const camT = `translate(${500 + shift} 450) scale(${z}) translate(${-fx} ${-fy})`;
  const par = (k: number) => `translate(${(500 - fx) * k} ${(470 - fy) * k * 0.5})`;
  const logoY = 260 + (1 - f.logo) * 150;
  const glow = 0.25 + 0.75 * f.roadLit + f.ambient * 0;
  const merged = f.merged > 0 ? revealMerged(f.merged) : null;

  return (
    <svg
      viewBox="0 0 1000 900"
      preserveAspectRatio={mobile ? "xMidYMid slice" : "xMaxYMax slice"}
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label="A dark sports car struggles up a steep road until the up2linkd logo lights the scene; Upwork and LinkedIn streams merge into one path and the car accelerates toward the horizon."
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--obsidian)" }} />
          <stop offset="0.75" style={{ stopColor: "var(--graphite-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--graphite)" }} />
        </linearGradient>
        <radialGradient id={`${uid}-horizonGlow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" style={{ stopColor: "var(--lime)", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "var(--lime)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id={`${uid}-terrain`} gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON_Y} x2="0" y2="1000">
          <stop offset="0" style={{ stopColor: "var(--graphite)" }} />
          <stop offset="0.4" style={{ stopColor: "var(--graphite-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--obsidian)" }} />
        </linearGradient>
        <linearGradient id={`${uid}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--graphite)", stopOpacity: 0 }} />
          <stop offset="0.5" style={{ stopColor: "var(--graphite)", stopOpacity: 0.7 }} />
          <stop offset="1" style={{ stopColor: "var(--graphite)", stopOpacity: 0 }} />
        </linearGradient>
        {/* lightest at the crest, darkening down the climb and into the distance */}
        <linearGradient id={`${uid}-asphalt`} gradientUnits="userSpaceOnUse" x1="-100" y1="900" x2={VP.x} y2={HORIZON_Y}>
          <stop offset="0" style={{ stopColor: "var(--graphite-2)" }} />
          <stop offset="0.72" style={{ stopColor: "var(--graphite)" }} />
          <stop offset="1" style={{ stopColor: "var(--graphite-2)" }} />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--ash)" }} />
          <stop offset="0.28" style={{ stopColor: "var(--graphite)" }} />
          <stop offset="0.7" style={{ stopColor: "var(--graphite-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--obsidian)" }} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--ash)", stopOpacity: 0.55 }} />
          <stop offset="0.5" style={{ stopColor: "var(--obsidian)" }} />
          <stop offset="1" style={{ stopColor: "var(--graphite)" }} />
        </linearGradient>
        <radialGradient id={`${uid}-rim`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" style={{ stopColor: "var(--ash)" }} />
          <stop offset="1" style={{ stopColor: "var(--graphite-2)" }} />
        </radialGradient>
        <linearGradient id={`${uid}-trail`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--lime)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--lime)", stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id={`${uid}-beamCone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--lime)", stopOpacity: 0.35 }} />
          <stop offset="1" style={{ stopColor: "var(--lime)", stopOpacity: 0 }} />
        </linearGradient>
        <filter id={`${uid}-mblur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={`${Math.min(10, f.speed / 90)} 0`} />
        </filter>
        <filter id={`${uid}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <clipPath id={`${uid}-aboveHorizon`}>
          <rect x="-400" y="-400" width="1800" height={HORIZON_Y + 400} />
        </clipPath>
      </defs>

      <rect width="1000" height="900" fill={`url(#${uid}-sky)`} />

      <g transform={camT}>
        {/* far mountains (parallax) */}
        <g transform={par(0.5)}>
          <path d={MOUNTAINS} fill="var(--graphite-2)" opacity={0.9} />
        </g>

        {/* ground plane out to the horizon */}
        <path d={GROUND} fill={`url(#${uid}-terrain)`} />
        {/* haze softens the line where the ground meets the mountains */}
        <rect x={-1000} y={HORIZON_Y - 60} width={3000} height={120} fill={`url(#${uid}-haze)`} />

        {/* horizon glow intensifies with brand */}
        <ellipse cx={VP.x} cy={HORIZON_Y} rx={520} ry={120} fill={`url(#${uid}-horizonGlow)`} opacity={0.12 + 0.7 * f.roadLit + 0.1 * Math.sin(f.t * 1.2) * f.ambient} />

        {/* near hills (parallax) */}
        <g transform={par(0.2)}>
          <path d={NEAR_HILLS} fill="var(--graphite-2)" opacity={0.7} />
        </g>

        {/* logo rises from the horizon */}
        <g clipPath={`url(#${uid}-aboveHorizon)`} opacity={f.logo}>
          <g transform={`translate(0 ${logoY})`} fontFamily="Space Grotesk, sans-serif" fontWeight={700} fontSize={96} letterSpacing={-5}>
            <text x={X2 - 30} y={0} textAnchor="end" fill="var(--snow)">up</text>
            <text x={X2} y={0} textAnchor="middle" fill="var(--lime)" transform="skewX(-12)">2</text>
            <text x={X2 + 30} y={0} textAnchor="start" fill="var(--snow)">linkd</text>
          </g>
        </g>

        {/* pulse from the "2" */}
        {f.pulse > 0 && f.pulse < 1 && (
          <g opacity={1 - f.pulse}>
            <circle cx={X2} cy={226} r={30 + f.pulse * 420} fill="none" stroke="var(--lime)" strokeWidth={3} />
            <circle cx={X2} cy={226} r={10 + f.pulse * 260} fill="none" stroke="var(--lime)" strokeWidth={1.5} opacity={0.6} />
          </g>
        )}
        {/* energy beam from logo to road */}
        <path d={`M${X2},250 C${X2 + 10},380 ${K.x - 20},${K.y - 140} ${K.x},${K.y}`} fill="none" stroke="var(--lime)" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - f.beam} opacity={f.beam * (1 - f.merged)} />

        {/* road + hill; the road narrows to the horizon */}
        <path d={HILL_FACE} fill={`url(#${uid}-terrain)`} />
        <path d={ROAD_SURFACE} fill={`url(#${uid}-asphalt)`} />
        <path d={NEAR_EDGE} fill="var(--lime)" opacity={0.15 + 0.85 * glow} />
        <path d={FAR_EDGE} fill="var(--lime)" opacity={0.08 + 0.5 * f.roadLit} />
        <path d={LANE_PATH} fill="none" stroke="var(--snow)" strokeWidth={3} strokeDasharray="26 22" opacity={0.35 + 0.2 * f.roadLit} />
        <path d={LANE_DISTANCE} fill="var(--snow)" opacity={0.35 + 0.2 * f.roadLit} />
        {/* road lit by the brand */}
        <path d={NEAR_EDGE_GLOW} fill="var(--lime)" filter={`url(#${uid}-soft)`} opacity={0.6 * f.roadLit} />

        {/* channel streams */}
        <Stream d={UPWORK_PATH} progress={f.upwork} label="UPWORK" labelAt="50%" id="s-up" uid={uid} />
        <Stream d={LINKEDIN_PATH} labelPath={LINKEDIN_LABEL_PATH} progress={f.linkedin} label="LINKEDIN" labelAt="38%" id="s-li" uid={uid} />
        {merged && (
          <>
            <path d={ribbon(merged, 18)} fill="var(--lime)" filter={`url(#${uid}-soft)`} opacity={0.55} />
            <path d={ribbon(merged, 4)} fill="var(--lime)" />
            <path d={MERGED_CLIMB} fill="none" stroke="var(--obsidian)" strokeWidth={2} strokeDasharray="6 30" strokeDashoffset={-f.t * 120} opacity={f.merged * 0.7} />
          </>
        )}
        {f.merged > 0.2 && (
          <circle cx={K.x} cy={K.y} r={9 + 3 * Math.sin(f.t * 4)} fill="var(--lime)" opacity={f.merged} />
        )}

        <Car f={f} uid={uid} />
      </g>

      {/* vignette */}
      <rect width="1000" height="900" fill={`url(#${uid}-sky)`} opacity={0} />
    </svg>
  );
}

type StreamProps = { d: string; labelPath?: string; progress: number; label: string; labelAt: string; id: string; uid: string };

function Stream({ d, labelPath, progress, label, labelAt, id, uid }: StreamProps) {
  if (progress <= 0) return null;
  const pathId = `${uid}-${id}`;
  return (
    <g>
      <path id={pathId} d={labelPath ?? d} fill="none" />
      <path d={d} fill="none" stroke="var(--lime)" strokeWidth={16} filter={`url(#${uid}-soft)`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} opacity={0.5} />
      <path d={d} fill="none" stroke="var(--lime)" strokeWidth={3.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - progress} />
      <text fontFamily="Space Grotesk, sans-serif" fontSize={20} fontWeight={600} letterSpacing={5} fill="var(--lime)" opacity={Math.min(1, progress * 1.6)} dy={-14}>
        <textPath href={`#${pathId}`} startOffset={labelAt}>{label}</textPath>
      </text>
    </g>
  );
}

/* ---------- controller ---------- */

export function CinematicCarScene({ mobile = false, avoid }: { mobile?: boolean; avoid?: RefObject<HTMLElement | null> }) {
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [run, setRun] = useState(0);
  const raf = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // SVG ids are document-wide; prefix them so the desktop and mobile scenes don't collide
  const uid = useId();
  // How far into the scene (viewBox units) the `avoid` element reaches, so the car can stay clear
  const [safeLeft, setSafeLeft] = useState(0);

  useEffect(() => {
    const node = root.current;
    const text = avoid?.current;
    if (!node || !text) return;
    const measure = () => {
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height) return setSafeLeft(0);
      // The desktop scene is anchored right ("xMaxYMax slice"), so any crop comes off the left
      const k = Math.max(box.width / 1000, box.height / 900);
      const cropLeft = 1000 * k - box.width;
      setSafeLeft(Math.max(0, (text.getBoundingClientRect().right - box.left + cropLeft) / k));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    ro.observe(text);
    return () => ro.disconnect();
  }, [avoid]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const node = root.current;
    if (reduced || !node) return;
    // The film clock only runs while the scene is on screen (so the copy hidden by CSS never
    // animates), and the loop ends with the film instead of idling forever.
    let played = 0;
    let resumedAt: number | null = null;
    let finished = false;
    const loop = (now: number) => {
      if (resumedAt === null) resumedAt = now;
      const tt = played + (now - resumedAt) / 1000;
      setT(tt);
      if (tt > DURATION + 0.5) {
        finished = true;
        raf.current = null;
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    const pause = () => {
      if (raf.current === null) return;
      cancelAnimationFrame(raf.current);
      raf.current = null;
      if (resumedAt !== null) played += (performance.now() - resumedAt) / 1000;
      resumedAt = null;
    };
    const io = new IntersectionObserver((entries) => {
      const onScreen = entries[entries.length - 1]?.isIntersecting ?? false;
      if (!onScreen) pause();
      else if (!finished && raf.current === null) raf.current = requestAnimationFrame(loop);
    });
    io.observe(node);
    return () => {
      io.disconnect();
      pause();
    };
  }, [reduced, run]);

  const frame = useMemo(() => (reduced ? staticFrame() : frameAt(t)), [t, reduced]);

  return (
    <div ref={root} className="absolute inset-0">
      <Scene f={frame} mobile={mobile} uid={uid} safeLeft={safeLeft} />
      {!reduced && t > DURATION + 0.5 && (
        <button
          type="button"
          onClick={() => {
            setT(0);
            setRun((r) => r + 1);
          }}
          className="eyebrow absolute bottom-4 right-4 z-10 rounded-sm border border-ink-line bg-obsidian/60 px-3 py-2 text-ash transition-colors hover:text-lime"
        >
          Replay film
        </button>
      )}
    </div>
  );
}
