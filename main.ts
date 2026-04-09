import { App, Plugin, PluginSettingTab, Setting, setIcon, Notice, Menu, MarkdownView } from 'obsidian';

interface EasyViewSettings {
    buttonSize: number;
    showIncrementBtn: boolean;
    showDecrementBtn: boolean;
    showResetBtn: boolean;
    showThemeBtn: boolean;
    defaultFontSize: number;
    showLineWidthBtn: boolean;
    showFocusBtn: boolean;
    showZenBtn: boolean;
    showReadingModeBtn: boolean;
    focusModeActive: boolean;
    zenModeActive: boolean;
    lineWidthExpanded: boolean;
    showNotifications: boolean;
}

const DEFAULT_SETTINGS: EasyViewSettings = {
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

export default class EasyViewPlugin extends Plugin {
    settings: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;
    isReady: boolean = false;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));
        this.registerCommands();
        this.restoreStates();
        this.refreshStatusBar();

        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeIcon();
        }));

        setTimeout(() => { this.isReady = true; }, 1000);
    }

    onunload() {
        if (this.statusBarItem) this.statusBarItem.remove();
        /* Only clean up the classes that this plugin actually toggles */
        document.body.classList.remove('easyview-force-width', 'easyview-focus-mode', 'easyview-zen-mode');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshStatusBar();
    }

    notify(message: string, duration: number = 1500) {
        if (this.settings.showNotifications) {
            new Notice(message, duration);
        }
    }

    registerCommands() {
        this.addCommand({ id: 'toggle-focus-mode', name: 'Toggle Focus Mode', callback: () => this.toggleFocusMode() });
        this.addCommand({ id: 'toggle-zen-mode', name: 'Toggle Zen Mode', callback: () => this.toggleZenMode() });
        this.addCommand({ id: 'toggle-line-width', name: 'Toggle Line Width', callback: () => this.toggleLineWidth() });
        this.addCommand({ id: 'toggle-theme', name: 'Toggle Theme', callback: () => this.toggleTheme() });
        this.addCommand({ id: 'cycle-reading-mode', name: 'Cycle Reading Mode', callback: () => this.cycleReadingMode() });
        this.addCommand({ id: 'increase-font-size', name: 'Increase Font Size', callback: () => this.adjustFontSize(1) });
        this.addCommand({ id: 'decrease-font-size', name: 'Decrease Font Size', callback: () => this.adjustFontSize(-1) });
        this.addCommand({ id: 'reset-font-size', name: 'Reset Font Size', callback: () => this.resetFontSize() });
    }

    restoreStates() {
        if (this.settings.focusModeActive) document.body.classList.add('easyview-focus-mode');
        if (this.settings.zenModeActive) document.body.classList.add('easyview-zen-mode');
        if (this.settings.lineWidthExpanded) document.body.classList.add('easyview-force-width');
    }

    refreshStatusBar() {
        if (this.statusBarItem) this.statusBarItem.empty();
        else this.statusBarItem = this.addStatusBarItem();

        this.statusBarItem.addClass('plugin-easyview', 'easy-view-container-unique');
        this.statusBarItem.style.setProperty('--easy-view-btn-size', `${this.settings.buttonSize}px`);

        this.statusBarItem.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        };

        if (this.settings.showDecrementBtn) this.createBtn('minus', "Decrease", () => this.adjustFontSize(-1));
        if (this.settings.showIncrementBtn) this.createBtn('plus', "Increase", () => this.adjustFontSize(1));
        if (this.settings.showResetBtn) this.createBtn('rotate-ccw', "Reset", () => this.resetFontSize());
        if (this.settings.showLineWidthBtn) this.createBtn('arrow-left-right', "Width", () => this.toggleLineWidth());
        if (this.settings.showReadingModeBtn) this.createBtn('book-open', "Mode", () => this.cycleReadingMode());
        if (this.settings.showFocusBtn) this.createBtn('maximize', "Focus", () => this.toggleFocusMode());
        if (this.settings.showZenBtn) this.createBtn('eye-off', "Zen", () => this.toggleZenMode());

        if (this.settings.showThemeBtn) {
            this.themeBtn = this.createBtn('sun', "Theme", () => this.toggleTheme());
            this.updateThemeIcon();
        }
    }

    createBtn(icon: string, title: string, onclick: () => void) {
        const b = this.statusBarItem!.createEl('button', { cls: 'easy-view-btn' });
        setIcon(b, icon);
        b.title = title;
        b.onclick = onclick;
        return b;
    }

    showContextMenu(e: MouseEvent) {
        const menu = new Menu();
        menu.addItem(i => i.setTitle(this.settings.focusModeActive ? '✓ Focus' : 'Focus').setIcon('maximize').onClick(() => this.toggleFocusMode()));
        menu.addItem(i => i.setTitle(this.settings.zenModeActive ? '✓ Zen' : 'Zen').setIcon('eye-off').onClick(() => this.toggleZenMode()));
        menu.addItem(i => i.setTitle(this.settings.lineWidthExpanded ? '✓ Full Width' : 'Full Width').setIcon('arrow-left-right').onClick(() => this.toggleLineWidth()));
        menu.addSeparator();
        menu.addItem(i => i.setTitle('Toggle Theme').setIcon('sun').onClick(() => this.toggleTheme()));
        menu.showAtMouseEvent(e);
    }

    adjustFontSize(change: number) {
        const currentSize = (this.app.vault as any).getConfig('baseFontSize') || 16;
        let newSize = Math.min(Math.max(currentSize + change, 10), 30);
        (this.app.vault as any).setConfig('baseFontSize', newSize);
        (this.app as any).updateFontSize();
    }

    resetFontSize() {
        (this.app.vault as any).setConfig('baseFontSize', this.settings.defaultFontSize);
        (this.app as any).updateFontSize();
    }

    toggleTheme() {
        const currentTheme = (this.app.vault as any).getConfig('theme');
        const newTheme = currentTheme === 'obsidian' ? 'moonstone' : 'obsidian';
        (this.app.vault as any).setConfig('theme', newTheme);
        (this.app as any).updateTheme();
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        setIcon(this.themeBtn, (this.app.vault as any).getConfig('theme') === 'obsidian' ? 'moon' : 'sun');
    }

    toggleLineWidth() {
        const isExpanded = document.body.classList.toggle('easyview-force-width');
        this.settings.lineWidthExpanded = isExpanded;
        this.saveSettings();
    }

    toggleFocusMode() {
        if (!this.settings.focusModeActive && this.settings.zenModeActive) {
            document.body.classList.remove('easyview-zen-mode');
            this.settings.zenModeActive = false;
        }
        const isActive = document.body.classList.toggle('easyview-focus-mode');
        this.settings.focusModeActive = isActive;
        this.saveSettings();
    }

    toggleZenMode() {
        if (!this.settings.zenModeActive && this.settings.focusModeActive) {
            document.body.classList.remove('easyview-focus-mode');
            this.settings.focusModeActive = false;
        }
        const isActive = document.body.classList.toggle('easyview-zen-mode');
        this.settings.zenModeActive = isActive;
        this.saveSettings();
    }

    cycleReadingMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const state = view.getState();
        let mode = state.mode === 'source' && (state.source ?? true) ? 'source' : (state.mode === 'preview' ? 'source' : 'preview');
        let source = state.mode === 'source' && (state.source ?? true) ? false : (state.mode === 'preview' ? true : false);
        view.setState({ ...state, mode, source }, { history: false });
    }
}

