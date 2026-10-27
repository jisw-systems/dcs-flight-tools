# Style guide

## Design intent
The site follows a minimalist technical mockup inspired by a digital kneeboard: dark, compact, readable, and operational.

## Color palette
The current design uses these CSS variables from `assets/css/styles.css`:

- background: #0D0D0F
- panel: #1A1C20
- panel secondary: #15171B
- accent: #B33939
- muted: #3A3F47
- text: #E6E6E6
- subtext: #C4C4C4

## Visual rules
- Dark background with red accents.
- White/gray text for readability.
- Use subtle borders and low-contrast dividers instead of heavy decoration.
- Keep the UI compact and functional; avoid decorative noise.

## Layout rules
- Use a max width of 1200px for main panels.
- Use 6px border radius as default.
- Use compact paddings and spacing.
- Keep content structured in clear blocks.

## Typography
- Prefer system fonts and sans-serif stack.
- Use simple hierarchy: titles, section labels, body text.
- Keep the content scan-friendly and short.

## Buttons and checklist items
- Buttons should have a subtle border and dark base.
- Hover states should highlight the red accent border.
- Completed checklist items should use the accent background and crossed text.
- Active aircraft selection should clearly show the focused plane.

## Panel layout
Each aircraft panel should be visually consistent:

- panel title in accent color
- toolbar row above list
- list of checklist items with borders and full width
- landing block with same layout pattern
- engine table below
- technical notes under that

## Distance and spacing values
Use the existing spacing conventions from `assets/css/styles.css` as the baseline:

- page padding edges: 18px
- panel padding: 18px
- inner gap in lists: around 8px
- section spacing: about 10px to 12px
- card radius: 6px
- main nav height: 56px

## Content style
- Write directly in imperative mood.
- Prefer technical, operational wording.
- Keep narratives short.
- Focus on scanning speed.

## Do not do
- avoid bright, playful color schemes
- avoid large decorative borders
- avoid long paragraphs inside checklist items
- avoid changing the project visual language unnecessarily

## Summary
The project should feel like a polished generic kneeboard: dark, compact, precise, fast to read, and technically driven.
