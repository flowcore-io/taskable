/**
 * Template and Instruction Set constants for Taskable
 * These fragments enable AI-powered interactions with todos through Usable chat
 */

export const TASKABLE_VERSION = '2.0.0';

export const TEMPLATE_FRAGMENT = {
  title: 'Taskable Standard Template',
  summary: 'Template for creating standardized todo cards in Taskable app',
  content: `# Taskable Card Template (v2.0)

This template defines the standard structure for todo cards in the Taskable application.

## Card Structure

Each card is a fragment with:
- **Title**: Card title (e.g., "Shopping List", "Project Tasks")
- **Content**: JSON array of checkable items
- **Summary**: Optional card summary/description
- **Tags**: \`app:taskable\`, \`collection:{name}\`, \`version:${TASKABLE_VERSION}\`

## Content Format (JSON Array)

\`\`\`json
[
  {
    "id": "uuid-1",
    "text": "Item text",
    "checked": false,
    "description": "Optional detailed description",
    "links": [],
    "attachments": [],
    "subTasks": []
  }
]
\`\`\`

### Item Fields
- **id** (required): UUID for the item
- **text** (required): Item text/title
- **checked** (required): Boolean completion status
- **description** (optional): Detailed description (max 5,000 chars)
- **links** (optional): Array of {id, url, title} objects (max 20)
- **attachments** (optional): Array of {id, fileId, fileName, mimeType, fileSize} (max 5 images)
- **subTasks** (optional): Array of {id, text, checked} objects (max 50)

## Tag Structure

All cards must include:
- \`app:taskable\` - App identifier (required)
- \`collection:{name}\` - Collection/category (e.g., "default", "work", "personal")
- \`version:${TASKABLE_VERSION}\` - Template version

## Examples

### Simple Card (Shopping List)
\`\`\`json
{
  "title": "Shopping List",
  "summary": "Grocery items for the week",
  "content": "[{\\"id\\":\\"uuid-1\\",\\"text\\":\\"Buy milk\\",\\"checked\\":false},{\\"id\\":\\"uuid-2\\",\\"text\\":\\"Buy eggs\\",\\"checked\\":false},{\\"id\\":\\"uuid-3\\",\\"text\\":\\"Buy bread\\",\\"checked\\":true}]",
  "tags": ["app:taskable", "collection:personal", "version:${TASKABLE_VERSION}"]
}
\`\`\`

### Enhanced Card (Work Tasks)
\`\`\`json
{
  "title": "Q4 Project Tasks",
  "summary": "Tasks for the Q4 launch",
  "content": "[{\\"id\\":\\"uuid-1\\",\\"text\\":\\"Review API documentation\\",\\"checked\\":false,\\"description\\":\\"Check for completeness and accuracy\\",\\"links\\":[{\\"id\\":\\"link-1\\",\\"url\\":\\"https://docs.example.com\\",\\"title\\":\\"API Docs\\"}],\\"subTasks\\":[{\\"id\\":\\"sub-1\\",\\"text\\":\\"Introduction section\\",\\"checked\\":true},{\\"id\\":\\"sub-2\\",\\"text\\":\\"Authentication guide\\",\\"checked\\":false}]}]",
  "tags": ["app:taskable", "collection:work", "version:${TASKABLE_VERSION}"]
}
\`\`\`

## Important Notes

1. **One Card = Multiple Items**: Each card can contain many checkable items (Google Keep style)
2. **UUID Generation**: Always use proper UUIDs for id fields
3. **JSON Serialization**: Content must be valid JSON (escape quotes properly)
4. **Collections**: Use lowercase, no spaces (e.g., "work" not "Work Tasks")
`,
  tags: ['app:taskable', 'type:taskable-template', `version:${TASKABLE_VERSION}`],
};

