import { App, Plugin, PluginSettingTab, Setting, setIcon } from 'obsidian';

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
    showFontBtn: boolean;
    showColorBtn: boolean;

    // Font Presets (Body, UI, Mono)
    fontPreset1Body: string;
    fontPreset1UI: string;
    fontPreset1Mono: string;

    fontPreset2Body: string;
    fontPreset2UI: string;
    fontPreset2Mono: string;

    fontPreset3Body: string;
    fontPreset3UI: string;
    fontPreset3Mono: string;

    // Color Presets (Light UI, Light Body, Dark UI, Dark Body)
    colorPreset1LightUI: string;
    colorPreset1LightBody: string;
    colorPreset1DarkUI: string;
    colorPreset1DarkBody: string;

    colorPreset2LightUI: string;
    colorPreset2LightBody: string;
    colorPreset2DarkUI: string;
    colorPreset2DarkBody: string;

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
    showFontBtn: false,
    showColorBtn: false,

    // Defaults P1 (Serif-ish)
    fontPreset1Body: "'Libre Baskerville', serif",
    fontPreset1UI: "'Libre Baskerville', serif",
    fontPreset1Mono: "'Noto Sans Mono', monospace",

    // Defaults P2 (Mono)
    fontPreset2Body: "'Noto Sans Mono', monospace",
    fontPreset2UI: "'Noto Sans Mono', monospace",
    fontPreset2Mono: "'Noto Sans Mono', monospace",

    // Defaults P3 (Sans)
    fontPreset3Body: "'Sen', sans-serif",
    fontPreset3UI: "'Sen', sans-serif",
    fontPreset3Mono: "'Noto Sans Mono', monospace",

    // Defaults Colors (Distinct defaults)
    colorPreset1LightUI: '#222222',
    colorPreset1LightBody: '#202020',
    colorPreset1DarkUI: '#e2e2e2',
    colorPreset1DarkBody: '#e2e2e2',

    colorPreset2LightUI: '#505050',
    colorPreset2LightBody: '#505050',
    colorPreset2DarkUI: '#bcbcbc',
    colorPreset2DarkBody: '#bcbcbc',

    colorPreset3LightUI: '#000000',
    colorPreset3LightBody: '#000000',
    colorPreset3DarkUI: '#ffffff',
    colorPreset3DarkBody: '#ffffff',
}

export default class EasyViewPlugin extends Plugin {
    settings: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;
    fontState: number = 0; // 0: Default, 1: P1, 2: P2, 3: P3
    colorState: number = 0; // 0: Default, 1: P1, 2: P2, 3: P3

