import { App, getLinkpath, MarkdownView, Menu, Modal, Notice, Platform, Plugin, PluginSettingTab, Setting, setIcon, TFile } from 'obsidian';
import type { SettingDefinition, SettingDefinitionGroup, SettingDefinitionItem } from 'obsidian';

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

// Undocumented app APIs the plugin relies on.
interface VaultConfig {
    getConfig(key: string): unknown;
    setConfig(key: string, value: unknown): void;
}

interface AppInternals {
    updateFontSize(): void;
    updateTheme(): void;
    // Obsidian 1.14 and later keep the font size per device, in localStorage.
    getBaseFontSize?: () => number;
    setBaseFontSize?: (size: number) => void;
}

interface WorkspaceInternals {
    leftRibbon?: { removeRibbonAction?: (id: string) => void };
}

interface AppPlugins {
    plugins?: { getPlugin?: (id: string) => unknown };
}

// The Homepage plugin (github.com/mirnovov/obsidian-homepage) keeps the homepage in use,
// desktop or mobile, on its plugin instance.
interface HomepagePlugin {
    homepage?: { data?: { kind?: string; value?: string } };
}

// The actions the ribbon icon can run, in the order the settings list them.
const RIBBON_ACTIONS = ['toggle-theme', 'increase-font', 'decrease-font', 'reset-font', 'toggle-focus', 'toggle-zen', 'cycle-mode'] as const;
type RibbonActionId = typeof RIBBON_ACTIONS[number];
type ActionId = RibbonActionId | 'recent-notes';

interface Action {
    name: string;
    icon: string;
    run: () => void;
}

type ReadingMode = 'preview' | 'source' | 'live';

const READING_MODES: Record<ReadingMode, { icon: string; label: string; next: ReadingMode }> = {
    preview: { icon: 'book-open', label: 'Reading view', next: 'source' },
    source: { icon: 'code', label: 'Source mode', next: 'live' },
    live: { icon: 'pencil', label: 'Live preview', next: 'preview' },
};

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'avif']);
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 30;
const NOTICE_DURATION = 1500;
// One ribbon item whatever its action, see refreshRibbonIcon().
const RIBBON_TITLE = 'EasyView';

