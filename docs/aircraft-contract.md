# Aircraft content contract

## Purpose
This document defines the project contract for aircraft checklist pages used in the DCS kneeboard site.

The goal is to keep each aircraft page readable, consistent, and operationally useful without forcing every aircraft into an identical checklist structure.

## Core principle
Each aircraft page should be close to the same structure, but not identical. Shared sections are mandatory; aircraft-specific details are allowed when they are real and relevant.

## Required sections
Each aircraft page should normally include these blocks:

1. Title
   - Format: "Aircraft Name - Checklist"

2. Main checklist
   - Cold start or engine start procedure
   - Ground setup and pre-takeoff checks
   - Basic system checks

3. Landing (Essential)
   - Key landing configuration items
   - Minimum speed / pattern checks
   - Safety-critical actions

4. Engine Management
   - Power setting table or bullet list
   - RPM / pressure / power notes
   - Time limits when relevant

5. Technical Notes
   - important aircraft-specific notes
   - unique engine, trim, or system behaviors
   - caveats for operation

## Optional sections
These may be added if the aircraft requires them:

- Takeoff block
- Takeoff management
- Mission setup notes
- Weapon and system notes
- Emergency or degraded operations

## Content rules
- Write in short, actionable steps.
- Prefer imperative phrasing: "Set", "Turn on", "Warm up", "Confirm".
- Keep wording consistent across aircraft pages.
- Avoid overexplaining theory or long narrative paragraphs.
- Keep content optimized for quick reference while on a kneeboard.
- If exact values are uncertain, label them as example or pending validation.

## Data rules
- Do not invent exact engine limits, trim values, fuel settings, or emergency procedures unless clearly marked as example content.
- Use the project tone: concise, military/aviation, direct.
- Maintain a neutral and practical voice.

## Structure example

```html
<div id="pernera-example" class="pernera-panel">
  <h3>Example Aircraft - Checklist</h3>

  <div class="checklist-toolbar">
    <button class="toggle-all-checklist" type="button" data-panel="example">Marcar/desmarcar todo</button>
  </div>

  <ul class="checklist">
    <li><button class="check-item" type="button" data-key="example-1">Step 1</button></li>
    <li><button class="check-item" type="button" data-key="example-2">Step 2</button></li>
  </ul>

  <div class="engine-management">
    <h4>Landing (Essential)</h4>
    <ul class="checklist">
      <li><button class="check-item" type="button" data-key="example-landing-1">Landing item</button></li>
    </ul>
  </div>

  <div class="engine-management">
    <h4>Gestión del motor</h4>
    <div class="engine-table-wrapper">
      <table class="engine-table">
        <thead>
          <tr><th>Perfil</th><th>RPM</th><th>Notas</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">Idle</th><td>~650</td><td>Warm-up</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="technical-notes">
    <h4>Notas técnicas</h4>
    <ul>
      <li>Aircraft-specific note</li>
    </ul>
  </div>
</div>
```

## Final rule
The page should feel like a pilot kneeboard: quick, useful, consistent, and stable enough to be trusted at a glance.
