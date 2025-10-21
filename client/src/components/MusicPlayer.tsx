import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { musicGenres } from "@/lib/themes";

interface MusicPlayerProps {
  isPlaying: boolean;
  genre: string;
  volume: number;
  onPlayPause: () => void;
  onGenreChange: (genre: string) => void;
  onVolumeChange: (volume: number) => void;
}

export function MusicPlayer({
  isPlaying,
  genre,
  volume,
  onPlayPause,
  onGenreChange,
  onVolumeChange,
}: MusicPlayerProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" data-testid="text-music-title">Background Music</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onPlayPause}
          className="h-10 w-10"
          data-testid="button-music-toggle"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
          <Select value={genre} onValueChange={onGenreChange}>
            <SelectTrigger data-testid="select-music-genre">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {musicGenres.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Volume</label>
            <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={([value]) => onVolumeChange(value / 100)}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-music-volume"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
