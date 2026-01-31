import { App, Plugin, PluginSettingTab, Setting, setIcon, Notice, Menu, MarkdownView } from 'obsidian';

// --- Constants (Options) ---

const BODY_FONTS: Record<string, string> = {
    "'iA Writer Quattro S', sans-serif": "iA Writer Quattro S (Sans)",
    "'Montserrat', sans-serif": "Montserrat (Sans)",
    "'Sen', sans-serif": "Sen (Sans)",
    "'Libre Franklin', sans-serif": "Libre Franklin (Sans)",
    "'iA Writer Duo S', sans-serif": "iA Writer Duo S (Sans)",
    "'Libre Baskerville', serif": "Libre Baskerville (Serif)",
    "'Hepta Slab', serif": "Hepta Slab (Serif)",
    "'Libre Caslon Text', serif": "Libre Caslon Text (Serif)",
    "'Spectral', serif": "Spectral (Serif)",
    "'Noto Sans Mono', monospace": "Noto Sans Mono (Mono Sans)",
    "'iA Writer Mono S', monospace": "iA Writer Mono S (Mono Sans)"
};

const UI_FONTS: Record<string, string> = {
    "'Sen', sans-serif": "Sen (Sans)",
    "'Montserrat', sans-serif": "Montserrat (Sans)",
    "'iA Writer Quattro S', sans-serif": "iA Writer Quattro S (Sans)",
    "'Libre Franklin', sans-serif": "Libre Franklin (Sans)",
    "'iA Writer Duo S', sans-serif": "iA Writer Duo S (Sans)",
    "'Marcellus', serif": "Marcellus (Serif)",
    "'Libre Baskerville', serif": "Libre Baskerville (Serif)",
    "'Hepta Slab', serif": "Hepta Slab (Serif)",
    "'Libre Caslon Text', serif": "Libre Caslon Text (Serif)",
    "'Spectral', serif": "Spectral (Serif)",
    "'Noto Sans Mono', monospace": "Noto Sans Mono (Mono Sans)",
    "'iA Writer Mono S', monospace": "iA Writer Mono S (Mono Sans)"
};

const MONO_FONTS: Record<string, string> = {
    "'Noto Sans Mono', monospace": "Noto Sans Mono (Default)",
    "'iA Writer Mono S', monospace": "iA Writer Mono S (Mono Sans)"
};

const LIGHT_UI_COLORS: Record<string, string> = {
    '#505050': '#505050',
    '#404040': '#404040',
    '#303030': '#303030',
    '#222222': '#222222',
    '#202020': '#202020',
    '#101010': '#101010',
    '#000000': '#000000'
};

const LIGHT_BODY_COLORS: Record<string, string> = {
    '#505050': '#505050',
    '#404040': '#404040',
    '#303030': '#303030',
    '#202020': '#202020',
    '#101010': '#101010',
    '#000000': '#000000'
};

const DARK_UI_COLORS: Record<string, string> = {
    '#a0a0a0': '#a0a0a0',
    '#a9a9a9': '#a9a9a9',
    '#b3b3b3': '#b3b3b3',
    '#bcbcbc': '#bcbcbc',
    '#c6c6c6': '#c6c6c6',
    '#cfcfcf': '#cfcfcf',
    '#d9d9d9': '#d9d9d9',
    '#e2e2e2': '#e2e2e2',
    '#ececec': '#ececec',
    '#f5f5f5': '#f5f5f5',
    '#ffffff': '#ffffff'
};

const DARK_BODY_COLORS: Record<string, string> = {
    '#a0a0a0': '#a0a0a0',
    '#a9a9a9': '#a9a9a9',
    '#b3b3b3': '#b3b3b3',
    '#bcbcbc': '#bcbcbc',
    '#c6c6c6': '#c6c6c6',
    '#cfcfcf': '#cfcfcf',
    '#d9d9d9': '#d9d9d9',
    '#e2e2e2': '#e2e2e2',
    '#ececec': '#ececec',
    '#f5f5f5': '#f5f5f5',
    '#ffffff': '#ffffff'
};

// Style Settings Integration - Brutalist theme section ID
const STYLE_SETTINGS_SECTION_ID = 'brutalist-theme';

// Line Height Options
const LINE_HEIGHTS = [1.4, 1.5, 1.6, 1.8, 2.0];
const LINE_HEIGHT_LABELS = ['Compact (1.4)', 'Normal (1.5)', 'Relaxed (1.6)', 'Spacious (1.8)', 'Double (2.0)'];

// Reading Mode Options
const READING_MODES = ['source', 'live', 'preview'] as const;
const READING_MODE_LABELS = ['Source Mode', 'Live Preview', 'Reading View'];

