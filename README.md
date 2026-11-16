# NEXUS — Spatial Portfolio

**An immersive 3D experience for exploring software engineering, data, and human-centered technology.**

NEXUS reimagines a traditional developer portfolio as an explorable futuristic operations center. Instead of scrolling through sections, visitors control an animated character, navigate interconnected environments, and discover technical ideas through interactive holographic interfaces.

The project combines **real-time 3D development, frontend engineering, interaction design, and technical storytelling**. Each environment represents a different aspect of my work: building systems, understanding data, and delivering operational solutions.

**Current version:** `v0.8.3` · **Project stage:** Active development — Sprint 1 & 2 prototype

> **Live demo:** Public deployment is being prepared. You can run the current prototype locally using the instructions below.

## Explore NEXUS

The experience begins with an aerial introduction to the complex, then transitions into a continuous **third-person exploration mode**. Visitors can walk or run through the central hub, enter themed rooms, reposition the camera, and interact with information presented inside the 3D world.

| Environment | Professional focus | Current experience |
| --- | --- | --- |
| **The Builder — Systems & Architecture** | Software architecture, frontend/backend responsibilities, integrations | Detailed imported sci-fi command room (`Sala 1`) and an interactive, four-node architecture hologram |
| **The Analyst — Data & Analytics** | SQL, reporting, visualization, analytical reasoning | Distinct data-themed 3D environment and a holographic visualization concept |
| **The Operator — Projects & Operations** | Project delivery, workflow design, operational problem-solving | Mission-control-inspired environment with preliminary portfolio content |

**Scope note:** The Builder is the first interactive content station. The Analyst and The Operator are functional navigation destinations with visual content previews; deeper dashboards and complete case studies are planned for Sprint 3.

## Features implemented

- **Continuous third-person navigation:** an aerial opening followed by camera-relative movement throughout the complex.
- **Animated 3D character:** a skinned, Mixamo-compatible avatar using authored **Walking** and **Running** clips, with smooth animation blending.
- **Player-controlled camera:** mouse/touch orbit, adjustable zoom, and camera recentering behind the character.
- **Spatial environment:** a central hub, connected laboratories, differentiated lighting and materials, and the imported `Sala 1` room model.
- **World interaction:** walkable zones, doorway detection, basic collision boundaries, and clickable holographic architecture nodes.
- **World-space information:** Three.js geometry and Drei text create floating panels within the scene rather than treating 3D as a decorative background.
- **Usability considerations:** contextual control hints, basic touch controls, loading feedback, and reduced-motion preference handling.

The system is intentionally **frontend-only** at this stage. It does not require a database, authentication, or a production API.

## Technology stack

| Area | Technology |
| --- | --- |
| Application | React 19, JavaScript, Vite 7 |
| 3D rendering | Three.js, React Three Fiber |
| 3D helpers and assets | Drei, GLB/glTF |
| Avatar animation | Three.js `AnimationMixer`, `SkeletonUtils`, Mixamo-compatible clips |
| State and interaction | React hooks, per-frame refs, custom movement and collision logic |
| Version control | Git, GitHub |
| Hosting target | Vercel |

## Controls

| Input | Action |
| --- | --- |
| `W` / `A` / `S` / `D` or arrow keys | Move relative to the camera |
| `Shift` + movement | Run |
| Drag on the 3D scene | Orbit the camera around the avatar |
| Mouse wheel, `+` / `−` or on-screen zoom buttons | Zoom in and out |
| `R` | Recenter the camera behind the avatar |
| `E` (inside The Builder) | Cycle through architecture nodes |
| Click a Systems hologram node | Select a component to inspect |
| `H` | Show or hide the controls guide |

Room transitions are spatial: **walk through a doorway** to enter or leave a laboratory. The camera stays in third person.

## Run locally

**Requirements:** Node.js **20.19+** or **22.12+**, npm, and a browser with WebGL support.

```bash
git clone https://github.com/hassen2208/Nexus-Portfolio.git
cd Nexus-Portfolio

npm ci
npm run check
npm run dev
```

Open the development address printed by Vite (typically `http://localhost:5173`).

To create and inspect a production build:

```bash
npm run build
npm run preview
```

`npm run check` validates the content configuration, avatar/animation assets, movement logic, and room data. It **does not replace browser testing** of rendering quality, frame rate, or animation behavior.

## Project architecture

```text
src/
├── App.jsx                   Application state and HUD
├── components/
│   └── Scene.jsx             Canvas, player movement and camera
├── content/
│   ├── locomotion.js         Camera-relative movement calculations
│   ├── stations.js           Station metadata and spatial settings
│   └── world-logic.js        Room detection and collision boundaries
├── hooks/
│   └── useReducedMotion.js   Motion preference support
└── three/
    ├── Avatar.jsx           Rigged character and animation blending
    ├── Complex.jsx          Central hub and themed environments
    ├── Holograms.jsx        Spatial panels and interactive content
    └── SystemsRoomAsset.jsx Imported Sala 1 environment

public/models/               Character and environment GLB files
scripts/                     Content, rig, movement and room validation
docs/                        Architecture, Scrum tracking and QA notes
```

The player controller updates position independently from the character's facing angle, allowing responsive camera-relative movement while the avatar turns smoothly toward its travel direction. Collision and room detection currently use lightweight spatial checks rather than a full physics engine.

## Development roadmap

NEXUS is organized as an **eight-week academic project**, using four two-week Scrum sprints:

| Sprint | Focus | State |
| --- | --- | --- |
| **01 — Foundations & Architecture** | Requirements, wireframes, project setup, 3D prototype and asset pipeline | Implemented in source; formal acceptance evidence still being consolidated |
| **02 — Building the World** | Hub, themed environments, third-person navigation, camera, avatar and first interactive station | Implemented in source; iterative QA and refinement ongoing |
| **03 — Interactive Systems** | Data exploration, complete case studies, expanded station interactions and first usability evaluations | Planned |
| **04 — Testing & Release** | Accessibility, mobile usability, performance, usability testing with at least three participants, documentation and public deployment | Planned |

### Engineering documentation

- [Sprint 1 & 2 progress and acceptance review](docs/SPRINT_1_2.md)
- [Product backlog](docs/ISSUES.csv)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [QA test plan](docs/QA_TEST_PLAN.md)
- [Animation system and v0.8.3 fix](docs/ANIMATION_FIX_v0.8.3.md)

## Current limitations and next steps

- The avatar contains authored **Walking** and **Running** animations, but **Idle** is currently a derived static resting pose rather than a separately authored animation.
- Data & Analytics and Projects & Operations need their full interactive content.
- Room models and avatar textures still require performance profiling and optimization across devices.
- Formal usability results and an independently verified public Vercel deployment are not yet included in this repository.

These are tracked development tasks, not features presented as complete.

## About the project

NEXUS is both a technical portfolio and an exploration of how spatial interaction can communicate professional work. Its core design challenge is to make a 3D environment **useful for navigation and discovery**, rather than purely visual.

**Created by Hassen David Ortiz Alvarez**  
Software Engineering · Data & Analytics · Technology Operations  
[GitHub profile](https://github.com/hassen2208)

---

*3D character, animation, and environment files are project assets. Please verify the applicable rights and licenses before redistributing or reusing them; this repository does not currently declare an open-source license.*
