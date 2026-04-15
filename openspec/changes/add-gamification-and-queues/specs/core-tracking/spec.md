## ADDED Requirements

### Requirement: Categorize consume sessions by subtype

The system SHALL require every consume session to carry a subtype of either `research` or `leisure`. Create sessions SHALL NOT have a subtype.

#### Scenario: Leisure subtype on a freestyle consume session

- **WHEN** the user starts a freestyle consume session without picking a queue item or specifying a subtype
- **THEN** the system records the session with `subtype = "leisure"` by default

#### Scenario: Research subtype derived from queue item

- **WHEN** the user picks a queue item tagged `research` and starts a consume session
- **THEN** the system records the session with `subtype = "research"` and `linkedItemId` set to the queue item's id

### Requirement: Attach an optional linked item to a session

The system SHALL allow consume sessions to reference a queue item id and create sessions to reference a todo id, via a `linkedItemId` field that is optional.

#### Scenario: Linking a create session to a todo

- **WHEN** the user picks a todo and starts a create session
- **THEN** the system records the session with `linkedItemId` set to that todo's id

#### Scenario: Freestyle session has no linked item

- **WHEN** the user starts a freestyle session without picking from a queue or todo list
- **THEN** the system records the session with `linkedItemId` undefined

### Requirement: Surface the Time Bank balance on the Home screen

The system SHALL display the user's current Leisure Time Bank balance on the Home screen at all times, and update it live during a leisure consume session.

#### Scenario: Bank balance visible while idle

- **WHEN** the user opens the Home screen and no session is running
- **THEN** the system shows a "Bank: <minutes> min" pill near the Consume button

#### Scenario: Bank balance ticks down during leisure consume

- **WHEN** the user is in an active leisure consume session
- **THEN** the displayed bank balance decreases at one minute per minute, in real time

### Requirement: Gate Leisure consume start by the Time Bank balance

The system SHALL prevent the user from starting a Leisure consume session when the Time Bank balance is zero or negative, and SHALL surface a "create more to unlock" message in place of the Start button.

#### Scenario: Starting Leisure with credit available

- **WHEN** the user taps Leisure Consume and the bank balance is greater than zero
- **THEN** the session starts normally

#### Scenario: Starting Leisure with empty bank

- **WHEN** the user taps Leisure Consume and the bank balance is zero or negative
- **THEN** the system SHALL NOT start the session and SHALL display an inline message explaining how many Create minutes are needed to unlock leisure time

#### Scenario: Bank reaches zero mid-session

- **WHEN** a leisure consume session is running and the bank balance reaches zero
- **THEN** the system stops the session automatically, saves it, and surfaces a message indicating the bank is empty

### Requirement: Pick a queue item or todo before starting

The system SHALL allow the user to optionally pick a queue item (for consume) or a todo (for create) from a picker shown when the relevant Start button is tapped, and SHALL allow them to skip the picker to run a freestyle session.

#### Scenario: Picking a queue item

- **WHEN** the user taps Consume, sees the picker listing saved queue items, and chooses one
- **THEN** the session starts with the chosen item's subtype and `linkedItemId`

#### Scenario: Skipping the picker

- **WHEN** the user taps Consume, sees the picker, and chooses "Freestyle"
- **THEN** the system asks the user to choose Research or Leisure subtype, then starts the session as freestyle with `linkedItemId` undefined

## MODIFIED Requirements

### Requirement: Start a tracking session

The system SHALL allow the user to start a tracking session by selecting a category (Consume or Create) and tapping Start. Consume requires a subtype (research or leisure). Only one session can be active at a time.

#### Scenario: Starting a Consume session from idle via the picker

- **WHEN** the user is on the home screen with no active session and taps Consume
- **THEN** the system opens the consume picker showing saved queue items grouped by subtype, plus a Freestyle option

#### Scenario: Starting a Create session from idle via the picker

- **WHEN** the user is on the home screen with no active session and taps Create
- **THEN** the system opens the create picker showing pending todos plus a Freestyle option

#### Scenario: Attempting to start while a session is active

- **WHEN** a session is already active and the user taps a Start button
- **THEN** the system SHALL NOT start a second session and SHALL surface a prompt asking whether to stop the current session first
