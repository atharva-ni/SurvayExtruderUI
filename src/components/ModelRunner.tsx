import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

interface ModelRunnerProps {
  disabled: boolean;
  isRunning: boolean;
  onRun: () => void;
}

export const ModelRunner = ({ disabled, isRunning, onRun }: ModelRunnerProps) => {
  return (
    <Card className="p-6 border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Step 2: Run Classification
        </h2>
        <p className="text-gray-600">
          Execute AI model to identify and filter survey papers from your dataset
        </p>
      </div>

      <div className="text-center">
        <Button
          onClick={onRun}
          disabled={disabled || isRunning}
          size="lg"
          className="px-6 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Classify Papers
            </>
          )}
        </Button>
        
        {disabled && !isRunning && (
          <p className="text-sm text-gray-500 mt-4">
            Please upload a CSV file first
          </p>
        )}
        
        {isRunning && (
          <p className="text-sm text-gray-600 mt-4">
            Running classification analysis... This may take a few moments
          </p>
        )}
      </div>
    </Card>
  );
};