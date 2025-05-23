/**
 * Set up new saltcorn configuration
 * @category saltcorn-cli
 * @module commands/setup
 */
const { Command, Flags } = require("@oclif/core");
const {
  getConnectObject,
  configFilePath,
  configFileDir,
  defaultDataPath,
} = require("@saltcorn/data/db/connect");
const { is } = require("contractis");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer").default;
const tcpPortUsed = require("tcp-port-used");
const { spawnSync } = require("child_process");
const sudo = require("sudo");
const crypto = require("crypto");

/**
 * Generate password for user
 * @returns {string}
 */
// todo deduplicate code - the same function in User
const gen_password = () => {
  const s = is.str.generate().replace(" ", "");
  if (s.length > 7) return s;
  else return gen_password();
};
/**
 * Generate jwt secret
 * @returns {string}
 */
const genJwtSecret = () => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Ask for platform run mode (dev - run manually, server - run as system service)
 *
 * @returns {Promise<object>}
 */
const askDevServer = async () => {
  if (process.platform !== "linux") {
    console.log("Non-linux platform, continuing development-mode install");
    return "dev";
  }
  const responses = await inquirer.prompt([
    {
      name: "mode",
      message: "How will you run Saltcorn?",
      type: "list",
      choices: [
        {
          name: "Development mode. I will start Saltcorn when needed",
          value: "dev",
        },
        {
          name: "Server mode. Always run in background, with Postgres",
          value: "server",
        },
      ],
    },
  ]);
  return responses.mode;
};

/**
 * Unload module
 * @param {*} mod
 */
const unloadModule = (mod) => {
  var name = require.resolve(mod);
  delete require.cache[name];
};

/**
 * Set up platform run mode (dev - run manually, server - run as system service)
 * @returns {Promise<void>}
 */
const setupDevMode = async () => {
  const dbPath = path.join(defaultDataPath, "scdb.sqlite");
  await fs.promises.mkdir(defaultDataPath, { recursive: true });
  const session_secret = gen_password();
  const jwt_secret = genJwtSecret();
  await write_connection_config({
    sqlite_path: dbPath,
    session_secret,
    jwt_secret,
  });

  if (!fs.existsSync(dbPath)) {
    unloadModule("@saltcorn/data/db");
    unloadModule("@saltcorn/data/db/reset_schema");
    const reset = require("@saltcorn/data/db/reset_schema");
    await reset(true);
    console.log("\nDone. Run saltcorn by typing:\n\n  saltcorn serve\n");
  }
};

/**
 * Check for locally running database (ip 127.0.0.1, port 5432)
 *
 * @returns {Promise<void>}
 */
const check_db = async () => {
  const inUse = await tcpPortUsed.check(5432, "127.0.0.1");
  if (!inUse) {
    console.log("Local database not found.");
    const responses = await inquirer.prompt([
      {
        name: "whatnow",
        message: "How would you like to connect to a database?",
        type: "list",
        choices: [
          { name: "Install PostgreSQL locally", value: "install" },
          { name: "Connect to a an existing database", value: "connect" },
        ],
      },
    ]);
    if (responses.whatnow === "install") {
      await install_db();
    } else {
      await setup_connection_config();
    }
  } else {
    console.log("Found local database, how do I connect?");

    await setup_connection_config();
  }
};

/**
 * Execute Linux commands
 * @param {*} args
 * @returns {Promise<void>}
 */
const asyncSudo = (args) => {
  return new Promise(function (resolve, reject) {
    var child = sudo(args, { cachePassword: true });
    //var child = sudo(['ls'], {cachePassword: true})
    child.stdout.on("data", function (data) {
      console.log(data.toString());
    });
    child.stderr.on("data", function (data) {
      console.error(data.toString());
    });
    child.on("exit", function (data) {
      resolve();
    });
  });
};

/**
 * Execute Postgres commands
 * @param {*} args
 * @returns {Promise<void>}
 */
const asyncSudoPostgres = (args) => {
  return asyncSudo(["sudo", "-u", "postgres", ...args]);
};

/**
 * Ask for passworf
 * @param {string} for_who
 * @returns {Promise<string>}
 */
const get_password = async (for_who) => {
  const answers = await inquirer.prompt([
    {
      name: "password",
      message: `Set ${for_who} to [auto-generate]`,
      type: "password",
      mask: "*",
      default: "",
    },
  ]);

  let password = answers.password;
  if (!password) {
    password = gen_password();
    console.log(`Setting ${for_who} to:`, password);
    await inquirer.prompt([
      {
        name: "continue",
        message: "Press any key to continue...",
        type: "input",
      },
    ]);
  }
  return password;
};

/**
 * Install Database
 * @returns {Promise<void>}
 */
