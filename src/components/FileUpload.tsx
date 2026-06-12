import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

export const FileUpload = ({ onFileUpload, uploadedFile }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      onFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      onFileUpload(file);
    }
  };

  return (
    <Card className="p-6 border border-gray-200 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Step 1: Upload Dataset
        </h2>
        <p className="text-gray-600">
          Upload a CSV file containing academic papers with title, abstract, and citation data
        </p>
      </div>

      {!uploadedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-base font-medium text-gray-900 mb-2">
            Drop your dataset here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            CSV format with columns: <strong>title</strong>, <strong>abstract</strong>, <strong>n_citation</strong>
          </p>
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Choose File
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <File className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              {uploadedFile.name}
            </span>
          </div>
          <p className="text-sm text-green-600 mb-4">
            File size: {(uploadedFile.size / 1024).toFixed(2)} KB
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Different File
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </Card>
  );
};