# New brand

1. On GitHub, open this repository and choose **Use this template**. Create a new **private** repository. Do not fork if you are starting a brand. Forks are for contributing to the template.
2. Clone the new repository.
3. Initialize it. This resets the interview ledger and writes the name you supply as a draft, not as an approved rule.

```bash
npm install
npm run brand:init -- --name "Your brand" --slug your-brand --industry "TBD" --mascot false --gamification false --publish private --yes
```

English is the default (`--language en --languages en`). To offer the optional Persian (RTL) and Turkish locales, add `--languages en,fa,tr`.

4. Interview:

```bash
npm run brand:interview
```

5. Preview:

```bash
npm run docs:start
```

Profiles used by the examples:

```bash
npm run example:education
npm run example:b2b
```

Those commands write a temporary directory and do not modify this checkout.

`--mascot false` hides mascot docs and skips mascot questions. The catalog files stay in the repo so the module can be turned on later by answering `brand.mascot.enabled` with yes.

The template engine and the brand's answers live in one repo. Do not create a second Business OS repository.
