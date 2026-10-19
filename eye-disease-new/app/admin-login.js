import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, ImageBackground, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.replace({
          pathname: "/admin-dashboard",
          params: {
            admin: JSON.stringify(data.admin)
          }
        });
      } else {
        Alert.alert("Error", data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      Alert.alert("Error", "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

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

          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
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
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButtonOuter}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.3)', 'rgba(124, 58, 237, 0.2)']}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>

              {/* Logo Section */}
              <View style={styles.logoContainer}>
                <View style={styles.logoOuter}>
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="shield-checkmark" size={70} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Admin Portal</Text>
                <Text style={styles.subtitle}>Eye Disease Detection System</Text>
              </View>

              {/* Login Card */}
              <View style={styles.cardOuter}>
                <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.25)', 'rgba(124, 58, 237, 0.15)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>Secure Access</Text>

                      {/* Username Input */}
                      <View style={styles.inputWrapper}>
                        <LinearGradient
                          colors={['rgba(167, 139, 250, 0.3)', 'rgba(139, 92, 246, 0.2)']}
                          style={styles.inputGradient}
                        >
                          <View style={styles.iconWrapper}>
                            <Ionicons name="person" size={20} color="#a78bfa" />
                          </View>
                          <TextInput
                            placeholder="Admin Username"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                          />
                        </LinearGradient>
                      </View>

                      {/* Password Input */}
                      <View style={styles.inputWrapper}>
                        <LinearGradient
                          colors={['rgba(167, 139, 250, 0.3)', 'rgba(139, 92, 246, 0.2)']}
                          style={styles.inputGradient}
                        >
                          <View style={styles.iconWrapper}>
                            <Ionicons name="lock-closed" size={20} color="#a78bfa" />
                          </View>
                          <TextInput
                            placeholder="Password"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                          />
                          <TouchableOpacity 
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                          >
                            <Ionicons 
                              name={showPassword ? "eye" : "eye-off"} 
                              size={22} 
                              color="rgba(255,255,255,0.5)" 
                            />
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>

                      {/* Login Button */}
                      <TouchableOpacity 
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.9}
                        style={styles.loginButtonOuter}
                      >
                        <LinearGradient
                          colors={loading ? ['#6b7280', '#4b5563'] : ['#8b5cf6', '#7c3aed']}
                          style={styles.loginButton}
                        >
                          <Ionicons name="shield-checkmark" size={26} color="#fff" />
                          <Text style={styles.loginButtonText}>
                            {loading ? "Authenticating..." : "Access Dashboard"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      {/* Info Box */}
                      <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={18} color="#a78bfa" />
                        <Text style={styles.infoText}>Authorized personnel only</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Back to User Login */}
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backToUserButton}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back-circle" size={20} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.backToUserText}>Back to User Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientOverlay: { flex: 1 },
  keyboardView: { flex: 1 },
  floatingCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    top: -100,
    right: -100,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    bottom: -80,
    left: -80,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  backButtonOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  backButton: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.4)",
    borderRadius: 25,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 45,
  },
  logoOuter: {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
    marginBottom: 24,
  },
  logoGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(167, 139, 250, 0.4)",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  cardOuter: {
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
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
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  cardContent: {
    padding: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 28,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 64,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  eyeIcon: {
    padding: 8,
  },
  loginButtonOuter: {
    marginTop: 24,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 22,
    gap: 12,
    borderWidth: 3,
    borderColor: "rgba(167, 139, 250, 0.4)",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    padding: 14,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  infoText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "700",
  },
  backToUserButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 10,
  },
  backToUserText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "700",
  },
});