![Easy View Art](https://github.com/user-attachments/assets/d2f98788-73ed-44b0-8488-5fa75f4cf914)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

**Easy View** is a minimalist status bar utility for Obsidian that provides instant control over your writing environment. Adjust font sizes, toggle themes, switch between focus modes, and manage your layout—all from the status bar, ribbon menu (on mobile), or via keyboard shortcuts.

---

## Table of Contents

- [Status Bar Controls](#status-bar-controls)
- [Mobile Support](#mobile-support)
- [Focus Modes](#focus-modes)
- [Reading Mode Toggle](#reading-mode-toggle)
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
| **Cycle Reading Mode** | `📖` | Cycles through Source, Live Preview, and Reading View |
| **Toggle Focus Mode** | `◎` | Hides sidebars and ribbon |
| **Toggle Zen Mode** | `👁` | Ultra focus—hides everything except content |

All buttons can be individually enabled or disabled in the plugin settings.

---

## Mobile Support

Easy View is mobile-optimized to ensure your preferred actions are always accessible:

### Navigation Bar Shortcut
Since mobile devices lack a status bar, Easy View adds a shortcut icon directly to the **Mobile Navigation Bar menu** (accessible via the three-line "hamburger" icon at the bottom right).

- **Always Accessible**: The shortcut is enabled by default.
- **Configurable**: You can select **ONE** primary action for this shortcut (e.g., Theme Toggle, Font Resizing, or Focus Mode) in the plugin settings.

---

## Focus Modes

Easy View provides two focus modes for distraction-free writing:

### Focus Mode

Hides peripheral UI elements while keeping navigation accessible:

- ✓ Hides left sidebar (File Explorer, Search)
- ✓ Hides right sidebar (Backlinks, Properties, Outline)
- ✓ Hides ribbon menu (left vertical strip)
- ✓ Keeps tab headers visible
- ✓ Keeps status bar visible

On macOS, the tab header automatically shifts to avoid the window control buttons (close, minimize, maximize).

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

Quickly switch between Obsidian's three editing modes:

1. **Source Mode** → Raw markdown with full editing control
2. **Live Preview** → WYSIWYG editing with rendered formatting
3. **Reading View** → Clean rendered view for reading

Each click advances to the next mode in the cycle.

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

---

## Right-Click Context Menu

Right-click anywhere on the Easy View status bar buttons to open a quick-access context menu.

The menu provides:

- **Toggle Options** with checkmarks (✓) showing current state
  - Focus Mode
  - Zen Mode
- **Quick Actions**
  - Reading Mode cycle
  - Theme toggle

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
- **Ribbon Icon Action**: Select which feature the shortcut should trigger (Toggle Theme, Increase/Decrease Font, Focus, etc.).

### Visibility

Toggle any interface element on or off:

- Show Decrement (−)
- Show Increment (+)
- Show Reset (↺)
- Show Theme (☀/☾)
- Show Focus (◎)
- Show View Switcher (📖)
- Show Zen (👁)

---

## Visual Design

Easy View is designed to integrate seamlessly with Obsidian:

- **Native Icons**: Uses Obsidian's Lucide icon set for consistent appearance
- **Theme Adaptation**: Button backgrounds match your theme's primary background
- **Subtle Interactions**:
  - Light Mode: Icons become bolder on hover
  - Dark Mode: Icons become lighter on hover
- **Clean Separators**: Thin borders between buttons for visual grouping

---

## Installation

### Manual Installation

1. Download the latest release from the [GitHub Releases](https://github.com/DuckTapeKiller/obsidian-easyview/releases) page
2. Extract `main.js`, `manifest.json`, and `styles.css`
3. Create a folder: `YOUR_VAULT/.obsidian/plugins/easy-view/`
4. Move the three files into that folder
5. Reload Obsidian
6. Enable "Easy View" in **Settings → Community Plugins**

---

## Requirements

- Obsidian v1.0.0 or higher

---

## Support

If you find Easy View useful, consider supporting development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

---

## Licence

MIT Licence - See [LICENSE.md](LICENSE.md) for details.
