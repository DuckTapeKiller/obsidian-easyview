![Easy View Art](https://github.com/user-attachments/assets/d2f98788-73ed-44b0-8488-5fa75f4cf914)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

**Easy View** is a powerful status bar utility for Obsidian that provides instant control over your reading and writing environment. Adjust font sizes, toggle themes, switch between focus modes, cycle through font and colour presets, and manage your layout—all from the status bar or via keyboard shortcuts.

---

## Table of Contents

- [Status Bar Controls](#status-bar-controls)
- [Focus Modes](#focus-modes)
- [Font & Color Presets](#font--color-presets)
- [Line Height & Reading Mode](#line-height--reading-mode)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Right-Click Context Menu](#right-click-context-menu)
- [State Persistence](#state-persistence)
- [Style Settings Integration](#style-settings-integration)
- [Settings Panel](#settings-panel)
- [Installation](#installation)

---

## Status Bar Controls

Easy View places convenient buttons in the Obsidian status bar for one-click access to essential view controls.

| Button | Icon | Function |
| :--- | :---: | :--- |
| **Decrease Font Size** | `−` | Reduces the global font size by 1px |
| **Increase Font Size** | `+` | Increases the global font size by 1px |
| **Reset Font Size** | `↺` | Returns font size to your configured default |
| **Toggle Theme** | `☀` / `☾` | Switches between Light and Dark mode |
| **Toggle Line Width** | `↔` | Switches between standard and full-width layout |
| **Cycle Line Height** | `≡` | Cycles through 5 line height presets |
| **Cycle Reading Mode** | `📖` | Cycles through Source, Live Preview, and Reading View |
| **Toggle Focus Mode** | `◎` | Hides sidebars and ribbon |
| **Toggle Zen Mode** | `👁` | Ultra focus—hides everything except content |
| **Cycle Font Preset** | `Aa` | Cycles through your custom font presets |
| **Cycle Color Preset** | `🎨` | Cycles through your custom colour presets |

All buttons can be individually enabled or disabled in the plugin settings.

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

> **Tip:** You can exit Zen Mode using the keyboard shortcut (configurable in Obsidian's Hotkeys settings) or by pressing `Esc` to open the command palette.

---

## Font & Color Presets

Easy View includes a powerful preset system designed specifically for the **Brutalist theme**. You can define up to **3 font presets** and **3 colour presets**, each with a custom name.

### Font Presets

Each font preset includes three font selections:

| Font Type | Usage |
| :--- | :--- |
| **Body Font** | Main reading and writing area (note content) |
| **UI Font** | Sidebars, tabs, menus, and interface elements |
| **Monospace Font** | Code blocks and inline code |

**Example Configurations:**

- **Preset 1 "Reading"**: Libre Baskerville (serif) for comfortable long-form reading
- **Preset 2 "Coding"**: Noto Sans Mono for technical documentation
- **Preset 3 "Writing"**: Sen (clean sans-serif) for modern, minimal writing

### Color Presets

Each colour preset includes four colour settings:

| Setting | Description |
| :--- | :--- |
| **Light Mode: UI Color** | Interface text color in light theme |
| **Light Mode: Body Color** | Note content text color in light theme |
| **Dark Mode: UI Color** | Interface text color in dark theme |
| **Dark Mode: Body Color** | Note content text color in dark theme |

**Example Configurations:**

- **Preset 1 "High Contrast"**: Maximum contrast for well-lit environments
- **Preset 2 "Soft"**: Reduced contrast for eye comfort
- **Preset 3 "Maximum"**: Pure black/white for displays with high dynamic range

### Cycling Behavior

When you click the Font or Color button:
- **First click**: Activates Preset 1
- **Second click**: Activates Preset 2
- **Third click**: Activates Preset 3
- **Fourth click**: Returns to Default (theme defaults)

A brief notification displays the active preset name.

---

## Line Height & Reading Mode

### Line Height Toggle

Cycle through five carefully chosen line height values:

| Value | Label | Best For |
| :--- | :--- | :--- |
| 1.4 | Compact | Dense technical content, tables |
| 1.5 | Normal | General purpose (default) |
| 1.6 | Relaxed | Long-form reading |
| 1.8 | Spacious | Comfortable editing |
| 2.0 | Double | Maximum readability, presentations |

### Reading Mode Toggle

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
| Toggle Line Width | Switch between standard and full width |
| Toggle Theme | Switch between light and dark mode |
| Cycle Font Preset | Advance to next font preset |
| Cycle Color Preset | Advance to next colour preset |
| Cycle Reading Mode | Advance to next editor mode |
| Cycle Line Height | Advance to next line height |
| Increase Font Size | Increase by 1px |
| Decrease Font Size | Decrease by 1px |
| Reset Font Size | Return to configured default |
| Select Font Preset 1/2/3 | Jump directly to a specific font preset |
| Select Color Preset 1/2/3 | Jump directly to a specific colour preset |

### Assigning Hotkeys

1. Open **Settings → Hotkeys**
2. Search for "EasyView"
3. Click the `+` button next to any command
4. Press your desired key combination

**Suggested Shortcuts:**
- `Cmd/Ctrl + Shift + F` → Toggle Focus Mode
- `Cmd/Ctrl + Shift + Z` → Toggle Zen Mode
- `Cmd/Ctrl + Shift + T` → Toggle Theme
- `Cmd/Ctrl + .` → Cycle Font Preset

---

## Right-Click Context Menu

Right-click anywhere on the Easy View status bar buttons to open a comprehensive context menu.

The menu provides:

- **Toggle Options** with checkmarks (✓) showing current state
  - Focus Mode
  - Zen Mode
  - Full Width

- **Font Presets** section
  - Default
  - All named presets with active selection marked

- **Color Presets** section
  - Default
  - All named presets with active selection marked

- **Line Height** section
  - All five options with current selection marked

- **Quick Actions**
  - Reading Mode toggle
  - Theme toggle

This menu allows you to jump directly to any preset without cycling.

---

## State Persistence

Easy View remembers your preferences across Obsidian restarts:

| Setting | Persisted |
| :--- | :---: |
| Focus Mode on/off | ✓ |
| Zen Mode on/off | ✓ |
| Line Width expanded/standard | ✓ |
| Active font preset (0-3) | ✓ |
| Active colour preset (0-3) | ✓ |
| Active line height index | ✓ |

When you restart Obsidian, your last active states are automatically restored.

---

## Style Settings Integration

Easy View integrates seamlessly with the **Style Settings** plugin for the **Brutalist theme**.

### How It Works

When you change fonts or colours using Easy View:

1. Changes apply **immediately** via CSS for instant visual feedback
2. Changes are **saved to Style Settings** for permanent persistence
3. Changes become **visible in Style Settings UI** for further adjustment

### Benefits

- **Persistence**: Your font and colour selections survive Obsidian restarts
- **Synchronization**: Style Settings always reflects your Easy View choices
- **Flexibility**: Fine-tune settings in Style Settings after using Easy View for quick selection

### Theme Detection

Easy View uses the theme's unique identifier (`brutalist-theme`) to communicate with Style Settings. The following CSS variables are synchronized:

**Font Variables:**
- `--font-text-override` (Body font)
- `--font-ui-override` (Interface font)
- `--font-monospace-override` (Code font)

**Colour Variables:**
- `--ui-font-color-light` / `--ui-font-color-dark`
- `--body-font-color-light` / `--body-font-color-dark`

**Layout Variables:**
- `--line-height-custom`

If Style Settings is not installed, Easy View still works—changes simply won't persist after restart.

---

## Settings Panel

Access the Easy View settings via **Settings → Easy View**.

### Basic Settings

| Setting | Description |
| :--- | :--- |
| **Button Size** | Size of status bar icons in pixels (10-24px) |
| **Default Font Size** | Target size for the Reset button (in pixels) |
| **Show Notifications** | Display brief feedback messages when actions are performed |

### Button Visibility

Toggle any status bar button on or off:

- Show Decrement (−)
- Show Increment (+)
- Show Reset (↺)
- Show Theme (☀/☾)
- Show Line Width (↔)
- Show Line Height (≡)
- Show Reading Mode (📖)
- Show Focus Mode (◎)
- Show Zen Mode (👁)
- Show Font Switcher (Aa)
- Show Color Switcher (🎨)

### Font Preset Configuration

For each of the 3 font presets:

| Field | Description |
| :--- | :--- |
| **Preset Name** | Custom name displayed in notifications and menus |
| **Body Font** | Dropdown with available typefaces for note content |
| **UI Font** | Dropdown with available typefaces for interface |
| **Monospace Font** | Dropdown with available typefaces for code |

Available fonts (Brutalist theme):
- iA Writer Quattro S (Sans)
- Montserrat (Sans)
- Sen (Sans)
- Libre Franklin (Sans)
- iA Writer Duo S (Sans)
- Libre Baskerville (Serif)
- Hepta Slab (Serif)
- Libre Caslon Text (Serif)
- Spectral (Serif)
- Noto Sans Mono (Mono)
- iA Writer Mono S (Mono)

### Color Preset Configuration

For each of the 3 colour presets:

| Field | Description |
| :--- | :--- |
| **Preset Name** | Custom name displayed in notifications and menus |
| **Light Mode: UI Color** | Interface text color in light theme |
| **Light Mode: Body Color** | Content text color in light theme |
| **Dark Mode: UI Color** | Interface text color in dark theme |
| **Dark Mode: Body Color** | Content text color in dark theme |

---

## Visual Design

Easy View is designed to integrate seamlessly with Obsidian:

- **Native Icons**: Uses Obsidian's Lucide icon set for consistent appearance
- **Theme Adaptation**: Button backgrounds match your theme's primary background
- **Subtle Interactions**:
  - Light Mode: Icons become bolder on hover
  - Dark Mode: Icons become lighter on hover
- **Clean Separators**: Thin borders between buttons for visual grouping
- **No Visual Jumping**: Static backgrounds prevent layout shifts on interaction

---

## Installation

### From Community Plugins (Recommended)

1. Open **Settings → Community Plugins**
2. Click **Browse** and search for "Easy View"
3. Click **Install**, then **Enable**

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
- **Recommended**: [Brutalist Theme](https://github.com/DuckTapeKiller/Brutalist) for Font/Colour preset features
- **Recommended**: [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) plugin for preset persistence

---

## Support

If you find Easy View useful, consider supporting development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

---

## Licence

MIT Licence - See [LICENSE.md](LICENSE.md) for details.
