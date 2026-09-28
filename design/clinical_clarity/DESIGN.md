---
name: Clinical Clarity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#006860'
  on-tertiary: '#ffffff'
  tertiary-container: '#248279'
  on-tertiary-container: '#f3fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#9cf2e8'
  tertiary-fixed-dim: '#80d5cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an empathetic, clinical, and reassuring digital environment for healthcare scheduling. It blends **Modern Minimalist precision** with **human-centered warmth**, eliminating the anxiety, visual noise, and friction often associated with medical appointments. 

### Visual Personality & Ethos
- **Trustworthy & Authoritative:** Clean lines, deliberate grid systems, and structural integrity instill confidence in patients and healthcare providers alike.
- **Calm & Restorative:** Soft clinical mist tones, breathable white space, and balanced teal accents actively reduce cognitive fatigue and medical apprehension.
- **Human & Accessible:** Legible letterforms, high WCAG contrast, and intuitive, tactile touchpoints make navigation seamless across all ages and technical literacies.
- **Premium Simplicity:** Subtle micro-elevations, crisp borders, and refined pill geometry project an atmosphere of polished, world-class healthcare delivery.

## Colors

The color system delivers high legibility and calming feedback, carefully tuned for clinical usability and WCAG AAA compliance across primary patient workflows.

### Color Tiers & Roles
- **Primary Teal (`#0D9488`):** The signature brand color for primary actions, selected dates, active appointment confirmations, and prominent focus indicators.
- **Secondary Cyan (`#14B8A6`):** Used for interactive highlights, active state transitions, and supportive icon backgrounds.
- **Deep Medical Teal (`#0F766E`):** Anchors hover and pressed states on primary components, ensuring persistent visual weight.
- **Deep Slate Navy (`#0F172A`, `#1E293B`, `#334155`):** Serves as high-contrast body and heading typography, replacing harsh pure black with authoritative, warm slate.
- **Clinical Mist Surfaces (`#F8FAFC`, `#F1F5F9`):** Wash backgrounds behind cards to delineate interactive zones without aggressive dividing lines.
- **Pure White Canvas (`#FFFFFF`):** Reserved for elevated surface cards, appointment slots, modals, and input fields.
- **System Feedback:**
  - **Success (`#10B981`, surface `#ECFDF5`):** Confirmed bookings, available slots, verified medical records.
  - **Warning (`#F59E0B`, surface `#FFFBEB`):** Upcoming schedule changes, pending doctor verifications, expiring intake forms.
  - **Critical (`#EF4444`, surface `#FEF2F2`):** Cancelled appointments, missing required fields, urgent medical disclaimers.
  - **Border Mists (`#E2E8F0`, `#CBD5E1`):** Gentle boundary definitions for forms, calendar matrices, and card shells.

## Typography

Typography prioritizes optical clarity and functional hierarchy. 

- **Display & Headlines (Plus Jakarta Sans):** Selected for its friendly yet structural geometry. Its open counters and welcoming aperture communicate clinical empathy without losing professional stature.
- **Body & Controls (Inter):** Deployed across all clinical notes, doctor biographies, data tables, and input components. Its tall x-height and neutral design guarantee maximum legibility under rapid-scan conditions.
- **Data & Numbers:** Tabular figures are enforced for appointment timestamps, durations, fees, and doctor availability counters to ensure vertical alignment across dense scheduling grids.

## Layout & Spacing

The platform uses a fixed-fluid hybrid grid anchored to an 8px base rhythm (with 4px sub-increments for compact clinical metadata).

### Responsive Breakpoints & Grids
- **Mobile (< 768px):** 4-column layout, 16px margins, 16px gutters. Actions stack vertically, prioritizing single-thumb booking interactions.
- **Tablet (768px - 1023px):** 8-column layout, 24px margins, 20px gutters. Dual-pane scheduling appears: doctor list alongside mini-calendar view.
- **Desktop (1024px+):** 12-column layout capped at a maximum container width of `1280px`, 32px canvas margins, 24px gutters. Tri-pane layouts support concurrent browsing, appointment time selection, and real-time patient summary review.

