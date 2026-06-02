import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const fctnPositions = ["OFF", "Z", "REM", "RXMT", "SQ OFF", "SQ ON", "LD", "TST", "STBY"];
const rfPositions = ["LO", "M", "HI", "PA"];
const modePositions = ["---", "FH", "SC"];
const cmscPositions = ["---", "CT", "PT"];
const chanPositions = ["---", "MAN", "1", "2", "3", "4", "5", "6", "CUE"];

const keypad = [
  { label: "CMSC", digit: "1" },
  { label: "RCU", digit: "2" },
  { label: "SYNC", digit: "3" },
  { label: "FREQ", digit: "" },
  { label: "DATA", digit: "4" },
  { label: "GPS", digit: "5" },
  { label: "SA", digit: "6" },
  { label: "ERF\nOFST", digit: "" },
  { label: "CHG", digit: "7" },
  { label: "CID", digit: "8" },
  { label: "LOUT", digit: "9" },
  { label: "TIME", digit: "" },
  { label: "MENU\nCLR", digit: "" },
  { label: "LOAD", digit: "0" },
  { label: "STO", digit: "" },
  { label: "BATT\nCALL", digit: "" },
];

function isDigit(value) {
  return typeof value === "string" && value.length === 1 && value >= "0" && value <= "9";
}

function nextFrom(list, current) {
  const idx = Math.max(0, list.indexOf(current));
  return list[(idx + 1) % list.length];
}

function CoaxConnector({ active = false, installed = false }) {
  return (
    <div className={`relative w-32 h-32 rounded-full bg-zinc-300 border-[14px] border-zinc-600 shadow-2xl flex items-center justify-center ${active ? "ring-4 ring-yellow-300" : ""}`}>
      {installed && (
        <>
          <div className="absolute bottom-[105px] left-1/2 -translate-x-1/2 w-3 h-36 bg-black rounded-full shadow-xl z-20" />
          <div className="absolute inset-[18px] rounded-full bg-black border-[8px] border-zinc-800 shadow-2xl z-10" />
          <div className="absolute inset-[42px] rounded-full bg-zinc-900 z-20" />
        </>
      )}
      {!installed && (
        <div className="w-[68px] h-[68px] rounded-full bg-zinc-100 border-[6px] border-zinc-500 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-zinc-700" />
        </div>
      )}
    </div>
  );
}

function RoundConnector({ label, active = false, installed = false, onClick, disabled = false }) {
  const content = (
    <div className="flex items-center gap-4 relative">
      <div className={`relative w-32 h-32 rounded-full bg-zinc-500 border-[14px] border-zinc-700 shadow-2xl flex items-center justify-center ${active ? "ring-4 ring-yellow-300" : ""}`}>
        {installed ? (
          <>
            <div className="absolute inset-[18px] rounded-full bg-black border-[6px] border-zinc-800 shadow-2xl z-10" />
            <div className="absolute inset-[42px] rounded-full bg-zinc-900 z-20" />
          </>
        ) : (
          <div className="w-20 h-20 rounded-full bg-sky-700 border-[6px] border-zinc-300 grid grid-cols-3 gap-1.5 p-3">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-full bg-amber-200 border border-zinc-800" />
            ))}
          </div>
        )}
      </div>
      <div className="text-2xl font-black leading-6 text-neutral-300 tracking-wide whitespace-pre-line">{label}</div>
    </div>
  );

  if (!onClick) return content;
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="text-left rounded-2xl disabled:cursor-not-allowed">
      {content}
    </button>
  );
}

function BoxedLabel({ active, children, style }) {
  return (
    <div
      className={`absolute border-2 px-1.5 py-0.5 text-[22px] font-black leading-6 tracking-tight select-none ${
        active ? "text-yellow-300 border-yellow-300 drop-shadow" : "text-neutral-200 border-neutral-300"
      }`}
      style={style}
    >
      {children}
    </div>
  );
}

