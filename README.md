
![Easy View Art](https://github.com/user-attachments/assets/d2f98788-73ed-44b0-8488-5fa75f4cf914)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

**Easy View** is a status bar utility for Obsidian designed to provide instant control over your reading and writing environment. It allows you to adjust font sizes, toggle themes, and manage layout distraction-free—all without opening a settings menu.

## Core Features

### 🎛 Quick Controls
Located conveniently in the status bar, these buttons provide immediate access to essential view settings:

-   **Decrement Font Size** (`-`): Instantly reduces the global interface and text font size.
-   **Reset Font Size** (`↺`): Returns the font size to your preferred default value (configurable in settings).
-   **Increment Font Size** (`+`): Instantly increases the global interface and text font size.
-   **Theme Toggle** (`☀`/`☾`): One-click switch between Light and Dark modes.

### 📐 Visual Design
The plugin integrates seamlessly with Obsidian’s interface:
-   **Native Look**: Uses crisp SVG icons that match the host operating system and theme.
-   **Theme Compatible**: Automatically adapts to your active theme’s background colors (specifically optimized for **Brutalist**).
-   **Distraction Free**: Static backgrounds ensure no visual jumping on hover; icons subtly indicate interaction state (Bold in Light Mode, Light Grey in Dark Mode).

---

## Power User Features (Advanced)
*Enable these additional tools in the **Easy View** settings tab.*

### ↔ Line Width Toggle
Switch instantly between standard readable line lengths and **100% Full Width**. This is ideal for viewing large tables, Kanban boards, or wide diagrams that require horizontal space.

### ◎ Focus Mode
Toggle a distraction-free environment by hiding:
-   Left Sidebar (File Explorer/Search)
-   Right Sidebar (Backlinks/Properties)
-   Ribbon Menu (Far left strip)

Leaving only your content in view.

### Aa Font Switcher (Brutalist Theme Exclusive)
**Designed specifically for the Brutalist theme.**
Cycle through **3 User-Configurable Font Presets** directly from the status bar.
-   **Configuration**: Define specific **Body**, **UI**, and **Monospace** fonts for each preset via strict Dropdown menus in Settings.
-   **Workflow**: Seamlessly switch between a serif setup for reading, a sans-serif setup for browsing, and a monospace setup for coding.

### 🎨 Color Switcher (Brutalist Theme Exclusive)
**Designed specifically for the Brutalist theme.**
Cycle through **3 User-Configurable Color Presets** directly from the status bar.
-   **Configuration**: Define specific **Body** and **UI** colors for both **Light** and **Dark** modes for each preset via strict Dropdown menus in Settings.
-   **Workflow**: Instantly change the text contrast and accent colors to suit your lighting or mood.

---

## Settings
Customize the plugin to fit your workflow:

-   **Button Size**: Adjust the pixel size of the status bar icons.
-   **Default Font Size**: Set the target size for the "Reset" button.
-   **Visibility Control**: Toggle any button on or off independently.
-   **Advanced Features**: Enable/Disable the Line Width, Focus, Font, and Color tools.
-   **Preset Configuration**: Detailed dropdown menus to configure your Font and Color presets.

---

### Manual Installation

1.  Download the latest release from the GitHub Releases page.
2.  Extract the `main.js`, `manifest.json`, and `styles.css` files.
3.  Create a folder named `easy-view` inside your vault's plugin folder: `.obsidian/plugins/`.
4.  Move the files into that folder.
5.  Reload Obsidian and enable "Easy View" in the Community Plugins settings.



