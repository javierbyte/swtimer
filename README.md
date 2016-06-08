# SW Timer

Yey ~ better docs coming soon. Try it online! http://javierbyte.com:3000/

## Features.
* Easy creation and customization of new events:
![](/docs-assets/creator.png)

* Auto generates an admin URL where you can pause the timers, return to a previous state, or postpone the current team to the end. All this protected(ish) with a secret(ish) token.
![](/docs-assets/admin.png)

* Generates a public client page, where everyone can see the current state of the presentations.
![](/docs-assets/client.png)

* And all the clients are up to date! (and it's responsive).
![](/docs-assets/sync.png)

## Tech Stack.
* React
* Nodejs
* Socket.io

# Roadmap.
* Live chat.

# Installation.

For the client:
```
npm i
npm start
```

For the backend:
```
cd backend
npm i
node server.js
````

Once they are both running, you can go to `http://localhost:3000`.

Thanks ~