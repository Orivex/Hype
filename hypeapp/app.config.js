
const AndroidGoogleServicesFile = process.env.GOOGLE_SERVICES_FILE ?? "./google-services.json";


export default {
    expo: {
        name: "hype-app",
        slug: "hype-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "hype-app",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
          supportsTablet: true
        },
        android: {
          googleServicesFile: AndroidGoogleServicesFile,
          adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            backgroundColor: "#ffffff"
          },
          edgeToEdgeEnabled: true,
          package: "com.blacklight101.hypeapp"
        },
        web: {
          bundler: "metro",
          output: "static",
          favicon: "./assets/images/favicon.png"
        },
        plugins: [
          "@react-native-firebase/app",
          "@react-native-firebase/auth",
          "@react-native-firebase/crashlytics",
          "expo-router",
          [
            "expo-splash-screen",
            {
              image: "./assets/images/splash-icon.png",
              imageWidth: 200,
              resizeMode: "contain",
              backgroundColor: "#ffffff"
            }
          ],
          "expo-web-browser"
        ],
        experiments: {
          typedRoutes: true
        },
        extra: {
          router: {},
          eas: {
            projectId: "909ddc05-a748-4073-9d18-0693a2d21411"
          }
        },
        owner: "blacklight101"
        }
};