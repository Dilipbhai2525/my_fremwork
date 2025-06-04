const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer').default;

async function changeAppInfo() {
    try {
        // Read current package.json
        const packagePath = path.join(__dirname, '../package.json');
        const packageContent = await fs.readFile(packagePath, 'utf-8');
        let packageJson = JSON.parse(packageContent);

        // Get current app name and package name
        const currentAppName = packageJson.name;
        const currentVersion = packageJson.version;

        // Ask for new app name and package name
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'newAppName',
                message: `Current app name: ${currentAppName}\nEnter new app name:`,
                default: currentAppName
            },
            {
                type: 'input',
                name: 'newPackageName',
                message: `Current package name: ${currentAppName}\nEnter new package name:`,
                default: currentAppName
            }
        ]);

        // Update package.json
        packageJson.name = answers.newPackageName;
        
        // Write updated package.json
        await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');
        
        // Update package-lock.json
        const packageLockPath = path.join(__dirname, '../package-lock.json');
        const packageLockContent = await fs.readFile(packageLockPath, 'utf-8');
        let packageLockJson = JSON.parse(packageLockContent);
        packageLockJson.name = answers.newPackageName;
        await fs.writeFile(packageLockPath, JSON.stringify(packageLockJson, null, 2), 'utf-8');

        console.log('Successfully updated app information!');
        console.log(`New App Name: ${answers.newAppName}`);
        console.log(`New Package Name: ${answers.newPackageName}`);

    } catch (error) {
        console.error('Error updating app information:', error.message);
    }
}

// Run the function
changeAppInfo();