function plural(count: number, noun: string) {
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export default class EasyViewPlugin extends Plugin {
    settings!: EasyViewSettings;
    statusBarItem: HTMLElement | null = null;
    themeBtn: HTMLElement | null = null;
    modeBtn: HTMLElement | null = null;
    ribbonIconEl: HTMLElement | null = null;
    ribbonActionId: RibbonActionId | null = null;
    mobileHistoryBtn: HTMLElement | null = null;
    recentNotesModal: RecentNotesModal | null = null;
    activeNotice: Notice | null = null;
    pendingFontSize: number | null = null;
    fontSizeSaveTimer: number | null = null;
    historySaveTimer: number | null = null;
    lastTrackedNotePath: string | null = null;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new EasyViewSettingTab(this.app, this));
        this.registerCommands();
        document.body.addClass('easyview-active');
        this.applyLayoutClasses();
        this.refreshRibbonIcon();

        this.app.workspace.onLayoutReady(() => {
            this.refreshStatusBar();
            this.updateMobileHistoryIcon();
            this.trackRecentNote();
        });

        this.registerEvent(this.app.workspace.on('layout-change', () => {
            this.updateModeIcon();
            this.updateMobileHistoryIcon();
        }));

        this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
            this.updateModeIcon();
            this.trackRecentNote();
        }));

        this.registerEvent(this.app.workspace.on('css-change', () => this.updateThemeIcons()));

        // A renamed note keeps its place in the history instead of showing as deleted.
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
            const index = this.settings.recentNotes.indexOf(oldPath);
            if (index === -1) return;
            this.settings.recentNotes[index] = file.path;
            if (this.lastTrackedNotePath === oldPath) this.lastTrackedNotePath = file.path;
            this.scheduleRecentNotesSave();
        }));

        this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
            if (!this.settings.deleteWithAttachments || !(file instanceof TFile) || file.extension !== 'md') return;
            menu.addItem(item => item
                .setTitle('Delete with attachments…')
                .setIcon('trash-2')
                .setSection('danger')
                .onClick(() => this.promptDelete(file)));
        }));
    }

    onunload() {
        this.flushFontSize();
        this.flushRecentNotesSave();
        this.removeMobileHistoryIcon();
        document.body.removeClasses(['easyview-active', 'easyview-focus-mode', 'easyview-zen-mode']);
    }

    async loadSettings() {
        const loaded: unknown = await this.loadData();
        this.settings = { ...DEFAULT_SETTINGS, ...(typeof loaded === 'object' && loaded !== null ? loaded as Partial<EasyViewSettings> : {}) };
        this.normalizeSettings();
    }

    async saveSettings() {
        this.normalizeSettings();
        await this.saveData(this.settings);
        this.refreshStatusBar();
        this.refreshRibbonIcon();
        this.updateMobileHistoryIcon();
    }

    normalizeSettings() {
        const clamp = (value: unknown, fallback: number, min: number, max: number) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : fallback;
        };
        const s = this.settings;
        s.buttonSize = clamp(s.buttonSize, DEFAULT_SETTINGS.buttonSize, 10, 24);
        s.defaultFontSize = clamp(s.defaultFontSize, DEFAULT_SETTINGS.defaultFontSize, MIN_FONT_SIZE, MAX_FONT_SIZE);
        s.historySize = clamp(s.historySize, DEFAULT_SETTINGS.historySize, 5, 20);
        if (!(RIBBON_ACTIONS as readonly string[]).includes(s.ribbonAction)) s.ribbonAction = DEFAULT_SETTINGS.ribbonAction;
        if (s.focusModeActive && s.zenModeActive) s.focusModeActive = false;

        const notes = Array.isArray(s.recentNotes) ? s.recentNotes : [];
        s.recentNotes = [...new Set(notes.filter((path): path is string => typeof path === 'string' && path.length > 0))]
            .slice(0, s.historySize);
    }

    get actions(): Record<ActionId, Action> {
        return {
            'toggle-theme': { name: 'Toggle theme', icon: 'sun-moon', run: () => this.toggleTheme() },
            'increase-font': { name: 'Increase font size', icon: 'plus', run: () => this.adjustFontSize(1) },
            'decrease-font': { name: 'Decrease font size', icon: 'minus', run: () => this.adjustFontSize(-1) },
            'reset-font': { name: 'Reset font size', icon: 'rotate-ccw', run: () => this.resetFontSize() },
            'toggle-focus': { name: 'Toggle focus mode', icon: 'maximize', run: () => this.toggleFocusMode() },
            'toggle-zen': { name: 'Toggle zen mode', icon: 'eye-off', run: () => this.toggleZenMode() },
            'cycle-mode': { name: 'Cycle reading mode', icon: 'book-open', run: () => void this.cycleReadingMode() },
            'recent-notes': { name: 'Open recent notes', icon: 'spool', run: () => this.openRecentNotes() },
        };
    }

    registerCommands() {
        const commands: [string, ActionId][] = [
            ['toggle-focus-mode', 'toggle-focus'],
            ['toggle-zen-mode', 'toggle-zen'],
            ['toggle-theme', 'toggle-theme'],
            ['cycle-reading-mode', 'cycle-mode'],
            ['increase-font-size', 'increase-font'],
            ['decrease-font-size', 'decrease-font'],
            ['reset-font-size', 'reset-font'],
            ['recent-notes-history', 'recent-notes'],
        ];
        const actions = this.actions;
        for (const [id, actionId] of commands) {
            const { name, icon, run } = actions[actionId];
            this.addCommand({ id, name, icon, callback: run });
        }

        this.addCommand({
            id: 'delete-current-note-with-attachments',
            name: 'Delete current note with linked attachments',
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                if (!this.settings.deleteWithAttachments || file?.extension !== 'md') return false;
                if (!checking) this.promptDelete(file);
                return true;
            }
        });
    }

    notify(message: string) {
        this.activeNotice?.hide();
        this.activeNotice = this.settings.showNotifications ? new Notice(message, NOTICE_DURATION) : null;
    }

    // ── Status bar ────────────────────────────────────────────

    refreshStatusBar() {
        if (!this.statusBarItem) {
            this.statusBarItem = this.addStatusBarItem();
            this.statusBarItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e);
            });
        }
        const bar = this.statusBarItem;
        const s = this.settings;
        const actions = this.actions;
        bar.empty();
        bar.style.setProperty('--easy-view-btn-size', `${s.buttonSize}px`);

        this.modeBtn = null;
        this.themeBtn = null;
        if (s.showHistoryBtn) this.createBtn(bar, actions['recent-notes']);
        if (s.showDecrementBtn) this.createBtn(bar, actions['decrease-font']);
        if (s.showIncrementBtn) this.createBtn(bar, actions['increase-font']);
        if (s.showResetBtn) this.createBtn(bar, actions['reset-font']);
        if (s.showReadingModeBtn) {
            this.modeBtn = this.createBtn(bar, actions['cycle-mode'], 'easyview-mode-btn');
            this.updateModeIcon();
        }
        if (s.showFocusBtn) this.createBtn(bar, actions['toggle-focus']).toggleClass('is-active', s.focusModeActive);
        if (s.showZenBtn) this.createBtn(bar, actions['toggle-zen']).toggleClass('is-active', s.zenModeActive);
        if (s.showThemeBtn) {
            this.themeBtn = this.createBtn(bar, actions['toggle-theme']);
            this.updateThemeIcons();
        }
    }

    createBtn(parent: HTMLElement, action: Action, cls?: string) {
        const btn = parent.createEl('button', {
            cls: cls ? ['easy-view-btn', cls] : 'easy-view-btn',
            attr: { 'aria-label': action.name, 'data-tooltip-position': 'top' },
        });
        setIcon(btn, action.icon);
        btn.addEventListener('click', action.run);
        return btn;
    }

    showContextMenu(e: MouseEvent) {
        const s = this.settings;
        const a = this.actions;
        const groups: { action: Action; show: boolean; title?: string; checked?: boolean }[][] = [
            [
                { action: a['toggle-focus'], show: s.contextMenuFocus, title: 'Focus mode', checked: s.focusModeActive },
                { action: a['toggle-zen'], show: s.contextMenuZen, title: 'Zen mode', checked: s.zenModeActive },
            ],
            [
                { action: a['cycle-mode'], show: s.contextMenuReadingMode },
                { action: a['toggle-theme'], show: s.contextMenuTheme },
                { action: a['increase-font'], show: s.contextMenuIncreaseFont },
                { action: a['decrease-font'], show: s.contextMenuDecreaseFont },
                { action: a['reset-font'], show: s.contextMenuResetFont },
            ],
            [
                { action: a['recent-notes'], show: s.contextMenuHistory, title: 'Recent notes…' },
            ],
        ];

        const menu = new Menu();
        let isEmpty = true;
        for (const group of groups) {
            const entries = group.filter(entry => entry.show);
            if (entries.length === 0) continue;
            if (!isEmpty) menu.addSeparator();
            isEmpty = false;
            for (const { action, title, checked } of entries) {
                menu.addItem(item => {
                    item.setTitle(title ?? action.name).setIcon(action.icon).onClick(action.run);
                    if (checked !== undefined) item.setChecked(checked);
                });
            }
        }
        if (!isEmpty) menu.showAtMouseEvent(e);
    }

    // ── Font size ─────────────────────────────────────────────

    // Obsidian 1.14 reads the per-device font size before the vault config, so writing
    // only the config was undone as soon as updateFontSize() ran. Older versions have
    // no per-device size and still read the config.
    getFontSize(): number {
        const app = this.app as unknown as AppInternals;
        if (app.getBaseFontSize) return app.getBaseFontSize();
        const configured = Number((this.app.vault as unknown as VaultConfig).getConfig('baseFontSize'));
        return configured || this.settings.defaultFontSize;
    }

    setFontSize(size: number) {
        const app = this.app as unknown as AppInternals;
        if (app.setBaseFontSize) {
            app.setBaseFontSize(size);
            return;
        }
        (this.app.vault as unknown as VaultConfig).setConfig('baseFontSize', size);
        app.updateFontSize();
    }

    // Clicks show at once and are saved together a moment later, so a run of clicks
    // makes one change instead of one per click.
    adjustFontSize(change: number) {
        const size = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, (this.pendingFontSize ?? this.getFontSize()) + change));
        this.pendingFontSize = size;
        document.body.style.setProperty('--font-text-size', `${size}px`);
        if (this.fontSizeSaveTimer !== null) window.clearTimeout(this.fontSizeSaveTimer);
        this.fontSizeSaveTimer = window.setTimeout(() => this.flushFontSize(), 200);
        this.notify(`Font size: ${size}px`);
    }

    resetFontSize() {
        this.pendingFontSize = this.settings.defaultFontSize;
        this.flushFontSize();
        this.notify(`Font size reset to ${this.settings.defaultFontSize}px`);
    }

    flushFontSize() {
        if (this.fontSizeSaveTimer !== null) window.clearTimeout(this.fontSizeSaveTimer);
        this.fontSizeSaveTimer = null;
        if (this.pendingFontSize !== null) this.setFontSize(this.pendingFontSize);
        this.pendingFontSize = null;
    }

    // ── Theme ─────────────────────────────────────────────────

    // The body class is what is on screen, also when Obsidian follows the system theme.
    isDark() {
        return document.body.hasClass('theme-dark');
    }

    toggleTheme() {
        const dark = !this.isDark();
        (this.app.vault as unknown as VaultConfig).setConfig('theme', dark ? 'obsidian' : 'moonstone');
        (this.app as unknown as AppInternals).updateTheme();
        this.updateThemeIcons();
        this.notify(dark ? 'Dark theme' : 'Light theme');
    }

    updateThemeIcons() {
        if (this.themeBtn) setIcon(this.themeBtn, this.isDark() ? 'moon' : 'sun');
    }

    // ── Reading mode ──────────────────────────────────────────

    readingModeOf(view: MarkdownView): ReadingMode {
        const state = view.getState();
        if (state.mode === 'preview') return 'preview';
        return state.source === true ? 'source' : 'live';
    }

    updateModeIcon() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!this.modeBtn || !view) return;
        const { icon, label } = READING_MODES[this.readingModeOf(view)];
        setIcon(this.modeBtn, icon);
        this.modeBtn.setAttribute('aria-label', label);
    }

    async cycleReadingMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const next = READING_MODES[this.readingModeOf(view)].next;
        await view.setState({
            ...view.getState(),
            mode: next === 'preview' ? 'preview' : 'source',
            source: next === 'source',
        }, { history: false });
        this.updateModeIcon();
        this.notify(READING_MODES[next].label);
    }

    // ── Focus and zen mode ────────────────────────────────────

    applyLayoutClasses() {
        document.body.toggleClass('easyview-focus-mode', this.settings.focusModeActive);
        document.body.toggleClass('easyview-zen-mode', this.settings.zenModeActive);
    }

    // The two modes exclude each other: turning one on turns the other off.
    setLayoutMode(mode: 'focus' | 'zen' | null) {
        this.settings.focusModeActive = mode === 'focus';
        this.settings.zenModeActive = mode === 'zen';
        this.applyLayoutClasses();
        void this.saveSettings();
    }

    toggleFocusMode() {
        const on = !this.settings.focusModeActive;
        this.setLayoutMode(on ? 'focus' : null);
        this.notify(`Focus mode ${on ? 'on' : 'off'}`);
    }

    toggleZenMode() {
        const on = !this.settings.zenModeActive;
        this.setLayoutMode(on ? 'zen' : null);
        this.notify(`Zen mode ${on ? 'on' : 'off'}`);
    }

    // ── Mobile ────────────────────────────────────────────────

    // Ribbon actions only appear on mobile, in the navigation bar's menu, which lists
    // every ribbon item registered since Obsidian started. So the icon is registered under
    // one title whatever its action: choosing another action updates that item's icon
    // instead of adding an item, and the item keeps its place, also as the navigation
    // bar's quick action. Turning it off unregisters it as Obsidian does on unload.
    refreshRibbonIcon() {
        const actionId = this.settings.showRibbonIcon && Platform.isMobile ? this.settings.ribbonAction as RibbonActionId : null;
        if (actionId === this.ribbonActionId) return;
        this.ribbonActionId = actionId;
        this.ribbonIconEl?.detach();
        this.ribbonIconEl = null;
        if (!actionId) {
            (this.app.workspace as unknown as WorkspaceInternals).leftRibbon?.removeRibbonAction?.(`${this.manifest.id}:${RIBBON_TITLE}`);
            return;
        }
        this.ribbonIconEl = this.addRibbonIcon(this.actions[actionId].icon, RIBBON_TITLE, () => this.actions[actionId].run());
    }

    updateMobileHistoryIcon() {
        const navbar = Platform.isMobile && this.settings.showMobileHistoryIcon
            ? document.querySelector<HTMLElement>('.mobile-navbar-actions')
            : null;
        const forwardBtn = navbar?.querySelector<HTMLElement>('.mobile-navbar-action-forward');
        if (!navbar || !forwardBtn) {
            this.removeMobileHistoryIcon();
            return;
        }

        document.body.addClass('easyview-has-history-icon');
        if (this.mobileHistoryBtn && navbar.contains(this.mobileHistoryBtn)) return;

        const btn = createDiv({
            cls: 'mobile-navbar-action easyview-mobile-history',
            attr: { role: 'button', tabindex: '0', 'aria-label': 'Recent notes' },
        });
        setIcon(btn.createSpan({ cls: 'clickable-icon' }), 'spool');
        btn.addEventListener('click', () => this.openRecentNotes());
        btn.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            this.openRecentNotes();
        });
        navbar.insertBefore(btn, forwardBtn);
        this.mobileHistoryBtn = btn;
    }

    removeMobileHistoryIcon() {
        document.body.removeClass('easyview-has-history-icon');
        this.mobileHistoryBtn?.remove();
        this.mobileHistoryBtn = null;
    }

    // ── Recent notes ──────────────────────────────────────────

    trackRecentNote() {
        const file = this.app.workspace.getActiveFile();
        if (!file || file.extension !== 'md' || file.path === this.lastTrackedNotePath) return;
        this.lastTrackedNotePath = file.path;

        const previous = this.settings.recentNotes;
        const history = [file.path, ...previous.filter(path => path !== file.path)].slice(0, this.settings.historySize);
        if (history.length === previous.length && history.every((path, i) => path === previous[i])) return;

        this.settings.recentNotes = history;
        this.scheduleRecentNotesSave();
    }

    // History changes on every note switch, so it is saved on its own, a moment later,
    // without rebuilding the status bar as saveSettings() does.
    scheduleRecentNotesSave() {
        if (this.historySaveTimer !== null) window.clearTimeout(this.historySaveTimer);
        this.historySaveTimer = window.setTimeout(() => this.flushRecentNotesSave(), 250);
    }

    flushRecentNotesSave() {
        if (this.historySaveTimer === null) return;
        window.clearTimeout(this.historySaveTimer);
        this.historySaveTimer = null;
        void this.saveData(this.settings);
    }

    // The note the Homepage plugin opens, when that plugin is enabled and its homepage is a
    // file. Its other kinds are left out: a workspace or the graph is not a note, a random
    // note changes every time, and a new or daily note can be created just by resolving it.
    getHomepageFile(): TFile | null {
        const homepage = (this.app as unknown as AppPlugins).plugins?.getPlugin?.('homepage') as HomepagePlugin | null | undefined;
        const data = homepage?.homepage?.data;
        if (data?.kind !== 'File' || !data.value) return null;
        return this.app.metadataCache.getFirstLinkpathDest(data.value, '/');
    }

    openRecentNotes() {
        if (this.recentNotesModal) {
            this.recentNotesModal.close();
            return;
        }
        this.recentNotesModal = new RecentNotesModal(this);
        this.recentNotesModal.open();
    }

    // ── Delete with attachments ───────────────────────────────

    // Images the note links or embeds. Images that another note also uses are kept apart,
    // so deleting this note never breaks that one.
    getLinkedImages(file: TFile): { own: TFile[]; shared: TFile[] } {
        const { metadataCache } = this.app;
        const cache = metadataCache.getFileCache(file);
        const images = new Map<string, TFile>();
        for (const ref of [...(cache?.embeds ?? []), ...(cache?.links ?? [])]) {
            const target = metadataCache.getFirstLinkpathDest(getLinkpath(ref.link), file.path);
            if (target && IMAGE_EXTENSIONS.has(target.extension.toLowerCase())) images.set(target.path, target);
        }

        const sharedPaths = new Set<string>();
        for (const [source, targets] of Object.entries(metadataCache.resolvedLinks)) {
            if (source === file.path) continue;
            for (const path of images.keys()) {
                if (path in targets) sharedPaths.add(path);
            }
        }

        const all = [...images.values()];
        return {
            own: all.filter(image => !sharedPaths.has(image.path)),
            shared: all.filter(image => sharedPaths.has(image.path)),
        };
    }

    promptDelete(file: TFile) {
        const { own, shared } = this.getLinkedImages(file);
        new DeleteWithAttachmentsModal(this.app, file, own, shared, async (deleteImages) => {
            let deletedCount = 0;
            if (deleteImages) {
                for (const image of own) {
                    try {
                        await this.app.fileManager.trashFile(image);
                        deletedCount++;
                    } catch {
                        new Notice(`Failed to delete ${image.name}`);
                    }
                }
            }

            try {
                await this.app.fileManager.trashFile(file);
                new Notice(deletedCount > 0 ? `Deleted ${file.basename} and ${plural(deletedCount, 'image')}.` : `Deleted ${file.basename}.`);
            } catch {
                new Notice(`Failed to delete ${file.name}`);
            }
        }).open();
    }
}

