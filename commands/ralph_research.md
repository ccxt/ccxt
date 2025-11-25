---
description: Research highest priority Linear ticket needing investigation
---

## PART I - IF A LINEAR TICKET IS MENTIONED

0c. use `linear` cli to fetch the selected item into thoughts with the ticket number - ./thoughts/shared/tickets/ENG-xxxx.md
0d. read the ticket and all comments to understand what research is needed and any previous attempts

## PART I - IF NO TICKET IS MENTIONED

0.  read .claude/commands/linear.md
0a. fetch the top 10 priority items from linear in status "research needed" using the MCP tools, noting all items in the `links` section
0b. select the highest priority SMALL or XS issue from the list (if no SMALL or XS issues exist, EXIT IMMEDIATELY and inform the user)
0c. use `linear` cli to fetch the selected item into thoughts with the ticket number - ./thoughts/shared/tickets/ENG-xxxx.md
0d. read the ticket and all comments to understand what research is needed and any previous attempts

## PART II - NEXT STEPS

think deeply

1. move the item to "research in progress" using the MCP tools
1a. read any linked documents in the `links` section to understand context
1b. if insufficient information to conduct research, add a comment asking for clarification and move back to "research needed"

think deeply about the research needs

2. conduct the research:
2a. read .claude/commands/research_codebase.md for guidance on effective codebase research
2b. if the linear comments suggest web research is needed, use WebSearch to research external solutions, APIs, or best practices
2c. search the codebase for relevant implementations and patterns
2d. examine existing similar features or related code
2e. identify technical constraints and opportunities
2f. Be unbiased - don't think too much about an ideal implementation plan, just document all related files and how the systems work today
2g. document findings in a new thoughts document: `thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md`
   - Format: `YYYY-MM-DD-ENG-XXXX-description.md` where:
     - YYYY-MM-DD is today's date
     - ENG-XXXX is the ticket number (omit if no ticket)
     - description is a brief kebab-case description of the research topic
   - Examples:
     - With ticket: `2025-01-08-ENG-1478-parent-child-tracking.md`
     - Without ticket: `2025-01-08-error-handling-patterns.md`

think deeply about the findings

3. synthesize research into actionable insights:
3a. summarize key findings and technical decisions
3b. identify potential implementation approaches
3c. note any risks or concerns discovered
3d. run `humanlayer thoughts sync` to save the research

4. update the ticket:
4a. attach the research document to the ticket using the MCP tools with proper link formatting
4b. add a comment summarizing the research outcomes
4c. move the item to "research in review" using the MCP tools

think deeply, use TodoWrite to track your tasks. When fetching from linear, get the top 10 items by priority but only work on ONE item - specifically the highest priority issue.

## PART III - When you're done

Print a message for the user (replace placeholders with actual values):

```
✅ Completed research for ENG-XXXX: [ticket title]

Research topic: [research topic description]

The research has been:

Created at thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md
Synced to thoughts repository
Attached to the Linear ticket
Ticket moved to "research in review" status

Key findings:
- [Major finding 1]
- [Major finding 2]
- [Major finding 3]

View the ticket: https://linear.app/humanlayer/issue/ENG-XXXX/[ticket-slug]
```
