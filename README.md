# Balanced Money

This is a personal project that I am undertaking to improve my ability as a software engineer. It is a service that i hope to use personally, to manage my personal finances.

## Inspiration

I used to work in personal financial advice and was inspired by one particular advisor who would provide an annual (sometimes semi-annual or quarterly) update to his clients in excel format. This would be the basis of their meeting, additions (investments), subtractions (withdrawals, costs and fees) and the difference in the form of value and percentage change for that period of time presented so simply provided the client with a clear picture of their financial health, which i think most people would find useful.

This was used to determine the growth / loss in a persons portfolio and compared to a predetermined well known index (aligned to the individuals attitude to risk). I would like to try and add something along those lines to this application.

This is not an application built for providing financial advice, but built to help equip users to make better financial decisions.

## Purpose

Improve a users decision making by making it easier for them to see where they are spending their money, and tracking the performance of their existing assets.

## Success Metrics

Users can register, login, and manage their financial data
Professional-looking financial reports (Balance Sheet, Budget, Investment Portfolio, Transactions)
Investment performance tracking against market indices
Automated monthly email reminders
Responsive design working across all devices
Successful deployment and operation on Raspberry Pi
Comprehensive test coverage and documentation

## Getting Started

### Development

1. Clone the repository: `git clone https://github.com/JRRS1982/balanced.git`
2. Install dependencies: `npm install` on the host machine to enable local development
3. Update the environment variables in the `.env.development` file if necessary
4. Run `npm run docker:dev:build` to build the development docker images
5. Run `npm run docker:dev:up` to start the development docker containers and visit <http://localhost:3000> to view the application running in a docker container

#### Pre-commit hooks

When you commit to the repository, the `./scripts/pre-commit.sh` script will ensure you are not committing any files that are not formatted or linted and ensure that the tests pass. It will also prevent you from committing to the master or main branch. It will run;

- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run test`

and stage the changes to files that were formatted or linted for you to commit if they are a standard type. This should help the development flow by 'failing fast'.

### Production

Initially i deployed this app to Vercel to get it running, but i have since moved to deploying it to a Raspberry Pi, as i found it more cost effective than AWS.

The deployment process is automated via GitHub Actions, which;

- runs the tests
- runs the type checker
- runs the formatter
- runs the linter
- builds the docker image
- pushes the docker image to Docker Hub
- deploys the docker image to the Raspberry Pi via blue / green deployment to ensure minimal downtime
- runs the application
- runs the clean-up

#### GitHub Actions Secrets Required for Production Deployment / Migrations

The following secrets must be configured in your GitHub repository:

##### Docker Hub (Image Registry)

- `DOCKERHUB_USERNAME`: Your Docker Hub username
  - Example: `jsmith82`
- `DOCKERHUB_TOKEN`: Docker Hub personal access token (NOT your password)
  - Example: `dckr_pat_1234567890abcdefghijklmnopqr`
  - Get from: [Docker Hub → Account Settings → Security → New Access Token](https://hub.docker.com/settings/security)

##### Raspberry Pi Access

- `PI_USERNAME`: SSH username on your Raspberry Pi
  - Example: `pi` or `jeremy-smith`
- `PI_SSH_HOSTNAME`: Cloudflare Tunnel hostname for SSH access
  - Example: `ssh.balanced.money`
  - This is the hostname protected by Cloudflare Access
- `SSH_PRIVATE_KEY`: Private SSH key for authenticating to your Pi
  - Example (full key content):

    ```text
    -----BEGIN OPENSSH PRIVATE KEY-----
    b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
    ... (many lines)
    -----END OPENSSH PRIVATE KEY-----
    ```

  - Generate with: `ssh-keygen -t ed25519 -C "github-actions-balanced"`

##### Cloudflare Access (Service Token)

- `CLOUDFLARE_ACCESS_CLIENT_ID`: Service token client ID
  - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
  - Get from: [Cloudflare Zero Trust → Access → Service Auth → Create Service Token](https://one.dash.cloudflare.com/)
- `CLOUDFLARE_ACCESS_CLIENT_SECRET`: Service token secret
  - Example: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7`
  - Only shown once when creating the service token

##### Database Configuration

- `DB_USER`: PostgreSQL database username
  - Example: `balanced_user`
- `DB_PASSWORD`: PostgreSQL database password (use strong, random password)
  - Example: `Xk9mP#4vL@2nQ!8wR$6tY`
  - Generate with: `openssl rand -base64 32`
- `DB_NAME`: PostgreSQL database name
  - Example: `balanced`
- `DATABASE_URL`: Full PostgreSQL connection string
  - Example: `postgresql://balanced_user:Xk9mP#4vL@2nQ!8wR$6tY@balanced_db_prod:5432/balanced`
  - Format: `postgresql://[DB_USER]:[DB_PASSWORD]@balanced_db_prod:5432/[DB_NAME]`

**To add these secrets:**

