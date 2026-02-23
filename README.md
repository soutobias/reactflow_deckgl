# ReactFlow + Deck.gl Map

This project implements a workflow-driven map visualization system using: **React Flow (@xyflow/react)**, **Deck.gl**, **MapLibre GL** and **Redux**.

The application allows users to:

- Build a visual workflow connecting **Source nodes** (GeoJSON URLs) to **Intersection Nodes** and **Layer nodes**
- Automatically derive renderable layers from the workflow
- Render those layers on a full-screen interactive map
- Switch between Diagram and Map views

This implementation follows the rendering and architectural requirements described in the **Front-end Engineer assignment**.

- Live demo: [https://soutobias.github.io/reactflow_deckgl/](https://soutobias.github.io/reactflow_deckgl/)

---

# Setup Instructions

## 1. Clone the Repository

```bash
git clone git@github.com:soutobias/reactflow_deckgl.git
cd reactflow_deckgl
```

## 2. Install dependencies

```bash
npm install
```

## 3. Run the development server

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

# How to Use the Application

## Add a Source and a Layer Node

### Step 1: Add a Source Node

Drag a `Source` node from the sidebar into the canvas.

Paste a publicly accessible GeoJSON URL into the input field.

### Step 2: Add a Layer Node

Drag a `Layer` node into the canvas.

### Step 3: Connect Them

Connect Source and Layer with an edge.

If the Source contains a valid URL and the Layer is connected to the Source, the Layer will automatically appear in the Map view. To see it, click the "Map" button in the top-right corner.

## Add two Sources, a Intersection and a Layer Node

### Step 1: Add two Source Nodes

Drag two `Source` nodes from the sidebar into the canvas. And paste a publicly accessible GeoJSON URL into each input field.

### Step 2: Add a Layer Node and an Intersection Node

Drag a `Layer` node and an `Intersection` node into the canvas.

### Step 3: Connect Them

Connect each `Source` node to the `Intersection` node, and connect the `Intersection` node to the `Layer` node.

The `Layer` will automatically appear in the Map view, showing the intersection of the two GeoJSON sources.

## Clear the Canvas

Click the "Clear" button in the bottom-left corner to remove all nodes and edges from the canvas. You can also clear the canvas by selecting each node and edge and pressing the "Delete" or "Backspace" key.

---

# Architecture Explanation

## System is divided into three independent layers:

### 1. Diagram Layer (React Flow)

Responsible only for:

- Managing nodes and edges
- Allowing user interaction
- Persisting diagram state

The diagram state (nodes + edges) is the "single source of truth" for the workflow.

### 2. Derivation Layer

The `deriveLayers()` function transforms the diagram into a normalized render model:

```ts
type RenderLayer = {
  id: string;
  sourceNodeId: string;
  url: string;
  order: number;
  y: number;
};
```

Steps performed:

- Find all Layer nodes
- Find connected Source node
- Extract URL
- Sort layers by `position.y`
- Assign explicit render order

### 3. Rendering Layer (Deck.gl + MapLibre)

The Map view:

- Initializes MapLibre
- Attaches a Deck.gl `MapboxOverlay`
- Creates one `GeoJsonLayer` per derived layer
- Updates overlay when Redux layer state changes

Rendering is **imperative**, not wrapped in React components, to allow maximum control and cleaner lifecycle management.

## CSS

The UI is minimal and unstyled, following the provided images. The focus is on functionality and architecture rather than visual design. It was used MUI components for basic styling of inputs and buttons, and a styled component for the canvas container.

## Separation of Concerns

The diagram does not directly control the map. Instead, the diagram state is transformed into a derived layer state in Redux, which the Map view subscribes to. This keeps:

- UI logic independent from rendering
- Rendering independent from diagram implementation
- Logic testable and extensible

## Imperative Deck.gl Integration

Instead of using a React wrapper for Deck, MapLibre and Deck are initialized imperatively. In this case, MapLibre is initialized directly and a Deck.gl `MapboxOverlay` is created and added to the map. This approach:

- Avoids unnecessary React re-renders
- Provides finer control
- Aligns with how Deck.gl is designed for large-scale use

## Derived State in Redux

Redux stores only "derived render layers", not raw diagram state. In this case, the Map view remains decoupled from the Diagram view, and only cares about the final renderable layers. This approach also avoids prop drilling and keeps the Map view focused on rendering logic, while the Diagram view focuses on user interaction and workflow management.

For local state management of the diagram and the map, I used React Flow's internal state management for nodes and edges, and local component state for the map instance. With this approach, I avoided unnecessary complexity of syncing diagram state with Redux, and kept the global state focused on the derived render layers that are relevant for the Map view.

## Deployment

The application is deployed on GitHub Pages, which provides a simple and free hosting solution for static sites. The deployment process is automated with a GitHub Action that runs on every push to the `main` branch, building the application and deploying it to the `gh-pages` branch.

---

# Example GeoJSON Files for Testing

For the normal workflow, you can use almost any publicly accessible GeoJSON URL available in this link: https://open-innovations.org/data/geojson.html (some files may be too large and cause performance issues, or they may not be in the correct projection)

For the intersection workflow, you can use any two GeoJSON files with overlapping geometries, like

- https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json: US states polygons

- https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json: World countries polygons

---

# Known Limitations

- The UI is minimal and not styled (it followed the images provided in the assignment).
- Accessibility features are not implemented (e.g. keyboard navigation, screen reader support).
- No validation UI for invalid GeoJSON files (only for invalid URLs).
- No error boundary around failed layer fetches.
- Rendering assumes valid GeoJSON structure.
- It only works if the data is in projection EPSG:4326 (WGS 84). No reprojection is performed. This can be done client-side with a library like `proj4`.
- Only one Source per Layer is supported.
- No advanced layer styling controls (color, opacity, extrusion).
- Intersection logic is simplified and may not cover all edge cases (e.g. non-polygon sources).
- Intersection using turf and geojson may not be performant for large datasets.
- Large datasets may cause performance issues without additional optimizations (e.g. tiling, clustering).
- No implementation of unit and e2e tests. For that, I would recommend using Jest for unit testing the `deriveLayers()` function, React Testing Library for component testing, and Cypress for end-to-end testing of the workflow and render consistency.
- SEO and server-side rendering are not considered in this implementation, as the focus is on a client-side interactive application.
- Data caching is implemented in a simple way using a Map to store fetched GeoJSON data.
