import { View, Text, TouchableOpacity, StatusBar, ImageBackground, StyleSheet, Animated, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.35)', 'rgba(99, 102, 241, 0.45)', 'rgba(139, 92, 246, 0.35)']}
          style={styles.gradientOverlay}
        >
          {/* Floating Elements */}
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />
          <View style={styles.floatingCircle3} />

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoOuter}>
                  <LinearGradient
                    colors={['#3b82f6', '#6366f1', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <Ionicons name="eye" size={80} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={styles.appName}>EyeCare AI</Text>
                <View style={styles.premiumBadge}>
                  <Ionicons name="sparkles" size={14} color="#fbbf24" />
                  <Text style={styles.premiumText}>Professional Care</Text>
                </View>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {[
                  { icon: 'scan', title: 'AI-Powered Analysis', subtitle: 'Advanced detection technology', colors: ['#3b82f6', '#2563eb'] },
                  { icon: 'shield-checkmark', title: 'Accurate Results', subtitle: '82% accuracy rate', colors: ['#10b981', '#059669'] },
                  { icon: 'flash', title: 'Instant Diagnosis', subtitle: 'Results in seconds', colors: ['#f59e0b', '#d97706'] },
                ].map((feature, index) => (
                  <View key={index} style={styles.featureCardOuter}>
                    <BlurView intensity={30} tint="light" style={styles.featureBlur}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)']}
                        style={styles.featureCard}
                      >
                        <View style={styles.featureIconOuter}>
                          <LinearGradient
                            colors={feature.colors}
                            style={styles.featureIcon}
                          >
                            <Ionicons name={feature.icon} size={32} color="#fff" />
                          </LinearGradient>
                        </View>
                        <View style={styles.featureTextContainer}>
                          <Text style={styles.featureTitle}>{feature.title}</Text>
                          <Text style={styles.featureSubtext}>{feature.subtitle}</Text>
                        </View>
                      </LinearGradient>
                    </BlurView>
                  </View>
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => router.push("/")}
                  activeOpacity={0.9}
                  style={styles.primaryButtonOuter}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#6366f1', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <View style={styles.buttonIconCircle}>
                      <Ionicons name="arrow-forward" size={22} color="#3b82f6" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButtonOuter}
                  onPress={() => router.push("/register")}
                  activeOpacity={0.9}
                >
                  <BlurView intensity={30} tint="light" style={styles.secondaryButtonBlur}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)']}
                      style={styles.secondaryButton}
                    >
                      <Ionicons name="person-add" size={24} color="#fff" />
                      <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </LinearGradient>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    top: -120,
    right: -120,
  },
  floatingCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    bottom: -100,
    left: -100,
  },
  floatingCircle3: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    top: '50%',
    right: -70,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 50,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
    marginBottom: 28,
  },
  logoGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2.5,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  premiumText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 40,
  },
  featureCardOuter: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  featureBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  featureIconOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginRight: 18,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 4,
  },
  featureSubtext: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
    fontWeight: "700",
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButtonOuter: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  primaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 25,
    gap: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  buttonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonOuter: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  secondaryButtonBlur: {
    borderRadius: 25,
    overflow: "hidden",
  },
  secondaryButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 25,
    gap: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});