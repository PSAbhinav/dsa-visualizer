"use client";

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

type MathTab = "gcd" | "sieve" | "modexp";
type GcdFrame = { a: number; b: number; r: number };
type ModFrame = { bit: number; exp: number; base: number; result: number; multiply: boolean };

const TAB_COPY: Record<MathTab, string> = {
  gcd: "Use Euclid's algorithm to shrink the pair until the remainder becomes zero.",
  sieve: "Start from 2 and repeatedly cross out multiples to reveal primes.",
  modexp: "Fast modular exponentiation squares the base and consumes exponent bits.",
};
const clampLimit = (value: number) => Math.max(10, Math.min(60, value || 30));

export function MathVisualizer() {
  const [tab, setTab] = useState<MathTab>("gcd");
  const [speed, setSpeed] = useState(55);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState(TAB_COPY.gcd);
  const [gcdValues, setGcdValues] = useState({ a: 252, b: 105 });
  const [gcdFrames, setGcdFrames] = useState<GcdFrame[]>([]);
  const [gcdIndex, setGcdIndex] = useState(-1);
  const [limit, setLimit] = useState(30);
  const [crossed, setCrossed] = useState<number[]>([]);
  const [currentPrime, setCurrentPrime] = useState<number | null>(null);
  const [primes, setPrimes] = useState<number[]>([]);
  const [modValues, setModValues] = useState({ base: 5, exp: 13, mod: 23 });
  const [modFrames, setModFrames] = useState<ModFrame[]>([]);
  const [modIndex, setModIndex] = useState(-1);
  const [modResult, setModResult] = useState<number | null>(null);

  const wait = useCallback((ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)), []);
  const reset = useCallback(() => {
    setGcdFrames([]); setGcdIndex(-1); setCrossed([]); setCurrentPrime(null); setPrimes([]); setModFrames([]); setModIndex(-1); setModResult(null);
  }, []);
  const handleTabChange = useCallback((nextTab: MathTab) => {
    if (isRunning || nextTab === tab) return;
    reset();
    setStatus(TAB_COPY[nextTab]);
    setTab(nextTab);
  }, [isRunning, reset, tab]);

  const run = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true); reset();
    const delay = Math.max(120, 900 - speed * 7);

    if (tab === "gcd") {
      let a = Math.abs(Number(gcdValues.a) || 0), b = Math.abs(Number(gcdValues.b) || 0);
      const frames: GcdFrame[] = [];
      if (a === 0 && b === 0) { setStatus("GCD is undefined for 0 and 0, so try a different pair."); setIsRunning(false); return; }
      while (b !== 0) {
        const r = a % b;
        frames.push({ a, b, r });
        setGcdFrames([...frames]); setGcdIndex(frames.length - 1);
        setStatus(`${a} mod ${b} = ${r}. Replace the pair with (${b}, ${r}).`);
        await wait(delay); a = b; b = r;
      }
      setStatus(`The remainder hit 0, so the GCD is ${a}.`); setIsRunning(false); return;
    }

    if (tab === "sieve") {
      const cappedLimit = clampLimit(Number(limit));
      const removed = new Set<number>();
      const nextPrimes: number[] = [];
      for (let prime = 2; prime <= cappedLimit; prime++) {
        if (removed.has(prime)) continue;
        nextPrimes.push(prime); setCurrentPrime(prime); setPrimes([...nextPrimes]);
        setStatus(`${prime} survives, so mark its multiples as composite.`); await wait(delay);
        for (let multiple = prime * 2; multiple <= cappedLimit; multiple += prime) {
          if (removed.has(multiple)) continue;
          removed.add(multiple); setCrossed([...removed]); await wait(Math.max(90, delay / 2));
        }
      }
      setCurrentPrime(null); setStatus(`Prime numbers up to ${cappedLimit}: ${nextPrimes.join(", ")}.`); setIsRunning(false); return;
    }

    const modulus = Math.max(1, Number(modValues.mod) || 1);
    let remaining = Math.max(0, Number(modValues.exp) || 0);
    let result = 1 % modulus;
    let base = ((Number(modValues.base) || 0) % modulus + modulus) % modulus;
    const frames: ModFrame[] = [];
    if (remaining === 0) { setModResult(result); setStatus(`Any non-zero modulus with exponent 0 gives ${result}.`); setIsRunning(false); return; }
    for (let bit = 0; remaining > 0; bit++) {
      const multiply = (remaining & 1) === 1;
      if (multiply) result = (result * base) % modulus;
      frames.push({ bit, exp: remaining, base, result, multiply });
      setModFrames([...frames]); setModIndex(frames.length - 1);
      setStatus(multiply ? `Bit ${bit} is 1, so multiply by ${base} modulo ${modulus}.` : `Bit ${bit} is 0, so only square the base.`);
      await wait(delay); base = (base * base) % modulus; remaining = Math.floor(remaining / 2);
    }
    setModResult(result); setStatus(`Finished exponentiation: ${modValues.base}^${modValues.exp} mod ${modulus} = ${result}.`); setIsRunning(false);
  }, [gcdValues, isRunning, limit, modValues, reset, speed, tab, wait]);

  const modulus = Math.max(1, Number(modValues.mod) || 1);
  const cappedLimit = clampLimit(Number(limit));
  const activeGcd = gcdFrames[gcdIndex] ?? { a: Math.abs(Number(gcdValues.a) || 0), b: Math.abs(Number(gcdValues.b) || 0), r: 0 };
  const activeMod = modFrames[modIndex] ?? {
    bit: 0,
    exp: Math.max(0, Number(modValues.exp) || 0),
    base: ((Number(modValues.base) || 0) % modulus + modulus) % modulus,
    result: 1 % modulus,
    multiply: false,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl shadow-blue-950/20">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="text-lg font-semibold text-white">Math Algorithms</h3><p className="text-sm text-gray-400">Switch between number theory classics and watch each step unfold.</p></div>
        <div className="flex flex-wrap gap-2">{([ ["gcd", "GCD"], ["sieve", "Sieve"], ["modexp", "Mod Exp"] ] as const).map(([id, label]) => (
          <motion.button key={id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => handleTabChange(id)} disabled={isRunning} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${tab === id ? "border-blue-400/40 bg-blue-500/20 text-blue-200" : "border-white/10 bg-gray-800 text-gray-400 hover:text-white"} disabled:opacity-50`}>{label}</motion.button>
        ))}</div>
      </div>

      <div className="mb-5 grid gap-4 rounded-2xl border border-white/5 bg-gray-800/60 p-4 md:grid-cols-[1fr_auto]">
        {tab === "gcd" ? <div className="grid gap-3 sm:grid-cols-2">{(["a", "b"] as const).map((key) => <input key={key} type="number" value={gcdValues[key]} onChange={(event) => setGcdValues((prev) => ({ ...prev, [key]: Number(event.target.value) }))} className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40" placeholder={key.toUpperCase()} />)}</div> : tab === "sieve" ? <input type="number" min={10} max={60} value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40" placeholder="Upper bound" /> : <div className="grid gap-3 sm:grid-cols-3">{(["base", "exp", "mod"] as const).map((key) => <input key={key} type="number" value={modValues[key]} onChange={(event) => setModValues((prev) => ({ ...prev, [key]: Number(event.target.value) }))} className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-white outline-none focus:border-blue-400/40" placeholder={key} />)}</div>}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={run} disabled={isRunning} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{isRunning ? "Running..." : "Animate"}</motion.button>
      </div>

      <div className="mb-5 rounded-2xl border border-white/5 bg-gray-800/70 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400"><span>Animation speed</span><span>{speed}%</span></div>
        <input type="range" min={10} max={100} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-500" />
      </div>

      {tab === "gcd" ? (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="grid gap-3 rounded-2xl border border-white/5 bg-gray-800/50 p-4">{([ ["A", activeGcd.a], ["B", activeGcd.b], ["Remainder", activeGcd.r] ] as const).map(([label, value]) => <motion.div key={label} className="rounded-xl border border-white/10 bg-gray-900 p-4"><div className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</div><div className="mt-2 text-3xl font-bold text-white">{value}</div></motion.div>)}</div>
          <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4"><div className="mb-3 text-sm font-medium text-blue-200">Euclidean steps</div><div className="space-y-2">{gcdFrames.map((frame, index) => <motion.div key={`${frame.a}-${frame.b}-${index}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl border px-4 py-3 text-sm ${gcdIndex === index ? "border-blue-400/40 bg-blue-500/15 text-white" : "border-white/5 bg-gray-900 text-gray-300"}`}>{frame.a} = {frame.b} × ⌊{frame.a / Math.max(frame.b, 1)}⌋ + {frame.r}</motion.div>)}</div></div>
        </div>
      ) : tab === "sieve" ? (
        <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4">
          <div className="mb-3 text-sm text-gray-400">Primes found: <span className="font-semibold text-green-300">{primes.length}</span> up to {cappedLimit}</div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-6">{Array.from({ length: cappedLimit - 1 }, (_, index) => index + 2).map((value) => {
            const isCrossed = crossed.includes(value), isPrime = primes.includes(value);
            return <motion.div key={value} layout animate={{ scale: currentPrime === value ? 1.06 : 1, opacity: isCrossed ? 0.45 : 1 }} className={`rounded-xl border p-3 text-center text-lg font-semibold ${currentPrime === value ? "border-blue-400/50 bg-blue-500/20 text-blue-100" : isCrossed ? "border-red-400/30 bg-red-500/15 text-red-200 line-through" : isPrime ? "border-green-400/30 bg-green-500/15 text-green-200" : "border-white/5 bg-gray-900 text-white"}`}>{value}</motion.div>;
          })}</div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="grid gap-3 rounded-2xl border border-white/5 bg-gray-800/50 p-4">{([ ["Current Base", activeMod.base], ["Remaining Exp", activeMod.exp], ["Result", modResult ?? activeMod.result] ] as const).map(([label, value]) => <motion.div key={label} className="rounded-xl border border-white/10 bg-gray-900 p-4"><div className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</div><div className="mt-2 text-3xl font-bold text-white">{value}</div></motion.div>)}</div>
          <div className="rounded-2xl border border-white/5 bg-gray-800/50 p-4"><div className="mb-3 text-sm font-medium text-blue-200">Exponent bits</div><div className="space-y-2">{modFrames.map((frame) => <motion.div key={`${frame.bit}-${frame.exp}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl border px-4 py-3 text-sm ${modIndex >= 0 && modFrames[modIndex]?.bit === frame.bit ? "border-blue-400/40 bg-blue-500/15 text-white" : "border-white/5 bg-gray-900 text-gray-300"}`}>Bit {frame.bit}: {frame.multiply ? "multiply" : "skip"} → result {frame.result}, next base from {frame.base}² mod {modulus}</motion.div>)}</div></div>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-white/5 bg-gray-800/50 p-4 text-sm text-gray-300"><span className="font-semibold text-blue-300">Step:</span> {status}</div>
    </motion.div>
  );
}
