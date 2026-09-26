import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ModelRunnerProps {
  disabled: boolean;
  isRunning: boolean;
  onRun: () => void;
  excludeMagazine: boolean;
  onExcludeMagazineChange: (value: boolean) => void;
}

export const ModelRunner = ({
  disabled,
  isRunning,
  onRun,
  excludeMagazine,
  onExcludeMagazineChange,
}: ModelRunnerProps) => {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">2. Classify</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Label each paper as survey/review, non-paper, magazine overview or research.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border px-4 py-3">
        <Switch
          id="exclude-magazine"
          checked={excludeMagazine}
          onCheckedChange={onExcludeMagazineChange}
          disabled={isRunning}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="exclude-magazine" className="text-sm font-medium text-foreground">
            Exclude magazine overviews
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Magazine articles (for example, IEEE Communications Magazine) that the model flags but that do not
            describe themselves as surveys. Kept by default.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Button onClick={onRun} disabled={disabled || isRunning}>
          {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRunning ? "Classifying" : "Run classification"}
        </Button>
        {disabled && !isRunning && <p className="text-sm text-muted-foreground">Upload a CSV file first.</p>}
        {isRunning && <p className="text-sm text-muted-foreground">This can take a minute for large files.</p>}
      </div>
    </Card>
  );
};
