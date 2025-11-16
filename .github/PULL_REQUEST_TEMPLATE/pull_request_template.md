# Pull Request

## Summary
Provide a brief description of what this pull request does and why.

Example:
> Implements email verification flow for user registration.

---

## Related Issues
List any related issues or tasks that this PR addresses.

Example:
- Closes #42
- Relates to #35

---

## Changes
Describe the key technical or functional changes introduced by this PR.

- Added `/api/auth/verify/{token}` endpoint
- Implemented JWT-based token validation
- Updated frontend registration flow
- Added unit tests for `auth_router.py`

---

## Testing
Outline how this PR has been tested or how reviewers can verify it.

- [ ] Manual API test via Swagger
- [ ] Unit tests passed (`pytest`)
- [ ] Verified Docker build works
- [ ] Frontend form submission tested in browser

---

## Screenshots (optional)
If applicable, attach screenshots or short clips demonstrating UI or behavior changes.

---

## Checklist
Before submitting, confirm that all boxes are checked:

- [ ] Code compiles and runs locally
- [ ] Tests added or updated
- [ ] Documentation updated (README, Swagger, or comments)
- [ ] No sensitive data (passwords, secrets, API keys)
- [ ] PR title follows convention (`feat:`, `fix:`, `refactor:`, etc.)
