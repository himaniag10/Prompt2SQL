# Prompt2SQL Backend Foundation

This is the backend foundation for Prompt2SQL.

## Technologies Used
- Node.js
- Express
- TypeScript
- Winston (Logging)
- ESLint + Prettier

## Setup

First, install dependencies:
```bash
npm install
```

## Running the Application

Development mode (with hot-reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Project Structure

- \`src/modules\`: Contains all domain-specific features (auth, schema, prompt, etc.)
- \`src/config\`: Application configuration and environment variables
- \`src/routes\`: API route definitions
- \`src/controllers\`: Request handlers
- \`src/middleware\`: Custom Express middlewares
- \`src/services\`: Business logic
- \`src/models\`: Database models (Prisma)
- \`src/repositories\`: Data access layer
- \`src/validators\`: Request validators
