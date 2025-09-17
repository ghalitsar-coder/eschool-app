// FileUpload.tsx - Komponen untuk upload file bukti ketidakhadiran
import React, { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  initialValue?: string | null;
  disabled?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  initialValue = null,
  disabled = false,
  className
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      onFileSelect(null);
      setError(null);
      return;
    }

    // Validasi jenis file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('File type not allowed. Only PDF, JPG, JPEG, and PNG are allowed.');
      return;
    }

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    // Buat preview URL untuk gambar
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-muted-foreground" />;
    }
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  const getFileName = () => {
    if (file) return file.name;
    if (previewUrl) return "Existing Document";
    return "";
  };

  const getFileSize = () => {
    if (file) {
      const sizeInKB = file.size / 1024;
      if (sizeInKB > 1024) {
        return `${(sizeInKB / 1024).toFixed(2)} MB`;
      }
      return `${sizeInKB.toFixed(2)} KB`;
    }
    return "";
  };

  return (
    <div className={cn("w-full", className)}>
      {file || previewUrl ? (
        <Card className="border-2 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file?.type || "document")}
                <div>
                  <p className="font-medium text-sm">{getFileName()}</p>
                  <p className="text-xs text-muted-foreground">
                    {getFileSize()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {previewUrl && previewUrl.startsWith('blob:') && (
              <div className="mt-3">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-32 rounded-md object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, JPG, JPEG, PNG (Max 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Upload proof document for absent members (PDF, JPG, JPEG, PNG, Max 5MB)</p>
      </div>
    </div>
  );
};

export default FileUpload;