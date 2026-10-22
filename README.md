# Van Living · Empty Shuttle Shell

## Interior fresh water tanks

Four classAcustoms T5000-P 50-US-gallon tank bodies are now inside the reference bus, in two balanced left/right pairs ahead of the rear wheel area. Use **See inside · water tanks** for a focused cutaway. Click a tank or use the keyboard-accessible selector for its Amazon link, package price, storage capacity, dimensions and placement. The visibility toggle persists and is included in version 2 JSON exports; older exports gain the tank defaults while retaining existing shell and lighting settings.

Selected product: https://www.amazon.com/dp/B0GHSZCHY2 — **Tank & 12 Volt Pump / 50 Gallon**, observed October 22, 2026 at **$257.29 each**, **$1,029.16 for four packages**, before tax/shipping. This is a dated listing snapshot, not a live price feed. Each tank body is **38.25 L × 22.25 W × 14.25 H inches** in the modeled low orientation, with manufacturer tolerance of ±0.25 inch per dimension; fittings and the included pump are outside that body envelope. Class A Customs allows rotating tanks onto different sides. The nominal 50-gallon capacity is the product rating, not a calculation from its exterior rectangular volume.

The reference layout leaves a **45.5-inch center aisle** between support trays and an **8-inch gap** between each side's trays. Full base decks, cushions and side bracing illustrate support, not a fabricated or engineered installation. The four full tanks hold approximately **1,668 lb of water**, excluding tanks, mounts, pumps and the water in separate heaters. Floor load paths, anchoring, actual axle/tire capacities and usable clearances still require vehicle-specific verification. No plumbing, actual fitting positions or pump installation is drawn. Tanks must be vented and must not be pressurized, suspended from straps or loaded on top. Manufacturer guidance: https://www.classacustoms.com/Water-Tank-Helps_ep_41.html.

`water-tank-plan.js` owns product data and fixed-size placement; `interior-water-tanks.js` owns rendering and inspector details; `water-tanks.css` styles the controls. Dimension edits/imports that cannot preserve the 30-inch minimum aisle, entry clearance, ceiling clearance and room ahead of the rear wheels fail explicitly instead of scaling or overlapping the purchased tanks. Run `node --test model.test.mjs lighting.test.mjs water-tanks.test.mjs`.

## Exterior lighting plan

The user's exterior-lighting document was read on 2026-10-22, including its embedded product hyperlinks and placement guidance. The document itself is unchanged. Only requested product/placement data is included here; no private document URL, other Drive content, wiring, switch panels, fuses or electrical routing is published.

The original document layout has **22 fixtures**; the user's subsequent additions bring the current model to **34 fixtures**. The original 22 remain: four 52-inch curved bars (front/rear upper and side middles), two 50.5-inch straight bars (hood and lower rear), four round hood/rear pods, four 26-inch side-end bars, four 13.5-inch roof-corner bars, and four 4-inch corner downlights. `lighting-plan.js` owns product records, stable fixture IDs, positions, aim, source confidence and geometric coverage. `exterior-lighting.js` draws hardware, backplates, pivot struts, lenses, approximate beams and ground sample dots. Brackets terminate at shell/hood/bumper surfaces; they are schematic, not confirmation that fiberglass/skin can carry a load. Actual structural backing, weather sealing, hardware ratings and door/hood service clearance need vehicle-specific verification.

The **12 requested additions** reuse existing catalog products and their quoted prices/conflicts, rather than inventing newly verified SKUs:

