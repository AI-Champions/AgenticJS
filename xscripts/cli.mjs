#!/usr/bin/env node

import path from 'path';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import readline from 'readline';
import TelemetryDeck from '@telemetrydeck/sdk';
// NOTE: it will break on Windows if you don't use this import
// eslint-disable-next-line no-redeclare
import crypto from 'crypto';

// Mock telemetry instance for when users opt out
const mockTelemetry = {
  signal: () => {}, // No-op function
  // Add other methods as needed to match TelemetryDeck's interface
};

function generateProjectId() {
  const projectName = path.basename(process.cwd());
  const userHome = process.env.HOME || process.env.USERPROFILE || '';
  const machineId = crypto.createHash('md5').update(userHome).digest('hex');
  const uniqueString = `${projectName}-${machineId}`;

  return crypto.createHash('md5').update(uniqueString).digest('hex');
}

function initializeTelemetry(appID = '95BF7A3E-9D86-432D-9633-3526DD3A8977') {
  if (process.env.KAIBAN_TELEMETRY_OPT_OUT) {
    console.log(
      'Telemetry is disabled due to KAIBAN_TELEMETRY_OPT_OUT environment variable.'
    );
    return mockTelemetry;
  }

  const projectId = generateProjectId();

  return new TelemetryDeck({
    appID,
    clientUser: projectId,
    subtleCrypto: crypto.webcrypto.subtle,
  });
}

// Initialize telemetry at the beginning
const td = initializeTelemetry();

// Function to display a banner
function displayBanner() {
  console.log(
    chalk.cyan(
      figlet.textSync('Kaiban CLI', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  );
}

// Function to recursively find all *.kban.js files, excluding .kaiban and node_modules directories
function findTeamFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (!filePath.includes('.kaiban') && !filePath.includes('node_modules')) {
        // Exclude .kaiban and node_modules directories
        results = results.concat(findTeamFiles(filePath));
      }
    } else if (
      file.endsWith('.kban.js') &&
      !filePath.includes('.kaiban') &&
      !filePath.includes('node_modules')
    ) {
      results.push(filePath);
    }
  });

  return results;
}

// Function to copy a sample team.kban.js file to the user's project root if no team files are found
function copySampleTeamFile() {
  const sampleFilePath = path.resolve(
    '.kaiban',
    'src',
    'samples',
    'team.kban.js'
  );
  const destinationFilePath = path.resolve(process.cwd(), 'team.kban.js');

  if (fs.existsSync(sampleFilePath)) {
    fs.copyFileSync(sampleFilePath, destinationFilePath);
    console.log(
      chalk.green(
        'Sample team.kban.js file has been copied to the root of your project.'
      )
    );
  } else {
    console.error(
      chalk.red('Sample team.kban.js file not found inside .kaiban/samples.')
    );
  }
}

// Function to write the teams.js file inside `.kaiban`
function writeTeamsFile(teamFiles) {
  const teamsFilePath = path.resolve('.kaiban', 'src', 'teams.js');

  const fileContent = `
    // Auto-generated file
    ${teamFiles
      .map(
        (file, index) =>
          `import team${index + 1} from '${file.replace(/\\/g, '/')}';`
      )
      .join('\n')}

    const teams = [
      ${teamFiles.map((_, index) => `team${index + 1}`).join(',\n      ')}
    ];

    export default teams;
  `;

  fs.writeFileSync(teamsFilePath, fileContent, 'utf8');
  // console.log(chalk.blue(`teams.js file has been written successfully.`));
}

