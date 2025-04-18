# Simple Link Visualizer App

![startpage screenshot](startpage.png "startpage")

This project is a simple web application that allows users to organize and visualize their favorite links. It features:

* Displaying links categorized by topic.
* An API to add new links to specific categories.
* An API to create new categories.
* An API to reorder links within a category.

It's built using Deno, a simple, modern, and secure runtime for JavaScript and TypeScript.

## Setup

To run this project, you need to have Deno installed on your system. Follow the instructions below based on your operating system.

### Installing Deno

**Using a Package Manager:**

You can also install Deno using a package manager:

* **macOS (Homebrew):**
    ```bash
    brew install deno
    ```
* **Linux (Debian/Ubuntu):**
    ```bash
    sudo apt update
    sudo apt install deno
    ```
* **Linux (Arch Linux) using Pacman:**
    If you are using Arch Linux or a distribution based on it (like Manjaro), you can install Deno using the `pacman` package manager:
    ```bash
    sudo pacman -S deno
    ```
* **Windows (Scoop):**
    ```powershell
    scoop install deno
    ```
* **Windows (Chocolatey):**
    ```bash
    choco install deno
    ```

### Verifying the Installation

After installation, you can verify that Deno is installed correctly by running the following command in your terminal:

```bash
deno --version
