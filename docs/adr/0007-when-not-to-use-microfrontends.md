# 0007 · When _not_ to use microfrontends

**Status:** guidance

The longer version, with diagrams, is [Do you need microfrontends?](../why-microfrontends.md).

This repo exists to show the technique done carefully, not to recommend it by default. Microfrontends trade
**build-time simplicity for team autonomy**, and the price is real:

| Cost                                                | Where it shows up here                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Runtime integration failures replace compile errors | a whole class of bugs (remount, error leak, cached failure) that a monolith cannot have |
| Duplicate and mismatched dependencies               | singleton sharing config; one bundler config                                            |
| Cross-cutting UX needs a contract                   | `@blog/contract`, shared theme, shared design system                                    |
| More moving parts to deploy and observe             | five images, a gateway, cache rules                                                     |
| Harder local development and debugging              | five dev servers (shell and four remotes) plus the API                                  |

**Use them when** several teams must release independently on different cadences, the product has clear
vertical seams (checkout, account, catalogue), and you can afford a platform team for the shell, design
system and contract.

**Do not use them when** one team owns the product (use modules in one app), the seams are fuzzy, or the
motivation is "the codebase feels big" (that is a modularity problem; fix it with boundaries, not deployment).
