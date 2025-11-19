/**
 * Template and Instruction Set constants for Taskable
 * These fragments enable AI-powered interactions with todos through Usable chat
 */

export const TASKABLE_VERSION = '1.0.0';

export const TEMPLATE_FRAGMENT = {
  title: 'Taskable Standard Template',
  summary: 'Template for creating standardized todo items in Taskable app',
  content: `# Taskable Todo Template

This template defines the standard structure for todo items created in the Taskable application.

## Template Structure

\`\`\`yaml
---
title: {{title}}
collection: {{collection}}
checked: false
---

{{content}}
\`\`\`

## Usage

When creating a new todo through Usable chat or API, use this template to ensure consistent formatting and tagging.

## Tag Structure

All todos must include these tags:
- \`app:taskable\` - Identifies the todo as part of Taskable
- \`collection:{name}\` - The collection/category (e.g., "work", "personal", "default")
- \`checked:{true|false}\` - Completion status
- \`version:${TASKABLE_VERSION}\` - Template version for future migrations

## Example

\`\`\`yaml
---
title: Fix authentication bug
collection: work
checked: false
---

Investigate and resolve the JWT token validation issue in the Usable API integration.
Steps:
1. Review JWT payload structure
2. Check audience claims
3. Test with different client configurations
\`\`\`
`,
  tags: ['app:taskable', 'type:taskable-template', `version:${TASKABLE_VERSION}`],
};

export const INSTRUCTION_SET_FRAGMENT = {
  title: 'Taskable Instruction Set',
  summary: 'AI instructions for managing Taskable todos through Usable chat',
  content: `# Taskable Todo Management Instructions

This instruction set enables AI agents in Usable chat to understand and manage Taskable todos.

## Overview

Taskable is a Google Keep-inspired todo application that stores each todo as a separate fragment in Usable. This enables semantic search and AI-powered task management.

## Todo Structure

Each todo is stored as a fragment with:
- **Title**: Short task description
- **Content**: Detailed notes or steps
- **Tags**: Structured metadata for filtering and organization

## Tag Schema

All Taskable todos use these tags:
1. \`app:taskable\` - Required identifier (always present)
2. \`collection:{name}\` - Category/collection name (e.g., "work", "personal", "default")
3. \`checked:{true|false}\` - Completion status
4. \`version:${TASKABLE_VERSION}\` - Template version

## Common User Queries

### List Tasks
**User**: "What tasks do I have?" or "Show my todos"
**Action**: Search for fragments with tag \`app:taskable\` and \`checked:false\`
**Response**: List all unchecked tasks, grouped by collection

### Filter by Collection
**User**: "Show my work tasks"
**Action**: Search for fragments with tags \`app:taskable\` AND \`collection:work\`
**Response**: List tasks in the work collection

### Mark as Complete
**User**: "Mark [task title] as done"
**Action**: Update fragment tags, replace \`checked:false\` with \`checked:true\`
**Response**: Confirm completion and optionally suggest related tasks

### Create Task
**User**: "Create a task to..."
**Action**: Create new fragment with:
- Title from user input
- Content from user input (optional)
- Tags: \`app:taskable\`, \`collection:default\`, \`checked:false\`, \`version:${TASKABLE_VERSION}\`
**Response**: Confirm creation with fragment ID

### Search Tasks
**User**: "Find tasks about [topic]"
**Action**: Semantic search in fragments with \`app:taskable\` tag
**Response**: List relevant tasks with excerpts

### Statistics
**User**: "How many tasks do I have?"
**Action**: Count fragments with \`app:taskable\` tag, grouped by status
**Response**: Summary (e.g., "You have 12 tasks: 8 pending, 4 completed")

## Important Rules

1. **Always include \`app:taskable\` tag** - This is the primary identifier
2. **Never delete tasks directly** - Update tag to \`checked:true\` instead
3. **Preserve version tags** - Maintain \`version:${TASKABLE_VERSION}\` for compatibility
4. **Default collection** - Use \`collection:default\` if user doesn't specify
5. **Case-insensitive collections** - Normalize collection names to lowercase

## Query Examples

\`\`\`typescript
// List all pending tasks
tags: ['app:taskable', 'checked:false']

// List completed work tasks
tags: ['app:taskable', 'collection:work', 'checked:true']

// All tasks (any status)
tags: ['app:taskable']
\`\`\`

## Error Handling

- If no tasks found: "You don't have any tasks yet. Want to create one?"
- If workspace not configured: "Please set up your Taskable workspace first at [app URL]"
- If search is ambiguous: Ask for clarification before taking action

## Integration

This instruction set works with:
- **Usable Chat**: Direct queries and commands
- **Taskable Web App**: Real-time sync
- **MCP Tools**: Programmatic access via \`list-memory-fragments\`, \`create-memory-fragment\`, \`update-memory-fragment\`
`,
  tags: ['app:taskable', 'type:taskable-instruction-set', `version:${TASKABLE_VERSION}`],
};

