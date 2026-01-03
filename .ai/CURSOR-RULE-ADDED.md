# Cursor Rule Added: Automated Error Reporting

**Date**: 2025-12-31  
**Status**: ✅ Rule added to `.cursorrules`

---

## Rule Added

### Section: Automated Error Reporting

Added comprehensive rules for automated error monitoring and fixing:

1. **Sentry Error Monitoring**
   - Check for unresolved errors at session start
   - Query endpoint: `/api/agent/errors?status=unresolved`
   - Fix critical errors immediately
   - Mark errors as resolved after fixing

2. **Error Priority**
   - Critical: Fix immediately
   - Important: Fix soon
   - Low Priority: Fix when convenient

3. **Error Reporting Workflow**
   - Query → Analyze → Fix → Verify → Mark Resolved → Document

4. **Critical Rules**
   - Always check for errors before new work
   - Prioritize critical errors over features
   - Verify fixes before marking resolved
   - Never ignore errors

---

## Location in Rules

- Added after "Clarification vs. Assumptions" section
- Before "Critical Workflow Reminders" section
- Also added to workflow reminders (#11)

---

**Rule is now active!** The agent will automatically check for and fix errors.
