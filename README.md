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

| Script                | Description                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start`           | Start the app in production mode                                                                                                                |
| `npm run dev`         | Start the app in development mode                                                                                                               |
| `npm run debug`       | Start the app in the debugging mode. Checkout the `Debugging` section in this repo `https://github.com/BZIvanov/Learning-Node.js` for more info |
| `npm run seed-data`   | Seed data in the database                                                                                                                       |
| `npm run delete-data` | Delete seeded data in the database                                                                                                              |

## Environment variables

- NODE_ENV - environment, development by default
- PORT - port
- DB_PATH - connection string for MongoDB
- JWT_SECRET - jsonwebtoken secret
- SMTP_HOST - mail host (read below how to use)
- SMTP_PORT - mail port, default 2525
- SMTP_USERNAME - mail username
- SMTP_PASSWORD - mail password
- FROM_EMAIL - email sender email (free text)
- FROM_NAME - email sender name (free text)

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

Install eslint and prettier as VS Code extensions.
