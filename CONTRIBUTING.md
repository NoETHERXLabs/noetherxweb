# Contributing

Thanks for helping build NoETHER-X Labs' open research site. Most contributions are **data
edits** — you rarely touch HTML, CSS, or JS.

## The Literature Survey (collaborators welcome)

The [Literature Survey](literature.html) is a community-maintained reading list of external
research the lab tracks. **Anyone can add a reference through a pull request.**

### Add a reference in 4 steps

1. **Fork** this repository and create a branch:
   `git checkout -b lit/add-<short-name>`
2. **Open** `assets/data/literature.json` and append one object to the array:

   ```json
   {
     "id": "lit-2023-example-key",
     "title": "Full paper or resource title",
     "authors": "Lastname, Lastname, Lastname",
     "venue": "Conference / Journal / Standard",
     "year": 2023,
     "topic": "Design For Testability",
     "url": "https://doi.org/....",
     "note": "One sentence on why it's relevant to the lab.",
     "contributor": "@your-github-handle"
   }
   ```

   Field rules:
   - `id` — unique, lowercase, `lit-<year>-<slug>`.
   - `topic` — reuse an existing topic string when possible so it groups in the filter
     (e.g. `Design For Testability`, `AI Hardware`, `Chiplet Systems`, `Hardware Security`,
     `EDA Automation`, `DNA Computing`).
   - `url` — a stable link (DOI preferred).
   - Keep `note` to a single sentence.

3. **Validate** the JSON before committing (a trailing comma is the usual culprit):

   ```bash
   python3 -c "import json; json.load(open('assets/data/literature.json')); print('valid ✓')"
   ```

4. **Commit and open a pull request** using the template. On merge, the survey page updates
   automatically — no build step, no other files to change.

That's the whole mechanism: **one JSON entry per reference, one pull request.**

## Adding the lab's own publications, patents, or projects

Same idea, different files — see the table in the [README](README.md#adding-content-the-data-driven-part).
Publications go in `publications.json`, patents in `patents.json`, and so on. Set the `related`
IDs to cross-link a paper to its patent/project/repo.

## Editing site chrome or styles

- Navigation, footer, and `<head>` live in `tools/build.py`. Edit there, then run
  `python3 tools/build.py` to regenerate the HTML.
- Visual design tokens (colors, fonts, spacing) live at the top of `assets/css/style.css`.

## Ground rules

- Keep JSON valid (run the validator above).
- One logical change per pull request.
- Be accurate — this is a research site; cite real, stable sources.