### Spacing Philosophy
Spacing provides emotional relief. Complex medical forms and specialty choices are broken into digestible visual clusters using `space-lg` and `space-xl` gaps, preventing sensory overload for unwell or stressed patients.

## Elevation & Depth

Visual hierarchy is maintained via gentle tonal layering accompanied by soft, ambient clinical shadows. Heavy dropshadows are forbidden to prevent visual clutter and maintain clean hygiene aesthetics.

### Elevation Levels
- **Level 0 (Flat Ground):** Clinical Mist (`#F8FAFC`) canvas surface.
- **Level 1 (Card & Slot Baseline):** Pure White (`#FFFFFF`) cards with a 1px crisp outline (`#E2E8F0`) and an ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover & Active Booking Cards):** Elevated doctor profiles and selected time slots: `0 4px 6px -1px rgba(13, 148, 136, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`, bordered with `#14B8A6`.
- **Level 3 (Dropdowns & Popovers):** Datepickers and specialty selectors: `0 10px 15px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`.
- **Level 4 (Modals & Emergency Confirmations):** Appointment confirmation dialogs and intake forms: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)`, backed by a 40% opacity `#0F172A` backdrop blur.

## Shapes

The design system adopts a balanced **Rounded (`roundedness: 2`)** paradigm with intentional pill-shaped accents for human-centric elements.

### Curvature Hierarchy
- **Standard Controls & Cards (0.5rem / 8px):** Input fields, provider cards, calendar day cells, and alert banners establish a neat, professional framework.
- **Large Containers (1rem / 16px):** Modal dialogs, intake step wrappers, and telemedicine video preview panels.
- **Pill Shapes (Full Round / 9999px):** Status badges, specialty tags, chips, and primary action buttons. The pill geometry conveys softness, friendliness, and tactile affordance.

## Components

### Buttons
- **Primary:** Solid `#0D9488` background, `#FFFFFF` text, pill shape, `space-sm` vertical and `space-lg` horizontal padding. Transitions to `#0F766E` on hover with a 2px subtle ring offset on focus.
- **Secondary:** Surface `#F1F5F9`, text `#0F172A`, 1px border `#E2E8F0`. On hover: `#E2E8F0`.
- **Ghost:** Transparent background, `#0D9488` text, pill shape. Used for tertiary actions such as "View Bio" or "Change Slot".

### Chips & Badges
- **Status Badges:** Full-pill containers with subtle tinted fills and matching bold labels:
  - Verified Doctor: Background `#ECFDF5`, Text `#047857`.
  - Available Today: Background `#CCFBF1`, Text `#0F766E`.
  - Video Visit: Background `#F1F5F9`, Text `#334155`.
- **Filter Chips:** Pill shape with 1px border (`#E2E8F0`). In active/selected state, fills with `#0D9488`, text switches to `#FFFFFF`.

### Doctor & Clinic Cards
- Pure White background, Level 1 elevation, 16px padding.
- Includes a verified avatar with a 2px teal status halo, provider credentials in `label-sm` uppercase, and an integrated grid of available time chips.

### Time Slot Selectors
- Interactive pills displaying formatted times (e.g., `09:30 AM`).
- Default: Border `#E2E8F0`, background `#FFFFFF`, text `#1E293B`.
- Hover: Border `#14B8A6`, background `#F0FDFA`.
- Selected: Background `#0D9488`, text `#FFFFFF`, elevation level 2.
- Disabled/Booked: Strikethrough text `#94A3B8`, background `#F8FAFC`, non-interactive.

### Input Fields & Selectors
- Height: 48px for finger-friendly touch targets.
- Base: 1px border `#CBD5E1`, background `#FFFFFF`, radius 8px, font `body-md`.
- Focus state: Border `#0D9488`, outline: 3px solid `#CCFBF1`.
- Error state: Border `#EF4444`, outline: 3px solid `#FEE2E2`. Accompanied by inline helper text and icon.

### Calendar Day Matrix
- Square aspect ratio with 8px radius.
- Has current-day indicator via a small bottom dot.
- Available days display bold text with a soft teal badge on hover; unavailable days are dimmed to 40% opacity.