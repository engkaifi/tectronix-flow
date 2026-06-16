'use client';

import { useState } from "react";
import { Sparkles, Cpu, Boxes, FileCode2, ShieldCheck, Download } from "lucide-react";

export default function Home() {
  const [idea, setIdea] = useState("I want a smart irrigation system that measures soil moisture and turns on a pump.");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    const data = await res.json();
    setProject(data);
    setLoading(false);
  }

  function exportJson() {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tectronix-flow-project.json";
    a.click();
  }

  return (
    <main className="min-h-screen bg-[#04110d] text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-emerald-900 p-8">
          <h2 className="text-2xl font-bold">Workspace</h2>
          <div className="mt-8 space-y-4">
            {["AI Idea", "Functional Blocks", "Components", "Schematic", "BOM", "Firmware", "Validation"].map((x) => (
              <div key={x} className="rounded-xl bg-emerald-950/60 p-4">{x}</div>
            ))}
          </div>
        </aside>

        <section className="flex-1 p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-bold text-yellow-400">Beta Core Engine v1</p>
              <h1 className="mt-2 text-6xl font-black">Design Electronics with AI</h1>
              <p className="mt-4 text-emerald-300">Idea → Blocks → Components → Schematic → BOM → Firmware → Validation</p>
            </div>

            <button onClick={generate} disabled={loading} className="rounded-2xl bg-yellow-400 px-8 py-4 text-xl font-bold text-black">
              <Sparkles className="mr-2 inline" size={20} />
              {loading ? "Generating..." : "Generate Project"}
            </button>
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="mt-8 h-36 w-full rounded-3xl border border-emerald-700 bg-black/30 p-6 text-lg outline-none"
          />

          {!project ? (
            <div className="mt-8 flex h-96 items-center justify-center rounded-3xl border border-dashed border-emerald-800 text-emerald-300">
              Click Generate Project
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card title="Functional Blocks" icon={<Cpu />} items={project.blocks?.map((b: any) => b.label || b.type || b.id)} />
                <Card title="Components" icon={<Boxes />} items={project.components?.map((c: any) => c.name)} />
                <Card title="Validation" icon={<ShieldCheck />} items={project.warnings?.map((w: any) => `${w.severity}: ${w.message}`)} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Schematic Connections">
                  {project.schematic?.map((s: any, i: number) => (
                    <div key={i} className="rounded-2xl bg-emerald-950/50 p-4">
                      <b>{s.from}</b> → <b>{s.to}</b>
                      <p className="mt-1 text-sm text-emerald-200/70">{s.signal}: {s.notes}</p>
                    </div>
                  ))}
                </Panel>

                <Panel title="BOM">
                  {project.bom?.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between rounded-2xl bg-emerald-950/50 p-4">
                      <span>{b.item}</span>
                      <span>{b.qty} × {b.estimatedPriceSar} SAR</span>
                    </div>
                  ))}
                </Panel>
              </div>

              <Panel title="Firmware Draft">
                <pre className="max-h-96 overflow-auto rounded-2xl bg-black/50 p-5 text-sm text-emerald-200">
                  <code>{project.firmware?.code}</code>
                </pre>
              </Panel>

              <button onClick={exportJson} className="rounded-2xl border border-yellow-400 px-6 py-3 font-bold text-yellow-300">
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

function Card({ title, icon, items }: any) {
  return (
    <div className="rounded-3xl border border-emerald-700 bg-black/25 p-6">
      <div className="mb-4 flex items-center gap-3 text-yellow-300">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {(items || []).map((item: string, i: number) => (
          <div key={i} className="rounded-2xl bg-emerald-950/60 p-4 text-emerald-100">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, children }: any) {
  return (
    <div className="rounded-3xl border border-emerald-700 bg-black/25 p-6">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}