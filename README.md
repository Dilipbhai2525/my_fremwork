# Hybrid Framework | હાઇબ્રિડ ફ્રેમવર્ક

A modern framework for building web and mobile applications using HTML, CSS, and JavaScript.

HTML, CSS અને JavaScript નો ઉપયોગ કરીને વેબ અને મોબાઇલ એપ્લિકેશન બનાવવા માટેનું આધુનિક ફ્રેમવર્ક.

## Features | વિશેષતાઓ

- Bootstrap 5 integration | Bootstrap 5 એકીકરણ
- Mobile-first responsive design | મોબાઇલ-ફર્સ્ટ રિસ્પોન્સિવ ડિઝાઇન
- Easy to customize | સરળતાથી કસ્ટમાઇઝ કરી શકાય છે
- Support for web and mobile (APK) builds | વેબ અને મોબાઇલ (APK) બિલ્ડ્સ માટે સપોર્ટ
- Modern UI components | આધુનિક UI કમ્પોનન્ટ્સ

## Complete Installation Guide (Manual) | સંપૂર્ણ ઇન્સ્ટોલેશન ગાઈડ (મેન્યુઅલ) | સંપૂર્ણ ઇન્સ્ટોલેશન ગાઈડ

### Step 1: Prerequisites

1. Install Node.js:
   - Download from: https://nodejs.org/
   - Install the LTS version
   - Verify installation:
   ```bash
   node --version
   npm --version
   ```

2. Install Java JDK:
   - Download OpenJDK from: https://adoptium.net/
   - Install JDK version 8 or higher
   - Set JAVA_HOME environment variable:
     - Windows: Open System Properties → Environment Variables
     - Add new System Variable:
       - Variable name: JAVA_HOME
       - Variable value: C:\Program Files\Java\jdk-[version]
   - Add Java to PATH:
     - Edit System PATH variable
     - Add: %JAVA_HOME%\bin
   - Verify installation:
   ```bash
   java -version
   ```

### Step 2: Project Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd fremwork
```

2. Install project dependencies:
```bash
npm install
```

3. Install global dependencies:
```bash
npm install -g cordova
npm install -g cordova-res
```

### Step 3: Development Server

1. Start the development server:
```bash
npm start
```

2. Open http://localhost:3000 in your browser

### Step 4: Building Android APK

1. Prepare resources (only needed once):
```bash
cd cordova-app
cordova platform add android
cd ..
```

2. Build the APK:
```bash
npm run build:android
```

The APK will be generated in: `cordova-app/platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Troubleshooting

1. If you see 'cordova' is not recognized:
   ```bash
   npm install -g cordova
   ```

2. If JAVA_HOME is not found:
   - Make sure you've set the JAVA_HOME environment variable
   - Restart your terminal/command prompt
   - Verify with: `echo %JAVA_HOME%`

3. If Gradle fails:
   ```bash
   cd cordova-app/platforms/android
   ./gradlew clean
   cd ../..
   npm run build:android
   ```

4. If Android SDK is missing:
   - The build script will automatically download required components
   - Just make sure Java JDK is properly installed

### Testing the APK

1. Enable USB debugging on your Android device:
   - Go to Settings → About Phone
   - Tap Build Number 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable USB Debugging

2. Install the APK:
   - Connect your Android device via USB
   - Copy the APK from `cordova-app/platforms/android/app/build/outputs/apk/debug/app-debug.apk`
   - Install it on your device

## Customization | કસ્ટમાઇઝેશન

- Edit `public/css/style.css` for custom styles | કસ્ટમ સ્ટાઇલ્સ માટે `public/css/style.css` એડિટ કરો
- Modify `public/js/app.js` for custom JavaScript | કસ્ટમ JavaScript માટે `public/js/app.js` મોડિફાય કરો
- Update `public/index.html` for layout changes | લેઆઉટ ચેન્જીસ માટે `public/index.html` અપડેટ કરો

## Contributing | યોગદાન

1. Fork the repository | રિપોઝિટરી ફોર્ક કરો
2. Create your feature branch | તમારી ફીચર બ્રાંચ બનાવો
3. Commit your changes | તમારા ચેન્જીસ કમિટ કરો
4. Push to the branch | બ્રાંચમાં પુશ કરો
5. Create a Pull Request | પુલ રિક્વેસ્ટ બનાવો