function FunctionKnob({ value, onChange, disabled = false }) {
  const knob = { x: 150, y: 145, r: 59 };
  const targets = {
    RXMT: { x: 42, y: 36 },
    REM: { x: 98, y: 36 },
    Z: { x: 160, y: 38 },
    OFF: { x: 166, y: 74 },
    "SQ OFF": { x: 66, y: 102 },
    "SQ ON": { x: 70, y: 156 },
    LD: { x: 85, y: 222 },
    TST: { x: 145, y: 224 },
    STBY: { x: 218, y: 204 },
  };

  const target = targets[value] || targets.OFF;
  const angle = (Math.atan2(target.y - knob.y, target.x - knob.x) * 180) / Math.PI;
  const labelBase = "absolute text-[22px] font-black leading-6 tracking-tight text-neutral-200 select-none";
  const active = (p) => (value === p ? " text-yellow-300 drop-shadow" : "");

  return (
    <div className="relative" style={{ width: 290, height: 290 }}>
      <div className={labelBase + active("RXMT")} style={{ left: 2, top: 22 }}>RXMT</div>
      <div className={labelBase + active("REM")} style={{ left: 92, top: 22 }}>REM</div>
      <BoxedLabel active={value === "Z"} style={{ left: 152, top: 16 }}>Z</BoxedLabel>
      <BoxedLabel active={value === "OFF"} style={{ left: 164, top: 54 }}>OFF</BoxedLabel>
      <div className={labelBase + active("SQ OFF")} style={{ left: 28, top: 84 }}>OFF</div>
      <div className="absolute text-[22px] font-black leading-6 tracking-tight text-neutral-200 select-none" style={{ left: 28, top: 116 }}>SQ</div>
      <div className={labelBase + active("SQ ON")} style={{ left: 32, top: 148 }}>ON</div>
      <div className={labelBase + active("LD")} style={{ left: 68, top: 214 }}>LD</div>
      <div className={labelBase + active("TST")} style={{ left: 126, top: 216 }}>TST</div>
      <BoxedLabel active={value === "STBY"} style={{ left: 184, top: 194 }}>STBY</BoxedLabel>
      <div className="absolute left-[18px] top-[258px] text-[24px] font-black tracking-wide text-neutral-200">FCTN</div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(fctnPositions[(fctnPositions.indexOf(value) + 1) % fctnPositions.length])}
        className={`absolute rounded-full bg-[#6c7468] border-4 border-[#2a3029] shadow-2xl active:scale-95 transition ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        style={{ left: knob.x - knob.r, top: knob.y - knob.r, width: knob.r * 2, height: knob.r * 2 }}
        title="Click to rotate FCTN knob"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="knobShade" cx="30%" cy="25%" r="80%">
              <stop offset="0%" stopColor="#849080" />
              <stop offset="100%" stopColor="#424b40" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#knobShade)" />
          <g transform={`rotate(${angle} 50 50)`}>
            <polygon points="45,42 83,42 95,50 83,58 45,58" fill="#e8e0c7" stroke="#d7cfb5" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="5" fill="#31382f" />
          </g>
        </svg>
      </button>
    </div>
  );
}

function PartButton({ type, selected, installed, hidden, onClick }) {
  if (hidden) return null;

  return (
    <button
      type="button"
      disabled={installed}
      onClick={onClick}
      className={`rounded-2xl border p-3 min-h-[112px] flex flex-col items-center justify-center gap-2 transition ${
        installed
          ? "border-white/10 bg-neutral-900/40 text-neutral-500 cursor-not-allowed"
          : selected
          ? "border-yellow-300 bg-yellow-300/10 text-yellow-100"
          : "border-white/10 bg-neutral-900 hover:border-emerald-300"
      }`}
    >
      {type === "battery" && <div className="w-12 h-16 rounded-lg border border-black bg-gradient-to-b from-zinc-500 to-zinc-950 relative"><div className="absolute left-1/2 top-1.5 -translate-x-1/2 w-7 h-1.5 rounded bg-zinc-300" /></div>}
      {type === "door" && <div className="w-16 h-12 rounded border-4 border-[#293126] bg-[#536049] shadow-inner" />}
      {type === "antenna" && <div className="relative w-16 h-20"><div className="absolute left-1/2 top-0 -translate-x-1/2 w-1.5 h-16 bg-black rounded-full" /><div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-200 border-[8px] border-zinc-600" /></div>}
      {type === "handset" && <div className="relative w-20 h-16"><div className="absolute right-2 top-0 w-9 h-16 rounded-[22px] bg-black rotate-[18deg]" /><div className="absolute left-0 top-8 w-14 h-7 rounded-full border-b-[7px] border-black" /></div>}
      <b>{type === "battery" ? "BA-5590 Battery" : type === "door" ? "Battery Door" : type === "antenna" ? "Antenna" : "Handset"}</b>
      <span className="text-xs text-neutral-400">{installed ? "Done" : selected ? "Tap matching spot" : "Tap to select"}</span>
    </button>
  );
}

function RearView({ selectedPart, batteryInstalled, doorClosed, onSpot, onTurnFront }) {
  return (
    <div className="relative mx-auto min-w-[760px] w-full max-w-[860px] aspect-[4/3] rounded-[1.5rem] border-[5px] border-[#1b2319] bg-[#4f6048] shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_20%,rgba(255,255,255,.14),transparent_28%),radial-gradient(circle_at_84%_88%,rgba(0,0,0,.35),transparent_44%)]" />
      <div className="absolute left-[8%] top-[12%] w-[84%] h-[72%] rounded-3xl border-[5px] border-[#242d22] bg-gradient-to-br from-[#6c7c62] to-[#44523e] shadow-2xl" />
      <div className="absolute left-[16%] top-[17%] w-[68%] h-[58%] rounded-2xl border-4 border-[#222b20] bg-gradient-to-br from-[#53644c] to-[#394634] shadow-inner" />
      <div className="absolute left-[5%] top-[5%] text-sm font-black uppercase tracking-[0.18em] text-emerald-50">Rear View</div>

      <button
        type="button"
        onClick={() => onSpot(batteryInstalled ? "door" : "battery")}
        className={`absolute left-[26%] top-[24%] w-[48%] h-[42%] rounded-2xl border-4 border-dashed flex items-center justify-center transition ${
          (selectedPart === "battery" && !batteryInstalled) || (selectedPart === "door" && batteryInstalled && !doorClosed)
            ? "border-yellow-300 bg-yellow-300/10 ring-4 ring-yellow-300"
            : "border-white/40 bg-black/15"
        }`}
      >
        {batteryInstalled ? (
          <div className="w-[58%] h-[92%] rounded-2xl border-2 border-black/70 bg-gradient-to-b from-zinc-600 to-zinc-950 p-4 text-center font-black text-emerald-100 shadow-2xl">
            <div className="mx-auto mb-10 h-2.5 w-20 rounded-full bg-zinc-300" />
            <div className="rounded-md bg-black/30 p-2 text-2xl">BA-5590</div>
            <div className="mt-10 tracking-[0.2em]">INSERTED</div>
          </div>
        ) : (
          <div className="text-center text-lg font-black uppercase tracking-[0.18em] text-white/75">Drop BA-5590<br />Battery Here</div>
        )}
      </button>

      {doorClosed && (
        <div className="absolute left-[24%] top-[22%] w-[52%] h-[46%] rounded-[1.25rem] border-[5px] border-[#293126] bg-gradient-to-br from-[#65745c] to-[#3e4a39] shadow-2xl flex items-center justify-center text-2xl font-black tracking-[0.18em] text-emerald-50">
          DOOR LOCKED
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-20 rounded-full bg-[#1b211a]" />
        </div>
      )}

      {batteryInstalled && !doorClosed && <div className="absolute inset-x-0 bottom-[14%] text-center font-black tracking-[0.12em] text-emerald-100">✓ BATTERY INSERTED — CLOSE DOOR</div>}
      {doorClosed && (
        <>
          <div className="absolute inset-x-0 bottom-[14%] text-center font-black tracking-[0.12em] text-emerald-100">✓ BATTERY DOOR CLOSED / LOCKED</div>
          <button type="button" onClick={onTurnFront} className="absolute bottom-[5%] left-1/2 -translate-x-1/2 rounded-2xl border border-emerald-300/60 bg-emerald-400/20 px-6 py-4 font-black tracking-[0.14em] text-emerald-100">TURN RADIO OVER →</button>
        </>
      )}
    </div>
  );
}

function CableToPort({ port }) {
  if (!port) return null;

  const isFill = port === "fill";

  // Coordinates are based on the right connector bay:
  // - connector cap center is x=84
  // - AUD/FILL center is y=158
  // - AUD/DATA center is y=342
  // The cord starts exactly at that cap center and terminates at the handset cord strain relief.
  const startY = isFill ? 158 : 342;
  const endX = 218;
  const endY = 286;

  const cordPath = isFill
    ? `M84 ${startY} C118 ${startY}, 140 176, 160 204 C178 232, 198 268, ${endX} ${endY}`
    : `M84 ${startY} C122 ${startY}, 146 326, 168 306 C186 292, 203 286, ${endX} ${endY}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <svg viewBox="0 0 300 500" className="absolute inset-0 w-full h-full overflow-visible text-black">
        <path
          d={cordPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* H-250 style handset, not a radio body */}
      <div className="absolute left-[205px] top-[205px] w-[82px] h-[188px] rotate-[12deg]">
        {/* main handset shape */}
        <div className="absolute left-[20px] top-[14px] w-[48px] h-[160px] rounded-[28px] bg-[#070707] border-2 border-zinc-900 shadow-2xl" />

        {/* upper round receiver */}
        <div className="absolute left-[8px] top-0 w-[70px] h-[70px] rounded-full bg-[#080808] border-2 border-zinc-900 shadow-xl">
          <div className="absolute left-1/2 top-1/2 grid w-8 h-8 -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-full bg-zinc-500" />
            ))}
          </div>
        </div>

        {/* lower round microphone */}
        <div className="absolute left-[1px] bottom-0 w-[64px] h-[64px] rounded-full bg-[#080808] border-2 border-zinc-900 shadow-xl">
          <div className="absolute left-1/2 top-1/2 grid w-7 h-7 -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="rounded-full bg-zinc-500" />
            ))}
          </div>
        </div>

        {/* single push-to-talk button */}
        <div className="absolute left-[6px] top-[92px] w-4 h-12 rounded-md bg-zinc-800 border border-zinc-700 shadow" />

        {/* cord strain relief point where the wire visibly lands */}
        <div className="absolute left-[6px] top-[79px] w-5 h-5 rounded-full bg-black border-2 border-zinc-900 shadow" />
      </div>
    </div>
  );
}

