---
description: Review a specific UI page or component against the Vercel-like UI-Review skill, including visual asset and design checks.
---

1. **Context Loading**
   - Identify the target file(s) for the page/component mentioned (e.g., "Login page" -> `src/frontend/pages/Login.tsx`).
   - Read the UI standards: `view_file d:\Code\SatVach\.agent\skills\ui-review\SKILL.md`
   - Read the Project Design System: `view_file D:\Code\SatVach\docs\DESIGN_SYSTEM.md`
   - Read the target code: `view_file [Target_File_Path]`

2. **Code & Aesthetic Analysis**
   - Perform a strict audit based on the `ui-review` skill checklist and `DESIGN_SYSTEM.md`.
   - **Visuals**: Look for consistent spacing, glassmorphism usage, and **strict adherence** to the 5-color palette defined in `DESIGN_SYSTEM.md`.
   - **UX**: Verify presence of Skeleton loaders (for loading) and clear Empty states.
   - **Interaction**: Ensure `:hover` and `:active` states exist on interactive elements.

3. **Visual Asset Verification & Generation**
   - **Concept Check**: Evaluate if the current implementation matches a "Premium Vercel-like" aesthetic.
   - **Professional Asset Generation**:
     - **Goal**: Create _actual assets_ (backgrounds, illustrations, icons) to embed in the page to elevate professionalism. **Do NOT generate full-page UI mockups for review.**
     - **Usage**:
       - Identify areas needing visual enhancement (e.g., empty states, hero sections, login backgrounds).
       - Use `generate_image` to create specific, high-quality assets.
       - **Prompt Strategy**: "Professional [Asset Type] for [Context], [Brand Style] colors, high resolution, minimalist/premium aesthetic."
       - **Action**: Save assets to `src/frontend/src/assets` (or appropriate folder) and _implement them directly_ in the code.

4. **Execution & Reporting**
   - Present the **Audit Results** using the checklist format from the Skill.
   - Provide concrete **Refactoring Code** including the **integration of generated assets**.
   - **Outcome**: The page should look significantly more professional with the new assets applied.