type SettingKey = Extract<keyof EasyViewSettings, string>;

type SettingSpec =
    | { kind: 'toggle'; key: SettingKey; name: string; desc?: string }
    | { kind: 'slider'; key: SettingKey; name: string; desc?: string; min: number; max: number; step: number }
    | { kind: 'number'; key: SettingKey; name: string; desc?: string; min: number; max: number }
    | { kind: 'dropdown'; key: SettingKey; name: string; desc?: string; options: Record<string, string> }
    | { kind: 'button'; name: string; desc?: string; text: string; onClick: () => Promise<void> };

interface SettingSection {
    heading?: string;
    desc?: string;
    items: SettingSpec[];
}

// The settings tab is described once. Obsidian 1.13 and later draw it from
// getSettingDefinitions(), which also puts every setting in settings search; older
// versions call display(), which draws the same sections.
class EasyViewSettingTab extends PluginSettingTab {
    plugin: EasyViewPlugin;
    constructor(app: App, plugin: EasyViewPlugin) { super(app, plugin); this.plugin = plugin; }

    sections(): SettingSection[] {
        const actions = this.plugin.actions;
        return [
            {
                items: [
                    { kind: 'slider', key: 'buttonSize', name: 'Button size (px)', min: 10, max: 24, step: 1 },
                    { kind: 'number', key: 'defaultFontSize', name: 'Default font size', min: MIN_FONT_SIZE, max: MAX_FONT_SIZE },
                ],
            },
            {
                heading: 'Mobile / ribbon',
                items: [
                    { kind: 'toggle', key: 'showRibbonIcon', name: 'Show ribbon icon (mobile only)', desc: 'Display a shortcut icon on the mobile navigation bar. This setting is ignored on desktop.' },
                    {
                        kind: 'dropdown', key: 'ribbonAction', name: 'Ribbon icon action', desc: 'Select which feature the ribbon icon should trigger.',
                        options: Object.fromEntries(RIBBON_ACTIONS.map(id => [id, actions[id].name])),
                    },
                    { kind: 'toggle', key: 'showMobileHistoryIcon', name: 'History icon in navbar', desc: 'Display a dedicated history icon in the mobile bottom navigation bar.' },
                ],
            },
            {
                heading: 'Visibility',
                items: [
                    { kind: 'toggle', key: 'showDecrementBtn', name: 'Show decrement' },
                    { kind: 'toggle', key: 'showIncrementBtn', name: 'Show increment' },
                    { kind: 'toggle', key: 'showResetBtn', name: 'Show reset' },
                    { kind: 'toggle', key: 'showThemeBtn', name: 'Show theme' },
                    { kind: 'toggle', key: 'showFocusBtn', name: 'Show focus' },
                    { kind: 'toggle', key: 'showReadingModeBtn', name: 'Show view switcher', desc: 'Reader / editing / source' },
                ],
            },
            {
                heading: 'Features',
                items: [
                    { kind: 'toggle', key: 'showZenBtn', name: 'Show zen' },
                    { kind: 'toggle', key: 'showNotifications', name: 'Show action tooltips', desc: 'Show a notification popup when an action (e.g., resizing font) is performed.' },
                ],
            },
            {
                heading: 'Context menu',
                desc: 'Choose which items appear when you right-click the status bar.',
                items: [
                    { kind: 'toggle', key: 'contextMenuFocus', name: 'Focus mode' },
                    { kind: 'toggle', key: 'contextMenuZen', name: 'Zen mode' },
                    { kind: 'toggle', key: 'contextMenuReadingMode', name: 'Cycle reading mode' },
                    { kind: 'toggle', key: 'contextMenuTheme', name: 'Toggle theme' },
                    { kind: 'toggle', key: 'contextMenuIncreaseFont', name: 'Increase font size' },
                    { kind: 'toggle', key: 'contextMenuDecreaseFont', name: 'Decrease font size' },
                    { kind: 'toggle', key: 'contextMenuResetFont', name: 'Reset font size' },
                    { kind: 'toggle', key: 'contextMenuHistory', name: 'Recent notes' },
                ],
            },
            {
                heading: 'File management',
                items: [
                    { kind: 'toggle', key: 'deleteWithAttachments', name: 'Delete with attachments', desc: "When deleting a note, prompt to also trash its linked images. Images that other notes also use are kept. Works independently of Obsidian's native confirmation setting." },
                ],
            },
            {
                heading: 'Recent history',
                items: [
                    { kind: 'toggle', key: 'showHistoryBtn', name: 'Show history button', desc: 'Display a recent notes button in the status bar.' },
                    { kind: 'slider', key: 'historySize', name: 'History size', desc: 'Maximum number of recent notes to remember (5–20).', min: 5, max: 20, step: 1 },
                    { kind: 'button', name: 'Clear history', text: 'Clear', onClick: () => this.clearHistory() },
                ],
            },
        ];
    }

