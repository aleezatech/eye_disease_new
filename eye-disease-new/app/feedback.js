import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, StatusBar, ImageBackground, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function Feedback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId;

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState("General Feedback");
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submit");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const categories = [
    "General Feedback",
    "Bug Report",
    "Feature Request",
    "Complaint",
    "Appreciation"
  ];

  useEffect(() => {
    if (userId) {
      fetchMyFeedback();
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [userId]);

  const fetchMyFeedback = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback/user/${userId}`);
      const data = await response.json();

      if (data.success) {
        setMyFeedback(data.feedback);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    if (!feedbackText.trim()) {
      Alert.alert("Error", "Please enter your feedback");
      return;
    }

    if (feedbackText.length > 1000) {
      Alert.alert("Error", "Feedback is too long (max 1000 characters)");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          rating: rating,
          feedback_text: feedbackText.trim(),
          category: category
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Success",
          "Thank you for your feedback! We appreciate your input.",
          [
            {
              text: "OK",
              onPress: () => {
                setRating(0);
                setFeedbackText("");
                setCategory("General Feedback");
                fetchMyFeedback();
                setActiveTab("history");
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", data.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      Alert.alert("Error", "Cannot connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': ['#f59e0b', '#d97706'],
      'Reviewed': ['#3b82f6', '#2563eb'],
      'Resolved': ['#10b981', '#059669'],
      'Archived': ['#6b7280', '#4b5563']
    };
    return colors[status] || ['#6b7280', '#4b5563'];
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.3)', 'rgba(249, 115, 22, 0.4)', 'rgba(251, 146, 60, 0.3)']}
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
              <Text style={styles.headerTitle}>Feedback</Text>
              <View style={{ width: 50 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainerOuter}>
              <BlurView intensity={30} tint="light" style={styles.tabBlur}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.tabContainer}
                >
                  <TouchableOpacity
                    style={[styles.tab, activeTab === "submit" && styles.activeTab]}
                    onPress={() => setActiveTab("submit")}
                    activeOpacity={0.8}
                  >
                    {activeTab === "submit" && (
                      <LinearGradient
                        colors={['#ec4899', '#f97316']}
                        style={styles.activeTabGradient}
                      >
                        <Ionicons name="create" size={20} color="#fff" />
                        <Text style={styles.activeTabText}>Submit</Text>
                      </LinearGradient>
                    )}
                    {activeTab !== "submit" && (
                      <>
                        <Ionicons name="create-outline" size={20} color="rgba(0,0,0,0.5)" />
                        <Text style={styles.tabText}>Submit</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === "history" && styles.activeTab]}
                    onPress={() => setActiveTab("history")}
                    activeOpacity={0.8}
                  >
                    {activeTab === "history" && (
                      <LinearGradient
                        colors={['#ec4899', '#f97316']}
                        style={styles.activeTabGradient}
                      >
                        <Ionicons name="time" size={20} color="#fff" />
                        <Text style={styles.activeTabText}>My Feedback</Text>
                      </LinearGradient>
                    )}
                    {activeTab !== "history" && (
                      <>
                        <Ionicons name="time-outline" size={20} color="rgba(0,0,0,0.5)" />
                        <Text style={styles.tabText}>My Feedback</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </BlurView>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {activeTab === "submit" ? (
                <View style={styles.cardOuter}>
                  <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardContent}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                          <View style={styles.feedbackIconOuter}>
                            <LinearGradient
                              colors={['#ec4899', '#f97316']}
                              style={styles.feedbackIcon}
                            >
                              <Ionicons name="chatbox-ellipses" size={40} color="#fff" />
                            </LinearGradient>
                          </View>
                          <Text style={styles.cardTitle}>We Value Your Feedback</Text>
                          <Text style={styles.cardSubtitle}>Help us improve your experience</Text>
                        </View>

                        {/* Rating */}
                        <View style={styles.section}>
                          <Text style={styles.label}>Rating *</Text>
                          <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                activeOpacity={0.7}
                                style={styles.starButton}
                              >
                                <Ionicons
                                  name={star <= rating ? "star" : "star-outline"}
                                  size={48}
                                  color={star <= rating ? "#fbbf24" : "#d1d5db"}
                                />
                              </TouchableOpacity>
                            ))}
                          </View>
                          {rating > 0 && (
                            <View style={styles.ratingFeedbackOuter}>
                              <LinearGradient
                                colors={['rgba(251, 191, 36, 0.2)', 'rgba(245, 158, 11, 0.15)']}
                                style={styles.ratingFeedback}
                              >
                                <Text style={styles.ratingText}>
                                  {rating === 5 ? "🎉 Excellent!" : rating === 4 ? "😊 Good" : rating === 3 ? "😐 Average" : rating === 2 ? "😕 Poor" : "😞 Very Poor"}
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                        </View>

                        {/* Category */}
                        <View style={styles.section}>
                          <Text style={styles.label}>Category</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {categories.map((cat) => (
                              <TouchableOpacity
                                key={cat}
                                style={styles.categoryChipOuter}
                                onPress={() => setCategory(cat)}
                                activeOpacity={0.8}
                              >
                                {category === cat ? (
                                  <LinearGradient
                                    colors={['#ec4899', '#f97316']}
                                    style={styles.categoryChipActive}
                                  >
                                    <Text style={styles.categoryTextActive}>{cat}</Text>
                                  </LinearGradient>
                                ) : (
                                  <LinearGradient
                                    colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.4)']}
                                    style={styles.categoryChip}
                                  >
                                    <Text style={styles.categoryText}>{cat}</Text>
                                  </LinearGradient>
                                )}
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>

                        {/* Feedback Text */}
                        <View style={styles.section}>
                          <Text style={styles.label}>Your Feedback *</Text>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']}
                            style={styles.textAreaGradient}
                          >
                            <TextInput
                              style={styles.textArea}
                              placeholder="Tell us what you think..."
                              placeholderTextColor="rgba(0,0,0,0.4)"
                              multiline
                              numberOfLines={6}
                              maxLength={1000}
                              value={feedbackText}
                              onChangeText={setFeedbackText}
                              textAlignVertical="top"
                            />
                          </LinearGradient>
                          <Text style={styles.charCount}>{feedbackText.length}/1000</Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                          onPress={submitFeedback}
                          disabled={submitting}
                          activeOpacity={0.9}
                          style={styles.submitButtonOuter}
                        >
                          <LinearGradient
                            colors={submitting ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
                            style={styles.submitButton}
                          >
                            {submitting ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="send" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>Submit Feedback</Text>
                              </>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              ) : (
                loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading your feedback...</Text>
                  </View>
                ) : myFeedback.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconOuter}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                        style={styles.emptyIcon}
                      >
                        <Ionicons name="chatbox-outline" size={70} color="#ec4899" />
                      </LinearGradient>
                    </View>
                    <Text style={styles.emptyText}>No Feedback Yet</Text>
                    <Text style={styles.emptySubtext}>Submit your first feedback</Text>
                    <TouchableOpacity
                      style={styles.switchButtonOuter}
                      onPress={() => setActiveTab("submit")}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={['#ec4899', '#f97316']}
                        style={styles.switchButton}
                      >
                        <Text style={styles.switchButtonText}>Give Feedback</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
                  myFeedback.map((item) => (
                    <View key={item.id} style={styles.feedbackCardOuter}>
                      <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                          style={styles.feedbackCardGradient}
                        >
                          <View style={styles.feedbackCard}>
                            <View style={styles.feedbackHeader}>
                              <View style={styles.feedbackRating}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Ionicons
                                    key={star}
                                    name={star <= item.rating ? "star" : "star-outline"}
                                    size={18}
                                    color="#fbbf24"
                                  />
                                ))}
                              </View>
                              <View style={styles.statusBadgeOuter}>
                                <LinearGradient
                                  colors={getStatusColor(item.status)}
                                  style={styles.statusBadge}
                                >
                                  <Text style={styles.statusText}>{item.status}</Text>
                                </LinearGradient>
                              </View>
                            </View>

                            <View style={styles.categoryBadge}>
                              <Ionicons name="pricetag" size={14} color="#ec4899" />
                              <Text style={styles.feedbackCategory}>{item.category}</Text>
                            </View>
                            
                            <Text style={styles.feedbackText}>{item.feedback_text}</Text>

                            {item.admin_response && (
                              <View style={styles.adminResponseOuter}>
                                <LinearGradient
                                  colors={['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.1)']}
                                  style={styles.adminResponse}
                                >
                                  <View style={styles.adminHeader}>
                                    <Ionicons name="shield-checkmark" size={18} color="#3b82f6" />
                                    <Text style={styles.adminLabel}>Admin Response:</Text>
                                  </View>
                                  <Text style={styles.adminText}>{item.admin_response}</Text>
                                </LinearGradient>
                              </View>
                            )}

                            <View style={styles.feedbackFooter}>
                              <Ionicons name="calendar-outline" size={14} color="rgba(0,0,0,0.5)" />
                              <Text style={styles.feedbackDate}>
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </BlurView>
                    </View>
                  ))
                )
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
  floatingCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    top: -120,
    right: -120,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
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
    shadowColor: "#ec4899",
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
  tabContainerOuter: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
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
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  activeTab: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeTabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  tabText: {
    fontSize: 15,
    color: "rgba(0,0,0,0.5)",
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
  cardOuter: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 30,
  },
  blurContainer: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  cardContent: {
    padding: 28,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  feedbackIconOuter: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    marginBottom: 20,
  },
  feedbackIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    fontWeight: "600",
  },
  section: {
    marginBottom: 26,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 14,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingFeedbackOuter: {
    alignItems: "center",
    marginTop: 12,
  },
  ratingFeedback: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChipOuter: {
    marginRight: 10,
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  categoryChipActive: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  categoryText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "700",
  },
  categoryTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "900",
  },
  textAreaGradient: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  textArea: {
    fontSize: 16,
    color: "#1e293b",
    minHeight: 140,
    fontWeight: "600",
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    marginTop: 8,
    fontWeight: "700",
  },
  submitButtonOuter: {
    marginTop: 10,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 22,
    gap: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconOuter: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 24,
  },
  emptyIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
  switchButtonOuter: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  switchButton: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  switchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  feedbackCardOuter: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 16,
  },
  feedbackCardGradient: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  feedbackCard: {
    padding: 22,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  feedbackRating: {
    flexDirection: "row",
    gap: 4,
  },
  statusBadgeOuter: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  feedbackCategory: {
    fontSize: 14,
    color: "#ec4899",
    fontWeight: "800",
  },
  feedbackText: {
    fontSize: 15,
    color: "rgba(0,0,0,0.7)",
    lineHeight: 23,
    marginBottom: 16,
    fontWeight: "600",
  },
  adminResponseOuter: {
    marginBottom: 12,
  },
  adminResponse: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  adminLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3b82f6",
  },
  adminText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 21,
    fontWeight: "700",
  },
  feedbackFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  feedbackDate: {
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "700",
  },
});