1. Go to your GitHub repository
2. Click on "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add each item above
4. Paste the exact value (no quotes or extra spaces)

### Code Deployment Workflow

```mermaid
%%{init: {'flowchart': {'wrap': true, 'htmlLabels': true}}}%%
flowchart TB
    %% Deployment Trigger
    trigger_deploy[Push to Master Branch]

    trigger_deploy --> lint

    subgraph "CI - Build & Test"
        lint[Lint, Typecheck, Format <br/> and Run Tests] --> meta
        meta["Generate Image Metadata <br/> and Tags"] --> build

        subgraph build[Build Docker Images]
            direction LR
            build_app[Build App Image] --> push_app[Push App]
            build_nginx[Build Nginx Image] --> push_nginx[Push Nginx]
            build_db[Build DB Image] --> push_db[Push DB]
            build_backup[Build Backup Image] --> push_backup[Push Backup]
        end

        push_app --> deploy
        push_nginx --> deploy
        push_db --> deploy
        push_backup --> deploy
    end

    subgraph "CD - To Raspberry Pi"
        deploy[Deploy Job Start] --> ssh[SSH via Cloudflare Tunnel]
        ssh --> pull[Use Images From Build]
        pull --> state["Detect Current Active <br/> (blue/green)"]
        state --> target[Start Target Env Container]
        target --> migrate[Run Prisma Migrations]
        migrate --> nginx_reload["Update nginx upstream <br/> & reload"]
        nginx_reload --> health["Health Check via nginx"]

        health{Healthy?}
        health -->|Yes| switch[Switch Traffic to New Env]
        health -->|No| rollback[Rollback to Previous Env]

        switch --> cleanup[Cleanup Old Containers]
        rollback --> cleanup
    end

    classDef cicd fill:#f9f,stroke:#333,stroke-width:2px
    classDef pi fill:#bbf,stroke:#333,stroke-width:2px
    class lint,test,meta,push_app,push_nginx,push_db,push_backup cicd
    class deploy,ssh,pull,state,target,migrate,nginx_reload,health,switch,rollback,cleanup pi
```

### Database Migrations Workflow

```mermaid
flowchart TB
    %% Migration Trigger
    trigger_migrations(Manual Trigger in <br/> Github Actions)

    trigger_migrations --> validate

    subgraph "Database Migrations"
        validate[Validate Migration Request] --> build_migrations
        build_migrations[Build Migrations Image] --> run_migrations
        run_migrations[Execute Migrations on Pi] --> clean_migrations
        clean_migrations[Clean Up Resources]
    end

    %% Database Runtime
    db_prod[(PostgreSQL Database)]

    run_migrations -.-> db_prod

    classDef migration fill:#afa,stroke:#333,stroke-width:2px
    classDef db fill:#ccf,stroke:#333,stroke-width:2px
    class validate,build_migrations,run_migrations,clean_migrations migration
    class db_prod db
```

### Production Runtime Architecture

```mermaid
flowchart TB
    %% Production System Components
    users([Internet Users]) --> Cloudflare[Cloudflare Edge Network]

    Cloudflare --> cloudflared[Cloudflared Agent]

    subgraph "Raspberry Pi Host"
        cloudflared --> nginx
        app_blue[Docker Service: App <br/> Port 3000]
        app_green[Docker Service: App <br/> Port 3001]

        nginx[Docker Service: <br/> Nginx Reverse Proxy] --> active{Select Active <br/> Port}

        active -->|Blue| app_blue
        active -->|Green| app_green

        app_blue -.-> db
        app_green -.-> db

        db[(Docker Volume: <br/> PostgreSQL Database)]
        backup[(Docker Volume: <br/> PostgreSQL Backup)]

        db -.-> backup
    end

    classDef container fill:#bbf,stroke:#333,stroke-width:2px
    classDef database fill:#ccf,stroke:#333,stroke-width:2px
    classDef proxy fill:#fbb,stroke:#333,stroke-width:2px
    classDef external fill:#ddd,stroke:#333,stroke-width:2px

    class app_blue,app_green container
    class db database
    class nginx proxy
    class backup,users external
```

## Technologies Used

- **Infrastructure**:
  - Docker - Containerization solution.
  - Nginx - Reverse proxy.
  - Husky - Git hooks.
  - Prettier - Code formatter.
  - ESLint - JavaScript linter.
  - Jest - Testing framework.
  - Cypress - End-to-end testing framework.
- **Frontend**:
  - Next.js - React framework for frontend development via client components.
  - TypeScript - Typed JavaScript.
  - Recharts - Charting library.
- **Backend**:
  - Next.js - React framework for backend development via server components.
  - PostgreSQL - The database used.
  - Prisma - Database client and migration tool.
- **CI/CD**:
  - GitHub Actions - Continuous Integration and Continuous Deployment.

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

### Contributing

Contributions are welcome! If you have suggestions for new features, improvements, or bug fixes, please open an issue or submit a pull request.

### License

This project is licensed under the MIT License.
