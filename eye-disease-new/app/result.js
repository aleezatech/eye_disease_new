import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, ImageBackground, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function Result() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  
  const disease = params.disease;
  const confidence = parseFloat(params.confidence);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchDiseaseInfo();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchDiseaseInfo = async () => {
    try {
      const response = await fetch(`${API_URL}/disease-info/${disease}`);
      const data = await response.json();
      
      if (response.ok) {
        setDiseaseInfo(data);
      }
    } catch (error) {
      console.error("Error fetching disease info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return ['#ef4444', '#dc2626'];
      case 'High': return ['#f97316', '#ea580c'];
      case 'Medium': return ['#f59e0b', '#d97706'];
      case 'Low': return ['#10b981', '#059669'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return ['#10b981', '#059669'];
    if (confidence >= 60) return ['#f59e0b', '#d97706'];
    return ['#ef4444', '#dc2626'];
  };

  if (loading) {
    return (
      <LinearGradient colors={['#6366f1', '#8b5cf6', '#ec4899']} style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="analytics" size={60} color="#fff" />
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Analyzing Results...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.4)', 'rgba(236, 72, 153, 0.3)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
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
                <Text style={styles.headerTitle}>Analysis Results</Text>
                <View style={{ width: 50 }} />
              </View>

              {/* Disease Card */}
              <View style={styles.diseaseCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.diseaseCardGradient}
                  >
                    <View style={styles.diseaseCardContent}>
                      <View style={styles.diseaseIconOuter}>
                        <LinearGradient
                          colors={getSeverityColor(diseaseInfo?.severity_level)}
                          style={styles.diseaseIcon}
                        >
                          <Ionicons name="medical" size={50} color="#fff" />
                        </LinearGradient>
                      </View>
                      <Text style={styles.diseaseName}>{disease.replace(/_/g, ' ')}</Text>
                      <View style={styles.severityBadgeOuter}>
                        <LinearGradient
                          colors={getSeverityColor(diseaseInfo?.severity_level)}
                          style={styles.severityBadge}
                        >
                          <Ionicons name="alert-circle" size={18} color="#fff" />
                          <Text style={styles.severityText}>{diseaseInfo?.severity_level} Risk</Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Confidence Card */}
              <View style={styles.infoCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardContent}>
                      <Text style={styles.cardTitle}>Confidence Score</Text>
                      <View style={styles.confidenceCircleOuter}>
                        <LinearGradient
                          colors={getConfidenceColor()}
                          style={styles.confidenceCircle}
                        >
                          <Text style={styles.confidenceNumber}>{confidence.toFixed(1)}%</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.progressBarBg}>
                        <LinearGradient
                          colors={getConfidenceColor()}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressBar, { width: `${confidence}%` }]}
                        />
                      </View>
                      <Text style={styles.confidenceLabel}>
                        {confidence >= 80 ? "🎯 High Confidence" : confidence >= 60 ? "✅ Moderate Confidence" : "⚠️ Low Confidence"}
                      </Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Description Card */}
              <View style={styles.infoCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardContent}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconOuter}>
                          <LinearGradient
                            colors={['#6366f1', '#8b5cf6']}
                            style={styles.sectionIcon}
                          >
                            <Ionicons name="information-circle" size={24} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.cardTitle}>About This Condition</Text>
                      </View>
                      <Text style={styles.description}>{diseaseInfo?.description}</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Symptoms Card */}
              <View style={styles.infoCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardContent}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconOuter}>
                          <LinearGradient
                            colors={['#ef4444', '#dc2626']}
                            style={styles.sectionIcon}
                          >
                            <Ionicons name="eye" size={24} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.cardTitle}>Common Symptoms</Text>
                      </View>
                      <Text style={styles.description}>{diseaseInfo?.symptoms}</Text>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Prevention Tips Card */}
              <View style={styles.infoCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardContent}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconOuter}>
                          <LinearGradient
                            colors={['#10b981', '#059669']}
                            style={styles.sectionIcon}
                          >
                            <Ionicons name="shield-checkmark" size={24} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.cardTitle}>Prevention Tips</Text>
                      </View>
                      <View style={styles.tipsContainer}>
                        {diseaseInfo?.prevention_tips.map((tip, index) => (
                          tip.trim() && (
                            <View key={index} style={styles.tipItem}>
                              <View style={styles.tipBullet}>
                                <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                              </View>
                              <Text style={styles.tipText}>{tip.trim()}</Text>
                            </View>
                          )
                        ))}
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Treatment Card */}
              <View style={styles.infoCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.infoCardGradient}
                  >
                    <View style={styles.infoCardContent}>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconOuter}>
                          <LinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.sectionIcon}
                          >
                            <Ionicons name="medical" size={24} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.cardTitle}>Treatment Advice</Text>
                      </View>
                      <View style={styles.treatmentBox}>
                        <Ionicons name="alert-circle" size={20} color="#3b82f6" />
                        <Text style={styles.treatmentText}>{diseaseInfo?.treatment_advice}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.primaryButtonOuter}
                  onPress={() => router.replace("/upload")}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={styles.primaryButton}
                  >
                    <Ionicons name="camera" size={24} color="#fff" />
                    <Text style={styles.primaryButtonText}>New Scan</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButtonOuter}
                  onPress={() => router.replace("/")}
                  activeOpacity={0.9}
                >
                  <BlurView intensity={30} tint="light" style={styles.secondaryButtonBlur}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.4)']}
                      style={styles.secondaryButton}
                    >
                      <Ionicons name="home" size={24} color="#6366f1" />
                      <Text style={styles.secondaryButtonText}>Home</Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <View style={{ height: 50 }} />
          </ScrollView>
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
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    bottom: -100,
    left: -100,
  },
  scrollView: { 
    flex: 1,
  },
  content: {
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
  diseaseCardOuter: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 30,
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  diseaseCardGradient: {
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  diseaseCardContent: {
    padding: 32,
    alignItems: "center",
  },
  diseaseIconOuter: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    marginBottom: 20,
  },
  diseaseIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  diseaseName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 16,
  },
  severityBadgeOuter: {
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  severityText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  infoCardOuter: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 16,
  },
  infoCardGradient: {
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  infoCardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1e293b",
    flex: 1,
  },
  confidenceCircleOuter: {
    alignItems: "center",
    marginVertical: 24,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  confidenceCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },
  confidenceNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
  },
  progressBarBg: {
    height: 14,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    borderRadius: 7,
  },
  confidenceLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 14,
  },
  sectionIconOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  description: {
    fontSize: 16,
    color: "rgba(0,0,0,0.7)",
    lineHeight: 26,
    fontWeight: "600",
  },
  tipsContainer: {
    gap: 16,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipBullet: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: "rgba(0,0,0,0.7)",
    lineHeight: 24,
    fontWeight: "600",
  },
  treatmentBox: {
    flexDirection: "row",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    padding: 18,
    borderRadius: 18,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  treatmentText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
    fontWeight: "700",
  },
  buttonContainer: {
    gap: 14,
    marginTop: 20,
  },
  primaryButtonOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  primaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 22,
    gap: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
  },
  secondaryButtonOuter: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  secondaryButtonBlur: {
    borderRadius: 22,
    overflow: "hidden",
  },
  secondaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 22,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 18,
    fontWeight: "900",
  },
});