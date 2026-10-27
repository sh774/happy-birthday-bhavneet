# Happy birthday, Bhavneet

A birthday sketchbook website. It's plain HTML, CSS and JavaScript with no build step, so GitHub Pages can host it as-is.

What's on it:

- A sketchbook cover ("Property of Bhavneet Kaur") that flips open
- A hand-drawn hero with confetti, balloons you can pop, and a music-box "Happy Birthday"
- A bhatura with 23 candles in it. Tap the candles, or blow into the mic, to set off fireworks
- An Office-style Dundies awards night
- Our greatest hits: maths competition, badminton, the jury, food, gossip
- A typed-out letter
- A drawing pad she can doodle on and save as a PNG

## Edit the words

Everything you'd want to change is in the `CONFIG` block at the top of `script.js`: her name, age, your name, the letter, the awards and the memories. Read through the copy before you publish. It's written as you, so make it sound like you.

## Add real photos (recommended)

1. Make a folder called `photos` next to `index.html` and put the pictures in it.
2. List them in `CONFIG.photos` in `script.js`:
   ```js
   photos: [
     { src: "photos/badminton.jpg", caption: "The rematch" },
     { src: "photos/jury.jpg", caption: "Judging, professionally" },
   ],
   ```
   An "Evidence" section appears once there's at least one photo.
3. You can also swap a drawing for a photo in `CONFIG.memories`, for example `{ photo: "photos/maths.jpg", title: "...", text: "..." }`.

GitHub Pages filenames are case-sensitive: `Photo.JPG` and `photo.jpg` are different files. Phone photos are large, so shrink them to about 1500px wide first so the page loads quickly.

## Preview it

Double-click `index.html`. Sound starts when you tap the cover, because browsers block sound until you tap.

## Put it online with GitHub Pages

1. Sign in at github.com and click **New repository**. Name it something like `bhavneet-birthday` and set it to **Public**.
2. On the new repo page, click **uploading an existing file**. Drag in `index.html`, `style.css`, `script.js` (and the `photos` folder if you have one), then click **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch** and Branch to **main** and **/ (root)**, then click **Save**.
4. Wait a minute or two and refresh. The link shows at the top of that page: `https://YOUR-USERNAME.github.io/bhavneet-birthday/`

If you prefer the command line:

```bash
git init
git add .
git commit -m "Birthday site for Bhavneet"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bhavneet-birthday.git
git push -u origin main
```

Then do step 3 above.

A free GitHub Pages site is public, so anyone with the link can open it. Don't put anything on it you wouldn't want shared.
