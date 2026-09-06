# Start Here

A gentle, one page guide to growing your money. Written for anyone who was never taught. It covers what money is, why cash quietly loses value, the four building blocks (stocks, bonds, gold, bitcoin), how to pick a mix, how to buy it, and the small upkeep it needs.

## Files

- `index.html` — the page and all its content
- `styles.css` — colors, type, and layout
- `script.js` — the pie charts and the interactive mix builder

## Run it locally

From the folder with `index.html`:

```
python3 -m http.server 8000
```

Then open the forwarded port (or http://localhost:8000). Serve it over http rather than opening the file directly, so it behaves the same way it will once published.

## Publish it with GitHub Pages

1. Push these files to the root of a repository.
2. In the repo, go to Settings, then Pages.
3. Under Build and deployment, set Source to Deploy from a branch.
4. Pick your branch and the root folder, then save.
5. Wait a minute. Your live link appears at the top of that same page.

## Make it yours

- The title lives in the hero and the browser tab. Right now it reads "Start Here."
- Every asset color is a variable at the top of `styles.css`, so a recolor is one line.
- The mix rules live in `script.js`: gold stays at 15 percent, bitcoin is the risk dial (5, 10, or 15), bonds follow your age minus 20, and stocks fill the rest.

## A note

This guide is for learning, not personal financial advice. Investing always carries risk, including the chance of loss.