class EasyViewSettingTab extends PluginSettingTab {
    plugin: EasyViewPlugin;
    constructor(app: App, plugin: EasyViewPlugin) { super(app, plugin); this.plugin = plugin; }
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Easy View Settings' });
        new Setting(containerEl).setName('Button Size (px)').addSlider(s => s.setLimits(10, 24, 1).setValue(this.plugin.settings.buttonSize).onChange(async v => { this.plugin.settings.buttonSize = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Default Font Size').addText(t => t.setValue(String(this.plugin.settings.defaultFontSize)).onChange(async v => { const n = parseInt(v); if (!isNaN(n)) { this.plugin.settings.defaultFontSize = n; await this.plugin.saveSettings(); } }));
        containerEl.createEl('h3', { text: 'Visibility' });
        new Setting(containerEl).setName('Show Decrement').addToggle(t => t.setValue(this.plugin.settings.showDecrementBtn).onChange(async v => { this.plugin.settings.showDecrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Increment').addToggle(t => t.setValue(this.plugin.settings.showIncrementBtn).onChange(async v => { this.plugin.settings.showIncrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Theme').addToggle(t => t.setValue(this.plugin.settings.showThemeBtn).onChange(async v => { this.plugin.settings.showThemeBtn = v; await this.plugin.saveSettings(); }));
        containerEl.createEl('h3', { text: 'Features' });
        new Setting(containerEl).setName('Show Width').addToggle(t => t.setValue(this.plugin.settings.showLineWidthBtn).onChange(async v => { this.plugin.settings.showLineWidthBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Zen').addToggle(t => t.setValue(this.plugin.settings.showZenBtn).onChange(async v => { this.plugin.settings.showZenBtn = v; await this.plugin.saveSettings(); }));
    }
}
