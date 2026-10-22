# Van Living · 3D Workshop

A free static Three.js layout editor for a van or shuttle-bus conversion. No account, paid API, cloud database, or build process is required. Three.js is bundled locally under its MIT license.

## Open the website

https://personal-founder.github.io/van-living/

In repository Settings → Pages, choose **Deploy from a branch**, **main**, **/(root)**, then Save. The branch only appears after the first commit. Publication can take several minutes.

## Design workflow

1. Enter measured clear interior dimensions in inches. The initial 216 × 84 × 78 inch shell is only an example, not a measured vehicle.
2. Rotate, pan, zoom, or select 3D/top/side/rear views. Select components in the model or dropdown.
3. Add and edit rectangular furniture, door panels, partitions, water pipes, wires, and ducts. Box coordinates specify the lower rear-left corner. Utility routes use a sequence of X,Y,Z points and an outside diameter. X runs across the width, Y up, Z toward the front.
4. Set wall skin, insulation, and lining thicknesses; toggle visibility to inspect each side-wall layer. The roof and end walls are intentionally omitted for inspection.
5. Changes save in this browser's local storage. **Export design** downloads JSON for backup and sharing. Import replaces the current design after validation and confirmation. Save image exports the current view.

The editor renders on demand, caps pixel ratio, and uses simple geometry to limit resource use. A working WebGL browser is needed. This is a layout tool: it does not calculate structural strength, wiring sizes, plumbing performance, collisions, manufacturing drawings, or regulatory compliance. Doors are editable solid panels, with no automatic hinge or wall-cutout operations. Top/side/rear views are orthographic but screenshots are not calibrated construction drawings.

## Work with Codex

The source repository is the shared project. Codex can edit files here when GitHub write access is authorized and available. Website deployment takes time; this is not a permanent live CAD/chat connection. In-app edits remain in your browser and are **not** automatically committed to GitHub. Export JSON and share it with Codex so both use the same design. To make a shared default, update `exampleDesign()` in `model.js` and explicitly reset the browser's stored example, or import the shared JSON.

## Local development

Serve this folder over HTTP, for example `npx --yes http-server . -p 8086 -c-1`, then open http://127.0.0.1:8086. Opening index.html directly as a file is unsupported because ES modules require HTTP. Run model validation checks with `node --test model.test.mjs`.