export const INSTRUCTION_SET_FRAGMENT = {
  title: 'Taskable Instruction Set',
  summary: 'AI instructions for managing Taskable cards through Usable chat',
  content: `# Taskable Card Management Instructions (v2.0)

This instruction set enables AI agents in Usable chat to understand and manage Taskable cards.

## Overview

Taskable is a Google Keep-inspired todo application where each **card** contains multiple **checkable items**. Cards are stored as fragments in Usable with JSON array content.

## Card Structure

Each card is a fragment with:
- **Title**: Card title (e.g., "Shopping List", "Project Tasks")
- **Content**: JSON array of items: \`[{id, text, checked, description?, links?, attachments?, subTasks?}]\`
- **Summary**: Optional card description
- **Tags**: \`['app:taskable', 'collection:{name}', 'version:2.0.0']\`

## Item Structure

Each item within a card has:
- \`id\` (string): UUID for the item
- \`text\` (string): Item text/title
- \`checked\` (boolean): Completion status
- \`description\` (optional string): Detailed description
- \`links\` (optional array): External links
- \`attachments\` (optional array): File attachments
- \`subTasks\` (optional array): Nested sub-tasks

## Common User Queries

### 1. List All Cards
**User**: "What cards do I have?" or "Show my todos"
**Action**: Search for fragments with tag \`app:taskable\`
**Response**: List all cards with their titles and item counts
**Example**:
\`\`\`
You have 3 cards:
1. Shopping List (5 items, 2 completed)
2. Work Tasks (8 items, 3 completed)
3. Christmas List (7 items, 0 completed)
\`\`\`

### 2. View Card Contents
**User**: "Show me the Shopping List" or "What's in my work tasks?"
**Action**: Search for card by title, parse content JSON
**Response**: List all items in the card with their checked status
**Example**:
\`\`\`
Shopping List (2 of 5 completed):
☐ Buy milk
☐ Buy eggs
☑ Buy bread
☐ Buy cheese
☐ Buy tomatoes
\`\`\`

### 3. Add Items - WITHOUT Specifying Card
**User**: "Add buy milk" or "Add task: review PR"
**Action**: 
1. List existing cards in the user's workspace
2. Ask which card to add to, or offer to create a new card
**Response**:
\`\`\`
I can add "buy milk" to one of these existing cards:
1. Shopping List (5 items)
2. Grocery TODO (3 items)

Or I can create a new card. Which would you prefer?
\`\`\`

### 4. Add Items - WITH Specified Card
**User**: "Add buy milk to Shopping List" or "Add review PR to Work Tasks"
**Action**: 
1. Find card by title (case-insensitive, fuzzy match)
2. Parse existing items from content JSON
3. Generate new UUID for the item
4. Add new item: \`{id: "uuid", text: "buy milk", checked: false}\`
5. Update fragment with new JSON content
**Response**: Confirm addition with item count

### 5. Add Multiple Items at Once
**User**: "Add to Shopping List: milk, eggs, bread, cheese" or "Add these to Work Tasks:\\n- Review PR\\n- Update docs\\n- Fix bug"
**Action**:
1. Find the card by title
2. Parse the list (comma-separated or newline-separated)
3. Generate UUIDs for each item
4. Add all items to the card's content JSON
5. Update fragment once with all new items
**Response**: 
\`\`\`
Added 4 items to Shopping List:
☐ milk
☐ eggs
☐ bread
☐ cheese

Shopping List now has 9 items (2 completed).
\`\`\`

### 6. Create New Card - WITHOUT Specifying Collection
**User**: "Create a card called Birthday Party" or "Make a new list for vacation planning"
**Action**:
1. Ask which collection to put it in
**Response**:
\`\`\`
I'll create a card called "Birthday Party".

Which collection should I put it in?
1. Personal (12 cards)
2. Work (8 cards)
3. Default (3 cards)

Or would you like to create a new collection?
\`\`\`

### 7. Create New Card - WITH Collection
**User**: "Create a personal card called Birthday Party" or "Add a work card for Q1 planning"
**Action**:
1. Create fragment with title and empty items array: \`[]\`
2. Set tags: \`['app:taskable', 'collection:personal', 'version:2.0.0']\`
3. User can add items afterward
**Response**: Confirm creation and prompt to add items

### 8. Mark Items as Complete
**User**: "Mark buy milk as done in Shopping List" or "Complete review PR"
**Action**:
1. Find card by title (if specified) or search all cards
2. Find item by text (case-insensitive, fuzzy match)
3. Update item's \`checked\` field to \`true\`
4. Update fragment with modified JSON content
**Response**: Confirm completion with progress

### 9. Uncheck Items
**User**: "Uncheck buy milk" or "Mark buy eggs as not done"
**Action**: Same as #8 but set \`checked: false\`
**Response**: Confirm change

### 10. Delete Items
**User**: "Remove buy milk from Shopping List" or "Delete the review PR task"
**Action**:
1. Find card and item
2. Remove item from JSON array
3. Update fragment
**Response**: Confirm deletion with updated item count

### 11. Search Across All Cards
**User**: "Find tasks about authentication" or "Which cards mention API?"
**Action**: Semantic search in fragments with \`app:taskable\` tag
**Response**: List matching cards and items

### 12. Statistics
**User**: "How many items do I have?" or "What's my progress?"
**Action**: 
1. Fetch all cards with \`app:taskable\` tag
2. Parse content JSON from each
3. Count total items, completed items, and cards
**Response**:
\`\`\`
You have 3 cards with 20 total items:
- 7 completed (35%)
- 13 pending

By collection:
- Personal: 12 items (5 completed)
- Work: 8 items (2 completed)
\`\`\`

## Important Rules

### Card Creation
1. **Always include \`app:taskable\` tag** - Required identifier
2. **Always include collection** - Use \`collection:default\` if not specified
3. **Always include version** - Use \`version:2.0.0\`
4. **Empty cards OK** - Can create card with \`[]\` items, user adds later
5. **Normalize collections** - Lowercase, no spaces (e.g., "work" not "Work Tasks")

### Item Management
1. **Generate UUIDs** - Use proper UUID format for all item IDs
2. **Preserve existing items** - When adding/updating, keep other items intact
3. **Valid JSON** - Always produce valid JSON for content field
4. **Fuzzy matching** - Be flexible with item text matching
5. **Confirm ambiguous** - If multiple matches, ask user to clarify

### Interactive Behavior
1. **Ask when unclear** - Card not specified? Ask which one or offer to create
2. **Suggest cards** - When adding items, show existing similar cards
3. **Confirm collections** - Ask which collection for new cards
4. **Show progress** - Always show item counts and completion stats
5. **Batch operations** - Handle multiple items in one update

## MCP Tool Usage

### Get Template for Reference
\`\`\`typescript
get-memory-fragment-content({
  fragmentId: "<TEMPLATE_FRAGMENT_ID>" // See configuration above
})
// Use this to understand the card structure and format
\`\`\`

### List Cards
\`\`\`typescript
list-memory-fragments({
  workspaceId: "<USER_WORKSPACE_ID>", // From user context
  query: "status = 'active'",
  tags: ["app:taskable"]
})
\`\`\`

### Get Card Content
\`\`\`typescript
get-memory-fragment-content({
  fragmentId: "card-fragment-id"
})
// Parse content field as JSON to get items array
\`\`\`

### Create Card
\`\`\`typescript
create-memory-fragment({
  workspaceId: "<USER_WORKSPACE_ID>", // From user context
  fragmentTypeId: "<CARDS_FRAGMENT_TYPE_ID>", // See configuration above - REQUIRED
  title: "Card Title",
  content: JSON.stringify([]), // Empty initially, or with items
  summary: "Optional description",
  tags: ["app:taskable", "collection:personal", "version:2.0.0"]
})
\`\`\`

**CRITICAL**: Always use the Cards Fragment Type ID from the configuration above when creating cards. Do NOT use any other fragment type.

### Update Card (Add/Modify Items)
\`\`\`typescript
update-memory-fragment({
  fragmentId: "card-fragment-id",
  content: JSON.stringify([
    {id: "uuid-1", text: "Item 1", checked: false},
    {id: "uuid-2", text: "Item 2", checked: true},
    // ... rest of items
  ])
})
\`\`\`

## Error Handling

- **No cards found**: "You don't have any cards yet. Want to create one?"
- **Card not specified**: "Which card should I add this to? [list options]"
- **Multiple matches**: "I found 2 cards with similar names. Which one? [list]"
- **Invalid collection**: "Collection 'xyz' doesn't exist. Create it? Or use: [list existing]"
- **Empty item**: "Item text cannot be empty. What should I add?"

## Examples

### Adding Multiple Items
**User**: "Add to shopping list: milk, eggs, bread, cheese, butter"
**Response**: ✓ Finds "Shopping List" card → Parses 5 items → Generates UUIDs → Updates content → Confirms

### Creating Without Collection
**User**: "Create a card for vacation planning"
**Agent**: "I'll create 'Vacation Planning'. Which collection?\\n1. Personal (12 cards)\\n2. Work (8 cards)\\n3. Create new collection"
**User**: "Personal"
**Agent**: ✓ Creates card → Sets collection:personal → Confirms

### Adding Without Card Specified
**User**: "Add buy milk"
**Agent**: "I can add 'buy milk' to:\\n1. Shopping List (5 items)\\n2. Grocery TODO (3 items)\\n\\nOr create a new card?"
**User**: "1"
**Agent**: ✓ Adds to Shopping List → Confirms

## Integration

Works with:
- **Usable Chat**: Natural language commands
- **Taskable Web App**: Real-time sync via API
- **MCP Tools**: \`list-memory-fragments\`, \`create-memory-fragment\`, \`update-memory-fragment\`, \`get-memory-fragment-content\`
`,
  tags: ['app:taskable', 'type:taskable-instruction-set', `version:${TASKABLE_VERSION}`],
};
