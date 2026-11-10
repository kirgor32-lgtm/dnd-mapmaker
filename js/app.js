// D&D MapMaker - Russian Edition with Detailed Top-Down Icons
(function() {
  'use strict';

  const GRID_SIZE = 32;
  const ICON_SCALE = 1.3; // постройки крупнее клетки сетки для читаемости деталей, но без наезда на соседей
  const TERRAIN_TYPES = {
    grass: { color: '#4f9153', light: '#6cb66a', dark: '#2f5e34', label: 'Трава' },
    forest: { color: '#285c30', light: '#3f7a3f', dark: '#163a1c', label: 'Лес' },
    mountain: { color: '#8a7358', light: '#c9b38a', dark: '#4a3a28', label: 'Гора' },
    water: { color: '#2d6fa8', light: '#4a94c9', dark: '#164a73', label: 'Вода' },
    sand: { color: '#dcc180', light: '#ecd9a0', dark: '#b89a5c', label: 'Песок' },
    snow: { color: '#e9edf0', light: '#ffffff', dark: '#c6d1d8', label: 'Снег' },
    swamp: { color: '#4a5a34', light: '#637246', dark: '#2e3920', label: 'Болото' },
    road: { color: '#9c8564', light: '#b59c7a', dark: '#75624a', label: 'Дорога' },
    dungeon: { color: '#55524c', light: '#6b675f', dark: '#3a3834', label: 'Камень' },
    wall: { color: '#3a3a3a', light: '#4a4a4a', dark: '#2a2a2a', label: 'Стена' }
  };

  function hash2(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);
    return ((h % 2147483647) + 2147483647) % 2147483647;
  }
  function rand2(x, y, n) {
    return (hash2(x * 97 + n, y * 131 + n * 7) % 10000) / 10000;
  }

  function drawTerrainTexture(ctx, gx, gy, px, py, type, colors) {
    const seed = (n) => rand2(gx, gy, n);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, GRID_SIZE, GRID_SIZE);
    ctx.clip();
    if (type === 'wall') {
      // RimWorld-стиль: сплошная стена, соединяющаяся с соседними клетками стены
      const has = (dx, dy) => state.terrain.get((gx + dx) + ',' + (gy + dy)) === 'wall';
      const n = has(0, -1), s = has(0, 1), w = has(-1, 0), e = has(1, 0);
      const t = GRID_SIZE * 0.32; // толщина стены внутри клетки
      ctx.fillStyle = colors.dark;
      // центральный блок стены
      ctx.fillRect(px + GRID_SIZE / 2 - t / 2, py + GRID_SIZE / 2 - t / 2, t, t);
      if (n) ctx.fillRect(px + GRID_SIZE / 2 - t / 2, py, t, GRID_SIZE / 2 + t / 2);
      if (s) ctx.fillRect(px + GRID_SIZE / 2 - t / 2, py + GRID_SIZE / 2 - t / 2, t, GRID_SIZE / 2 + t / 2);
      if (w) ctx.fillRect(px, py + GRID_SIZE / 2 - t / 2, GRID_SIZE / 2 + t / 2, t);
      if (e) ctx.fillRect(px + GRID_SIZE / 2 - t / 2, py + GRID_SIZE / 2 - t / 2, GRID_SIZE / 2 + t / 2, t);
      // кладка - горизонтальные швы
      ctx.strokeStyle = colors.light;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 0.6;
      for (let yy = py + 4; yy < py + GRID_SIZE; yy += 6) {
        ctx.beginPath();
        ctx.moveTo(px, yy);
        ctx.lineTo(px + GRID_SIZE, yy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // зубцы на верхнем открытом крае (не соединён с соседом сверху)
      if (!n) {
        ctx.fillStyle = colors.dark;
        for (let bx = px + 2; bx < px + GRID_SIZE - 2; bx += 8) {
          ctx.fillRect(bx, py + GRID_SIZE / 2 - t / 2 - 3, 5, 3);
        }
      }
      ctx.restore();
      return;
    }
    if (type === 'grass' || type === 'swamp') {
      ctx.strokeStyle = colors.dark;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const bx = px + seed(i) * GRID_SIZE;
        const by = py + seed(i + 10) * GRID_SIZE;
        ctx.beginPath();
        ctx.moveTo(bx, by + 3);
        ctx.lineTo(bx + (seed(i + 20) - 0.5) * 3, by - 3);
        ctx.stroke();
      }
    } else if (type === 'forest') {
      for (let i = 0; i < 4; i++) {
        const bx = px + 4 + seed(i) * (GRID_SIZE - 8);
        const by = py + 4 + seed(i + 10) * (GRID_SIZE - 8);
        const r = 4 + seed(i + 20) * 3;
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'mountain') {
      // Civ6-стиль: кластер гранёных остроконечных пиков со снежными шапками,
      // плоские грани света/тени (без градиентов) - рельефный, но не "глянцевый"
      const cx = px + GRID_SIZE / 2;
      const base = py + GRID_SIZE * 0.92;

      // Три перекрывающихся пика разной высоты - задний меньше, передние крупнее
      const peaks = [
        { x: px + GRID_SIZE * 0.28, h: 0.62, w: 0.42 },
        { x: px + GRID_SIZE * 0.70, h: 0.52, w: 0.4 },
        { x: px + GRID_SIZE * 0.5, h: 0.82, w: 0.5 }
      ];

      for (const pk of peaks) {
        const topY = py + GRID_SIZE * (1 - pk.h);
        const halfW = GRID_SIZE * pk.w / 2;
        const leftX = pk.x - halfW;
        const rightX = pk.x + halfW;

        // Освещённая грань (левая/передняя) - светлый тан
        ctx.fillStyle = colors.light;
        ctx.beginPath();
        ctx.moveTo(pk.x, topY);
        ctx.lineTo(leftX, base);
        ctx.lineTo(pk.x, base);
        ctx.closePath();
        ctx.fill();

        // Теневая грань (правая) - тёмно-коричневая, плоская (без градиента)
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.moveTo(pk.x, topY);
        ctx.lineTo(pk.x, base);
        ctx.lineTo(rightX, base);
        ctx.closePath();
        ctx.fill();

        // Контур граней
        ctx.strokeStyle = 'rgba(30,20,10,0.5)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(leftX, base);
        ctx.lineTo(pk.x, topY);
        ctx.lineTo(rightX, base);
        ctx.stroke();

        // Снежная шапка на самом высоком пике
        if (pk.h > 0.65) {
          const snowH = GRID_SIZE * pk.h * 0.28;
          const snowHalfW = halfW * 0.4;
          ctx.fillStyle = '#eef2f0';
          ctx.beginPath();
          ctx.moveTo(pk.x, topY);
          ctx.lineTo(pk.x - snowHalfW, topY + snowH);
          ctx.lineTo(pk.x + snowHalfW * 0.6, topY + snowH * 0.9);
          ctx.closePath();
          ctx.fill();
        }
      }
    } else if (type === 'water') {
      ctx.strokeStyle = colors.light;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        const wy = py + 6 + i * 9 + seed(i) * 4;
        ctx.beginPath();
        ctx.moveTo(px + 2, wy);
        ctx.quadraticCurveTo(px + GRID_SIZE / 2, wy - 4, px + GRID_SIZE - 2, wy);
        ctx.stroke();
      }
    } else if (type === 'sand') {
      ctx.fillStyle = colors.dark;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 10; i++) {
        const bx = px + seed(i) * GRID_SIZE;
        const by = py + seed(i + 15) * GRID_SIZE;
        ctx.fillRect(bx, by, 1.5, 1.5);
      }
    } else if (type === 'snow') {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 8; i++) {
        const bx = px + seed(i) * GRID_SIZE;
        const by = py + seed(i + 15) * GRID_SIZE;
        ctx.beginPath();
        ctx.arc(bx, by, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'road' || type === 'dungeon' || type === 'wall') {
      ctx.strokeStyle = colors.dark;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      const rows = 3;
      for (let r = 0; r < rows; r++) {
        const by = py + (r + 1) * (GRID_SIZE / (rows + 1));
        const offset = r % 2 === 0 ? 0 : GRID_SIZE / 2;
        ctx.beginPath();
        ctx.moveTo(px, by);
        ctx.lineTo(px + GRID_SIZE, by);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + offset, by - GRID_SIZE / (rows + 1));
        ctx.lineTo(px + offset, by);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  const PROP_LIBRARY = {
    town: [
      { id: 'house1', name: 'Дом (коттедж)', drawIcon: drawHouseCottage, footprint: 2 },
      { id: 'house2', name: 'Дом (камень)', drawIcon: drawHouseStone, footprint: 2 },
      { id: 'house3', name: 'Дом (брус)', drawIcon: drawHouseTimber, footprint: 2 },
      { id: 'house4', name: 'Дом (высокий)', drawIcon: drawHouseTall, footprint: 2 },
      { id: 'house5', name: 'Дом (маленький)', drawIcon: drawHouseSmall, footprint: 1 },
      { id: 'house6', name: 'Дом с забором', drawIcon: drawHouseWithFence, footprint: 3 },
      { id: 'watchtower', name: 'Сторожевая башня', drawIcon: drawWatchtower, footprint: 2 },
      { id: 'castle', name: 'Замок', drawIcon: drawCastle, footprint: 5 },
      { id: 'gate', name: 'Городские ворота', drawIcon: drawCityGate, footprint: 2 },
      { id: 'market', name: 'Рынок', drawIcon: drawMarketStall, footprint: 2 },
      { id: 'well', name: 'Колодец', drawIcon: drawWell, footprint: 1 },
      { id: 'temple', name: 'Храм', drawIcon: drawTemple, footprint: 3 },
      { id: 'tavern', name: 'Таверна', drawIcon: drawTavern, footprint: 3 },
      { id: 'forge', name: 'Кузница', drawIcon: drawForge, footprint: 2 },
      { id: 'windmill', name: 'Мельница', drawIcon: drawWindmill, footprint: 2 },
      { id: 'dock', name: 'Пристань', drawIcon: drawDock, footprint: 2 },
      { id: 'farm', name: 'Ферма', drawIcon: drawFarm, footprint: 3 },
      { id: 'fence', name: 'Забор', drawIcon: drawFence, footprint: 1 },
      { id: 'bridge', name: 'Деревянный мост', drawIcon: drawBridge, footprint: 2 }
    ],
    dungeon: [
      { id: 'dwall', name: 'Каменная стена', drawIcon: drawDungeonWall, footprint: 1 },
      { id: 'door', name: 'Дверь', drawIcon: drawDoor, footprint: 1 },
      { id: 'sdoor', name: 'Скрытая дверь', drawIcon: drawSecretDoor, footprint: 1 },
      { id: 'stairup', name: 'Лестница вверх', drawIcon: drawStairsUp, footprint: 1 },
      { id: 'stairdown', name: 'Лестница вниз', drawIcon: drawStairsDown, footprint: 1 },
      { id: 'pillar', name: 'Колонна', drawIcon: drawPillar, footprint: 1 },
      { id: 'torch', name: 'Факел', drawIcon: drawTorch, footprint: 1 },
      { id: 'chest', name: 'Сундук', drawIcon: drawChest, footprint: 1 },
      { id: 'trap', name: 'Ловушка', drawIcon: drawTrap, footprint: 1 },
      { id: 'altar', name: 'Алтарь', drawIcon: drawAltar, footprint: 2 },
      { id: 'cage', name: 'Клетка', drawIcon: drawCage, footprint: 1 },
      { id: 'rubble', name: 'Развалины', drawIcon: drawRubble, footprint: 1 },
      { id: 'pit', name: 'Пропасть', drawIcon: drawPit, footprint: 1 },
      { id: 'statue', name: 'Статуя', drawIcon: drawStatue, footprint: 1 }
    ],
    nature: [
      { id: 'tree1', name: 'Лиственное дерево', drawIcon: drawTreeDeciduous, footprint: 1 },
      { id: 'tree2', name: 'Хвойное дерево', drawIcon: drawTreePine, footprint: 1 },
      { id: 'bush', name: 'Куст', drawIcon: drawBush, footprint: 1 },
      { id: 'rock', name: 'Скальное образование', drawIcon: drawRockCluster, footprint: 1 },
      { id: 'boulder', name: 'Валун', drawIcon: drawBoulder, footprint: 1 },
      { id: 'flower', name: 'Цветы', drawIcon: drawFlowerPatch, footprint: 1 },
      { id: 'pond', name: 'Пруд', drawIcon: drawPond, footprint: 2 },
      { id: 'river', name: 'Река', drawIcon: drawRiverBend, footprint: 2 },
      { id: 'grave', name: 'Надгробие', drawIcon: drawGravestone, footprint: 1 },
      { id: 'campfire', name: 'Костёр', drawIcon: drawCampfire, footprint: 1 }
    ]
  };

  const state = {
    mapWidth: 50,
    mapHeight: 50,
    terrain: new Map(),
    props: [],
    selectedProp: -1,
    tool: 'paint',
    selectedTerrainType: 'grass',
    brushSize: 20,
    currentMode: 'town',
    showGrid: true,
    snapToGrid: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDraggingProp: false,
    history: [],
    historyIndex: -1,
    selectedPropId: null
  };

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('fileInput');

  // Town buildings - detailed top-down views
  // ===== TOWN BUILDINGS - Detailed Top-Down Views =====
  
  // ===== TOWN BUILDINGS - Pure Top-Down (Roof-Only) Views =====

  // Общий помощник: двускатная крыша, вид строго сверху.
  // hw/hh - половина ширины/высоты footprint-а; ridgeDir: 'h' (конёк горизонтальный) или 'v' (вертикальный)
  function drawGableRoofTop(ctx, hw, hh, ridgeDir, colorLight, colorMid, colorDark) {
    ctx.save();
    // Тень от свеса крыши на землю
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-hw + 1.5, -hh + 2.5, hw * 2, hh * 2, 1) : ctx.rect(-hw + 1.5, -hh + 2.5, hw * 2, hh * 2);
    ctx.fill();

    if (ridgeDir === 'h') {
      const g1 = ctx.createLinearGradient(0, -hh, 0, 0);
      g1.addColorStop(0, colorLight);
      g1.addColorStop(1, colorMid);
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(hw, 0); ctx.lineTo(-hw, 0);
      ctx.closePath(); ctx.fill();

      const g2 = ctx.createLinearGradient(0, 0, 0, hh);
      g2.addColorStop(0, colorMid);
      g2.addColorStop(1, colorDark);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(-hw, 0); ctx.lineTo(hw, 0); ctx.lineTo(hw, hh); ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();

      // конёк
      ctx.strokeStyle = colorDark;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(hw, 0); ctx.stroke();
      // ряды черепицы/досок
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.6;
      for (let y = -hh + 2; y < hh; y += 3) {
        if (Math.abs(y) < 0.8) continue;
        ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
      }
    } else {
      const g1 = ctx.createLinearGradient(-hw, 0, 0, 0);
      g1.addColorStop(0, colorMid);
      g1.addColorStop(1, colorLight);
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh); ctx.lineTo(0, -hh); ctx.lineTo(0, hh); ctx.lineTo(-hw, hh);
      ctx.closePath(); ctx.fill();

      const g2 = ctx.createLinearGradient(0, 0, hw, 0);
      g2.addColorStop(0, colorMid);
      g2.addColorStop(1, colorDark);
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(0, -hh); ctx.lineTo(hw, -hh); ctx.lineTo(hw, hh); ctx.lineTo(0, hh);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = colorDark;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -hh); ctx.lineTo(0, hh); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 0.6;
      for (let x = -hw + 2; x < hw; x += 3) {
        if (Math.abs(x) < 0.8) continue;
        ctx.beginPath(); ctx.moveTo(x, -hh); ctx.lineTo(x, hh); ctx.stroke();
      }
    }
    // контур свеса
    ctx.strokeStyle = colorDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
    ctx.restore();
  }

  function drawChimney(ctx, x, y) {
    ctx.fillStyle = '#5c4a3c';
    ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
    ctx.strokeStyle = '#3a2e24';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 1.2, y - 1.2, 2.4, 2.4);
  }

  function drawDoorNotch(ctx, x, y, horizontal) {
    // Небольшой проём/дорожка у входа - виден как светлая плитка у края крыши
    ctx.fillStyle = '#9c8564';
    if (horizontal) ctx.fillRect(x - 1.5, y - 0.8, 3, 1.6);
    else ctx.fillRect(x - 0.8, y - 1.5, 1.6, 3);
  }

  function drawHouseCottage(ctx) {
    // Дом (коттедж) - черепичная двускатная крыша, конёк вдоль Y
    drawGableRoofTop(ctx, 9, 6, 'v', '#e05a4a', '#c23a2d', '#8c2419');
    drawChimney(ctx, 5, -4);
    drawDoorNotch(ctx, 0, 6, true);
  }

  function drawHouseStone(ctx) {
    // Дом (камень) - серо-синяя шиферная крыша, конёк вдоль X
    drawGableRoofTop(ctx, 10, 7, 'h', '#7d99a8', '#536b7a', '#2e4350');
    drawChimney(ctx, -6, -5);
    drawDoorNotch(ctx, 0, 7, true);
  }

  function drawHouseTimber(ctx) {
    // Дом (брус) - коричневая деревянная крыша с конёк по Y
    drawGableRoofTop(ctx, 9, 6, 'v', '#b08552', '#8b6239', '#5c3f22');
    drawDoorNotch(ctx, 0, 6, true);
  }

  function drawHouseTall(ctx) {
    // Высокий дом - крупная ярко-красная крыша
    drawGableRoofTop(ctx, 8, 9, 'h', '#ff5c4c', '#d5362a', '#8f1f16');
    drawChimney(ctx, 5, -7);
    drawDoorNotch(ctx, 0, 9, true);
  }

  function drawHouseSmall(ctx) {
    // Маленький дом - компактная крыша
    drawGableRoofTop(ctx, 6, 5, 'v', '#c2634e', '#9c4332', '#6b2b1f');
    drawDoorNotch(ctx, 0, 5, true);
  }

  function drawHouseWithFence(ctx) {
    // Дом с забором - крыша + видимый сверху участок с изгородью по периметру
    drawGableRoofTop(ctx, 8, 6, 'v', '#e05a4a', '#c23a2d', '#8c2419');
    drawChimney(ctx, 4, -4);
    drawDoorNotch(ctx, 0, 6, true);
    // Изгородь по контуру участка (видна сверху как тонкая линия с кольями)
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-14, -10, 28, 20);
    ctx.fillStyle = '#a0826d';
    for (let x = -13; x <= 13; x += 4) {
      ctx.fillRect(x - 0.5, -10.5, 1, 1.2);
      ctx.fillRect(x - 0.5, 9.3, 1, 1.2);
    }
    for (let y = -9; y <= 9; y += 4) {
      ctx.fillRect(-14.5, y - 0.5, 1.2, 1);
      ctx.fillRect(13.3, y - 0.5, 1.2, 1);
    }
  }
  
  function drawWatchtower(ctx) {
    // Круглая каменная башня с остроконечной крышей
    const towerGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 9);
    towerGrad.addColorStop(0, '#c2b296');
    towerGrad.addColorStop(1, '#8a7a62');
    ctx.fillStyle = towerGrad;
    ctx.beginPath();
    ctx.arc(0, 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a4e3c';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Каменная кладка (горизонтальные полосы)
    ctx.strokeStyle = 'rgba(80,65,45,0.4)';
    ctx.lineWidth = 0.6;
    for (let r = -8; r <= 10; r += 3) {
      ctx.beginPath();
      ctx.moveTo(-8.5, 2 + r * 0.9);
      ctx.lineTo(8.5, 2 + r * 0.9);
      ctx.stroke();
    }

    // Пара бойниц
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(-1, -2, 2, 5);
    ctx.fillRect(-6, 3, 1.6, 4);
    ctx.fillRect(4.4, 3, 1.6, 4);

    // Зубчатый парапет под крышей
    ctx.fillStyle = '#9a8a6e';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const x = Math.cos(a) * 9.5;
      const y = Math.sin(a) * 9.5 + 2;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }

    // Остроконечная коническая крыша (явный треугольный силуэт)
    const roofGrad = ctx.createLinearGradient(0, -16, 0, -2);
    roofGrad.addColorStop(0, '#9c3d2e');
    roofGrad.addColorStop(1, '#6e2a1f');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(8, -2);
    ctx.quadraticCurveTo(0, 2, -8, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a1e15';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Флажок
    ctx.strokeStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(0, -20);
    ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(4, -18.5);
    ctx.lineTo(0, -17);
    ctx.fill();
  }
  
  function drawCastle(ctx) {
    // Замок: центральный зал + четыре угловые башни с коническими крышами
    const wallGrad = ctx.createLinearGradient(-12, -8, 12, 8);
    wallGrad.addColorStop(0, '#c9b896');
    wallGrad.addColorStop(0.5, '#b3a07c');
    wallGrad.addColorStop(1, '#93815f');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-12, -6, 24, 12);
    ctx.strokeStyle = '#5a4e3c';
    ctx.lineWidth = 0.6;
    for (let x = -10; x <= 10; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, -6);
      ctx.lineTo(x, 6);
      ctx.stroke();
    }

    // Угловые башни (круглые, не прямоугольные "железные")
    const towers = [[-14, -8], [14, -8], [-14, 8], [14, 8]];
    for (const [tx, ty] of towers) {
      const tg = ctx.createRadialGradient(tx - 1, ty - 1, 1, tx, ty, 4.5);
      tg.addColorStop(0, '#c2b296');
      tg.addColorStop(1, '#8a7a62');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a4e3c';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      // Коническая крыша башни
      ctx.fillStyle = '#7a2a20';
      ctx.beginPath();
      ctx.moveTo(tx, ty - 9);
      ctx.lineTo(tx + 4, ty - 1);
      ctx.lineTo(tx - 4, ty - 1);
      ctx.closePath();
      ctx.fill();
    }

    // Зубцы на главной стене
    ctx.fillStyle = '#b3a07c';
    for (let x = -11; x <= 11; x += 3) {
      ctx.fillRect(x - 1, -8, 2, 2);
    }

    // Главные ворота с решёткой
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(-5, -3, 10, 9);
    ctx.strokeStyle = '#6e5c42';
    ctx.lineWidth = 0.7;
    for (let x = -4; x <= 4; x += 2) {
      ctx.beginPath();
      ctx.moveTo(x, -3);
      ctx.lineTo(x, 6);
      ctx.stroke();
    }

    // Флаг на центральной башне
    ctx.strokeStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -12);
    ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, -10.5);
    ctx.lineTo(0, -9);
    ctx.fill();
  }
  
  function drawForge(ctx) {
    // Кузница: крыша сверху (вид строго сверху), дымоход/горн/наковальня внутри контура крыши
    drawGableRoofTop(ctx, 8, 6, 'h', '#7a6a5c', '#564738', '#332a20');
    drawDoorNotch(ctx, 0, 6, true);

    // Дымоход (в пределах крыши, у конька)
    ctx.fillStyle = '#4a3c30';
    ctx.fillRect(4.5, -1, 3, 3);
    ctx.strokeStyle = '#2a2018';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(4.5, -1, 3, 3);

    // Открытый горн со свечением (виден сверху, в левой части крыши)
    ctx.fillStyle = '#2a2420';
    ctx.fillRect(-7, -4, 4.5, 4.5);
    ctx.fillStyle = '#ff6a1f';
    ctx.beginPath();
    ctx.arc(-4.75, -1.75, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffdd55';
    ctx.beginPath();
    ctx.arc(-4.75, -1.75, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Наковальня (правая часть крыши)
    ctx.fillStyle = '#2f2f2f';
    ctx.fillRect(2, 2, 5, 1.8);
    ctx.fillRect(3.7, 0.3, 1.6, 1.8);
  }
  
  function drawCityWall(ctx) {
    // Городская стена с зубцами
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(-13, -1, 26, 6);
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-13, -1, 26, 6);
    
    // Зубцы сверху
    for (let i = -10; i <= 10; i += 5) {
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(i, -3, 3, 2);
    }
  }
  
  function drawCityGate(ctx) {
    // Массивные городские ворота
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(-10, -7, 20, 14);
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -7, 20, 14);
    
    // Ворота - две створки
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(-8, -5, 8, 10);
    ctx.fillRect(0, -5, 8, 10);
    
    // Кольца на воротах
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-4, 0, 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(4, 0, 1.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  function drawMarketStall(ctx) {
    // Рыночный навес - палатка сверху
    const tentGrad = ctx.createLinearGradient(-10, -8, 10, 0);
    tentGrad.addColorStop(0, '#d4a51a');
    tentGrad.addColorStop(0.5, '#ffcc33');
    tentGrad.addColorStop(1, '#d4a51a');
    ctx.fillStyle = tentGrad;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(0, -10);
    ctx.lineTo(11, 0);
    ctx.fill();
    
    // Каркас палатки
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(0, -10);
    ctx.lineTo(11, 0);
    ctx.stroke();
    
    // Столы снизу
    ctx.fillStyle = '#a0826d';
    ctx.fillRect(-10, 1, 8, 6);
    ctx.fillRect(2, 1, 8, 6);
    
    // Товары
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-8, 2, 3, 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(-3, 2, 3, 2);
  }
  
  function drawWell(ctx) {
    // Колодец
    const stoneGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 8);
    stoneGrad.addColorStop(0, '#a0a0a0');
    stoneGrad.addColorStop(1, '#6a6a6a');
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур кольца
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Крышка сверху
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-6, -2, 12, 2);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -2, 12, 2);
    
    // Внутри видна вода
    ctx.fillStyle = 'rgba(30, 144, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawTemple(ctx) {
    // Храм - крестообразный
    ctx.fillStyle = '#e8d7c3';
    ctx.fillRect(-4, -11, 8, 12);
    ctx.fillRect(-11, -4, 22, 8);
    
    // Крыша-купол
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур купола
    ctx.strokeStyle = '#a0821d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Колонны
    ctx.fillStyle = '#a0826d';
    ctx.fillRect(-8, -3, 2, 6);
    ctx.fillRect(-4, -3, 2, 6);
    ctx.fillRect(2, -3, 2, 6);
    ctx.fillRect(6, -3, 2, 6);
  }
  
  function drawTavern(ctx) {
    // Таверна - крыша с вывеской и дымоходом, вид сверху
    drawGableRoofTop(ctx, 9, 7, 'v', '#c87a3e', '#9c5826', '#6b3a18');
    drawChimney(ctx, -6, -5);
    drawDoorNotch(ctx, 0, 7, true);
    // Вывеска на кронштейне у входа
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(-5, 8.5, 5, 2.2);
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-5, 8.5, 5, 2.2);
  }
  
  function drawWindmill(ctx) {
    // Мельница - тело + лопасти
    ctx.fillStyle = '#a0826d';
    ctx.beginPath();
    ctx.arc(0, 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Лопасти
    ctx.fillStyle = '#e8c9a8';
    ctx.fillRect(-1, -10, 2, 12);
    ctx.fillRect(-10, 1, 20, 2);
    
    // Тень на лопастях
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-0.5, -8, 1, 8);
    ctx.fillRect(-8, 1.5, 16, 1);
  }
  
  function drawDock(ctx) {
    // Пристань - доки/причалы
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-10, -2, 20, 4);
    ctx.fillStyle = '#a0826d';
    ctx.fillRect(-10, 2, 20, 4);
    
    // Столбы
    ctx.fillStyle = '#5c4a2f';
    ctx.fillRect(-8, -1, 1.5, 8);
    ctx.fillRect(-2, -1, 1.5, 8);
    ctx.fillRect(5, -1, 1.5, 8);
    
    // Вода
    ctx.fillStyle = 'rgba(30, 144, 255, 0.3)';
    ctx.fillRect(-12, 6, 24, 2);
  }
  
  function drawFarm(ctx) {
    // Ферма - сарай (вид сверху: только крыша) + огород рядом
    drawGableRoofTop(ctx, 8, 6, 'v', '#d5564a', '#a93a2f', '#6e241c');
    drawDoorNotch(ctx, 0, 6, true);
    // Огород сбоку - ряды грядок
    ctx.fillStyle = '#5c4a32';
    ctx.fillRect(10, -6, 10, 12);
    ctx.strokeStyle = '#3e3120';
    ctx.lineWidth = 0.5;
    for (let j = -5; j <= 5; j += 3) {
      ctx.beginPath();
      ctx.moveTo(10, j);
      ctx.lineTo(20, j);
      ctx.stroke();
    }
    ctx.fillStyle = '#4db876';
    for (let i = 11; i <= 19; i += 3) {
      for (let j = -5; j <= 5; j += 3) {
        ctx.beginPath();
        ctx.arc(i, j, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  function drawFence(ctx) {
    // Просто забор - горизонтальные доски со штакетинами
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(12, -2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, 2);
    ctx.lineTo(12, 2);
    ctx.stroke();
    
    // Штакетины
    ctx.fillStyle = '#a0826d';
    for (let i = -10; i <= 10; i += 3) {
      ctx.fillRect(i, -3, 2, 6);
    }
  }
  
  function drawBridge(ctx) {
    // Деревянный мост
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-11, -2, 22, 4);
    
    // Доски моста
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 0.5;
    for (let i = -10; i <= 10; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i, 2);
      ctx.stroke();
    }
    
    // Тросы/опоры
    ctx.strokeStyle = '#a0826d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-11, -2);
    ctx.lineTo(-9, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.lineTo(9, -6);
    ctx.stroke();
  }
  
  // ===== DUNGEON PROPS - Dark, Cold, Stone & Iron =====
  
  function drawDungeonWall(ctx) {
    // Каменная стена
    const wallGrad = ctx.createLinearGradient(-10, -8, 10, 8);
    wallGrad.addColorStop(0, '#8a8a8a');
    wallGrad.addColorStop(0.5, '#6a6a6a');
    wallGrad.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-11, -8, 22, 16);
    
    // Трещины
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(8, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.lineTo(-3, 6);
    ctx.stroke();
  }
  
  function drawDoor(ctx) {
    // Деревянная дверь
    ctx.fillStyle = '#5c3a1f';
    ctx.fillRect(-7, -8, 14, 16);
    ctx.strokeStyle = '#3a2a1f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-7, -8, 14, 16);
    
    // Дверные планки
    ctx.strokeStyle = '#3a2a1f';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(7, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, 4);
    ctx.lineTo(7, 4);
    ctx.stroke();
    
    // Замочная скважина
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawSecretDoor(ctx) {
    // Скрытая дверь - выглядит как стена
    const wallGrad = ctx.createLinearGradient(-7, -8, 7, 8);
    wallGrad.addColorStop(0, '#888888');
    wallGrad.addColorStop(0.5, '#686868');
    wallGrad.addColorStop(1, '#484848');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-8, -8, 16, 16);
    
    // Тонкая трещина показывает где дверь
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(-0.5, -8);
    ctx.lineTo(-0.5, 8);
    ctx.stroke();
  }
  
  function drawStairsUp(ctx) {
    // Лестница вверх
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(-8 + i * 4, -1 - i * 3, 4, 3);
      ctx.strokeStyle = '#6a6a6a';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-8 + i * 4, -1 - i * 3, 4, 3);
    }
    
    // Стрелка вверх
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(-1, -10);
    ctx.lineTo(1, -10);
    ctx.lineTo(0, -12);
    ctx.fill();
  }
  
  function drawStairsDown(ctx) {
    // Лестница вниз
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(-8 + i * 4, 1 + i * 3, 4, 3);
      ctx.strokeStyle = '#6a6a6a';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-8 + i * 4, 1 + i * 3, 4, 3);
    }
    
    // Стрелка вниз
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(-1, 10);
    ctx.lineTo(1, 10);
    ctx.lineTo(0, 12);
    ctx.fill();
  }
  
  function drawPillar(ctx) {
    // Колонна
    const pillarGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 7);
    pillarGrad.addColorStop(0, '#b0b0b0');
    pillarGrad.addColorStop(1, '#7a7a7a');
    ctx.fillStyle = pillarGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Выпуклые кольца
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(0, -3, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 3, 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  function drawTorch(ctx) {
    // Факел на стене
    // Стержень
    ctx.fillStyle = '#5c4a2f';
    ctx.fillRect(-1.5, -8, 3, 10);
    
    // Огонь - языки пламени
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.quadraticCurveTo(-2, -7, 0, -9);
    ctx.quadraticCurveTo(2, -7, 3, -3);
    ctx.fill();
    
    // Внутренняя часть пламени - ярче
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.quadraticCurveTo(-1, -6, 0, -7);
    ctx.quadraticCurveTo(1, -6, 2, -4);
    ctx.fill();
  }
  
  function drawChest(ctx) {
    // Сундук
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-8, -2, 16, 10);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -2, 16, 10);
    
    // Крышка
    ctx.fillStyle = '#a0826d';
    ctx.beginPath();
    ctx.arc(-8, -2, 3, 0, Math.PI, true);
    ctx.arc(8, -2, 3, Math.PI, 0, true);
    ctx.fill();
    
    // Замок
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-1, 2, 2, 2);
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(0, 3, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawTrap(ctx) {
    // Ловушка - выглядит опасно
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(-10, -8, 20, 16);
    
    // Шипы
    ctx.fillStyle = '#cc3333';
    for (let i = -8; i <= 8; i += 4) {
      for (let j = -6; j <= 6; j += 5) {
        ctx.beginPath();
        ctx.moveTo(i, j);
        ctx.lineTo(i + 1.5, j - 3);
        ctx.lineTo(i - 1.5, j - 3);
        ctx.fill();
      }
    }
  }
  
  function drawAltar(ctx) {
    // Алтарь
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-10, -4, 20, 10);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -4, 20, 10);
    
    // Верхняя часть с символом
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(3, -2);
    ctx.lineTo(0, -1);
    ctx.lineTo(-3, -2);
    ctx.fill();
  }
  
  function drawCage(ctx) {
    // Клетка - решётка
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -8, 16, 16);
    
    // Вертикальные прутья
    for (let i = -6; i <= 6; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -8);
      ctx.lineTo(i, 8);
      ctx.stroke();
    }
    
    // Горизонтальные прутья
    for (let j = -6; j <= 6; j += 3) {
      ctx.beginPath();
      ctx.moveTo(-8, j);
      ctx.lineTo(8, j);
      ctx.stroke();
    }
  }
  
  function drawRubble(ctx) {
    // Развалины - камни
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(-10, 0, 8, 8);
    ctx.fillRect(-2, -6, 9, 8);
    ctx.fillRect(3, 2, 8, 6);
    
    // Трещины
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-10, 2);
    ctx.lineTo(-2, 4);
    ctx.stroke();
  }
  
  function drawPit(ctx) {
    // Пропасть
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Край с трещинами
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 8;
      const y = Math.sin(a) * 8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x * 1.2, y * 1.2);
      ctx.stroke();
    }
  }
  
  function drawStatue(ctx) {
    // Статуя
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(-5, -8, 10, 8);
    ctx.beginPath();
    ctx.arc(0, -8, 5, 0, Math.PI, true);
    ctx.fill();
    
    // Постамент
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(-7, 0, 14, 6);
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, 0, 14, 6);
  }
  
  // ===== NATURE PROPS - Organic, Green, Water, Rocks =====
  
  function drawTreeDeciduous(ctx) {
    // Лиственное дерево - вид строго сверху: округлая крона, ствол скрыт под кроной
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0.8, 1, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const treeGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 9);
    treeGrad.addColorStop(0, '#5ed16a');
    treeGrad.addColorStop(0.55, '#2d8a3a');
    treeGrad.addColorStop(1, '#17421f');
    ctx.fillStyle = treeGrad;
    ctx.beginPath();
    // неровный контур кроны (несколько перекрывающихся лепестков листвы)
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-4, -3, 4, 0, Math.PI * 2);
    ctx.arc(4, -3, 4, 0, Math.PI * 2);
    ctx.arc(-4, 4, 4, 0, Math.PI * 2);
    ctx.arc(4, 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // пятна светотени для объёма листвы
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(-3, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.arc(3, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // тень ствола в центре (виден только намёк, т.к. скрыт кроной)
    ctx.fillStyle = 'rgba(30,20,10,0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTreePine(ctx) {
    // Хвойное дерево - вид строго сверху: звездчатая/зубчатая крона
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0.8, 1, 7.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const needleGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 8.5);
    needleGrad.addColorStop(0, '#3d7c4a');
    needleGrad.addColorStop(0.6, '#1d4d2a');
    needleGrad.addColorStop(1, '#0e2e16');
    ctx.fillStyle = needleGrad;
    ctx.beginPath();
    const spikes = 8;
    for (let i = 0; i < spikes; i++) {
      const a1 = (i / spikes) * Math.PI * 2;
      const a2 = ((i + 0.5) / spikes) * Math.PI * 2;
      const rOuter = 8.5;
      const rInner = 5.5;
      ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0e2e16';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(30,20,10,0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawBush(ctx) {
    // Куст - несколько перекрывающихся кругов
    ctx.fillStyle = '#3d7c4a';
    ctx.beginPath();
    ctx.arc(-3, -1, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(3, -1, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Светлые блики
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.arc(-2, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2, -4, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawRockCluster(ctx) {
    // Скальное образование - острые камни
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 2);
    ctx.lineTo(6, 8);
    ctx.lineTo(-6, 8);
    ctx.lineTo(-8, 2);
    ctx.fill();
    
    // Второй камень
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(3, 0);
    ctx.lineTo(2, 6);
    ctx.lineTo(-6, 4);
    ctx.fill();
    
    // Тень
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(-6, 7, 12, 1);
  }
  
  function drawBoulder(ctx) {
    // Валун - большой округлый камень
    const boulderGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 10);
    boulderGrad.addColorStop(0, '#c0c0c0');
    boulderGrad.addColorStop(0.7, '#8a8a8a');
    boulderGrad.addColorStop(1, '#6a6a6a');
    ctx.fillStyle = boulderGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Трещины
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-5, -6);
    ctx.lineTo(3, 5);
    ctx.stroke();
  }
  
  function drawFlowerPatch(ctx) {
    // Цветы - яркие пятна
    ctx.fillStyle = '#ff6b9d';
    for (let i = -4; i <= 4; i += 3) {
      ctx.beginPath();
      ctx.arc(i, -2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = '#ffb6c1';
    for (let j = 0; j <= 4; j += 3) {
      ctx.beginPath();
      ctx.arc(j - 2, 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Стебли
    ctx.strokeStyle = '#4db876';
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i, 2);
      ctx.stroke();
    }
  }
  
  function drawPond(ctx) {
    // Пруд - водоём с берегом
    ctx.fillStyle = '#1e5a96';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Блик света на воде
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(-3, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Берег
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  function drawRiverBend(ctx) {
    // Река - изогнутая полоса воды
    ctx.fillStyle = '#1e5a96';
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.quadraticCurveTo(-8, 0, -4, 6);
    ctx.lineTo(4, 6);
    ctx.quadraticCurveTo(8, 0, 10, -6);
    ctx.closePath();
    ctx.fill();
    
    // Блики
    ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(-6, 0, -4, 2);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  function drawGravestone(ctx) {
    // Надгробие
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 4);
    ctx.lineTo(-6, 4);
    ctx.fill();
    
    // Перекладина
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(-4, 0, 8, 1);
    
    // Крест
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(2, -2);
    ctx.stroke();
  }
  
  function drawCampfire(ctx) {
    // Костёр
    // Дрова
    ctx.fillStyle = '#5c4a2f';
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(-5, -2);
    ctx.lineTo(-2, 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(3, 6);
    ctx.lineTo(5, -2);
    ctx.lineTo(2, 2);
    ctx.fill();
    
    // Пламя - три уровня
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.quadraticCurveTo(0, -4, 2, 2);
    ctx.lineTo(1, 4);
    ctx.lineTo(-1, 4);
    ctx.fill();
    
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.quadraticCurveTo(0, -2, 1, 0);
    ctx.lineTo(0.5, 2);
    ctx.lineTo(-0.5, 2);
    ctx.fill();
    
    // Углы
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-4, 4, 2, 2);
    ctx.fillRect(2, 4, 2, 2);
  }


  function pixelToGrid(px, py) {
    const gx = Math.floor(px / GRID_SIZE);
    const gy = Math.floor(py / GRID_SIZE);
    return { gx, gy, label: String.fromCharCode(65 + (gx % 26)) + (gy + 1) };
  }

  function saveHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push({
      terrain: new Map(state.terrain),
      props: state.props.map(p => ({ ...p }))
    });
    state.historyIndex++;
    updateHistoryButtons();
  }

  function paintTerrain(px, py) {
    const centerGx = Math.floor(px / GRID_SIZE);
    const centerGy = Math.floor(py / GRID_SIZE);
    const radiusCells = state.brushSize / GRID_SIZE;

    if (radiusCells <= 0.5) {
      // Минимальная кисть - ровно одна клетка (можно рисовать линии 1x1)
      state.terrain.set(centerGx + ',' + centerGy, state.selectedTerrainType);
      return;
    }

    const spanCells = Math.ceil(radiusCells);
    for (let gx = centerGx - spanCells; gx <= centerGx + spanCells; gx++) {
      for (let gy = centerGy - spanCells; gy <= centerGy + spanCells; gy++) {
        const dist = Math.hypot(gx - centerGx, gy - centerGy);
        if (dist <= radiusCells) {
          const key = gx + ',' + gy;
          state.terrain.set(key, state.selectedTerrainType);
        }
      }
    }
  }

  function render() {
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(state.panX, state.panY);
    ctx.scale(state.zoom, state.zoom);

    for (const [key, terrain] of state.terrain) {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * GRID_SIZE;
      const py = gy * GRID_SIZE;

      const colors = TERRAIN_TYPES[terrain];
      ctx.fillStyle = colors.color;
      ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);

      drawTerrainTexture(ctx, gx, gy, px, py, terrain, colors);

      ctx.strokeStyle = colors.dark;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, GRID_SIZE, GRID_SIZE);
      ctx.globalAlpha = 1;
    }

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

    // Рамка границы карты
    ctx.strokeStyle = '#d4a52a';
    ctx.lineWidth = 3 / state.zoom;
    ctx.strokeRect(0, 0, state.mapWidth * GRID_SIZE, state.mapHeight * GRID_SIZE);

    for (let i = 0; i < state.props.length; i++) {
      const prop = state.props[i];
      const px = prop.x;
      const py = prop.y;
      const propDef = findPropDefinition(prop.propId);
      const footprint = (propDef && propDef.footprint) || 1;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((prop.rotation * Math.PI) / 180);
      ctx.scale(prop.scale * ICON_SCALE * footprint, prop.scale * ICON_SCALE * footprint);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      if (propDef && propDef.drawIcon) {
        propDef.drawIcon(ctx);
      }

      ctx.restore();

      if (state.selectedProp === i) {
        const halfPx = (footprint * GRID_SIZE) / 2 + 2;
        ctx.save();
        ctx.translate(px, py);
        ctx.strokeStyle = '#2ee6a0';
        ctx.lineWidth = 2 / state.zoom;
        ctx.setLineDash([4 / state.zoom, 3 / state.zoom]);
        ctx.strokeRect(-halfPx, -halfPx, halfPx * 2, halfPx * 2);
        ctx.restore();
      }
    }

    ctx.restore();

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

  let isMouseDown = false;
  let paintHistory = false;
  let isDraggingProp = false;
  let dragOffset = { x: 0, y: 0 };

  function hitTestProp(worldX, worldY) {
    // Ищем верхний (последний нарисованный) объект под курсором
    for (let i = state.props.length - 1; i >= 0; i--) {
      const prop = state.props[i];
      const propDef = findPropDefinition(prop.propId);
      const footprint = (propDef && propDef.footprint) || 1;
      const half = (footprint * GRID_SIZE) / 2;
      if (Math.abs(worldX - prop.x) <= half && Math.abs(worldY - prop.y) <= half) {
        return i;
      }
    }
    return -1;
  }

  function removeOverlappingProps(x, y, footprint) {
    const half = (footprint * GRID_SIZE) / 2;
    for (let i = state.props.length - 1; i >= 0; i--) {
      const other = state.props[i];
      const otherDef = findPropDefinition(other.propId);
      const otherFootprint = (otherDef && otherDef.footprint) || 1;
      const otherHalf = (otherFootprint * GRID_SIZE) / 2;
      const dist = Math.hypot(x - other.x, y - other.y);
      if (dist < (half + otherHalf) * 0.55) {
        state.props.splice(i, 1);
      }
    }
  }

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = (canvasX - state.panX) / state.zoom;
    const worldY = (canvasY - state.panY) / state.zoom;

    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      state.panStart = { x: canvasX, y: canvasY };
    } else if (e.button === 0) {
      if (state.tool === 'select') {
        const hit = hitTestProp(worldX, worldY);
        state.selectedProp = hit;
        if (hit >= 0) {
          isDraggingProp = true;
          dragOffset.x = worldX - state.props[hit].x;
          dragOffset.y = worldY - state.props[hit].y;
        }
        render();
      } else if (state.selectedPropId) {
        const propDef = findPropDefinition(state.selectedPropId);
        const footprint = (propDef && propDef.footprint) || 1;
        let px, py;
        if (state.snapToGrid) {
          // Привязка к сетке: якорим так, чтобы центр постройки совпал с ближайшим узлом сетки
          px = Math.round(worldX / GRID_SIZE) * GRID_SIZE;
          py = Math.round(worldY / GRID_SIZE) * GRID_SIZE;
        } else {
          // Без привязки: ставим ровно в точку клика
          px = worldX;
          py = worldY;
        }
        // Не даём объектам накладываться друг на друга - убираем то, что было на этом месте
        removeOverlappingProps(px, py, footprint);
        state.props.push({
          propId: state.selectedPropId,
          x: px,
          y: py,
          rotation: 0,
          scale: 1
        });
        saveHistory();
        render();
      } else {
        isMouseDown = true;
        paintTerrain(worldX, worldY);
        paintHistory = true;
        render();
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = (canvasX - state.panX) / state.zoom;
    const worldY = (canvasY - state.panY) / state.zoom;

    const { label } = pixelToGrid(worldX, worldY);
    document.getElementById('gridCoords').textContent = label;

    if (e.buttons === 4 || (e.buttons === 1 && e.shiftKey)) {
      const dx = canvasX - state.panStart.x;
      const dy = canvasY - state.panStart.y;
      state.panX += dx;
      state.panY += dy;
      state.panStart = { x: canvasX, y: canvasY };
    } else if (isDraggingProp && state.selectedProp >= 0) {
      const prop = state.props[state.selectedProp];
      let nx = worldX - dragOffset.x;
      let ny = worldY - dragOffset.y;
      if (state.snapToGrid) {
        nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
        ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;
      }
      prop.x = nx;
      prop.y = ny;
    } else if (isMouseDown) {
      paintTerrain(worldX, worldY);
    }

    render();
  });

  canvas.addEventListener('mouseup', (e) => {
    if (isMouseDown && paintHistory) {
      saveHistory();
      paintHistory = false;
    }
    if (isDraggingProp) {
      isDraggingProp = false;
      saveHistory();
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
      state.props.push({ ...prop, x: prop.x + GRID_SIZE, y: prop.y + GRID_SIZE });
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

  document.querySelectorAll('.terrain-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedTerrainType = btn.dataset.terrain;
      state.selectedPropId = null;
      state.tool = 'paint';
      document.getElementById('btnSelectTool').classList.remove('active');
    });
  });

  document.getElementById('brushSize').addEventListener('input', (e) => {
    state.brushSize = parseInt(e.target.value);
    document.getElementById('brushSizeLabel').textContent = e.target.value;
  });

  document.getElementById('btnGrid').addEventListener('click', () => {
    state.showGrid = !state.showGrid;
    document.getElementById('btnGrid').classList.toggle('active', state.showGrid);
    render();
  });

  document.getElementById('btnSnap').addEventListener('click', () => {
    state.snapToGrid = !state.snapToGrid;
    document.getElementById('btnSnap').classList.toggle('active', state.snapToGrid);
  });

  document.getElementById('btnSelectTool').addEventListener('click', () => {
    state.tool = state.tool === 'select' ? 'paint' : 'select';
    document.getElementById('btnSelectTool').classList.toggle('active', state.tool === 'select');
    if (state.tool === 'select') {
      state.selectedPropId = null;
      document.querySelectorAll('.prop-icon').forEach(p => p.classList.remove('selected'));
    }
    render();
  });

  function deleteSelectedProp() {
    if (state.selectedProp >= 0 && state.selectedProp < state.props.length) {
      state.props.splice(state.selectedProp, 1);
      state.selectedProp = -1;
      saveHistory();
      render();
    }
  }

  function rotateSelectedProp() {
    if (state.selectedProp >= 0 && state.selectedProp < state.props.length) {
      const prop = state.props[state.selectedProp];
      prop.rotation = (prop.rotation + 90) % 360;
      saveHistory();
      render();
    }
  }

  document.getElementById('btnDelete').addEventListener('click', deleteSelectedProp);
  document.getElementById('btnRotate').addEventListener('click', rotateSelectedProp);

  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelectedProp();
    } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
      rotateSelectedProp();
    } else if (e.key === 'Escape') {
      state.selectedProp = -1;
      render();
    }
  });

  document.getElementById('modeSelector').addEventListener('change', (e) => {
    state.currentMode = e.target.value;
    const modeLabel = e.target.value === 'town' ? 'Город' : 'Подземелье';
    document.getElementById('modeStatus').textContent = modeLabel;
    updatePropPalette();
  });

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
        alert('Ошибка загрузки карты: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btnExport').addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = state.mapWidth * GRID_SIZE;
    exportCanvas.height = state.mapHeight * GRID_SIZE;
    const exportCtx = exportCanvas.getContext('2d');

    const oldPan = { x: state.panX, y: state.panY };
    const oldZoom = state.zoom;
    state.panX = 0;
    state.panY = 0;
    state.zoom = 1;

    for (const [key, terrain] of state.terrain) {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * GRID_SIZE;
      const py = gy * GRID_SIZE;
      const colors = TERRAIN_TYPES[terrain];
      exportCtx.fillStyle = colors.color;
      exportCtx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
      drawTerrainTexture(exportCtx, gx, gy, px, py, terrain, colors);
    }

    for (const prop of state.props) {
      const px = prop.x;
      const py = prop.y;
      const propDef = findPropDefinition(prop.propId);
      const footprint = (propDef && propDef.footprint) || 1;
      exportCtx.save();
      exportCtx.translate(px, py);
      exportCtx.rotate((prop.rotation * Math.PI) / 180);
      exportCtx.scale(prop.scale * ICON_SCALE * footprint, prop.scale * ICON_SCALE * footprint);
      if (propDef && propDef.drawIcon) {
        propDef.drawIcon(exportCtx);
      }
      exportCtx.restore();
    }

    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dnd-map-' + new Date().getTime() + '.png';
      a.click();
      URL.revokeObjectURL(url);
    });

    state.panX = oldPan.x;
    state.panY = oldPan.y;
    state.zoom = oldZoom;
  });

  function renderPropIcon(canvas, propDef) {
    const canvasCtx = canvas.getContext('2d');
    const SZ = 56;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SZ * DPR;
    canvas.height = SZ * DPR;
    canvas.style.width = SZ + 'px';
    canvas.style.height = SZ + 'px';
    canvasCtx.scale(DPR, DPR);
    canvasCtx.fillStyle = '#f0f0f0';
    canvasCtx.fillRect(0, 0, SZ, SZ);
    canvasCtx.save();
    canvasCtx.translate(SZ / 2, SZ / 2);
    canvasCtx.scale(1.7, 1.7);
    if (propDef.drawIcon) {
      propDef.drawIcon(canvasCtx);
    }
    canvasCtx.restore();
    canvasCtx.strokeStyle = '#ccc';
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeRect(0, 0, SZ, SZ);
  }

  function updatePropPalette() {
    const palette = document.getElementById('propPalette');
    palette.innerHTML = '';
    const activeTab = document.querySelector('.palette-tab.active');
    const category = activeTab ? activeTab.dataset.tab : 'town';
    const filterInput = document.getElementById('propFilter');
    const query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    const props = PROP_LIBRARY[category].filter(p => !query || p.name.toLowerCase().includes(query));
    for (const propDef of props) {
      const btn = document.createElement('button');
      btn.className = 'prop-icon';
      if (state.selectedPropId === propDef.id) {
        btn.classList.add('selected');
      }
      
      const iconCanvas = document.createElement('canvas');
      renderPropIcon(iconCanvas, propDef);
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'prop-name';
      nameDiv.textContent = propDef.name;
      
      btn.appendChild(iconCanvas);
      btn.appendChild(nameDiv);
      
      btn.addEventListener('click', () => {
        state.selectedPropId = propDef.id;
        state.selectedTerrainType = null;
        state.tool = 'paint';
        document.getElementById('btnSelectTool').classList.remove('active');
        document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.prop-icon').forEach(p => p.classList.remove('selected'));
        btn.classList.add('selected');
      });
      palette.appendChild(btn);
    }
  }

  document.querySelectorAll('.palette-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.palette-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updatePropPalette();
    });
  });

  const propFilterInput = document.getElementById('propFilter');
  if (propFilterInput) {
    propFilterInput.addEventListener('input', () => updatePropPalette());
  }

  function init() {
    resizeCanvasToDisplaySize();
    saveHistory();
    updatePropPalette();
    updateHistoryButtons();
    const firstTerrainBtn = document.querySelector('.terrain-btn');
    if (firstTerrainBtn) {
      firstTerrainBtn.classList.add('active');
    }
    document.getElementById('btnGrid').classList.toggle('active', state.showGrid);
    render();
    window.addEventListener('resize', () => {
      resizeCanvasToDisplaySize();
      render();
    });
  }

  function resizeCanvasToDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = Math.round(rect.width) + 'px';
    canvas.style.height = Math.round(rect.height) + 'px';
  }

  init();
})();