// Function to clone the kaibanjs-devtools repo if .kaiban folder doesn't exist
function cloneDevtoolsRepo() {
  const kaibanPath = path.resolve('.kaiban');

  if (!fs.existsSync(kaibanPath)) {
    const spinner = ora('Downloading kaibanjs-devtools...').start();
    try {
      execSync('npx degit kaiban-ai/kaibanjs-devtools#main .kaiban', {
        stdio: 'inherit',
      });
      spinner.succeed('kaibanjs-devtools downloaded successfully.');
    } catch (error) {
      spinner.fail('Failed to download kaibanjs-devtools.');
      console.error(chalk.red('Error:'), error);
      throw error;
    }

    console.log(chalk.yellow('Installing dependencies...'));
    execSync('npm install', { cwd: '.kaiban', stdio: 'inherit' });

    // Add .kaiban to .gitignore
    const gitignorePath = path.resolve('.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.kaiban')) {
        fs.appendFileSync(gitignorePath, '\n.kaiban\n');
        console.log(
          chalk.green('\n.kaiban has been added to your .gitignore.')
        );
      }
    } else {
      fs.writeFileSync(gitignorePath, '.kaiban\n');
      console.log(
        chalk.green('\n.gitignore file created and .kaiban has been added.')
      );
    }
  } else {
    console.log(
      chalk.magenta('.kaiban folder already exists, skipping download.')
    );
  }
}

// Function to load .env.* files in the root project
function loadEnvVariables() {
  const envDir = process.cwd(); // Root directory of the project
  const envFiles = fs
    .readdirSync(envDir)
    .filter((file) => file.startsWith('.env'));

  envFiles.forEach((file) => {
    console.log(chalk.blue(`Loading environment variables from ${file}`));
    dotenv.config({ path: path.join(envDir, file) });
  });
}

// Function to run Vite server using spawn
function runViteServer() {
  // const spinner = ora('Starting Vite server...').start();
  const viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: '.kaiban',
    stdio: 'inherit',
    shell: true,
  });

  viteProcess.on('close', (code) => {
    if (code === 0) {
      // spinner.succeed('Vite server stopped successfully.');
    } else {
      // spinner.fail(`Vite server exited with code ${code}`);
    }
  });

  // Handle CTRL+C to stop the Vite server
  process.on('SIGINT', () => {
    viteProcess.kill('SIGINT');
    // spinner.info('Vite server terminated.');
    process.exit();
  });
}

// Function to copy VITE environment variables to .kaiban/.env
function copyViteEnvVariables() {
  const envDir = process.cwd(); // Root directory of the project
  const envFiles = fs
    .readdirSync(envDir)
    .filter((file) => file.startsWith('.env'));
  const viteEnvFilePath = path.resolve('.kaiban', '.env');
  let viteEnvContent = '';

  envFiles.forEach((file) => {
    const envConfig = dotenv.parse(fs.readFileSync(path.join(envDir, file)));
    Object.keys(envConfig).forEach((key) => {
      if (key.startsWith('VITE')) {
        viteEnvContent += `${key}=${envConfig[key]}\n`;
      }
    });
  });

  fs.writeFileSync(viteEnvFilePath, viteEnvContent, 'utf8');

  if (viteEnvContent) {
    console.log(
      chalk.green(
        'All VITE environment variables have been copied to .kaiban/.env.'
      )
    );
  } else {
    console.log(
      chalk.yellow(
        '\n----------------------------------------------------------'
      )
    );
    console.log(chalk.yellow.bold('| Warning:\n'));
    console.log(chalk.yellow('| No VITE environment variables were found.\n'));
    console.log(
      chalk.yellow(
        '| Most likely, your agents and tools will need these variables.\n'
      )
    );
    console.log(
      chalk.yellow(
        '| Please check your .kban.js file to find what is needed.\n'
      )
    );
    console.log(chalk.yellow('| You can add the variables to the .env file'));
    console.log(chalk.yellow('| in your root directory.\n'));
    console.log(
      chalk.yellow('----------------------------------------------------------')
    );
  }
}

// Function to build the project inside the .kaiban folder
function buildKaibanProject() {
  const spinner = ora('Building the project...').start();
  try {
    execSync('npm run build', { cwd: '.kaiban', stdio: 'inherit' });
    spinner.succeed('Project built successfully.');
  } catch (error) {
    spinner.fail('Failed to build the project.');
    throw error;
  }
}

