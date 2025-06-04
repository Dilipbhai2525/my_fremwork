const fs = require('fs').promises;
const path = require('path');
const inquirer = require('inquirer').default;

// List of common Android permissions
const androidPermissions = {
    'ACCESS_NETWORK_STATE': 'Access network state information',
    'ACCESS_WIFI_STATE': 'Access Wi-Fi state information',
    'BLUETOOTH': 'Access Bluetooth',
    'BLUETOOTH_ADMIN': 'Manage Bluetooth',
    'CAMERA': 'Use camera',
    'INTERNET': 'Access the Internet',
    'READ_EXTERNAL_STORAGE': 'Read external storage',
    'WRITE_EXTERNAL_STORAGE': 'Write to external storage',
    'ACCESS_FINE_LOCATION': 'Access precise location',
    'ACCESS_COARSE_LOCATION': 'Access approximate location',
    'RECORD_AUDIO': 'Record audio',
    'READ_PHONE_STATE': 'Read phone state',
    'VIBRATE': 'Control vibration',
    'WAKE_LOCK': 'Prevent phone from sleeping'
};

async function getAndroidManifestPath() {
    const configXmlPath = path.join(__dirname, '../config.xml');
    const configContent = await fs.readFile(configXmlPath, 'utf-8');
    const androidPlatformPath = path.join(__dirname, '../platforms/android/AndroidManifest.xml');
    return androidPlatformPath;
}

async function getExistingPermissions(manifestPath) {
    try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        const permissions = [];
        const permissionRegex = /<uses-permission android:name="android.permission.(.*?)"\/>/g;
        let match;
        while ((match = permissionRegex.exec(content)) !== null) {
            permissions.push(match[1]);
        }
        return permissions;
    } catch (error) {
        return [];
    }
}

async function updateAndroidManifest(manifestPath, permissions) {
    try {
        let content = await fs.readFile(manifestPath, 'utf-8');
        
        // Remove existing permissions
        const permissionRegex = /<uses-permission android:name="android.permission.*?"\/>/g;
        content = content.replace(permissionRegex, '');
        
        // Add new permissions
        const permissionElements = permissions
            .map(perm => `<uses-permission android:name="android.permission.${perm}" />`)
            .join('\n    ');
        
        // Insert permissions before </manifest>
        content = content.replace(/(\s*<\/manifest>)/, `    ${permissionElements}\n$1`);
        
        await fs.writeFile(manifestPath, content, 'utf-8');
        console.log('Android permissions updated successfully!');
    } catch (error) {
        console.error('Error updating Android permissions:', error.message);
    }
}

async function managePermissions() {
    try {
        const manifestPath = await getAndroidManifestPath();
        const existingPermissions = await getExistingPermissions(manifestPath);
        
        // Create list of permissions with their descriptions
        const permissionChoices = Object.entries(androidPermissions)
            .map(([perm, desc]) => ({
                name: `${perm} - ${desc}`,
                value: perm
            }));
        
        // Ask user to select permissions
        const answers = await inquirer.prompt([
            {
                type: 'checkbox',
                name: 'permissions',
                message: 'Select Android permissions for your app:',
                choices: permissionChoices,
                default: existingPermissions
            }
        ]);
        
        // Update AndroidManifest.xml
        await updateAndroidManifest(manifestPath, answers.permissions);
        
        console.log('Selected permissions:', answers.permissions);
        console.log('AndroidManifest.xml has been updated with your selected permissions.');
    } catch (error) {
        console.error('Error managing permissions:', error.message);
    }
}

// Run the function
managePermissions();
