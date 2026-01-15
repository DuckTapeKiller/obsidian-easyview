import { Plugin } from 'obsidian';

export default class EasyViewPlugin extends Plugin {
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;

    onload() {
        console.debug('Loading EasyView plugin');

        this.statusBarItem = this.addStatusBarItem();


        // --- Font Buttons ---
        const minusBtn = this.statusBarItem.createEl('button', { text: '-', cls: 'easy-view-btn' });
        minusBtn.onclick = () => this.adjustFontSize(-1);

        const plusBtn = this.statusBarItem.createEl('button', { text: '+', cls: 'easy-view-btn' });
        plusBtn.onclick = () => this.adjustFontSize(1);

        // --- Theme Button ---
        this.themeBtn = this.statusBarItem.createEl('button', { cls: 'easy-view-btn easy-view-theme-btn' });
        this.themeBtn.title = "Switch Theme";
        this.themeBtn.onclick = () => this.toggleTheme();

        // Initialize icon
        this.updateThemeIcon();

        // Listen for theme changes to update icon if changed elsewhere
        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeIcon();
        }));
    }

    onunload() {
        console.debug('Unloading EasyView plugin');
        if (this.statusBarItem) {
            this.statusBarItem.remove();
        }
    }

    adjustFontSize(change: number) {
        // @ts-ignore: Accessing internal vault config
        const currentSize = this.app.vault.getConfig('baseFontSize') || 16;
        let newSize = currentSize + change;
        if (newSize < 10) newSize = 10;
        if (newSize > 30) newSize = 30;

        // @ts-ignore: Accessing internal vault config
        this.app.vault.setConfig('baseFontSize', newSize);
        // @ts-ignore: Method exists in Obsidian API
        this.app.updateFontSize();
    }

    toggleTheme() {
        // @ts-ignore: Accessing internal vault config
        const currentTheme = this.app.vault.getConfig('theme');
        const newTheme = currentTheme === 'obsidian' ? 'moonstone' : 'obsidian';

        // @ts-ignore: Accessing internal vault config
        this.app.vault.setConfig('theme', newTheme);
        // @ts-ignore: Method exists in Obsidian API
        this.app.updateTheme();

        this.updateThemeIcon();
    }

    updateThemeIcon() {
        if (!this.themeBtn) return;
        // @ts-ignore: Accessing internal vault config
        const currentTheme = this.app.vault.getConfig('theme');
        // If current is dark (obsidian), show Sun (to switch to light)
        // If current is light (moonstone), show Moon (to switch to dark)
        // Or we can show the current state. Usually "toggle" buttons show the *target* state or the *current* state.
        // Let's show the *current* state symbol or a generic one? 
        // User asked for "Sun Moon" icon.
        // To be safe and minimal: 
        // Dark mode -> Display Sun (implying "make it bright") or Moon (implying "it is dark")?
        // Standard toggle UI often shows the *mode you are in*.
        // Let's display: Dark Mode = ☾, Light Mode = ☀

        const isDark = currentTheme === 'obsidian';
        this.themeBtn.setText(isDark ? '☾' : '☀');
    }
}
