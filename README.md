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

- Go to [Mapquest]('https://developer.mapquest.com/') and create your free acount.
- navigate to **ManageKeys**, expand **My Application** and get _Consumer Key_ value, this is your GEOCODER_API_KEY.

2. MailTrap

- Go to [MailTrap]('https://mailtrap.io/) and create your free acount.
- navigate to **Settings** and under **SMTP** heading you will find your credentials. Host is your SMTP_HOST, Port is your SMTP_PORT, same for Username and Password