// Function to check if Vercel is installed globally and deploy
function deployToVercel() {
  // Warm message about API key security
  console.log(chalk.yellow.bold('Important Notice:'));
  console.log(
    chalk.yellow(
      '\nThe API keys used by your Agents and Tools in this project **VITE_MY_API_KEY** can be accessed by anyone with programming knowledge who has the deploy URL. This is perfectly acceptable for hustlers, people testing ideas quickly, or in scenarios like:\n'
    )
  );
  // console.log(chalk.yellow(''));
  console.log(chalk.yellow('  - Rapid prototyping'));
  console.log(chalk.yellow('  - MVPs (Minimum Viable Products)'));
  console.log(chalk.yellow('  - Hackathons'));
  console.log(chalk.yellow('  - Personal projects'));
  console.log(
    chalk.yellow(
      '  - Controlled environments (e.g., internal tools, sandbox testing)'
    )
  );

  console.log(
    chalk.yellow(
      '\nHowever, for production, we highly recommend securing your keys.'
    )
  );
  console.log(
    chalk.yellow(
      'For a more secure production setup, consider using a proxy. Learn more at:'
    )
  );
  console.log(
    chalk.blue.underline(
      '\nhttps://docs.kaibanjs.com/how-to/API%20Key%20Management\n'
    )
  );

  // Prompt user for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    chalk.cyan('Do you want to continue with the deployment? (yes/no): '),
    (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        const spinner = ora('Checking Vercel installation...').start();
        try {
          // Check if Vercel is installed globally
          execSync('vercel --version', { stdio: 'ignore' });
          spinner.succeed('Vercel is installed globally.');
        } catch {
          spinner.warn('Vercel is not installed globally. Installing now...');
          try {
            execSync('npm install -g vercel', { stdio: 'inherit' });
            spinner.succeed('Vercel has been installed globally.');
          } catch (installError) {
            spinner.fail('Failed to install Vercel globally.');
            console.error(chalk.red('Error installing Vercel:'), installError);
            rl.close();
            return;
          }
        }

        // Build the project before deploying
        buildKaibanProject();

        // Run npm run deploy inside the .kaiban folder
        spinner.start('Deploying with Vercel...');
        try {
          execSync('npm run deploy', { cwd: '.kaiban', stdio: 'inherit' });
          spinner.succeed('Deployment completed successfully.');
        } catch (deployError) {
          spinner.fail('Deployment failed.');
          console.error(chalk.red('Error during deployment:'), deployError);
        }
      } else {
        console.log(chalk.red('Deployment aborted by the user.'));
      }
      rl.close();
    }
  );
}

// Function to update package.json with Kaiban scripts
function updatePackageJson() {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');

  let packageJson;
  let spinner = ora('Updating package.json with Kaiban scripts...').start();

  if (!fs.existsSync(packageJsonPath)) {
    spinner.text = 'Creating a basic package.json...';
    packageJson = {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      description: 'A Kaiban project',
      scripts: {},
      keywords: ['kaiban'],
      author: '',
      license: 'ISC',
    };
    spinner.succeed('Created a basic package.json');
    spinner = ora('Adding Kaiban scripts...').start();
  } else {
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      spinner.fail('Failed to read package.json');
      console.error(chalk.red('Error reading package.json:'), error);
      return;
    }
  }

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts.kaiban = 'kaiban run';
  packageJson.scripts['kaiban:deploy'] = 'kaiban deploy';

  try {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    spinner.succeed('package.json updated successfully.');
  } catch (error) {
    spinner.fail('Failed to update package.json.');
    console.error(chalk.red('Error updating package.json:'), error);
  }
}