    getSettingDefinitions(): SettingDefinitionItem<SettingKey>[] {
        return this.sections().map((section): SettingDefinitionGroup<SettingKey> => {
            const items: SettingDefinition<SettingKey>[] = [];
            // A row with no control is not drawn, so the section description is a render row.
            if (section.desc) items.push({ name: '', desc: section.desc, searchable: false, render: () => undefined });
            for (const spec of section.items) items.push(this.definitionFor(spec));
            return { type: 'group', heading: section.heading, items };
        });
    }

    definitionFor(spec: SettingSpec): SettingDefinition<SettingKey> {
        const { name, desc } = spec;
        switch (spec.kind) {
            case 'toggle':
                return { name, desc, control: { type: 'toggle', key: spec.key } };
            case 'slider':
                return { name, desc, control: { type: 'slider', key: spec.key, min: spec.min, max: spec.max, step: spec.step } };
            case 'number':
                return { name, desc, control: { type: 'number', key: spec.key, min: spec.min, max: spec.max, step: 1 } };
            case 'dropdown':
                return { name, desc, control: { type: 'dropdown', key: spec.key, options: spec.options } };
            case 'button':
                return { name, desc, render: setting => { setting.addButton(b => b.setButtonText(spec.text).onClick(spec.onClick)); } };
        }
    }

