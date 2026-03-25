{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "build": "prisma generate",
    "migrate:deploy": "prisma migrate deploy",
    "deploy:commands": "node src/deploy/register-commands.js"
  }
}