## Security packages

Short list of examples with the security packages.

- **MongosSanitize** - it will help with something like logging in with the below credentials

```javascript
{
  "email": {"$gt": ""},
  "password": "12345678"
}
```

- **XSS Clean** - it will help if we have in the data some scripts by escaping some of the characters

```javascript
{
  "name": "Some title <script>alert(1)</script>",
  "description": "some description",
}
```
