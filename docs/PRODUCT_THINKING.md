# Direction Studio · Product Thinking

**Part B of the Fomi frontend assessment.** Redesigned workspace: **Image Editing**.

* **Live demo:** `VERCEL_LINK_HERE` (Part B is at `/studio`)
* **Repository:** `GITHUB_LINK_HERE`

---

## 1. What problem are you solving, and for whom?

**The user.** A professional who spends hours a day in Fomi: a freelance photographer, a brand designer or a small studio producing a lookbook, a campaign or a product catalogue for a client. They are signed in, they are coming back to a project they started yesterday, and they will make dozens of small decisions before anything ships.

**The problem.** Today's AI image tools are built around a single prompt and a single grid of results. That works for exploration. It breaks down for professional editing work, which looks like this:

* **Feedback is spatial, prompts are not.** A client says "the rose looks orange here" and points at the image. The professional then has to translate that into prompt text and hope the model changes only that part.
* **Iteration destroys history.** Each new generation pushes the old one down the feed. When the client says "actually, the version from this morning was better", it is hard to find, and it is unclear which change led where.
* **Consistency is manual.** A lookbook of five shots must feel like one afternoon. Users keep the same light, palette and subject description in their heads (or in a notes app) and paste them into every prompt.
* **"Done" is invisible.** Nothing tells the user which version of each shot is the approved one, or how close the project is to delivery.

**The job to be done:** *"Help me take a project from first drafts to an approved set of images, with my client's feedback addressed and nothing lost along the way."*

## 2. Three key UX decisions and why

**Decision 1: Feedback lives on the image (pinned notes).**
Press `N`, click the exact spot, type what should change. Notes are numbered pins, the same pattern people already know from Figma and PDF review tools. When the user asks for the next take, the pinned notes are included automatically and can be unticked one by one. *Why:* this removes the most error prone step in the workflow, translating visual feedback into words, and it keeps the client's exact words attached to the exact version they were about.

**Decision 2: Every change is a branch, never an overwrite (the take tree).**
"Direct the next take" always creates new takes that branch from the selected one. The take tree shows the lineage (Take 3 came from Take 1 with "calmer, soft window light"), and Compare (`C`) puts any take side by side with its parent using a before and after slider. *Why:* professionals explore more boldly when they know they can always go back. The tree turns "which one was it?" into a glance, and the direction text on each take doubles as a change log for the client.

**Decision 3: The project, not the prompt, is the unit of work (shots, Project DNA, approval).**
A project has shots (Field portrait, Red rose, Hero product...). Each shot ships exactly one approved take; approving a take (`A`) releases the previous pick. Project DNA holds the references, palette, subject, light and lens, and any trait can be locked so every new take inherits it. A progress bar and the Deliver panel show what is ready and what still needs a pick. *Why:* this mirrors how commissioned work is actually managed, and it moves the "keep it consistent" burden from the user's memory into the tool.

## 3. What features did you intentionally leave out?

* **Masking and brush tools.** Pinned notes cover the most common case ("fix this area") with far less effort. A brush is a precise tool but a slow one, and it is easy to add later on top of the same note coordinates.
* **Layers and full manual retouching.** That is Photoshop's job. Direction Studio is about directing a model, not replacing a pixel editor.
* **Real time collaboration and comments from other people.** The data model (notes with authors, approvals) is ready for it, but multiplayer is a large infrastructure investment and would distract from proving the core loop.
* **A prompt history panel and a big settings sidebar.** Settings that matter for consistency live in Project DNA. Everything else stays out of view so the image remains the hero.
* **Video editing.** The same model (shots, takes, notes) would apply, but time based notes need their own design.

## 4. Inspiration: what you liked and what you would improve

* **Figma comments.** *Liked:* pinning a thought to an exact spot is instantly understood. *Improve:* in Figma comments are separate from the work; here notes become the input for the next version.
* **Git branches and Lightroom virtual copies.** *Liked:* cheap, safe experimentation with a clear history. *Improve:* both feel technical. The take tree keeps the idea but speaks the language of a photo shoot: takes, directions, circled picks.
* **Film set language ("take 3", "circle that take", "the director's notes").** *Liked:* it gives a clear mental model for reviewing many versions of the same shot. *Improve:* we borrowed the vocabulary, not the complexity.
* **Frame.io review flow.** *Liked:* clear statuses and a single place to approve. *Improve:* review and creation happen in the same screen here, so there is no export and re-upload loop.

The layout and visual language intentionally follow Part A (the warm Fomi palette, the panel and chip styles), so the Studio feels like part of the same product rather than a separate tool.

## 5. With one more month, what would you improve?

1. **Real region editing.** Use each note's coordinates to build a soft mask, so the model changes only the pinned area (true inpainting).
2. **Client review links.** A read only page where the client can pin notes and approve takes, which flow straight back into the project.
3. **Usability testing with five working professionals**, focused on the moment of turning feedback into the next take, then tune the quick directions and strength presets from real usage.
4. **Project DNA learning from approvals.** Suggest locking a trait when the user keeps approving takes that share it.
5. **Engineering:** a real backend with optimistic updates and conflict handling, unit tests for the reducers and tree layout, Playwright tests for the core loop, and an accessible keyboard alternative for placing pins (arrow key positioning).

## 6. What makes your workspace different from existing AI platforms?

Most AI image platforms are **prompt first and grid shaped**: type, get four images, type again. Direction Studio is **project first and feedback shaped**:

* You do not rewrite prompts; you **direct takes**, in plain language and with pins on the image.
* You never lose a version; every iteration is a **branch in a visible tree** that you can compare against its parent.
* Consistency is **a locked property of the project**, not something you paste into every prompt.
* The workspace knows what "done" means: **one approved take per shot**, a progress bar, and a delivery panel.

It is the difference between a slot machine and a set: the tool is designed around how a professional actually reaches a final image with a client.

---

## Design trade-offs

**What was prioritised**

* The core loop end to end: select a take, pin notes, write a direction, create takes, compare, approve, deliver. Every step works with the mock API, has loading, error and empty states, and persists after a refresh.
* Clarity of the screen on a laptop, the most common working setup: the image stays the largest element, with the tree and direction panel within reach on the right.
* Keyboard speed for people who use the tool for hours: `N`, `C`, `A`, `V`, `Esc`, `Ctrl/⌘ + Enter`, and arrow keys in the take tree.

**What was simplified**

* The mock "model" returns believable images from a prepared pool for each shot instead of truly editing the image.
* Project DNA is one panel with a few traits rather than a full style system.
* On phones the Studio becomes four tabs (Stage, Takes, Direct, DNA). Phones are for reviewing and approving; heavy editing is expected on a larger screen.
* There is one demo project. A project list was left out because the brief assumes a user returning to an existing project.

**What was removed**

* A generation settings sidebar (model picker, guidance, seed) from the Studio. These are fixed by Project DNA so the screen stays calm; Part A keeps them for free exploration.
* Multiple approvals per shot. One pick per shot keeps delivery unambiguous.
* Decorative onboarding. Shortcut hints sit quietly under the canvas and in the Support menu instead.
