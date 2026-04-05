# Table-Editor: Visual YAML Hierarchical Editor

A lightweight, web-based visual editor designed to map complex, nested YAML structures into recursive HTML tables. This tool allows users to edit logical hierarchies visually and sync them back to local files.

---

## 1. Architecture Overview

The application follows a **Model-View-Controller (MVC)** pattern implemented entirely in the browser (Vanilla JS).

### A. The Model (Data Layer)
* **Internal State**: A single JavaScript Object (JSON) represents the "Source of Truth."
* **Format Conversion**: Uses the `js-yaml` library to parse incoming `.yaml` files into JS Objects and dump JS Objects back into YAML strings for saving.
* **Schema**: Supports infinite nesting where each key is a "Parent" and its value is either a "Child" (Nested Object) or a "Leaf" (String/Null).

### B. The View (Recursive UI)
* **Recursive Renderer**: A core JavaScript function that traverses the JSON object. For every nested level, it generates a `<table>` inside a `<td>`.
* **ContentEditable**: All labels and leaf nodes are rendered with the `contenteditable="true"` attribute, allowing direct text manipulation without input fields.
* **RTL Support**: Native Right-to-Left (Hebrew) support via CSS and HTML attributes.

### C. The Controller (Logic & I/O)
* **File System Access API**: Modern browser API used to `showOpenFilePicker()` (Load) and `showSaveFilePicker()` (Save) directly to the local file system.
* **DOM Observers**: Event listeners (Input/Blur) capture changes in the `contenteditable` cells and update the Internal State object in real-time.

---

## 2. Technical Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript (ES6+) |
| **Parsing** | [js-yaml](https://github.com/nodeca/js-yaml) (via CDN) |
| **File I/O** | File System Access API |
| **Styling** | Custom CSS for nested table borders and hover states |

---

## 3. Core Functionality

### 1. Load / Import
1. User clicks **"Open YAML"**.
2. File picker retrieves the `.yaml` file.
3. `js-yaml.load()` converts string to JSON.
4. `render(jsonObject)` is called to build the DOM.

### 2. Visual Editing
* **Text Edit**: Click and type directly in any table cell.
* **Structural Edit** (Future Phase): 
    * `Tab`: Indent (create sub-level).
    * `Enter`: New Sibling (new row in current table).
    * `Delete`: Remove node and its children.

### 3. Save / Export
1. `js-yaml.dump(internalState)` converts the current JSON back to a YAML string.
2. The File System API writes the string back to the original file handle.

---

## 4. File Structure
```text
.
├── index.html          # Main UI and Recursive Logic
├── style.css           # Table styling and RTL definitions
├── main.js             # State management and File I/O
└── example.yaml        # Sample data