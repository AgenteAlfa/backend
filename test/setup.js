const { execSync } = require("child_process");
const { closePool } = require("../src/db/pool");
beforeAll(() => {
    execSync(
        "node -r dotenv/config src/db/init.js",
        {
            stdio: "inherit",
            env: {
                ...process.env,
                DOTENV_CONFIG_PATH: ".env.test"
            }
        }
    );
});

afterAll(async () => {
    await closePool();
});