// Function to initialize the Kaiban project
async function initKaibanProject() {
  // Step 1: Load environment variables from .env.* files
  console.log(chalk.bold('Step 1: Loading environment variables...'));
  loadEnvVariables();
  console.log('\n');

  // Step 2: Clone the kaibanjs-devtools repo if not already cloned
  console.log(chalk.bold('Step 2: Setting up the development tools...'));
  cloneDevtoolsRepo();
  console.log('\n');

  // Step 3: Find all *.kban.js files
  console.log(chalk.bold('Step 3: Searching for team files...'));
  const teamFiles = findTeamFiles(process.cwd());

  // Step 4: If no team files are found, copy the sample file
  if (teamFiles.length === 0) {
    console.log(
      chalk.red(
        'No .kban.js files found. Copying a sample file to the project root...'
      )
    );
    copySampleTeamFile();
    teamFiles.push(path.resolve(process.cwd(), 'team.kban.js')); // Add the copied sample file to the list
  } else {
    console.log(chalk.green('Found the following team files:'));
    console.log(teamFiles.map((file) => `- ${chalk.cyan(file)}`).join('\n'));
  }
  console.log('\n');

  // Step 5: Write teams to `.kaiban/src/teams.js`
  writeTeamsFile(teamFiles);
  console.log('\n');

  // Step 6: Copy VITE environment variables to .kaiban/.env
  console.log(chalk.bold('Step 4: Copying VITE environment variables...'));
  copyViteEnvVariables();
  console.log('\n');

  // New Step 7: Update package.json with Kaiban scripts
  console.log(chalk.bold('Step 5: Updating package.json...'));
  updatePackageJson();
  console.log('\n');
}

// Function to run the Vite server
function runKaibanServer() {
  // Check if .kaiban folder exists
  if (!fs.existsSync(path.resolve('.kaiban'))) {
    console.log(
      chalk.red(
        'Error: .kaiban folder not found. Please run "npx kaibanjs@latest init" first.'
      )
    );
    process.exit(1);
  }

  // Run the Vite server inside `.kaiban` using spawn
  console.log(chalk.bold('Running the Vite server...'));
  runViteServer();
}

// Function to check if KaibanJS is installed
function isKaibanJSInstalled() {
  try {
    execSync('npm list kaibanjs', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Function to install KaibanJS
function installKaibanJS() {
  const spinner = ora('Installing KaibanJS and tools...').start();
  try {
    execSync('npm install kaibanjs @kaibanjs/tools --legacy-peer-deps', {
      stdio: 'inherit',
    });
    spinner.succeed('KaibanJS and tools installed successfully.');
  } catch (error) {
    spinner.fail('Failed to install KaibanJS and tools.');
    console.error(chalk.red('Error installing packages:'), error);
    process.exit(1);
  }
}

// Add this new function
function ensurePackageJson() {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    const spinner = ora('Creating package.json...').start();
    try {
      execSync('npm init -y', { stdio: 'ignore' });
      spinner.succeed('Created package.json');
    } catch (error) {
      spinner.fail('Failed to create package.json');
      console.error(chalk.red('Error creating package.json:'), error);
      process.exit(1);
    }
  }
}

// Main CLI flow
async function main() {
  // Display CLI banner for all commands
  displayBanner();

  const command = process.argv[2];

  if (command === 'init' || command === 'run') {
    // Ensure package.json exists
    ensurePackageJson();

    if (!isKaibanJSInstalled()) {
      console.log(
        chalk.yellow(
          'KaibanJS is not installed in this project. Installing now...'
        )
      );
      td.signal('install_kaibanjs');
      installKaibanJS();
    }

    if (command === 'init') {
      await initKaibanProject();
      td.signal('init_board');
//      runKaibanServer();
    } else {
      await initKaibanProject();
      td.signal('run_board');
      runKaibanServer();
    }
  } else if (command === 'deploy') {
    td.signal('deploy_board');
    deployToVercel();
  } else {
    console.log(
      chalk.red(
        'Invalid command. Use "init" to initialize, "run" to start the server, or "deploy" to deploy.'
      )
    );
  }
}

// Handle CTRL+C to stop the Vite server
process.on('SIGINT', () => {
  console.log(chalk.red('\nProcess terminated by the user.'));
  process.exit();
});

// Run the main function
main();