interface EasyViewSettings {
    buttonSize: number;
    showIncrementBtn: boolean;
    showDecrementBtn: boolean;
    showResetBtn: boolean;
    showThemeBtn: boolean;
    defaultFontSize: number;
    // Advanced
    showLineWidthBtn: boolean;
    showFocusBtn: boolean;
    showZenBtn: boolean;
    showFontBtn: boolean;
    showColorBtn: boolean;
    showLineHeightBtn: boolean;
    showReadingModeBtn: boolean;

    // State Persistence
    focusModeActive: boolean;
    zenModeActive: boolean;
    lineWidthExpanded: boolean;
    activeFontPreset: number;  // 0=default, 1-3=presets
    activeColorPreset: number;
    activeLineHeightIndex: number;

    // Notifications
    showNotifications: boolean;

    // Font Presets (Body, UI, Mono) with Names
    fontPreset1Name: string;
    fontPreset1Body: string;
    fontPreset1UI: string;
    fontPreset1Mono: string;

    fontPreset2Name: string;
    fontPreset2Body: string;
    fontPreset2UI: string;
    fontPreset2Mono: string;

    fontPreset3Name: string;
    fontPreset3Body: string;
    fontPreset3UI: string;
    fontPreset3Mono: string;

    // Color Presets with Names
    colorPreset1Name: string;
    colorPreset1LightUI: string;
    colorPreset1LightBody: string;
    colorPreset1DarkUI: string;
    colorPreset1DarkBody: string;

    colorPreset2Name: string;
    colorPreset2LightUI: string;
    colorPreset2LightBody: string;
    colorPreset2DarkUI: string;
    colorPreset2DarkBody: string;

    colorPreset3Name: string;
    colorPreset3LightUI: string;
    colorPreset3LightBody: string;
    colorPreset3DarkUI: string;
    colorPreset3DarkBody: string;
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
    showFontBtn: false,
    showColorBtn: false,
    showLineHeightBtn: false,
    showReadingModeBtn: false,

    // State Persistence Defaults
    focusModeActive: false,
    zenModeActive: false,
    lineWidthExpanded: false,
    activeFontPreset: 0,
    activeColorPreset: 0,
    activeLineHeightIndex: 1, // Default to 1.5

    // Notifications
    showNotifications: true,

    // Defaults P1 (Serif-ish)
    fontPreset1Name: "Serif",
    fontPreset1Body: "'Libre Baskerville', serif",
    fontPreset1UI: "'Libre Baskerville', serif",
    fontPreset1Mono: "'Noto Sans Mono', monospace",

    // Defaults P2 (Mono)
    fontPreset2Name: "Mono",
    fontPreset2Body: "'Noto Sans Mono', monospace",
    fontPreset2UI: "'Noto Sans Mono', monospace",
    fontPreset2Mono: "'Noto Sans Mono', monospace",

    // Defaults P3 (Sans)
    fontPreset3Name: "Sans",
    fontPreset3Body: "'Sen', sans-serif",
    fontPreset3UI: "'Sen', sans-serif",
    fontPreset3Mono: "'Noto Sans Mono', monospace",

    // Defaults Colors
    colorPreset1Name: "High Contrast",
    colorPreset1LightUI: '#222222',
    colorPreset1LightBody: '#202020',
    colorPreset1DarkUI: '#e2e2e2',
    colorPreset1DarkBody: '#e2e2e2',

    colorPreset2Name: "Soft",
    colorPreset2LightUI: '#505050',
    colorPreset2LightBody: '#505050',
    colorPreset2DarkUI: '#bcbcbc',
    colorPreset2DarkBody: '#bcbcbc',

    colorPreset3Name: "Maximum",
    colorPreset3LightUI: '#000000',
    colorPreset3LightBody: '#000000',
    colorPreset3DarkUI: '#ffffff',
    colorPreset3DarkBody: '#ffffff',
}

export default class EasyViewPlugin extends Plugin {
    settings: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;

