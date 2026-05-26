"use client";

import { AnimatePresence, animate, motion, useAnimation, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaArrowDown, FaChartLine, FaCode, FaGithub, FaPlayCircle, FaPuzzlePiece } from "react-icons/fa";
import { HiMiniSquares2X2, HiSparkles } from "react-icons/hi2";
import { FloatingParticles } from "@/components/ui/AnimatedComponents";

const features = [
  {
    title: "Interactive Visualizations",
    description: "See each pointer move, swap, and traversal unfold with cinematic motion that makes abstract ideas feel tangible.",
    icon: FaPlayCircle,
  },
  {
    title: "Multi-Language Code",
    description: "Understand the same algorithm through clean implementations and syntax highlights across your favorite languages.",
    icon: FaCode,
  },
  {
    title: "Practice Problems",
    description: "Reinforce every concept with curated challenges that sharpen pattern recognition and interview instincts.",
    icon: FaPuzzlePiece,
  },
  {
    title: "Track Progress",
    description: "Stay motivated with visible milestones, progress insights, and a learning path built for steady improvement.",
    icon: FaChartLine,
  },
] as const;

const stats = [
  { value: 29, suffix: "+", label: "Topics" },
  { value: 100, suffix: "+", label: "Algorithms" },
  { value: 50, suffix: "+", label: "Problems" },
] as const;

const quotes = [
  {
    quote: "Visual intuition turns intimidating DSA concepts into patterns you can actually remember under pressure.",
    author: "A smarter way to prepare",
  },
  {
    quote: "When you can see the algorithm think, writing the code becomes the easy part.",
    author: "Designed for deep understanding",
  },
  {
    quote: "Learning DSA visually builds the kind of clarity that sticks long after the interview ends.",
    author: "Trusted by ambitious learners",
  },
] as const;

