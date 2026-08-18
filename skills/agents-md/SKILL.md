---
name: agents-md
description: This skills discovers all AGENTS.md files up the file tree. Use it when asked to load agents instructions from up the file tree.
---

# AGENTS.md Discovery


## Workflow

When starting work in a new repository:

1. **Walk up the tree**: From the current working directory, traverse parent directories upward and read every `AGENTS.md` file found, stopping at the filesystem root. This includes the current directory's `AGENTS.md`.
2. **Enumerate all files found**: Before doing anything else, output a numbered list of every `AGENTS.md` path found in the tree. Example: "AGENTS.md files found: 1. /path/to/AGENTS.md, 2. /path/to/parent/AGENTS.md"
3. **Apply all rules**: Follow every instruction found across all files. Produce output: "I loaded AGENTS.md file at <path> and I'm going to follow its instructions".
4. **Execute all initial steps**: If any discovered `AGENTS.md` instructs you to load additional skills or do other setup steps — DO THEM NOW, and print the output confirming that the step is done.

Repeat steps 1-4 looking for `.agents` directory in the tree upwards, load and make available all skills defined in discovered `.agents/skills` directories. For each loaded skill print "I found skill <name> in <path> and loaded it".

## Rule Precedence

- Read from nearest to farthest (current directory → parent → grandparent → ...)
- If rules conflict, the more specific (deeper) file takes precedence

## Guard

If you did not traverse parent directories in step 1, or you did not produce the enumeration in step 2, you have not executed this skill correctly. **Restart from step 1.** Do not proceed until both steps are verified complete.

## Strict Constraints

- **NEVER traverse sideways**: Do NOT read `AGENTS.md` from sibling directories. Only traverse upward through parent directories. Sibling repository instructions do not apply to the current repository.
- **Always follow**: Apply all discovered rules without exception
- **Report missing**: If a parent `AGENTS.md` is expected but missing, note it
- **No skipping**: If the local `AGENTS.md` is short or empty, that is not a reason to skip the walk-up. Always traverse the full tree.

## Example Hierarchy

```
~/Projects
├── AGENTS.md              (if exists - organization-level)
├── develop/
│   ├── AGENTS.md          (if exists - develop-level)
│   └── repos/
│       ├── AGENTS.md      (shared rules for all repos)
│       └── website/
│           └── AGENTS.md  (repo-specific)
├── other-project/
│   ├── AGENTS.md          (NEVER read - sibling project)
```

## Rule Categories

Parent `AGENTS.md` files may contain:

- Skill requirements
- Coding standards and workflows
- Testing requirements
- Documentation requirements
- Bugfix procedures
- Done criteria

Always check for and follow these before beginning any work.