    async setControlValue(key: string, value: unknown): Promise<void> {
        await this.saveValue(key, value);
    }

    async saveValue(key: string, value: unknown) {
        (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
        await this.plugin.saveSettings();
    }

    async clearHistory() {
        this.plugin.settings.recentNotes = [];
        await this.plugin.saveSettings();
        new Notice('Recent notes history cleared.');
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        const settings = this.plugin.settings as unknown as Record<string, unknown>;
        for (const section of this.sections()) {
            if (section.heading) new Setting(containerEl).setName(section.heading).setHeading();
            if (section.desc) containerEl.createEl('p', { text: section.desc, cls: 'setting-item-description' });
            for (const spec of section.items) {
                const setting = new Setting(containerEl).setName(spec.name);
                if (spec.desc) setting.setDesc(spec.desc);
                switch (spec.kind) {
                    case 'toggle':
                        setting.addToggle(t => t.setValue(settings[spec.key] === true).onChange(v => this.saveValue(spec.key, v)));
                        break;
                    case 'slider':
                        setting.addSlider(s => s.setLimits(spec.min, spec.max, spec.step).setValue(Number(settings[spec.key])).onChange(v => this.saveValue(spec.key, v)));
                        break;
                    case 'number':
                        setting.addText(t => t.setValue(String(settings[spec.key])).onChange(async v => {
                            const n = parseInt(v);
                            if (!isNaN(n)) await this.saveValue(spec.key, n);
                        }));
                        break;
                    case 'dropdown':
                        setting.addDropdown(d => d.addOptions(spec.options).setValue(String(settings[spec.key])).onChange(v => this.saveValue(spec.key, v)));
                        break;
                    case 'button':
                        setting.addButton(b => b.setButtonText(spec.text).onClick(spec.onClick));
                        break;
                }
            }
        }
    }
}

class DeleteWithAttachmentsModal extends Modal {
    constructor(
        app: App,
        private file: TFile,
        private images: TFile[],
        private sharedImages: TFile[],
        private onConfirm: (deleteImages: boolean) => Promise<void>,
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        this.setTitle('Delete note');
        contentEl.createEl('p', { text: `Are you sure you want to move "${this.file.basename}" to trash?` });

        let deleteImages = this.images.length > 0;
        if (this.images.length > 0) {
            const row = contentEl.createDiv({ cls: 'dwa-checkbox-row' });
            const check = row.createEl('input', { type: 'checkbox', attr: { id: 'dwa-delete-images' } });
            check.checked = true;
            check.addEventListener('change', () => { deleteImages = check.checked; });
            row.createEl('label', { text: `Also delete ${plural(this.images.length, 'linked image')}:`, attr: { for: 'dwa-delete-images' } });
            this.listFiles(this.images);
        } else {
            contentEl.createEl('p', { text: 'No linked images to delete.', cls: 'dwa-no-images' });
        }

        if (this.sharedImages.length > 0) {
            contentEl.createEl('p', { text: `Kept because other notes use ${this.sharedImages.length === 1 ? 'it' : 'them'}:`, cls: 'dwa-no-images' });
            this.listFiles(this.sharedImages);
        }

        const buttons = contentEl.createDiv({ cls: 'dwa-button-row' });
        const cancelBtn = buttons.createEl('button', { text: 'Cancel' });
        const deleteBtn = buttons.createEl('button', { text: 'Delete', cls: 'mod-warning' });
        cancelBtn.addEventListener('click', () => this.close());
        deleteBtn.addEventListener('click', () => {
            cancelBtn.disabled = true;
            deleteBtn.disabled = true;
            void this.onConfirm(deleteImages).then(() => this.close());
        });
    }

