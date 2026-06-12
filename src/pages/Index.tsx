import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ModelRunner } from "@/components/ModelRunner";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

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
      
      const response = await fetch('http://localhost:8000/classify', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process file');
      }
      
      const results = await response.json();
      setResults(results);
      
    } catch (error) {
      // Error processing file
      alert(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Academic Paper Classification System — SurvayExtruderU
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Professional AI-powered system for identifying and filtering survey papers from academic datasets using advanced machine learning techniques.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <span className="text-sm text-blue-800">
              <strong>Required CSV format:</strong> title, abstract, n_citation
            </span>
          </div>
        </div>

        <WorkflowSteps 
          currentStep={uploadedFile ? (results ? 3 : 2) : 1}
        />

        <div className="grid gap-6 max-w-4xl mx-auto mt-8">
          <FileUpload 
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
          />

          <ModelRunner 
            disabled={!uploadedFile}
            isRunning={isRunning}
            onRun={handleRunModel}
          />

          <ResultsDisplay 
            results={results}
            isRunning={isRunning}
          />
        </div>
      </div>
    </main>
  );
};

export default Index;