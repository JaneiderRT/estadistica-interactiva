import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { PlusCircle, Trash2, BarChart3, Calculator, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── Statistics helpers ───────────────────────────────────────────────────────
function calcMedia(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function calcMediana(data: number[]): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcModa(data: number[]): number[] | null {
  if (data.length === 0) return null;
  const freq: Record<number, number> = {};
  data.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
  const maxFreq = Math.max(...Object.values(freq));
  if (maxFreq === 1) return null; // amodal
  return Object.entries(freq)
    .filter(([, f]) => f === maxFreq)
    .map(([v]) => parseFloat(v));
}

function calcRango(data: number[]): number {
  if (data.length === 0) return 0;
  return Math.max(...data) - Math.min(...data);
}

function calcProbabilidad(data: number[], threshold: number, operator: ">" | ">=" | "<" | "<=" | "="): number {
  if (data.length === 0) return 0;
  let count = 0;
  data.forEach((v) => {
    if (operator === ">" && v > threshold) count++;
    else if (operator === ">=" && v >= threshold) count++;
    else if (operator === "<" && v < threshold) count++;
    else if (operator === "<=" && v <= threshold) count++;
    else if (operator === "=" && v === threshold) count++;
  });
  return count / data.length;
}

// ─── Result Card ─────────────────────────────────────────────────────────────
function ResultCard({
  label,
  value,
  color,
  description,
}: {
  label: string;
  value: string;
  color: string;
  description: string;
}) {
  return (
    <div className={`rounded-xl border-2 ${color} p-4 flex flex-col gap-1 shadow-sm`}>
      <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-3xl font-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {value}
      </span>
      <span className="text-xs opacity-60 leading-snug">{description}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [sample, setSample] = useState<number[]>([]);
  const [probThreshold, setProbThreshold] = useState("");
  const [probOperator, setProbOperator] = useState<">" | ">=" | "<" | "<=" | "=">(">");

  const handleAdd = () => {
    const val = parseFloat(inputValue.replace(",", "."));
    if (isNaN(val)) {
      toast.error("Por favor ingresa un número válido.");
      return;
    }
    setSample((prev) => [...prev, val]);
    setInputValue("");
  };

  const handleRemove = (index: number) => {
    setSample((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setSample([]);
    toast.info("Muestra borrada.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const stats = useMemo(() => {
    if (sample.length === 0) return null;
    const sorted = [...sample].sort((a, b) => a - b);
    const media = calcMedia(sample);
    const mediana = calcMediana(sample);
    const moda = calcModa(sample);
    const rango = calcRango(sample);
    const threshold = parseFloat(probThreshold.replace(",", "."));
    const prob = !isNaN(threshold) ? calcProbabilidad(sample, threshold, probOperator) : null;
    return { media, mediana, moda, rango, sorted, prob };
  }, [sample, probThreshold, probOperator]);

  const chartData = useMemo(() => {
    return sample.map((v, i) => ({ name: `D${i + 1}`, valor: v }));
  }, [sample]);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 290)" }}>
      {/* ── Header ── */}
      <header className="w-full py-6 px-4 flex items-center gap-3 border-b border-border bg-white/80 backdrop-blur sticky top-0 z-20 shadow-sm">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-xl shadow"
          style={{ background: "oklch(0.45 0.22 290)", fontFamily: "'Montserrat', sans-serif" }}
        >
          σ
        </div>
        <div>
          <h1 className="text-xl font-black leading-none" style={{ fontFamily: "'Montserrat', sans-serif", color: "oklch(0.45 0.22 290)" }}>
            Calculadora Estadística
          </h1>
          <p className="text-xs text-muted-foreground">Grado 9° · Matemáticas</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {sample.length} dato{sample.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* ── Input Section ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5" style={{ color: "oklch(0.45 0.22 290)" }} />
            <h2 className="font-black text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Ingresar datos de la muestra
            </h2>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 4.5"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="max-w-[180px] text-lg font-bold border-2"
              style={{ borderColor: "oklch(0.45 0.22 290)" }}
            />
            <Button
              onClick={handleAdd}
              className="font-bold text-white"
              style={{ background: "oklch(0.45 0.22 290)" }}
            >
              Agregar valor
            </Button>
            {sample.length > 0 && (
              <Button variant="outline" onClick={handleClear} className="font-bold text-destructive border-destructive/40">
                <Trash2 className="w-4 h-4 mr-1" /> Limpiar todo
              </Button>
            )}
          </div>

          {/* Sample chips */}
          {sample.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {sample.map((v, i) => (
                <button
                  key={i}
                  onClick={() => handleRemove(i)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "oklch(0.94 0.04 290)",
                    borderColor: "oklch(0.45 0.22 290)",
                    color: "oklch(0.35 0.15 290)",
                  }}
                  title="Clic para eliminar"
                >
                  {v}
                  <span className="opacity-50 text-xs">✕</span>
                </button>
              ))}
            </div>
          )}

          {sample.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground italic">
              Aún no hay datos. Agrega valores para comenzar el análisis.
            </p>
          )}
        </section>

        {/* ── Results Section ── */}
        {stats && (
          <>
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5" style={{ color: "oklch(0.45 0.22 290)" }} />
                <h2 className="font-black text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Resultados estadísticos
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ResultCard
                  label="Media (Promedio)"
                  value={stats.media.toFixed(2)}
                  color="border-purple-400 bg-purple-50 text-purple-900"
                  description="Suma de todos los datos dividida entre la cantidad."
                />
                <ResultCard
                  label="Mediana"
                  value={stats.mediana.toFixed(2)}
                  color="border-green-400 bg-green-50 text-green-900"
                  description="Valor central de los datos ordenados."
                />
                <ResultCard
                  label="Moda"
                  value={stats.moda ? stats.moda.join(", ") : "Sin moda"}
                  color="border-amber-400 bg-amber-50 text-amber-900"
                  description={stats.moda ? "Dato(s) que más se repiten." : "Todos los valores son únicos (amodal)."}
                />
                <ResultCard
                  label="Rango"
                  value={stats.rango.toFixed(2)}
                  color="border-rose-400 bg-rose-50 text-rose-900"
                  description="Diferencia entre el valor máximo y el mínimo."
                />
              </div>
            </section>

            {/* Datos ordenados */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                Datos ordenados de menor a mayor
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.sorted.map((v, i) => {
                  const mid = stats.sorted.length / 2;
                  const isMedian =
                    stats.sorted.length % 2 === 0
                      ? i === Math.floor(mid) - 1 || i === Math.floor(mid)
                      : i === Math.floor(mid);
                  return (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm font-bold border-2 transition-transform"
                      style={
                        isMedian
                          ? {
                              background: "oklch(0.55 0.2 145)",
                              borderColor: "oklch(0.35 0.2 145)",
                              color: "white",
                              transform: "scale(1.1)",
                            }
                          : {
                              background: "oklch(0.94 0.04 290)",
                              borderColor: "oklch(0.75 0.1 290)",
                              color: "oklch(0.35 0.15 290)",
                            }
                      }
                    >
                      {v}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Los valores resaltados en verde corresponden al cálculo de la mediana.
              </p>
            </section>

            {/* Chart */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5" style={{ color: "oklch(0.45 0.22 290)" }} />
                <h3 className="font-bold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Gráfico de barras
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.04 290)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v}`, "Valor"]}
                    contentStyle={{ borderRadius: "8px", border: "2px solid oklch(0.45 0.22 290)" }}
                  />
                  <Bar dataKey="valor" fill="oklch(0.55 0.2 290)" radius={[6, 6, 0, 0]} />
                  <ReferenceLine
                    y={stats.media}
                    stroke="oklch(0.55 0.2 145)"
                    strokeDasharray="5 3"
                    strokeWidth={2}
                    label={{ value: `Media: ${stats.media.toFixed(2)}`, fill: "oklch(0.35 0.2 145)", fontSize: 12, position: "insideTopRight" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* Probability */}
            <section className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5" style={{ color: "oklch(0.45 0.22 290)" }} />
                <h3 className="font-bold text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Calcular probabilidad
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Cuál es la probabilidad de que un valor seleccionado al azar cumpla una condición?
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-bold">P(X</span>
                <select
                  value={probOperator}
                  onChange={(e) => setProbOperator(e.target.value as typeof probOperator)}
                  className="border-2 rounded-lg px-2 py-1 text-sm font-bold"
                  style={{ borderColor: "oklch(0.45 0.22 290)", color: "oklch(0.35 0.15 290)" }}
                >
                  <option value=">">{">"}</option>
                  <option value=">=">{">="}</option>
                  <option value="<">{"<"}</option>
                  <option value="<=">{"<="}</option>
                  <option value="=">{"="}</option>
                </select>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Umbral"
                  value={probThreshold}
                  onChange={(e) => setProbThreshold(e.target.value)}
                  className="max-w-[120px] font-bold border-2"
                  style={{ borderColor: "oklch(0.45 0.22 290)" }}
                />
                <span className="text-sm font-bold">)</span>
              </div>

              {stats.prob !== null && (
                <div className="mt-4 flex flex-wrap gap-4 items-center">
                  <div
                    className="rounded-xl border-2 p-4 text-center min-w-[140px]"
                    style={{ borderColor: "oklch(0.45 0.22 290)", background: "oklch(0.94 0.04 290)" }}
                  >
                    <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Probabilidad</div>
                    <div
                      className="text-4xl font-black"
                      style={{ fontFamily: "'Montserrat', sans-serif", color: "oklch(0.45 0.22 290)" }}
                    >
                      {(stats.prob * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs opacity-60 mt-1">
                      {stats.prob === 0
                        ? "Ningún dato cumple la condición."
                        : stats.prob === 1
                        ? "Todos los datos cumplen la condición."
                        : `${Math.round(stats.prob * sample.length)} de ${sample.length} datos`}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground max-w-xs">
                    <strong>Fórmula:</strong> P = casos favorables ÷ espacio muestral
                    <br />
                    <strong>Cálculo:</strong> P = {Math.round(stats.prob * sample.length)} ÷ {sample.length} = {stats.prob.toFixed(4)}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Empty state ── */}
        {sample.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-muted-foreground">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg"
              style={{ background: "oklch(0.94 0.04 290)", color: "oklch(0.45 0.22 290)", fontFamily: "'Montserrat', sans-serif" }}
            >
              σ
            </div>
            <p className="text-lg font-bold" style={{ color: "oklch(0.45 0.22 290)" }}>
              Agrega datos para comenzar
            </p>
            <p className="text-sm max-w-sm">
              Escribe un número en el campo de arriba y presiona <strong>Agregar valor</strong> o la tecla <strong>Enter</strong>.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border mt-4">
        Calculadora Estadística Interactiva · Grado 9° · Matemáticas
      </footer>
    </div>
  );
}
