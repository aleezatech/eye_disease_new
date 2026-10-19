import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar, ImageBackground, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function AdminDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const admin = params.admin ? JSON.parse(params.admin) : null;

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDashboardData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(`${API_URL}/admin/dashboard/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await fetch(`${API_URL}/admin/users`);
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      const predsRes = await fetch(`${API_URL}/admin/predictions/recent?limit=10`);
      const predsData = await predsRes.json();
      if (predsData.success) setRecentPredictions(predsData.predictions);

      const fbRes = await fetch(`${API_URL}/admin/feedback/pending`);
      const fbData = await fbRes.json();
      if (fbData.success) setPendingFeedback(fbData.feedback);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    router.replace("/");
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1e1b4b', '#312e81', '#4c1d95']} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="shield-checkmark" size={60} color="#a78bfa" />
          <ActivityIndicator size="large" color="#a78bfa" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(30, 27, 75, 0.95)', 'rgba(49, 46, 129, 0.93)', 'rgba(76, 29, 149, 0.90)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.adminAvatarOuter}>
                  <LinearGradient
                    colors={['#8b5cf6', '#a78bfa']}
                    style={styles.adminAvatar}
                  >
                    <Ionicons name="shield-checkmark" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={styles.welcomeText}>Welcome Back,</Text>
                  <Text style={styles.adminName}>{admin?.full_name || 'Admin'}</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleLogout} 
                style={styles.logoutButtonOuter}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.4)', 'rgba(220, 38, 38, 0.3)']}
                  style={styles.logoutButton}
                >
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainerOuter}>
              <BlurView intensity={20} tint="dark" style={styles.tabBlur}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.15)']}
                  style={styles.tabContainer}
                >
                  {['overview', 'users', 'feedback'].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tab, activeTab === tab && styles.activeTab]}
                      onPress={() => setActiveTab(tab)}
                      activeOpacity={0.8}
                    >
                      {activeTab === tab ? (
                        <LinearGradient
                          colors={['#8b5cf6', '#7c3aed']}
                          style={styles.activeTabGradient}
                        >
                          <Text style={styles.activeTabText}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.tabText}>
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </LinearGradient>
              </BlurView>
            </View>

            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  colors={["#8b5cf6"]}
                  tintColor="#8b5cf6"
                />
              }
              showsVerticalScrollIndicator={false}
            >
              {activeTab === "overview" && stats && (
                <View>
                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    {[
                      { icon: 'people', label: 'Total Users', value: stats.total_users, sub: `+${stats.new_users} this week`, colors: ['#8b5cf6', '#7c3aed'] },
                      { icon: 'analytics', label: 'Predictions', value: stats.total_predictions, sub: `+${stats.recent_predictions} this week`, colors: ['#6366f1', '#4f46e5'] },
                      { icon: 'chatbox-ellipses', label: 'Pending', value: stats.pending_feedback, sub: `of ${stats.total_feedback} total`, colors: ['#ec4899', '#db2777'] },
                      { icon: 'star', label: 'Avg Rating', value: stats.avg_rating.toFixed(1), sub: 'out of 5.0', colors: ['#f59e0b', '#d97706'] },
                    ].map((stat, index) => (
                      <View key={index} style={styles.statCardOuter}>
                        <LinearGradient
                          colors={stat.colors}
                          style={styles.statCard}
                        >
                          <Ionicons name={stat.icon} size={32} color="#fff" />
                          <Text style={styles.statNumber}>{stat.value}</Text>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                          <Text style={styles.statSubtext}>{stat.sub}</Text>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>

                  {/* Disease Distribution */}
                  <View style={styles.cardOuter}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                        style={styles.cardGradient}
                      >
                        <View style={styles.card}>
                          <View style={styles.cardHeader}>
                            <Ionicons name="pie-chart" size={24} color="#a78bfa" />
                            <Text style={styles.cardTitle}>Disease Distribution</Text>
                          </View>
                          {stats.disease_distribution.map((disease, index) => (
                            <View key={index} style={styles.diseaseRow}>
                              <View style={styles.diseaseIconSmall}>
                                <Ionicons name="medical" size={20} color="#a78bfa" />
                              </View>
                              <View style={styles.diseaseInfo}>
                                <Text style={styles.diseaseName}>
                                  {disease.disease_predicted.replace(/_/g, ' ')}
                                </Text>
                                <Text style={styles.diseaseStats}>
                                  {disease.count} cases • {disease.avg_confidence}% confidence
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </View>

                  {/* Recent Predictions */}
                  <View style={styles.cardOuter}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                        style={styles.cardGradient}
                      >
                        <View style={styles.card}>
                          <View style={styles.cardHeader}>
                            <Ionicons name="time" size={24} color="#a78bfa" />
                            <Text style={styles.cardTitle}>Recent Predictions</Text>
                          </View>
                          {recentPredictions.slice(0, 5).map((pred) => (
                            <View key={pred.id} style={styles.predictionRow}>
                              <View style={styles.userIconCircle}>
                                <Ionicons name="person" size={22} color="#a78bfa" />
                              </View>
                              <View style={styles.predictionInfo}>
                                <Text style={styles.predictionUser}>{pred.user_name}</Text>
                                <Text style={styles.predictionDisease}>
                                  {pred.disease_predicted.replace(/_/g, ' ')} • {pred.confidence_score}%
                                </Text>
                                <Text style={styles.predictionDate}>
                                  {new Date(pred.prediction_date).toLocaleString()}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </View>
                </View>
              )}

              {activeTab === "users" && (
                <View style={styles.cardOuter}>
                  <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="people" size={24} color="#a78bfa" />
                          <Text style={styles.cardTitle}>All Users ({users.length})</Text>
                        </View>
                        {users.map((user) => (
                          <View key={user.id} style={styles.userRow}>
                            <View style={styles.userIconCircle}>
                              <Ionicons name="person" size={26} color="#a78bfa" />
                            </View>
                            <View style={styles.userInfo}>
                              <Text style={styles.userName}>{user.name}</Text>
                              <Text style={styles.userEmail}>{user.email}</Text>
                              <Text style={styles.userStats}>
                                {user.total_predictions} predictions • {user.total_feedback} feedback
                              </Text>
                              <Text style={styles.userDate}>
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              )}

              {activeTab === "feedback" && (
                <View style={styles.cardOuter}>
                  <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.1)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Ionicons name="chatbox-ellipses" size={24} color="#a78bfa" />
                          <Text style={styles.cardTitle}>Pending Feedback ({pendingFeedback.length})</Text>
                        </View>
                        {pendingFeedback.length === 0 ? (
                          <Text style={styles.emptyText}>No pending feedback</Text>
                        ) : (
                          pendingFeedback.map((fb) => (
                            <View key={fb.id} style={styles.feedbackCard}>
                              <View style={styles.feedbackHeader}>
                                <Text style={styles.feedbackUser}>{fb.user_name}</Text>
                                <View style={styles.ratingContainer}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                      key={star}
                                      name={star <= fb.rating ? "star" : "star-outline"}
                                      size={16}
                                      color="#fbbf24"
                                    />
                                  ))}
                                </View>
                              </View>
                              <Text style={styles.feedbackCategory}>{fb.category}</Text>
                              <Text style={styles.feedbackText}>{fb.feedback_text}</Text>
                              <Text style={styles.feedbackDate}>
                                {new Date(fb.created_at).toLocaleString()}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientOverlay: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: { 
    marginTop: 20, 
    fontSize: 18, 
    color: "#a78bfa",
    fontWeight: "800",
  },
  floatingCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    top: -120,
    right: -120,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    bottom: -100,
    left: -100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminAvatarOuter: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    marginRight: 16,
  },
  adminAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(167, 139, 250, 0.5)",
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  adminName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginTop: 2,
  },
  logoutButtonOuter: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  tabContainerOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  tabBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: "row",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  activeTab: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  activeTabGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    width: '100%',
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "700",
  },
  activeTabText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "900",
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 24,
  },
  statCardOuter: {
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  statCard: {
    padding: 22,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginVertical: 10,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  cardOuter: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 16,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  card: {
    padding: 22,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#fff",
    flex: 1,
  },
  diseaseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.2)",
  },
  diseaseIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  diseaseStats: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  predictionRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.2)",
  },
  userIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  predictionInfo: {
    flex: 1,
  },
  predictionUser: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  predictionDisease: {
    fontSize: 14,
    color: "#a78bfa",
    fontWeight: "700",
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
  },
  userRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.2)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 6,
    fontWeight: "600",
  },
  userStats: {
    fontSize: 13,
    color: "#a78bfa",
    fontWeight: "700",
    marginBottom: 3,
  },
  userDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  feedbackCard: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  feedbackUser: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 3,
  },
  feedbackCategory: {
    fontSize: 13,
    color: "#a78bfa",
    fontWeight: "700",
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 20,
    marginBottom: 10,
    fontWeight: "600",
  },
  feedbackDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.6)",
    paddingVertical: 20,
    fontSize: 15,
    fontWeight: "700",
  },
});