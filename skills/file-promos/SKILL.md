---
name: file-promos
description: File new promo graphics from a designer's Google Drive link into the promos-v5 archive — download, sort into hero/promo, convert to the right format, minify, validate, and hand back folders ready to share. Use when given a Drive link (or a local folder) of promo banner assets, or when asked to file/sort/normalise promo artwork, fix promo formats, or check a promotion folder against the naming convention.
---

# Filing promo graphics

Takes a designer's Google Drive link through to promotion folders that are
ready to share from Dropbox. You do the judgement; the `promo` tool does
everything mechanical.

The tool lives next to this file. Use the absolute path:

```
~/.agents/skills/file-promos/promo
```

## The split

You decide **which file is which** — promotion, campaign month, vertical, name,
language, placement. The tool decides nothing and guesses nothing.

The tool does **download, probe, convert, minify, file, validate**. It refuses
any manifest that would put a wrongly-named or wrongly-sized file into the
archive, so a mistake of yours becomes an error message, not a bad commit to a
99 GB tree where renames break links already sent.

## Steps

### 1. Fetch

```bash
promo fetch "<drive-url>" --to ./staging --list   # see what's there, download nothing
promo fetch "<drive-url>" --to ./staging          # everything, PSDs included
```

Works anonymously on "anyone with the link" folders — no account, no API key,
nested folders included.

**Always fetch the PSDs, however large they are.** Working files are part of
the promotion and belong in `source/`; a link can carry gigabytes of them
against a few MB of banners, and that is fine. Never skip them to save time or
transfer, and never ask whether to include them.

`--images-only` exists for the rare case where the user explicitly asks for
artwork alone. Do not reach for it on your own initiative.

Start with `--list` when you want to see the shape of a folder before
downloading.

If it fails on permissions the link is restricted: ask the designer to loosen
sharing, or have the user download it by hand and point step 2 at the local
folder instead.

### 2. Inventory

```bash
promo inventory ./staging
```

Prints every file with its **real** pixel dimensions, format, detected language
and whether it carries transparency. Read this, not the filenames.

Dimensions determine placement. Filenames lie — the archive contains files
named `_2360x760` that are actually 2360×700.

| real size | goes to | format |
|---|---|---|
| 2360×760 | `upload/hero/` | PNG |
| 2360×440, 1160×300, 760×300 | `upload/promo/` | JPG |
| anything else | ask the user | — |

The source file's current format is irrelevant. A promo-size PNG becomes a JPG;
a hero-size JPG becomes a PNG. That conversion is the point.

### 3. Work out the naming yourself

**Guess all of it. The dry run in step 5 is where the user corrects you** — that
is cheaper for them than answering questions before they can see anything.

- **Campaign month** — the current month, as `YYYYMM`. Do not ask. Use the
  user's month if they name one, over anything the artwork says.
- **Promotion name** — read it off the artwork. Thumbnail one hero per
  promotion and use the name as it is set in the design.
- **Vertical** — `poker`, `casino` or `sports`, from the artwork. Cards and
  chips are poker, slot reels are casino.
- **Language** — filename suffix, then parent folder name, then the artwork.
  Cyrillic against Latin is obvious in a thumbnail.

```bash
promo thumbs ./staging/IPOPS_I/2360x760_iPOPS-I.png --out ./thumbs
```

One hero per promotion is the routine read. Go wider only for files the
inventory could not resolve — never thumbnail a whole batch.

Recurring promotions carry the year in the name, so six Black Fridays stay
distinguishable: `Black Friday 2026_2360x760_EN.png`.

Two things are still worth asking, because no amount of looking settles them:

- **Off-spec sizes** — anything outside the five standard sizes. Ask where it
  belongs; do not invent a placement.
- **A second language that has not arrived yet** — if only one cut is present,
  ask whether more are coming. Adding `_EN` now costs nothing; renaming later
  breaks every link already sent.

Say your assumptions in one line alongside the dry run — month used, names
read off the artwork, anything the artwork disagreed with. A remark, not a
question.

### 4. Write the manifest

```json
{
  "promotions": [
    {
      "folder": "202609-poker-autumn-series",
      "figma_url": "https://figma.com/file/...",
      "files": [
        {"src": "/abs/staging/ENG/main banner.png",
         "dest": "upload/hero/Autumn Series_2360x760_EN.png"},
        {"src": "/abs/staging/ENG/big.png",
         "dest": "upload/promo/Autumn Series_2360x440_EN.jpg"},
        {"src": "/abs/staging/psd/hero.psd",
         "dest": "source/Autumn Series_2360x760.psd"}
      ]
    }
  ]
}
```

- `src` — absolute path into staging.
- `dest` — relative to the promotion folder. Only `upload/hero/*.png`,
  `upload/promo/*.jpg` and `source/*` are accepted.
- `folder` — `YYYYMM-vertical-name`, lowercase, hyphens, never a dot.
- `dest` filename — `<Promo Name>_<W>x<H>[_<LANG>].<ext>`. Language is a
  two-letter suffix (`EN` `RU` `ES` `UK` `DE`), never `ENG`/`RUS`, never a
  folder. Omit it entirely for language-neutral artwork.
- `figma_url` — optional; writes `sources-in-figma.txt` at the promotion root
  when the working files live in Figma rather than as local PSDs.
- `background` — required on a promo entry whose source has real transparency,
  since JPG has no alpha. Ask the user for the colour rather than assuming
  white; these banners are usually dark.

Put PSDs and other working files under `source/`. They are copied verbatim,
never converted.

### 5. Show the plan, then apply

```bash
promo apply manifest.json              # dry run — always do this first
```

Show the user the dry run and get their agreement. This is the review gate and
the place every naming guess gets corrected, so it carries the weight of all
the questions you did not ask — do not skip it, and do not apply on the
strength of your own confidence.

Corrections here are cheap: edit the manifest and dry-run again. Nothing has
been written yet.

```bash
promo apply manifest.json --force
```

Escape hatches, only with the user's explicit say-so:
`--allow-offspec` for a deliberate non-standard size, `--allow-dim-mismatch`
when a filename must keep a dimension the pixels disagree with.

### 6. Validate and hand over

```bash
promo check 202609-poker-autumn-series
```

Checks formats, filenames, that the three promo sizes exist for every language,
and that filenames match actual pixels. Fix anything it reports before handing
the folder over.

Then give the user the paths to share. Dropbox links are made by hand — in
Finder, right-click `upload/` → *Copy Dropbox Link*. `check` prints an
`open -R` command that reveals the folder. Share `upload/`, never the
promotion root, so PSDs stay private.

## Rules

**Only touch the promotions in this batch.** The archive's existing
non-conforming files are deliberately left alone. Do not fix, rename or
reformat anything you were not asked to file.

**Never rename or move an existing promotion folder.** Every Dropbox share link
points at a path, so a rename silently breaks links already sent by email.

**Never bulk-read existing `upload/` content.** 869 of the archive's 2483
upload files are Dropbox online-only stubs; probing them downloads them.
`promo check` already skips them — do not work around it with `identify`,
`find -exec`, or a thumbnailer pointed at the archive.

**Prefer `mv` over `cp` inside the Dropbox tree.** A move is a metadata
operation; a copy re-uploads.

## Reference

Conventions, standard sizes and the archive's history: `promos-v5/README.md`.
Read it when something in a batch does not fit the table above.
