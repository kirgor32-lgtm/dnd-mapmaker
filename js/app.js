// D&D MapMaker - Main Application
(function() {
  'use strict';

  const GRID_SIZE = 32; // pixels per grid cell
  const TERRAIN_TYPES = {
    grass: { color: '#2d8659', light: '#4db876', dark: '#1a4d35', label: 'Grass' },
    forest: { color: '#1a5c2a', light: '#2d8659', dark: '#0d3318', label: 'Forest' },
    mountain: { color: '#6b4423', light: '#8b5a2b', dark: '#4a2c15', label: 'Mountain' },
    water: { color: '#1e5a96', light: '#2d7ab8', dark: '#0d3d66', label: 'Water' },
    sand: { color: '#d4a574', light: '#e8bf8f', dark: '#b8845c', label: 'Sand' },
    snow: { color: '#e8e8e8', light: '#f5f5f5', dark: '#d0d0d0', label: 'Snow' },
    swamp: { color: '#3d5c2a', light: '#546b3a', dark: '#2a4118', label: 'Swamp' },
    road: { color: '#8b7355', light: '#a8896f', dark: '#6b5340', label: 'Road' },
    dungeon: { color: '#4a4a4a', light: '#5c5c5c', dark: '#333333', label: 'Stone' },
    wall: { color: '#3a3a3a', light: '#4a4a4a', dark: '#2a2a2a', label: 'Wall' }
  };

  // Prop library: 30+ hand-drawn icons built with Path2D
  const PROP_LIBRARY = {
    town: [
      { id: 'house1', name: 'House Cottage', buildIcon: buildHouseCottage },
      { id: 'house2', name: 'House Stone', buildIcon: buildHouseStone },
      { id: 'house3', name: 'House Timber', buildIcon: buildHouseTimber },
      { id: 'house4', name: 'House Tall', buildIcon: buildHouseTall },
      { id: 'house5', name: 'House Small', buildIcon: buildHouseSmall },
      { id: 'house6', name: 'House with Fence', buildIcon: buildHouseWithFence },
      { id: 'watchtower', name: 'Watch Tower', buildIcon: buildWatchtower },
      { id: 'castle', name: 'Castle / Keep', buildIcon: buildCastle },
      { id: 'citywall', name: 'City Wall Segment', buildIcon: buildCityWall },
      { id: 'gate', name: 'City Gate', buildIcon: buildCityGate },
      { id: 'market', name: 'Market Stall', buildIcon: buildMarketStall },
      { id: 'well', name: 'Well', buildIcon: buildWell },
      { id: 'temple', name: 'Temple / Shrine', buildIcon: buildTemple },
      { id: 'tavern', name: 'Tavern', buildIcon: buildTavern },
      { id: 'windmill', name: 'Windmill', buildIcon: buildWindmill },
      { id: 'dock', name: 'Dock / Pier', buildIcon: buildDock },
      { id: 'farm', name: 'Farm Field', buildIcon: buildFarm },
      { id: 'fence', name: 'Fence Segment', buildIcon: buildFence },
      { id: 'bridge', name: 'Wooden Bridge', buildIcon: buildBridge }
    ],
    dungeon: [
      { id: 'dwall', name: 'Wall Segment', buildIcon: buildDungeonWall },
      { id: 'door', name: 'Door', buildIcon: buildDoor },
      { id: 'sdoor', name: 'Secret Door', buildIcon: buildSecretDoor },
      { id: 'stairup', name: 'Stairs Up', buildIcon: buildStairsUp },
      { id: 'stairdown', name: 'Stairs Down', buildIcon: buildStairsDown },
      { id: 'pillar', name: 'Pillar / Column', buildIcon: buildPillar },
      { id: 'torch', name: 'Torch / Brazier', buildIcon: buildTorch },
      { id: 'chest', name: 'Treasure Chest', buildIcon: buildChest },
      { id: 'trap', name: 'Trap Marker', buildIcon: buildTrap },
      { id: 'altar', name: 'Altar', buildIcon: buildAltar },
      { id: 'cage', name: 'Cage', buildIcon: buildCage },
      { id: 'rubble', name: 'Rubble Pile', buildIcon: buildRubble },
      { id: 'pit', name: 'Pit / Chasm', buildIcon: buildPit },
      { id: 'statue', name: 'Statue', buildIcon: buildStatue }
    ],
    nature: [
      { id: 'tree1', name: 'Deciduous Tree', buildIcon: buildTreeDeciduous },
      { id: 'tree2', name: 'Pine Tree', buildIcon: buildTreePine },
      { id: 'bush', name: 'Bush / Shrub', buildIcon: buildBush },
      { id: 'rock', name: 'Rock Cluster', buildIcon: buildRockCluster },
      { id: 'boulder', name: 'Boulder', buildIcon: buildBoulder },
      { id: 'flower', name: 'Flower Patch', buildIcon: buildFlowerPatch },
      { id: 'pond', name: 'Pond', buildIcon: buildPond },
      { id: 'river', name: 'River Bend', buildIcon: buildRiverBend },
      { id: 'grave', name: 'Gravestone', buildIcon: buildGravestone },
      { id: 'campfire', name: 'Campfire', buildIcon: buildCampfire }
    ]
  };

  // App state
  const state = {
    mapWidth: 50,
    mapHeight: 50,
    terrain: new Map(), // Map { "x,y" -> terrain type }
    props: [], // Array of { id, x, y, rotation, scale, propId }
    selectedProp: null,
    selectedTerrainType: 'grass',
    brushSize: 20,
    currentMode: 'town',
    showGrid: false,
    snapToGrid: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDraggingProp: false,
    history: [],
    historyIndex: -1,
    selectedPropId: null // Store the selected prop library ID for palette
  };

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('fileInput');

  // Helper: Build Path2D for each prop icon
  function buildHouseCottage() {
    const p = new Path2D();
    p.rect(-10, -10, 20, 16);
    p.moveTo(-10, -10); p.lineTo(0, -15); p.lineTo(10, -10);
    return p;
  }
  function buildHouseStone() {
    const p = new Path2D();
    p.rect(-12, -8, 24, 18);
    for (let i = -10; i <= 10; i += 4) {
      p.arc(i, 0, 2, 0, Math.PI * 2);
    }
    return p;
  }
  function buildHouseTimber() {
    const p = new Path2D();
    p.rect(-10, -10, 20, 16);
    p.moveTo(-10, -6); p.lineTo(10, -6);
    p.moveTo(-10, -2); p.lineTo(10, -2);
    return p;
  }
  function buildHouseTall() {
    const p = new Path2D();
    p.rect(-8, -12, 16, 20);
    p.moveTo(-8, -12); p.lineTo(0, -16); p.lineTo(8, -12);
    return p;
  }
  function buildHouseSmall() {
    const p = new Path2D();
    p.rect(-6, -8, 12, 12);
    p.moveTo(-6, -8); p.lineTo(0, -12); p.lineTo(6, -8);
    return p;
  }
  function buildHouseWithFence() {
    const p = new Path2D();
    p.rect(-10, -8, 20, 14);
    p.moveTo(-10, -8); p.lineTo(0, -12); p.lineTo(10, -8);
    p.moveTo(-14, 6); p.lineTo(-14, 8); p.lineTo(14, 8); p.lineTo(14, 6);
    return p;
  }
  function buildWatchtower() {
    const p = new Path2D();
    p.rect(-6, -14, 12, 20);
    p.rect(-8, -14, 16, 4);
    p.arc(0, -14, 8, 0, Math.PI * 2);
    return p;
  }
  function buildCastle() {
    const p = new Path2D();
    p.rect(-15, -10, 30, 18);
    p.moveTo(-15, -10); p.lineTo(-10, -14); p.lineTo(-5, -10);
    p.moveTo(5, -10); p.lineTo(10, -14); p.lineTo(15, -10);
    p.moveTo(-15, -4); p.lineTo(15, -4);
    return p;
  }
  function buildCityWall() {
    const p = new Path2D();
    p.rect(-12, -4, 24, 12);
    p.moveTo(-12, -2); p.lineTo(-12, -6); p.lineTo(-8, -6); p.lineTo(-8, -2);
    p.moveTo(-2, -2); p.lineTo(-2, -6); p.lineTo(2, -6); p.lineTo(2, -2);
    p.moveTo(8, -2); p.lineTo(8, -6); p.lineTo(12, -6); p.lineTo(12, -2);
    return p;
  }
  function buildCityGate() {
    const p = new Path2D();
    p.rect(-14, -8, 28, 16);
    p.rect(-8, -6, 16, 12);
    p.arc(-4, 0, 2, 0, Math.PI * 2);
    p.arc(4, 0, 2, 0, Math.PI * 2);
    return p;
  }
  function buildMarketStall() {
    const p = new Path2D();
    p.rect(-8, -6, 16, 10);
    p.moveTo(-8, -6); p.lineTo(0, -10); p.lineTo(8, -6);
    return p;
  }
  function buildWell() {
    const p = new Path2D();
    p.arc(0, 0, 8, 0, Math.PI * 2);
    p.arc(0, 0, 4, 0, Math.PI * 2);
    p.moveTo(-8, 0); p.lineTo(-10, -6); p.lineTo(10, -6); p.lineTo(8, 0);
    return p;
  }
  function buildTemple() {
    const p = new Path2D();
    p.rect(-12, -8, 24, 16);
    p.moveTo(-12, -8); p.lineTo(0, -14); p.lineTo(12, -8);
    for (let i = -8; i <= 8; i += 6) {
      p.rect(i - 1, 0, 2, 8);
    }
    return p;
  }
  function buildTavern() {
    const p = new Path2D();
    p.rect(-10, -8, 20, 14);
    p.moveTo(-10, -8); p.lineTo(0, -12); p.lineTo(10, -8);
    p.arc(-6, -2, 1.5, 0, Math.PI * 2);
    p.arc(6, -2, 1.5, 0, Math.PI * 2);
    return p;
  }
  function buildWindmill() {
    const p = new Path2D();
    p.rect(-4, -8, 8, 16);
    p.arc(0, -8, 6, 0, Math.PI * 2);
    p.moveTo(0, -8); p.lineTo(6, -8);
    p.moveTo(0, -8); p.lineTo(0, -14);
    return p;
  }
  function buildDock() {
    const p = new Path2D();
    p.rect(-10, -3, 20, 6);
    p.moveTo(-10, 3); p.lineTo(-10, 8); p.lineTo(10, 8); p.lineTo(10, 3);
    return p;
  }
  function buildFarm() {
    const p = new Path2D();
    p.rect(-12, -8, 24, 16);
    for (let i = -10; i <= 10; i += 5) {
      p.moveTo(i, -6); p.lineTo(i, 6);
    }
    return p;
  }
  function buildFence() {
    const p = new Path2D();
    p.moveTo(-12, 0); p.lineTo(12, 0);
    for (let i = -10; i <= 10; i += 4) {
      p.moveTo(i, 0); p.lineTo(i, -6);
    }
    return p;
  }
  function buildBridge() {
    const p = new Path2D();
    p.rect(-10, -3, 20, 6);
    p.moveTo(-6, -3); p.lineTo(-6, 3);
    p.moveTo(0, -3); p.lineTo(0, 3);
    p.moveTo(6, -3); p.lineTo(6, 3);
    return p;
  }
  function buildDungeonWall() {
    const p = new Path2D();
    p.rect(-10, -6, 20, 12);
    for (let i = -8; i <= 8; i += 4) {
      p.rect(i - 1, -4, 2, 2);
    }
    return p;
  }
  function buildDoor() {
    const p = new Path2D();
    p.rect(-6, -10, 12, 14);
    p.arc(6, -3, 1.5, 0, Math.PI * 2);
    return p;
  }
  function buildSecretDoor() {
    const p = new Path2D();
    p.rect(-6, -10, 12, 14);
    p.moveTo(-4, -8); p.lineTo(4, -8);
    p.moveTo(-4, -4); p.lineTo(4, -4);
    p.moveTo(-4, 0); p.lineTo(4, 0);
    return p;
  }
  function buildStairsUp() {
    const p = new Path2D();
    for (let i = 0; i < 3; i++) {
      p.moveTo(-6 + i * 5, -6 + i * 5);
      p.lineTo(-6 + i * 5 + 4, -6 + i * 5);
      p.lineTo(-6 + i * 5 + 4, -6 + i * 5 + 4);
    }
    return p;
  }
  function buildStairsDown() {
    const p = new Path2D();
    for (let i = 0; i < 3; i++) {
      p.moveTo(-6 + i * 5, 6 - i * 5);
      p.lineTo(-6 + i * 5 + 4, 6 - i * 5);
      p.lineTo(-6 + i * 5 + 4, 6 - i * 5 - 4);
    }
    return p;
  }
  function buildPillar() {
    const p = new Path2D();
    p.rect(-4, -8, 8, 16);
    p.arc(0, -8, 5, 0, Math.PI * 2);
    return p;
  }
  function buildTorch() {
    const p = new Path2D();
    p.rect(-2, 0, 4, 10);
    p.arc(0, -2, 3, 0, Math.PI * 2);
    return p;
  }
  function buildChest() {
    const p = new Path2D();
    p.rect(-8, -4, 16, 10);
    p.arc(0, -4, 8, Math.PI, 0);
    p.moveTo(-8, -4); p.lineTo(8, -4);
    return p;
  }
  function buildTrap() {
    const p = new Path2D();
    p.moveTo(-6, -6); p.lineTo(6, 6);
    p.moveTo(6, -6); p.lineTo(-6, 6);
    p.rect(-7, -7, 14, 14);
    return p;
  }
  function buildAltar() {
    const p = new Path2D();
    p.rect(-10, 0, 20, 12);
    p.moveTo(-8, 0); p.lineTo(8, 0);
    p.rect(-4, -6, 8, 6);
    return p;
  }
  function buildCage() {
    const p = new Path2D();
    p.rect(-8, -10, 16, 16);
    for (let i = -6; i <= 6; i += 4) {
      p.moveTo(i, -10); p.lineTo(i, 6);
    }
    return p;
  }
  function buildRubble() {
    const p = new Path2D();
    p.moveTo(-8, -8); p.lineTo(-4, 0); p.lineTo(0, -6);
    p.moveTo(4, 8); p.lineTo(8, -2); p.lineTo(2, 4);
    for (let i = -6; i <= 6; i += 6) {
      p.arc(i, i * 0.3, 4, 0, Math.PI * 2);
    }
    return p;
  }
  function buildPit() {
    const p = new Path2D();
    p.arc(0, 0, 10, 0, Math.PI * 2);
    p.arc(0, 0, 6, 0, Math.PI * 2);
    return p;
  }
  function buildStatue() {
    const p = new Path2D();
    p.rect(-4, 0, 8, 14);
    p.arc(0, -2, 4, 0, Math.PI * 2);
    return p;
  }
  function buildTreeDeciduous() {
    const p = new Path2D();
    p.arc(0, -4, 8, 0, Math.PI * 2);
    p.rect(-2, 4, 4, 6);
    return p;
  }
  function buildTreePine() {
    const p = new Path2D();
    p.moveTo(0, -10); p.lineTo(-8, 0); p.lineTo(8, 0);
    p.moveTo(0, -4); p.lineTo(-6, 4); p.lineTo(6, 4);
    p.rect(-1, 4, 2, 6);
    return p;
  }
  function buildBush() {
    const p = new Path2D();
    p.arc(-3, 0, 6, 0, Math.PI * 2);
    p.arc(3, 0, 6, 0, Math.PI * 2);
    return p;
  }
  function buildRockCluster() {
    const p = new Path2D();
    p.arc(-4, -2, 5, 0, Math.PI * 2);
    p.arc(4, 2, 5, 0, Math.PI * 2);
    p.arc(0, 6, 4, 0, Math.PI * 2);
    return p;
  }
  function buildBoulder() {
    const p = new Path2D();
    p.arc(0, 0, 8, 0, Math.PI * 2);
    return p;
  }
  function buildFlowerPatch() {
    const p = new Path2D();
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * 5;
      const y = Math.sin(angle) * 5;
      p.arc(x, y, 2, 0, Math.PI * 2);
    }
    return p;
  }
  function buildPond() {
    const p = new Path2D();
    p.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2);
    return p;
  }
  function buildRiverBend() {
    const p = new Path2D();
    p.moveTo(-10, 0);
    p.quadraticCurveTo(0, 10, 10, 0);
    p.moveTo(-10, 4);
    p.quadraticCurveTo(0, 14, 10, 4);
    return p;
  }
  function buildGravestone() {
    const p = new Path2D();
    p.moveTo(0, -8); p.lineTo(-5, 8); p.lineTo(5, 8);
    p.arc(0, 0, 2, 0, Math.PI * 2);
    return p;
  }
  function buildCampfire() {
    const p = new Path2D();
    p.rect(-6, 0, 12, 4);
    p.moveTo(-2, 0); p.lineTo(-4, -6); p.lineTo(0, -8); p.lineTo(4, -6); p.lineTo(2, 0);
    return p;
  }

  // Helper: Grid coordinates from pixel position
  function pixelToGrid(px, py) {
    const gx = Math.floor(px / GRID_SIZE);
    const gy = Math.floor(py / GRID_SIZE);
    return { gx, gy, label: String.fromCharCode(65 + (gx % 26)) + (gy + 1) };
  }

  // Helper: Save state to history for undo/redo
  function saveHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({
      terrain: new Map(state.terrain),
      props: state.props.map(p => ({ ...p }))
    });
    state.historyIndex++;
    updateHistoryButtons();
  }

  // Terrain painting with soft edges and blending
  function paintTerrain(px, py) {
    const brushPixels = state.brushSize;
    const brushCells = Math.ceil(brushPixels / GRID_SIZE) + 1;
    const centerGx = Math.floor(px / GRID_SIZE);
    const centerGy = Math.floor(py / GRID_SIZE);

    for (let gx = centerGx - brushCells; gx <= centerGx + brushCells; gx++) {
      for (let gy = centerGy - brushCells; gy <= centerGy + brushCells; gy++) {
        const dist = Math.hypot(gx - centerGx + 0.5, gy - centerGy + 0.5);
        if (dist < brushCells - 0.5) {
          const key = gx + ',' + gy;
          state.terrain.set(key, state.selectedTerrainType);
        }
      }
    }
  }

  // Render everything
  function render() {
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Pan and zoom
    ctx.save();
    ctx.translate(state.panX, state.panY);
    ctx.scale(state.zoom, state.zoom);

    // Render terrain
    for (const [key, terrain] of state.terrain) {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * GRID_SIZE;
      const py = gy * GRID_SIZE;

      const colors = TERRAIN_TYPES[terrain];
      // Soft gradient fill for organic look
      const grad = ctx.createLinearGradient(px, py, px + GRID_SIZE, py + GRID_SIZE);
      grad.addColorStop(0, colors.light);
      grad.addColorStop(0.5, colors.color);
      grad.addColorStop(1, colors.dark);
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);

      // Soft edge
      ctx.strokeStyle = colors.dark;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, GRID_SIZE, GRID_SIZE);
      ctx.globalAlpha = 1;
    }

    // Grid overlay
    if (state.showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= state.mapWidth; x++) {
        const px = x * GRID_SIZE;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, state.mapHeight * GRID_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= state.mapHeight; y++) {
        const py = y * GRID_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(state.mapWidth * GRID_SIZE, py);
        ctx.stroke();
      }

      // Grid labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let x = 0; x < state.mapWidth; x++) {
        ctx.fillText(String.fromCharCode(65 + (x % 26)), x * GRID_SIZE + GRID_SIZE / 2, -8);
      }
      for (let y = 0; y < state.mapHeight; y++) {
        ctx.fillText((y + 1).toString(), -8, y * GRID_SIZE + GRID_SIZE / 2);
      }
    }

    // Render props
    for (let i = 0; i < state.props.length; i++) {
      const prop = state.props[i];
      const px = prop.x * GRID_SIZE;
      const py = prop.y * GRID_SIZE;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((prop.rotation * Math.PI) / 180);
      ctx.scale(prop.scale, prop.scale);

      // Drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw the prop
      const propDef = findPropDefinition(prop.propId);
      if (propDef) {
        const path = propDef.buildIcon();
        ctx.fillStyle = '#8b6f47';
        ctx.fill(path);
        ctx.strokeStyle = '#5c4a2f';
        ctx.lineWidth = 1.5 / state.zoom;
        ctx.stroke(path);
      }

      // Selection highlight
      if (state.selectedProp === i) {
        const path = new Path2D();
        path.rect(-15, -15, 30, 30);
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 2 / state.zoom;
        ctx.stroke(path);
      }

      ctx.restore();
    }

    ctx.restore();

    // Update status bar
    const zoomPct = Math.round(state.zoom * 100);
    document.getElementById('zoomLevel').textContent = zoomPct + '%';
  }

  function findPropDefinition(propId) {
    for (const category of ['town', 'dungeon', 'nature']) {
      const found = PROP_LIBRARY[category].find(p => p.id === propId);
      if (found) return found;
    }
    return null;
  }

  // Mouse events
  let isMouseDown = false;
  let paintHistory = false;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = (canvasX - state.panX) / state.zoom;
    const worldY = (canvasY - state.panY) / state.zoom;

    if (e.button === 1 || (e.button === 0 && e.space)) {
      // Middle mouse or space: pan mode
      state.panStart = { x: canvasX, y: canvasY };
    } else if (e.button === 0) {
      // Left mouse
      if (state.selectedPropId) {
        // Place prop
        let gx = Math.round(worldX / GRID_SIZE);
        let gy = Math.round(worldY / GRID_SIZE);
        if (state.snapToGrid) {
          // Already snapped
        }
        state.props.push({
          propId: state.selectedPropId,
          x: gx,
          y: gy,
          rotation: 0,
          scale: 1
        });
        saveHistory();
      } else {
        // Paint terrain
        isMouseDown = true;
        paintTerrain(worldX, worldY);
        paintHistory = true;
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = (canvasX - state.panX) / state.zoom;
    const worldY = (canvasY - state.panY) / state.zoom;

    // Update grid coordinates in status bar
    const { label } = pixelToGrid(worldX, worldY);
    document.getElementById('gridCoords').textContent = label;

    if (e.buttons === 4 || (e.buttons === 1 && e.getModifierState('Space'))) {
      // Pan
      const dx = canvasX - state.panStart.x;
      const dy = canvasY - state.panStart.y;
      state.panX += dx;
      state.panY += dy;
      state.panStart = { x: canvasX, y: canvasY };
    } else if (isMouseDown) {
      // Continue painting
      paintTerrain(worldX, worldY);
    }

    render();
  });

  canvas.addEventListener('mouseup', (e) => {
    if (isMouseDown && paintHistory) {
      saveHistory();
      paintHistory = false;
    }
    isMouseDown = false;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    state.zoom *= factor;
    state.zoom = Math.max(0.5, Math.min(state.zoom, 8));

    state.panX = canvasX - (canvasX - state.panX) * factor;
    state.panY = canvasY - (canvasY - state.panY) * factor;

    render();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      undo();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      redo();
    } else if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      duplicateSelectedProp();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      deleteSelectedProp();
    } else if (e.key === 'r' || e.key === 'R') {
      rotateSelectedProp(15);
    }
  });

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      const h = state.history[state.historyIndex];
      state.terrain = new Map(h.terrain);
      state.props = h.props.map(p => ({ ...p }));
      updateHistoryButtons();
      render();
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      const h = state.history[state.historyIndex];
      state.terrain = new Map(h.terrain);
      state.props = h.props.map(p => ({ ...p }));
      updateHistoryButtons();
      render();
    }
  }

  function updateHistoryButtons() {
    document.getElementById('btnUndo').disabled = state.historyIndex <= 0;
    document.getElementById('btnRedo').disabled = state.historyIndex >= state.history.length - 1;
  }

  function deleteSelectedProp() {
    if (state.selectedProp !== null) {
      state.props.splice(state.selectedProp, 1);
      state.selectedProp = null;
      saveHistory();
      render();
    }
  }

  function duplicateSelectedProp() {
    if (state.selectedProp !== null) {
      const prop = state.props[state.selectedProp];
      state.props.push({ ...prop, x: prop.x + 1, y: prop.y + 1 });
      saveHistory();
      render();
    }
  }

  function rotateSelectedProp(degrees) {
    if (state.selectedProp !== null) {
      const prop = state.props[state.selectedProp];
      prop.rotation = (prop.rotation + degrees) % 360;
      saveHistory();
      render();
    }
  }

  // UI Event Handlers
  document.getElementById('btnNew').addEventListener('click', () => {
    document.getElementById('newMapDialog').classList.remove('hidden');
  });

  document.getElementById('btnCreateMap').addEventListener('click', () => {
    state.mapWidth = parseInt(document.getElementById('mapWidth').value);
    state.mapHeight = parseInt(document.getElementById('mapHeight').value);
    state.terrain.clear();
    state.props = [];
    state.history = [];
    state.historyIndex = -1;
    saveHistory();
    document.getElementById('newMapDialog').classList.add('hidden');
    render();
  });

  document.getElementById('btnCancelMap').addEventListener('click', () => {
    document.getElementById('newMapDialog').classList.add('hidden');
  });

  // Terrain brush selection
  document.querySelectorAll('.terrain-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedTerrainType = btn.dataset.terrain;
      state.selectedPropId = null;
    });
  });

  // Brush size
  document.getElementById('brushSize').addEventListener('input', (e) => {
    state.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeLabel').textContent = e.target.value;
  });

  // Grid toggle
  document.getElementById('btnGrid').addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    document.getElementById('btnGrid').classList.toggle('active', state.showGrid);
    render();
  });

  // Snap toggle
  document.getElementById('btnSnap').addEventListener('click', () => {
    state.snapToGrid = !state.snapToGrid;
    document.getElementById('btnSnap').classList.toggle('active', state.snapToGrid);
  });

  // Mode selector
  document.getElementById('modeSelector').addEventListener('change', (e) => {
    state.currentMode = e.target.value;
    const modeLabel = e.target.value === 'town' ? 'Town' : 'Dungeon';
    document.getElementById('modeStatus').textContent = modeLabel;
    updatePropPalette();
  });

  // Save to file
  document.getElementById('btnSave').addEventListener('click', () => {
    const data = {
      mapWidth: state.mapWidth,
      mapHeight: state.mapHeight,
      terrain: Array.from(state.terrain.entries()),
      props: state.props
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dnd-map-' + new Date().getTime() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Load from file
  document.getElementById('btnLoad').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        state.mapWidth = data.mapWidth;
        state.mapHeight = data.mapHeight;
        state.terrain = new Map(data.terrain);
        state.props = data.props;
        state.history = [];
        state.historyIndex = -1;
        saveHistory();
        render();
      } catch (err) {
        alert('Failed to load map: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  // Export PNG
  document.getElementById('btnExport').addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = state.mapWidth * GRID_SIZE;
    exportCanvas.height = state.mapHeight * GRID_SIZE;
    const exportCtx = exportCanvas.getContext('2d');

    // Temporarily set state zoom/pan to render full map
    const oldPan = { x: state.panX, y: state.panY };
    const oldZoom = state.zoom;
    state.panX = 0;
    state.panY = 0;
    state.zoom = 1;

    // Render terrain
    for (const [key, terrain] of state.terrain) {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * GRID_SIZE;
      const py = gy * GRID_SIZE;
      const colors = TERRAIN_TYPES[terrain];
      const grad = exportCtx.createLinearGradient(px, py, px + GRID_SIZE, py + GRID_SIZE);
      grad.addColorStop(0, colors.light);
      grad.addColorStop(0.5, colors.color);
      grad.addColorStop(1, colors.dark);
      exportCtx.fillStyle = grad;
      exportCtx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
    }

    // Render props
    for (const prop of state.props) {
      const px = prop.x * GRID_SIZE;
      const py = prop.y * GRID_SIZE;
      exportCtx.save();
      exportCtx.translate(px, py);
      exportCtx.rotate((prop.rotation * Math.PI) / 180);
      exportCtx.scale(prop.scale, prop.scale);
      const propDef = findPropDefinition(prop.propId);
      if (propDef) {
        const path = propDef.buildIcon();
        exportCtx.fillStyle = '#8b6f47';
        exportCtx.fill(path);
        exportCtx.strokeStyle = '#5c4a2f';
        exportCtx.lineWidth = 1.5;
        exportCtx.stroke(path);
      }
      exportCtx.restore();
    }

    // Download
    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dnd-map-' + new Date().getTime() + '.png';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Restore state
    state.panX = oldPan.x;
    state.panY = oldPan.y;
    state.zoom = oldZoom;
  });

  // Prop palette
  function updatePropPalette() {
    const palette = document.getElementById('propPalette');
    palette.innerHTML = '';
    const currentCategory = state.currentMode === 'town' ? 'town' : 'dungeon';
    const props = PROP_LIBRARY[currentCategory];
    for (const propDef of props) {
      const btn = document.createElement('button');
      btn.className = 'prop-icon';
      if (state.selectedPropId === propDef.id) {
        btn.classList.add('selected');
      }
      btn.innerHTML = '<span>📦</span><div class="prop-name">' + propDef.name + '</div>';
      btn.addEventListener('click', () => {
        state.selectedPropId = propDef.id;
        state.selectedTerrainType = null;
        document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.prop-icon').forEach(p => p.classList.remove('selected'));
        btn.classList.add('selected');
      });
      palette.appendChild(btn);
    }
  }

  // Initialize palette tabs
  document.querySelectorAll('.palette-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.palette-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      // For now, just highlight; actual category switching via mode selector
    });
  });

  // Populate all categories in palette
  function populateAllPalettes() {
    const palette = document.getElementById('propPalette');
    palette.innerHTML = '';
    for (const category of ['town', 'dungeon', 'nature']) {
      const props = PROP_LIBRARY[category];
      for (const propDef of props) {
        const btn = document.createElement('button');
        btn.className = 'prop-icon';
        if (state.selectedPropId === propDef.id) {
          btn.classList.add('selected');
        }
        btn.innerHTML = '<span>📦</span><div class="prop-name">' + propDef.name + '</div>';
        btn.addEventListener('click', () => {
          state.selectedPropId = propDef.id;
          state.selectedTerrainType = null;
          document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.prop-icon').forEach(p => p.classList.remove('selected'));
          btn.classList.add('selected');
        });
        palette.appendChild(btn);
      }
    }
  }

  // Initialize
  function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    saveHistory();
    populateAllPalettes();
    updateHistoryButtons();
    render();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    });
  }

  init();
})();
