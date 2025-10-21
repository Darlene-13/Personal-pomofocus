# Pomodoro Productivity App - Design Guidelines

## Design Approach

**Hybrid System-Reference Approach**: Drawing from productivity leaders (Notion, Linear, Todoist) with Material Design foundations for comprehensive component libraries, enhanced with rich visual theming and gradient aesthetics.

**Core Principle**: Create a calming, distraction-free environment that motivates sustained focus while providing visual delight through thoughtful theming.

---

## Theme Architecture

### Five Complete Theme Systems

Each theme is a comprehensive design system affecting all app elements:

**Purple Theme** - "Deep Focus"
- Primary: 270 65% 55%
- Background gradient: 270 40% 12% to 270 30% 8%
- Accent: 280 70% 65%
- Chart colors: Purple spectrum (270 variations)

**Blue Theme** - "Ocean Calm"
- Primary: 210 80% 50%
- Background gradient: 210 50% 10% to 220 40% 6%
- Accent: 200 75% 55%
- Chart colors: Blue spectrum (210 variations)

**Green Theme** - "Forest Zen"
- Primary: 150 60% 45%
- Background gradient: 150 35% 12% to 155 30% 8%
- Accent: 140 70% 50%
- Chart colors: Green spectrum (150 variations)

**Pink Theme** - "Creative Flow"
- Primary: 330 70% 55%
- Background gradient: 330 45% 12% to 335 35% 8%
- Accent: 340 75% 60%
- Chart colors: Pink spectrum (330 variations)

**Orange Theme** - "Energized"
- Primary: 25 85% 55%
- Background gradient: 25 50% 12% to 30 45% 8%
- Accent: 15 80% 60%
- Chart colors: Orange spectrum (25 variations)

### Theme Components
- Background images: Subtle abstract patterns or minimal geometric designs relevant to theme color (low opacity overlays on gradients)
- All buttons, progress bars, charts adapt to theme primary colors
- Quote cards use theme-specific gradients
- Active states and highlights use accent colors

---

## Layout System

### Three-Section Responsive Grid

**Desktop (lg:)**: `grid grid-cols-[280px_1fr_320px]`
- Left sidebar: Quick stats, session counter, current task highlight
- Main content: Timer/Tasks/Analytics (based on active tab)
- Right sidebar: Motivational quote card, music player

**Tablet (md:)**: `grid grid-cols-[240px_1fr]`
- Collapse right sidebar into main content below primary interface

**Mobile**: Single column stack
- Header → Timer/Content → Sidebar elements below

### Spacing System
Consistent spacing: `2, 4, 6, 8, 12, 16` (Tailwind units)
- Component padding: `p-6` to `p-8`
- Section spacing: `space-y-6` or `gap-6`
- Card margins: `mb-6` or `mb-8`

---

## Typography

**Font Stack**:
- Primary: Inter (Google Fonts) - UI elements, body text
- Accent: Outfit (Google Fonts) - Timer display, headings, quotes

**Scale**:
- Timer display: `text-8xl font-bold` (96px)
- Page headings: `text-3xl font-semibold` (30px)
- Section headers: `text-xl font-medium` (20px)
- Body text: `text-base` (16px)
- Labels/captions: `text-sm` (14px)

---

## Core Components

### Timer Interface
- Circular progress indicator (SVG) surrounding timer display
- Large countdown: Bold Outfit font, theme primary color
- Status badge: "Focus Time" / "Break Time" with icon, rounded-full pill shape
- Control buttons: Play/Pause (primary), Reset (outline) - generous sizing (h-12 w-12 rounded-full)
- Progress ring animates smoothly as time decreases

### Task Management
- Input field: Dark background with subtle border, focus ring in theme color
- Task cards: `bg-white/5` with `backdrop-blur-sm`, hover lift effect
- Checkboxes: Custom styled, circular, green check animation on complete
- Completed tasks: `line-through opacity-60`, shifted background color
- Delete button: Trash icon, appears on hover, red accent

### Motivational Quote Cards
- Gradient background using theme colors: `bg-gradient-to-br from-[theme-primary] to-[theme-accent]`
- Large quote text: `text-2xl font-light italic`
- Attribution: `text-sm opacity-80`
- Decorative quotation mark icon in background
- Auto-rotate animation: Fade transition between quotes

### Music Player
- Compact card design with rounded corners
- Genre dropdown: Custom styled select with theme accent
- Playback controls: Play/pause, volume slider
- Now playing indicator: Subtle animation wave bars
- Volume: Range slider styled with theme primary

### Analytics Dashboard

**Bar Chart (Daily Hours)**
- 7-day horizontal bars with day labels
- Bars fill with theme primary color gradient
- Grid lines: Subtle white/10 opacity
- Tooltips on hover with exact hours

**Pie Chart (Task Completion)**
- Two segments: Completed (theme primary) vs Pending (white/20)
- Center label showing completion percentage
- Legend below chart

**Today's Summary**
- Three large stat cards in row
- Icon + Number + Label format
- Icons from Lucide React (Clock, CheckCircle, Target)
- `text-4xl font-bold` for numbers

### Settings Panel
- Slide-in panel from right: `translate-x-full` to `translate-x-0`
- Backdrop overlay: `bg-black/50 backdrop-blur-sm`
- Theme selector: Five circular swatches with check icon on active
- Duration inputs: Number spinners with +/- buttons, theme-styled
- Close button: X icon top-right

---

## Images

### Background Implementation
- Full-page gradient overlay with theme-specific abstract pattern image at 15% opacity
- Pattern types: Geometric shapes, waves, or noise textures matching theme mood

### No Large Hero Image
This is a utility app focused on productivity - no hero section needed. Background imagery is subtle and supportive rather than dominant.

---

## Interactive States

**Buttons**:
- Default: Theme primary with subtle shadow
- Hover: Brightness increase, lift (translateY -1px)
- Active: Slight scale down (scale-95)
- Disabled: opacity-50

**Cards**:
- Hover: Subtle lift shadow, border glow in theme color
- Glass morphism: `bg-white/10 backdrop-blur-md border border-white/20`

**Transitions**: `transition-all duration-300 ease-out`

---

## Accessibility

- High contrast text on backgrounds (WCAG AA minimum)
- Focus rings visible in theme accent color
- Timer sounds configurable/mutable
- Keyboard navigation for all controls
- Screen reader labels for icons

---

## Visual Hierarchy

1. **Primary Focus**: Timer display (largest, brightest)
2. **Secondary**: Active task, current quote
3. **Tertiary**: Controls, stats, music player
4. **Background**: Analytics charts, completed tasks

Use size, color intensity, and elevation to guide attention through the productivity workflow naturally.