function FrontFace({
  selectedPart,
  antennaInstalled,
  handsetPort,
  onSpot,
  fctn,
  onFctn,
  lcd,
  pressKey,
  setupBlocked,
}) {
  return (
    <div className="w-full overflow-x-auto overflow-y-visible pb-4 touch-auto">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full min-w-[1200px] max-w-[1500px] mx-auto rounded-xl bg-[#3f4a39] border-[6px] border-[#171c15] shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.28),transparent_45%)] pointer-events-none" />
        <div className="relative grid grid-cols-[285px_minmax(500px,1fr)_300px] gap-5 items-center min-h-[500px]">
          <div className="h-full rounded-l-xl bg-[#536049] border-2 border-[#30382d] p-4 flex flex-col justify-between relative">
            <button type="button" onClick={() => onSpot("antenna")} className="pt-6 pl-6 rounded-2xl text-left w-fit">
              <CoaxConnector active={selectedPart === "antenna" && !antennaInstalled} installed={antennaInstalled} />
              <div className="mt-2 ml-12 text-sm font-black tracking-[0.2em] text-neutral-200">ANT</div>
            </button>
            <div className="pb-2"><FunctionKnob value={fctn} onChange={onFctn} disabled={setupBlocked} /></div>
          </div>

          <div className="bg-[#596650] rounded-xl border-4 border-[#222920] p-6 shadow-inner relative">
            <div className="mx-auto max-w-[580px]">
              <div className="grid grid-cols-4 text-center text-2xl font-black text-neutral-100 tracking-[0.16em] mb-2 px-7">
                <div>PWR</div><div>MODE</div><div>CHAN</div><div>CMSC</div>
              </div>
              <div className="h-[124px] bg-[#aeb39b] border-[10px] border-[#2a3029] rounded-lg shadow-inner text-neutral-900 font-mono flex flex-col justify-center px-6 text-3xl tracking-[0.12em] mb-7">
                <div className="grid grid-cols-4 text-center font-black">
                  <div>{lcd.pwr}</div><div>{lcd.mode}</div><div>{lcd.chan}</div><div>{lcd.cmsc}</div>
                </div>
                <div className="text-center mt-2 tracking-[0.22em]">{lcd.lower}</div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {keypad.map((key, i) => (
                  <button key={`${key.label}-${i}`} type="button" onClick={() => pressKey(key.label, key.digit)} className="h-[62px] rounded-lg bg-zinc-800 border-2 border-zinc-950 shadow-[inset_0_2px_4px_rgba(255,255,255,.18),0_3px_0_rgba(0,0,0,.7)] active:translate-y-1 active:shadow-inner transition text-[15px] font-black text-yellow-300 whitespace-pre-line leading-4">
                    <span className="block">{key.label}</span>
                    {isDigit(key.digit) && <span className="block text-neutral-100 text-lg leading-5">{key.digit}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute bottom-[-2px] right-10 text-sm font-black text-neutral-300 tracking-wider">RXMT</div>
          </div>

          <div className="h-full rounded-r-xl bg-[#536049] border-2 border-[#30382d] p-5 relative flex flex-col justify-center gap-14 overflow-visible">
            <RoundConnector label={<>AUD/<br />FILL</>} active={selectedPart === "handset"} installed={handsetPort === "fill"} onClick={() => onSpot("fill")} />
            <RoundConnector label={<>AUD/<br />DATA</>} active={selectedPart === "handset"} installed={handsetPort === "data"} onClick={() => onSpot("data")} />
            <CableToPort port={handsetPort} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const audioCtxRef = useRef(null);
  const successPlayedRef = useRef(false);

  const [scene, setScene] = useState("rear");
  const [selectedPart, setSelectedPart] = useState(null);
  const [batteryInstalled, setBatteryInstalled] = useState(false);
  const [doorClosed, setDoorClosed] = useState(false);
  const [antennaInstalled, setAntennaInstalled] = useState(false);
  const [handsetPort, setHandsetPort] = useState(null);
  const [audioOn, setAudioOn] = useState(true);

  const [fctn, setFctn] = useState("OFF");
  const [mode, setMode] = useState("---");
  const [chan, setChan] = useState("---");
  const [rf, setRf] = useState("LO");
  const [cmsc, setCmsc] = useState("---");
  const [freqs, setFreqs] = useState({ MAN: "00000", "1": "00000", "2": "00000", "3": "00000", "4": "00000", "5": "00000", "6": "00000", CUE: "00000" });
  const [screen, setScreen] = useState("HOME");
  const [entry, setEntry] = useState("");
  const [volume, setVolume] = useState(5);
  const [message, setMessage] = useState("Start on the rear side: install the battery, then close the battery door.");
  const [showHint, setShowHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blink, setBlink] = useState(false);

  function getAudioContext() {
    if (!audioOn) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }

  function playTone(freq = 900, duration = 45, baseVolume = 0.02, type = "sine") {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const scaledVolume = Math.max(0.002, baseVolume * (volume / 5));
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(scaledVolume, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration / 1000 + 0.02);
  }

  function keyClick() { playTone(1000, 18, 0.012, "sine"); }
  function errorTone() { playTone(210, 100, 0.02, "triangle"); }
  function confirmTone() { playTone(780, 80, 0.018, "sine"); }
  function startupBeep() { playTone(950, 70, 0.018, "sine"); window.setTimeout(() => playTone(1150, 65, 0.016, "sine"), 85); }
  function stoTone() { playTone(980, 70, 0.018, "sine"); }
  function successTone() { playTone(850, 110, 0.02, "sine"); }

  const assemblyReady = batteryInstalled && doorClosed && antennaInstalled && handsetPort === "fill";
  const powered = batteryInstalled && doorClosed && fctn !== "OFF";
  const usableChannel = chan !== "---" ? chan : "1";
  const currentFreq = freqs[usableChannel] || "00000";

  const trainingComplete = assemblyReady && !busy && fctn === "SQ ON" && rf === "HI" && mode === "SC" && cmsc === "PT" && chan === "2" && freqs["2"] === "41300";

  useEffect(() => {
    if (trainingComplete && !successPlayedRef.current) {
      successPlayedRef.current = true;
      setShowHint(true);
      setMessage("SUCCESS — assembly complete and radio configured correctly.");
      successTone();
    }
    if (!trainingComplete) successPlayedRef.current = false;
  }, [trainingComplete]);

  const lcd = useMemo(() => {
    if (!powered) return { pwr: "", mode: "", chan: "", cmsc: "", lower: "" };
    if (busy) return { pwr: "WAIT", mode: "", chan: "", cmsc: "", lower: "WAIT" };
    if (fctn === "TST") return { pwr: "TST", mode: "", chan: "", cmsc: "", lower: "GOOD" };
    if (fctn === "STBY") return { pwr: "STBY", mode: "", chan: "", cmsc: "", lower: "" };
    if (screen === "VOL") return { pwr: "VOL", mode: "", chan: "", cmsc: "", lower: String(volume) };
    if (screen === "CHAN") return { pwr: "", mode, chan, cmsc, lower: "CHANNEL" };
    if (screen === "RF") return { pwr: rf, mode, chan, cmsc, lower: "POWER" };
    if (screen === "MODE") return { pwr: rf, mode, chan, cmsc, lower: "MODE" };
    if (screen === "COMSEC") return { pwr: rf, mode, chan, cmsc, lower: "COMSEC" };
    if (screen === "FREQ_ENTRY") return { pwr: rf, mode, chan, cmsc, lower: entry.padEnd(5, "-") };
    if (screen === "FREQ_VIEW") return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
    if (blink) return { pwr: "STO", mode, chan, cmsc, lower: currentFreq };
    return { pwr: rf, mode, chan, cmsc, lower: currentFreq };
  }, [powered, busy, fctn, screen, volume, chan, rf, mode, cmsc, entry, currentFreq, blink]);

  function changeScene(next) {
    keyClick();
    setShowHint(false);
    if (next === "front" && !(batteryInstalled && doorClosed)) {
      setMessage("Install the battery and close the battery door before turning the radio over.");
      errorTone();
      return;
    }
    if (next === "setup" && !assemblyReady) {
      setMessage("Attach antenna and connect the handset to AUD/FILL before setup.");
      errorTone();
      return;
    }
    setScene(next);
    if (next === "rear") setMessage("Rear view: install the battery, then close the battery door.");
    if (next === "front") setMessage("Front view: install antenna and connect the handset to AUD/FILL.");
    if (next === "setup") setMessage("Setup: set FCTN to LD, then configure HI / SC / PT / CH 2 / 41300.");
  }

  function selectPart(part) {
    keyClick();
    setSelectedPart(part);
    setShowHint(false);
    if (part === "battery") setMessage("Battery selected. Tap the rear battery bay.");
    if (part === "door") setMessage("Battery door selected. Tap the rear battery bay to close and lock it.");
    if (part === "antenna") setMessage("Antenna selected. Tap the ANT connector.");
    if (part === "handset") setMessage("Handset selected. Tap AUD/FILL or AUD/DATA. Mission requires AUD/FILL.");
  }

  function handleSpot(spot) {
    keyClick();
    setShowHint(false);

    if (!selectedPart) {
      if (spot === "data" || spot === "fill") setMessage("Select the handset first, then tap the desired audio port.");
      else setMessage("Select the matching part first.");
      return;
    }

    if (spot === "battery" && selectedPart === "battery") {
      setBatteryInstalled(true);
      setSelectedPart(null);
      setMessage("Battery inserted. Now close the battery door.");
      confirmTone();
      return;
    }

    if (spot === "door" && selectedPart === "door" && batteryInstalled) {
      setDoorClosed(true);
      setSelectedPart(null);
      setMessage("Battery door closed and locked. Turn the radio over.");
      confirmTone();
      return;
    }

    if (spot === "antenna" && selectedPart === "antenna") {
      setAntennaInstalled(true);
      setSelectedPart(null);
      setMessage("Antenna attached. Connect the handset to AUD/FILL.");
      confirmTone();
      return;
    }

    if ((spot === "fill" || spot === "data") && selectedPart === "handset") {
      setHandsetPort(spot);
      setSelectedPart(null);
      if (spot === "fill") {
        setMessage("Handset connected to AUD/FILL. Correct for this mission.");
        confirmTone();
      } else {
        setMessage("Handset connected to AUD/DATA. It fits, but mission criteria requires AUD/FILL.");
        errorTone();
      }
      return;
    }

    setMessage("Wrong spot. That part does not connect there.");
    errorTone();
  }

  function handleFctn(next) {
    keyClick();
    setShowHint(false);

    if (!batteryInstalled) {
      setMessage("No battery installed. Radio cannot power on.");
      errorTone();
      return;
    }
    if (!doorClosed) {
      setMessage("Battery door is open. Close and lock it first.");
      errorTone();
      return;
    }

    setFctn(next);
    setEntry("");
    setBlink(false);
    setScreen("HOME");

    if (next === "OFF") {
      setBusy(false);
      setMessage("RT off.");
      return;
    }

    if (!assemblyReady) {
      setMessage("Antenna and handset on AUD/FILL required before operation.");
      errorTone();
      return;
    }

    setBusy(true);
    setMessage(`FCTN set to ${next}. WAIT displayed for 3 seconds.`);
    window.setTimeout(() => {
      setBusy(false);
      if (next === "LD") setMessage("Load mode ready. Press MENU/CLR to step through Volume, Channel, Power, Mode, COMSEC.");
      else if (next === "Z") setMessage("Z position selected. Zeroize is visually represented only; no real COMSEC exists in this trainer.");
      else if (next === "SQ ON") setMessage("FCTN set to SQ ON. Normal operating position after loading.");
      else if (next === "SQ OFF") setMessage("FCTN set to SQ OFF. Squelch off position selected.");
      else if (next === "TST") setMessage("Self-test simulated. Display should show GOOD.");
      else setMessage(`FCTN set to ${next}.`);
    }, 3000);
  }

  function pressKey(label, digit) {
    keyClick();
    setShowHint(false);

    if (!assemblyReady) {
      setMessage("Complete battery door, antenna, and AUD/FILL handset connection before operating.");
      errorTone();
      return;
    }

    if (!powered) return setMessage("Radio is off. Turn the FCTN knob out of OFF first.");
    if (busy) return setMessage("WAIT is active. Hold until the radio is ready.");

    if (screen === "FREQ_ENTRY" && isDigit(digit)) {
      setEntry((prev) => (prev + digit).slice(0, 5));
      return setMessage("Enter all 5 frequency digits, then press STO.");
    }

    if (label === "MENU\nCLR") {
      if (screen === "FREQ_VIEW") {
        setScreen("FREQ_ENTRY");
        setEntry("");
        return setMessage("Frequency cleared to dashes. Enter 5 digits: 41300.");
      }
      if (screen === "FREQ_ENTRY") {
        setEntry((prev) => prev.slice(0, -1));
        return setMessage("CLR deleted the last digit.");
      }
      const order = ["VOL", "CHAN", "RF", "MODE", "COMSEC", "HOME"];
      const idx = order.indexOf(screen);
      const next = order[(idx + 1 + order.length) % order.length] || "VOL";
      setScreen(next);
      return setMessage("MENU cycles setup fields. Use CHG to change the displayed field.");
    }

    if (label === "CHG") {
      if (screen === "VOL") {
        setVolume((prev) => (prev >= 9 ? 1 : prev + 1));
        return setMessage("Volume changed. Beeps now follow the displayed volume level.");
      }
      if (screen === "CHAN") {
        const next = nextFrom(chanPositions, chan);
        setChan(next);
        return setMessage(`Channel changed to ${next}.`);
      }
      if (screen === "RF") {
        const next = nextFrom(rfPositions, rf);
        setRf(next);
        return setMessage(`Power changed to ${next}. Criteria requires LO.`);
      }
      if (screen === "MODE") {
        const next = nextFrom(modePositions, mode);
        setMode(next);
        return setMessage(`Mode changed to ${next}. Keep cycling until SC.`);
      }
      if (screen === "COMSEC") {
        const next = nextFrom(cmscPositions, cmsc);
        setCmsc(next);
        return setMessage(`COMSEC changed to ${next}. Criteria requires PT.`);
      }
      return setMessage("Press MENU/CLR until the field you want is displayed, then use CHG.");
    }

    if (label === "FREQ") {
      if (fctn !== "LD") return setMessage("Set FCTN to LD before loading a frequency.");
      if (mode !== "SC") return setMessage("Set MODE to SC first: MENU/CLR until MODE, then CHG until SC.");
      if (cmsc !== "PT") return setMessage("Set COMSEC to PT first: MENU/CLR until COMSEC, then CHG until PT.");
      if (chan === "---") return setMessage("Select Channel 2 first: MENU/CLR until CHANNEL, then CHG to 2.");
      setScreen("FREQ_VIEW");
      setEntry("");
      return setMessage(`FREQ selected for channel ${chan}. Press MENU/CLR to clear to dashes.`);
    }

    if (label === "STO") {
      if (screen === "FREQ_ENTRY" && entry.length === 5) {
        const stored = entry;
        setFreqs((prev) => ({ ...prev, [usableChannel]: stored }));
        setBlink(true);
        setScreen("HOME");
        setEntry("");
        setMessage(`Stored ${stored} in channel ${usableChannel}. Turn FCTN to SQ ON for normal operation.`);
        stoTone();
        window.setTimeout(() => setBlink(false), 900);
      } else setMessage("STO only stores after FREQ, MENU/CLR, and a complete 5-digit entry.");
      return;
    }

    if (label === "CMSC") return setScreen("COMSEC"), setMessage("COMSEC screen selected. Press CHG until PT for this training.");
    if (label === "RCU") return setScreen("MODE"), setMessage("MODE screen selected. Press CHG until SC for single channel.");
    if (label === "BATT\nCALL") return setMessage("Battery condition simulated: 87%.");
    if (isDigit(digit)) return setMessage("Digit keys enter numbers only after FREQ and MENU/CLR.");
    return setMessage(`${label.replace("\n", " ")} is present for panel familiarity but is not modeled for this SC drill.`);
  }

  const checklist = [
    ["Battery inserted", batteryInstalled],
    ["Battery door closed/locked", doorClosed],
    ["Radio turned to front", scene !== "rear"],
    ["Antenna installed", antennaInstalled],
    ["Handset connected to AUD/FILL", handsetPort === "fill"],
    ["HI power", rf === "HI"],
    ["SC mode", mode === "SC"],
    ["PT COMSEC", cmsc === "PT"],
    ["Channel 2", chan === "2"],
    ["Frequency 41300 stored in CH 2", freqs["2"] === "41300"],
    ["FCTN SQ ON", fctn === "SQ ON"],
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 flex flex-col items-center gap-4">
      <div className="w-full max-w-[1700px] rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">SINCGARS Integrated Trainer</div>
        <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">Assembly + Single Channel Setup</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => changeScene("rear")} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${scene === "rear" ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-100" : "border-white/10 bg-neutral-900 text-neutral-400"}`}>1 Rear</button>
          <button type="button" onClick={() => changeScene("front")} className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${scene !== "rear" ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-100" : "border-white/10 bg-neutral-900 text-neutral-400"}`}>2 Front</button>
        </div>
      </div>

      <div className="w-full max-w-[1700px] grid xl:grid-cols-[1fr_340px] gap-4 items-start">
        <section className="rounded-[2rem] border border-white/10 bg-[#303b2c] p-4 shadow-2xl overflow-auto">
          {scene === "rear" ? (
            <RearView selectedPart={selectedPart} batteryInstalled={batteryInstalled} doorClosed={doorClosed} onSpot={handleSpot} onTurnFront={() => changeScene("front")} />
          ) : (
            <FrontFace
              selectedPart={selectedPart}
              antennaInstalled={antennaInstalled}
              handsetPort={handsetPort}
              onSpot={handleSpot}
              fctn={fctn}
              onFctn={handleFctn}
              lcd={lcd}
              pressKey={pressKey}
              setupBlocked={false}
            />
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg">
            <h2 className="text-xl font-black">Parts Tray</h2>
            <p className="mt-1 text-sm text-neutral-400">Tap a part, then tap the matching spot.</p>
            <div className="mt-4 grid gap-3">
              <PartButton type="battery" selected={selectedPart === "battery"} installed={batteryInstalled} hidden={scene !== "rear" || batteryInstalled} onClick={() => selectPart("battery")} />
              <PartButton type="door" selected={selectedPart === "door"} installed={doorClosed} hidden={scene !== "rear" || !batteryInstalled || doorClosed} onClick={() => selectPart("door")} />
              <PartButton type="antenna" selected={selectedPart === "antenna"} installed={antennaInstalled} hidden={scene === "rear" || antennaInstalled} onClick={() => selectPart("antenna")} />
              <PartButton type="handset" selected={selectedPart === "handset"} installed={handsetPort === "fill"} hidden={scene === "rear" || handsetPort === "fill"} onClick={() => selectPart("handset")} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Need help?</h2>
              <button type="button" onClick={() => setShowHint((prev) => !prev)} className="rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm font-bold hover:bg-neutral-700 active:translate-y-0.5 transition">Hint</button>
            </div>
            {trainingComplete ? <div className="mt-3 text-2xl font-black text-green-400">SUCCESS</div> : showHint ? <div className="mt-3 text-lg text-yellow-200">{message}</div> : <div className="mt-3 text-sm text-neutral-500">Hint hidden. Click Hint if you get stuck.</div>}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg text-sm text-neutral-200">
            <h2 className="text-xl font-black">Mission Criteria</h2>
            <ul className="mt-3 space-y-2">
              {checklist.map(([label, done]) => <li key={label}>{done ? "✅" : "⬜"} {label}</li>)}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
