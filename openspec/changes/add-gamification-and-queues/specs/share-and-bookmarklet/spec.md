## ADDED Requirements

### Requirement: Register as a Web Share Target

The system SHALL declare a `share_target` entry in `manifest.webmanifest` so that an installed PWA appears in the OS share sheet on Android Chrome and other supporting browsers, accepting `title`, `text`, and `url` from the share payload.

#### Scenario: Sharing a YouTube link from Android Chrome

- **WHEN** the user is in another app on Android, taps Share on a YouTube video, and selects Pickle Juice from the share sheet
- **THEN** Pickle Juice opens at `/share` with the shared URL pre-filled in a "Add to queue" form

### Requirement: Handle a share-target landing route

The system SHALL provide a `/share` route that reads the `title`, `text`, and `url` query parameters and renders an "Add to queue" form pre-filled with those values, defaulted to the Leisure tag.

#### Scenario: Opening /share with a URL

- **WHEN** the user navigates to `/share?title=Foo&url=https://example.com`
- **THEN** the system displays a form with title "Foo", URL "https://example.com", tag preset to Leisure, and a Save button that creates a queue item and returns the user to the Queue screen

#### Scenario: Opening /share with no parameters

- **WHEN** the user navigates to `/share` with no query params
- **THEN** the system displays an empty Add-to-queue form, ready for manual entry

### Requirement: Provide a desktop bookmarklet

The system SHALL provide, in Settings, a draggable "Add to Pickle Juice" bookmarklet whose JavaScript opens the user's deployed Pickle Juice instance at `/share` with the current page's URL and title pre-filled.

#### Scenario: Using the bookmarklet

- **WHEN** the user has dragged the bookmarklet to their browser toolbar, navigates to a YouTube video, and clicks the bookmarklet
- **THEN** Pickle Juice opens in a new tab at `/share?title=<page title>&url=<page url>` and the Add-to-queue form appears pre-filled

#### Scenario: Bookmarklet hostname configuration

- **WHEN** the user views the bookmarklet code in Settings
- **THEN** the bookmarklet hardcodes the host of the current Pickle Juice deployment so it works against the user's chosen instance