const install_db = async () => {
  await asyncSudo(["apt", "install", "-y", "postgresql", "postgresql-client"]);
  await asyncSudo(["service", "postgresql", "start"]);
  const user = process.env.USER;
  //const pgpass=await get_password("postgres")
  //await asyncSudo(['sudo', '-u', 'postgres', 'psql', '-U', 'postgres', '-d', 'postgres', '-c', `"alter user postgres with password '${pgpass}';"`])
  const scpass = await get_password(user + "'s database password");
  await asyncSudoPostgres([
    "psql",
    "-U",
    "postgres",
    "-c",
    `CREATE USER ${user} WITH CREATEDB PASSWORD '${scpass}';`,
  ]);
  spawnSync("createdb", ["saltcorn"], {
    stdio: "inherit",
  });
  spawnSync("createdb", ["saltcorn_test"], {
    stdio: "inherit",
  });
  await asyncSudoPostgres([
    "psql",
    "-U",
    "postgres",
    "-d",
    "saltcorn",
    "-c",
    `ALTER SCHEMA public OWNER TO ${user};`,
  ]);
  await asyncSudoPostgres([
    "psql",
    "-U",
    "postgres",
    "-d",
    "saltcorn_test",
    "-c",
    `ALTER SCHEMA public OWNER TO ${user};`,
  ]);
  const session_secret = await get_password("session secret");
  const jwt_secret = genJwtSecret();
  await write_connection_config({
    host: "localhost",
    port: 5432,
    database: "saltcorn",
    user,
    password: scpass,
    session_secret,
    jwt_secret,
    multi_tenant: false,
  });
};

/**
 * Ask for Database parameters
 * @returns {Promise<object>}
 */
const prompt_connection = async () => {
  console.log("Enter database connection parameters");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "host",
      message: "Database host",
      default: "localhost",
    },
    {
      type: "input",
      name: "port",
      message: "Database port",
      default: "5432",
    },
    {
      type: "input",
      name: "database",
      message: "Database name",
      default: "saltcorn",
    },
    {
      type: "input",
      name: "user",
      message: "Database user",
      default: "saltcorn",
    },
    {
      type: "password",
      name: "password",
      message: "Database password",
      mask: "*",
      validate: (input) => (input ? true : "Password is required"),
    },
  ]);

  const session_secret = await get_password("session secret");
  const jwt_secret = genJwtSecret();
  return {
    host: answers.host || "localhost",
    port: answers.port || 5432,
    database: answers.database || "saltcorn",
    user: answers.user || "saltcorn",
    password: answers.password,
    session_secret,
    jwt_secret,
    multi_tenant: false,
  };
};

/**
 * Write platform config
 * @returns {Promise<void>}
 */
const setup_connection_config = async () => {
  const connobj = await prompt_connection();
  await write_connection_config(connobj);
};

/**
 *
 * @param {object} connobj
 * @returns {Promise<void>}
 */
const write_connection_config = async (connobj) => {
  await fs.promises.mkdir(configFileDir, { recursive: true });
  fs.writeFileSync(configFilePath, JSON.stringify(connobj), { mode: 0o600 });
};

/**
 * @returns {Promise<void>}
 */
const setup_connection = async () => {
  const connobj = getConnectObject();
  if (connobj) {
    // check if it works
    const db = require("@saltcorn/data/db");
    try {
      await db.query("select 1");
      console.log("I already know how to connect!");
    } catch (e) {
      console.log("Cannot connect to specified database. Error: ", e.message);
      await setup_connection_config();
      await db.changeConnection();
    }
  } else {
    console.log("No database specified");
    await check_db();
    const db = require("@saltcorn/data/db");
    await db.changeConnection();
  }
};

/**
 *
 * @param {object} db
 * @param {string} tblname
 * @returns {Promise<boolean>}
 */
const table_exists = async (db, tblname) => {
  const { rows } = await db.query(`SELECT EXISTS
    (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${tblname}'
    );`);
  return rows[0].exists;
};

/**
 * @returns {Promise<void>}
 */
const setup_schema = async () => {
  const db = require("@saltcorn/data/db");
  const ex_tables = await table_exists(db, "_sc_tables");
  const ex_fields = await table_exists(db, "_sc_fields");
  if (!(ex_fields && ex_tables)) {
    console.log("Installing schema");
    const reset = require("@saltcorn/data/db/reset_schema");
    await reset(true);
  } else console.log("Schema already present");
};

/**
 * @returns {Promise<void>}
 */
const setup_users = async () => {
  const User = require("@saltcorn/data/models/user");
  const hasUsers = await User.nonEmpty();
  if (!hasUsers) {
    console.log("No users found. Please create an admin user");
    const credentials = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Email address",
      },
      {
        type: "password",
        name: "password",
        message: "Password",
        mask: "*",
      },
    ]);

    await User.create({
      email: credentials.email,
      password: credentials.password,
      role_id: 1,
    });
  } else {
    console.log("Users already present");
  }
};

/**
 * SetupCommand Class
 * @extends oclif.Command
 * @category saltcorn-cli
 */
class SetupCommand extends Command {
  /**
   * @returns {Promise<void>}
   */
  async run() {
    console.log("Run setup");
    const mode = await askDevServer();
    if (mode == "server") {
      // check if i already know how to connect
      await setup_connection();
      // check if schema is live
      await setup_schema();
      //check if there are any users
      await setup_users();
      await require("@saltcorn/data/db").close();
    } else {
      await setupDevMode();
    }
  }
}

/**
 * @type {string}
 */
SetupCommand.description = `Set up a new system
...
This will attempt to install or connect a database, and set up a
configuration file
`;

/**
 * @type {object}
 */
SetupCommand.flags = {
  coverage: Flags.boolean({ char: "c", description: "Coverage" }),
};

module.exports = SetupCommand;
