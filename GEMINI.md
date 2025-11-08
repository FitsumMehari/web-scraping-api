# 🛠️ Complete Code Generation System Instructions

The goal is to produce a refactored, professional-grade, full-stack application using NestJS for the backend and Angular for the frontend, supporting two distinct user roles: **Advertiser** and **Influencer**. All generated code must strictly adhere to the following principles.

---

### 1. 🏗️ Core Architectural & Modularity Principles

#### A. Feature-First Modularization
* **Backend (NestJS):** Organize code into highly cohesive **Feature Modules** (e.g., `AuthModule`, `UsersModule`, `CampaignsModule`). The `AppModule` should only import top-level modules.
* **Frontend (Angular):**
    * **CoreModule:** Contains app-wide singleton services (AuthService, Logging, Interceptors, Guards). Imported **only** once by the `AppModule`.
    * **SharedModule:** Contains reusable components, directives, and pipes. It **must not** contain services. Export reusable Angular Material modules here.
    * **Feature Modules:** All primary application views (`AdvertiserModule`, `InfluencerModule`, `CampaignsModule`, etc.) must be **Lazy-Loaded** through routing.

#### B. Angular Configuration
* **STRICTLY PROHIBIT** the use of `standalone: true` for any generated Angular components, directives, pipes, or modules. All components must be declared and exported within a traditional Angular `NgModule`.
* **Role Separation:** The routing and UI must be separated at the top level using dedicated layout components and routing modules for **Advertiser** and **Influencer** roles.

---

### 2. 💎 Code Quality, TypeScript, and Documentation

| Principle | Guideline |
| :--- | :--- |
| **No `any` Rule** | **STRICTLY PROHIBIT** the use of the `any` type. Use specific types, union types, or `unknown` with strict type narrowing. The code must pass a full TypeScript build in `strict` mode. |
| **JSDoc Mandate** | Every class, interface, type definition, and **public** method/function **MUST** be prefaced with a detailed JSDoc comment block, including `@param`, `@returns`, and a clear description. |
| **File Line Limit** | **DO NOT** generate any single TypeScript, HTML, or CSS file that exceeds **500 lines of code**. If limits are approached, refactor into smaller, focused files/components/services. |
| **Naming Conventions**| Use standard NestJS/Angular conventions: `kebab-case` for file names (e.g., `user.service.ts`), `PascalCase` for Classes (e.g., `CreateUserDto`), and `camelCase` for properties/methods. |

---

### 3. 🛡️ Security and Authentication (JWT/RBAC)

#### A. NestJS Backend (`AuthModule`)
1.  **JWT Strategy:** Implement JWT authentication using `@nestjs/passport` (LocalStrategy for sign-in, JwtStrategy for token validation).
2.  **Password Hashing:** **MUST** use `bcrypt` with an adequate salt factor (e.g., 10 or 12) for hashing and comparing passwords. **Never** store or transmit plaintext passwords.
3.  **Role-Based Access Control (RBAC):**
    * The `User` entity **MUST** have a `role` field (`advertiser` or `influencer`).
    * The JWT payload **MUST** include the user's `id` and `role`.
    * Implement a custom **`RoleGuard`** using `Reflector` to protect endpoints based on the required role (e.g., `@Roles(Role.Advertiser)`).

#### B. Angular Frontend
1.  **AuthService:** A core singleton service responsible for sign-in, sign-up, token storage (preferably in secure `HttpOnly` cookies, or failing that, `sessionStorage`), and managing the user's logged-in state and `role`.
2.  **`HttpInterceptor` (Token Injection):** Implement an Angular `HttpInterceptor` to automatically attach the JWT (as a `Bearer` token) to the `Authorization` header of all outgoing API requests.
3.  **Route Guards (Client-Side):** Implement `CanActivate` Guards (e.g., `AuthGuard`, `RoleGuard`) to protect client-side routes and redirect unauthenticated or unauthorized users to the login page.

---

### 4. 📐 Design and Algorithm Principles (SOLID & Logic)

| Principle | Guideline |
| :--- | :--- |
| **Single Responsibility Principle (SRP)** | **Services** handle business logic and data access. **Controllers** (NestJS) and **Components** (Angular) handle request/event routing and data presentation only. |
| **Dependency Inversion Principle (DIP)** | Depend upon abstractions. NestJS services must use TypeScript interfaces or abstract classes for interacting with repositories or external services (e.g., EmailerService, SmsService). |
| **Open/Closed Principle (OCP)** | Favor composition and extension over modification. Use abstract classes and interfaces for features that are likely to change (e.g., `PaymentService` implementations). |
| **Algorithm Efficiency** | Always choose the **most performant and appropriate algorithm** for the context. Prioritize $\mathcal{O}(n \log n)$ or $\mathcal{O}(n)$ complexity for data processing tasks over quadratic or higher complexity algorithms. |

---

### 5. 💻 Framework Specific Best Practices

#### A. NestJS (Backend)
* **Database Setup (MariaDB & Docker):** The project **MUST** include a `docker-compose.yml` file defining a **MariaDB** service. The backend application configuration (e.g., `ormconfig.ts` or environment variables) **MUST** be set up to connect to this Dockerized MariaDB instance, ensuring a consistent database environment for all developers.
* **DTO Usage:** Use **`class-validator`** and **`class-transformer`** decorators extensively for all incoming and outgoing DTOs.
    * **Input DTOs** (e.g., `CreateUserDto`) define request shape and validation.
    * **Response DTOs** (e.g., `UserResponseDto`) ensure sensitive data (like passwords) is never exposed.
* **Error Handling:** Use custom exceptions that extend NestJS built-in exceptions (`HttpException`, `NotFoundException`, etc.) to provide clear, actionable error messages and consistent status codes.
* **Database:** Use Repositories/Data Access Layers to abstract database operations away from the main business logic in Services.

#### B. Angular (Frontend)
* **RxJS:** Use RxJS for all asynchronous operations. Components should subscribe using the **`async` pipe** in the template wherever feasible. All manual subscriptions **MUST** be unsubscribed from (e.g., using `takeUntil`, `rxjs-hooks`, or `Subscription` objects) to prevent memory leaks.
* **Forms:** Use **Reactive Forms** exclusively for all data entry, leveraging robust validation.
* **State Management:** Use a reactive service pattern or a centralized library (if complexity dictates) to manage the global application state, including user authentication and role data.
* **UI Libraries:** Integrate and follow the professional design standards of a robust component library (e.g., Angular Material, PrimeNG, or Bootstrap, as per existing project choice) for professional, consistent UI design.