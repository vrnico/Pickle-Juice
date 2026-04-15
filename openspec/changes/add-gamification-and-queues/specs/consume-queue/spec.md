## ADDED Requirements

### Requirement: Save links to a Consume Queue

The system SHALL allow the user to save links to a Consume Queue, where each item carries a URL, a title, an optional description, a tag of `research` or `leisure`, and an optional `linkedTodoId` (only meaningful when tag is `research`).

#### Scenario: Adding a queue item from the Queue screen

- **WHEN** the user opens the Queue screen, taps "Add", fills in URL and title, picks the Leisure tag, and saves
- **THEN** the item appears at the top of the Leisure section of the queue

#### Scenario: Adding a Research item linked to a todo

- **WHEN** the user creates a Research-tagged item and links it to a pending todo
- **THEN** the item is stored with `tag = "research"` and `linkedTodoId` set to that todo's id

#### Scenario: Research item without a linked todo

- **WHEN** the user attempts to save a Research-tagged item with no linked todo
- **THEN** the system SHALL reject the save and require either a linked todo or a tag change to Leisure

### Requirement: Browse the queue grouped by tag

The system SHALL display queue items grouped under Research and Leisure headings, with newest items first within each group.

#### Scenario: Empty queue

- **WHEN** the user opens the Queue screen with no saved items
- **THEN** the system shows an empty state explaining that adding items here pre-tags consume sessions

### Requirement: Edit and delete queue items

The system SHALL allow the user to edit any field of a queue item (URL, title, description, tag, linked todo) or delete the item with confirmation.

#### Scenario: Editing a queue item

- **WHEN** the user opens an item, changes its tag from Leisure to Research, links it to a todo, and saves
- **THEN** the item moves to the Research group on the Queue screen

#### Scenario: Deleting a queue item

- **WHEN** the user deletes an item and confirms
- **THEN** the item is removed from the queue but historical sessions that referenced it remain unchanged with `linkedItemId` pointing to a now-missing item

### Requirement: Mark queue items as consumed

The system SHALL allow the user to mark a queue item as consumed, automatically when a consume session that referenced it ends successfully, or manually from the Queue screen.

#### Scenario: Auto-mark on session end

- **WHEN** a consume session linked to a queue item ends successfully (over the 1-second discard threshold)
- **THEN** the item's status changes to `consumed` and it visually shifts to a collapsed "Recently consumed" list at the bottom of its group

#### Scenario: Manual mark

- **WHEN** the user taps "Mark consumed" on a queue item
- **THEN** the item's status changes to `consumed` without affecting any session history
