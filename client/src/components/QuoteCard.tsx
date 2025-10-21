import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuoteCardProps {
  text: string;
  author: string;
}

export function QuoteCard({ text, author }: QuoteCardProps) {
  return (
    <Card 
      className="p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--accent) / 0.1) 100%)`,
      }}
      data-testid="card-motivational-quote"
    >
      <Quote 
        className="absolute top-4 right-4 w-16 h-16 opacity-10"
        style={{ color: "hsl(var(--primary))" }}
      />
      <div className="relative space-y-4">
        <p 
          className="text-2xl font-light italic leading-relaxed"
          data-testid="text-quote-content"
        >
          "{text}"
        </p>
        <p 
          className="text-sm font-medium opacity-80"
          data-testid="text-quote-author"
        >
          — {author}
        </p>
      </div>
    </Card>
  );
}
