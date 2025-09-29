# Bootcamps API

## How to use?

1. Clone the Github Repo.
2. Run in the terminal the following:

```bash
npm install
```

3. To start the server in development mode run:

```bash
npm run dev
```

But before that you need to create your **.env** file. You can copy-paste the content from the file `.env.example` to the file `.env` and update with the correct values

## Available Scripts

| Script        | Description                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`         | Runs `src/server.ts` in watch mode using `tsx` for hot reload during development.                                                               |
| `build`       | Compiles the TypeScript project to `dist/` using `tsc`, producing reliable ESM output.                                                          |
| `start`       | Runs the compiled production build from `dist/server.js` with plain Node.                                                                       |
| `debug`       | Start the app in the debugging mode. Checkout the `Debugging` section in this repo `https://github.com/BZIvanov/Learning-Node.js` for more info |
| `seed`        | Seed data in the database                                                                                                                       |
| `seed:delete` | Delete seeded data in the database                                                                                                              |

## Registrations required

### MailTrap

MailTrap can be replaced with any other mail provider, but it is a good choice for this example API.

- Go to [MailTrap](https://mailtrap.io/) and create your free acount.
- Click **My Inbox** under **Sandbox**. Under the tab **SMTP** you can see **Credentials** section where you can find the credentials you need for the `.env` file.
- If sending mail with Postman, you can use any mail in the body and you will receive the mail in mailtrap.

## Supported routes

For the supported routes you can use, simply open the api.html file in the browser.

Supported authentication methods are jwt token in the header and cookies. Comment out the one you don't need.

## ESLint and Prettier

### TODO: Setup eslint

Install eslint and prettier as VS Code extensions.

## Architectural Decisions

### TypeScript Execution Tools

**Decision**: Use `tsx` for development instead of `ts-node-dev` or `ts-node`.

**Reason**: `tsx` provides reliable hot-reload support for modern ESM projects, works with `import.meta.url`, and supports CJS interop (createRequire). It avoids the runtime issues seen with `ts-node-dev`.