const algorithmSnippet = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}`;

const heroContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

function TypewriterCode() {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let index = 0;

    const typeCharacter = () => {
      if (index <= algorithmSnippet.length) {
        setTypedText(algorithmSnippet.slice(0, index));
        index += 1;
        timeoutId = setTimeout(typeCharacter, index > 120 ? 14 : 22);
      } else {
        timeoutId = setTimeout(() => {
          index = 0;
          setTypedText("");
          typeCharacter();
        }, 1800);
      }
    };

    typeCharacter();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <motion.div
      variants={fadeUp}
      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-1 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-400/10" />
      <div className="relative rounded-[24px] border border-white/10 bg-gray-950/90 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            <HiSparkles className="text-sm" />
            Live algorithm preview
          </div>
        </div>

        <pre className="overflow-x-auto text-sm leading-7 text-slate-200 sm:text-[15px]">
          {typedText.split("\n").map((line, index) => (
            <div key={`${line}-${index}`} className="flex">
              <span className="mr-4 select-none text-right text-xs text-slate-500 sm:w-6">{String(index + 1).padStart(2, "0")}</span>
              <span className="whitespace-pre-wrap break-words font-mono">{line || " "}</span>
            </div>
          ))}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="ml-10 inline-block h-5 w-[2px] bg-violet-300 align-middle"
          />
        </pre>

        <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Time: O(log n)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Space: O(1)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Pattern: Search</div>
        </div>
      </div>
    </motion.div>
  );
}

function CountUpStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const controls = useAnimation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    controls.start("show");

    const animation = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.round(latest)),
    });

    return () => animation.stop();
  }, [controls, isInView, value]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.96 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: "easeOut" } },
      }}
      initial="hidden"
      animate={controls}
      className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-xl shadow-violet-950/20 backdrop-blur-xl"
    >
      <div className="mb-3 text-4xl font-bold text-white sm:text-5xl">
        {count}
        {suffix}
      </div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
    </motion.div>
  );
}

function RotatingQuote() {
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((current) => (current + 1) % quotes.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl sm:p-10">
      <div className="mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-violet-200">
        <HiSparkles />
        Learner insight
      </div>

      <AnimatePresence mode="wait">
        <motion.blockquote
          key={activeQuote}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="min-h-[168px]"
        >
          <p className="text-2xl font-semibold leading-relaxed text-white sm:text-3xl">“{quotes[activeQuote].quote}”</p>
          <footer className="mt-6 text-sm text-slate-400">{quotes[activeQuote].author}</footer>
        </motion.blockquote>
      </AnimatePresence>

      <div className="mt-8 flex gap-2">
        {quotes.map((quote, index) => (
          <motion.button
            key={quote.author}
            type="button"
            onClick={() => setActiveQuote(index)}
            whileTap={{ scale: 0.92 }}
            className={`h-2.5 rounded-full transition-all ${activeQuote === index ? "w-10 bg-violet-300" : "w-2.5 bg-white/20"}`}
            aria-label={`Show quote ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const featuresRef = useRef<HTMLElement | null>(null);
  const statsRef = useRef<HTMLElement | null>(null);
  const quoteRef = useRef<HTMLElement | null>(null);

  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.2 });
  const quoteInView = useInView(quoteRef, { once: true, amount: 0.4 });

  const featuresControls = useAnimation();
  const statsControls = useAnimation();
  const quoteControls = useAnimation();

  const { scrollY } = useScroll();
  const orbOneY = useTransform(scrollY, [0, 800], [0, 180]);
  const orbTwoY = useTransform(scrollY, [0, 800], [0, -140]);
  const orbThreeY = useTransform(scrollY, [0, 800], [0, 100]);

  useEffect(() => {
    if (featuresInView) {
      featuresControls.start("show");
    }
  }, [featuresControls, featuresInView]);

  useEffect(() => {
    if (statsInView) {
      statsControls.start("show");
    }
  }, [statsControls, statsInView]);

  useEffect(() => {
    if (quoteInView) {
      quoteControls.start("show");
    }
  }, [quoteControls, quoteInView]);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-gray-950 text-white"
    >
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 85%)",
        }}
      />
      <FloatingParticles />

      <motion.div
        style={{ y: orbOneY }}
        className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl"
      />
      <motion.div
        style={{ y: orbTwoY }}
        className="absolute right-0 top-12 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl"
      />
      <motion.div
        style={{ y: orbThreeY }}
        className="absolute bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-3 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 backdrop-blur-xl"
            >
              <HiMiniSquares2X2 className="text-base text-violet-300" />
              Visual-first DSA mastery platform
            </motion.div>

            <motion.h1 variants={fadeUp} className="max-w-4xl text-5xl font-black tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <motion.span
                className="inline-block bg-gradient-to-r from-violet-200 via-fuchsia-300 to-cyan-300 bg-[length:200%_200%] bg-clip-text text-transparent"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                Master DSA Visually
              </motion.span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Turn complex algorithms into intuitive mental models with immersive animations, guided code walkthroughs, and practice that keeps your momentum high.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <motion.button
                type="button"
                onClick={() => router.push("/topics")}
                whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 0px 35px rgba(139,92,246,0.45)" }}
                whileTap={{ scale: 0.98 }}
                animate={{ scale: [1, 1.04, 1], boxShadow: ["0px 0px 0px rgba(139,92,246,0.25)", "0px 0px 28px rgba(139,92,246,0.55)", "0px 0px 0px rgba(139,92,246,0.25)"] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-7 py-4 text-base font-semibold text-white"
              >
                Start Learning
                <span className="rounded-full bg-white/15 px-2 py-1 text-xs uppercase tracking-[0.25em]">Now</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={scrollToFeatures}
                whileHover={{ y: -2, borderColor: "rgba(167,139,250,0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-slate-200 backdrop-blur-xl"
              >
                Explore experience
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Guided, visual-first concepts
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Built for interview confidence
              </div>
            </motion.div>
          </div>

          <TypewriterCode />
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollToFeatures}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.1, duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-slate-400"
          aria-label="Scroll to features"
        >
          <span className="text-xs uppercase tracking-[0.35em]">Scroll</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
            <FaArrowDown className="text-sm" />
          </span>
        </motion.button>
      </section>

      <motion.section
        id="features"
        ref={featuresRef}
        initial="hidden"
        animate={featuresControls}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
        }}
        className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-violet-200">Why learners stay locked in</p>
          <h2 className="text-4xl font-bold sm:text-5xl">Everything you need to go from confusion to clarity.</h2>
          <p className="mt-4 text-lg text-slate-400">
            Crafted with motion, feedback, and beautiful interfaces that make every study session feel rewarding.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                whileHover={{ scale: 1.03, y: -10, boxShadow: "0px 0px 45px rgba(139,92,246,0.2)" }}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-lg shadow-violet-950/10 backdrop-blur-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-2xl text-violet-200"
                  >
                    <Icon />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        id="stats"
        ref={statsRef}
        initial="hidden"
        animate={statsControls}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
        className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-200">Built for meaningful progress</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">A growing playground for modern DSA prep.</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <CountUpStat key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </motion.section>

      <motion.section
        id="testimonials"
        ref={quoteRef}
        initial="hidden"
        animate={quoteControls}
        variants={{
          hidden: { opacity: 0, y: 32 },
          show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
        }}
        className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <RotatingQuote />
      </motion.section>

      <footer className="relative border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-lg font-semibold text-white">DSA Visualizer</p>
            <p className="mt-2 max-w-md text-sm text-slate-400">Beautiful visual learning for data structures, algorithms, and interview-ready problem solving.</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
            <Link href="/topics" className="transition hover:text-white">
              Topics
            </Link>
            <Link href="#features" className="transition hover:text-white">
              Features
            </Link>
            <Link href="#stats" className="transition hover:text-white">
              Stats
            </Link>
            <Link href="#testimonials" className="transition hover:text-white">
              Quotes
            </Link>
            <Link href="https://github.com" className="inline-flex items-center gap-2 transition hover:text-white">
              <FaGithub />
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}
