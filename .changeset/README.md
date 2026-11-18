# Changesets

A change to a design-system package (`@blog/tokens`, `@blog/ui`) ships with a changeset that says how big it is for the people who consume it:

```bash
pnpm changeset          # pick the package, patch / minor / major, and describe the change
pnpm version-packages   # on release: bump versions and write each package's CHANGELOG.md
```

`major` for a renamed or removed token or component prop, `minor` for an addition, `patch` for a fix. Deprecate before you remove: see `docs/design-system.md`.
