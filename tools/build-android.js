const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const AdmZip = require('adm-zip');

// Android SDK setup constants
const CMDLINE_TOOLS_VERSION = '7583922';
const BUILD_TOOLS_VERSION = '33.0.2';
const PLATFORM_VERSION = 'android-33';


// Function to setup Gradle
async function setupGradle() {
    const gradleVersion = '7.6';
    const gradleRoot = path.join(process.cwd(), 'gradle');
    const gradleHome = path.join(gradleRoot, `gradle-${gradleVersion}`);
    const gradleZip = path.join(gradleRoot, 'gradle.zip');

    if (!fs.existsSync(gradleRoot)) {
        fs.mkdirSync(gradleRoot, { recursive: true });
    }

    if (!fs.existsSync(gradleHome)) {
        console.log('Downloading Gradle...');
        const url = `https://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip`;
        await downloadFile(url, gradleZip);

        console.log('Extracting Gradle...');
        const zip = new AdmZip(gradleZip);
        zip.extractAllTo(gradleRoot);
        await safeDelete(gradleZip);
    }

    process.env.GRADLE_HOME = gradleHome;
    process.env.PATH = `${path.join(gradleHome, 'bin')}${path.delimiter}${process.env.PATH}`;
    return gradleHome;
}

// Function to check Java version
function checkJavaVersion(javaPath) {
    try {
        const javaVersion = execSync(`"${path.join(javaPath, 'bin', 'java')}" -version 2>&1`).toString();
        const versionMatch = javaVersion.match(/version "([\d.]+)/i);
        if (versionMatch) {
            const version = versionMatch[1].split('.');
            const majorVersion = parseInt(version[0]);
            return { version: majorVersion, path: javaPath };
        }
    } catch (e) {}
    return null;
}

// Function to check Java installation and get Java home
function getJavaHome() {
    try {
        // Try to get Java home from registry on Windows
        const javaVersions = [];
        
        // Try common Java installation paths
        const commonPaths = [
            'C:\\Program Files\\Java',
            'C:\\Program Files (x86)\\Java'
        ];

        for (const basePath of commonPaths) {
            if (fs.existsSync(basePath)) {
                const jdkDirs = fs.readdirSync(basePath)
                    .filter(dir => dir.startsWith('jdk'))
                    .map(dir => path.join(basePath, dir));

                for (const jdkPath of jdkDirs) {
                    const versionInfo = checkJavaVersion(jdkPath);
                    if (versionInfo) {
                        javaVersions.push(versionInfo);
                    }
                }
            }
        }

        // Try registry
        try {
            const javaHome = execSync('reg query "HKEY_LOCAL_MACHINE\\Software\\JavaSoft\\JDK" /v CurrentVersion', { stdio: 'pipe' })
                .toString()
                .split('\n')
                .find(line => line.includes('CurrentVersion'))
                ?.trim()
                .split(/\s+/)
                .pop();

            if (javaHome) {
                const javaPath = execSync(`reg query "HKEY_LOCAL_MACHINE\\Software\\JavaSoft\\JDK\\${javaHome}" /v JavaHome`, { stdio: 'pipe' })
                    .toString()
                    .split('\n')
                    .find(line => line.includes('JavaHome'))
                    ?.trim()
                    .split(/\s+/)
                    .slice(2)
                    .join(' ');

                if (javaPath && fs.existsSync(javaPath)) {
                    const versionInfo = checkJavaVersion(javaPath);
                    if (versionInfo) {
                        javaVersions.push(versionInfo);
                    }
                }
            }
        } catch (e) {
            // Ignore registry errors
        }



                // Filter out incompatible versions and sort to prefer Java 17 or 11
        const compatibleVersions = javaVersions.filter(v => v.version <= 17);
        if (compatibleVersions.length === 0) {
            return null;
        }
        compatibleVersions.sort((a, b) => {
            // Prefer Java 17 or 11
            if (a.version === 17) return -1;
            if (b.version === 17) return 1;
            if (a.version === 11) return -1;
            if (b.version === 11) return 1;
            // Otherwise use the newer version
            return b.version - a.version;
        });

        if (javaVersions.length > 0) {
            const selectedJava = javaVersions[0];
            console.log(`Using Java ${selectedJava.version} from ${selectedJava.path}`);
            return selectedJava.path;
        }

        throw new Error('Java home not found');
    } catch (error) {
        console.error('Java is not installed or JAVA_HOME is not set. Please install Java JDK.');
        throw error;
    }
}

// Function to retry an operation
async function retry(operation, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Function to safely delete a file
async function safeDelete(filePath) {
    if (fs.existsSync(filePath)) {
        await retry(async () => {
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
                if (error.code === 'EBUSY' || error.code === 'EPERM') {
                    // On Windows, try to force delete
                    execSync(`del /f "${filePath}"`, { stdio: 'ignore' });
                } else {
                    throw error;
                }
            }
        });
    }
}

// Function to safely rename
async function safeRename(oldPath, newPath) {
    await retry(async () => {
        try {
            fs.renameSync(oldPath, newPath);
        } catch (error) {
            if (error.code === 'EBUSY' || error.code === 'EPERM') {
                // On Windows, try to use move command
                execSync(`move /Y "${oldPath}" "${newPath}"`, { stdio: 'ignore' });
            } else {
                throw error;
            }
        }
    });
}

// Function to download file
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', async () => {
                file.close();
                resolve();
            });
        });
        request.on('error', async (err) => {
            await safeDelete(dest);
            reject(err);
        });
    });
}

