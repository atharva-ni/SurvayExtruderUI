import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

// Windows often reports CSVs as application/vnd.ms-excel, so check the extension too
const isCsv = (file: File) => file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export const FileUpload = ({ onFileUpload, uploadedFile }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!isCsv(file)) {
      toast.error("Unsupported file type", { description: "Select a CSV file." });
      return;
    }
    onFileUpload(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    accept(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    accept(event.dataTransfer.files[0]);
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">1. Upload publication list</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          CSV with a <code className="font-mono text-foreground">title</code> column and a citation count column.
        </p>
      </div>

      {!uploadedFile ? (
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "flex cursor-pointer flex-col items-center rounded-md border border-dashed px-6 py-10 text-center transition-colors",
            isDragging ? "border-primary bg-secondary" : "border-input bg-muted/50 hover:border-primary"
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && fileInputRef.current?.click()}
        >
          <Upload className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Drag a CSV file here, or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">Maximum file size 50 MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(uploadedFile.size)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Replace file
          </Button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
    </Card>
  );
};
