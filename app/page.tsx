'use client';

import { useState } from "react";
import {
  Sparkles,
  Cpu,
  Boxes,
  FileCode2,
  ShieldCheck,
  Download,
  Bot,
  Layers,
  Zap,
  Code2,
} from "lucide-react";

export default function Home() {
  const [idea, setIdea] = useState(
    "I want a smart irrigation system that measures soil moisture and turns on a pump."
  );
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  async function generate() {
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error(error);
      alert("Generation failed. Please check the API route.");
    } finally {
      setLoading(false);
    }
  }

  function exportJson() {
    if (!project) return;

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tectronix-flow-project.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#03110d] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-emerald-900/70 bg-black/20 p-6 lg:block">
          <div className="mb-10">
            <p className="text-sm font-bold text-yellow-400">TECTRONIX FLOW</p>
            <h2 className="mt-2 text-2xl font-black">AI Electronics OS</h2>
          </div>

          <div className="space-y-3">
            {[
              "AI Idea",
              "Functional Blocks",
              "Components",
              "Schematic",
              "BOM",
              "Firmware",
              "Validation",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100"
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <div className="mb-8 rounded-3xl border border-emerald-800/60 bg-gradient-to-br from-emerald-950/70 to-black p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
              <div>
                <p className="font-bold text-yellow-400">Beta Core Engine v1</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight lg:text-6xl">
                  Design Electronics with AI
                </h1>
                <p className="mt-4 max-w-3xl text-lg text-emerald-200">
                  Idea - Blocks - Components - Schematic - BOM - Firmware -
                  Validation
                </p>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
              >
                <Sparkles className="mr-2 inline" size={20} />
                {loading ? "Generating..." : "Generate Project"}
              </button>
            </div>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="mt-8 h-36 w-full resize-none rounded-3xl border border-emerald-700 bg-black/40 p-6 text-lg text-white outline-none focus:border-yellow-400"
            />
          </div>

          {!project ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <Feature
                icon={<Bot />}
                title="AI Engineering Agent"
                text="Transforms plain ideas into structured electronic system requirements."
              />
              <Feature
                icon={<Layers />}
                title="System Architecture"
                text="Generates functional blocks, components, and connection plans."
              />
              <Feature
                icon={<Zap />}
                title="Build-Ready Output"
                text="Creates BOM, firmware draft, validation notes, and exportable project data."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card
                  title="Functional Blocks"
                  icon={<Cpu />}
                  items={project.blocks?.map(
                    (b: any) => b.label || b.type || b.id
                  )}
                />
                <Card
                  title="Components"
                  icon={<Boxes />}
                  items={project.components?.map((c: any) => c.name)}
                />
                <Card
                  title="Validation"
                  icon={<ShieldCheck />}
                  items={project.warnings?.map(
                    (w: any) => `${w.severity}: ${w.message}`
                  )}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Schematic Connections">
                  {project.schematic?.map((s: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-emerald-950/50 p-4"
                    >
                      <b>{s.from}</b> -&gt; <b>{s.to}</b>
                      <p className="mt-1 text-sm text-emerald-200/70">
                        {s.signal}: {s.notes}
                      </p>
                    </div>
                  ))}
                </Panel>

                <Panel title="BOM">
                  {project.bom?.map((b: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between rounded-2xl bg-emerald-950/50 p-4"
                    >
                      <span>{b.item}</span>
                      <span>
                        {b.qty} x {b.estimatedPriceSar} SAR
                      </span>
                    </div>
                  ))}
                </Panel>
              </div>

              <Panel title="Firmware Draft">
                <pre className="max-h-96 overflow-auto rounded-2xl bg-black/60 p-5 text-sm text-emerald-200">
                  <code>{project.firmware?.code}</code>
                </pre>
              </Panel>

              <button
                onClick={exportJson}
                className="rounded-2xl border border-yellow-400 px-6 py-3 font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
              >
                <Download className="mr-2 inline" size={18} />
                Export JSON
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-emerald-800/60 bg-black/25 p-6">
      <div className="mb-4 text-yellow-300">{icon}</div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-emerald-200/80">{text}</p>
    </div>
  );
}

function Card({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items?: string[];
}) {
  return (
    <div className="rounded-3xl border border-emerald-700 bg-black/25 p-6">
      <div className="mb-4 flex items-center gap-3 text-yellow-300">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {(items || []).map((item, i) => (
          <div
            key={i}
            className="rounded-2xl bg-emerald-950/60 p-4 text-emerald-100"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-emerald-700 bg-black/25 p-6">
      <div className="mb-4 flex items-center gap-3">
        <Code2 className="text-yellow-300" size={20} />
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}