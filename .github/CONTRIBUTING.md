# Contributing Guidelines

Thank you for contributing to **Korus**!  
This document explains how to work with the repository, follow the GitHub Flow, and open high-quality pull requests.

---

## 1. Workflow Overview

This project follows **[GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)**:

1. **Create a branch** from `main` based on an existing issue
2. **Make changes** and commit frequently
3. **Open a pull request (PR)** referencing that issue
4. **Request review**
5. **Merge into `main`** once approved
6. **Delete your branch** after merging

---

## 2. Branch Naming Convention

Each branch should start with the related **issue number**, followed by a short, descriptive name.

| Type          | Format                                        | Example                        |
| ------------- | --------------------------------------------- | ------------------------------ |
| Feature       | `<issue-number>-feature/<short-description>`  | `12-feature/auth-registration` |
| Bug fix       | `<issue-number>-fix/<short-description>`      | `34-fix/login-token-expiry`    |
| Documentation | `<issue-number>-docs/<short-description>`     | `41-docs/api-update`           |
| Refactor      | `<issue-number>-refactor/<short-description>` | `27-refactor/docker-structure` |
| Hotfix        | `<issue-number>-hotfix/<short-description>`   | `99-hotfix/email-verification` |

If no issue exists yet, **create one first** in GitHub Projects before starting the branch.  
This makes tracking and automation consistent.

---

## 3. Commit Message Style

Follow the **Conventional Commits** format:

**Types:**

- `feat` → new feature
- `fix` → bug fix
- `docs` → documentation changes
- `style` → formatting (no code logic changes)
- `refactor` → code restructure without feature change
- `test` → add or modify tests
- `chore` → maintenance tasks or dependencies

---

## 4. Development Environment

### Requirements

- Docker & Docker Compose
- Node.js 18+
- Python 3.12+

### Setup

```bash
# Start dev environment
docker compose -f docker-compose.dev.yml up --build
```

Or use the helper aliases from `alias.sh`:

```
dev-up-build
dev-logs
back-dev sh
front-dev sh
```

## 5. Code Style

- **Backend:** follow [PEP 8](https://peps.python.org/pep-0008/) — format with `black` or `autopep8`.
- **Frontend:** follow ESLint + Prettier formatting.
- Keep commits small and focused.
- Never commit secrets or `.env` files.

---

## 6. Pull Requests

When opening a PR:

- Reference the issue in the title and description  
  Example: `Closes #12 – Implement user registration API`
- Use the provided **Pull Request Korus**.
- Keep the PR focused on one topic or issue.
- Ensure all services build successfully before review.

---

## 7. Code Review Checklist

Before submitting a PR:

- [ ] Containers build and run successfully
- [ ] Code passes linting
- [ ] Tests pass (backend + frontend)
- [ ] No sensitive data committed
- [ ] Documentation updated if needed
