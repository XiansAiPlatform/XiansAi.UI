#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the environment name and command from arguments or script name
let envName, command;

if (process.argv[2] && process.argv[3]) {
    // Both env and command provided: node script.js <env> <command>
    envName = process.argv[2];
    command = process.argv[3];
} else if (process.argv[2]) {
    // Only env provided: node script.js <env>
    envName = process.argv[2];
    // Auto-detect command from npm script name
    const npmScript = process.env.npm_lifecycle_event || '';
    command = npmScript.includes('build') ? 'build' : 'start';
} else {
    // No arguments provided
    envName = 'development';
    const npmScript = process.env.npm_lifecycle_event || '';
    command = npmScript.includes('build') ? 'build' : 'start';
}

// Construct the .env file path
const envFile = `.env.${envName}`;
const envPath = path.resolve(process.cwd(), envFile);

// Check if the .env file exists
if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file '${envFile}' not found!`);
    console.log(`Available .env files:`);
    
    // List available .env files
    const files = fs.readdirSync(process.cwd())
        .filter(file => file.startsWith('.env'))
        .map(file => `  - ${file.replace('.env.', '')}`)
        .join('\n');
    
    console.log(files || '  - No .env files found');
    console.log(`\nUsage examples:`);
    console.log(`  npm run start:env <environment>`);
    console.log(`  npm run build:env <environment>`);
    console.log(`  npm run start:env parkly`);
    console.log(`  npm run build:env production`);
    process.exit(1);
}

console.log(`🚀 Loading environment from: ${envFile}`);
console.log(`📦 Running command: craco ${command}`);

// Run the command with the specified .env file
const child = spawn('npx', ['dotenv', '-e', envFile, 'craco', command], {
    stdio: 'inherit',
    shell: true
});

child.on('close', (code) => {
    process.exit(code);
}); 