# 05 UI/UX Guidelines (Provisional)

> Status: provisional — official PRD file was missing at kickoff. See `docs/00-PRD-STATUS.md`.

## Product character

- Mobile-first operational tool for restaurant floor staff
- Task-driven home, not ERP dashboard
- One primary job per screen
- Large touch targets (min 44px)
- Chinese / English via i18n

## Layout

- Max content width ~720–960px
- Sticky top brand bar
- Fixed bottom nav (5 items): Home / Stock / Buy / Items / More
- First viewport on Home: brand + today's task list only

## Visual tokens

- Brand green `#1a4d3e`
- Accent terracotta `#c45c26` (sparingly for warnings/actions)
- Warm paper background with soft green/peach atmospheric gradients
- Display: Source Serif 4 / Noto Serif SC
- Body: IBM Plex Sans / Noto Sans SC

## Interaction

- Prefer steppers for quantity edits
- Bottom-sheet style modals on mobile
- Toast for success/error (never `alert`)
- Loading skeletons/spinners for async states
- Empty states with one clear next action

## Motion

- Fade-up for task/list appearance
- Soft press scale on task rows and buttons
- Shimmer for skeletons

## Do not

- Desktop-first layouts
- Dense ERP tables as the default mobile view
- Purple neon SaaS chrome
- Hardcoded UI copy
