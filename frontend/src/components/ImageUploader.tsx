import { useState, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUploader = ({ onImageSelect, selectedImage, onClear }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? "border-primary bg-primary/5 scale-105" 
              : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-1">
                Arrastra una imagen aquí
              </p>
              <p className="text-sm text-muted-foreground">
                o haz clic para seleccionar un archivo
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG o WEBP (max. 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden shadow-elegant animate-scale-in">
          <img 
            src={selectedImage} 
            alt="Imagen seleccionada" 
            className="w-full h-auto max-h-96 object-contain bg-card"
          />
          <Button
            onClick={onClear}
            variant="destructive"
            size="icon"
            className="absolute top-4 right-4 rounded-full shadow-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
