"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  useWindowDimensions,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../store"
import { fetchRecentProjects } from "../store/slices/projectsSlice"
import { fetchRecommendedModels } from "../store/slices/aiModelsSlice"
import { Card, Title } from "react-native-paper"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { LinearGradient } from "expo-linear-gradient"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { useTheme } from "../theme/ThemeProvider"
import ProjectCard from "../components/ProjectCard"
import ModelCard from "../components/ModelCard"
import ActivityCard from "../components/ActivityCard"

const HomeScreen = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { width } = useWindowDimensions()
  const { theme } = useTheme()
  const [refreshing, setRefreshing] = useState(false)

  // 从Redux获取数据
  const { user } = useSelector((state: RootState) => state.auth)
  const { recentProjects, loading: projectsLoading } = useSelector((state: RootState) => state.projects)
  const { recommendedModels, loading: modelsLoading } = useSelector((state: RootState) => state.aiModels)

  // 模拟活动数据
  const activities = [
    {
      id: "1",
      type: "code_generation",
      title: "Python冒泡排序算法",
      timestamp: Date.now() - 1000 * 60 * 30, // 30分钟前
      model: "CodeLlama",
      status: "completed",
    },
    {
      id: "2",
      type: "project_update",
      title: "电商平台前端",
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2小时前
      changes: 12,
      status: "completed",
    },
    {
      id: "3",
      type: "deployment",
      title: "个人博客网站",
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1天前
      environment: "生产环境",
      status: "completed",
    },
  ]

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    dispatch(fetchRecentProjects())
    dispatch(fetchRecommendedModels())
  }

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 欢迎区域 */}
      <LinearGradient
        colors={["#45B7D1", "#4ECDC4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.welcomeContainer}
      >
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeText}>
              {getGreeting()}，{user?.name || "开发者"}
            </Text>
            <Text style={styles.welcomeSubtext}>今天是创造的好日子</Text>
          </View>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: "#FF6B6B" }]}>
              <Text style={styles.avatarText}>{(user?.name || "U").charAt(0)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* 快速操作 */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("AIGeneration")}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF6B6B" }]}>
            <Icon name="code-braces" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>AI代码生成</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Projects")}>
          <View style={[styles.iconContainer, { backgroundColor: "#4ECDC4" }]}>
            <Icon name="folder-plus" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>新建项目</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("OfflineProjects")}>
          <View style={[styles.iconContainer, { backgroundColor: "#FFE66D" }]}>
            <Icon name="cloud-off-outline" size={24} color="#333" />
          </View>
          <Text style={styles.quickActionText}>离线项目</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Settings")}>
          <View style={[styles.iconContainer, { backgroundColor: "#A2D2FF" }]}>
            <Icon name="cog" size={24} color="#fff" />
          </View>
          <Text style={styles.quickActionText}>设置</Text>
        </TouchableOpacity>
      </View>

      {/* 使用统计 */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>本月使用统计</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <AnimatedCircularProgress size={80} width={8} fill={75} tintColor="#45B7D1" backgroundColor="#e0e0e0">
                {(fill) => <Text style={styles.progressText}>75%</Text>}
              </AnimatedCircularProgress>
              <Text style={styles.statLabel}>AI额度</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.numberStat}>
                <Text style={styles.statNumber}>12</Text>
              </View>
              <Text style={styles.statLabel}>项目数</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.numberStat}>
                <Text style={styles.statNumber}>156</Text>
              </View>
              <Text style={styles.statLabel}>代码生成</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 最近项目 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近项目</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
            <Text style={styles.seeAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {projectsLoading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() =>
                  navigation.navigate("ProjectDetail", {
                    projectId: project.id,
                    projectName: project.name,
                  })
                }
                style={{ width: width * 0.7 }}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>暂无项目</Text>
          )}
        </ScrollView>
      </View>

      {/* 推荐AI模型 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>推荐AI模型</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AIGeneration")}>
            <Text style={styles.seeAllText}>查看全部</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {modelsLoading ? (
            <Text style={styles.loadingText}>加载中...</Text>
          ) : recommendedModels.length > 0 ? (
            recommendedModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onPress={() =>
                  navigation.navigate("AIModelDetail", {
                    modelId: model.id,
                    modelName: model.name,
                  })
                }
                style={{ width: width * 0.7 }}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>暂无推荐模型</Text>
          )}
        </ScrollView>
      </View>

      {/* 最近活动 */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近活动</Text>
        </View>

        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => {
              // 根据活动类型导航到不同页面
              if (activity.type === "code_generation") {
                navigation.navigate("AIGeneration")
              } else if (activity.type === "project_update") {
                navigation.navigate("Projects")
              } else if (activity.type === "deployment") {
                navigation.navigate("Projects")
              }
            }}
          />
        ))}
      </View>
    </ScrollView>
  )
}

// 根据时间返回问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return "凌晨好"
  if (hour < 9) return "早上好"
  if (hour < 12) return "上午好"
  if (hour < 14) return "中午好"
  if (hour < 17) return "下午好"
  if (hour < 19) return "傍晚好"
  return "晚上好"
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginTop: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    margin: 15,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionButton: {
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
  },
  statsCard: {
    margin: 15,
    marginTop: 5,
    borderRadius: 15,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  statItem: {
    alignItems: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  numberStat: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#45B7D1",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  section: {
    margin: 15,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#45B7D1",
  },
  horizontalScrollContent: {
    paddingRight: 15,
  },
  loadingText: {
    padding: 20,
    color: "#666",
  },
  emptyText: {
    padding: 20,
    color: "#666",
    fontStyle: "italic",
  },
})

export default HomeScreen
