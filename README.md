# D&D MapMaker

A web-based map editor for Dungeons & Dragons, designed for creating town/city and dungeon maps with terrain painting and prop placement.

## Live URL

**https://kirgor32-lgtm.github.io/dnd-mapmaker/**

## GitHub Repository

**https://github.com/kirgor32-lgtm/dnd-mapmaker**

## Features

### Terrain Painting
- 10 terrain types: Grass, Forest, Mountain, Water, Sand, Snow, Swamp, Road, Dungeon Stone, Wall
- Adjustable brush size slider (5-100 pixels)
- Soft-edged, blended terrain rendering with gradients for organic look
- Rich, saturated colors with clear light/shade contrast

### Prop & Building Library
- **43+ hand-drawn canvas-based icons** (no external images)
- 3 categories with dedicated tabs:
  - **Town / City**: 19 props (houses, towers, castle, walls, gates, market, well, temple, tavern, windmill, dock, farm, fence, bridge)
  - **Dungeon / Location**: 14 props (walls, doors, secret door, stairs, pillars, torch, chest, trap, altar, cage, rubble, pit, statue)
  - **Landscape / Nature**: 10 props (trees, bushes, rocks, boulders, flowers, pond, river, gravestone, campfire)
- All props are hand-drawn Path2D vector shapes for crisp rendering at any zoom level

### Controls & UI
- **Pan**: Space + drag or middle-mouse drag
- **Zoom**: Mouse wheel (0.5x to 8x)
- **Grid Toggle**: Show/hide alignment grid with chess-style labels (A1, B2, etc.)
- **Snap to Grid**: Optional snapping for prop placement
- **Mode Selector**: Switch between Town and Dungeon display modes
- **Brush Size**: Slider control for terrain painting radius

### File Operations
- **New Map**: Create maps of custom width/height (10-200 cells)
- **Save**: Download map as JSON file
- **Load**: Import previously saved maps
- **Export PNG**: Rasterize full map at high resolution for sharing/printing

### Editing
- **Undo/Redo**: Full history stack for terrain and prop changes
- **Prop Placement**: Click to place, drag to move, R key to rotate (15° increments)
- **Prop Scaling**: +/- keys to scale, Delete to remove
- **Duplicate**: Ctrl+D to copy selected prop

### Status & Info
- Real-time zoom level display (100%, 200%, etc.)
- Grid coordinates display (shows A1, B2, etc. under cursor)
- Current map mode indicator
- Brush size preview

## Tech Stack

- Pure HTML, CSS, JavaScript (no build step, no dependencies)
- Canvas 2D rendering
- LocalStorage autosave support
- Responsive dark UI theme

## Installation & Running

No installation needed! The app runs entirely in the browser.

1. Visit: https://kirgor32-lgtm.github.io/dnd-mapmaker/
2. Or download the repository and open `index.html` in a browser

## File Structure

```
dnd-mapmaker/
├── index.html          # Main HTML structure
├── css/style.css       # Complete styling (dark theme, responsive layout)
├── js/app.js           # Main application logic (30KB)
└── README.md           # This file
```

## Development

To modify or extend the app:

1. Edit files locally at `D:\projects\dnd-mapmaker\`
2. Test changes in your browser
3. Commit and push to GitHub with `git push origin master`
4. GitHub Pages auto-deploys the changes

To add a new prop type:
1. Create a `buildNewProp()` function in `js/app.js` that returns a `Path2D`
2. Add entry to appropriate category in `PROP_LIBRARY` object
3. Function will be auto-discovered and rendered

## Known Limitations

- Terrain and props are stored in browser memory (localStorage autosave planned)
- No collaborative editing
- Single undo/redo history per session

## Browser Support

Modern browsers with Canvas 2D support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT License - Free to use and modify
