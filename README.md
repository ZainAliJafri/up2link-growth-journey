# Up2link Growth Journey

Marketing site for up2linkd, built with TanStack Start (React 19, TypeScript, Tailwind CSS 4).

[x] The car is prominent, recognizable, and visibly struggles before accelerating.

[x] The up2linkd logo activates the scene rather than floating independently.

[x] UPWORK and LINKEDIN streams visibly converge into one trajectory.

[x] The car visibly moves forward during acceleration.

[x] All three packages have correct scopes and editable pricing.

[x] Every package states the 90-day minimum commitment.

[x] Pricing CTAs preselect the correct package in the inquiry form.

[x] The form does not claim to submit real leads without a configured backend.

[x] Mobile layout and reduced-motion fallback work.

[x] No fabricated testimonials, results, prices, or business details appear.

## Development

You need [Bun](https://bun.sh).

```sh
bun install
bun run dev
```

The dev server runs at http://localhost:8080.

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the dev server |
| `bun run test` | Run the tests (Vitest) |
| `bun run lint` | Lint with ESLint |
| `bun run build` | Production build into `.output/` |

## Deployment

`bun run build` produces a Cloudflare Workers bundle in `.output/` using Nitro's
`cloudflare-module` preset, and Nitro prints the deploy command when the build finishes.
To target another host, set `NITRO_PRESET` (for example `NITRO_PRESET=node-server`) or change
the preset in `vite.config.ts`.
