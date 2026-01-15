# Pure Color Painting Website

A professional static website for Pure Color Painting, designed to be easy to update and maintain.

## Quick Start

1. Open `index.html` in a browser to view the site locally
2. For local development with a server (recommended): `npx serve` or use VS Code Live Server

## How to Update Content

### Adding Portfolio Images

1. Add your image files to the appropriate folder:
   - `images/portfolio/residential/` - for residential projects
   - `images/portfolio/commercial/` - for commercial projects
   - `images/portfolio/decks/` - for deck projects

2. Open `data/portfolio.json` and add a new entry:

```json
{
    "title": "Project Name",
    "category": "residential",
    "image": "images/portfolio/residential/your-image.jpg",
    "description": "Brief description of the project"
}
```

**Categories:** `residential`, `commercial`, `decks`

### Adding Testimonials

Open `data/testimonials.json` and add a new entry:

```json
{
    "text": "The testimonial text goes here...",
    "author": "Client Name",
    "location": "City, State (optional)"
}
```

### Updating Contact Information

Edit the contact section in `index.html`:
- Phone number
- Email address
- Service area
- Social media links

### Changing Colors/Styling

Edit `css/styles.css` - the main colors are defined at the top:

```css
:root {
    --color-primary: #1a3a5c;    /* Navy blue - headers, buttons */
    --color-secondary: #c9a227;  /* Gold - accents, highlights */
}
```

## File Structure

```
PureColorPainting/
├── index.html              # Main website page
├── css/
│   └── styles.css          # All styling
├── js/
│   └── main.js             # Dynamic content loading
├── data/
│   ├── portfolio.json      # Portfolio items (EDIT THIS)
│   └── testimonials.json   # Testimonials (EDIT THIS)
└── images/
    ├── hero-bg.jpg         # Hero background image (optional)
    └── portfolio/
        ├── residential/    # Residential project photos
        ├── commercial/     # Commercial project photos
        └── decks/          # Deck project photos
```

## Hosting on GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Set source to "main" branch
4. Your site will be live at `https://purecolorpainting.github.io/REPO-NAME/`

## Form Submissions

The contact form currently shows a placeholder message. To enable real submissions, integrate with one of these services:

- **Formspree** (formspree.io) - Free tier available
- **Netlify Forms** - If hosting on Netlify
- **EmailJS** (emailjs.com) - Send directly to email

## Image Recommendations

- **Hero image:** 1920x1080px or larger
- **Portfolio images:** 800x600px minimum, 4:3 aspect ratio works best
- **File formats:** JPG for photos, PNG for graphics with transparency
- **Optimization:** Compress images before uploading (tinypng.com)
