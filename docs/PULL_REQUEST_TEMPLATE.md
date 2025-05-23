# PULL_REQUEST_TEMPLATE

## What is the purpose of this pull request?

- i.e. "Add user authentication"

## Why is this change necessary?

- i.e. "Without this change, users will not be able to log in to the application"

## How can we test and review this pull request?

- i.e. "Run the tests and ensure they pass, then check that a user can log in to the application"

## What are the next steps

- i.e. "Deploy to production and announce to users"

## Checklist

- You may wish to run through the checklist below to ensure that the pull request keeps up to the required standards. This is not exhaustive, and you should add / update any additional items that you think are relevant.

### Tests

- [ ] Does it meet all the requirements set out in the story?
- [ ] Are there tests that prove the fix is effective / feature works?
- [ ] Do tests focus on behaviour, not implementation details?
- [ ] Are test mocks restored, and does the test do what the description says?
- [ ] Are new and existing tests passing?

### Readability

- [ ] Documentation is accurate and concise, and has been updated (if appropriate)
- [ ] Do function names start with a verb? Is other naming clear and concise?
- [ ] Are there any other readability issues; abbreviations and complexity avoided?

### Code

- [ ] Are database migrations in a separate pull request?
- [ ] Are there any linting / formatting errors?
- [ ] Are controllers skinny and services fat?
- [ ] Is the change limited to only what the story requires?
- [ ] Are there any other code quality issues, such as the SOLID principles?

### Security & Performance

- [ ] Are security concerns addressed (e.g., input validation, data protection)?
- [ ] Have performance implications been considered (e.g., query optimization)?

### Additional Checks

- [ ] UI/UX: Does it meet accessibility standards and maintain consistency?
- [ ] DevOps: Any configuration or deployment documentation needed?
- [ ] Error handling is comprehensive and user-friendly
- [ ] Backward compatibility is maintained where necessary
