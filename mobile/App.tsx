"use client"

import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { StatusBar } from "react-native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./store"
import { ThemeProvider } from "./theme/ThemeProvider"
import { AuthProvider } from "./auth/AuthProvider"
import { ApiProvider } from "./api/ApiProvider"
import { OfflineManager } from "./offline/OfflineManager"
import { NotificationManager } from "./notifications/NotificationManager"

// 导入图标
import Icon from "react-native-vector-icons/MaterialCommunityIcons"

// 导入屏幕组件
import HomeScreen from "./screens/HomeScreen"
import ProjectsScreen from "./screens/ProjectsScreen"
import AIGenerationScreen from "./screens/AIGenerationScreen"
import PreviewScreen from "./screens/PreviewScreen"
import ProfileScreen from "./screens/ProfileScreen"
import LoginScreen from "./screens/LoginScreen"
import ProjectDetailScreen from "./screens/ProjectDetailScreen"
import AIModelDetailScreen from "./screens/AIModelDetailScreen"
import SettingsScreen from "./screens/SettingsScreen"
import OfflineProjectsScreen from "./screens/OfflineProjectsScreen"
import SplashScreen from "./screens/SplashScreen"

// 创建导航器
const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

// 主标签导航
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline"
          } else if (route.name === "AIGeneration") {
            iconName = focused ? "robot" : "robot-outline"
          } else if (route.name === "Preview") {
            iconName = focused ? "eye" : "eye-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline"
          }

          // 返回图标组件
          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#45B7D1", // 云蓝色
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "首页" }} />
      <Tab.Screen name="Projects" component={ProjectsScreen} options={{ title: "项目" }} />
      <Tab.Screen
        name="AIGeneration"
        component={AIGenerationScreen}
        options={{
          title: "AI生成",
          tabBarStyle: { backgroundColor: "#f8f9fa" },
        }}
      />
      <Tab.Screen name="Preview" component={PreviewScreen} options={{ title: "预览" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "我的" }} />
    </Tab.Navigator>
  )
}

// 主应用导航
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#45B7D1", // 云蓝色
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={({ route }) => ({
          title: route.params?.projectName || "项目详情",
        })}
      />
      <Stack.Screen
        name="AIModelDetail"
        component={AIModelDetailScreen}
        options={({ route }) => ({
          title: route.params?.modelName || "AI模型详情",
        })}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "设置" }} />
      <Stack.Screen name="OfflineProjects" component={OfflineProjectsScreen} options={{ title: "离线项目" }} />
    </Stack.Navigator>
  )
}

// 主应用组件
export default function App() {
  useEffect(() => {
    // 初始化应用
    NotificationManager.initialize()
  }, [])

  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AuthProvider>
              <ApiProvider>
                <NavigationContainer>
                  <OfflineManager>
                    <AppNavigator />
                  </OfflineManager>
                </NavigationContainer>
              </ApiProvider>
            </AuthProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  )
}
