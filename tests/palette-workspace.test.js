const assert = require('assert');

const store = {};
global.wx = {
  getStorageSync(key) { return store[key]; },
  setStorageSync(key, value) { store[key] = value; },
  removeStorageSync(key) { delete store[key]; }
};

const workspace = require('../miniprogram/utils/palette-workspace');

const created = workspace.savePalette({ name: 'Test palette', colors: ['#ff0000', '#00ff00'] });
assert.strictEqual(created.name, 'Test palette');
assert.deepStrictEqual(created.colors, ['#FF0000', '#00FF00']);
assert.strictEqual(workspace.getWorkspace().palettes.length, 1);
assert.strictEqual(workspace.getWorkspace().colors.length, 2);

const updated = workspace.savePalette({ id: created.id, name: 'Renamed', colors: ['#0000FF'] });
assert.strictEqual(updated.id, created.id);
assert.strictEqual(updated.name, 'Renamed');
assert.deepStrictEqual(workspace.getWorkspace().palettes[0].colors, ['#0000FF']);

const duplicate = workspace.duplicatePalette(created.id);
assert.ok(duplicate);
assert.notStrictEqual(duplicate.id, created.id);
assert.strictEqual(workspace.getWorkspace().palettes.length, 2);

workspace.removePalette(created.id);
assert.strictEqual(workspace.getWorkspace().palettes.length, 1);

console.log('Palette workspace tests passed.');