    async onload() {
        console.debug('Loading EasyView plugin');
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));

        // Register all commands
        this.registerCommands();

        // Restore persisted states
        this.restoreStates();

        this.refreshStatusBar();
        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeIcon();
        }));
    }

    onunload() {
        console.debug('Unloading EasyView plugin');
        if (this.statusBarItem) this.statusBarItem.remove();
        document.body.classList.remove('easyview-force-width');
        document.body.classList.remove('easyview-focus-mode');
        document.body.classList.remove('easyview-zen-mode');
        this.clearFontOverrides();
        this.clearColorOverrides();
        this.clearLineHeightOverride();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshStatusBar();
    }

    /**
     * Show a notification if enabled
     */
    notify(message: string, duration: number = 1500) {
        if (this.settings.showNotifications) {
            new Notice(message, duration);
        }
    }

    /**
     * Register all command palette commands
     */
    registerCommands() {
        // Focus Mode
        this.addCommand({
            id: 'toggle-focus-mode',
            name: 'Toggle Focus Mode',
            callback: () => this.toggleFocusMode()
        });

        // Zen Mode
        this.addCommand({
            id: 'toggle-zen-mode',
            name: 'Toggle Zen Mode (Ultra Focus)',
            callback: () => this.toggleZenMode()
        });

        // Line Width
        this.addCommand({
            id: 'toggle-line-width',
            name: 'Toggle Line Width (Standard/Full)',
            callback: () => this.toggleLineWidth()
        });

        // Theme Toggle
        this.addCommand({
            id: 'toggle-theme',
            name: 'Toggle Theme (Light/Dark)',
            callback: () => this.toggleTheme()
        });

        // Font Preset
        this.addCommand({
            id: 'cycle-font-preset',
            name: 'Cycle Font Preset',
            callback: () => this.cycleFont()
        });

        // Color Preset
        this.addCommand({
            id: 'cycle-color-preset',
            name: 'Cycle Color Preset',
            callback: () => this.cycleColor()
        });

        // Reading Mode
        this.addCommand({
            id: 'cycle-reading-mode',
            name: 'Cycle Reading Mode (Source/Live/Reading)',
            callback: () => this.cycleReadingMode()
        });

        // Line Height
        this.addCommand({
            id: 'cycle-line-height',
            name: 'Cycle Line Height',
            callback: () => this.cycleLineHeight()
        });

        // Font Size Controls
        this.addCommand({
            id: 'increase-font-size',
            name: 'Increase Font Size',
            callback: () => this.adjustFontSize(1)
        });

        this.addCommand({
            id: 'decrease-font-size',
            name: 'Decrease Font Size',
            callback: () => this.adjustFontSize(-1)
        });

        this.addCommand({
            id: 'reset-font-size',
            name: 'Reset Font Size',
            callback: () => this.resetFontSize()
        });

        // Direct preset selection
        for (let i = 1; i <= 3; i++) {
            this.addCommand({
                id: `select-font-preset-${i}`,
                name: `Select Font Preset ${i}`,
                callback: () => this.selectFontPreset(i)
            });
            this.addCommand({
                id: `select-color-preset-${i}`,
                name: `Select Color Preset ${i}`,
                callback: () => this.selectColorPreset(i)
            });
        }
    }

    /**
     * Restore persisted states on load
     */
    restoreStates() {
        // Restore Focus Mode
        if (this.settings.focusModeActive) {
            document.body.classList.add('easyview-focus-mode');
        }

        // Restore Zen Mode
        if (this.settings.zenModeActive) {
            document.body.classList.add('easyview-zen-mode');
        }

        // Restore Line Width
        if (this.settings.lineWidthExpanded) {
            document.body.classList.add('easyview-force-width');
        }

        // Restore Font Preset
        if (this.settings.activeFontPreset > 0) {
            const n = this.settings.activeFontPreset as 1 | 2 | 3;
            // @ts-ignore
            const body = this.settings[`fontPreset${n}Body`];
            // @ts-ignore
            const ui = this.settings[`fontPreset${n}UI`];
            // @ts-ignore
            const mono = this.settings[`fontPreset${n}Mono`];
            this.applyFont(body, ui, mono, false); // Don't notify on restore
        }

        // Restore Color Preset
        if (this.settings.activeColorPreset > 0) {
            const n = this.settings.activeColorPreset as 1 | 2 | 3;
            // @ts-ignore
            const lightUI = this.settings[`colorPreset${n}LightUI`];
            // @ts-ignore
            const lightBody = this.settings[`colorPreset${n}LightBody`];
            // @ts-ignore
            const darkUI = this.settings[`colorPreset${n}DarkUI`];
            // @ts-ignore
            const darkBody = this.settings[`colorPreset${n}DarkBody`];
            this.applyColor(lightUI, lightBody, darkUI, darkBody, false);
        }

        // Restore Line Height
        this.applyLineHeight(this.settings.activeLineHeightIndex, false);
    }

    refreshStatusBar() {
        if (this.statusBarItem) this.statusBarItem.empty();
        else this.statusBarItem = this.addStatusBarItem();

        this.statusBarItem.addClass('plugin-easyview');
        this.statusBarItem.addClass('easy-view-container-unique');
        this.statusBarItem.style.setProperty('--easy-view-btn-size', `${this.settings.buttonSize}px`);

        // Add context menu
        this.statusBarItem.oncontextmenu = (e) => {
            e.preventDefault();
            this.showContextMenu(e);
        };

        if (this.settings.showDecrementBtn) {
            const minusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(minusBtn, 'minus');
            minusBtn.title = "Decrease Font Size";
            minusBtn.onclick = () => this.adjustFontSize(-1);
        }

        if (this.settings.showIncrementBtn) {
            const plusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(plusBtn, 'plus');
            plusBtn.title = "Increase Font Size";
            plusBtn.onclick = () => this.adjustFontSize(1);
        }

        if (this.settings.showResetBtn) {
            const resetBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(resetBtn, 'rotate-ccw');
            resetBtn.title = "Reset Font Size";
            resetBtn.onclick = () => this.resetFontSize();
        }

        if (this.settings.showLineWidthBtn) {
            const widthBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(widthBtn, 'arrow-left-right');
            widthBtn.title = "Toggle Line Width";
            widthBtn.onclick = () => this.toggleLineWidth();
        }

        if (this.settings.showLineHeightBtn) {
            const lineHeightBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(lineHeightBtn, 'align-justify');
            lineHeightBtn.title = "Cycle Line Height";
            lineHeightBtn.onclick = () => this.cycleLineHeight();
        }

        if (this.settings.showReadingModeBtn) {
            const readingBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(readingBtn, 'book-open');
            readingBtn.title = "Cycle Reading Mode";
            readingBtn.onclick = () => this.cycleReadingMode();
        }

        if (this.settings.showFocusBtn) {
            const focusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(focusBtn, 'maximize');
            focusBtn.title = "Toggle Focus Mode";
            focusBtn.onclick = () => this.toggleFocusMode();
        }

        if (this.settings.showZenBtn) {
            const zenBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(zenBtn, 'eye-off');
            zenBtn.title = "Toggle Zen Mode";
            zenBtn.onclick = () => this.toggleZenMode();
        }

        if (this.settings.showFontBtn) {
            const fontBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(fontBtn, 'type');
            fontBtn.title = "Cycle Font Preset";
            fontBtn.onclick = () => this.cycleFont();
        }

        if (this.settings.showColorBtn) {
            const colorBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(colorBtn, 'palette');
            colorBtn.title = "Cycle Font Color";
            colorBtn.onclick = () => this.cycleColor();
        }

        if (this.settings.showThemeBtn) {
            this.themeBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn easy-view-theme-btn' });
            this.themeBtn.title = "Switch Theme";
            this.themeBtn.onclick = () => this.toggleTheme();
            this.updateThemeIcon();
        } else {
            this.themeBtn = null;
        }
    }

    /**
     * Show context menu with all options
     */
    showContextMenu(e: MouseEvent) {
        const menu = new Menu();

        menu.addItem(item => item
            .setTitle(this.settings.focusModeActive ? '✓ Focus Mode' : 'Focus Mode')
            .setIcon('maximize')
            .onClick(() => this.toggleFocusMode()));

        menu.addItem(item => item
            .setTitle(this.settings.zenModeActive ? '✓ Zen Mode' : 'Zen Mode')
            .setIcon('eye-off')
            .onClick(() => this.toggleZenMode()));

        menu.addItem(item => item
            .setTitle(this.settings.lineWidthExpanded ? '✓ Full Width' : 'Full Width')
            .setIcon('arrow-left-right')
            .onClick(() => this.toggleLineWidth()));

        menu.addSeparator();

        // Font Presets submenu
        menu.addItem(item => item
            .setTitle('Font Presets')
            .setIcon('type')
            .onClick(() => { }));

        for (let i = 0; i <= 3; i++) {
            const label = i === 0 ? 'Default' : this.getPresetName('font', i);
            const isActive = this.settings.activeFontPreset === i;
            menu.addItem(item => item
                .setTitle(`${isActive ? '✓ ' : '   '}${label}`)
                .onClick(() => this.selectFontPreset(i)));
        }

        menu.addSeparator();

        // Color Presets submenu
        menu.addItem(item => item
            .setTitle('Color Presets')
            .setIcon('palette')
            .onClick(() => { }));

        for (let i = 0; i <= 3; i++) {
            const label = i === 0 ? 'Default' : this.getPresetName('color', i);
            const isActive = this.settings.activeColorPreset === i;
            menu.addItem(item => item
                .setTitle(`${isActive ? '✓ ' : '   '}${label}`)
                .onClick(() => this.selectColorPreset(i)));
        }

        menu.addSeparator();

        // Line Height
        menu.addItem(item => item
            .setTitle('Line Height')
            .setIcon('align-justify')
            .onClick(() => { }));

        LINE_HEIGHT_LABELS.forEach((label, i) => {
            const isActive = this.settings.activeLineHeightIndex === i;
            menu.addItem(item => item
                .setTitle(`${isActive ? '✓ ' : '   '}${label}`)
                .onClick(() => {
                    this.settings.activeLineHeightIndex = i;
                    this.applyLineHeight(i);
                    this.saveSettings();
                }));
        });

        menu.addSeparator();

        menu.addItem(item => item
            .setTitle('Reading Mode')
            .setIcon('book-open')
            .onClick(() => this.cycleReadingMode()));

        menu.addItem(item => item
            .setTitle('Toggle Theme')
            .setIcon('sun')
            .onClick(() => this.toggleTheme()));

        menu.showAtMouseEvent(e);
    }

    /**
     * Get preset name
     */
    getPresetName(type: 'font' | 'color', n: number): string {
        // @ts-ignore
        return this.settings[`${type}Preset${n}Name`] || `Preset ${n}`;
    }

    adjustFontSize(change: number) {
        // @ts-ignore
        const currentSize = this.app.vault.getConfig('baseFontSize') || 16;
        let newSize = currentSize + change;
        if (newSize < 10) newSize = 10;
        if (newSize > 30) newSize = 30;
        // @ts-ignore
        this.app.vault.setConfig('baseFontSize', newSize);
        // @ts-ignore
        this.app.updateFontSize();
        this.notify(`Font Size: ${newSize}px`);
    }

    resetFontSize() {
        // @ts-ignore
        this.app.vault.setConfig('baseFontSize', this.settings.defaultFontSize);
        // @ts-ignore
        this.app.updateFontSize();
        this.notify(`Font Size: ${this.settings.defaultFontSize}px (Reset)`);
    }

    toggleTheme() {
        // @ts-ignore
        const currentTheme = this.app.vault.getConfig('theme');
        const newTheme = currentTheme === 'obsidian' ? 'moonstone' : 'obsidian';
        // @ts-ignore
        this.app.vault.setConfig('theme', newTheme);
        // @ts-ignore
        this.app.updateTheme();
        this.updateThemeIcon();
        this.notify(newTheme === 'obsidian' ? 'Theme: Dark' : 'Theme: Light');
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        // @ts-ignore
        const currentTheme = this.app.vault.getConfig('theme');
        const isDark = currentTheme === 'obsidian';
        setIcon(this.themeBtn, isDark ? 'moon' : 'sun');
    }

    toggleLineWidth() {
        const isExpanded = document.body.classList.toggle('easyview-force-width');
        this.settings.lineWidthExpanded = isExpanded;
        this.saveSettings();
        this.notify(isExpanded ? 'Line Width: Full' : 'Line Width: Standard');
    }

    toggleFocusMode() {
        // Disable Zen mode if enabling Focus mode
        if (!this.settings.focusModeActive && this.settings.zenModeActive) {
            document.body.classList.remove('easyview-zen-mode');
            this.settings.zenModeActive = false;
        }

        const isActive = document.body.classList.toggle('easyview-focus-mode');
        this.settings.focusModeActive = isActive;
        this.saveSettings();
        this.notify(isActive ? 'Focus Mode: ON' : 'Focus Mode: OFF');
    }

    toggleZenMode() {
        // Disable Focus mode if enabling Zen mode
        if (!this.settings.zenModeActive && this.settings.focusModeActive) {
            document.body.classList.remove('easyview-focus-mode');
            this.settings.focusModeActive = false;
        }

        const isActive = document.body.classList.toggle('easyview-zen-mode');
        this.settings.zenModeActive = isActive;
        this.saveSettings();
        this.notify(isActive ? 'Zen Mode: ON' : 'Zen Mode: OFF');
    }

    cycleFont() {
        this.settings.activeFontPreset = (this.settings.activeFontPreset + 1) % 4;
        if (this.settings.activeFontPreset === 0) {
            this.clearFontOverrides();
            this.notify('Fonts: Default');
        } else {
            const n = this.settings.activeFontPreset as 1 | 2 | 3;
            // @ts-ignore
            const body = this.settings[`fontPreset${n}Body`];
            // @ts-ignore
            const ui = this.settings[`fontPreset${n}UI`];
            // @ts-ignore
            const mono = this.settings[`fontPreset${n}Mono`];
            this.applyFont(body, ui, mono);
            this.notify(`Fonts: ${this.getPresetName('font', n)}`);
        }
        this.saveSettings();
    }

    selectFontPreset(n: number) {
        this.settings.activeFontPreset = n;
        if (n === 0) {
            this.clearFontOverrides();
            this.notify('Fonts: Default');
        } else {
            // @ts-ignore
            const body = this.settings[`fontPreset${n}Body`];
            // @ts-ignore
            const ui = this.settings[`fontPreset${n}UI`];
            // @ts-ignore
            const mono = this.settings[`fontPreset${n}Mono`];
            this.applyFont(body, ui, mono);
            this.notify(`Fonts: ${this.getPresetName('font', n)}`);
        }
        this.saveSettings();
    }

    /**
     * Get the Style Settings plugin instance if available
     */
    getStyleSettings(): any | null {
        // @ts-ignore - accessing internal plugins object
        return this.app.plugins?.plugins?.['obsidian-style-settings'] ?? null;
    }

    /**
     * Update Style Settings with font values for persistence
     */
    syncFontToStyleSettings(body: string, ui: string, mono: string) {
        const styleSettings = this.getStyleSettings();
        if (styleSettings?.settingsManager) {
            try {
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'font-text-override', body);
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'font-ui-override', ui);
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'font-monospace-override', mono);
                console.debug('EasyView: Synced fonts to Style Settings');
            } catch (e) {
                console.warn('EasyView: Failed to sync fonts to Style Settings', e);
            }
        }
    }

    /**
     * Clear font values from Style Settings (reset to theme defaults)
     */
    clearFontFromStyleSettings() {
        const styleSettings = this.getStyleSettings();
        if (styleSettings?.settingsManager) {
            try {
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'font-text-override');
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'font-ui-override');
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'font-monospace-override');
                console.debug('EasyView: Cleared fonts from Style Settings');
            } catch (e) {
                console.warn('EasyView: Failed to clear fonts from Style Settings', e);
            }
        }
    }

    applyFont(body: string, ui: string, mono: string, showNotice: boolean = true) {
        // Apply immediately via inline styles for instant feedback
        document.body.style.setProperty('--font-text-override', body);
        document.body.style.setProperty('--font-ui-override', ui);
        document.body.style.setProperty('--font-monospace-override', mono);

        // Persist to Style Settings for survival across restarts
        this.syncFontToStyleSettings(body, ui, mono);
    }

    clearFontOverrides() {
        document.body.style.removeProperty('--font-text-override');
        document.body.style.removeProperty('--font-ui-override');
        document.body.style.removeProperty('--font-monospace-override');

        // Clear from Style Settings as well
        this.clearFontFromStyleSettings();
    }

    cycleColor() {
        this.settings.activeColorPreset = (this.settings.activeColorPreset + 1) % 4;
        if (this.settings.activeColorPreset === 0) {
            this.clearColorOverrides();
            this.notify('Colors: Default');
        } else {
            const n = this.settings.activeColorPreset as 1 | 2 | 3;
            // @ts-ignore
            const lightUI = this.settings[`colorPreset${n}LightUI`];
            // @ts-ignore
            const lightBody = this.settings[`colorPreset${n}LightBody`];
            // @ts-ignore
            const darkUI = this.settings[`colorPreset${n}DarkUI`];
            // @ts-ignore
            const darkBody = this.settings[`colorPreset${n}DarkBody`];
            this.applyColor(lightUI, lightBody, darkUI, darkBody);
            this.notify(`Colors: ${this.getPresetName('color', n)}`);
        }
        this.saveSettings();
    }

    selectColorPreset(n: number) {
        this.settings.activeColorPreset = n;
        if (n === 0) {
            this.clearColorOverrides();
            this.notify('Colors: Default');
        } else {
            // @ts-ignore
            const lightUI = this.settings[`colorPreset${n}LightUI`];
            // @ts-ignore
            const lightBody = this.settings[`colorPreset${n}LightBody`];
            // @ts-ignore
            const darkUI = this.settings[`colorPreset${n}DarkUI`];
            // @ts-ignore
            const darkBody = this.settings[`colorPreset${n}DarkBody`];
            this.applyColor(lightUI, lightBody, darkUI, darkBody);
            this.notify(`Colors: ${this.getPresetName('color', n)}`);
        }
        this.saveSettings();
    }

    /**
     * Update Style Settings with color values for persistence
     */
    syncColorToStyleSettings(lightUI: string, lightBody: string, darkUI: string, darkBody: string) {
        const styleSettings = this.getStyleSettings();
        if (styleSettings?.settingsManager) {
            try {
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'ui-font-color-light', lightUI);
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'body-font-color-light', lightBody);
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'ui-font-color-dark', darkUI);
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'body-font-color-dark', darkBody);
                console.debug('EasyView: Synced colors to Style Settings');
            } catch (e) {
                console.warn('EasyView: Failed to sync colors to Style Settings', e);
            }
        }
    }

    /**
     * Clear color values from Style Settings (reset to theme defaults)
     */
    clearColorFromStyleSettings() {
        const styleSettings = this.getStyleSettings();
        if (styleSettings?.settingsManager) {
            try {
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'ui-font-color-light');
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'body-font-color-light');
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'ui-font-color-dark');
                styleSettings.settingsManager.clearSetting(STYLE_SETTINGS_SECTION_ID, 'body-font-color-dark');
                console.debug('EasyView: Cleared colors from Style Settings');
            } catch (e) {
                console.warn('EasyView: Failed to clear colors from Style Settings', e);
            }
        }
    }

    applyColor(lightUI: string, lightBody: string, darkUI: string, darkBody: string, showNotice: boolean = true) {
        // Apply immediately via inline styles for instant feedback
        document.body.style.setProperty('--ui-font-color-light', lightUI);
        document.body.style.setProperty('--body-font-color-light', lightBody);
        document.body.style.setProperty('--ui-font-color-dark', darkUI);
        document.body.style.setProperty('--body-font-color-dark', darkBody);

        // Persist to Style Settings for survival across restarts
        this.syncColorToStyleSettings(lightUI, lightBody, darkUI, darkBody);
    }

    clearColorOverrides() {
        document.body.style.removeProperty('--ui-font-color-light');
        document.body.style.removeProperty('--body-font-color-light');
        document.body.style.removeProperty('--ui-font-color-dark');
        document.body.style.removeProperty('--body-font-color-dark');

        // Clear from Style Settings as well
        this.clearColorFromStyleSettings();
    }

    /**
     * Cycle through line height values
     */
    cycleLineHeight() {
        this.settings.activeLineHeightIndex = (this.settings.activeLineHeightIndex + 1) % LINE_HEIGHTS.length;
        this.applyLineHeight(this.settings.activeLineHeightIndex);
        this.saveSettings();
    }

    applyLineHeight(index: number, showNotice: boolean = true) {
        const lineHeight = LINE_HEIGHTS[index];
        document.body.style.setProperty('--line-height-custom', lineHeight.toString());

        // Also try to sync to Style Settings if it has this setting
        const styleSettings = this.getStyleSettings();
        if (styleSettings?.settingsManager) {
            try {
                styleSettings.settingsManager.setSetting(STYLE_SETTINGS_SECTION_ID, 'line-height-custom', lineHeight);
            } catch (e) {
                // Silent fail - theme may not have this setting
            }
        }

        if (showNotice) {
            this.notify(`Line Height: ${LINE_HEIGHT_LABELS[index]}`);
        }
    }

    clearLineHeightOverride() {
        document.body.style.removeProperty('--line-height-custom');
    }

    /**
     * Cycle through reading modes
     */
    cycleReadingMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            this.notify('No active markdown view');
            return;
        }

        const state = view.getState();
        const currentMode = state.mode || 'source';
        const currentSource = state.source ?? true;

        let newMode: string;
        let newSource: boolean;

        // Cycle: source -> live preview -> reading -> source
        if (currentMode === 'source' && currentSource) {
            // Source mode -> Live Preview
            newMode = 'source';
            newSource = false;
            this.notify('Mode: Live Preview');
        } else if (currentMode === 'source' && !currentSource) {
            // Live Preview -> Reading
            newMode = 'preview';
            newSource = false;
            this.notify('Mode: Reading View');
        } else {
            // Reading -> Source
            newMode = 'source';
            newSource = true;
            this.notify('Mode: Source');
        }

        view.setState({ ...state, mode: newMode, source: newSource }, { history: false });
    }
}

