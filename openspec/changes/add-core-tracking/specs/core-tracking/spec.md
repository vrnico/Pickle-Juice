## ADDED Requirements

### Requirement: Start a tracking session

The system SHALL allow the user to start a tracking session by selecting a category (Consume or Create) and tapping Start. Only one session can be active at a time.

#### Scenario: Starting a Consume session from idle

- **WHEN** the user is on the home screen with no active session and taps the "Consume" Start button
- **THEN** the system begins a new session with category "consume", a start timestamp of now, and transitions the home screen to an active-session view displaying the running elapsed time

#### Scenario: Starting a Create session from idle

- **WHEN** the user is on the home screen with no active session and taps the "Create" Start button
- **THEN** the system begins a new session with category "create", a start timestamp of now, and transitions the home screen to an active-session view displaying the running elapsed time

#### Scenario: Attempting to start while a session is active

- **WHEN** a session is already active and the user taps a Start button
- **THEN** the system SHALL NOT start a second session and SHALL surface a prompt asking whether to stop the current session first

### Requirement: Stop the active session

The system SHALL allow the user to stop the active session, persisting it as a completed record.

#### Scenario: Stopping a session with non-zero duration

- **WHEN** a session is active and the user taps Stop after at least one second has elapsed
- **THEN** the system records an end timestamp of now, saves the session to local storage with category, start, end, and duration, and returns the home screen to the idle state

#### Scenario: Stopping a session under one second

- **WHEN** the user taps Stop less than one second after Start
- **THEN** the system discards the session without saving it and returns to idle, preventing accidental empty entries

### Requirement: Persist sessions locally

The system SHALL store all completed sessions in IndexedDB on the user's device and make them survive reloads, offline use, and PWA relaunches.

#### Scenario: Session survives a page reload

- **WHEN** the user completes a session and reloads the app
- **THEN** the session appears in the session list with its original category, timestamps, and duration

#### Scenario: Session is recorded while offline

- **WHEN** the user is offline and completes a session
- **THEN** the system saves it to IndexedDB successfully without any network requests and the session is visible immediately

### Requirement: Recover an interrupted session

The system SHALL detect sessions that were active when the app last closed and offer to recover or discard them.

#### Scenario: App reopened with a session still marked active

- **WHEN** the user reopens the app and an active session exists from a previous visit
- **THEN** the system prompts the user with two options: "Keep session running" (continues the timer using the original start timestamp) or "End now" (stops the session as of the current moment)

### Requirement: View the dashboard

The system SHALL display a dashboard showing the consume-vs-create ratio for today and for the last seven days, along with total minutes tracked in each category.

#### Scenario: Dashboard with data

- **WHEN** the user opens the dashboard and has at least one completed session today
- **THEN** the system displays a ratio visualization (e.g. a proportional bar), total minutes for Consume, total minutes for Create, and the ratio as a percentage split

#### Scenario: Dashboard with no data

- **WHEN** the user opens the dashboard and has zero completed sessions in the selected window
- **THEN** the system displays an empty state that invites the user to start their first session rather than rendering a broken chart

### Requirement: Browse session history

The system SHALL display a reverse-chronological list of all completed sessions grouped by day.

#### Scenario: Viewing the session list

- **WHEN** the user opens the History view
- **THEN** the system lists sessions newest first, grouped under date headings, each row showing category, duration, and start time

### Requirement: Edit a past session

The system SHALL allow the user to edit a completed session's category, start time, and end time.

#### Scenario: Correcting a mis-tagged session

- **WHEN** the user opens a session from history, changes its category from Consume to Create, and saves
- **THEN** the system updates the stored record and the dashboard recomputes to reflect the new category

#### Scenario: Editing produces an invalid duration

- **WHEN** the user edits a session so end time is earlier than start time
- **THEN** the system SHALL reject the save and display an inline validation error explaining end must be after start

### Requirement: Delete a past session

The system SHALL allow the user to delete a completed session with a confirmation step.

#### Scenario: Deleting a session

- **WHEN** the user swipes or taps delete on a session and confirms
- **THEN** the system removes the session from storage and the dashboard recomputes without it

### Requirement: Export sessions as CSV

The system SHALL allow the user to export all stored sessions as a CSV file so they retain ownership of their data.

#### Scenario: Exporting sessions

- **WHEN** the user taps Export in Settings
- **THEN** the system generates a CSV file with columns `id,category,start_iso,end_iso,duration_seconds,notes` covering every stored session and triggers a browser download named `picklejuice-export-<yyyy-mm-dd>.csv`

#### Scenario: Exporting with zero sessions

- **WHEN** the user taps Export with no stored sessions
- **THEN** the system SHALL NOT generate a file and SHALL surface a message explaining there is nothing to export

### Requirement: Install as a PWA

The system SHALL be installable as a Progressive Web App on iOS, Android, and desktop Chromium browsers.

#### Scenario: Installing on a supported browser

- **WHEN** the user visits the deployed site in a PWA-capable browser
- **THEN** the browser surfaces an install prompt (or Add to Home Screen flow) and once installed the app launches in a standalone window with the Pickle Juice icon and name

#### Scenario: Launching the installed PWA offline

- **WHEN** the user launches the installed PWA without a network connection
- **THEN** the app loads from its service worker cache and the home screen, timer, history, and dashboard are fully usable against local data
