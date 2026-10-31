# Architecture

A blog assembled **in the browser** from independently built and deployed pieces. This page explains the
shape of the system; the _why_ behind each choice lives in [`docs/adr`](adr/README.md).

## 1. System at a glance

One public origin. Every box below is its own build, its own image, and can be redeployed on its own.

```mermaid
flowchart LR
  user([Browser])

  subgraph edge[" Edge: nginx gateway · one origin "]
    gw["gateway<br/>:8080"]
  end

  subgraph static[" Static apps · nginx-unprivileged "]
    shell["shell<br/>React 19 · router · guard"]
    land["landing remote<br/>React · shadcn/ui · Tailwind v4 · Vite<br/>/_remotes/landing/"]
    mkt["marketing remote<br/>React · /_remotes/marketing/"]
    auth["auth remote<br/>React · /_remotes/auth/"]
    dash["dashboard remote<br/>Vue 3 · /_remotes/dashboard/"]
  end

  api["api<br/>GraphQL · Node 22"]

  user --> gw
  gw -->|"/"| shell
  gw -->|"/_remotes/landing/*"| land
  gw -->|"/_remotes/marketing/*"| mkt
  gw -->|"/_remotes/auth/*"| auth
  gw -->|"/_remotes/dashboard/*"| dash
  gw -->|"/graphql"| api

  shell -. "loads at runtime<br/>(Module Federation)" .-> mkt
  shell -.-> land
  shell -.-> auth
  shell -.-> dash

  classDef host fill:#1565c0,stroke:#0d47a1,color:#fff
  classDef remote fill:#2e7d32,stroke:#1b5e20,color:#fff
  classDef be fill:#6a1b9a,stroke:#4a148c,color:#fff
  class shell host
  class land,mkt,auth,dash remote
  class api be
```

The URL space is deliberately split: **`/auth/signin` is a route the shell owns; `/_remotes/auth/…` is where the
auth remote's files live.** They never collide, which is why remotes can ship without touching the shell's routes.

## 2. Runtime composition

What happens on the first visit to `/pricing`:

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser
  participant G as Gateway
  participant S as Shell
  participant M as Marketing remote
  participant A as API

  B->>G: GET /pricing
  G->>S: proxy
  S-->>B: index.html + shell chunks (hashed, immutable)
  B->>B: bootstrap: create Services { session, apollo }
  B->>G: GET /_remotes/marketing/remoteEntry.js
  Note over G,M: the ONLY mutable file: Cache-Control: no-cache
  G->>M: proxy (prefix stripped)
  M-->>B: remoteEntry (maps names → hashed chunks)
  B->>M: GET hashed chunks (immutable, cached forever)
  B->>M: mount(el, { initialPath: "/pricing", services })
  M->>A: POST /graphql { plans }
  A-->>M: plans
  M-->>B: renders pricing, using the shell's React, MUI and Apollo (singletons)
```

## 3. The contract between host and remote

The whole integration surface is one function. React and Vue remotes implement the same type, so the shell
cannot tell them apart.

```mermaid
classDiagram
  direction LR
  class Mount {
    <<type>>
    (el: HTMLElement, options: MountOptions) MountHandle
  }
  class MountOptions {
    +string initialPath
    +Services services
    +onNavigate(path)
  }
  class MountHandle {
    +onHostNavigate(path)
    +unmount()
  }
  class Services {
    +SessionStore session
    +ApolloClient apollo
  }
  class SessionStore {
    +getUser() User|null
    +signIn(user)
    +signOut()
    +subscribe(listener)
  }

  Mount --> MountOptions : takes
  Mount --> MountHandle : returns
  MountOptions --> Services
  Services --> SessionStore

  class ReactRemote["createReactRemote(App)"] {
    root + MemoryRouter + navigation bridge
  }
  class VueRemote["dashboard/mount.ts"] {
    createApp(App, { services })
  }
  ReactRemote ..|> Mount : landing, marketing, auth
  VueRemote ..|> Mount : dashboard
```

**Capabilities flow down, events flow up.** The host _injects_ what a remote may use (session, one Apollo
client) and the remote reports navigation through a callback. Remotes never import each other and never reach
for a global store. See [ADR 0001](adr/0001-host-injects-services.md).

### Navigation stays in sync both ways

```mermaid
sequenceDiagram
  participant U as User
  participant H as Shell (BrowserRouter)
  participant R as Remote (MemoryRouter)

  U->>R: clicks a link inside the remote
  R->>R: its MemoryRouter navigates
  R->>H: onNavigate("/about")
  H->>H: history.push("/about")  (synced = "/about")
  Note over H,R: no echo: the host already knows the remote is there

  U->>H: browser Back
  H->>R: onHostNavigate("/")
  R->>R: navigate("/")
```

## 4. Failure isolation

A remote that is down must cost the user _one section_, not the site.

```mermaid
stateDiagram-v2
  [*] --> Loading: route matches a remote
  Loading --> Ready: loadRemote() resolves, mount() runs
  Loading --> Failed: network error / bad deploy / chunk error
  Ready --> Failed: remote throws while rendering
  Failed --> Loading: "Try again" (new attempt, runtime retries the entry)
  Ready --> [*]: route change, unmount()
  Failed --> [*]: route change (other remotes unaffected)

  note right of Failed
    ErrorState with role=alert.
    Header, footer and other
    remotes keep working.
  end note
