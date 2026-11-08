// D&D MapMaker - Russian Edition with Detailed Top-Down Icons
(function() {
  'use strict';

  const GRID_SIZE = 32;
  const ICON_SCALE = 1.7; // постройки крупнее клетки сетки для читаемости деталей
  const TERRAIN_TYPES = {
    grass: { color: '#2d8659', light: '#4db876', dark: '#1a4d35', label: 'Трава' },
    forest: { color: '#1a5c2a', light: '#2d8659', dark: '#0d3318', label: 'Лес' },
    mountain: { color: '#6b4423', light: '#8b5a2b', dark: '#4a2c15', label: 'Гора' },
    water: { color: '#1e5a96', light: '#2d7ab8', dark: '#0d3d66', label: 'Вода' },
    sand: { color: '#d4a574', light: '#e8bf8f', dark: '#b8845c', label: 'Песок' },
    snow: { color: '#e8e8e8', light: '#f5f5f5', dark: '#d0d0d0', label: 'Снег' },
    swamp: { color: '#3d5c2a', light: '#546b3a', dark: '#2a4118', label: 'Болото' },
    road: { color: '#8b7355', light: '#a8896f', dark: '#6b5340', label: 'Дорога' },
    dungeon: { color: '#4a4a4a', light: '#5c5c5c', dark: '#333333', label: 'Камень' },
    wall: { color: '#3a3a3a', light: '#4a4a4a', dark: '#2a2a2a', label: 'Стена' }
  };

  const PROP_LIBRARY = {
    town: [
      { id: 'house1', name: 'Дом (коттедж)', drawIcon: drawHouseCottage },
      { id: 'house2', name: 'Дом (камень)', drawIcon: drawHouseStone },
      { id: 'house3', name: 'Дом (брус)', drawIcon: drawHouseTimber },
      { id: 'house4', name: 'Дом (высокий)', drawIcon: drawHouseTall },
      { id: 'house5', name: 'Дом (маленький)', drawIcon: drawHouseSmall },
      { id: 'house6', name: 'Дом с забором', drawIcon: drawHouseWithFence },
      { id: 'watchtower', name: 'Сторожевая башня', drawIcon: drawWatchtower },
      { id: 'castle', name: 'Замок', drawIcon: drawCastle },
      { id: 'citywall', name: 'Городская стена', drawIcon: drawCityWall },
      { id: 'gate', name: 'Городские ворота', drawIcon: drawCityGate },
      { id: 'market', name: 'Рынок', drawIcon: drawMarketStall },
      { id: 'well', name: 'Колодец', drawIcon: drawWell },
      { id: 'temple', name: 'Храм', drawIcon: drawTemple },
      { id: 'tavern', name: 'Таверна', drawIcon: drawTavern },
      { id: 'windmill', name: 'Мельница', drawIcon: drawWindmill },
      { id: 'dock', name: 'Пристань', drawIcon: drawDock },
      { id: 'farm', name: 'Ферма', drawIcon: drawFarm },
      { id: 'fence', name: 'Забор', drawIcon: drawFence },
      { id: 'bridge', name: 'Деревянный мост', drawIcon: drawBridge }
    ],
    dungeon: [
      { id: 'dwall', name: 'Каменная стена', drawIcon: drawDungeonWall },
      { id: 'door', name: 'Дверь', drawIcon: drawDoor },
      { id: 'sdoor', name: 'Скрытая дверь', drawIcon: drawSecretDoor },
      { id: 'stairup', name: 'Лестница вверх', drawIcon: drawStairsUp },
      { id: 'stairdown', name: 'Лестница вниз', drawIcon: drawStairsDown },
      { id: 'pillar', name: 'Колонна', drawIcon: drawPillar },
      { id: 'torch', name: 'Факел', drawIcon: drawTorch },
      { id: 'chest', name: 'Сундук', drawIcon: drawChest },
      { id: 'trap', name: 'Ловушка', drawIcon: drawTrap },
      { id: 'altar', name: 'Алтарь', drawIcon: drawAltar },
      { id: 'cage', name: 'Клетка', drawIcon: drawCage },
      { id: 'rubble', name: 'Развалины', drawIcon: drawRubble },
      { id: 'pit', name: 'Пропасть', drawIcon: drawPit },
      { id: 'statue', name: 'Статуя', drawIcon: drawStatue }
    ],
    nature: [
      { id: 'tree1', name: 'Лиственное дерево', drawIcon: drawTreeDeciduous },
      { id: 'tree2', name: 'Хвойное дерево', drawIcon: drawTreePine },
      { id: 'bush', name: 'Куст', drawIcon: drawBush },
      { id: 'rock', name: 'Скальное образование', drawIcon: drawRockCluster },
      { id: 'boulder', name: 'Валун', drawIcon: drawBoulder },
      { id: 'flower', name: 'Цветы', drawIcon: drawFlowerPatch },
      { id: 'pond', name: 'Пруд', drawIcon: drawPond },
      { id: 'river', name: 'Река', drawIcon: drawRiverBend },
      { id: 'grave', name: 'Надгробие', drawIcon: drawGravestone },
      { id: 'campfire', name: 'Костёр', drawIcon: drawCampfire }
    ]
  };

  const state = {
    mapWidth: 50,
    mapHeight: 50,
    terrain: new Map(),
    props: [],
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
    selectedPropId: null
  };

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const fileInput = document.getElementById('fileInput');

  // Town buildings - detailed top-down views
  // ===== TOWN BUILDINGS - Detailed Top-Down Views =====
  
  function drawHouseCottage(ctx) {
    // Крыша с градиентом - красная черепица
    const roofGrad = ctx.createLinearGradient(0, -12, 0, -6);
    roofGrad.addColorStop(0, '#d43333');
    roofGrad.addColorStop(0.5, '#cc1111');
    roofGrad.addColorStop(1, '#991111');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.quadraticCurveTo(0, -14, 10, -6);
    ctx.lineTo(9, -5);
    ctx.quadraticCurveTo(0, -11, -9, -5);
    ctx.fill();
    
    // Тень крыши
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(-9, -5);
    ctx.lineTo(9, -5);
    ctx.lineTo(8, -4);
    ctx.lineTo(-8, -4);
    ctx.fill();
    
    // Стены - камень/кирпич с градиентом
    const wallGrad = ctx.createLinearGradient(-8, -4, 8, 6);
    wallGrad.addColorStop(0, '#c9a876');
    wallGrad.addColorStop(0.5, '#deb89b');
    wallGrad.addColorStop(1, '#c9a876');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-9, -4, 18, 10);
    
    // Контур стен
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, -4, 18, 10);
    
    // Текстура кирпичей
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = -8; i <= 8; i += 6) {
      ctx.fillRect(i, -2, 5, 1);
      ctx.fillRect(i, 2, 5, 1);
    }
    
    // Дверь
    ctx.fillStyle = '#5c3a1f';
    ctx.fillRect(-2, 2, 4, 5);
    ctx.fillStyle = '#f4a460';
    ctx.fillRect(-0.5, 3.5, 1, 1.5);
    
    // Окна
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(-6, -1, 3, 2.5);
    ctx.fillRect(3, -1, 3, 2.5);
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(-5.5, -0.5, 1.5, 1.5);
    ctx.fillRect(3.5, -0.5, 1.5, 1.5);
  }
  
  function drawHouseStone(ctx) {
    // Крыша - серо-синяя черепица
    const roofGrad = ctx.createLinearGradient(0, -14, 0, -6);
    roofGrad.addColorStop(0, '#5a7c8d');
    roofGrad.addColorStop(0.5, '#4a5c6f');
    roofGrad.addColorStop(1, '#2a3c4f');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(-11, -7);
    ctx.quadraticCurveTo(0, -15, 11, -7);
    ctx.lineTo(10, -5);
    ctx.quadraticCurveTo(0, -12, -10, -5);
    ctx.fill();
    
    // Тень крыши
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(10, -5);
    ctx.lineTo(9, -3);
    ctx.lineTo(-9, -3);
    ctx.fill();
    
    // Каменные стены с градиентом
    const stoneGrad = ctx.createLinearGradient(-9, -2, 9, 8);
    stoneGrad.addColorStop(0, '#a0a0a0');
    stoneGrad.addColorStop(0.5, '#b8b8b8');
    stoneGrad.addColorStop(1, '#9a9a9a');
    ctx.fillStyle = stoneGrad;
    ctx.fillRect(-10, -3, 20, 11);
    
    // Контур
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -3, 20, 11);
    
    // Кладка камней
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    for (let i = -8; i <= 8; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i + 6, -2);
      ctx.stroke();
    }
    for (let j = 0; j <= 8; j += 3) {
      ctx.beginPath();
      ctx.moveTo(-10, j);
      ctx.lineTo(10, j);
      ctx.stroke();
    }
    
    // Двери и окна
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-3, 1, 6, 6);
    ctx.fillStyle = '#5a7c8d';
    ctx.fillRect(-2, 2, 2.5, 2);
    ctx.fillRect(1.5, 2, 2.5, 2);
  }
  
  function drawHouseTimber(ctx) {
    // Крыша - тёмная
    ctx.fillStyle = '#8b6f47';
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(0, -13);
    ctx.lineTo(10, -7);
    ctx.fill();
    
    // Шинглы на крыше
    ctx.fillStyle = '#6b5340';
    for (let i = -10; i <= 10; i += 4) {
      for (let j = -11; j <= -7; j += 2) {
        ctx.beginPath();
        ctx.arc(i + 2, j, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Стены - светлое дерево с градиентом
    const woodGrad = ctx.createLinearGradient(-8, -5, 8, 7);
    woodGrad.addColorStop(0, '#d4b499');
    woodGrad.addColorStop(0.5, '#e8c9a8');
    woodGrad.addColorStop(1, '#d4b499');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(-9, -5, 18, 12);
    
    // Балки - горизонтальные и вертикальные
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 7);
    ctx.stroke();
    
    // Дверь
    ctx.fillStyle = '#5c3a1f';
    ctx.fillRect(-2.5, 3, 5, 4);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-1, 4.5, 2, 1.5);
  }
  
  function drawHouseTall(ctx) {
    // Высокий красный дом с четырёхскатной крышей
    const roofGrad = ctx.createLinearGradient(0, -15, 0, -6);
    roofGrad.addColorStop(0, '#ff4444');
    roofGrad.addColorStop(0.5, '#dd2222');
    roofGrad.addColorStop(1, '#aa1111');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -8);
    ctx.lineTo(0, -16);
    ctx.lineTo(9, -8);
    ctx.lineTo(8, -6);
    ctx.quadraticCurveTo(0, -12, -8, -6);
    ctx.fill();
    
    // Стены с окнами
    const wallGrad = ctx.createLinearGradient(-8, -4, 8, 6);
    wallGrad.addColorStop(0, '#deb89b');
    wallGrad.addColorStop(1, '#c9a876');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-8, -4, 16, 14);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -4, 16, 14);
    
    // Окна - 2x2
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(-5, -2, 3, 3);
    ctx.fillRect(2, -2, 3, 3);
    ctx.fillRect(-5, 3, 3, 3);
    ctx.fillRect(2, 3, 3, 3);
    
    // Отражения в окнах
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(-4.5, -1, 1, 1);
    ctx.fillRect(2.5, -1, 1, 1);
  }
  
  function drawHouseSmall(ctx) {
    // Маленький коттедж
    const roofGrad = ctx.createLinearGradient(0, -8, 0, -4);
    roofGrad.addColorStop(0, '#b83333');
    roofGrad.addColorStop(1, '#8a1111');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(0, -9);
    ctx.lineTo(7, -4);
    ctx.fill();
    
    const wallGrad = ctx.createLinearGradient(-6, -3, 6, 5);
    wallGrad.addColorStop(0, '#d4a574');
    wallGrad.addColorStop(1, '#c9a876');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-7, -3, 14, 8);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, -3, 14, 8);
    
    // Дверь и окно
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(-1.5, 1, 3, 3);
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(3, 0, 2, 2);
  }
  
  function drawHouseWithFence(ctx) {
    // Дом с забором
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(0, -11);
    ctx.lineTo(8, -5);
    ctx.fill();
    
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-8, -4, 16, 10);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -4, 16, 10);
    
    // Дверь
    ctx.fillStyle = '#5c3a1f';
    ctx.fillRect(-2, 2, 4, 3);
    
    // Забор - снизу
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, 6);
    ctx.lineTo(14, 6);
    ctx.stroke();
    
    // Штакетины
    for (let i = -12; i <= 12; i += 4) {
      ctx.fillStyle = '#a0826d';
      ctx.fillRect(i, 4, 2, 3);
    }
  }
  
  function drawWatchtower(ctx) {
    // Сторожевая башня - круглая со стрельницами
    const towerGrad = ctx.createRadialGradient(0, -1, 2, 0, 0, 10);
    towerGrad.addColorStop(0, '#a9a9a9');
    towerGrad.addColorStop(1, '#7a7a7a');
    ctx.fillStyle = towerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.stroke();
    
    // Стрельницы
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 10;
      const y = Math.sin(a) * 10;
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x - 2, y - 1.5, 4, 3);
    }
    
    // Крыша - конус сверху
    const roofGrad = ctx.createRadialGradient(0, -5, 0, 0, 0, 15);
    roofGrad.addColorStop(0, '#d4a574');
    roofGrad.addColorStop(1, '#8b7355');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawCastle(ctx) {
    // Замок с четырьмя башнями
    // Основная часть
    const wallGrad = ctx.createLinearGradient(-12, -8, 12, 8);
    wallGrad.addColorStop(0, '#9a9a9a');
    wallGrad.addColorStop(0.5, '#b0b0b0');
    wallGrad.addColorStop(1, '#8a8a8a');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-12, -6, 24, 12);
    
    // Башни по углам
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(-15, -8, 5, 8);
    ctx.fillRect(10, -8, 5, 8);
    ctx.fillRect(-15, 2, 5, 6);
    ctx.fillRect(10, 2, 5, 6);
    
    // Крыши башен
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.moveTo(-15, -8);
    ctx.lineTo(-12.5, -10);
    ctx.lineTo(-10, -8);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.lineTo(12.5, -10);
    ctx.lineTo(15, -8);
    ctx.fill();
    
    // Главные ворота
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-6, -4, 12, 8);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-4, -2, 8, 4);
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
    // Таверна - дом с вывеской
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.lineTo(0, -12);
    ctx.lineTo(9, -6);
    ctx.fill();
    
    ctx.fillStyle = '#d9b99f';
    ctx.fillRect(-9, -4, 18, 11);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, -4, 18, 11);
    
    // Дверь с табличкой
    ctx.fillStyle = '#5c3a1f';
    ctx.fillRect(-2, 2, 4, 5);
    
    // Вывеска сверху
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(-4, -7, 8, 2);
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
    // Ферма - сарай + огород
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(0, -11);
    ctx.lineTo(8, -5);
    ctx.fill();
    
    ctx.fillStyle = '#e8c9a8';
    ctx.fillRect(-8, -4, 16, 10);
    
    // Огород сбоку
    ctx.strokeStyle = '#6b5340';
    ctx.lineWidth = 0.5;
    for (let i = -6; i <= 6; i += 2) {
      for (let j = 2; j <= 6; j += 2) {
        ctx.fillStyle = '#4db876';
        ctx.fillRect(i + 6, j, 1.5, 1.5);
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
    // Лиственное дерево - круглая крона со стволом
    // Ствол
    ctx.fillStyle = '#5c4a2f';
    ctx.fillRect(-1.5, 0, 3, 8);
    ctx.fillStyle = '#4a3a1f';
    ctx.fillRect(-1, 1, 2, 6);
    
    // Крона - многослойная
    const treeGrad = ctx.createRadialGradient(0, -4, 2, 0, -4, 10);
    treeGrad.addColorStop(0, '#3db347');
    treeGrad.addColorStop(0.6, '#2d8a3a');
    treeGrad.addColorStop(1, '#1d5a2a');
    ctx.fillStyle = treeGrad;
    ctx.beginPath();
    ctx.arc(0, -4, 9, 0, Math.PI * 2);
    ctx.fill();
    
    // Верхний слой кроны - светлее
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.arc(0, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Свет сверху
    ctx.fillStyle = 'rgba(200, 255, 200, 0.3)';
    ctx.beginPath();
    ctx.arc(-2, -8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  
  function drawTreePine(ctx) {
    // Хвойное дерево - остроконечное
    // Ствол
    ctx.fillStyle = '#6b5340';
    ctx.fillRect(-1, 2, 2, 6);
    
    // Конус хвои - 3 уровня
    ctx.fillStyle = '#1d4d2a';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(8, 1);
    ctx.lineTo(-8, 1);
    ctx.fill();
    
    ctx.fillStyle = '#2d5c3a';
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(7, 4);
    ctx.lineTo(-7, 4);
    ctx.fill();
    
    ctx.fillStyle = '#3d7c4a';
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.lineTo(6, 8);
    ctx.lineTo(-6, 8);
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
      const grad = ctx.createLinearGradient(px, py, px + GRID_SIZE, py + GRID_SIZE);
      grad.addColorStop(0, colors.light);
      grad.addColorStop(0.5, colors.color);
      grad.addColorStop(1, colors.dark);
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);

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

    for (let i = 0; i < state.props.length; i++) {
      const prop = state.props[i];
      const px = prop.x * GRID_SIZE + GRID_SIZE / 2;
      const py = prop.y * GRID_SIZE + GRID_SIZE / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((prop.rotation * Math.PI) / 180);
      ctx.scale(prop.scale * ICON_SCALE, prop.scale * ICON_SCALE);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const propDef = findPropDefinition(prop.propId);
      if (propDef && propDef.drawIcon) {
        propDef.drawIcon(ctx);
      }

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

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const worldX = canvasX / state.zoom - state.panX;
    const worldY = canvasY / state.zoom - state.panY;

    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      state.panStart = { x: canvasX, y: canvasY };
    } else if (e.button === 0) {
      if (state.selectedPropId) {
        let gx = Math.round(worldX / GRID_SIZE);
        let gy = Math.round(worldY / GRID_SIZE);
        state.props.push({
          propId: state.selectedPropId,
          x: gx,
          y: gy,
          rotation: 0,
          scale: 1
        });
        saveHistory();
        render();
      } else {
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
    const worldX = canvasX / state.zoom - state.panX;
    const worldY = canvasY / state.zoom - state.panY;

    const { label } = pixelToGrid(worldX, worldY);
    document.getElementById('gridCoords').textContent = label;

    if (e.buttons === 4 || (e.buttons === 1 && e.shiftKey)) {
      const dx = canvasX - state.panStart.x;
      const dy = canvasY - state.panStart.y;
      state.panX += dx;
      state.panY += dy;
      state.panStart = { x: canvasX, y: canvasY };
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
      const grad = exportCtx.createLinearGradient(px, py, px + GRID_SIZE, py + GRID_SIZE);
      grad.addColorStop(0, colors.light);
      grad.addColorStop(0.5, colors.color);
      grad.addColorStop(1, colors.dark);
      exportCtx.fillStyle = grad;
      exportCtx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
    }

    for (const prop of state.props) {
      const px = prop.x * GRID_SIZE + GRID_SIZE / 2;
      const py = prop.y * GRID_SIZE + GRID_SIZE / 2;
      exportCtx.save();
      exportCtx.translate(px, py);
      exportCtx.rotate((prop.rotation * Math.PI) / 180);
      exportCtx.scale(prop.scale * ICON_SCALE, prop.scale * ICON_SCALE);
      const propDef = findPropDefinition(prop.propId);
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
    const currentCategory = state.currentMode === 'town' ? 'town' : 'dungeon';
    const props = PROP_LIBRARY[currentCategory];
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
    });
  });

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
          document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.prop-icon').forEach(p => p.classList.remove('selected'));
          btn.classList.add('selected');
        });
        palette.appendChild(btn);
      }
    }
  }

  function init() {
    resizeCanvasToDisplaySize();
    saveHistory();
    populateAllPalettes();
    updateHistoryButtons();
    const firstTerrainBtn = document.querySelector('.terrain-btn');
    if (firstTerrainBtn) {
      firstTerrainBtn.classList.add('active');
    }
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
