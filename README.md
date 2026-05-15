# Portfolio — Next.js

Dark, minimalist portfolio built with **Next.js 14 + Tailwind CSS**.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:3000
```

## 📁 Structure

```
portfolio/
├── app/
│   ├── globals.css       ← CSS variables, base styles, animations
│   ├── layout.jsx        ← Root layout + metadata (edit title/desc here)
│   └── page.jsx          ← Main page (composes all components)
│
├── components/
│   ├── Navbar.jsx        ← Top navigation
│   ├── Hero.jsx          ← Hero section
│   ├── Marquee.jsx       ← Scrolling skills strip
│   ├── Projects.jsx      ← Projects grid
│   ├── projects.data.js  ← ⭐ EDIT THIS to update your projects
│   ├── About.jsx         ← About + skills section
│   ├── Contact.jsx       ← Contact CTA section
│   ├── Footer.jsx        ← Footer with social links
│   └── Cursor.jsx        ← Custom cursor
```

## ✏️ Customization

### Your info
Search and replace `hello@yourname.com`, `yourusername`, `yourprofile` across all files.

### Projects
Edit `components/projects.data.js` — add/remove objects from the array.
To add a real screenshot: add `image: '/images/project1.png'` to the data and update `Projects.jsx` to use `<Image>` from `next/image`.

### Your photo (About section)
In `components/About.jsx`, replace the placeholder `<span>YOU</span>` with:
```jsx
import Image from 'next/image'
<Image src="/images/photo.jpg" alt="Your name" fill className="object-cover" />
```
Then put `photo.jpg` inside the `public/images/` folder.

### Metadata (SEO)
Edit `app/layout.jsx` → `export const metadata`.

### Logo
Edit `components/Navbar.jsx` → change `A.DEV` to your initials.

## 🌐 Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repo → click **Deploy**
4. Done! Live in ~1 minute ✅

## 🛠 Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Google Fonts** — Syne + DM Sans
- Vanilla JS only for cursor + scroll effects (no external animation libs)
