
![Easy View Art](https://github.com/user-attachments/assets/d2f98788-73ed-44b0-8488-5fa75f4cf914)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ducktapekiller)

Easy View is a simple Obsidian plugin that adds accessibility controls directly to the status bar. It allows you to quickly adjust the base font size and toggle between light and dark modes without opening settings.

## Features

* **Font Size Control**: Increase (`+`) or decrease (`-`) the application's base font size directly from the status bar.
    * Minimum size: 10px
    * Maximum size: 30px
* **Theme Toggle**: Switch between Dark mode and Light mode with a single click.
    * Displays a moon icon (☾) when in Dark mode.
    * Displays a sun icon (☀) when in Light mode.

## Installation

### Manual Installation

1.  Download the latest release from the GitHub Releases page.
2.  Extract the `main.js`, `manifest.json`, and `styles.css` files.
3.  Create a folder named `easy-view` inside your vault's plugin folder: `.obsidian/plugins/`.
4.  Move the files into that folder.
5.  Reload Obsidian and enable "Easy View" in the Community Plugins settings.

## Usage

Once enabled, look for the controls in the status bar (bottom right of the Obsidian window):

* Click **`+`** to increase text size.
* Click **`-`** to decrease text size.
* Click the **Sun/Moon** icon to toggle the theme.

## Development

If you wish to build the plugin from source:

1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run build` to compile the `main.js` file.
