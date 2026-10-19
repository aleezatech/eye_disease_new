import { View, Text, TouchableOpacity, Alert, Image, StyleSheet, ScrollView, StatusBar, ImageBackground, Animated, Dimensions } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Upload() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const user = params.user ? JSON.parse(params.user) : null;

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadAndPredict = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage,
        type: "image/jpeg",
        name: "retina.jpg",
      });

      const uploadResponse = await fetch(`${API_URL}/upload-retina`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        Alert.alert("Error", uploadData.error);
        setUploading(false);
        return;
      }

      setUploading(false);
      setPredicting(true);

      const predictResponse = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: uploadData.filename,
          user_id: user.id,
        }),
      });

      const predictData = await predictResponse.json();
      setPredicting(false);

      if (predictData.success) {
        router.push({
          pathname: "/result",
          params: {
            disease: predictData.disease,
            confidence: predictData.confidence,
            userId: user.id,
          },
        });
      } else {
        Alert.alert("Error", predictData.error);
      }
    } catch (error) {
      setUploading(false);
      setPredicting(false);
      Alert.alert("Error", `Cannot connect to server: ${error.message}`);
    }
  };

  // Calculate image width based on screen size minus all padding
  // 24 (scroll padding) + 28 (card padding) = 52 on each side = 104 total
  const imageWidth = SCREEN_WIDTH - 104;

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.3)', 'rgba(99, 102, 241, 0.4)', 'rgba(139, 92, 246, 0.3)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />
          <View style={styles.floatingCircle3} />

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View 
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.userSection}>
                  <View style={styles.avatarOuter}>
                    <LinearGradient
                      colors={['#3b82f6', '#6366f1', '#8b5cf6']}
                      style={styles.avatar}
                    >
                      <Ionicons name="person" size={32} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.greeting}>Welcome,</Text>
                    <Text style={styles.userName}>{user?.name || "User"}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => router.replace("/")} 
                  style={styles.logoutButtonOuter}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                    style={styles.logoutButton}
                  >
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Main Scan Card */}
              <View style={styles.mainCardOuter}>
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)']}
                    style={styles.mainCardGradient}
                  >
                    <View style={styles.mainCardContent}>
                      {/* Card Header */}
                      <View style={styles.cardHeader}>
                        <View style={styles.scanIconOuter}>
                          <LinearGradient
                            colors={['#3b82f6', '#6366f1']}
                            style={styles.scanIcon}
                          >
                            <Ionicons name="scan" size={36} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.cardTitle}>AI Retinal Scan</Text>
                        <Text style={styles.cardSubtitle}>Upload or capture for instant analysis</Text>
                      </View>

                      {/* Image Preview */}
                      {selectedImage ? (
                        <View style={[styles.imagePreviewOuter, { width: imageWidth }]}>
                          <Image
                            source={{ uri: selectedImage }}
                            style={[styles.imagePreview, { width: imageWidth }]}
                            resizeMode="cover"
                          />
                          <TouchableOpacity 
                            style={styles.removeButton}
                            onPress={() => setSelectedImage(null)}
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={['#ef4444', '#dc2626']}
                              style={styles.removeButtonGradient}
                            >
                              <Ionicons name="close" size={20} color="#fff" />
                            </LinearGradient>
                          </TouchableOpacity>
                          <View style={styles.imageOverlay}>
                            <BlurView intensity={20} tint="dark" style={styles.imageBlur}>
                              <Ionicons name="checkmark-circle" size={40} color="#10b981" />
                              <Text style={styles.imageReadyText}>Ready to Analyze</Text>
                            </BlurView>
                          </View>
                        </View>
                      ) : (
                        <View style={[styles.uploadPlaceholder, { width: imageWidth }]}>
                          <LinearGradient
                            colors={['rgba(59, 130, 246, 0.1)', 'rgba(99, 102, 241, 0.1)']}
                            style={[styles.placeholderGradient, { width: imageWidth }]}
                          >
                            <Ionicons name="image-outline" size={70} color="#6366f1" />
                            <Text style={styles.placeholderText}>No Image Selected</Text>
                            <Text style={styles.placeholderSubtext}>Choose from camera or gallery</Text>
                          </LinearGradient>
                        </View>
                      )}

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.actionButtonOuter}
                          onPress={pickImageFromCamera}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.actionButton}
                          >
                            <Ionicons name="camera" size={28} color="#fff" />
                            <Text style={styles.actionButtonText}>Camera</Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.actionButtonOuter}
                          onPress={pickImageFromGallery}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={['#8b5cf6', '#7c3aed']}
                            style={styles.actionButton}
                          >
                            <Ionicons name="images" size={28} color="#fff" />
                            <Text style={styles.actionButtonText}>Gallery</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>

                      {/* Analyze Button — shows only after image selected */}
                      {selectedImage && (
                        <TouchableOpacity 
                          onPress={uploadAndPredict}
                          disabled={uploading || predicting}
                          activeOpacity={0.9}
                          style={styles.analyzeButtonOuter}
                        >
                          <LinearGradient
                            colors={uploading || predicting ? ['#9ca3af', '#6b7280'] : ['#10b981', '#059669']}
                            style={styles.analyzeButton}
                          >
                            <Ionicons 
                              name={uploading || predicting ? "hourglass" : "analytics"} 
                              size={26} 
                              color="#fff" 
                            />
                            <Text style={styles.analyzeButtonText}>
                              {uploading ? "Uploading..." : predicting ? "Analyzing..." : "Analyze Image"}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Quick Access */}
              <View style={styles.quickActionsContainer}>
                <Text style={styles.quickActionsTitle}>Quick Access</Text>
                <View style={styles.quickActionsGrid}>
                  <TouchableOpacity 
                    style={styles.quickActionOuter}
                    onPress={() => router.push({
                      pathname: "/history",
                      params: { userId: user.id }
                    })}
                    activeOpacity={0.9}
                  >
                    <BlurView intensity={30} tint="light" style={styles.quickActionBlur}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                        style={styles.quickAction}
                      >
                        <View style={styles.quickIconOuter}>
                          <LinearGradient
                            colors={['#8b5cf6', '#7c3aed']}
                            style={styles.quickIcon}
                          >
                            <Ionicons name="time" size={32} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.quickActionText}>History</Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionOuter}
                    onPress={() => router.push({
                      pathname: "/feedback",
                      params: { userId: user.id }
                    })}
                    activeOpacity={0.9}
                  >
                    <BlurView intensity={30} tint="light" style={styles.quickActionBlur}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                        style={styles.quickAction}
                      >
                        <View style={styles.quickIconOuter}>
                          <LinearGradient
                            colors={['#ec4899', '#db2777']}
                            style={styles.quickIcon}
                          >
                            <Ionicons name="chatbox-ellipses" size={32} color="#fff" />
                          </LinearGradient>
                        </View>
                        <Text style={styles.quickActionText}>Feedback</Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
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
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    top: -150,
    right: -150,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    bottom: -120,
    left: -120,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    top: '45%',
    right: -80,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  userInfo: {
    marginLeft: 16,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoutButtonOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  mainCardOuter: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.45,
    shadowRadius: 35,
    elevation: 35,
    marginBottom: 30,
  },
  blurContainer: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  mainCardGradient: {
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  mainCardContent: {
    padding: 28,
    alignItems: "center",   // ← KEY FIX: center all children horizontally
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 28,
    width: "100%",
  },
  scanIconOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 16,
  },
  scanIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "600",
  },
  // ── IMAGE PREVIEW (fixed width via inline style) ──
  imagePreviewOuter: {
    position: "relative",
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    height: 300,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  imagePreview: {
    height: 300,
    borderRadius: 24,
  },
  removeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  removeButtonGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  imageBlur: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 8,
  },
  imageReadyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  // ── UPLOAD PLACEHOLDER (fixed width via inline style) ──
  uploadPlaceholder: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderStyle: "dashed",
    height: 300,
  },
  placeholderGradient: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 15,
    color: "rgba(0,0,0,0.5)",
    marginTop: 6,
    fontWeight: "600",
  },
  // ── ACTION BUTTONS ──
  actionButtons: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
    width: "100%",
  },
  actionButtonOuter: {
    flex: 1,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  analyzeButtonOuter: {
    width: "100%",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 22,
    gap: 12,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  // ── QUICK ACCESS ──
  quickActionsContainer: {
    marginBottom: 20,
    width: "100%",
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  quickActionOuter: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  quickActionBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  quickAction: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  quickIconOuter: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 12,
  },
  quickIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
  },
});