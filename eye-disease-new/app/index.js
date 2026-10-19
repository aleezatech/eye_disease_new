import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, ImageBackground, Animated, ScrollView } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from './config';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace({
          pathname: "/upload",
          params: { user: JSON.stringify(data.user) }
        });
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
        source={{ uri: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >

      {/* SCROLLVIEW ADDED */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >

        <LinearGradient
          colors={['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.4)', 'rgba(236, 72, 153, 0.3)']}
          style={styles.gradientOverlay}
        >

          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />
          <View style={styles.floatingCircle3} />

          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >

            <Animated.View 
              style={[
                styles.logoContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.logoOuter}>
                <LinearGradient
                  colors={['#6366f1', '#a855f7', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Ionicons name="eye" size={56} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.appName}>EyeCare AI</Text>

              <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={14} color="#fbbf24" />
                <Text style={styles.premiumText}>Premium Care</Text>
              </View>
            </Animated.View>


            <View style={styles.glassCard}>
              <BlurView intensity={30} tint="light" style={styles.blurContainer}>

                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                  style={styles.cardGradient}
                >

                  <View style={styles.cardContent}>

                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtext}>Sign in to continue your care journey</Text>

                    <View style={styles.inputGroup}>

                      <View style={styles.inputWrapper}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                          style={styles.inputGradient}
                        >

                          <View style={styles.iconBox}>
                            <LinearGradient
                              colors={['#6366f1', '#8b5cf6']}
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


                      <View style={styles.inputWrapper}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
                          style={styles.inputGradient}
                        >

                          <View style={styles.iconBox}>
                            <LinearGradient
                              colors={['#8b5cf6', '#ec4899']}
                              style={styles.iconGradient}
                            >
                              <Ionicons name="lock-closed" size={20} color="#fff" />
                            </LinearGradient>
                          </View>

                          <TextInput
                            placeholder="Password"
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

                    </View>


                    <TouchableOpacity 
                      onPress={handleLogin}
                      activeOpacity={0.9}
                      style={styles.buttonWrapper}
                    >
                      <LinearGradient
                        colors={['#6366f1', '#8b5cf6', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loginButton}
                      >
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <View style={styles.buttonIconCircle}>
                          <Ionicons name="arrow-forward" size={20} color="#6366f1" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>


                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <View style={styles.dividerTextBox}>
                        <Text style={styles.dividerText}>or</Text>
                      </View>
                      <View style={styles.dividerLine} />
                    </View>


                    <View style={styles.secondaryActions}>

                      <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => router.push("/register")}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)']}
                          style={styles.secondaryButtonGradient}
                        >
                          <Ionicons name="person-add" size={20} color="#6366f1" />
                          <Text style={styles.secondaryButtonText}>Create Account</Text>
                        </LinearGradient>
                      </TouchableOpacity>


                      <TouchableOpacity 
                        style={styles.adminButton}
                        onPress={() => router.push("/admin-login")}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="shield-checkmark" size={18} color="#ec4899" />
                        <Text style={styles.adminButtonText}>Admin Portal</Text>
                      </TouchableOpacity>

                    </View>

                  </View>

                </LinearGradient>

              </BlurView>
            </View>

          </Animated.View>

        </LinearGradient>

      </ScrollView>

      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  gradientOverlay: { 
    flex: 1,
    position: 'relative',
  },

  floatingCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    top: -150,
    right: -150,
  },

  floatingCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    bottom: -100,
    left: -100,
  },

  floatingCircle3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    top: '50%',
    right: -80,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
  },

  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },

  appName: {
    fontSize: 40,
    fontWeight: "900",
    color: "#fff",
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 2,
  },

  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  premiumText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  glassCard: {
    borderRadius: 35,
    overflow: 'hidden',
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
    padding: 32,
  },

  welcomeText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },

  welcomeSubtext: {
    fontSize: 15,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "600",
  },

  inputGroup: {
    gap: 16,
    marginBottom: 24,
  },

  inputWrapper: {
    shadowColor: "#6366f1",
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
    elevation: 20,
  },

  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 20,
    gap: 12,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },

  buttonIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  dividerTextBox: {
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  dividerText: {
    color: "rgba(0,0,0,0.5)",
    fontSize: 13,
    fontWeight: "700",
  },

  secondaryActions: {
    gap: 12,
  },

  secondaryButton: {
    elevation: 8,
  },

  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 18,
    gap: 10,
  },

  secondaryButtonText: {
    color: "#6366f1",
    fontSize: 15,
    fontWeight: "800",
  },

  adminButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },

  adminButtonText: {
    color: "#ec4899",
    fontSize: 15,
    fontWeight: "700",
  },

});