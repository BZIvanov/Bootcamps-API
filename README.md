# 🎓 Bootcamps API

A learning-focused REST API that powers a fictional **bootcamp management platform** — where publishers can create bootcamps and courses, and users can explore and review them.

## 🏁 Getting Started

1. Clone the repository
2. Run in the terminal the following to install dependencies:

```bash
npm install
```

3. Configure environment variables

You need to create your **.env** file. You can copy-paste the content from the file `.env.example` to the file `.env` and update with your own values.

4. Run the server

Start the API in development mode with automatic reload:

```bash
npm run dev
```

## ≥ Available Scripts

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

## ⚟ 3rd Party Integrations

List with 3rd party integrations for which you will have to create an account to get the required credentials.

### MailTrap

To get your MailTrap credentials you will have to register an account.

MailTrap can be replaced with any other mail provider, but it is a good choice for this example API.

- Go to [MailTrap](https://mailtrap.io/) and create your free acount.
- Click **My Inbox** under **Sandbox**. Under the tab **SMTP** you can see **Credentials** section where you can find the credentials you need for the `.env` file.
- If sending mail with Postman, you can use any mail in the body and you will receive the mail in mailtrap.

## 📃 API Documentation

We provide interactive API documentation using Swagger/OpenAPI. You can explore all available endpoints, view request and response schemas, and test the API directly from your browser.

**Accessing the docs**

Once the server is running, open the following URL in your browser: `http://localhost:3100/api-docs`

## 🧭 Architectural Decisions

### TypeScript Execution Tools

**Decision**: Use `tsx` for development instead of `ts-node-dev` or `ts-node`.

**Reason**: `tsx` provides reliable hot-reload support for modern ESM projects, works with `import.meta.url`, and supports CJS interop (createRequire). It avoids the runtime issues seen with `ts-node-dev`.

### ODM Choice

**Decision**: Use `Mongoose` instead of `Prisma` for MongoDB integration.

**Reason**:
Mongoose provides a mature, battle-tested ODM specifically built for MongoDB, with robust schema enforcement, middleware support, population (relation-like features), and a rich ecosystem of plugins. Compared to Prisma’s still-evolving MongoDB support, Mongoose offers greater stability and deeper MongoDB-specific features, making it a stronger fit for production in a MongoDB-first architecture.

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

## 🗂️ Files and folders structure

### Project `src` Folder Overview

This section describes the responsibilities of each folder/file under `src/` and provides a template for modules.

| Folder        | Responsibility                   | Example                                              |
| ------------- | -------------------------------- | ---------------------------------------------------- |
| `config`      | App setup/configuration          | DB connection, logger, env                           |
| `constants`   | Shared constant values           | App-wide constants                                   |
| `middlewares` | Request/response flow logic      | Auth, error handler, validation                      |
| `modules`     | Domain-specific logic            | Models, services, controllers, validation, constants |
| `providers`   | External/infrastructure services | Mailer, S3, Redis, payment APIs                      |
| `routes`      | Versioned API routes             | v1/index.ts, module routes                           |
| `shared`      | Stateless reusable logic         | Validators, constants, utils, enums                  |
| `types`       | Global type definitions          | Express augmentations, global interfaces             |
| `utils`       | Generic helpers                  | String, date, response formatting                    |
| `app.ts`      | Application setup / Express init | Configure Express, middlewares, routes               |
| `server.ts`   | Server bootstrap                 | Start HTTP server, handle environment configs        |

### `src/modules/<module>` Folder Structure (Generic Template)

| File                     | Responsibility                                        |
| ------------------------ | ----------------------------------------------------- |
| `<module>.model.ts`      | Define the database schema/model                      |
| `<module>.service.ts`    | Business logic, CRUD operations                       |
| `<module>.controller.ts` | HTTP controllers, route handlers                      |
| `<module>.constants.ts`  | Module-specific constants (model names, enums)        |
| `<module>.validation.ts` | Input validation (Zod, Joi, etc.)                     |
| `<module>.route.ts`      | Express routes, connected to controller               |
| `<module>.types.ts`      | TypeScript interfaces, DTOs, or module-specific types |
| `index.ts`               | Barrel export for clean imports (optional)            |
