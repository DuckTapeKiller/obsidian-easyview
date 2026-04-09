"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var main_exports = {};
__export(main_exports, { default: () => EasyViewPlugin });
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

var DEFAULT_SETTINGS = {
  buttonSize: 13,
  showIncrementBtn: true,
  showDecrementBtn: true,
  showResetBtn: true,
  showThemeBtn: true,
  defaultFontSize: 16,
  showLineWidthBtn: false,
  showFocusBtn: false,
  showZenBtn: false,
  showReadingModeBtn: false,
  focusModeActive: false,
  zenModeActive: false,
  lineWidthExpanded: false,
  showNotifications: true
};

var EasyViewPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.statusBarItem = null;
    this.themeBtn = null;
    this.isReady = false;
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new EasyViewSettingTab(this.app, this));
    this.registerCommands();
    this.restoreStates();
    this.refreshStatusBar();
    this.registerEvent(this.app.workspace.on("css-change", () => {
      this.updateThemeIcon();
    }));
    setTimeout(() => { this.isReady = true; }, 1e3);
  }

  onunload() {
    if (this.statusBarItem) this.statusBarItem.remove();
    document.body.classList.remove("easyview-force-width", "easyview-focus-mode", "easyview-zen-mode");
    document.body.style.removeProperty("--line-height-custom");
    document.body.style.removeProperty("--ui-font-color-light");
    document.body.style.removeProperty("--body-font-color-light");
    document.body.style.removeProperty("--ui-font-color-dark");
    document.body.style.removeProperty("--body-font-color-dark");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshStatusBar();
  }

  notify(message, duration = 1500) {
    if (this.settings.showNotifications) {
      new import_obsidian.Notice(message, duration);
    }
  }

  registerCommands() {
    this.addCommand({ id: "toggle-focus-mode", name: "Toggle Focus Mode", callback: () => this.toggleFocusMode() });
    this.addCommand({ id: "toggle-zen-mode", name: "Toggle Zen Mode", callback: () => this.toggleZenMode() });
    this.addCommand({ id: "toggle-line-width", name: "Toggle Line Width", callback: () => this.toggleLineWidth() });
    this.addCommand({ id: "toggle-theme", name: "Toggle Theme", callback: () => this.toggleTheme() });
    this.addCommand({ id: "cycle-reading-mode", name: "Cycle Reading Mode", callback: () => this.cycleReadingMode() });
    this.addCommand({ id: "increase-font-size", name: "Increase Font Size", callback: () => this.adjustFontSize(1) });
    this.addCommand({ id: "decrease-font-size", name: "Decrease Font Size", callback: () => this.adjustFontSize(-1) });
    this.addCommand({ id: "reset-font-size", name: "Reset Font Size", callback: () => this.resetFontSize() });
  }

  restoreStates() {
    if (this.settings.focusModeActive) document.body.classList.add("easyview-focus-mode");
    if (this.settings.zenModeActive) document.body.classList.add("easyview-zen-mode");
    if (this.settings.lineWidthExpanded) document.body.classList.add("easyview-force-width");
  }

  refreshStatusBar() {
    if (this.statusBarItem) this.statusBarItem.empty();
    else this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass("plugin-easyview", "easy-view-container-unique");
    this.statusBarItem.style.setProperty("--easy-view-btn-size", `${this.settings.buttonSize}px`);
    
    if (this.settings.showDecrementBtn) this.createBtn("minus", "Decrease Font Size", () => this.adjustFontSize(-1));
    if (this.settings.showIncrementBtn) this.createBtn("plus", "Increase Font Size", () => this.adjustFontSize(1));
    if (this.settings.showResetBtn) this.createBtn("rotate-ccw", "Reset Font Size", () => this.resetFontSize());
    if (this.settings.showLineWidthBtn) this.createBtn("arrow-left-right", "Toggle Line Width", () => this.toggleLineWidth());
    if (this.settings.showReadingModeBtn) this.createBtn("book-open", "Cycle Reading Mode", () => this.cycleReadingMode());
    if (this.settings.showFocusBtn) this.createBtn("maximize", "Toggle Focus Mode", () => this.toggleFocusMode());
    if (this.settings.showZenBtn) this.createBtn("eye-off", "Toggle Zen Mode", () => this.toggleZenMode());
    if (this.settings.showThemeBtn) {
      this.themeBtn = this.createBtn("sun", "Switch Theme", () => this.toggleTheme());
      this.updateThemeIcon();
    }
  }

  createBtn(icon, title, onclick) {
    const b = this.statusBarItem.createEl("button", { cls: "easy-view-btn" });
    (0, import_obsidian.setIcon)(b, icon);
    b.title = title;
    b.onclick = onclick;
    return b;
  }

  adjustFontSize(change) {
    const currentSize = this.app.vault.getConfig("baseFontSize") || 16;
    let newSize = Math.min(Math.max(currentSize + change, 10), 30);
    this.app.vault.setConfig("baseFontSize", newSize);
    this.app.updateFontSize();
    this.notify(`Font Size: ${newSize}px`);
  }

  resetFontSize() {
    this.app.vault.setConfig("baseFontSize", this.settings.defaultFontSize);
    this.app.updateFontSize();
    this.notify(`Font Size: ${this.settings.defaultFontSize}px (Reset)`);
  }

  toggleTheme() {
    const newTheme = this.app.vault.getConfig("theme") === "obsidian" ? "moonstone" : "obsidian";
    this.app.vault.setConfig("theme", newTheme);
    this.app.updateTheme();
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    if (!this.themeBtn) return;
    (0, import_obsidian.setIcon)(this.themeBtn, this.app.vault.getConfig("theme") === "obsidian" ? "moon" : "sun");
  }

  toggleLineWidth() {
    const isExpanded = document.body.classList.toggle("easyview-force-width");
    this.settings.lineWidthExpanded = isExpanded;
    this.saveSettings();
  }

  toggleFocusMode() {
    if (!this.settings.focusModeActive && this.settings.zenModeActive) {
      document.body.classList.remove("easyview-zen-mode");
      this.settings.zenModeActive = false;
    }
    const isActive = document.body.classList.toggle("easyview-focus-mode");
    this.settings.focusModeActive = isActive;
    this.saveSettings();
  }

  toggleZenMode() {
    if (!this.settings.zenModeActive && this.settings.focusModeActive) {
      document.body.classList.remove("easyview-focus-mode");
      this.settings.focusModeActive = false;
    }
    const isActive = document.body.classList.toggle("easyview-zen-mode");
    this.settings.zenModeActive = isActive;
    this.saveSettings();
  }

  cycleReadingMode() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view) return;
    const state = view.getState();
    let mode = state.mode === "source" && !state.source ? "preview" : "source";
    let source = state.mode === "source" && state.source ? false : state.source;
    if (state.mode === "preview") { mode = "source"; source = true; }
    view.setState({ ...state, mode: mode, source: source }, { history: false });
  }
};

var EasyViewSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Easy View Settings" });
    new import_obsidian.Setting(containerEl).setName("Button Size (px)").addSlider((s) => s.setLimits(10, 24, 1).setValue(this.plugin.settings.buttonSize).onChange(async (v) => { this.plugin.settings.buttonSize = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Default Font Size").addText((t) => t.setValue(String(this.plugin.settings.defaultFontSize)).onChange(async (v) => { const n = parseInt(v); if (!isNaN(n)) { this.plugin.settings.defaultFontSize = n; await this.plugin.saveSettings(); } }));
    new import_obsidian.Setting(containerEl).setName("Show Notifications").addToggle((t) => t.setValue(this.plugin.settings.showNotifications).onChange(async (v) => { this.plugin.settings.showNotifications = v; await this.plugin.saveSettings(); }));
    
    containerEl.createEl("h3", { text: "Visibility" });
    new import_obsidian.Setting(containerEl).setName("Show Decrement").addToggle((t) => t.setValue(this.plugin.settings.showDecrementBtn).onChange(async (v) => { this.plugin.settings.showDecrementBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Increment").addToggle((t) => t.setValue(this.plugin.settings.showIncrementBtn).onChange(async (v) => { this.plugin.settings.showIncrementBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Reset").addToggle((t) => t.setValue(this.plugin.settings.showResetBtn).onChange(async (v) => { this.plugin.settings.showResetBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Theme").addToggle((t) => t.setValue(this.plugin.settings.showThemeBtn).onChange(async (v) => { this.plugin.settings.showThemeBtn = v; await this.plugin.saveSettings(); }));
    
    containerEl.createEl("h3", { text: "Advanced Features" });
    new import_obsidian.Setting(containerEl).setName("Show Line Width").addToggle((t) => t.setValue(this.plugin.settings.showLineWidthBtn).onChange(async (v) => { this.plugin.settings.showLineWidthBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Reading Mode").addToggle((t) => t.setValue(this.plugin.settings.showReadingModeBtn).onChange(async (v) => { this.plugin.settings.showReadingModeBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Focus Mode").addToggle((t) => t.setValue(this.plugin.settings.showFocusBtn).onChange(async (v) => { this.plugin.settings.showFocusBtn = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Show Zen Mode").addToggle((t) => t.setValue(this.plugin.settings.showZenBtn).onChange(async (v) => { this.plugin.settings.showZenBtn = v; await this.plugin.saveSettings(); }));
  }
};