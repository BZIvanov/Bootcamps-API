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

but before that you need to update your **.env** file.

## Environment variables

- NODE_ENV - environment, development by default
- PORT - port
- DB_PATH - connection string for MongoDB

- GEOCODER_PROVIDER - map provider (mapquest for this app)
- GEOCODER_API_KEY - geocoder api key (read below how to use)

- JWT_SECRET - jsonwebtoken secret

- SMTP_HOST - mail host (read below how to use)
- SMTP_PORT - mail port, default 2525
- SMTP_USERNAME - mail username
- SMTP_PASSWORD - mail password
- FROM_EMAIL - email sender email (free text)
- FROM_NAME - email sender name (free text)

## Registrations required

1. Mapquest.

- Go to [Mapquest](https://developer.mapquest.com/) and create your free acount.
- navigate to **ManageKeys**, expand **My Application** and get _Consumer Key_ value, this is your GEOCODER_API_KEY.

2. MailTrap

MailTrap can be replaced with any other mail provider, but it is a good choice for this example API.

- Go to [MailTrap](https://mailtrap.io/) and create your free acount.
- you will be redirected to **My Inbox** and under the tab **SMTP Settings** you can see **Integrations** dropdown menu. Select _Nodemailer_ and you will have your credentials ready to be copied.
- if sending mail with Postman, you can use any mail in the body and you will receive the mail in mailtrap.

## Supported routes

For the supported routes you can use, simply open the api.html file in the browser.

Supported authentication methods are jwt token in the header and cookies. Comment out the one you don't need.
