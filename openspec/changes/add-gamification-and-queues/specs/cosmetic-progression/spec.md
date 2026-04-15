## ADDED Requirements

### Requirement: Earn XP for tracked time, never time itself

The system SHALL award XP for every saved session, weighted by category and subtype: Create > Research > Leisure. XP SHALL never be convertible to Time Bank credit, never reduce gating, and never grant additional consume time.

#### Scenario: Default XP weights

- **WHEN** the user saves a 10-minute Create session
- **THEN** the system awards 30 XP (default Create weight 3 XP per minute)

#### Scenario: Default XP for Research

- **WHEN** the user saves a 10-minute Research consume session
- **THEN** the system awards 20 XP (default Research weight 2 XP per minute)

#### Scenario: Default XP for Leisure

- **WHEN** the user saves a 10-minute Leisure consume session
- **THEN** the system awards 10 XP (default Leisure weight 1 XP per minute)

#### Scenario: XP cannot be spent for time

- **WHEN** any system surface offers to convert XP, levels, or streak count into Time Bank credit
- **THEN** the system SHALL NOT permit the conversion — there are no APIs, settings, or UI affordances to do so

### Requirement: Levels unlock cosmetic themes and badges

The system SHALL define levels at fixed XP thresholds. Each level unlocks one cosmetic asset (a theme palette, a pickle icon variant, a badge, or a celebratory animation). Unlocks SHALL be purely visual and never affect economy or gating.

#### Scenario: Reaching level 2

- **WHEN** the user crosses the level 2 XP threshold
- **THEN** the system shows a one-time celebration overlay and unlocks the level 2 cosmetic asset, which becomes selectable in Settings → Themes

#### Scenario: Selecting an unlocked theme

- **WHEN** the user picks an unlocked theme in Settings
- **THEN** the app's color palette updates immediately and the choice persists across reloads

### Requirement: Maintain a daily Create streak

The system SHALL track a current streak — consecutive calendar days the user has logged at least the configured streak threshold (default 10 minutes) of Create work — and the longest streak ever reached.

#### Scenario: Extending a streak

- **WHEN** the user completes 10 minutes of Create work today and yesterday's streak count was 5
- **THEN** today's streak count becomes 6

#### Scenario: Breaking a streak

- **WHEN** the user logs zero Create minutes for a full calendar day in their local timezone
- **THEN** the current streak resets to 0 and longest-ever is preserved

### Requirement: Show progression on a Profile screen

The system SHALL provide a Profile screen that shows current XP, current level (with progress bar to next), current streak, longest streak, and unlocked themes/badges.

#### Scenario: Viewing the Profile

- **WHEN** the user opens the Profile tab
- **THEN** the system shows XP, level + progress, current streak, longest streak, and a grid of unlocked vs. locked themes/badges

### Requirement: Confirm cosmetic-only nature in copy

The system SHALL include a "What XP and streaks do (and don't do)" disclosure on the Profile screen explaining that cosmetic progression never grants extra consume time.

#### Scenario: Reading the disclosure

- **WHEN** the user opens Profile and expands the "How this works" disclosure
- **THEN** the system displays prose explicitly stating that XP, levels, badges, and streaks are cosmetic and do not unlock leisure consume time
