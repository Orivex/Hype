export default {
    expo: {
        name: "Hype",
        slug: "hype-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/adaptive-icon.png",
        scheme: "hype-app",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        ios: {
          supportsTablet: true
        },
        android: {
          googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
          adaptiveIcon: {
            foregroundImage: "./assets/images/adaptive-icon.png",
            //backgroundColor: "#ffffff"
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
              backgroundColor: "#FCF191"
            }
          ],
          "expo-web-browser",
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
        owner: "blacklight101",
        updates: {
          url: "https://u.expo.dev/909ddc05-a748-4073-9d18-0693a2d21411"
        },
        runtimeVersion: {
          policy: "appVersion"
        },
        jsEngine: "hermes"
        },
        doctor: {
          reactNativeDirectoryCheck: {
            listUnknownPackages: false
          }
        }
}