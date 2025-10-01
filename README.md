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
| `format`      | Format the codebase with Prettier                                                                                                               |
| `lint`        | Run ESLint to check the codebase for issues                                                                                                     |
| `lint:fix`    | Run ESLint with `--fix` to automatically fix problems where possible                                                                            |

## 3rd Party Integrations

List with 3rd party integrations for which you will have to create an account to get the required credentials.

### MailTrap

To get your MailTrap credentials you will have to register an account.

MailTrap can be replaced with any other mail provider, but it is a good choice for this example API.

- Go to [MailTrap](https://mailtrap.io/) and create your free acount.
- Click **My Inbox** under **Sandbox**. Under the tab **SMTP** you can see **Credentials** section where you can find the credentials you need for the `.env` file.
- If sending mail with Postman, you can use any mail in the body and you will receive the mail in mailtrap.

## API Documentation

We provide interactive API documentation using Swagger/OpenAPI. You can explore all available endpoints, view request and response schemas, and test the API directly from your browser.

**Accessing the docs**

Once the server is running, open the following URL in your browser: `http://localhost:3100/api-docs`

## Architectural Decisions

### TypeScript Execution Tools

**Decision**: Use `tsx` for development instead of `ts-node-dev` or `ts-node`.

**Reason**: `tsx` provides reliable hot-reload support for modern ESM projects, works with `import.meta.url`, and supports CJS interop (createRequire). It avoids the runtime issues seen with `ts-node-dev`.

### User Authentication Responsibilities

**Decision**: Split responsibilities between the schema and the auth service.

- **Schema (persistence-level responsibilities)**
  - `userSchema.pre('save')`: ensures passwords are always hashed before being persisted.
  - `getResetPasswordToken`: mutates the user document with reset token and expiry values.

- **Auth Service (business logic responsibilities)**
  - `generateJwtToken`: issues JWT tokens for authenticated users.
  - `comparePassword`: validates a provided password against the stored hash.

**Reason**:  
Persistence-related logic stays on the schema to enforce data integrity at the model layer, while business logic (token generation and password comparison) is placed in the service for better separation of concerns, testability, and maintainability.
