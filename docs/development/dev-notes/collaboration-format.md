# 🤝 Agent Collaboration Format

## Purpose
This document defines the standard format for Claude and Codex collaboration in the SYMFARMIA project.

## File Structure

### Individual Agent Logs
- `claudo.md` - Claudio's (Claude) development log
- `codex.md` - Codex's development log

### Shared Documentation
- `diary.md` - Shared development diary with current status
- `shared-context.md` - Cross-agent context and handoffs

## Standard Formats

### 1. Agent Log Entry
```markdown
## [AGENT] Session [YYYY-MM-DD HH:MM]
**Context**: [What you're working on]
**Status**: [In Progress/Completed/Blocked]
**Duration**: [Time spent]
**Energy**: [High/Medium/Low]
**Result**: [What was accomplished]

### Details
[Technical details, code changes, etc.]

### For [OTHER_AGENT]:
[Handoff notes, requests, context]
```

### 2. Handoff Format
```markdown
## [AGENT] → [AGENT] Handoff [YYYY-MM-DD HH:MM]
**Status**: [Completed/In Progress/Blocked]
**Work Done**: [Brief summary]
**Next Steps**: [What needs to be done next]
**Files Changed**: [List of modified files]
**Notes**: [Any important context]
```

### 3. Status Update
```markdown
## Current Status (YYYY-MM-DD)
- **Active Branch**: [branch name]
- **Last Sync**: [sync status]
- **Next Priority**: [immediate task]

## Recent Work
- ✅ **Completed**: [task description]
- 🔄 **In Progress**: [task description]
- ❌ **Blocked**: [task description]
```

## Collaboration Rules

### 1. Communication
- **Be specific**: Include file names, line numbers, exact errors
- **Be concise**: Keep entries focused and actionable
- **Be honest**: Document both successes and failures

### 2. Handoffs
- **Always document**: What you did, what needs to be done next
- **Include context**: Why decisions were made
- **Test before handoff**: Ensure code compiles and runs

### 3. Conflict Resolution
- **Address conflicts within 1 hour**: Don't let merge conflicts linger
- **Document resolution**: How conflicts were resolved
- **Prevent future conflicts**: Discuss architecture decisions

### 4. Time Tracking
- **Document duration**: How long tasks actually took
- **Track energy levels**: Help understand productivity patterns
- **Note interruptions**: If work was interrupted or resumed

## Git Workflow

### Branch Management
```bash
# Before starting work
git pull --rebase origin dev

# After completing work
git add .
git commit -m "clear commit message"
git push origin dev
```

### Commit Messages
- **Format**: `[agent] action: description`
- **Examples**:
  - `[claudio] fix: resolve TypeScript errors in medical components`
  - `[codex] feat: implement modular architecture`
  - `[claudio] docs: update collaboration format`

## Emergency Protocols

### When Things Break
1. **Document the issue**: What happened, error messages
2. **Preserve working state**: Create backup branch if needed
3. **Notify other agent**: Update status immediately
4. **Fix or revert**: Either fix quickly or revert to working state

### When Blocked
1. **Document the blocker**: What's preventing progress
2. **Try alternatives**: Different approaches
3. **Request help**: Specific questions for other agent
4. **Work on other tasks**: Don't wait idle

## Quality Standards

### Code Quality
- **No broken builds**: Code must compile
- **Tests pass**: Run relevant tests before handoff
- **ESLint clean**: Address linting issues
- **TypeScript errors**: Zero tolerance for TS errors

### Documentation
- **Update CLAUDE.md**: Keep project instructions current
- **Comment complex code**: Explain non-obvious decisions
- **API documentation**: Document new endpoints
- **Component docs**: Explain component usage

## Success Metrics

### Productivity
- **Handoff speed**: How quickly work can be transferred
- **Context preservation**: How much context is maintained
- **Error reduction**: Fewer bugs and conflicts
- **Feature velocity**: Faster feature development

### Collaboration
- **Communication clarity**: Clear, actionable messages
- **Conflict frequency**: Fewer merge conflicts
- **Work distribution**: Balanced workload
- **Knowledge sharing**: Both agents understand the codebase

## Templates

### Quick Status Template
```markdown
## [AGENT] Quick Update [YYYY-MM-DD HH:MM]
**Working on**: [current task]
**Status**: [progress]
**ETA**: [estimated completion]
**Blockers**: [any issues]
```

### Bug Report Template
```markdown
## [AGENT] Bug Report [YYYY-MM-DD HH:MM]
**Issue**: [description]
**File**: [file path:line number]
**Error**: [error message]
**Steps**: [reproduction steps]
**Fix**: [proposed solution]
```

### Feature Request Template
```markdown
## [AGENT] Feature Request [YYYY-MM-DD HH:MM]
**Feature**: [description]
**Use Case**: [why needed]
**Acceptance Criteria**: [definition of done]
**Estimate**: [time estimate]
**Dependencies**: [what's needed first]
```

---

**Last Updated**: 2025-07-08  
**Version**: 1.0  
**Maintained by**: Claude (Anthropic) & Codex (OpenAI)