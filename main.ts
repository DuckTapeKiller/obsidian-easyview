import { App, Plugin, PluginSettingTab, Setting, setIcon, Notice, Menu, MarkdownView, Platform, TFile, Modal, TAbstractFile } from 'obsidian';

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
    deleteWithAttachments: boolean;
    showHistoryBtn: boolean;
    historySize: number;
    recentNotes: string[];
    contextMenuHistory: boolean;
    showMobileHistoryIcon: boolean;
}

interface VaultConfigAccessor {
    getConfig(key: string): unknown;
    setConfig(key: string, value: unknown): void;
}

interface AppViewUpdater {
    updateFontSize(): void;
    updateTheme(): void;
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
    contextMenuResetFont: false,
    deleteWithAttachments: true,
    showHistoryBtn: true,
    historySize: 10,
    recentNotes: [],
    contextMenuHistory: true,
    showMobileHistoryIcon: false
};

export default class EasyViewPlugin extends Plugin {
    settings!: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;
    modeBtn: HTMLElement | null = null;
    focusBtn: HTMLElement | null = null;
    zenBtn: HTMLElement | null = null;
    ribbonIconEl: HTMLElement | null = null;
    mobileNavbarHistoryBtn: HTMLElement | null = null;
    recentNotesModal: RecentNotesModal | null = null;
    historySaveTimer: number | null = null;
    lastTrackedNotePath: string | null = null;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));
        this.registerCommands();
        this.restoreStates();
        this.refreshRibbonIcon();

        this.app.workspace.onLayoutReady(() => {
            this.refreshStatusBar();
            this.updateModeIcon();
            this.updateMobileHistoryIcon();
            void this.trackRecentNote();
        });

        this.registerEvent(this.app.workspace.on('layout-change', () => {
            this.updateModeIcon();
            this.updateMobileHistoryIcon();
        }));

        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeIcon();
            if (this.settings.ribbonAction === 'toggle-theme') this.refreshRibbonIcon();
        }));

        this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
            this.updateModeIcon();
            void this.trackRecentNote();
        }));

        this.registerEvent(this.app.workspace.on('file-menu', (menu: Menu, file: TAbstractFile) => {
            if (!this.settings.deleteWithAttachments || !(file instanceof TFile) || file.extension !== 'md') return;
            menu.addItem((item) => {
                item.setTitle('Delete with attachments...')
                    .setIcon('trash-2')
                    .setSection('danger')
                    .onClick(() => this.promptDelete(file));
            });
        }));
    }

    onunload() {
        this.flushRecentNotesSave();
        if (this.statusBarItem) this.statusBarItem.remove();
        this.removeMobileHistoryIcon();
        document.body.classList.remove('easyview-focus-mode', 'easyview-zen-mode', 'easyview-has-history-icon');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.normalizeSettings();
    }

    async saveSettings() {
        this.normalizeSettings();
        await this.saveData(this.settings);
        this.refreshStatusBar();
        this.refreshRibbonIcon();
        this.updateMobileHistoryIcon();
    }

    clampSetting(value: unknown, fallback: number, min: number, max: number) {
        const parsed = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.min(max, Math.max(min, Math.round(parsed)));
    }

    normalizeSettings() {
        this.settings.buttonSize = this.clampSetting(this.settings.buttonSize, DEFAULT_SETTINGS.buttonSize, 10, 24);
        this.settings.defaultFontSize = this.clampSetting(this.settings.defaultFontSize, DEFAULT_SETTINGS.defaultFontSize, 10, 30);
        this.settings.historySize = this.clampSetting(this.settings.historySize, DEFAULT_SETTINGS.historySize, 5, 20);

        const recentNotes = Array.isArray(this.settings.recentNotes) ? this.settings.recentNotes : [];
        this.settings.recentNotes = [...new Set(recentNotes.filter((path): path is string => typeof path === 'string' && path.length > 0))]
            .slice(0, this.settings.historySize);
    }

    scheduleRecentNotesSave() {
        if (this.historySaveTimer !== null) {
            window.clearTimeout(this.historySaveTimer);
        }

        this.historySaveTimer = window.setTimeout(() => {
            this.historySaveTimer = null;
            void this.saveData(this.settings);
        }, 250);
    }

    flushRecentNotesSave() {
        if (this.historySaveTimer === null) return;

        window.clearTimeout(this.historySaveTimer);
        this.historySaveTimer = null;
        void this.saveData(this.settings);
    }

    async trackRecentNote() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || activeFile.extension !== 'md') return;
        if (activeFile.path === this.lastTrackedNotePath) return;

        const history = [activeFile.path, ...this.settings.recentNotes.filter(path => path !== activeFile.path)]
            .slice(0, this.settings.historySize);

        const hasChanged = history.length !== this.settings.recentNotes.length ||
            history.some((path, index) => path !== this.settings.recentNotes[index]);

        this.lastTrackedNotePath = activeFile.path;
        if (!hasChanged) return;

        this.settings.recentNotes = history;
        this.scheduleRecentNotesSave();
    }

    notify(message: string, duration: number = 1500) {
        if (this.settings.showNotifications) {
            new Notice(message, duration);
        }
    }

    openRecentNotes() {
        if (this.recentNotesModal) {
            this.recentNotesModal.close();
            return;
        }
        this.recentNotesModal = new RecentNotesModal(this);
        this.recentNotesModal.open();
    }

    getVaultConfig<T>(key: string) {
        return (this.app.vault as unknown as VaultConfigAccessor).getConfig(key) as T | undefined;
    }

    setVaultConfig(key: string, value: unknown) {
        (this.app.vault as unknown as VaultConfigAccessor).setConfig(key, value);
    }

    updateAppFontSize() {
        (this.app as unknown as AppViewUpdater).updateFontSize();
    }

    updateAppTheme() {
        (this.app as unknown as AppViewUpdater).updateTheme();
    }

    registerCommands() {
        this.addCommand({ id: 'toggle-focus-mode', name: 'Toggle Focus Mode', callback: () => this.toggleFocusMode() });
        this.addCommand({ id: 'toggle-zen-mode', name: 'Toggle Zen Mode', callback: () => this.toggleZenMode() });
        this.addCommand({ id: 'toggle-theme', name: 'Toggle Theme', callback: () => this.toggleTheme() });
        this.addCommand({ id: 'cycle-reading-mode', name: 'Cycle Reading Mode', callback: () => this.cycleReadingMode() });
        this.addCommand({ id: 'increase-font-size', name: 'Increase Font Size', callback: () => this.adjustFontSize(1) });
        this.addCommand({ id: 'decrease-font-size', name: 'Decrease Font Size', callback: () => this.adjustFontSize(-1) });
        this.addCommand({ id: 'reset-font-size', name: 'Reset Font Size', callback: () => this.resetFontSize() });
        this.addCommand({
            id: 'delete-current-note-with-attachments',
            name: 'Delete current note with linked attachments',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (this.settings.deleteWithAttachments && activeFile && activeFile.extension === 'md') {
                    if (!checking) this.promptDelete(activeFile);
                    return true;
                }
                return false;
            }
        });
        this.addCommand({
            id: 'recent-notes-history',
            name: 'Open recent notes',
            callback: () => {
                if (this.settings.recentNotes.length > 0) {
                    this.openRecentNotes();
                } else {
                    new Notice('No recent notes history available.');
                }
            }
        });
    }

    restoreStates() {
        if (this.settings.focusModeActive) document.body.classList.add('easyview-focus-mode');
        if (this.settings.zenModeActive) document.body.classList.add('easyview-zen-mode');
    }

    refreshStatusBar() {
        if (this.statusBarItem) this.statusBarItem.empty();
        else this.statusBarItem = this.addStatusBarItem();

        this.themeBtn = null;
        this.modeBtn = null;
        this.focusBtn = null;
        this.zenBtn = null;

        this.statusBarItem.addClass('plugin-easyview', 'easy-view-container-unique');
        this.statusBarItem.style.setProperty('--easy-view-btn-size', `${this.settings.buttonSize}px`);

        this.statusBarItem.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        };

        if (this.settings.showHistoryBtn) this.createBtn('history', "Recent Notes", () => this.openRecentNotes());
        if (this.settings.showDecrementBtn) this.createBtn('minus', "Decrease", () => this.adjustFontSize(-1));
        if (this.settings.showIncrementBtn) this.createBtn('plus', "Increase", () => this.adjustFontSize(1));
        if (this.settings.showResetBtn) this.createBtn('rotate-ccw', "Reset", () => this.resetFontSize());
        if (this.settings.showReadingModeBtn) {
            this.modeBtn = this.createBtn('book-open', "Mode", () => this.cycleReadingMode());
            this.updateModeIcon();
        }
        
        if (this.settings.showFocusBtn) {
            this.focusBtn = this.createBtn('maximize', "Focus", () => this.toggleFocusMode());
            if (this.settings.focusModeActive) this.focusBtn.addClass('is-active');
        }
        
        if (this.settings.showZenBtn) {
            this.zenBtn = this.createBtn('eye-off', "Zen", () => this.toggleZenMode());
            if (this.settings.zenModeActive) this.zenBtn.addClass('is-active');
        }

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
        let hasStatefulItems = false;

        if (this.settings.contextMenuFocus) {
            menu.addItem(i => i
                .setTitle(this.settings.focusModeActive ? '✓ Focus Mode' : 'Focus Mode')
                .setIcon('maximize')
                .onClick(() => this.toggleFocusMode()));
            hasItems = true;
            hasStatefulItems = true;
        }

        if (this.settings.contextMenuZen) {
            menu.addItem(i => i
                .setTitle(this.settings.zenModeActive ? '✓ Zen Mode' : 'Zen Mode')
                .setIcon('eye-off')
                .onClick(() => this.toggleZenMode()));
            hasItems = true;
            hasStatefulItems = true;
        }

        const hasActions = this.settings.contextMenuReadingMode || this.settings.contextMenuTheme ||
            this.settings.contextMenuIncreaseFont || this.settings.contextMenuDecreaseFont ||
            this.settings.contextMenuResetFont;

        if (hasStatefulItems && hasActions) menu.addSeparator();

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

        if (this.settings.contextMenuHistory) {
            if (hasItems) menu.addSeparator();
            menu.addItem(i => i
                .setTitle('Recent notes…')
                .setIcon('history')
                .onClick(() => this.openRecentNotes()));
            hasItems = true;
        }

        if (hasItems) menu.showAtMouseEvent(e);
    }

    adjustFontSize(change: number) {
        const currentSize = this.getVaultConfig<number>('baseFontSize') || this.settings.defaultFontSize;
        const newSize = Math.min(Math.max(currentSize + change, 10), 30);
        this.setVaultConfig('baseFontSize', newSize);
        this.updateAppFontSize();
        this.notify(`Font size: ${newSize}px`);
    }

    resetFontSize() {
        this.setVaultConfig('baseFontSize', this.settings.defaultFontSize);
        this.updateAppFontSize();
        this.notify(`Font size reset to ${this.settings.defaultFontSize}px`);
    }

    toggleTheme() {
        const currentTheme = this.getVaultConfig<string>('theme');
        const newTheme = currentTheme === 'obsidian' ? 'moonstone' : 'obsidian';
        this.setVaultConfig('theme', newTheme);
        this.updateAppTheme();
        this.updateThemeIcon();
        if (this.settings.ribbonAction === 'toggle-theme') this.refreshRibbonIcon();
        this.notify(`Theme: ${newTheme === 'obsidian' ? 'Dark' : 'Light'}`);
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        setIcon(this.themeBtn, this.getVaultConfig<string>('theme') === 'obsidian' ? 'moon' : 'sun');
    }

    updateModeIcon() {
        if (!this.modeBtn) return;
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const state = view.getState();
        this.modeBtn.empty();
        if (state.mode === 'preview') {
            setIcon(this.modeBtn, 'book-open');
            this.modeBtn.title = 'Reading View';
        } else if (state.source === true) {
            setIcon(this.modeBtn, 'code');
            this.modeBtn.title = 'Source Mode';
        } else {
            setIcon(this.modeBtn, 'pencil');
            this.modeBtn.title = 'Live Preview';
        }
    }

    toggleFocusMode() {
        if (!this.settings.focusModeActive && this.settings.zenModeActive) {
            document.body.classList.remove('easyview-zen-mode');
            this.settings.zenModeActive = false;
            if (this.zenBtn) this.zenBtn.removeClass('is-active');
        }
        const isActive = document.body.classList.toggle('easyview-focus-mode');
        this.settings.focusModeActive = isActive;
        if (this.focusBtn) this.focusBtn.toggleClass('is-active', isActive);
        void this.saveSettings();
        this.notify(`Focus Mode: ${isActive ? 'ON' : 'OFF'}`);
    }

    toggleZenMode() {
        if (!this.settings.zenModeActive && this.settings.focusModeActive) {
            document.body.classList.remove('easyview-focus-mode');
            this.settings.focusModeActive = false;
            if (this.focusBtn) this.focusBtn.removeClass('is-active');
        }
        const isActive = document.body.classList.toggle('easyview-zen-mode');
        this.settings.zenModeActive = isActive;
        if (this.zenBtn) this.zenBtn.toggleClass('is-active', isActive);
        void this.saveSettings();
        this.notify(`Zen Mode: ${isActive ? 'ON' : 'OFF'}`);
    }

    async cycleReadingMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const state = view.getState();

        let mode: string, source: boolean, label: string;

        if (state.mode === 'preview') {
            mode = 'source'; source = true; label = 'Source';
        } else if (state.source === true) {
            mode = 'source'; source = false; label = 'Live Preview';
        } else {
            mode = 'preview'; source = false; label = 'Reading';
        }

        await view.setState({ ...state, mode, source }, { history: false });
        this.updateModeIcon();
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
                    icon = this.getVaultConfig<string>('theme') === 'obsidian' ? 'moon' : 'sun';
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

    updateMobileHistoryIcon() {
        const navbar = Platform.isMobile ? document.querySelector<HTMLElement>('.mobile-navbar-actions') : null;
        const forwardBtn = navbar?.querySelector<HTMLElement>('.mobile-navbar-action-forward') ?? null;
        const existingBtn = navbar?.querySelector<HTMLElement>('.easyview-mobile-history') ?? null;

        if (!this.settings.showMobileHistoryIcon || !navbar || !forwardBtn) {
            this.removeMobileHistoryIcon();
            return;
        }

        document.body.classList.add('easyview-has-history-icon');

        if (existingBtn) {
            this.mobileNavbarHistoryBtn = existingBtn;
            return;
        }

        this.mobileNavbarHistoryBtn = document.createElement('div');
        this.mobileNavbarHistoryBtn.className = 'mobile-navbar-action easyview-mobile-history';
        this.mobileNavbarHistoryBtn.setAttribute('role', 'button');
        this.mobileNavbarHistoryBtn.setAttribute('aria-label', 'Recent Notes');
        this.mobileNavbarHistoryBtn.tabIndex = 0;

        const iconWrapper = this.mobileNavbarHistoryBtn.createEl('span', {
            cls: 'clickable-icon'
        });
        setIcon(iconWrapper, 'history');

        this.registerDomEvent(this.mobileNavbarHistoryBtn, 'click', () => this.openRecentNotes());
        this.registerDomEvent(this.mobileNavbarHistoryBtn, 'keydown', (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            this.openRecentNotes();
        });

        navbar.insertBefore(this.mobileNavbarHistoryBtn, forwardBtn);
    }

    removeMobileHistoryIcon() {
        document.body.classList.remove('easyview-has-history-icon');

        const existingBtn = document.querySelector<HTMLElement>('.easyview-mobile-history');
        if (existingBtn) existingBtn.remove();
        if (this.mobileNavbarHistoryBtn && this.mobileNavbarHistoryBtn !== existingBtn) {
            this.mobileNavbarHistoryBtn.remove();
        }

        this.mobileNavbarHistoryBtn = null;
    }

    getLinkedImages(file: TFile): TFile[] {
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache) return [];

        const images = new Set<string>();
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'avif'];
        const links = cache.embeds || [];

        for (const link of links) {
            const rawPath = link.link.split('#')[0];
            const resolvedFile = this.app.metadataCache.getFirstLinkpathDest(rawPath, file.path);
            if (resolvedFile instanceof TFile && imageExtensions.includes(resolvedFile.extension.toLowerCase())) {
                images.add(resolvedFile.path);
            }
        }

        return Array.from(images)
            .map(path => this.app.vault.getAbstractFileByPath(path))
            .filter((file): file is TFile => file instanceof TFile);
    }

    async promptDelete(file: TFile) {
        const images = this.getLinkedImages(file);
        new DeleteWithAttachmentsModal(this.app, file, images, async (deleteImages) => {
            let deletedCount = 0;
            if (deleteImages) {
                for (const img of images) {
                    try {
                        await this.app.fileManager.trashFile(img);
                        deletedCount++;
                    } catch (e) {
                        new Notice(`Failed to delete ${img.name}`);
                    }
                }
            }

            try {
                const noteName = file.basename;
                await this.app.fileManager.trashFile(file);
                const msg = deletedCount > 0 
                    ? `Deleted ${noteName} and ${deletedCount} image${deletedCount === 1 ? '' : 's'}.`
                    : `Deleted ${noteName}.`;
                new Notice(msg);
            } catch (e) {
                new Notice(`Failed to delete ${file.name}`);
            }
        }).open();
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

        new Setting(containerEl)
            .setName('History Icon in Navbar')
            .setDesc('Display a dedicated history icon in the mobile bottom navigation bar.')
            .addToggle(t => t
                .setValue(this.plugin.settings.showMobileHistoryIcon)
                .onChange(async v => {
                    this.plugin.settings.showMobileHistoryIcon = v;
                    await this.plugin.saveSettings();
                }));

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
        new Setting(containerEl).setName('Recent Notes').addToggle(t => t.setValue(this.plugin.settings.contextMenuHistory).onChange(async v => { this.plugin.settings.contextMenuHistory = v; await this.plugin.saveSettings(); }));

        containerEl.createEl('h3', { text: 'File Management' });
        new Setting(containerEl)
            .setName('Delete with Attachments')
            .setDesc('When deleting a note, prompt to also trash its linked images. Works independently of Obsidian\'s native confirmation setting.')
            .addToggle(t => t
                .setValue(this.plugin.settings.deleteWithAttachments)
                .onChange(async (value) => {
                    this.plugin.settings.deleteWithAttachments = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'Recent History' });
        new Setting(containerEl)
            .setName('Show History Button')
            .setDesc('Display a recent notes button in the status bar.')
            .addToggle(t => t
                .setValue(this.plugin.settings.showHistoryBtn)
                .onChange(async (value) => {
                    this.plugin.settings.showHistoryBtn = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('History Size')
            .setDesc('Maximum number of recent notes to remember (5–20).')
            .addSlider(s => s
                .setLimits(5, 20, 1)
                .setDynamicTooltip()
                .setValue(this.plugin.settings.historySize)
                .onChange(async (value) => {
                    this.plugin.settings.historySize = value;
                    this.plugin.settings.recentNotes = this.plugin.settings.recentNotes.slice(0, value);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Clear History')
            .addButton(b => b
                .setButtonText('Clear')
                .onClick(async () => {
                    this.plugin.settings.recentNotes = [];
                    await this.plugin.saveSettings();
                    new Notice('Recent notes history cleared.');
                }));
    }
}

class DeleteWithAttachmentsModal extends Modal {
    file: TFile;
    images: TFile[];
    callback: (deleteImages: boolean) => Promise<void>;

    constructor(app: App, file: TFile, images: TFile[], callback: (deleteImages: boolean) => Promise<void>) {
        super(app);
        this.file = file;
        this.images = images;
        this.callback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Delete note' });
        contentEl.createEl('p', { text: `Are you sure you want to move "${this.file.basename}" to trash?` });

        let deleteImages = true;
        if (this.images.length > 0) {
            const row = contentEl.createDiv({ cls: 'dwa-checkbox-row' });
            const check = row.createEl('input', { type: 'checkbox', attr: { id: 'dwa-delete-images' } });
            check.checked = true;
            check.addEventListener('change', () => { deleteImages = check.checked; });
            row.createEl('label', { 
                text: `Also delete ${this.images.length} linked image${this.images.length === 1 ? '' : 's'}:`,
                attr: { for: 'dwa-delete-images' }
            });

            const list = contentEl.createEl('ul', { cls: 'dwa-image-list' });
            this.images.forEach(img => {
                list.createEl('li', { text: img.name });
            });
        } else {
            contentEl.createEl('p', { text: 'No linked images found.', cls: 'dwa-no-images' });
        }

        const buttons = contentEl.createDiv({ cls: 'dwa-button-row' });
        buttons.createEl('button', { text: 'Cancel' }).onclick = () => this.close();
        const delBtn = buttons.createEl('button', { text: 'Delete', cls: 'mod-warning' });
        delBtn.onclick = async () => {
            await this.callback(deleteImages);
            this.close();
        };
    }

    onClose() {
    }
}

class RecentNotesModal extends Modal {
    plugin: EasyViewPlugin;
    isNavigating = false;

    constructor(plugin: EasyViewPlugin) {
        super(plugin.app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        this.modalEl.addClass('easyview-recent-notes-modal');
        this.modalEl.closest('.modal-container')?.addClass('easyview-recent-notes-container');
        contentEl.createEl('h2', { text: 'Recent Notes' });

        const activeFile = this.app.workspace.getActiveFile();
        const recent = this.plugin.settings.recentNotes.filter(path => !activeFile || path !== activeFile.path);

        if (recent.length === 0) {
            contentEl.createEl('p', { text: 'No recent notes yet.' });
            return;
        }

        recent.forEach(path => {
            const file = this.app.vault.getAbstractFileByPath(path);
            const basename = path.split('/').pop()?.replace(/\.md$/, '') || path;
            
            if (file instanceof TFile) {
                const item = contentEl.createEl('button', {
                    cls: 'recent-note-item',
                    text: basename
                });
                item.type = 'button';
                item.onclick = () => {
                    if (this.isNavigating) return;

                    this.isNavigating = true;
                    item.disabled = true;
                    
                    // Kill animations immediately by hiding the entire container
                    const container = this.modalEl.closest('.modal-container') as HTMLElement;
                    if (container) {
                        container.style.display = 'none';
                        container.style.setProperty('display', 'none', 'important');
                    }
                    this.modalEl.style.display = 'none';
                    this.modalEl.style.setProperty('display', 'none', 'important');
                    
                    this.close();
                    void this.app.workspace.getLeaf(false).openFile(file);
                };
            } else {
                contentEl.createDiv({ 
                    cls: 'recent-note-item--deleted', 
                    text: `${basename} (deleted)` 
                });
            }
        });
    }

    close() {
        const container = this.modalEl.closest('.modal-container') as HTMLElement;
        if (container) {
            container.style.display = 'none';
            container.style.setProperty('display', 'none', 'important');
        }
        this.modalEl.style.display = 'none';
        this.modalEl.style.setProperty('display', 'none', 'important');
        super.close();
    }

    onClose() {
        this.plugin.recentNotesModal = null;
    }
}
