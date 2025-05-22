# Balanced Money

This is a personal project that I am undertaking to improve my ability as a software engineer. It is a service that i hope to use personally, to manage my personal finances.

## Inspiration

I used to work in personal financial advice and was inspired by one particular advisor who would provide an annual / semi / quarterly update to his clients in excel format - that i would prepare. This would be the basis of their meeting, additions (investments), subtractions (withdrawals, costs and fees) and the difference in the form of value and percentage change for that period of time presented in a simple table.

This was used to determine the growth / loss in a persons portfolio and compared to a predetermined well known index (aligned to the individuals attitude to risk). I would like to try and add something along those lines to this application.

This is not an application built for providing financial advice, but built to track what a person has and how it is doing, so that they are are equipped to make better financial decisions.

## Purpose

Improve a users net worth by making it easier for them to see where they are spending their money, and tracking the performance of their existing assets, so that they are are equipped to make better financial decisions.

## Getting Started

### Development

1. Clone the repository: `git clone https://github.com/JRRS1982/balanced.git`
2. Update the environment variables in the `.env.development` file
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server and visit <http://localhost:3000> OR `npm run docker:dev` to start the development server in a docker container and visit <http://localhost:3000> which is probably the better option.
5. You should then be able to navigate around the application and create a user / login using Auth0

## Technologies Used

- **Frontend**:
  - Next.js - React framework for frontend development.
  - Docker - Containerization solution.
- **Backend**:
  - Next.js - React framework for backend development.
  - Docker - Containerization solution.
  - PostgreSQL - The database used.

### Database

Postgres is used in all cases for the database in this application.

Make sure your environment variables are set correctly in the appropriate file, `.env.development`, `.env.test` or `.env.prod` see `.env.example` for more information.

#### Development Database

Both the development and testing database are hosted in separate docker containers, via the `db` service in the compose file. This allows for a consistent and platform agnostic environment for development and testing.

##### Running Development Migrations (Docker)

To build and run the containers:

```bash
npm run docker:dev:build
npm run docker:dev:up
```

Then run the migrations:

```bash
npm run docker:dev:db:migrate
```

And then rollback if necessary:

```bash
npm run docker:dev:db:rollback
```

Then stop and remove orphan containers and images after you have finished with them;

```bash
npm run docker:dev:down
```

##### Running Testing Migrations (Docker)

To build and run the containers:

```bash
npm run docker:test:build
npm run docker:test:up
```

Then run the migrations:

```bash
npm run docker:test:db:migrate
```

And then rollback if necessary:

```bash
npm run docker:test:db:rollback
```

Then stop and remove orphan containers and images after you have finished with them;

```bash
npm run docker:test:down
```

##### Running Production Migrations (RDS)

These commands will run on the production database, which should be running in RDS:

```bash
npm run db:migrate
```

And then rollback if necessary:

```bash
npm run db:rollback
```

##### Create Migrations

To create a migration file, run the following command:

```bash
npx knex migrate:make create_users_table
```

This will create a new migration file in the `migrations/` directory, like
`migrations/20250203120000_create_users_table.js`

To run or rollback a migration, run one of the following commands:

```bash
NODE_ENV=development npx knex migrate:latest
NODE_ENV=development npx knex migrate:rollback
NODE_ENV=production npx knex migrate:latest
NODE_ENV=production npx knex migrate:rollback
```

To create a seed file, run the following command:

```bash
npx knex seed:make seed_users
```

Which will create a file in `seeds/`, such as `seeds/seed_users.js`

After populating that file with data, to seed the database, run the following command:

```bash
NODE_ENV=development npx knex seed:run
NODE_ENV=production npx knex seed:run
```

### Features

Find detailed feature descriptions in [./docs/features.md](./docs/features.md)

### Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please open an issue or submit a pull request.

Thanks to <https://luqmanshaban.medium.com/creating-a-responsive-navbar-in-react-a-beginners-guide-creating-a-responsive-navbar-in-react-c454acaa55a> for some NavBar inspiration

### License

This project is licensed under the MIT License.
