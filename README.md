# LaTeX Master

A lightweight, dependency-free web app that strips and converts LaTeX markup into readable Unicode or plain text.

**Live site:** https://iciencia.net/latex-master/  
**Backup (GitHub Pages):** https://\<your-username\>.github.io/latex-master/

---

## Features

- Two output modes: **Unicode** (√, α, ½) and **Plain text** (sqrt, alpha, 1/2)
- Supports fractions, roots, Greek letters, operators, arrows, calculus symbols, sub/superscripts and more
- Bilingual UI: Spanish / English (auto-detected, toggle button)
- Copy-to-clipboard with one click
- Ctrl+Enter shortcut to convert
- No external libraries — 100 % vanilla JS/CSS
- Accessible (ARIA labels, keyboard navigation, focus styles)
- Basic SEO meta tags

---

## File structure

```
latex-master/
├── index.html   # App shell + markup
├── style.css    # All styles (CSS variables, responsive)
├── app.js       # LaTeX conversion engine + UI logic
├── favicon.png  # App icon (512×512 recommended)
└── README.md
```

---

## Deploy to iciencia.net

Upload the four files (`index.html`, `style.css`, `app.js`, `favicon.png`) to your web root or a subfolder, e.g.:

```
/public_html/latex-master/
```

Then visit `https://iciencia.net/latex-master/`.

> Update the `<link rel="canonical">` and `og:url` values in `index.html` if you place the app at a different path.

---

## Deploy to GitHub Pages

1. Create a repository named `latex-master` (or any name you prefer).
2. Push all files to the `main` branch.
3. Go to **Settings → Pages → Source** and select **Deploy from branch → main / root**.
4. Your app will be live at `https://<your-username>.github.io/latex-master/` within a minute or two.

### Quick commands

```bash
git init
git add .
git commit -m "Initial release"
git remote add origin https://github.com/<your-username>/latex-master.git
git push -u origin main
```

Then enable GitHub Pages in the repository settings as described above.

---

## Supported LaTeX conversions (selection)

| LaTeX | Unicode | Plain |
|-------|---------|-------|
| `\frac{1}{2}` | ½ | 1/2 |
| `\sqrt{x}` | √x | sqrt(x) |
| `\sqrt[n]{x}` | ⁿ√x | root(n,x) |
| `\alpha … \omega` | α … ω | alpha … omega |
| `\Sigma`, `\Pi` | Σ, Π | Sigma, Pi |
| `\times`, `\div` | ×, ÷ | *, / |
| `\leq`, `\geq`, `\neq` | ≤, ≥, ≠ | <=, >=, != |
| `\sum`, `\int` | ∑, ∫ | sum, integral |
| `\infty`, `\partial` | ∞, ∂ | infinity, d |
| `\rightarrow`, `\Rightarrow` | →, ⇒ | ->, => |
| `x^2`, `x^{abc}` | x², xᵃᵇᶜ | x^2, x^(abc) |
| `x_1`, `x_{ij}` | x₁, xᵢⱼ | x_1, x_(ij) |

---

## License

MIT — free to use, modify and distribute.
