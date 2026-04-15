## ADDED Requirements

### Requirement: Opt into Pomodoro mode at session start

The system SHALL provide a Pomodoro toggle on the Home screen. When enabled, starting any session begins a 25-minute focused block followed by a 5-minute break (configurable). When disabled, sessions run as freestyle (open-ended) per v1 behavior.

#### Scenario: Starting a Pomodoro Create session

- **WHEN** Pomodoro mode is on and the user starts a Create session
- **THEN** the system displays a 25-minute countdown (configurable focus length) and the active-session view shows the remaining time prominently

#### Scenario: Switching off Pomodoro mode

- **WHEN** the user toggles Pomodoro off and starts a session
- **THEN** the session runs as a freestyle open-ended timer with no auto-stop

### Requirement: Auto-stop at the end of a focus block

The system SHALL automatically stop the session and save it when the focus block elapses, then prompt the user with "Take a 5-minute break" or "Stop session".

#### Scenario: Focus block elapses

- **WHEN** a 25-minute Pomodoro Create session reaches 25 minutes
- **THEN** the system saves the session, plays an audible chime (when permitted), and shows a prompt with the two options

#### Scenario: Choosing the break

- **WHEN** the user taps "Take a 5-minute break" after a Pomodoro
- **THEN** the system displays a 5-minute break countdown and SHALL NOT credit or debit the Time Bank during the break

#### Scenario: Choosing to stop

- **WHEN** the user taps "Stop session"
- **THEN** the session ends and the home screen returns to idle

### Requirement: Configurable focus and break lengths

The system SHALL allow the user to set the focus length (5–60 minutes) and break length (1–30 minutes) from Settings.

#### Scenario: Custom focus length

- **WHEN** the user sets focus to 50 minutes and break to 10 minutes
- **THEN** subsequent Pomodoros use 50/10

### Requirement: Pomodoro respects Time Bank gating

The system SHALL apply the same Time Bank gating to Pomodoro Leisure consume as freestyle Leisure consume. When the bank reaches zero mid-Pomodoro, the session stops automatically and the break is skipped.

#### Scenario: Bank empties mid-Pomodoro

- **WHEN** the user is in a 25-minute leisure Pomodoro and the bank reaches zero at minute 12
- **THEN** the system stops the session at minute 12, saves it, and skips the break with a message explaining the bank ran out
