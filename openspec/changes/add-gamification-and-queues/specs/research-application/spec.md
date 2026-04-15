## ADDED Requirements

### Requirement: Track pending research minutes per todo

The system SHALL record, when a Research consume session ends, a pending research entry containing the linked todo id, the session id, the minutes earned-as-free, and a deadline equal to the session end timestamp plus the configured apply window (default 7 days).

#### Scenario: Research session ends free

- **WHEN** the user completes a 20-minute Research session linked to todo X and the apply window is 7 days
- **THEN** the system records a pending entry `{ todoId: X, sessionId: …, minutes: 20, deadline: end + 7d }` and SHALL NOT debit the Time Bank

### Requirement: Apply pending research when create work is logged

The system SHALL mark a pending research entry as applied when a Create session is saved for the same linked todo before the deadline expires.

#### Scenario: Single create session covers research

- **WHEN** the user has 20 minutes of pending research against todo X and saves a Create session of any duration linked to todo X before the deadline
- **THEN** the pending entry is marked `applied`, no further debit happens, and a notification confirms the research has been applied

### Requirement: Retroactive debit when apply window expires

The system SHALL debit the Time Bank for the full pending minutes of any research entry whose deadline expires without an applying Create session, and SHALL surface a notification to the user.

#### Scenario: Apply window expires

- **WHEN** a pending research entry of 20 minutes against todo X has a deadline of 2026-04-21 and on 2026-04-22 the user has logged zero Create minutes against todo X
- **THEN** the system records a -20 minute debit in the bank ledger labeled "Unapplied research" and shows the user a notification explaining the debit and which session triggered it

#### Scenario: Apply window expires while bank is empty

- **WHEN** the apply window expires and the bank balance is already zero
- **THEN** the debit still posts and the bank balance can go negative; Leisure consume remains gated until the user creates enough to make the balance positive

### Requirement: Show pending research on the Todos and Profile screens

The system SHALL display to the user, on each todo and on a Profile/Stats view, how many Research minutes are pending against that todo and how long until the apply deadline.

#### Scenario: Pending research visible on a todo

- **WHEN** the user opens todo X and there are 20 minutes of pending research against it expiring in 3 days
- **THEN** the system displays a "20 min research pending — apply by <date>" badge on the todo

### Requirement: Cancel a pending research entry by deleting its session

The system SHALL remove a pending research entry when its originating session is deleted, with no retroactive debit.

#### Scenario: Deleting an unapplied research session

- **WHEN** the user deletes a Research session from history before its apply window expires
- **THEN** the corresponding pending entry is removed and the bank is unaffected
