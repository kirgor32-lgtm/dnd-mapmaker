// D&D MapMaker - Russian Edition with Detailed Top-Down Icons
(function() {
  'use strict';

  const GRID_SIZE = 32;
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
  function drawHouseCottage(ctx) {
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.quadraticCurveTo(0, -12, 9, -6);
    ctx.lineTo(8, -5);
    ctx.quadraticCurveTo(0, -10, -8, -5);
    ctx.fill();
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(-9, -6, 18, 2);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-8, -4, 16, 10);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -4, 16, 10);
    ctx.fillStyle = '#5c4a2f';
    ctx.fillRect(-2, 3, 4, 4);
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(-6, 0, 3, 2.5);
    ctx.fillRect(3, 0, 3, 2.5);
  }

  function drawHouseStone(ctx) {
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(10, -8);
    ctx.lineTo(9, -5);
    ctx.lineTo(-9, -5);
    ctx.fill();
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.quadraticCurveTo(0, -14, 10, -8);
    ctx.lineTo(9, -5);
    ctx.quadraticCurveTo(0, -11, -9, -5);
    ctx.fill();
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(-9, -4, 18, 12);
    for (let i = -8; i <= 8; i += 6) {
      for (let j = -2; j <= 6; j += 4) {
        ctx.fillStyle = '#999999';
        ctx.fillRect(i, j, 2.5, 2.5);
      }
    }
  }

  function drawHouseTimber(ctx) {
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(0, -13);
    ctx.lineTo(10, -7);
    ctx.fill();
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(0, -11);
    ctx.lineTo(10, -7);
    ctx.fill();
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(-9, -5, 18, 12);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(9, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 7);
    ctx.stroke();
    ctx.fillStyle = '#6b5340';
    ctx.fillRect(-2, 2, 4, 5);
  }

  function drawHouseTall(ctx) {
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(0, -15);
    ctx.lineTo(8, -8);
    ctx.fill();
    ctx.fillStyle = '#8b2222';
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.quadraticCurveTo(0, -14, 8, -8);
    ctx.fill();
    ctx.fillStyle = '#d9b48f';
    ctx.fillRect(-7, -6, 14, 14);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, -6, 14, 14);
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(-5, -2, 3, 2.5);
    ctx.fillRect(2, -2, 3, 2.5);
    ctx.fillRect(-5, 2, 3, 2.5);
    ctx.fillRect(2, 2, 3, 2.5);
  }

  function drawHouseSmall(ctx) {
    ctx.fillStyle = '#b83333';
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(0, -8);
    ctx.lineTo(6, -4);
    ctx.fill();
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-6, -3, 12, 8);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -3, 12, 8);
    ctx.fillStyle = '#6b5340';
    ctx.fillRect(-1.5, 1, 3, 3);
  }

  function drawHouseWithFence(ctx) {
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(0, -11);
    ctx.lineTo(8, -6);
    ctx.fill();
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-8, -4, 16, 10);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 1;
    ctx.strokeRect(-8, -4, 16, 10);
    ctx.fillStyle = '#5c4a2f';
    ctx.fillRect(-2, 3, 4, 3);
    ctx.strokeStyle = '#8b6f47';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 6);
    ctx.lineTo(12, 6);
    ctx.stroke();
    for (let i = -10; i <= 10; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, 6);
      ctx.lineTo(i, 3);
      ctx.stroke();
    }
  }

  function drawWatchtower(ctx) {
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#999999';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 8;
      const y = Math.sin(a) * 8;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }

  function drawCastle(ctx) {
    ctx.fillStyle = '#a9a9a9';
    ctx.fillRect(-12, -8, 24, 16);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -8, 24, 16);
    ctx.fillStyle = '#808080';
    ctx.fillRect(-14, -10, 4, 5);
    ctx.fillRect(10, -10, 4, 5);
    ctx.fillRect(-14, 6, 4, 4);
    ctx.fillRect(10, 6, 4, 4);
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(-10, -6, 20, 12);
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-4, -4, 8, 8);
  }

  function drawCityWall(ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(-12, -2, 24, 8);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -2, 24, 8);
    for (let i = -8; i <= 8; i += 5) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(i, -4, 3, 2);
    }
  }

  function drawCityGate(ctx) {
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(-11, -8, 22, 16);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-11, -8, 22, 16);
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-6, -4, 12, 8);
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-6, -4 + i * 2);
      ctx.lineTo(6, -4 + i * 2);
      ctx.stroke();
    }
  }

  function drawMarketStall(ctx) {
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.lineTo(0, -8);
    ctx.lineTo(9, -4);
    ctx.fill();
    ctx.fillStyle = '#8b2222';
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.quadraticCurveTo(0, -6, 9, -4);
    ctx.fill();
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-9, -2, 18, 8);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, -2, 18, 8);
    ctx.fillStyle = '#ff6633';
    ctx.fillRect(-7, 0, 4, 2);
    ctx.fillStyle = '#33cc66';
    ctx.fillRect(-2, 0, 4, 2);
    ctx.fillStyle = '#3366ff';
    ctx.fillRect(3, 0, 4, 2);
  }

  function drawWell(ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#999999';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.cos(a) * 7;
      const y = Math.sin(a) * 7;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
    ctx.fillStyle = '#1e5a96';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d7ab8';
    ctx.beginPath();
    ctx.arc(0, -1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTemple(ctx) {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(-10, -7, 20, 14);
    ctx.strokeStyle = '#a9a9a9';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -7, 20, 14);
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(0, -12);
    ctx.lineTo(10, -7);
    ctx.fill();
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(-8, -5, 2, 2);
    ctx.fillRect(6, -5, 2, 2);
    ctx.fillRect(-8, 5, 2, 2);
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(-3, -2, 6, 4);
  }

  function drawTavern(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-10, -6, 20, 12);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -6, 20, 12);
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.moveTo(-10, -6);
    ctx.lineTo(0, -11);
    ctx.lineTo(10, -6);
    ctx.fill();
    ctx.fillStyle = '#ffff99';
    ctx.fillRect(-7, -1, 3, 2.5);
    ctx.fillRect(4, -1, 3, 2.5);
    ctx.fillRect(-7, 3, 3, 2.5);
    ctx.fillRect(4, 3, 3, 2.5);
  }

  function drawWindmill(ctx) {
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(-5, -1, 10, 2);
    ctx.fillRect(-1, -5, 2, 10);
  }

  function drawDock(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-12, -2, 24, 4);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -2, 24, 4);
    ctx.fillStyle = '#6b5a3d';
    for (let i = -10; i <= 10; i += 7) {
      ctx.fillRect(i - 0.5, 2, 1, 4);
    }
    ctx.strokeStyle = '#1e5a96';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 8, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawFarm(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-12, -8, 24, 16);
    ctx.strokeStyle = '#4db876';
    ctx.lineWidth = 2;
    for (let i = -10; i <= 10; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -6);
      ctx.lineTo(i, 6);
      ctx.stroke();
    }
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -8, 24, 16);
  }

  function drawFence(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-12, -1, 24, 2);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#6b5a3d';
    for (let i = -10; i <= 10; i += 4) {
      ctx.fillRect(i - 1, -4, 2, 6);
    }
  }

  function drawBridge(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-11, -2, 22, 4);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    ctx.strokeRect(-11, -2, 22, 4);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i, 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#6b5a3d';
    ctx.fillRect(-10, 2, 1.5, 4);
    ctx.fillRect(-2, 2, 1.5, 4);
    ctx.fillRect(6, 2, 1.5, 4);
  }

  function drawDungeonWall(ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(-10, -5, 20, 10);
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -5, 20, 10);
    for (let i = -8; i <= 8; i += 5) {
      for (let j = -3; j <= 3; j += 4) {
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(i, j, 3, 2);
      }
    }
  }

  function drawDoor(ctx) {
    ctx.fillStyle = '#6b5340';
    ctx.fillRect(-6, -9, 12, 13);
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -9, 12, 13);
    ctx.fillStyle = '#696969';
    ctx.fillRect(-5, -7, 10, 1.5);
    ctx.fillRect(-5, 4, 10, 1.5);
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.arc(6, -2, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSecretDoor(ctx) {
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(-6, -9, 12, 13);
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-6, -9, 12, 13);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 0.5;
    for (let j = -7; j <= 3; j += 4) {
      ctx.beginPath();
      ctx.moveTo(-4, j);
      ctx.lineTo(4, j);
      ctx.stroke();
    }
  }

  function drawStairsUp(ctx) {
    ctx.fillStyle = '#808080';
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = -5 + i * 5;
      const y = -5 + i * 5;
      ctx.fillRect(x, y, 4, 4);
      ctx.strokeRect(x, y, 4, 4);
    }
  }

  function drawStairsDown(ctx) {
    ctx.fillStyle = '#808080';
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = -5 + i * 5;
      const y = 5 - i * 5;
      ctx.fillRect(x, y - 4, 4, 4);
      ctx.strokeRect(x, y - 4, 4, 4);
    }
  }

  function drawPillar(ctx) {
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#808080';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 5;
      const y = Math.sin(a) * 5;
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }

  function drawTorch(ctx) {
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555555';
    ctx.fillRect(-4, -1, 8, 2);
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(0, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(0, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawChest(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-8, -3, 16, 8);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-8, -3, 16, 8);
    ctx.fillStyle = '#9b7f57';
    ctx.beginPath();
    ctx.arc(0, -4, 8, Math.PI, 0, false);
    ctx.fill();
    ctx.fillStyle = '#daa520';
    ctx.fillRect(-8, 2, 16, 1.5);
    ctx.fillStyle = '#696969';
    ctx.beginPath();
    ctx.arc(0, 3, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTrap(ctx) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(7, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7, -7);
    ctx.lineTo(-7, 7);
    ctx.stroke();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(-8, -8, 16, 16);
  }

  function drawAltar(ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(-9, 1, 18, 9);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1;
    ctx.strokeRect(-9, 1, 18, 9);
    ctx.fillStyle = '#888888';
    ctx.fillRect(-7, -3, 14, 4);
    ctx.fillStyle = '#daa520';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCage(ctx) {
    ctx.fillStyle = '#696969';
    ctx.fillRect(-8, -10, 16, 16);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-8, -10, 16, 16);
    ctx.fillStyle = '#555555';
    for (let i = -6; i <= 6; i += 3) {
      ctx.fillRect(i - 0.5, -9, 1, 14);
    }
    for (let j = -7; j <= 5; j += 4) {
      ctx.fillRect(-7, j, 14, 1);
    }
  }

  function drawRubble(ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(-9, -6, 7, 8);
    ctx.fillRect(2, -4, 8, 8);
    ctx.fillRect(-3, 4, 6, 5);
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-8, -4);
    ctx.lineTo(-2, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(2, 6);
    ctx.stroke();
  }

  function drawPit(ctx) {
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStatue(ctx) {
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(-3.5, -8, 7, 16);
    ctx.strokeStyle = '#696969';
    ctx.lineWidth = 1;
    ctx.strokeRect(-3.5, -8, 7, 16);
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(-5, 7, 10, 2);
    ctx.fillStyle = '#b0b0b0';
    ctx.beginPath();
    ctx.arc(0, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTreeDeciduous(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-1.5, 3, 3, 6);
    ctx.strokeStyle = '#5c4a2f';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-1.5, 3, 3, 6);
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.arc(0, -1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d8659';
    ctx.beginPath();
    ctx.arc(-3, 1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, 1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6ec898';
    ctx.beginPath();
    ctx.arc(-2, -5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTreePine(ctx) {
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(-1, 4, 2, 6);
    ctx.fillStyle = '#2d8659';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(-8, 2);
    ctx.lineTo(8, 2);
    ctx.fill();
    ctx.fillStyle = '#1a5c2a';
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(-6, 6);
    ctx.lineTo(6, 6);
    ctx.fill();
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.fill();
  }

  function drawBush(ctx) {
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.arc(-3, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d8659';
    ctx.beginPath();
    ctx.arc(-3, 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawRockCluster(ctx) {
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.arc(-4, -2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(-4, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBoulder(ctx) {
    ctx.fillStyle = '#989898';
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.arc(0, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b0b0b0';
    ctx.beginPath();
    ctx.arc(-2, -3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFlowerPatch(ctx) {
    ctx.fillStyle = '#4db876';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    const colors = ['#ff69b4', '#ff0000', '#ffff00', '#0000ff', '#ff8800'];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const x = Math.cos(a) * 4.5;
      const y = Math.sin(a) * 4.5;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPond(ctx) {
    ctx.fillStyle = '#1e5a96';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d7ab8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 4.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4db876';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const x = Math.cos(a) * 11;
      const y = Math.sin(a) * 8;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRiverBend(ctx) {
    ctx.fillStyle = '#1e5a96';
    ctx.beginPath();
    ctx.moveTo(-10, -3);
    ctx.quadraticCurveTo(0, 8, 10, -3);
    ctx.lineTo(10, 3);
    ctx.quadraticCurveTo(0, 14, -10, 3);
    ctx.fill();
    ctx.strokeStyle = '#2d7ab8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.quadraticCurveTo(0, 10, 10, 0);
    ctx.stroke();
    ctx.strokeStyle = '#4db876';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-9, -1);
    ctx.quadraticCurveTo(0, 9, 9, -1);
    ctx.stroke();
  }

  function drawGravestone(ctx) {
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(-5, 8);
    ctx.lineTo(5, 8);
    ctx.fill();
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(-5, 8);
    ctx.lineTo(5, 8);
    ctx.stroke();
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 2);
    ctx.stroke();
  }

  function drawCampfire(ctx) {
    ctx.fillStyle = '#6b5340';
    ctx.fillRect(-7, 2, 14, 3);
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-7, 2, 14, 3);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(0, -8);
    ctx.lineTo(2, -4);
    ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(0, -7);
    ctx.lineTo(4, -5);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(0, -2, 2, 0, Math.PI * 2);
    ctx.fill();
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

    ctx.save();
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
      ctx.scale(prop.scale, prop.scale);

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
    const worldX = (canvasX - state.panX) / state.zoom;
    const worldY = (canvasY - state.panY) / state.zoom;

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
      exportCtx.scale(prop.scale, prop.scale);
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
    canvas.width = 40;
    canvas.height = 40;
    canvasCtx.fillStyle = '#f0f0f0';
    canvasCtx.fillRect(0, 0, 40, 40);
    canvasCtx.save();
    canvasCtx.translate(20, 20);
    canvasCtx.scale(0.8, 0.8);
    if (propDef.drawIcon) {
      propDef.drawIcon(canvasCtx);
    }
    canvasCtx.restore();
    canvasCtx.strokeStyle = '#ccc';
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeRect(0, 0, 40, 40);
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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    saveHistory();
    populateAllPalettes();
    updateHistoryButtons();
    const firstTerrainBtn = document.querySelector('.terrain-btn');
    if (firstTerrainBtn) {
      firstTerrainBtn.classList.add('active');
    }
    render();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    });
  }

  init();
})();
