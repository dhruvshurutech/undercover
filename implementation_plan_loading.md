# Loading Screen Implementation Plan

## Goal Description

Replace the subtle button spinner with a prominent, thematic "throbbing" loading screen while the AI generates the secret words. This provides better feedback for longer generation times.

## Proposed Changes

### Components

#### [NEW] [LoadingScreen.tsx](file:///Users/dhruvsaxena/undercover/undercover-webapp/components/game/LoadingScreen.tsx)

Create a new component using `framer-motion`.

- **Visuals**: A pulsing/throbbing circle or logo.
- **Text**: "Generating Secret Identity..." or "Contacting HQ...".
- **Animation**: Smooth scaling/opacity pulse.

#### [MODIFY] [SetupForm.tsx](file:///Users/dhruvsaxena/undercover/undercover-webapp/components/game/SetupForm.tsx)

- Import `LoadingScreen`.
- Conditional rendering:
  - If `isFetching` is true, show `<LoadingScreen />`.
  - Else, show existing form.

## Verification Plan

### Manual Verification

1.  **Transition Test**: Click "Start Game" and ensure the form immediately disappears and is replaced by the loading screen.
2.  **Animation Test**: Verify the throbbing animation is smooth and visible.
3.  **Completion Test**: Verify the game starts correctly once generation is done.
4.  **Error Test**: Verify it returns to the form if generation fails.
