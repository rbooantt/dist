import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Sparkles, Dog, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/dog-hero.jpg";
import { DOG_DESCRIPTIONS } from "@/lib/DogDescriptions";
import classNamesRaw from "@/lib/class_names.json";
import { DOG_IMAGES } from "../DogImages";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [predictions, setPredictions] = useState<
    { label: string; score: number; description: string; imageUrl: string; rank: number }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const normalizedClassNames = classNamesRaw.map((name) =>
    name.trim().replace(/-/g, "_").replace(/\s+/g, "_").toLowerCase()
  );

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPredictions([]); // limpiar predicciones anteriores
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setPredictions([]);
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL?.trim() ||
        window.location.origin.replace(/\/$/, "");

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error en la predicción");

      const data = await response.json();
      console.log("Predicciones recibidas:", data);

      const formatted = (data.predictions || []).map((p: any, idx: number) => {
        let classKey = String(p.label || "")
          .trim()
          .replace(/-/g, "_")
          .replace(/\s+/g, "_")
          .toLowerCase();

        const FIX_CLASS_NAMES: Record<string, string> = { shi: "shih_tzu" };
        if (FIX_CLASS_NAMES[classKey]) classKey = FIX_CLASS_NAMES[classKey];

        return {
          label: classKey,
          score: Number(p.score) || 0,
          description: DOG_DESCRIPTIONS[classKey] || "Descripción no disponible",
          imageUrl: DOG_IMAGES[classKey] || "",
          rank: idx + 1,
        };
      });

      setPredictions(formatted);

      toast({
        title: "¡Clasificación completada!",
        description: `Se generaron ${formatted.length} predicciones.`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error en la clasificación",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PredictionSection = () => {
    const [expandedPrediction, setExpandedPrediction] = useState<number | null>(null);

    return (
      <div className="space-y-6 mt-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Top 3 Predicciones
        </h2>

        <div className="flex flex-row gap-4 overflow-x-auto justify-center">
          {predictions.map((p) => {
            const isExpanded = expandedPrediction === p.rank;
            const isCollapsed = expandedPrediction !== null && !isExpanded;

            const containerClass = `
              flex-shrink-0 transition-all duration-300 ease-in-out rounded-xl
              bg-card border hover:shadow-lg cursor-pointer
              p-4 flex flex-col items-center
              ${isExpanded ? "w-100" : "w-70"}
              ${isCollapsed ? "opacity-30 scale-75" : "scale-100"}
            `;
            const imageClass = isExpanded ? "w-80 h-80" : "w-60 h-60";
            const percentage = Math.round(p.score * 100);

            return (
              <div
                key={p.rank}
                className={containerClass}
                onClick={() => setExpandedPrediction(isExpanded ? null : p.rank)}
              >
                {/* Número identificador de la predicción */}
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-1">
                  #{p.rank}
                </h3>
                <div className="flex flex-col items-center">
                  {/* Nombre y confianza */}
                  <h3 className="text-xl md:text-2xl font-semibold capitalize text-center mb-2">
                    {p.label.replace(/_/g, " ")}
                  </h3>
                  <div className="text-sm md:text-base font-medium text-primary mb-3">
                    Score: {percentage}%
                  </div>

                  {/* Imagen */}
                  <div className="flex justify-center mb-3">
                    <img
                      src={p.imageUrl}
                      alt={p.label}
                      className={`rounded-lg object-cover shadow-md ${imageClass}`}
                    />
                  </div>

                  {/* Icono desplegable */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white mt-3 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>

                  {/* Descripción */}
                  {isExpanded && (
                    <div className="mt-4 px-4 w-full max-h-64 overflow-y-auto text-muted-foreground">
                     <p className="font-semibold mb-2 text-xl text-center">Descripción</p>
                     <ul className="list-disc list-inside text-left space-y-1 break-words">
                       {p.description.split("\n").map((line, idx) => (
                         <li key={idx}>{line}</li>
                       ))}
                     </ul>
                   </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <Button onClick={handleClear} variant="outline" size="lg">
            Clasificar otra imagen
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Perros"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative container mx-auto px-4 py-16 text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">IA de Clasificación</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-slide-up">
            Clasificador de Perros
          </h1>

          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto animate-fade-in">
            Sube una imagen y descubre la raza de tu perro con inteligencia
            artificial
          </p>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-12 max-w-8xl">
        <div className="bg-card rounded-2xl shadow-elegant p-6 md:p-8 space-y-8 animate-scale-in">
          {/* UPLOAD */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dog className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Sube tu imagen</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona una foto clara del perro
                </p>
              </div>
            </div>

            <ImageUploader
              onImageSelect={handleImageSelect}
              selectedImage={previewUrl}
              onClear={handleClear}
            />
          </div>

          {/* BOTÓN DE PREDICCIÓN */}
          {previewUrl && predictions.length === 0 && (
            <Button
              onClick={handlePredict}
              disabled={isLoading}
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg font-semibold shadow-glow"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Clasificar Imagen
                </>
              )}
            </Button>
          )}

          {/* SECCIÓN DE PREDICCIONES */}
          {predictions.length > 0 && <PredictionSection />}

          {/* INFO CARDS */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "🎯", title: "Precisión Alta", description: "Modelo entrenado con miles de imágenes" },
              { icon: "⚡", title: "Rápido", description: "Resultados en segundos" },
              { icon: "🔒", title: "Privado", description: "Tus imágenes no se almacenan" },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 text-center shadow-elegant hover:shadow-glow transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
