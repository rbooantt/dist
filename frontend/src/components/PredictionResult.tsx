import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PredictionResultProps {
  label: string;
  score: number;
  description: string;
  rank: number;
}

export const PredictionResult = ({ label, score, description, rank }: PredictionResultProps) => {
  const percentage = Math.round(score * 100);
  const descriptionLines = description.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  return (
    <Card className="p-6 shadow-elegant bg-gradient-to-br from-card to-card/50">
      <div className="flex items-start gap-4">

        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-primary text-xl">{rank}</span>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Resultado #{rank}
            </h3>
            <p className="text-2xl font-bold text-foreground">{label}</p>
          </div>

          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {descriptionLines.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confianza</span>
              <span className="font-semibold text-primary">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  );
};

