"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type OOPTab = "classes" | "inheritance" | "polymorphism";
type ClassId = "shape" | "circle" | "rectangle";
type MethodId = "area" | "describe" | "draw";

type ClassNode = {
  id: ClassId;
  name: string;
  parent?: ClassId;
  x: number;
  y: number;
  accent: string;
  properties: string[];
  methods: { id: MethodId; label: string }[];
};

const BOX_WIDTH = 220;
const BOX_HEIGHT = 140;
const TABS: { id: OOPTab; label: string }[] = [
  { id: "classes", label: "Classes" },
  { id: "inheritance", label: "Inheritance" },
  { id: "polymorphism", label: "Polymorphism" },
];

const OOP_CLASSES: ClassNode[] = [
  {
    id: "shape",
    name: "Shape",
    x: 380,
    y: 98,
    accent: "from-purple-500 to-blue-500",
    properties: ["color", "borderWidth"],
    methods: [
      { id: "describe", label: "describe()" },
      { id: "draw", label: "draw()" },
      { id: "area", label: "area()" },
    ],
  },
  {
    id: "circle",
    parent: "shape",
    name: "Circle",
    x: 220,
    y: 286,
    accent: "from-blue-500 to-cyan-500",
    properties: ["radius"],
    methods: [
      { id: "draw", label: "draw()" },
      { id: "area", label: "area()" },
    ],
  },
  {
    id: "rectangle",
    parent: "shape",
    name: "Rectangle",
    x: 540,
    y: 286,
    accent: "from-emerald-500 to-green-500",
    properties: ["width", "height"],
    methods: [
      { id: "draw", label: "draw()" },
      { id: "area", label: "area()" },
    ],
  },
];

const CLASS_MAP = OOP_CLASSES.reduce<Record<ClassId, ClassNode>>((accumulator, item) => {
  accumulator[item.id] = item;
  return accumulator;
}, {} as Record<ClassId, ClassNode>);

function resolveMethod(runtimeType: ClassId, methodId: MethodId): ClassId {
  let current: ClassId | undefined = runtimeType;
  while (current) {
    const target: ClassNode = CLASS_MAP[current];
    if (target.methods.some((method) => method.id === methodId)) {
      return target.id;
    }
    current = target.parent;
  }
  return "shape" as ClassId;
}

