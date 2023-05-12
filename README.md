# Angular Starter Project

This project is a starter project for using remult & angular that already has a menu, basic user management and other utilities.

To use in a new project:
```sh
npx degit biatechoff/kollel.git kollel
cd kollel
npm i
```

To run:
```sh
npm run dev
```

# Create an Heroku site and deploy to it
```sh
heroku apps:create 
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SESSION_SECRET=some-very-secret-key
git push heroku master 
heroku apps:open
```