import { App, Plugin, PluginSettingTab, Setting, setIcon, Notice, Menu, MarkdownView, Platform } from 'obsidian';

interface EasyViewSettings {
    buttonSize: number;
    showIncrementBtn: boolean;
    showDecrementBtn: boolean;
    showResetBtn: boolean;
    showThemeBtn: boolean;
    defaultFontSize: number;
    showFocusBtn: boolean;
    showZenBtn: boolean;
    showReadingModeBtn: boolean;
    focusModeActive: boolean;
    zenModeActive: boolean;
    showNotifications: boolean;
    showRibbonIcon: boolean;
    ribbonAction: string;
    contextMenuFocus: boolean;
    contextMenuZen: boolean;
    contextMenuReadingMode: boolean;
    contextMenuTheme: boolean;
    contextMenuIncreaseFont: boolean;
    contextMenuDecreaseFont: boolean;
    contextMenuResetFont: boolean;
}

const DEFAULT_SETTINGS: EasyViewSettings = {
    buttonSize: 13,
    showIncrementBtn: true,
    showDecrementBtn: true,
    showResetBtn: true,
    showThemeBtn: true,
    defaultFontSize: 18,
    showFocusBtn: true,
    showZenBtn: false,
    showReadingModeBtn: true,
    focusModeActive: false,
    zenModeActive: false,
    showNotifications: true,
    showRibbonIcon: true,
    ribbonAction: 'toggle-theme',
    contextMenuFocus: true,
    contextMenuZen: true,
    contextMenuReadingMode: true,
    contextMenuTheme: true,
    contextMenuIncreaseFont: false,
    contextMenuDecreaseFont: false,
    contextMenuResetFont: false
};

