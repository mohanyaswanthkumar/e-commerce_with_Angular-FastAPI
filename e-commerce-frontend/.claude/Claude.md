# 🛒 E-Commerce Angular Frontend - Master End-to-End Architecture & Quality Baseline

This document serves as the absolute source of truth for the codebase standards, component hierarchies, API bindings, and cross-check verification protocols for the Angular frontend connected to the FastAPI backend. 

---

## 1. End-to-End Application Flow & Architecture

### A. Architectural Layers
* **Core Layer (`src/app/core/`):** Houses app-wide singletons, global HTTP interceptors (for auth tokens/error handling), and global guards. These components live for the entire lifecycle of the application.
* **Shared Layer (`src/app/shared/`):** Houses dumb/reusable UI components, layout elements, pipes, and directives that are agnostic of specific business logic.
* **Feature Layer (`src/app/features/`):** Domain-driven feature modules (e.g., authentication, shop, cart, checkout, orders). Each feature contains:
  * **`components/`:** Standalone UI blocks handling view logic and user interactions.
  * **`services/`:** Feature-specific logic and HTTP data fetchers connecting to FastAPI endpoints.
  * **`models/`:** Strong TypeScript interfaces matching FastAPI Pydantic schema DTOs.

### B. End-to-End API Call Lifecycle
1. **Trigger:** User interaction or component lifecycle (`ngOnInit`) invokes a method on a feature service (e.g., `ProductService`).
2. **Execution:** The service uses Angular's `HttpClient` via the modern `inject()` pattern to hit the FastAPI backend base URL (`/api/v1/...`).
3. **Data Contract:** Responses are mapped explicitly to strict TypeScript interfaces (`src/app/features/.../models/`) mirroring backend schemas. No `any` types are permitted.
4. **State & Rendering:** Data is consumed via RxJS observables or Angular Signals, passing down to standalone components for reactive rendering.

---

## 2. Coding & Implementation Standards

### Component Standards
* **Standalone First:** Every component must use `standalone: true`.
* **Explicit Dependency Declarations:** Child components, directives, and core Angular modules (`CommonModule`, `RouterOutlet`, `ReactiveFormsModule`) must be explicitly imported in the component's decorator.
* **Modern Dependency Injection:** Use the `inject()` function instead of legacy constructor injection:
  ```typescript
  private http = inject(HttpClient);
  private productService = inject(ProductService);