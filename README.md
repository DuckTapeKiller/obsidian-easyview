![Easy View Art](https://github.com/user-attachments/assets/d2f98788-73ed-44b0-8488-5fa75f4cf914)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

**Easy View** is a minimalist status bar utility for Obsidian that provides instant control over your writing environment. Adjust font sizes, toggle themes, switch between focus modes, and manage your layout—all from the status bar, right-click context menu, ribbon menu (on mobile), or via keyboard shortcuts.

---

## Table of Contents

- [Status Bar Controls](#status-bar-controls)
- [Mobile Support](#mobile-support)
- [Focus Modes](#focus-modes)
- [Reading Mode Toggle](#reading-mode-toggle)
- [Delete with Attachments](#delete-with-attachments)
- [Recent Notes History](#recent-notes-history)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Right-Click Context Menu](#right-click-context-menu)
- [State Persistence](#state-persistence)
- [Settings Panel](#settings-panel)
- [Installation](#installation)

---

## Status Bar Controls

Easy View places convenient buttons in the Obsidian status bar for one-click access to essential view controls.

| Button | Icon | Function |
| :--- | :---: | :--- |
| **Decrease Font Size** | `−` | Reduces the global font size by 1px |
| **Increase Font Size** | `+` | Increases the global font size by 1px |
| **Reset Font Size** | `↺` | Returns font size to your configured default (Default: 18px) |
| **Toggle Theme** | `☀` / `☾` | Switches between Light and Dark mode |
| **Cycle Reading Mode** | `▤` | Cycles through Source, Live Preview, and Reading View |
| **Toggle Focus Mode** | `◎` | Hides sidebars and ribbon |
| **Toggle Zen Mode** | `◉` | Ultra focus—hides everything except content |
| **Recent Notes** | `↺` | Opens a modal listing your recently opened notes |

All buttons can be individually enabled or disabled in the plugin settings.

---

## Mobile Support

Since mobile devices lack a status bar, Easy View integrates directly into the **Mobile Navigation Bar**:

- **Primary Action Shortcut**: Adds an icon to the navbar menu. You can select **ONE** primary action for this shortcut (e.g., Theme Toggle, Font Resizing, or Focus Mode) in settings.
- **Dedicated History Icon**: If enabled, a persistent History icon is added to the main navigation bar (next to the forward/back buttons) for instant access to your recent notes.
- **Always Accessible**: These shortcuts are optimized for touch, featuring zero-delay interaction.

---

## Focus Modes

### Focus Mode

Hides peripheral UI elements while keeping navigation accessible:

- ✓ Hides left sidebar (File Explorer, Search)
- ✓ Hides right sidebar (Backlinks, Properties, Outline)
- ✓ Hides ribbon menu (left vertical strip)
- ✓ Keeps tab headers visible
- ✓ Keeps status bar visible

On macOS, the tab header automatically shifts to avoid the window control buttons.

### Zen Mode

Ultra focus mode that removes all interface chrome:

- ✓ Hides all sidebars
- ✓ Hides ribbon menu
- ✓ Hides tab headers
- ✓ Hides status bar
- ✓ Hides title bar

Only your content remains visible. Perfect for deep writing sessions.

---

## Reading Mode Toggle

Each click advances to the next mode in the cycle:

1. **Source Mode** → Raw markdown with full editing control
2. **Live Preview** → WYSIWYG editing with rendered formatting
3. **Reading View** → Clean rendered view for reading

---

## Delete with Attachments

Avoid "orphan" images in your vault. When you delete a markdown note using Easy View:

- **Automatic Detection**: Scans the note for all wikilinked and embedded images.
- **Confirmation Modal**: Prompts you to move the note to trash, with a checkbox (enabled by default) to also trash all linked images.
- **Independence**: Works even if you have "Confirm before deleting" enabled in Obsidian settings.

Access via:
1. **File Explorer**: Right-click any `.md` file → **Delete with attachments...**
2. **Command Palette**: "Delete current note with linked attachments"

---

## Recent Notes History

Keep your workflow fluid by jumping back to previous notes:

- **Automatic Tracking**: Remembers the last 10 (configurable up to 20) notes you've opened.
- **Mobile-Optimized**: Zero-animation closing and "toggle" support on mobile devices for a snappy, instantaneous feel.
- **Intelligent Layout**: Long note titles automatically wrap, ensuring readability even on narrow mobile screens.
- **Deleted File Support**: Visually distinguishes notes that have been moved to trash or deleted from the vault.
- **Quick Access**: Dedicated status bar button, persistent mobile navigation icon, and command palette shortcut.
- **Toggle Behavior**: Tapping the history icon while the modal is open will instantly close it.

---

## Keyboard Shortcuts

All Easy View features are accessible via Obsidian's **Command Palette** (`Cmd/Ctrl + P`). Search for "EasyView" to see all available commands:

| Command | Description |
| :--- | :--- |
| Toggle Focus Mode | Show/hide sidebars and ribbon |
| Toggle Zen Mode | Enter/exit ultra focus mode |
| Toggle Theme | Switch between light and dark mode |
| Cycle Reading Mode | Advance to next editor mode |
| Increase Font Size | Increase by 1px |
| Decrease Font Size | Decrease by 1px |
| Reset Font Size | Return to configured default |
| Delete current note with attachments | Prompt to trash note and linked images |
| Open recent notes | Open the history modal |

---

## Right-Click Context Menu

Right-click anywhere on the Easy View status bar to open a quick-access context menu. The menu is fully configurable — you choose which items appear via **Settings → Easy View → Context Menu**.

Available items:

- **Focus Mode** — toggles with a ✓ checkmark when active
- **Zen Mode** — toggles with a ✓ checkmark when active
- **Cycle Reading Mode**
- **Toggle Theme**
- **Recent Notes**
- **Increase Font Size**
- **Decrease Font Size**
- **Reset Font Size**

This means you can keep just one button in the status bar and access everything else via right-click.

---

## State Persistence

Easy View remembers your preferences across Obsidian restarts:

| Setting | Persisted |
| :--- | :---: |
| Focus Mode on/off | ✓ |
| Zen Mode on/off | ✓ |

---

## Settings Panel

Access the Easy View settings via **Settings → Easy View**.

### Basic Settings

| Setting | Description |
| :--- | :--- |
| **Button Size** | Size of status bar icons in pixels (10-24px) |
| **Default Font Size** | Target size for the Reset button (Default: 18px) |
| **Show Action Tooltips** | Display brief popup notifications when actions are performed |

### Mobile / Ribbon

- **Show Ribbon Icon (Mobile Only)**: Display a shortcut icon on the mobile navigation bar.
- **Ribbon Icon Action**: Select which feature the shortcut should trigger.

### Visibility

Toggle status bar buttons on or off individually:

- Show Decrement (−)
- Show Increment (+)
- Show Reset (↺)
- Show Theme (☀/☾)
- Show Focus (◎)
- Show View Switcher (▤)
- Show Zen (◉)
- Show History (↺)

### File Management

- **Delete with Attachments**: Enable/disable the "Delete with attachments..." context menu item and command.

### Recent History

- **Show History Button**: Toggle the status bar history icon.
- **History Size**: Set how many notes to remember (5-20).
- **Clear History**: Instantly wipe your navigation history.

### Context Menu

Choose which items appear when you right-click the status bar. Independent from the Visibility settings — you can hide a button from the status bar but still have it accessible via the context menu.

---

## Visual Design

- **Native Icons**: Uses Obsidian's Lucide icon set for consistent appearance
- **Theme Adaptation**: Button backgrounds match your theme's primary background
- **Subtle Interactions**: Icons become bolder on hover in light mode, lighter in dark mode
- **Clean Separators**: Thin borders between buttons for visual grouping

---

## Installation

1. Download the latest release from the [GitHub Releases](https://github.com/DuckTapeKiller/obsidian-easyview/releases) page
2. Extract `main.js`, `manifest.json`, and `styles.css`
3. Create a folder: `YOUR_VAULT/.obsidian/plugins/easy-view/`
4. Move the three files into that folder
5. Reload Obsidian
6. Enable "Easy View" in **Settings → Community Plugins**

**Requirements**: Obsidian v1.6.6 or higher

---

## Support

If you find Easy View useful, consider supporting development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

---

## Licence

MIT Licence - See [LICENSE.md](LICENSE.md) for details.