    async onload() {
        console.debug('Loading EasyView plugin');
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));
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
        this.clearFontOverrides();
        this.clearColorOverrides();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshStatusBar();
    }

    refreshStatusBar() {
        if (this.statusBarItem) this.statusBarItem.empty();
        else this.statusBarItem = this.addStatusBarItem();

        this.statusBarItem.addClass('plugin-easyview');
        this.statusBarItem.addClass('easy-view-container-unique');
        this.statusBarItem.style.setProperty('--easy-view-btn-size', `${this.settings.buttonSize}px`);

        if (this.settings.showDecrementBtn) {
            const minusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(minusBtn, 'minus');
            minusBtn.onclick = () => this.adjustFontSize(-1);
        }

        if (this.settings.showIncrementBtn) {
            const plusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(plusBtn, 'plus');
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

        if (this.settings.showFocusBtn) {
            const focusBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn' });
            setIcon(focusBtn, 'maximize');
            focusBtn.title = "Toggle Focus Mode";
            focusBtn.onclick = () => this.toggleFocusMode();
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
    }

    resetFontSize() {
        // @ts-ignore
        this.app.vault.setConfig('baseFontSize', this.settings.defaultFontSize);
        // @ts-ignore
        this.app.updateFontSize();
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
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        // @ts-ignore
        const currentTheme = this.app.vault.getConfig('theme');
        const isDark = currentTheme === 'obsidian';
        setIcon(this.themeBtn, isDark ? 'moon' : 'sun');
    }

    toggleLineWidth() {
        document.body.classList.toggle('easyview-force-width');
    }

    toggleFocusMode() {
        document.body.classList.toggle('easyview-focus-mode');
    }

    cycleFont() {
        this.fontState = (this.fontState + 1) % 4;
        if (this.fontState === 0) {
            this.clearFontOverrides();
        } else {
            const n = this.fontState as 1 | 2 | 3;
            // @ts-ignore
            const body = this.settings[`fontPreset${n}Body`];
            // @ts-ignore
            const ui = this.settings[`fontPreset${n}UI`];
            // @ts-ignore
            const mono = this.settings[`fontPreset${n}Mono`];
            this.applyFont(body, ui, mono);
        }
    }

    applyFont(body: string, ui: string, mono: string) {
        document.body.style.setProperty('--font-text-override', body);
        document.body.style.setProperty('--font-ui-override', ui);
        document.body.style.setProperty('--font-monospace-override', mono);
    }

    clearFontOverrides() {
        document.body.style.removeProperty('--font-text-override');
        document.body.style.removeProperty('--font-ui-override');
        document.body.style.removeProperty('--font-monospace-override');
    }

    cycleColor() {
        this.colorState = (this.colorState + 1) % 4;
        if (this.colorState === 0) {
            this.clearColorOverrides();
        } else {
            const n = this.colorState as 1 | 2 | 3;
            // @ts-ignore
            const lightUI = this.settings[`colorPreset${n}LightUI`];
            // @ts-ignore
            const lightBody = this.settings[`colorPreset${n}LightBody`];
            // @ts-ignore
            const darkUI = this.settings[`colorPreset${n}DarkUI`];
            // @ts-ignore
            const darkBody = this.settings[`colorPreset${n}DarkBody`];
            this.applyColor(lightUI, lightBody, darkUI, darkBody);
        }
    }

    applyColor(lightUI: string, lightBody: string, darkUI: string, darkBody: string) {
        document.body.style.setProperty('--ui-font-color-light', lightUI);
        document.body.style.setProperty('--body-font-color-light', lightBody);
        document.body.style.setProperty('--ui-font-color-dark', darkUI);
        document.body.style.setProperty('--body-font-color-dark', darkBody);

        // Helper: Try to force current text color to update immediately
        // (Just overriding one variable might not be enough if theme uses others directly)
        // But Brutalist uses vars inside vars, so updating the root vars usually cascades.
    }

    clearColorOverrides() {
        document.body.style.removeProperty('--ui-font-color-light');
        document.body.style.removeProperty('--body-font-color-light');
        document.body.style.removeProperty('--ui-font-color-dark');
        document.body.style.removeProperty('--body-font-color-dark');
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

        // --- Visibility ---
        containerEl.createEl('h3', { text: 'Button Visibility' });
        new Setting(containerEl).setName('Show Decrement (-)').addToggle(t => t.setValue(this.plugin.settings.showDecrementBtn).onChange(async v => { this.plugin.settings.showDecrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Reset (↺)').addToggle(t => t.setValue(this.plugin.settings.showResetBtn).onChange(async v => { this.plugin.settings.showResetBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Increment (+)').addToggle(t => t.setValue(this.plugin.settings.showIncrementBtn).onChange(async v => { this.plugin.settings.showIncrementBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Theme (☀/☾)').addToggle(t => t.setValue(this.plugin.settings.showThemeBtn).onChange(async v => { this.plugin.settings.showThemeBtn = v; await this.plugin.saveSettings(); }));

        // --- Advanced Features ---
        containerEl.createEl('h3', { text: 'Advanced Features' });
        new Setting(containerEl).setName('Show Line Width (↔)').addToggle(t => t.setValue(this.plugin.settings.showLineWidthBtn).onChange(async v => { this.plugin.settings.showLineWidthBtn = v; await this.plugin.saveSettings(); }));
        new Setting(containerEl).setName('Show Focus Mode (◎)').addToggle(t => t.setValue(this.plugin.settings.showFocusBtn).onChange(async v => { this.plugin.settings.showFocusBtn = v; await this.plugin.saveSettings(); }));
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
    }

    addFontPreset(container: HTMLElement, n: number) {
        container.createEl('h4', { text: `Preset ${n}` });

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
