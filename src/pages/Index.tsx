import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { ModelRunner } from "@/components/ModelRunner";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import type { ClassificationResult } from "@/lib/classification";

const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "")).replace(/\/$/, "");
const START_HINT = import.meta.env.DEV
  ? "Start it with: cd backend && python main.py"
  : "Check that your backend service is running and VITE_API_URL is configured in your hosting environment.";

type BackendStatus = { state: "checking" } | { state: "ready"; device: string } | { state: "offline" };

// FastAPI returns detail as a string, or as a list of validation errors
const errorMessage = (detail: unknown, status: number) => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? String(d)).join("; ");
  return `Server returned ${status}`;
};

const StatusIndicator = ({ status, onRetry }: { status: BackendStatus; onRetry: () => void }) => (
  <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full",
        status.state === "ready" && "bg-success",
        status.state === "offline" && "bg-destructive",
        status.state === "checking" && "animate-pulse bg-muted-foreground"
      )}
    />
    <span className="text-muted-foreground">
      {status.state === "ready" && <>Model ready on {status.device.startsWith("cuda") ? "GPU" : "CPU"}</>}
      {status.state === "checking" && "Connecting to backend"}
      {status.state === "offline" && "Backend offline"}
    </span>
    {status.state === "offline" && (
      <button onClick={onRetry} className="font-medium text-foreground underline-offset-4 hover:underline">
        Retry
      </button>
    )}
  </div>
);

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ClassificationResult | null>(null);
  const [runId, setRunId] = useState(0);
  const [excludeMagazine, setExcludeMagazine] = useState(false);
  const [status, setStatus] = useState<BackendStatus>({ state: "checking" });

  const checkHealth = useCallback(async () => {
    setStatus({ state: "checking" });
    try {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();
      setStatus(data.modelLoaded ? { state: "ready", device: String(data.device ?? "cpu") } : { state: "offline" });
    } catch {
      setStatus({ state: "offline" });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResults(null);
  };

  const handleRunModel = async () => {
    if (!uploadedFile) return;
    setIsRunning(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("exclude_magazine_overviews", String(excludeMagazine));

      const response = await fetch(`${API_URL}/classify`, { method: "POST", body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorMessage(errorData.detail, response.status));
      }

      setResults(await response.json());
      setRunId((id) => id + 1);
    } catch (error) {
      if (error instanceof TypeError) {
        setStatus({ state: "offline" });
        toast.error("Backend unreachable", { description: `No response from ${API_URL}. ${START_HINT}` });
      } else {
        toast.error("Classification failed", { description: error instanceof Error ? error.message : "Unknown error" });
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Classify publications</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Separate survey/review papers from original research in a publication list and recompute the author's
              citation metrics without them.
            </p>
          </div>
          <StatusIndicator status={status} onRetry={checkHealth} />
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="p-6">
              <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} disabled={isRunning} />
              <dl className="mt-4 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-[auto_1fr]">
                <dt className="font-medium text-foreground">Required</dt>
                <dd className="text-muted-foreground">
                  <code className="font-mono">title</code> and a citation count (
                  <code className="font-mono">n_citation</code>, <code className="font-mono">citations</code> or{" "}
                  <code className="font-mono">citationCount</code>)
                </dd>
                <dt className="font-medium text-foreground">Recommended</dt>
                <dd className="text-muted-foreground">
                  <code className="font-mono">abstract</code>, <code className="font-mono">venue</code> and{" "}
                  <code className="font-mono">type</code>, which improve accuracy
                </dd>
              </dl>
            </div>
            <div className="border-t bg-muted/30 px-6 py-4">
              <ModelRunner
                disabled={!uploadedFile}
                isRunning={isRunning}
                onRun={handleRunModel}
                excludeMagazine={excludeMagazine}
                onExcludeMagazineChange={setExcludeMagazine}
              />
            </div>
          </Card>

          <ResultsDisplay key={runId} results={results} isRunning={isRunning} excludeMagazine={excludeMagazine} />
        </div>
      </div>
    </main>
  );
};

export default Index;
