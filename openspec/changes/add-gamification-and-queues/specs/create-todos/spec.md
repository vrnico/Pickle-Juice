## ADDED Requirements

### Requirement: Create todos for Create work

The system SHALL allow the user to create todos that capture intended Create work, each with a title, optional description, and a status of `pending`, `in-progress`, or `done`.

#### Scenario: Adding a todo

- **WHEN** the user opens the Todos screen, taps Add, enters "Finish vertex shader demo", and saves
- **THEN** the todo appears at the top of the Pending list

### Requirement: Pick a todo at Create session start

The system SHALL surface pending and in-progress todos in the Create-session picker so the user can attach the upcoming session to one.

#### Scenario: Picking a todo before starting

- **WHEN** the user taps Create and selects a pending todo
- **THEN** the session starts with that todo's id stored in `linkedItemId` and the todo's status changes to `in-progress`

#### Scenario: Skipping the todo picker

- **WHEN** the user taps Create and chooses Freestyle
- **THEN** the session starts with `linkedItemId` undefined

### Requirement: Mark a todo done at session end

The system SHALL prompt the user, when they stop a Create session linked to a todo, to optionally mark the todo as done.

#### Scenario: Marking done after a session

- **WHEN** the user stops a 25-minute Create session linked to todo X and taps "Mark done" on the post-session prompt
- **THEN** the todo's status changes to `done` and a `completedAt` timestamp is recorded

#### Scenario: Leaving the todo in-progress

- **WHEN** the user stops the session and dismisses the post-session prompt
- **THEN** the todo's status remains `in-progress`

### Requirement: Edit and delete todos

The system SHALL allow the user to edit any field of a todo or delete it with confirmation. Deleting a todo SHALL NOT delete past sessions that referenced it.

#### Scenario: Deleting a todo with linked sessions

- **WHEN** the user deletes a todo that has 3 sessions linked to it and confirms
- **THEN** the todo is removed but the 3 sessions remain in history with their now-orphaned `linkedItemId`

### Requirement: Show recent activity per todo

The system SHALL display, for each todo, the total Create minutes logged against it and the most-recent linked session date.

#### Scenario: Active todo view

- **WHEN** the user opens an in-progress todo
- **THEN** the system shows total minutes from linked sessions, count of linked sessions, and a list of the most recent five