export function OOPVisualizer() {
  const [activeTab, setActiveTab] = useState<OOPTab>("classes");
  const [runtimeType, setRuntimeType] = useState<ClassId>("circle");
  const [selectedMethod, setSelectedMethod] = useState<MethodId>("area");
  const [resolvedClass, setResolvedClass] = useState<ClassId>("circle");
  const [status, setStatus] = useState(
    "Classes bundle data and behavior together so data structures expose clean operations."
  );

  const handleMethodClick = useCallback((methodId: MethodId) => {
    setSelectedMethod(methodId);
  }, []);

  useEffect(() => {
    const target = resolveMethod(runtimeType, selectedMethod);
    setResolvedClass(target);

    if (activeTab === "classes") {
      setStatus("Each class box lists the state it owns and the behavior it exposes through methods.");
      return;
    }

    if (activeTab === "inheritance") {
      setStatus("Inheritance lets Circle and Rectangle reuse Shape's interface while specializing their own fields.");
      return;
    }

    setStatus(
      `Calling ${selectedMethod}() on a ${CLASS_MAP[runtimeType].name} reference resolves to ${CLASS_MAP[target].name}.${selectedMethod}().`
    );
  }, [activeTab, runtimeType, selectedMethod]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 text-white backdrop-blur-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">OOP Concepts for DSA</h3>
          <p className="mt-1 text-sm text-gray-400">Classes model reusable behavior, inheritance shares it, and polymorphism resolves the right override.</p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl bg-gray-800/80 p-1">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? "bg-purple-500/20 text-purple-200" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-gray-800/70 p-4 text-sm text-gray-300">{status}</div>

      {activeTab === "polymorphism" && (
        <div className="mb-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-gray-800/70 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">Runtime object</p>
            <div className="flex flex-wrap gap-2">
              {(["shape", "circle", "rectangle"] as const).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRuntimeType(type)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    runtimeType === type ? "bg-blue-500/20 text-blue-200" : "bg-gray-700/70 text-gray-300"
                  }`}
                >
                  {CLASS_MAP[type].name}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-gray-800/70 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">Method call</p>
            <div className="flex flex-wrap gap-2">
              {(["area", "draw", "describe"] as const).map((methodId) => (
                <motion.button
                  key={methodId}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleMethodClick(methodId)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    selectedMethod === methodId ? "bg-emerald-500/20 text-emerald-200" : "bg-gray-700/70 text-gray-300"
                  }`}
                >
                  {methodId}()
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-gray-950/70 p-3">
        <div className="relative mx-auto h-[390px] max-w-[760px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 390">
            <defs>
              <marker id="oop-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L10,3 L0,6" className="fill-purple-300" />
              </marker>
            </defs>
            {OOP_CLASSES.filter((item) => item.parent).map((item) => {
              const parent = CLASS_MAP[item.parent as ClassId];
              const emphasized = activeTab !== "classes" || resolvedClass === item.id || runtimeType === item.id;
              return (
                <line
                  key={item.id}
                  x1={parent.x}
                  y1={parent.y + BOX_HEIGHT / 2 - 8}
                  x2={item.x}
                  y2={item.y - BOX_HEIGHT / 2 + 8}
                  stroke={emphasized ? "rgba(192,132,252,0.95)" : "rgba(107,114,128,0.55)"}
                  strokeWidth={emphasized ? 3 : 2}
                  markerEnd="url(#oop-arrow)"
                  strokeDasharray={activeTab === "inheritance" ? "8 6" : "0"}
                />
              );
            })}
          </svg>

          {OOP_CLASSES.map((item) => {
            const isResolved = activeTab === "polymorphism" && resolvedClass === item.id;
            const isRuntime = activeTab === "polymorphism" && runtimeType === item.id;
            const isParent = activeTab === "inheritance" && item.id === "shape";

            return (
              <motion.div
                key={item.id}
                layout
                animate={{ scale: isResolved || isRuntime || isParent ? 1.02 : 1, y: activeTab === "inheritance" && item.parent ? [0, -4, 0] : 0 }}
                transition={{ duration: 0.45 }}
                className={`absolute rounded-2xl border p-4 shadow-xl ${
                  isResolved
                    ? "border-emerald-400 bg-emerald-500/10"
                    : isRuntime
                    ? "border-blue-400 bg-blue-500/10"
                    : isParent
                    ? "border-purple-400 bg-purple-500/10"
                    : "border-white/10 bg-gray-800/90"
                }`}
                style={{ left: item.x, top: item.y, width: BOX_WIDTH, height: BOX_HEIGHT, transform: "translate(-50%, -50%)" }}
              >
                <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ${item.accent}`}>
                  {item.name}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-300">
                  <div>
                    <p className="mb-1 uppercase tracking-[0.2em] text-gray-500">Properties</p>
                    <div className="space-y-1">
                      {item.properties.map((property) => (
                        <div key={property} className="rounded-md bg-gray-900/70 px-2 py-1">{property}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 uppercase tracking-[0.2em] text-gray-500">Methods</p>
                    <div className="space-y-1">
                      {item.methods.map((method) => {
                        const methodResolved = isResolved && method.id === selectedMethod;
                        return (
                          <button
                            key={method.id}
                            onClick={() => handleMethodClick(method.id)}
                            className={`block w-full rounded-md px-2 py-1 text-left transition ${
                              methodResolved
                                ? "bg-emerald-500/20 text-emerald-200"
                                : selectedMethod === method.id
                                ? "bg-purple-500/20 text-purple-200"
                                : "bg-gray-900/70 hover:bg-gray-900"
                            }`}
                          >
                            {method.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 text-sm text-gray-300 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-gray-800/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Classes</p>
          <p className="mt-2">A class groups properties with methods so a stack, heap, or node exposes a clean public interface.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Inheritance</p>
          <p className="mt-2">Child classes inherit the contract from Shape and add the extra state needed for their specialized implementation.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Polymorphism</p>
          <p className="mt-2">The runtime object decides whether Shape.area(), Circle.area(), or Rectangle.area() is executed.</p>
        </div>
      </div>
    </motion.div>
  );
}