export default class EasyViewPlugin extends Plugin {
    settings: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;
    ribbonIconEl: HTMLElement | null = null;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));
        this.registerCommands();
        this.restoreStates();
        this.refreshStatusBar();
        this.refreshRibbonIcon();

        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeIcon();
            if (this.settings.ribbonAction === 'toggle-theme') this.refreshRibbonIcon();
        }));
    }

    onunload() {
        if (this.statusBarItem) this.statusBarItem.remove();
        document.body.classList.remove('easyview-focus-mode', 'easyview-zen-mode');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshStatusBar();
        this.refreshRibbonIcon();
    }

    notify(message: string, duration: number = 1500) {
        if (this.settings.showNotifications) {
            new Notice(message, duration);
        }
    }

    registerCommands() {
        this.addCommand({ id: 'toggle-focus-mode', name: 'Toggle Focus Mode', callback: () => this.toggleFocusMode() });
        this.addCommand({ id: 'toggle-zen-mode', name: 'Toggle Zen Mode', callback: () => this.toggleZenMode() });
        this.addCommand({ id: 'toggle-theme', name: 'Toggle Theme', callback: () => this.toggleTheme() });
        this.addCommand({ id: 'cycle-reading-mode', name: 'Cycle Reading Mode', callback: () => this.cycleReadingMode() });
        this.addCommand({ id: 'increase-font-size', name: 'Increase Font Size', callback: () => this.adjustFontSize(1) });
        this.addCommand({ id: 'decrease-font-size', name: 'Decrease Font Size', callback: () => this.adjustFontSize(-1) });
        this.addCommand({ id: 'reset-font-size', name: 'Reset Font Size', callback: () => this.resetFontSize() });
    }

    restoreStates() {
        if (this.settings.focusModeActive) document.body.classList.add('easyview-focus-mode');
        if (this.settings.zenModeActive) document.body.classList.add('easyview-zen-mode');
    }

    refreshStatusBar() {
        if (this.statusBarItem) this.statusBarItem.empty();
        else this.statusBarItem = this.addStatusBarItem();

        this.themeBtn = null;

        this.statusBarItem.addClass('plugin-easyview', 'easy-view-container-unique');
        this.statusBarItem.style.setProperty('--easy-view-btn-size', `${this.settings.buttonSize}px`);

        this.statusBarItem.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        };

        if (this.settings.showDecrementBtn) this.createBtn('minus', "Decrease", () => this.adjustFontSize(-1));
        if (this.settings.showIncrementBtn) this.createBtn('plus', "Increase", () => this.adjustFontSize(1));
        if (this.settings.showResetBtn) this.createBtn('rotate-ccw', "Reset", () => this.resetFontSize());
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
        let hasItems = false;

        // Stateful toggle items (show checkmark when active)
        if (this.settings.contextMenuFocus) {
            menu.addItem(i => i
                .setTitle(this.settings.focusModeActive ? '✓ Focus Mode' : 'Focus Mode')
                .setIcon('maximize')
                .onClick(() => this.toggleFocusMode()));
            hasItems = true;
        }

        if (this.settings.contextMenuZen) {
            menu.addItem(i => i
                .setTitle(this.settings.zenModeActive ? '✓ Zen Mode' : 'Zen Mode')
                .setIcon('eye-off')
                .onClick(() => this.toggleZenMode()));
            hasItems = true;
        }

        // Separator between stateful and action items (only if both groups have items)
        const hasStateful = this.settings.contextMenuFocus || this.settings.contextMenuZen;
        const hasActions = this.settings.contextMenuReadingMode || this.settings.contextMenuTheme ||
            this.settings.contextMenuIncreaseFont || this.settings.contextMenuDecreaseFont ||
            this.settings.contextMenuResetFont;

        if (hasStateful && hasActions) menu.addSeparator();

        // Action items
        if (this.settings.contextMenuReadingMode) {
            menu.addItem(i => i
                .setTitle('Cycle Reading Mode')
                .setIcon('book-open')
                .onClick(() => this.cycleReadingMode()));
            hasItems = true;
        }

        if (this.settings.contextMenuTheme) {
            menu.addItem(i => i
                .setTitle('Toggle Theme')
                .setIcon('sun')
                .onClick(() => this.toggleTheme()));
            hasItems = true;
        }

        if (this.settings.contextMenuIncreaseFont) {
            menu.addItem(i => i
                .setTitle('Increase Font Size')
                .setIcon('plus')
                .onClick(() => this.adjustFontSize(1)));
            hasItems = true;
        }

        if (this.settings.contextMenuDecreaseFont) {
            menu.addItem(i => i
                .setTitle('Decrease Font Size')
                .setIcon('minus')
                .onClick(() => this.adjustFontSize(-1)));
            hasItems = true;
        }

        if (this.settings.contextMenuResetFont) {
            menu.addItem(i => i
                .setTitle('Reset Font Size')
                .setIcon('rotate-ccw')
                .onClick(() => this.resetFontSize()));
            hasItems = true;
        }

        if (hasItems) menu.showAtMouseEvent(e);
    }

    adjustFontSize(change: number) {
        const currentSize = (this.app.vault as any).getConfig('baseFontSize') || 16;
        let newSize = Math.min(Math.max(currentSize + change, 10), 30);
        (this.app.vault as any).setConfig('baseFontSize', newSize);
        (this.app as any).updateFontSize();
        this.notify(`Font size: ${newSize}px`);
    }

    resetFontSize() {
        (this.app.vault as any).setConfig('baseFontSize', this.settings.defaultFontSize);
        (this.app as any).updateFontSize();
        this.notify(`Font size reset to ${this.settings.defaultFontSize}px`);
    }

    toggleTheme() {
        const currentTheme = (this.app.vault as any).getConfig('theme');
        const newTheme = currentTheme === 'obsidian' ? 'moonstone' : 'obsidian';
        (this.app.vault as any).setConfig('theme', newTheme);
        (this.app as any).updateTheme();
        this.updateThemeIcon();
        if (this.settings.ribbonAction === 'toggle-theme') this.refreshRibbonIcon();
        this.notify(`Theme: ${newTheme === 'obsidian' ? 'Dark' : 'Light'}`);
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        setIcon(this.themeBtn, (this.app.vault as any).getConfig('theme') === 'obsidian' ? 'moon' : 'sun');
    }

    toggleFocusMode() {
        if (!this.settings.focusModeActive && this.settings.zenModeActive) {
            document.body.classList.remove('easyview-zen-mode');
            this.settings.zenModeActive = false;
        }
        const isActive = document.body.classList.toggle('easyview-focus-mode');
        this.settings.focusModeActive = isActive;
        this.saveSettings();
        this.notify(`Focus Mode: ${isActive ? 'ON' : 'OFF'}`);
    }

    toggleZenMode() {
        if (!this.settings.zenModeActive && this.settings.focusModeActive) {
            document.body.classList.remove('easyview-focus-mode');
            this.settings.focusModeActive = false;
        }
        const isActive = document.body.classList.toggle('easyview-zen-mode');
        this.settings.zenModeActive = isActive;
        this.saveSettings();
        this.notify(`Zen Mode: ${isActive ? 'ON' : 'OFF'}`);
    }

    cycleReadingMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const state = view.getState();

        let mode: string, source: boolean, label: string;

        if (state.mode === 'preview') {
            // Reading → Source
            mode = 'source'; source = true; label = 'Source';
        } else if (state.source === true) {
            // Source → Live Preview
            mode = 'source'; source = false; label = 'Live Preview';
        } else {
            // Live Preview → Reading
            mode = 'preview'; source = false; label = 'Reading';
        }

        view.setState({ ...state, mode, source }, { history: false });
        this.notify(`Mode: ${label}`);
    }

    refreshRibbonIcon() {
        if (this.ribbonIconEl) {
            this.ribbonIconEl.remove();
            this.ribbonIconEl = null;
        }
        if (this.settings.showRibbonIcon && Platform.isMobile) {
            let icon = 'help-circle';
            let title = 'EasyView';
            let action = () => {};
            switch (this.settings.ribbonAction) {
                case 'toggle-theme':
                    icon = (this.app.vault as any).getConfig('theme') === 'obsidian' ? 'moon' : 'sun';
                    title = 'Toggle Theme';
                    action = () => this.toggleTheme();
                    break;
                case 'increase-font':
                    icon = 'plus';
                    title = 'Increase Font Size';
                    action = () => this.adjustFontSize(1);
                    break;
                case 'decrease-font':
                    icon = 'minus';
                    title = 'Decrease Font Size';
                    action = () => this.adjustFontSize(-1);
                    break;
                case 'reset-font':
                    icon = 'rotate-ccw';
                    title = 'Reset Font Size';
                    action = () => this.resetFontSize();
                    break;
                case 'toggle-focus':
                    icon = 'maximize';
                    title = 'Toggle Focus Mode';
                    action = () => this.toggleFocusMode();
                    break;
                case 'toggle-zen':
                    icon = 'eye-off';
                    title = 'Toggle Zen Mode';
                    action = () => this.toggleZenMode();
                    break;
                case 'cycle-mode':
                    icon = 'book-open';
                    title = 'Cycle Reading Mode';
                    action = () => this.cycleReadingMode();
                    break;
            }
            this.ribbonIconEl = this.addRibbonIcon(icon, title, action);
        }
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

        containerEl.createEl('h3', { text: 'Mobile / Ribbon' });
        new Setting(containerEl).setName('Show Ribbon Icon (Mobile Only)').setDesc('Display a shortcut icon on the mobile navigation bar. This setting is ignored on desktop.').addToggle(t => t.setValue(this.plugin.settings.showRibbonIcon).onChange(async v => { this.plugin.settings.showRibbonIcon = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Ribbon Icon Action').setDesc('Select which feature the ribbon icon should trigger.').addDropdown(d => d
            .addOption('toggle-theme', 'Toggle Theme')
            .addOption('increase-font', 'Increase Font Size')
            .addOption('decrease-font', 'Decrease Font Size')
            .addOption('reset-font', 'Reset Font Size')
            .addOption('toggle-focus', 'Toggle Focus Mode')
            .addOption('toggle-zen', 'Toggle Zen Mode')
            .addOption('cycle-mode', 'Cycle Reading Mode')
            .setValue(this.plugin.settings.ribbonAction)
            .onChange(async v => { this.plugin.settings.ribbonAction = v; await this.plugin.saveSettings(); }));

        containerEl.createEl('h3', { text: 'Visibility' });
        new Setting(containerEl).setName('Show Decrement').addToggle(t => t.setValue(this.plugin.settings.showDecrementBtn).onChange(async v => { this.plugin.settings.showDecrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Increment').addToggle(t => t.setValue(this.plugin.settings.showIncrementBtn).onChange(async v => { this.plugin.settings.showIncrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Reset').addToggle(t => t.setValue(this.plugin.settings.showResetBtn).onChange(async v => { this.plugin.settings.showResetBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Theme').addToggle(t => t.setValue(this.plugin.settings.showThemeBtn).onChange(async v => { this.plugin.settings.showThemeBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Focus').addToggle(t => t.setValue(this.plugin.settings.showFocusBtn).onChange(async v => { this.plugin.settings.showFocusBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show View Switcher').setDesc('Reader / Editing / Source').addToggle(t => t.setValue(this.plugin.settings.showReadingModeBtn).onChange(async v => { this.plugin.settings.showReadingModeBtn = v; await this.plugin.saveSettings(); }));

        containerEl.createEl('h3', { text: 'Features' });
        new Setting(containerEl).setName('Show Zen').addToggle(t => t.setValue(this.plugin.settings.showZenBtn).onChange(async v => { this.plugin.settings.showZenBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Action Tooltips').setDesc('Show a notification popup when an action (e.g., resizing font) is performed.').addToggle(t => t.setValue(this.plugin.settings.showNotifications).onChange(async v => { this.plugin.settings.showNotifications = v; await this.plugin.saveSettings(); }));

        containerEl.createEl('h3', { text: 'Context Menu' });
        containerEl.createEl('p', { text: 'Choose which items appear when you right-click the status bar.', cls: 'setting-item-description' });
        new Setting(containerEl).setName('Focus Mode').addToggle(t => t.setValue(this.plugin.settings.contextMenuFocus).onChange(async v => { this.plugin.settings.contextMenuFocus = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Zen Mode').addToggle(t => t.setValue(this.plugin.settings.contextMenuZen).onChange(async v => { this.plugin.settings.contextMenuZen = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Cycle Reading Mode').addToggle(t => t.setValue(this.plugin.settings.contextMenuReadingMode).onChange(async v => { this.plugin.settings.contextMenuReadingMode = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Toggle Theme').addToggle(t => t.setValue(this.plugin.settings.contextMenuTheme).onChange(async v => { this.plugin.settings.contextMenuTheme = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Increase Font Size').addToggle(t => t.setValue(this.plugin.settings.contextMenuIncreaseFont).onChange(async v => { this.plugin.settings.contextMenuIncreaseFont = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Decrease Font Size').addToggle(t => t.setValue(this.plugin.settings.contextMenuDecreaseFont).onChange(async v => { this.plugin.settings.contextMenuDecreaseFont = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Reset Font Size').addToggle(t => t.setValue(this.plugin.settings.contextMenuResetFont).onChange(async v => { this.plugin.settings.contextMenuResetFont = v; await this.plugin.saveSettings(); }));
    }
}
