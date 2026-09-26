import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ModelRunner } from "@/components/ModelRunner";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { Navigation } from "@/components/Navigation";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [excludeMagazine, setExcludeMagazine] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setResults(null); // Clear previous results
  };

  const handleRunModel = async () => {
    if (!uploadedFile) return;

    setIsRunning(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('exclude_magazine_overviews', String(excludeMagazine));

      const response = await fetch(`${API_URL}/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned ${response.status}`);
      }

      const results = await response.json();
      setResults(results);

    } catch (error) {
      const message = error instanceof TypeError
        ? `Cannot reach the backend at ${API_URL}. Start it with: cd backend && python main.py`
        : error instanceof Error ? error.message : 'Unknown error';
      toast.error("Classification failed", { description: message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Classify publications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Separate survey/review papers from original research in a publication list and recompute the
            author's citation metrics without them.
          </p>
          <dl className="mt-4 grid gap-1 rounded-md border bg-card px-4 py-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <dt className="font-medium text-foreground">Required columns</dt>
            <dd className="text-muted-foreground">
              <code className="font-mono">title</code>, and a citation count (
              <code className="font-mono">n_citation</code>, <code className="font-mono">citations</code> or{" "}
              <code className="font-mono">citationCount</code>)
            </dd>
            <dt className="font-medium text-foreground">Recommended</dt>
            <dd className="text-muted-foreground">
              <code className="font-mono">abstract</code>, <code className="font-mono">venue</code> and{" "}
              <code className="font-mono">type</code>, which improve classification accuracy
            </dd>
          </dl>
        </div>

        <WorkflowSteps currentStep={uploadedFile ? (results ? 3 : 2) : 1} />

        <div className="mt-8 grid gap-6">
          <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />

          <ModelRunner
            disabled={!uploadedFile}
            isRunning={isRunning}
            onRun={handleRunModel}
            excludeMagazine={excludeMagazine}
            onExcludeMagazineChange={setExcludeMagazine}
          />

          <ResultsDisplay results={results} isRunning={isRunning} />
        </div>
      </div>
    </main>
  );
};

export default Index;
