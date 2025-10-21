import { Theme } from "../../../server/db/schema";

export interface ThemeConfig {
  name: string;
  primary: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  chartColors: string[];
}

export const themeConfigs: Record<Theme, ThemeConfig> = {
  purple: {
    name: "Deep Focus",
    primary: "270 65% 55%",
    accent: "280 70% 65%",
    gradientFrom: "270 40% 12%",
    gradientTo: "270 30% 8%",
    chartColors: ["270 65% 55%", "280 70% 60%", "260 60% 50%", "275 68% 58%", "265 62% 52%"],
  },
  blue: {
    name: "Ocean Calm",
    primary: "210 80% 50%",
    accent: "200 75% 55%",
    gradientFrom: "210 50% 10%",
    gradientTo: "220 40% 6%",
    chartColors: ["210 80% 50%", "200 75% 55%", "220 70% 48%", "205 78% 52%", "215 76% 54%"],
  },
  green: {
    name: "Forest Zen",
    primary: "150 60% 45%",
    accent: "140 70% 50%",
    gradientFrom: "150 35% 12%",
    gradientTo: "155 30% 8%",
    chartColors: ["150 60% 45%", "140 70% 50%", "160 55% 42%", "145 65% 48%", "155 58% 46%"],
  },
  pink: {
    name: "Creative Flow",
    primary: "330 70% 55%",
    accent: "340 75% 60%",
    gradientFrom: "330 45% 12%",
    gradientTo: "335 35% 8%",
    chartColors: ["330 70% 55%", "340 75% 60%", "320 65% 52%", "335 72% 58%", "325 68% 54%"],
  },
  orange: {
    name: "Energized",
    primary: "25 85% 55%",
    accent: "15 80% 60%",
    gradientFrom: "25 50% 12%",
    gradientTo: "30 45% 8%",
    chartColors: ["25 85% 55%", "15 80% 60%", "30 82% 58%", "20 83% 56%", "28 84% 57%"],
  },
};

export const motivationalQuotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Productivity is never an accident. It is always the result of a commitment to excellence.",
    author: "Paul J. Meyer",
  },
  {
    text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.",
    author: "Stephen King",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
];

export const musicGenres = [
  { value: "lofi", label: "Lo-Fi Beats" },
  { value: "nature", label: "Nature Sounds" },
  { value: "ambient", label: "Ambient Music" },
  { value: "focus", label: "Focus Beats" },
];
