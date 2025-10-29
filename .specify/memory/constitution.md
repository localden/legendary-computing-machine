<!--
Sync Impact Report - Constitution Update
=========================================
Version Change: 1.0.0 → 2.0.0
Bump Rationale: MAJOR version - removed Test-First principle (Principle V)

Modified Principles: 
  - Removed: V. Test-First for Game Logic

Added Sections: N/A

Removed Sections:
  - Core Principles: Principle V (Test-First for Game Logic)
  - Development Standards: Testing Philosophy section removed

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check may need adjustment
  ✅ .specify/templates/spec-template.md - Testing sections remain optional
  ✅ .specify/templates/tasks-template.md - Test tasks already marked optional
  ⚠ Future: Monitor if lack of testing discipline causes quality issues

Follow-up TODOs:
  - Monitor code quality without mandatory testing
  - Consider manual QA/playtesting standards if bugs increase
  - Evaluate if testing should be re-introduced based on project complexity

Date: 2025-10-29
-->

# Legendary Computing Machine Constitution

## Core Principles

### I. Minimal Dependencies

The project MUST minimize external dependencies to reduce complexity, security surface, and maintenance burden.

**Rules:**

- Every new dependency MUST be justified with a clear rationale explaining why vanilla JavaScript/HTML/CSS is insufficient
- Prefer native browser APIs over third-party libraries
- When a dependency is unavoidable, choose the smallest, most focused library that solves the specific problem
- Dependencies MUST be reviewed for maintenance status, security track record, and bundle size impact

**Rationale:** Single-page web apps benefit from fast load times and reduced attack surface. Native browser capabilities are now powerful enough for most 2D game mechanics. Minimal dependencies also ensure the project remains maintainable long-term.

### II. Single-Page Architecture

The application MUST be delivered as a single-page web application with client-side rendering.

**Rules:**

- All game logic, rendering, and state management MUST execute client-side
- No backend server dependencies for core gameplay (multiplayer features excluded by design)
- Game state MUST be self-contained within the browser session
- Asset loading MUST be optimized for initial page load

**Rationale:** Single-player games require no server coordination. Client-side architecture ensures instant responsiveness, offline playability after initial load, and zero hosting complexity beyond static file serving.

### III. Keyboard-First Controls

User input MUST be designed for keyboard interaction as the primary control mechanism.

**Rules:**

- All game interactions MUST be accessible via keyboard
- Key mappings MUST be intuitive and follow common gaming conventions (WASD, arrow keys, spacebar, etc.)
- Keyboard controls MUST provide responsive feedback with no perceived input lag
- Key bindings SHOULD be documented clearly for players

**Rationale:** 2D games traditionally excel with keyboard controls. Keyboard input provides precision, rapid response times, and universal accessibility across desktop platforms.

### IV. Simplicity & YAGNI

Development MUST prioritize simplicity and "You Aren't Gonna Need It" principles.

**Rules:**

- Implement only features explicitly required by current user stories
- Code MUST be readable, maintainable, and avoid premature optimization
- Architectural patterns (factories, repositories, etc.) MUST be justified by actual complexity needs
- When choosing between two approaches, select the simpler one unless performance or clarity demands otherwise

**Rationale:** Small game projects suffer from over-engineering. Simple code is easier to debug, modify, and understand. Complexity should emerge from proven need, not anticipated future requirements.

## Technical Constraints

### Technology Stack

- **Language:** Vanilla JavaScript (ES6+) or TypeScript for type safety
- **Markup:** HTML5 Canvas API or SVG for 2D rendering
- **Styling:** CSS3 for UI elements outside the game canvas
- **Storage:** LocalStorage or IndexedDB for save game state (if persistence needed)
- **Build Tools:** Minimal bundling (optional), no complex build pipelines unless justified

### Performance Standards

- **Frame Rate:** Maintain 60 FPS during active gameplay on target hardware
- **Load Time:** Initial page load MUST complete within 3 seconds on broadband connections
- **Memory:** Game MUST run within 100 MB heap allocation to support lower-end devices
- **Responsiveness:** Keyboard input MUST register within 16ms (1 frame at 60 FPS)

### Browser Compatibility

- MUST support modern evergreen browsers: Chrome, Firefox, Edge, Safari (latest 2 major versions)
- MAY degrade gracefully for older browsers with feature detection
- MUST NOT require browser plugins or extensions

## Development Standards

### Code Organization

- **Structure:** Use modular JavaScript with clear separation between game logic, rendering, and input handling
- **Naming:** Use descriptive, intention-revealing names for functions, variables, and modules
- **Documentation:** Public APIs and non-obvious game mechanics MUST have inline documentation
- **Versioning:** Use semantic versioning (MAJOR.MINOR.PATCH) for releases

### Quality Gates

- Code MUST pass linting checks (ESLint or equivalent)
- Feature branches MUST have corresponding specification and task documentation in `.specify/`
- Complex game mechanics MUST include inline comments explaining algorithms
- Manual playtesting SHOULD be performed before major releases

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise between this document and other guidance, this constitution takes precedence.

### Amendment Process

1. Proposed amendments MUST be documented with rationale and impact analysis
2. Version number MUST be incremented per semantic versioning rules:
   - **MAJOR:** Principle removal, redefinition, or backward-incompatible governance changes
   - **MINOR:** New principle addition or material expansion of existing sections
   - **PATCH:** Clarifications, wording improvements, typo fixes
3. Amendment MUST include Sync Impact Report detailing affected templates and files
4. All dependent templates in `.specify/templates/` MUST be reviewed for consistency

### Compliance & Review

- Feature specifications MUST verify alignment with constitutional principles
- Implementation plans MUST include "Constitution Check" section per `plan-template.md`
- Violations of core principles MUST be justified in "Complexity Tracking" section of plan
- Regular quarterly review of adherence and effectiveness

### Living Document Philosophy

This constitution is a living document. As game development patterns emerge and requirements evolve, amendments are expected. However, changes MUST be deliberate, documented, and propagated consistently throughout the project.

**Version**: 2.0.0 | **Ratified**: 2025-10-29 | **Last Amended**: 2025-10-29
