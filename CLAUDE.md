# Project Context

Hospital/healthcare software. Code failures can cost lives. Quality, reliability, and security are non-negotiable. Others will maintain this code.

## Tech Stack
- Frontend: Next.js (or plain HTML when simpler)
- Language: JavaScript
- Styling: Tailwind CSS
- Backend/Database: Supabase
- Hosting: Vercel

## Critical Standards

**Medical-grade quality**: No shortcuts. Every feature must handle edge cases, errors, and unexpected inputs gracefully.

**Security**: Patient data may be involved. Validate inputs. Sanitize outputs. Never expose sensitive data in logs, URLs, or error messages.

**Readable code**: Use descriptive names (`getUserAppointments` not `getData`). Add comments explaining *why*, not what. Keep functions small and focused.

## Workflow

### Before coding anything:
1. Present a plan explaining what you're building, why this approach, and what files will be created/modified
2. Wait for approval

### While coding:
- Explain everything in detail — teach like a Harvard professor
- Point out patterns, best practices, and *why* things are structured this way
- Goal: help me learn to code properly while we build together
- Flag messy or error-prone code and suggest improvements

### Ask before:
- Installing new packages
- Creating/modifying Supabase tables
- Deleting files
- Major refactors or architectural changes

## File Structure (Next.js)

Follow this structure strictly. Consistency makes code maintainable.

```
src/
├── app/                      # App Router (pages and routes)
│   ├── (auth)/              # Route groups for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Protected routes
│   ├── api/                 # API routes
│   ├── layout.js            # Root layout
│   └── page.js              # Home page
│
├── components/              # All React components
│   ├── ui/                  # Generic, reusable (Button, Input, Card, Modal)
│   ├── forms/               # Form components (LoginForm, PatientForm)
│   ├── layout/              # Layout pieces (Header, Sidebar, Footer)
│   └── [feature]/           # Feature-specific (appointments/, patients/)
│
├── lib/                     # Core utilities and configurations
│   ├── supabase/
│   │   ├── client.js        # Browser client
│   │   ├── server.js        # Server client
│   │   └── middleware.js    # Auth middleware
│   ├── utils.js             # Helper functions
│   └── constants.js         # App-wide constants
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.js
│   └── usePatients.js
│
└── styles/                  # Global styles (if needed beyond Tailwind)
    └── globals.css
```

**Naming conventions:**
- Components: PascalCase (`PatientCard.js`)
- Utilities/hooks: camelCase (`useAuth.js`, `formatDate.js`)
- Folders: kebab-case or lowercase (`patient-details/` or `patients/`)

**When to create a new file:**
- Each component gets its own file
- If a function is used in 2+ places, move it to `lib/utils.js`
- If a file exceeds 150 lines, split it

## Code Patterns

- One component per file, named same as component
- Handle loading, error, and empty states for every data fetch
- Keep components under 150 lines — split if larger
- Use early returns for error conditions
- Wrap Supabase calls in try/catch with meaningful error messages

## Error Messages (User-Facing)

Keep errors simple and educational. Users should understand what went wrong and what to do next.

```
❌ Bad:  "Error: PGRST301 JWT expired"
✅ Good: "Your session has expired. Please log in again to continue."

❌ Bad:  "Failed to fetch"
✅ Good: "Unable to load appointments. Check your connection and try again."
```

Never expose technical details, stack traces, or database info to users.

## Git Practices

Commit early and often — small, focused commits that do one thing.

```bash
# Good commit messages
git commit -m "Add patient search form component"
git commit -m "Fix appointment date validation"
git commit -m "Add loading state to dashboard"

# Bad commit messages
git commit -m "Updates"
git commit -m "Fixed stuff"
git commit -m "WIP"
```

Commit after each working feature or fix. If something breaks, small commits make it easy to find and revert.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build (run before deploy)
npm run lint     # Check for errors
```

## Remember

I'm learning while building. Explain decisions. Teach patterns. Help me understand *why* good structure matters — not just what to do, but why it works that way.
