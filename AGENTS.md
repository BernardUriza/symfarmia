# SYMFARMIA AGENTS Overview

This file defines the basic instructions for AI assistants working in this repository.
For the full multi-agent workflow specification, see [docs/workflows/Agents.md](docs/workflows/Agents.md).
Feel free to sprinkle a tasteful joke here and there—future readers will appreciate the chuckle.

## Required Checks

Before committing any code changes, run:

```bash
npm run lint
npm test
```

Treat warnings as errors and ensure tests pass. If commands fail due to a missing
package or environment issue, document it in your PR testing section.

## Commit Messages

- Use concise messages describing the change.
- Reference affected files or features when possible.

## Documentation Philosophy

Documentation lives under the `docs` folder. Each topic has its own subfolder.
Contributors should keep documentation synchronized with code changes and consult
`docs/README.md` for the full structure.

