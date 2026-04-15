## ADDED Requirements

### Requirement: Maintain a Time Bank ledger

The system SHALL maintain a Time Bank that records every credit (earned by Create) and debit (spent on Leisure consume, refunded on session edit/delete, or applied retroactively from research) as immutable ledger entries. The current balance SHALL be the sum of all entries.

#### Scenario: Bank balance is the sum of ledger entries

- **WHEN** the system computes the current bank balance
- **THEN** the system SHALL sum every entry in the ledger and treat the result as the authoritative balance

#### Scenario: Balance never lost on edit

- **WHEN** the user edits a past session's category, subtype, duration, or linked item
- **THEN** the system records compensating ledger entries that reverse the original entries and emits new ones reflecting the edited values, preserving auditability

### Requirement: Earn credit from Create sessions

The system SHALL credit the Time Bank when a Create session is saved, at the configured earn ratio (default 2 minutes leisure credit per minute created).

#### Scenario: Default earn ratio

- **WHEN** the user saves a 30-minute create session and the earn ratio is the default 2.0
- **THEN** the system records a +60 minute credit entry in the ledger

#### Scenario: Custom earn ratio

- **WHEN** the user has set the earn ratio to 1.5 and saves a 20-minute create session
- **THEN** the system records a +30 minute credit entry in the ledger

### Requirement: Debit credit during Leisure consume

The system SHALL debit the Time Bank one minute for every minute of an active or completed Leisure consume session.

#### Scenario: Debiting a completed leisure session

- **WHEN** the user completes a 15-minute leisure consume session
- **THEN** the system records a -15 minute debit entry in the ledger

#### Scenario: Live debit while session runs

- **WHEN** a leisure consume session is in progress
- **THEN** the displayed bank balance decreases continuously, computed as the prior balance minus elapsed seconds in the current session

### Requirement: Reverse and recompute on session edit or delete

The system SHALL reverse the original ledger effect and re-emit the new effect when a session is edited or deleted.

#### Scenario: Editing a leisure consume session's duration

- **WHEN** the user edits a leisure consume session from 10 minutes to 5 minutes
- **THEN** the system records a +10 minute compensating entry and a -5 minute new debit, leaving net effect -5

#### Scenario: Deleting a Create session

- **WHEN** the user deletes a 20-minute create session that previously earned 40 minutes of credit
- **THEN** the system records a -40 minute compensating entry, removing the credit

### Requirement: Grant a starter Time Bank balance

The system SHALL grant a one-time starter credit of 60 minutes when a user opens the app for the first time after v2 ships, so that fresh users can take their first leisure session without first creating.

#### Scenario: First open after install

- **WHEN** the user opens the app for the first time and the bank ledger is empty
- **THEN** the system records a +60 minute "Starter grant" entry

#### Scenario: Existing v1 user upgrading

- **WHEN** an existing user with v1 data opens v2 for the first time and has no prior bank ledger entries
- **THEN** the system records the +60 minute starter grant once and never repeats it

### Requirement: Configurable earn ratio and apply window

The system SHALL allow the user to configure the earn ratio (between 1.0 and 5.0) and the research apply window (in days, between 1 and 30) from Settings.

#### Scenario: Changing the earn ratio

- **WHEN** the user opens Settings and changes the earn ratio to 3.0
- **THEN** all subsequent Create sessions credit the bank at 3 minutes per minute created; previously recorded entries are not retroactively re-credited
