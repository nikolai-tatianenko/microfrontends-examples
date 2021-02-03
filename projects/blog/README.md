# Blog microfrontends

Runtime microfrontend composition with React and Vue.js.
## How to run
1. install dependencies and run the project
2. Instal lerna globally
```bash
npm install -g lerna
```

```bash
npx lerna bootstrap
npm install
npm run start
```

## Structure
- `packages` - contains all microfrontends
- `packages/auth` - contains the blog microfrontend
- `packages/components` - sharable components
- `packages/container` - contains the container for the blog
- `packages/dashboard` - contains vue.js dashboard
- `packages/landingPage` - Landing page for the blog