class EasyViewSettingTab extends PluginSettingTab {
    plugin: EasyViewPlugin;

    constructor(app: App, plugin: EasyViewPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Easy View Settings' });

        // --- Basic Settings ---
        new Setting(containerEl).setName('Button Size (px)').addSlider(s => s.setLimits(10, 24, 1).setValue(this.plugin.settings.buttonSize).setDynamicTooltip().onChange(async v => { this.plugin.settings.buttonSize = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Default Font Size').addText(t => t.setValue(String(this.plugin.settings.defaultFontSize)).onChange(async v => { const n = parseInt(v); if (!isNaN(n)) { this.plugin.settings.defaultFontSize = n; await this.plugin.saveSettings(); } }));
        new Setting(containerEl).setName('Show Notifications').setDesc('Show brief notifications when actions are performed').addToggle(t => t.setValue(this.plugin.settings.showNotifications).onChange(async v => { this.plugin.settings.showNotifications = v; await this.plugin.saveSettings(); }));

        // --- Visibility ---
        containerEl.createEl('h3', { text: 'Button Visibility' });
        new Setting(containerEl).setName('Show Decrement (-)').addToggle(t => t.setValue(this.plugin.settings.showDecrementBtn).onChange(async v => { this.plugin.settings.showDecrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Reset (↺)').addToggle(t => t.setValue(this.plugin.settings.showResetBtn).onChange(async v => { this.plugin.settings.showResetBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Increment (+)').addToggle(t => t.setValue(this.plugin.settings.showIncrementBtn).onChange(async v => { this.plugin.settings.showIncrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Theme (☀/☾)').addToggle(t => t.setValue(this.plugin.settings.showThemeBtn).onChange(async v => { this.plugin.settings.showThemeBtn = v; await this.plugin.saveSettings(); }));

        // --- Advanced Features ---
        containerEl.createEl('h3', { text: 'Advanced Features' });
        new Setting(containerEl).setName('Show Line Width (↔)').addToggle(t => t.setValue(this.plugin.settings.showLineWidthBtn).onChange(async v => { this.plugin.settings.showLineWidthBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Line Height').addToggle(t => t.setValue(this.plugin.settings.showLineHeightBtn).onChange(async v => { this.plugin.settings.showLineHeightBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Reading Mode').addToggle(t => t.setValue(this.plugin.settings.showReadingModeBtn).onChange(async v => { this.plugin.settings.showReadingModeBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Focus Mode (◎)').addToggle(t => t.setValue(this.plugin.settings.showFocusBtn).onChange(async v => { this.plugin.settings.showFocusBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Zen Mode').setDesc('Ultra focus - hides everything except content').addToggle(t => t.setValue(this.plugin.settings.showZenBtn).onChange(async v => { this.plugin.settings.showZenBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Font Switcher (Aa)').addToggle(t => t.setValue(this.plugin.settings.showFontBtn).onChange(async v => { this.plugin.settings.showFontBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Color Switcher (Palette)').addToggle(t => t.setValue(this.plugin.settings.showColorBtn).onChange(async v => { this.plugin.settings.showColorBtn = v; await this.plugin.saveSettings(); }));

        // --- Font Presets ---
        containerEl.createEl('h3', { text: 'Font Switcher Presets' });
        this.addFontPreset(containerEl, 1);
        this.addFontPreset(containerEl, 2);
        this.addFontPreset(containerEl, 3);

        // --- Color Presets ---
        containerEl.createEl('h3', { text: 'Color Switcher Presets' });
        this.addColorPreset(containerEl, 1);
        this.addColorPreset(containerEl, 2);
        this.addColorPreset(containerEl, 3);

        // --- Keyboard Shortcuts Info ---
        containerEl.createEl('h3', { text: 'Keyboard Shortcuts' });
        containerEl.createEl('p', { text: 'All features are available via the Command Palette (Cmd/Ctrl+P). Search for "EasyView" to find all commands. You can assign custom hotkeys in Settings → Hotkeys.' });
    }

    addFontPreset(container: HTMLElement, n: number) {
        container.createEl('h4', { text: `Preset ${n}` });

        // Preset Name
        new Setting(container)
            .setName('Preset Name')
            .addText(t => t
                // @ts-ignore
                .setValue(this.plugin.settings[`fontPreset${n}Name`])
                .setPlaceholder(`Preset ${n}`)
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`fontPreset${n}Name`] = v || `Preset ${n}`;
                    await this.plugin.saveSettings();
                }));

        // Body Font
        new Setting(container)
            .setName('Body Font')
            .addDropdown(d => d
                .addOptions(BODY_FONTS)
                // @ts-ignore
                .setValue(this.plugin.settings[`fontPreset${n}Body`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`fontPreset${n}Body`] = v;
                    await this.plugin.saveSettings();
                }));

        // UI Font
        new Setting(container)
            .setName('UI Font')
            .addDropdown(d => d
                .addOptions(UI_FONTS)
                // @ts-ignore
                .setValue(this.plugin.settings[`fontPreset${n}UI`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`fontPreset${n}UI`] = v;
                    await this.plugin.saveSettings();
                }));

        // Mono Font
        new Setting(container)
            .setName('Monospace Font')
            .addDropdown(d => d
                .addOptions(MONO_FONTS)
                // @ts-ignore
                .setValue(this.plugin.settings[`fontPreset${n}Mono`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`fontPreset${n}Mono`] = v;
                    await this.plugin.saveSettings();
                }));
    }

    addColorPreset(container: HTMLElement, n: number) {
        container.createEl('h4', { text: `Preset ${n}` });

        // Preset Name
        new Setting(container)
            .setName('Preset Name')
            .addText(t => t
                // @ts-ignore
                .setValue(this.plugin.settings[`colorPreset${n}Name`])
                .setPlaceholder(`Preset ${n}`)
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`colorPreset${n}Name`] = v || `Preset ${n}`;
                    await this.plugin.saveSettings();
                }));

        // Light UI
        new Setting(container)
            .setName('Light Mode: UI Color')
            .addDropdown(d => d
                .addOptions(LIGHT_UI_COLORS)
                // @ts-ignore
                .setValue(this.plugin.settings[`colorPreset${n}LightUI`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`colorPreset${n}LightUI`] = v;
                    await this.plugin.saveSettings();
                }));

        // Light Body
        new Setting(container)
            .setName('Light Mode: Body Color')
            .addDropdown(d => d
                .addOptions(LIGHT_BODY_COLORS)
                // @ts-ignore
                .setValue(this.plugin.settings[`colorPreset${n}LightBody`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`colorPreset${n}LightBody`] = v;
                    await this.plugin.saveSettings();
                }));

        // Dark UI
        new Setting(container)
            .setName('Dark Mode: UI Color')
            .addDropdown(d => d
                .addOptions(DARK_UI_COLORS)
                // @ts-ignore
                .setValue(this.plugin.settings[`colorPreset${n}DarkUI`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`colorPreset${n}DarkUI`] = v;
                    await this.plugin.saveSettings();
                }));

        // Dark Body
        new Setting(container)
            .setName('Dark Mode: Body Color')
            .addDropdown(d => d
                .addOptions(DARK_BODY_COLORS)
                // @ts-ignore
                .setValue(this.plugin.settings[`colorPreset${n}DarkBody`])
                .onChange(async v => {
                    // @ts-ignore
                    this.plugin.settings[`colorPreset${n}DarkBody`] = v;
                    await this.plugin.saveSettings();
                }));
    }
}
