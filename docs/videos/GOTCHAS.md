# What goes wrong

Failures collected while making the release, MCP launch, Terminal and Order
Router videos. Each one cost real time to diagnose; most look like something
else when you hit them.

## Transitions and timing

**Crossfades dip to black.** If your scene wrapper paints an opaque background
*outside* the element that carries the opacity, the incoming scene's background
covers the outgoing one completely and every crossfade becomes a fade to black
and back. The fading element must be transparent; each scene paints its own
background as its first child. `src/kit/Scene.tsx` does this.

**`interpolate` refuses some ranges.** A zero-width input range — which is what
you get writing `[at, at + fade]` with `fade={0}` for a hard cut — throws
*"inputRange must be strictly monotonically increasing"*. An `Infinity` bound,
natural when the last item in a sequence should never fade out, throws
*"must contain only finite numbers"*. Branch for the hard-cut case; use a
far-future finite bound for the never-ending one.

**Cuts that miss the beat read as mistakes** even to people not listening for
the music. Pick a tempo whose beat is a whole number of frames (at 30 fps: 120
BPM = 15, 112.5 = 16, 100 = 18, 128.571 = 14) and make every scene duration a
multiple of it. `timeline()` in `src/kit/beats.ts` refuses a table that cannot
sit on the grid.

**Derive scene starts, never write them.** Retime one beat by hand and
everything after it silently desynchronises from the soundtrack.

## Layout

**Flex axis confusion.** With `flexDirection: "row"`, `justifyContent` is the
*horizontal* axis and `alignItems` is vertical. Getting them the wrong way round
parks a row of chips in the middle of your screenshot instead of along the
bottom, and it looks like a positioning bug rather than a swapped property.

**Absolutely positioned children fight flow siblings.** An overlay that is a
child of the same flex container it is positioning against becomes a flex item
and pushes the real content sideways. Give it its own relatively positioned
wrapper.

**Long code lines clip silently.** A monospace line is roughly
`length × size × 0.6` pixels wide. `codeWidth()` in `src/kit/Code.tsx` computes
it and `CodeBlock` warns in the Studio console rather than letting you find out
from a finished render.

**Rows that swap places pass through each other.** Animating a re-rank by
interpolating each row's index makes the two rows cross at the midpoint and
overlap, which reads as a glitch. Arc them apart horizontally and give the one
moving down a lower z-index — `CompareRows` does this.

**Percentage-positioned tiles leave hairline seams.** Splitting an image into a
grid of tiles for an assembly animation leaves sub-pixel gaps once they settle.
Put a static copy of the image underneath and fade it in as the tiles land.

**Centre scenes vertically** unless something needs to be top-aligned. Content
pinned to the top with `paddingTop` leaves a dead third at the bottom of every
frame, which is only obvious once you watch it.

## Assets

**Screenshots contain the real OS pointer.** If the video draws its own cursor,
every capture shows two. `scripts/remove-cursor.py` erases it — and note *how*:
fill from a ring sampled around the arrow, never from a blur of the box
containing it, because that box contains a white arrow and blurring it smears a
bright blob back over the UI. Measure the arrow's footprint rather than assuming
a box: a fixed box large enough for the pointer erased digits out of a price.

**Logos keyed from a dark plate leave a visible rectangle.** Artwork supplied as
white-on-near-black is not transparent. Deriving alpha from luminance works only
if you threshold it — a plate at 4% luminance becomes 4% alpha, which renders as
a faint dark box around the logo. Level the ramp so anything below the plate
goes fully transparent.

**Upscale pixel art with nearest-neighbour**, and bake it at the size you need.
Blocky letterforms interpolated smoothly go soft at 4K.

**Limit font weights and subsets.** `loadFont()` with no options pulls roughly
sixty files per family on every render pass.

## Captures

**The screenshot tool's `scale` shrinks the saved file too**, not just the
returned image. There is no cheap way to grab a full-resolution frame while
keeping the returned copy small.

**Screenshots taken in one batch are simultaneous.** Frames captured back to
back are identical, so a "live data" flipbook made from them looks frozen. Put a
wait between each capture — about a second gives visible movement in an order
book.

**Normalise capture sizes** before using them. Window chrome changes between
sessions and mismatched sizes break any layout that assumes one aspect ratio.

**Crop out empty-state prompts.** "Connect your account to trade" in the corner
of an otherwise great shot undercuts the whole video.

**Prefer the highest-resolution source you are given.** Downscaled copies of
screenshots that already exist at full size cost you sharpness at 4K for
nothing.

## Rendering

**Author at 1080p and render at `--scale=2`** for a 4K master. Type and layout
are DOM and resolution-independent; the only thing that needs real pixels is the
footage, which is usually 2160p anyway.

**Render a handful of stills before a full render.** One frame per scene catches
clipped text, wrong numbers and broken layouts in a minute instead of after a
render.

**Parallel `remotion still` calls can race on the bundle cache** just after
files change. If several fail at once for no obvious reason, run one first to
warm the bundle.

## Soundtrack

**One groove under the whole video drifts away from the edit.** Arrange per
scene: a section table mirroring the scene table, each section with its own kick
pattern, percussion and level. `scripts/arrange.mjs`.

**A section filter drives perceived level as much as gain does.** Darkening a
beat by lowering its cutoff also digs an audible hole. Fix it with content — add
or remove a voice — because a limiter and normalisation absorb most gain
changes you make afterwards.

**A breakdown only works if nothing leads into it.** Run the riser and swell you
use on every other cut into a reveal and it arrives already loud, with nothing
to reveal it against. Suppress them there deliberately.

**Verify the arc, since you cannot hear the render.**
`node scripts/check-music.mjs <wav> <cuts> <names>` prints per-section level and
brightness. Under about 6 dB of range the arc is too flat to notice.

## Content

**Ground every number.** Live data from an API, a figure stated in a PR, or a
test fixture — never an invented one. If a claim cannot be sourced, say what the
feature does without a number.

**Check a thing has actually shipped before announcing it.** A class documented
on a website may not be in the published package; a PR describing a change may
be closed unmerged. `npm view <pkg> version` and a look at the default branch
take a minute and have caught this more than once.

**Point-in-time measurements are examples, not claims.** A figure captured from
a live API at one moment is real but not reproducible on demand — label it as an
example or leave it out.