// Function to ensure Gradle is available
async function ensureGradle() {
    try {
        // Try using system's Gradle first
        try {
            execSync('gradle -v');
            return 'gradle'; // Return just the command if system Gradle exists
        } catch (e) {
            // System Gradle not found, continue with download
        }

        // Use Android platform's Gradle wrapper if it exists
        const cordovaPath = path.join(__dirname, '..', 'cordova-app');
        const androidPath = path.join(cordovaPath, 'platforms', 'android');
        const gradlewPath = path.join(androidPath, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');

        if (fs.existsSync(gradlewPath)) {
            return gradlewPath;
        }

        // If neither exists, use Cordova's built-in Gradle
        console.log('Using Cordova\'s built-in Gradle...');
        return null;
    } catch (error) {
        console.error('Gradle setup failed:', error);
        throw error;
    }
}



// Function to setup Android SDK
async function setupAndroidSDK() {
    const sdkRoot = path.join(process.cwd(), 'android-sdk');
    const cmdlineToolsZip = path.join(sdkRoot, 'cmdline-tools.zip');
    const cmdlineToolsDir = path.join(sdkRoot, 'cmdline-tools');

    if (!fs.existsSync(sdkRoot)) {
        fs.mkdirSync(sdkRoot, { recursive: true });
    }

    // Create directory structure
    const latestDir = path.join(cmdlineToolsDir, 'latest');
    if (!fs.existsSync(latestDir)) {
        console.log('Downloading Android command line tools...');
        const url = `https://dl.google.com/android/repository/commandlinetools-win-${CMDLINE_TOOLS_VERSION}_latest.zip`;
        await downloadFile(url, cmdlineToolsZip);

        console.log('Extracting command line tools...');
        const zip = new AdmZip(cmdlineToolsZip);
        
        // Extract to a temporary directory
        const tempDir = path.join(sdkRoot, 'temp');
        if (fs.existsSync(tempDir)) {
            await retry(() => fs.rmSync(tempDir, { recursive: true }));
        }
        fs.mkdirSync(tempDir, { recursive: true });
        
        zip.extractAllTo(tempDir);
        
        // Move files to the correct location
        fs.mkdirSync(cmdlineToolsDir, { recursive: true });
        await safeRename(path.join(tempDir, 'cmdline-tools'), latestDir);
        
        // Clean up
        await retry(() => fs.rmSync(tempDir, { recursive: true }));
        await safeDelete(cmdlineToolsZip);
    }

    // Set ANDROID_HOME and PATH
    process.env.ANDROID_HOME = sdkRoot;
    const binPath = path.join(sdkRoot, 'cmdline-tools', 'latest', 'bin');
    process.env.PATH = `${binPath}${path.delimiter}${process.env.PATH}`;
    const androidSdkRoot = sdkRoot;

    // Accept licenses and install required components
    console.log('Installing Android SDK components...');
    const yesResponse = Buffer.from('y\n'.repeat(100));
    const sdkmanager = path.join(binPath, 'sdkmanager.bat');
    execSync(`"${sdkmanager}" --sdk_root="${sdkRoot}" --licenses`, {
        input: yesResponse,
        stdio: ['pipe', 'inherit', 'inherit'],
        env: process.env
    });
    execSync(`"${sdkmanager}" --sdk_root="${sdkRoot}" "platform-tools" "build-tools;${BUILD_TOOLS_VERSION}" "platforms;${PLATFORM_VERSION}"`, {
        stdio: 'inherit',
        env: process.env
    });
    return sdkRoot;
}

// Main build function
async function buildAndroid() {
    try {
        // Try the specified Java 17 path directly first
        const java17Path = 'C:\\Program Files\\Java\\jdk-17';
        const versionInfo = checkJavaVersion(java17Path);
        
        if (versionInfo && versionInfo.version === 17) {
            console.log(`Using Java ${versionInfo.version} from ${versionInfo.path}`);
            process.env.JAVA_HOME = versionInfo.path;
            process.env.PATH = `${path.join(versionInfo.path, 'bin')}${path.delimiter}${process.env.PATH}`;
        } else {
            // Fall back to searching for Java installations
            const javaInfo = getJavaHome();
            if (!javaInfo || !javaInfo.path || javaInfo.version > 17) {
                throw new Error('Compatible Java version not found. Please install Java 11 or Java 17.');
            }
            console.log(`Using Java ${javaInfo.version} from ${javaInfo.path}`);
            process.env.JAVA_HOME = javaInfo.path;
            process.env.PATH = `${path.join(javaInfo.path, 'bin')}${path.delimiter}${process.env.PATH}`;
        }

        

        // Setup Gradle
        console.log('Setting up Gradle...');
        await setupGradle();

        // Setup Android SDK
        console.log('Setting up Android SDK...');
        const androidSdkRoot = await setupAndroidSDK();
        process.env.ANDROID_SDK_ROOT = androidSdkRoot;
        process.env.ANDROID_HOME = androidSdkRoot;

        const cordovaPath = path.join(__dirname, '..', 'cordova-app');
        const androidPath = path.join(cordovaPath, 'platforms', 'android');

        // Create android platform if not exists
        // Build using Cordova's build command
        console.log('Building Android APK...');
        execSync('cordova platform remove android && cordova platform add android@12.0.1 --compileSdkVersion=33 --targetSdkVersion=33 && cordova build android', {
            cwd: cordovaPath,
            stdio: 'inherit',
            env: process.env
        });

        console.log('Build completed successfully!');
        console.log('APK location:', path.join(androidPath, 'app', 'build', 'outputs', 'apk', 'debug'));

    } catch (error) {
        console.error('Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
buildAndroid();