```

Covered at three levels: a unit test per behaviour, an integration test with a failing registry, and a Playwright
test that really aborts the remote's network requests and then recovers without a reload.

## 5. GraphQL: modular by domain, typed per consumer

```mermaid
flowchart TB
  subgraph api["apps/api"]
    direction TB
    posts["modules/posts<br/>typeDefs + resolvers"]
    billing["modules/billing"]
    analytics["modules/analytics"]
    authm["modules/auth<br/>scrypt-hashed demo store"]
    schema["schema.ts<br/>makeExecutableSchema([…modules])"]
    posts --> schema
    billing --> schema
    analytics --> schema
    authm --> schema
  end

  subgraph codegen["pnpm codegen · client preset"]
    gen["one generated /gql folder<br/>per consuming app"]
  end
  schema -->|"schema (from TS)"| gen

  subgraph consumers["each remote owns its operations"]
    m["marketing<br/>Posts, Plans"]
    a["auth<br/>SignIn, SignUp"]
    d["dashboard (Vue)<br/>Dashboard"]
  end
  gen -->|"typed documents"| m
  gen --> a
  gen --> d

  client(["ONE ApolloClient<br/>created by the shell"])
  client -->|"services.apollo"| m
  client --> a
  client --> d
  client -->|"POST /graphql"| schema
```

- **Add a domain** by adding a folder under `apps/api/src/modules` and one line in `schema.ts`.
- **A remote only sees types for the operations it declares**; renaming a field breaks exactly the remotes that use it, at codegen time.
- **One client, one normalized cache** per page, shared through `mount()`. The Vue remote uses the same client
  (`apollo.query`), so GraphQL is not React-specific here.

## 6. Design system

`@blog/ui` is presentation only: no data fetching, no business rules. Pages in each remote have a container
(fetches) and a `*View` (renders) so every state is a Storybook story and a visual baseline.

```mermaid
flowchart BT
  subgraph atoms
    Heading
    Copyright
    Progress
    ErrorState
  end
  subgraph molecules
    BlogPostItem
    PlanCard
  end
  subgraph organisms
    ContentGrid
    PricingGrid
  end
  subgraph templates
    Header
    Footer
    Layout
    AuthCard
  end
  subgraph remotes["remotes · pages"]
    LandingPageView
    PricingPageView
    CredentialsFormView
  end

  Copyright --> Footer
  Heading --> Layout
  Footer --> Layout
  BlogPostItem --> ContentGrid
  PlanCard --> PricingGrid
  ContentGrid --> LandingPageView
  Layout --> LandingPageView
  PricingGrid --> PricingPageView
  Layout --> PricingPageView
  ErrorState --> LandingPageView
  Progress --> LandingPageView
  AuthCard --> CredentialsFormView
```

Cross-cutting, provided once by `UiProvider`: MUI theme with **light and dark** (follows the OS), and a tiny
typed **i18n** catalog (`useT("nav.login")`). Every interactive element carries `data-test-id`.

## 7. Test strategy

```mermaid
flowchart TB
  v["👁️ Visual regression<br/>12 page baselines + 1 per Storybook story<br/>♿ axe on every story and key page<br/>Linux container, fixed clock"]
  e["🎭 E2E · Playwright · production build<br/>real nginx-shaped URLs, console must stay clean"]
  i["🔗 Integration · Jest<br/>real GraphQL schema via SchemaLink,<br/>shell + guard + fake remotes, API over HTTP"]
  u["🧪 Unit · Jest + Testing Library<br/>session store, components, forms, formatting"]

  v --> e --> i --> u

  style v fill:#6a1b9a,color:#fff
  style e fill:#1565c0,color:#fff
  style i fill:#2e7d32,color:#fff
  style u fill:#ef6c00,color:#fff
```

| Layer       | Runs against                                                          | What it proves                                                                |
| ----------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Unit        | one module, no network (a `fetch` that throws)                        | logic and rendering in isolation                                              |
| Integration | the **real API schema** in-process; the real shell with fake remotes  | client documents are valid against the server; the host/remote contract works |
| E2E         | the **built** apps behind a prod-shaped server (or the compose stack) | users can browse, sign in, and survive a dead remote                          |
| Visual      | pixels, in the same container image every time                        | nothing changed visually that wasn't meant to                                 |

### Bugs this pyramid caught while building it

Not hypothetical; each was found by a test, then fixed with a regression test.

| Found by              | Bug                                                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit                  | `useNavigate()` changes identity on every navigation, so the remote was **unmounted and remounted on every route change**                                                                     |
| Integration           | One remote's error boundary state **leaked into the next remote's route** (React reuses the element at the same tree position)                                                                |
| Integration           | Logging out raced the router's transition and landed on the sign-in form instead of home                                                                                                      |
| E2E                   | After a remote failed, **"Try again" could never recover**: webpack caches a failed remote forever. Fixed via the Module Federation runtime API ([ADR 0002](adr/0002-runtime-load-remote.md)) |
| E2E (console fixture) | The preview proxy returned 502 for GraphQL; only the "no console errors" rule noticed                                                                                                         |
| Visual review         | A global `.who` CSS rule collided with a scoped one in the Vue dashboard                                                                                                                      |
