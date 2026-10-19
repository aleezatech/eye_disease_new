import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, StatusBar, ImageBackground, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function History() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (userId) {
      fetchHistory();
      fetchStatistics();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/prediction-history/${userId}`);
      const data = await response.json();

      if (data.success) {
        setHistory(data.history);
      } else {
        Alert.alert("Error", "Failed to load history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      Alert.alert("Error", "Cannot connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/prediction-statistics/${userId}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
    fetchStatistics();
  };

  const deleteRecord = async (recordId) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this prediction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/prediction-history/${userId}/${recordId}`,
                { method: "DELETE" }
              );
              const data = await response.json();

              if (data.success) {
                Alert.alert("Success", "Record deleted");
                fetchHistory();
                fetchStatistics();
              } else {
                Alert.alert("Error", "Failed to delete record");
              }
            } catch (error) {
              Alert.alert("Error", "Cannot connect to server");
            }
          }
        }
      ]
    );
  };

  const clearAllHistory = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all your predictions? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/prediction-history/clear/${userId}`,
                { method: "DELETE" }
              );
              const data = await response.json();

              if (data.success) {
                Alert.alert("Success", `Deleted ${data.deleted_count} records`);
                fetchHistory();
                fetchStatistics();
              }
            } catch (error) {
              Alert.alert("Error", "Cannot connect to server");
            }
          }
        }
      ]
    );
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      'Diabetic_Retinopathy': ['#ef4444', '#dc2626'],
      'Glaucoma': ['#8b5cf6', '#7c3aed'],
      'Cataract': ['#f59e0b', '#d97706'],
      'Myopia': ['#3b82f6', '#2563eb']
    };
    return colors[disease] || ['#6b7280', '#4b5563'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#6366f1', '#8b5cf6', '#ec4899']} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="time" size={60} color="#fff" />
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.4)', 'rgba(168, 85, 247, 0.3)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.backButtonOuter}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan History</Text>
              <TouchableOpacity 
                onPress={clearAllHistory} 
                style={styles.clearButtonOuter}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.5)', 'rgba(220, 38, 38, 0.4)']}
                  style={styles.clearButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            {stats && (
              <View style={styles.statsContainer}>
                <View style={styles.statCardOuter}>
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.statCard}
                  >
                    <Ionicons name="document-text" size={36} color="#fff" />
                    <Text style={styles.statNumber}>{stats.total_predictions}</Text>
                    <Text style={styles.statLabel}>Total Scans</Text>
                  </LinearGradient>
                </View>
                <View style={styles.statCardOuter}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.statCard}
                  >
                    <Ionicons name="time" size={36} color="#fff" />
                    <Text style={styles.statNumber}>{stats.recent_predictions}</Text>
                    <Text style={styles.statLabel}>This Week</Text>
                  </LinearGradient>
                </View>
              </View>
            )}

            <ScrollView
              style={styles.scrollView}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  colors={["#6366f1"]}
                  tintColor="#fff"
                />
              }
              showsVerticalScrollIndicator={false}
            >
              {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconOuter}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                      style={styles.emptyIcon}
                    >
                      <Ionicons name="document-text-outline" size={80} color="#6366f1" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.emptyText}>No Scans Yet</Text>
                  <Text style={styles.emptySubtext}>Upload an image to get started</Text>
                  <TouchableOpacity
                    style={styles.uploadButtonOuter}
                    onPress={() => router.back()}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={['#6366f1', '#8b5cf6']}
                      style={styles.uploadButton}
                    >
                      <Ionicons name="camera" size={24} color="#fff" />
                      <Text style={styles.uploadButtonText}>New Scan</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                history.map((record) => (
                  <View key={record.id} style={styles.recordCardOuter}>
                    <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                        style={styles.recordCardGradient}
                      >
                        <View style={styles.recordCard}>
                          <View style={styles.recordHeader}>
                            <View style={styles.diseaseIconSmallOuter}>
                              <LinearGradient
                                colors={getDiseaseColor(record.disease_predicted)}
                                style={styles.diseaseIconSmall}
                              >
                                <Ionicons name="medical" size={24} color="#fff" />
                              </LinearGradient>
                            </View>
                            <View style={styles.recordInfo}>
                              <Text style={styles.diseaseName}>
                                {record.disease_predicted.replace(/_/g, ' ')}
                              </Text>
                              <Text style={styles.dateText}>
                                {formatDate(record.prediction_date)}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => deleteRecord(record.id)}
                              style={styles.deleteButtonOuter}
                              activeOpacity={0.8}
                            >
                              <LinearGradient
                                colors={['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.2)']}
                                style={styles.deleteButton}
                              >
                                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>

                          <View style={styles.recordDetails}>
                            <View style={styles.detailRow}>
                              <View style={styles.detailIconOuter}>
                                <LinearGradient
                                  colors={['#6366f1', '#8b5cf6']}
                                  style={styles.detailIcon}
                                >
                                  <Ionicons name="bar-chart" size={16} color="#fff" />
                                </LinearGradient>
                              </View>
                              <Text style={styles.detailText}>
                                Confidence: {record.confidence_score}%
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <View style={styles.detailIconOuter}>
                                <LinearGradient
                                  colors={['#8b5cf6', '#a855f7']}
                                  style={styles.detailIcon}
                                >
                                  <Ionicons name="image" size={16} color="#fff" />
                                </LinearGradient>
                              </View>
                              <Text style={styles.detailText} numberOfLines={1}>
                                {record.image_filename}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.viewDetailsButtonOuter}
                            onPress={() => {
                              router.push({
                                pathname: "/result",
                                params: {
                                  disease: record.disease_predicted,
                                  confidence: record.confidence_score,
                                  userId: userId
                                }
                              });
                            }}
                            activeOpacity={0.9}
                          >
                            <LinearGradient
                              colors={['#6366f1', '#8b5cf6']}
                              style={styles.viewDetailsButton}
                            >
                              <Text style={styles.viewDetailsText}>View Details</Text>
                              <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </View>
                ))
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
    color: "#fff",
    fontWeight: "800",
  },
  floatingCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    top: -120,
    right: -120,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  backButtonOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  clearButtonOuter: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clearButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCardOuter: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  statCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  statNumber: {
    fontSize: 40,
    fontWeight: "900",
    color: "#fff",
    marginVertical: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 24,
  },
  emptyIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  emptyText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 32,
    fontWeight: "600",
  },
  uploadButtonOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 25,
    gap: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  recordCardOuter: {
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
  recordCardGradient: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  recordCard: {
    padding: 20,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  diseaseIconSmallOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginRight: 14,
  },
  diseaseIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  recordInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "700",
  },
  deleteButtonOuter: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  recordDetails: {
    marginBottom: 18,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginRight: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(0,0,0,0.7)",
    fontWeight: "700",
  },
  viewDetailsButtonOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});