    listFiles(files: TFile[]) {
        const list = this.contentEl.createEl('ul', { cls: 'dwa-image-list' });
        for (const file of files) list.createEl('li', { text: file.name });
    }
}

class RecentNotesModal extends Modal {
    constructor(private plugin: EasyViewPlugin) {
        super(plugin.app);
    }

    onOpen() {
        const { contentEl } = this;
        this.containerEl.addClass('easyview-recent-notes-container');
        this.modalEl.addClass('easyview-recent-notes-modal');
        this.setTitle('Recent notes');

        // The homepage, when there is one, is always first, whether or not it is open.
        const home = this.plugin.getHomepageFile();
        if (home) this.addNote(home, 'house').addClass('mod-home');

        const activePath = this.app.workspace.getActiveFile()?.path;
        const recent = this.plugin.settings.recentNotes.filter(path => path !== activePath && path !== home?.path);
        if (recent.length === 0) {
            contentEl.createEl('p', { text: 'No recent notes yet.' });
            return;
        }

        for (const path of recent) {
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                this.addNote(file);
            } else {
                const name = path.split('/').pop()?.replace(/\.md$/, '') || path;
                contentEl.createDiv({ cls: 'recent-note-item--deleted', text: `${name} (deleted)` });
            }
        }
    }

    addNote(file: TFile, icon?: string) {
        const item = this.contentEl.createEl('button', { cls: 'recent-note-item' });
        if (icon) setIcon(item.createSpan({ cls: 'recent-note-icon' }), icon);
        item.createSpan({ text: file.basename });
        item.addEventListener('click', () => this.openNote(file), { once: true });
        return item;
    }

    // Hidden at once instead of animating out, so the note opens without a delay.
    openNote(file: TFile) {
        this.containerEl.addClass('easyview-force-hide');
        this.close();
        void this.app.workspace.getLeaf(false).openFile(file);
    }

    onClose() {
        this.contentEl.empty();
        this.plugin.recentNotesModal = null;
    }
}