- One 50.5-inch center bar on the lower cab roof, aimed 10 degrees down. It is the third front center bar, separate from the hood and higher passenger-body roof bars. Default mounting center is 112 inches above ground, supported on the estimated 108-inch cab roof.
- Two 26-inch rear bars, rolled 90 degrees upright, on fixed panels beside the rear door, aimed 25 degrees down. Each has approximately eight inches of clearance **from door edge to housing edge**, not center-to-center. Roll rotates the physical housing, mounting pivots and rectangular beam axes consistently.
- One 13.5-inch upright bar **outside beside the side entrance**, on the fixed rear jamb, aimed 45 degrees out/down. The user clarified that it must not be inside the entryway. Its center is four inches behind the opening edge, giving about 2.5 inches of housing-edge clearance in the reference geometry. It stays below the windows and off the moving leaves. Stable ID `entry-inner` is retained despite the clarified exterior placement.
- Two additional 26-inch horizontal bars **per long side**, at one-third and two-thirds of the fixed passenger-body length. Centers divide that length into three equal intervals; this is equal center spacing, not equal bare gaps between bar ends. They mount 11 inches above the passenger floor (55 inches above ground by default), below windows and above the wheel envelope, aimed 30 degrees outward/down.
- One circular pod above each door: side entry centered over its header; rear header offset toward the left/latch side opposite the modeled right-side hinges. Both aim 25 degrees down, with fixed-body backplates. These reuse the unresolved schematic 9-inch round product, not a dimensionally verified compact task light.
- Two circular front bumper pods, 12 degrees outward and 45 degrees down, supported from the bumper top. Default centers are 34 inches above ground, ahead of the bumper face, to improve near-field hood-shadow coverage without floating mounts. These are auxiliary parked/off-road task lights, not replacement road headlights or a road-use approval.

Placement interpretations are explicit: the rear “hood” light goes on a fixed bumper carrier below the rear-door sill; rear mid-height pods mount on the fixed rear panels six inches inboard of the body edges rather than the moving emergency-door leaf. The user's latest correction supersedes the document's corner placement: all four upper corner bars face diagonally outward at 45 degrees, with their housing midpoints inset eight inches from BOTH adjacent fixed-body roof edges. This keeps the full nominal 13.5-inch housings and their ends within the roof's plan-view outline, rather than centering them exactly on the vertex. A four-inch vertical center stand-off clears the roof; two inboard roof anchors support each angled fixture. Side end bars begin one foot from the fixed passenger-body ends. Roof corner positions use the fixed passenger body's corners, not the lower cab roof. Housing height/depth, exact bend, brackets and small-light envelopes remain schematic where not supported by a drawing. Other fixture types can extend beyond body width, and upper fixtures add height; body dimension annotations deliberately remain the original vehicle reference.

Click a fixture or use **Select exterior light** for brand, document-quoted price and pack basis, separately dated manufacturer price where verified, document watts versus linked-product conflicts, product/source links, mounting-center ground height and aim. The selected fixture is gold. Individual beam inclusion, global hardware visibility, beams, ground samples and 20/40/80-foot preview range persist in version 2 JSON and local browser saves. Old shell exports migrate without adding furniture. Hiding lights hides all added mounts, beams and sample dots. This is browser-local model state, not live Google Docs synchronization.

### Product reconciliation

All fixtures are Nilight. Sources checked on 2026-10-22:

- [52-inch 210 W curved bar](https://www.nilight.com/products/52-210w-21000lm-slim-anti-glare-drl-spot-flood-curved-led-light-bar): $179.99 manufacturer snapshot; 10-degree spot / 90-degree flood advertised. Document agrees on price/power; effective lumens are a manufacturer claim, not independently measured.
- [50.5-inch 210 W straight bar](https://www.nilight.com/products/50inch-210w-21260lm-slim-anti-glare-drl-spot-flood-led-light-bar-14awg-dt-wire): document $189.99; manufacturer snapshot $170.99. Published 10-degree spot / 90-degree flood. The inspector retains both prices with their bases.
- [Round pod ASIN B0BR96JWGW](https://www.amazon.com/dp/B0BR96JWGW): document $182.99 per L/R group, 80 W and 7,000 lm; current linked title is a 9-inch/120 W variant with additional conflicting table wattages. Package and exact variant are unresolved. The model uses a schematic 9-inch round envelope, keeps the document's power as a quote, and does not substitute another product's side-shooter coverage.
- [26-inch 297 W side bar, 18005C-A](https://www.nilight.com/products/26inch-297w-29700lm-triple-row-spot-flood-led-light-bar): document and manufacturer $59.99; document rounds to 300 W. The linked ASIN is B07232Z7WC, despite old URL wording saying 15 inches.
- [13.5-inch roof-corner bar, B0CLS2SZ8G](https://www.amazon.com/dp/B0CLS2SZ8G): document $42.99 and 80 W; linked listing says 72 W. Price pack basis and exact bracket envelope remain unconfirmed.
- [4-inch 18 W flood pods, B01KRV3PNA](https://www.amazon.com/dp/B01KRV3PNA): document $42.99 for four, not per fixture. The [manufacturer flood-pod reference](https://www.nilight.com/products/4inch-18w-1260lm-double-row-flood-led-pods-4pcs-16awg-wire-3pin-switch) lists 1,260 lm per pod; its harness bundle differs, so its price is not substituted.

Multiplying the document's original fixture wattages by the interpreted counts gives **3,172 nominal W**, not the document headline's 2,500 W. The 12 subsequent additions account for another **2,410 quoted nominal W**, giving **5,582 nominal W** across all 34. The inspector and coverage summary distinguish original placements from additions. This is NOT a verified current draw, circuit budget or electrical design. No shopping total is given because package bases and product variants are unresolved. Prices exclude tax, shipping and added custom mounting fabrication and are not guaranteed checkout prices.

### Coverage limits and findings

The 360-degree view samples flat ground on rectangular rings at 2, 5, 10, 20 and (for the 80-foot preview) 40-foot offsets around the bus. A point is green only when inside an enabled fixture's assumed rectangular angular beam and not blocked by conservative opaque body/cab/hood boxes; orange means no modeled beam. Cutaway does not disable those blockers. These are point counts, not illuminated-area percentages. The outer cutoff ring is omitted to avoid treating preview clipping as a physical lighting gap. Grid spacing is 5 feet in beam/coverage mode, 1 foot otherwise. Rays stop at the ground, coarse blockers or the selected preview distance. No IES files, intensity distribution, calibrated lux map, atmospheric effects or realistic material reflections are available; boundary surfaces do not capture every interior shadow.

Only the two slim-bar types have numerically published horizontal 10/90-degree spot/flood values. Their vertical spans and numerical spans for the other products are explicitly assumed in the product records. The simulator neither scales brightness from wattage/lumens nor invents manufacturer photometry. Published far-field lux/range claims are displayed as reference text only, not used to guarantee visibility. Beam colors distinguish spot/flood components, not actual fixture colors. All beam meshes are lightweight previews, not 34 dynamic shadow-casting lights.

With all 34 enabled and the default 40-foot preview, modeled hits at the 2-foot perimeter offset are Front **4/7**, Rear **1/7**, Left **5/21**, Right **6/21**; the original layout gave 1/7, 1/7, 5/21 and 5/21. At five feet they improve to **5/10, 10/10, 22/24 and 23/24**, respectively, versus 3/10, 7/10, 11/24 and 11/24. At ten feet both sides and rear have hits at every sampled point, but front remains 6/15. This does not mean continuous coverage or sufficient brightness. The immediate wall-adjacent side strips and rear-door/sill near-field are still weakest; front near-field is improved, not eliminated. The higher header pods aim only 25 degrees down and do not reach directly beneath their mounts. Ground under the bus, wheel wells, mirrors, solar/rack shadows, vegetation and door-open shadows are unverified. Confirm with nighttime measurements before claiming complete coverage.

Run `node --test model.test.mjs lighting.test.mjs` for shell and lighting checks.

## Ground datum and shell continuity

Tires now contact the visible ground plane at Y = 0. The previous grid was 0.8 inches below the contact datum. The cab floor surface is corrected to its labeled height (34 inches estimated), rather than placing the two-inch floor panel above that height. The passenger floor remains at the published 44 inches.

The stepwell now includes continuous risers, side cheeks and a bottom pan instead of disconnected tread plates. Separate editable published-reference fields define the first step surface (15.5 inches), intermediate rise (9.75), tread depth (9.75), and tread width (35.75). Default treads are at 15.5, 25.25 and 35 inches. The final riser is derived as **9 inches** to close exactly to the 44-inch floor; it is not represented as a manufacturer-confirmed dimension. These brochure values do not arithmetically yield uniform risers all the way to the floor. Door sill height remains a separate estimate.

Added schematic rails, crossmembers, axle shafts, suspension supports, wheel-arch fenders, front fascia, rear bumper and rear valance. These connect the wheels and bumpers visually to a rigid bus chassis, not a trailer. Cab/body shoulder and header panels, windshield pillars and a two-level aisle transition close unintended shell gaps while leaving intended door and glass openings. The geometry is illustrative, not structural design evidence. Front/rear bumper bottom heights are editable estimates of 21/24 inches; the brochure does not publish them or the cab floor/chassis clearances. Chassis-category arrows distinguish published ground-to-floor/first-step references from estimates. New blank shells start with opaque panels; saved cutaway preferences are preserved.

`shell-structure.js` is the shared source for stepwell, connection and chassis box geometry. Tests check tread/riser continuity, closure to the floor, axle centers, envelope bounds, height provenance, invalid input rejection and old-export migration. Ground is one-sided so the Bottom view can still inspect the underside.

## Cab and glazing correction

The [manufacturer gallery and feature list](https://forestriverbus.com/starcraft/allstar-xl-freightliner) and brochure show a fixed Starview transition window in front of the curbside bus entry. This is not a second truck-style passenger door. The model now cuts an actual aperture for this glass, the driver's door glass, and each passenger window, rather than placing blue rectangles over solid panels. The bus entrance has two framed glazed leaves without opaque backing. Cab close-up buttons expose both sides in either projection. Windows visibility hides glazing while retaining openings and frames.

Passenger windows use the published **36 × 36 inch nominal** size. Layout is generated to fit the estimated body/entry geometry; count, gaps, sill locations and slider split are illustrative, not verified gallery measurements. Driver glass 30 × 24 inches, transition glass 24 × 60 inches, and windshield 76 inches wide with a derived sloped height are explicitly estimated. Those are schematic frame envelopes, not glass cutting sizes. Window dimensions have their own filter category. Edited nominal sizes lose their published-reference status. Old version 2 files gain the window defaults while retaining edits.

**This is not a 1:1 fabrication blueprint.** Gallery photos establish arrangement and appearance, not unseen dimensions or manufacturing tolerances. A dimensioned body drawing or direct measurement is required before cutting panels, ordering glazing, or building fitted components. No model year or specific VIN is selected.

Gallery inspection also found Ford-based buses in the page's options carousel (including the image labeled Allstar XL Freightliner). The Freightliner header photograph and Freightliner brochure are the exterior arrangement references; Ford cab geometry is not copied into this model. Even the header photograph is not an orthographic scale drawing and does not verify window pitch or count for this provisional dimensional target.

Free static Three.js viewer: https://personal-founder.github.io/van-living/

The furnished demo is replaced by a passenger body, roof, floor, end/side panels, schematic original cab and wheels. Exterior lights and four interior fresh water tanks are included. Other conversion walls, furniture, wiring, plumbing and solar are not placed. The cab's original driver seat, dashboard and steering wheel are illustrative. A simplified walk-through connects the cab and passenger body. This is not a manufacturer CAD model or a construction drawing.

## Views and controls

Choose Top, Bottom, Front, Rear, Left or Right in either **2D / orthographic** or **3D / perspective**. **3D overview** restores an oblique view. Drag to orbit in 3D, scroll to zoom, right-drag to pan, or use Fit view. The scene renders only when changed; pixel ratio is capped at 1.5. Visibility controls independently hide panels, cab, wheels and dimension annotations. Cutaway makes body panels transparent while preserving the shell.

### White dimension boxes

White labels show feet/inches, the measurement name, and total inches, such as `8'6" Wide (102 in)`. Arrowheads follow each projected measurement axis; dashed witness lines connect the offset labels to the actual endpoints. **All Dimensions** repeats exterior, interior, and cab measurements at all four corresponding box edges/corners, and door widths/heights at both sides. **Simple Dimensions** keeps one representative span per measurement key, selected from the longest visible projection, so duplicate edges disappear without losing distinct measurements. Exterior, interior, cab, doors and chassis categories can be filtered independently. A dimension looking directly into the camera has no visible arrow span and is suppressed until another angle is selected. Dense All mode is best inspected using category filters and zoom. The SVG overlay follows orbit, pan and zoom without a continuous animation loop, and Save image composites the labels into the PNG.

### Factory doors and verification

The [manufacturer product page](https://forestriverbus.com/starcraft/allstar-xl-freightliner) lists a standard 36-inch electric passenger entry door and a standard nominal 30 × 48 inch rear egress window. It lists right- or left-hinged rear emergency doors as options. The [brochure](https://forestriverbus.com/brochures/Starcraft-Allstar-XL-Freightliner-Brochure.pdf) likewise lists a rear emergency door under Popular Options. Therefore a rear door is available, but is not guaranteed on an unspecified used bus. The model includes that optional door by default and labels the option explicitly; switching it off restores the rear egress window. The modeled window uses 48 inches horizontally and 30 vertically as a schematic orientation, not a verified orientation from a body drawing.

The [Freightliner S2 chassis operator manual](https://dtnacontent-dtna.prd.freightliner.com/content/dam/public/dtna-servicelit/dtna/pdfs/en_us/fccc/manuals/S2%20Chassis%20Operator%27s%20Manual_.pdf) documents the driver's door and door-mounted controls. The model adds a driver door outline, window and handle, with an actual aperture in the schematic cab side. The completed coach's exact cab construction and door dimensions still require photos or a manufacturer drawing for the specific vehicle. A second truck-style passenger cab door is not inferred; the model uses the shuttle's standard curbside entry.

Passenger entry has two glass leaves, a body/floor opening, and illustrative steps. Its 36-inch nominal door width is not its clear passage width: the brochure specifies 31 inches with one grab rail or 30 inches with two. The modeled entry height (96 inches), sill (15.5 inches), position, frame, steps and opening details remain schematic. Driver door 38 × 70 inches and optional rear door 32 × 72 inches are editable estimates, not manufacturer dimensions. Open doors swings the panels while annotation endpoints continue measuring closed frame openings. The rear illustration uses one hinge option, not a claim about every bus. Door panels can be hidden without removing the structural openings.

The recheck confirms the brochure table's 480-inch overall length, 102-inch wide option, 131-inch overall height, 98-inch wide-option interior, 79.75-inch interior height, 44-inch floor height and 291-inch wheelbase. The feature text rounds interior height to 80 inches; the model retains the table's 79.75 inches. Cab enclosure dimensions, 348-inch passenger clear length, axle offsets and tires remain estimates. Edited published values are marked unverified in the form and arrow labels rather than silently retaining manufacturer confidence. These references do not verify a particular VIN or older used bus.

All dimension inputs are inches. Left means driver side, front means hood. The model uses X across the vehicle, Y up from ground, and Z from front bumper to rear bumper. Published dimensions are reference values for the brochure configuration, not measurements of every old vehicle on that chassis. Estimated values are identified in the form and summary. Panel thicknesses are envelope offsets, not verified material assemblies. Overall height excludes any added roof equipment and width excludes mirrors.

## Reference dimensions

Target family: **Starcraft Allstar XL Freightliner, 40-foot, optional 102-inch body**. No model year is selected. [Manufacturer brochure](https://forestriverbus.com/brochures/Starcraft-Allstar-XL-Freightliner-Brochure.pdf).

| Dimension | Inches | Confidence |
| --- | ---: | --- |
| Overall length | 480 | Published |
| Exterior body width | 102 | Published wide option |
| Overall height | 131 | Published |
| Interior width | 98 | Published wide option |
| Interior height | 79.75 | Published |
| Floor above ground | 44 | Published |
| Wheelbase | 291 | Published for this brochure; other configurations vary |
| Passenger clear length | 348 | Estimated |
| Nose to passenger body | 128 | Estimated |
| Cab enclosure L × W × H | 72 × 86 × 74 | Estimated; excludes hood, height above cab floor |
| Cab floor above ground | 34 | Estimated |
| Front bumper to front axle | 46 | Estimated |
| Tire outside diameter | 39 | Estimated |
| Front tire / rear dual-pair center spacing | 80 / 80 | Estimated |

The shell uses 2-inch front and rear envelope panels, so clear length equals overall length minus nose-to-body distance minus 4 inches. Cab front is body-front minus cab length. Rear axle is front overhang plus wheelbase. Roof thickness is exterior height minus floor height minus clear height. These relationships are validated on import and edit. Cab trim clearances are not verified interior dimensions.

## Weight, budget and Utah licensing

The reference brochure lists 26,000 / 30,000 lb GVWR variants and a Cummins 6.7L 240 hp engine. Prefer investigating the higher GVWR for the proposed heavy conversion, but capacity is not approved. 200 US gallons of water at approximately 8.34 lb/gal weighs 1,668 lb. With 3,000 lb utilities and 500 lb solar, the stated subtotal is 5,168 lb, before walls, empty tanks, storage contents, occupants, food, tools and other liquids. If the utility allowance already includes any of those loads, avoid counting them twice. Actual usable payload is the certified GVWR less the actual ready-to-build weight; front/rear axle and tire limits and load placement also constrain the result. Roof solar weight, mounts and dynamic loads need a body-specific structural assessment.

[Utah Code 53-3-102(3), (7)(b)(iv)](https://le.utah.gov/xcode/Title53/Chapter3/C53-3-P1_1800010118000101.pdf) places qualifying personal recreational vehicles outside the CDL vehicle definition. A stripped passenger bus is not automatically an approved motorhome. [Utah DMV motorhome title/registration requirements](https://dmv.utah.gov/register/vehicles/motor-homes/) apply. Confirm classification, conversion documentation, insurance and the legal method of transporting an unconverted bus with DMV/DLD before purchase. No universal 26,000 lb RV cap is inferred from commercial CDL thresholds.

Market evidence checked during this task: [seller's $17,900 Freightliner M2 shuttle](https://revelationmachinery.com/product/freightliner-m2-106-shuttle-bus-2009-commercial-shuttle-bus/) and [seller's advertised $19,900 M2 shuttle](https://www.ebay.com/itm/317540898946). These are leads for the chassis family, not a selection of model year or confirmation of the modeled 40-foot wide-body configuration, payload, mechanical condition, availability, title or roof rating. Ask prices exclude tax, fees, transport and repairs. No exact configuration meeting all requirements under $20,000 has been verified. The model is a dimensional target, not a claim that the listed buses match it.

## Persistence and collaboration

This version uses `van-living-empty-shell-v2`, deletes the app's old furnished-demo key, and does not load version 1 projects. Export shell downloads the current empty-shell JSON. Import validates and replaces the current shell. Restore blank reference immediately resets shell edits, as labeled in the UI. Browser saving is local and is not GitHub sync. Codex can update the source and publish through authorized GitHub access or Chrome; publication is not instant live CAD control.

Existing version 2 shell files gain the new door and annotation defaults without losing previously edited vehicle dimensions. Door options, open/closed state, dimension mode and category filters persist with the shell. Assets use versioned module URLs to avoid mixing old furnished-demo scripts with the current page.

## Development

Serve this directory over HTTP, for example `python -m http.server 8090 --bind 127.0.0.1`. Open http://127.0.0.1:8090. Direct file opening is unsupported. Run `node --test model.test.mjs`. Three.js and OrbitControls are bundled under `LICENSE-three.txt`. GitHub Pages publishes `main` at repository root with `.nojekyll`.
