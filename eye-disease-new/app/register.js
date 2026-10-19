import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, StatusBar, ImageBackground, Animated, KeyboardAvoidingView, Platform } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Registration Successful! Please login.", [
          { text: "OK", onPress: () => router.replace("/") }
        ]);
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      Alert.alert("Error", `Server not reachable: ${error.message}`);
    }
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
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.4)', 'rgba(249, 115, 22, 0.3)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />
          <View style={styles.floatingCircle3} />

          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View 
                style={[
                  styles.content,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                {/* Header with Back Button */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                      style={styles.backButtonGradient}
                    >
                      <Ionicons name="arrow-back" size={24} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Logo Section */}
                <View style={styles.logoContainer}>
                  <View style={styles.logoOuter}>
                    <LinearGradient
                      colors={['#8b5cf6', '#ec4899', '#f97316']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.logoGradient}
                    >
                      <Ionicons name="person-add" size={50} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.title}>Join EyeCare AI</Text>
                  <View style={styles.subtitleBox}>
                    <Ionicons name="sparkles" size={14} color="#fbbf24" />
                    <Text style={styles.subtitle}>Start Your Vision Journey</Text>
                  </View>
                </View>

                {/* Glass Card */}
                <View style={styles.glassCard}>
                  <BlurView intensity={30} tint="light" style={styles.blurContainer}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardContent}>
                        {/* Name Input */}
                        <View style={styles.inputWrapper}>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                            style={styles.inputGradient}
                          >
                            <View style={styles.iconBox}>
                              <LinearGradient
                                colors={['#8b5cf6', '#a855f7']}
                                style={styles.iconGradient}
                              >
                                <Ionicons name="person" size={20} color="#fff" />
                              </LinearGradient>
                            </View>
                            <TextInput
                              placeholder="Full Name"
                              placeholderTextColor="rgba(0,0,0,0.4)"
                              style={styles.input}
                              value={name}
                              onChangeText={setName}
                            />
                          </LinearGradient>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputWrapper}>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                            style={styles.inputGradient}
                          >
                            <View style={styles.iconBox}>
                              <LinearGradient
                                colors={['#ec4899', '#f43f5e']}
                                style={styles.iconGradient}
                              >
                                <Ionicons name="mail" size={20} color="#fff" />
                              </LinearGradient>
                            </View>
                            <TextInput
                              placeholder="Email Address"
                              placeholderTextColor="rgba(0,0,0,0.4)"
                              style={styles.input}
                              value={email}
                              onChangeText={setEmail}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </LinearGradient>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                            style={styles.inputGradient}
                          >
                            <View style={styles.iconBox}>
                              <LinearGradient
                                colors={['#f97316', '#fb923c']}
                                style={styles.iconGradient}
                              >
                                <Ionicons name="lock-closed" size={20} color="#fff" />
                              </LinearGradient>
                            </View>
                            <TextInput
                              placeholder="Password (min 6 characters)"
                              placeholderTextColor="rgba(0,0,0,0.4)"
                              secureTextEntry={!showPassword}
                              style={styles.input}
                              value={password}
                              onChangeText={setPassword}
                            />
                            <TouchableOpacity 
                              onPress={() => setShowPassword(!showPassword)}
                              style={styles.eyeButton}
                            >
                              <Ionicons 
                                name={showPassword ? "eye" : "eye-off"} 
                                size={22} 
                                color="rgba(0,0,0,0.5)" 
                              />
                            </TouchableOpacity>
                          </LinearGradient>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputWrapper}>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                            style={styles.inputGradient}
                          >
                            <View style={styles.iconBox}>
                              <LinearGradient
                                colors={['#f97316', '#fb923c']}
                                style={styles.iconGradient}
                              >
                                <Ionicons name="lock-closed" size={20} color="#fff" />
                              </LinearGradient>
                            </View>
                            <TextInput
                              placeholder="Confirm Password"
                              placeholderTextColor="rgba(0,0,0,0.4)"
                              secureTextEntry={!showPassword}
                              style={styles.input}
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                            />
                          </LinearGradient>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity 
                          onPress={handleRegister}
                          activeOpacity={0.9}
                          style={styles.buttonWrapper}
                        >
                          <LinearGradient
                            colors={['#8b5cf6', '#ec4899', '#f97316']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.registerButton}
                          >
                            <Text style={styles.registerButtonText}>Create Account</Text>
                            <View style={styles.buttonIconCircle}>
                              <Ionicons name="checkmark" size={22} color="#8b5cf6" />
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <TouchableOpacity 
                          style={styles.loginLink}
                          onPress={() => router.back()}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.loginLinkText}>
                            Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
              </Animated.View>

              <View style={{ height: 50 }} />
            </ScrollView>
          </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    top: -120,
    right: -120,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    bottom: -80,
    left: -80,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    top: '40%',
    right: -60,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 25,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  logoOuter: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  subtitleBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  subtitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  glassCard: {
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
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardContent: {
    padding: 30,
  },
  inputWrapper: {
    marginBottom: 16,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 64,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  iconBox: {
    marginRight: 14,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  eyeButton: {
    padding: 8,
  },
  buttonWrapper: {
    marginTop: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  registerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 20,
    gap: 12,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1,
  },
  buttonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 10,
  },
  loginLinkText: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
  loginLinkBold: {
    color: "#8b5cf6",
    fontWeight: "900",
  },
});