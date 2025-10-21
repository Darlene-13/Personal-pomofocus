# Personal Pomodoro Productivity App - Documentation

## Overview
A complete productivity app with Pomodoro timer, task management, analytics dashboard, customizable themes, music integration, and motivational quotes.

---

## Features

### 1. Pomodoro Timer
- **Customizable durations** (default: 25 min work / 5 min break)
- **Auto-switching** between work and break sessions
- **Visual countdown** with large display
- **Play/Pause/Reset** controls
- **Audio alarm** when sessions complete

### 2. Task Management
- Add daily tasks with one click
- Mark tasks as complete with checkboxes
- Delete tasks you no longer need
- Visual completion indicators (green background, strikethrough)
- Real-time task counter

### 3. Themes
Choose from 5 beautiful color schemes:
- Purple (default)
- Blue
- Green
- Pink
- Orange

### 4. Music & Audio
- **Background music options**: Lo-fi Beats, Nature Sounds, Ambient, Focus Beats
- **Volume control**
- **Alarm sound** at session end
- **Play/pause toggle**

### 5. Analytics Dashboard
- **Bar chart**: Hours worked over last 7 days
- **Pie chart**: Task completion status
- **Quick stats**: Total sessions, tasks done, total hours
- **Recent sessions**: Last 5 completed Pomodoros

### 6. Motivational Quotes
- 10 curated productivity quotes
- New quote appears after each session
- Beautiful design with accent border

---

## How to Use

### Getting Started
1. **Add Tasks**: Click "Tasks" tab, type task name, press Enter or click +
2. **Choose Theme**: Click Settings (gear icon), select your color
3. **Select Music**: Pick background music from dropdown
4. **Customize Timer**: Adjust work/break durations in Settings

### Working with the Timer
1. Click **Play** button to start
2. Focus on your task
3. When timer ends, take your break
4. Mark tasks complete as you finish them
5. Check **Analytics** to see your progress

### Keyboard Shortcuts
- **Enter** in task input = Add task
- Click timer to focus

---

## Tech Stack

### Frontend
- **React 18+** - UI framework
- **Recharts** - Charts and graphs
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

### APIs Used
- **Web Audio API** - Alarm sounds
- **Recharts Components** - Data visualization

---

## Installation (Replit)

### Step 1: Create Project
```bash
# Create new React + Vite project on Replit
```

### Step 2: Install Dependencies
```bash
npm install recharts lucide-react
```

### Step 3: Copy Code
- Paste the app component code into your main file
- Run the project

### Step 4: (Optional) Add Real Music

#### YouTube Integration
```javascript
// Add YouTube iframe
<iframe 
  src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1"
  allow="autoplay"
  style={{display: 'none'}}
/>
```

#### Spotify Integration
```javascript
// Embed Spotify playlist
<iframe 
  src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ"
  width="0" 
  height="0"
  allow="encrypted-media"
/>
```

---

## Music Integration Options

### YouTube (Easiest)
1. Find study playlist on YouTube
2. Copy video ID from URL
3. Use embed format: `youtube.com/embed/VIDEO_ID`
4. Add to iframe with `autoplay=1&loop=1`

**Popular Playlists:**
- Lofi Girl 24/7: `jfKfPfyJRdk`
- Chillhop Music: `5qap5aO4i9A`
- Peaceful Piano: `lTRiuFIWV54`

### Spotify (Premium Required)
1. Open Spotify playlist
2. Click Share → Embed Playlist
3. Copy embed code
4. Use in iframe

**Popular Playlists:**
- Deep Focus: `37i9dQZF1DWZeKCadgRdKQ`
- Peaceful Piano: `37i9dQZF1DX4sWSpwq3LiO`
- Lo-Fi Beats: `37i9dQZF1DWWQRwui0ExPn`

---

## Data Structure

### Task Object
```javascript
{
  id: 1634567890123,
  text: "Write documentation",
  completed: false
}
```

### Session Object
```javascript
{
  date: "10/21/2025",
  time: "2:30:45 PM",
  duration: 25,
  timestamp: 1729438245000
}
```

---

## Customization Ideas

### Easy Tweaks
- Change default timer durations
- Add more color themes
- Customize motivational quotes
- Adjust chart colors

### Advanced Features
- **Backend**: Add database for persistence
- **Auth**: User accounts and login
- **Notifications**: Browser push alerts
- **Export**: Download productivity reports as CSV
- **Calendar**: Integrate with Google Calendar
- **Streaks**: Track consecutive days of productivity
- **Goals**: Set daily/weekly targets

---

## Keyboard Shortcuts Guide

| Action | Shortcut |
|--------|----------|
| Add Task | Type + Enter |
| Start Timer | Click Play |
| Reset Timer | Click Reset |

---

## Tips for Maximum Productivity

1. **Plan Your Day**: Add all tasks in the morning
2. **Start Small**: Begin with easiest task to build momentum
3. **Stay Focused**: Close other tabs during work sessions
4. **Honor Breaks**: Actually rest during break time
5. **Review Daily**: Check analytics each evening
6. **Adjust Duration**: Experiment with 25/30/45 min sessions
7. **Use Music**: Background sounds help concentration
8. **Theme Match Mood**: Morning = energetic colors, evening = calm

---

## Troubleshooting

### Timer Won't Start
- Refresh the page
- Check browser console for errors

### Music Not Playing
- Browser may block autoplay - user must interact first
- Check volume settings
- Verify iframe URLs are correct

### Charts Not Showing
- Complete at least one Pomodoro session
- Add tasks to see task completion chart

### Tasks Disappearing
- Currently stores in memory only
- Add localStorage or backend for persistence

---

## Future Roadmap

- [ ] Backend database integration
- [ ] User authentication
- [ ] Mobile app version
- [ ] Team collaboration features
- [ ] Productivity reports export
- [ ] Dark mode
- [ ] Custom sound uploads
- [ ] Integration with Notion/Todoist
- [ ] Pomodoro history calendar view
- [ ] AI-powered task prioritization

---

## Credits

**Created for personal productivity**
- Built with React & modern web technologies
- Inspired by Pomodoro Technique by Francesco Cirillo
- Music integration with YouTube & Spotify
- Charts powered by Recharts

---

## License

Personal use - customize freely!

---

## Support

For issues or questions:
1. Check Replit console for errors
2. Review installation steps
3. Verify all dependencies installed
4. Check browser compatibility (modern browsers only)

---

## Quick Reference

### Default Settings
- Work: 25 minutes
- Break: 5 minutes
- Theme: Purple
- Music: Lo-fi Beats

### Recommended Pomodoro Cycles
- **2 hours work**: 4 Pomodoros + 3 short breaks
- **4 hours work**: 8 Pomodoros + 7 short breaks + 1 long break (15-30 min)

---

**Happy Focusing! 🍅⏱️**