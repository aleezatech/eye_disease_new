import { View, Text, StatusBar, ImageBackground, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

export default function Splash() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after 3 seconds
    setTimeout(() => {
      router.replace("/welcome");
    }, 3000);
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80" }}
        style={styles.container}
        blurRadius={0}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.40)', 'rgba(139, 92, 246, 0.50)', 'rgba(236, 72, 153, 0.40)']}
          style={styles.gradientOverlay}
        >
          {/* Floating particles */}
          <View style={styles.particle1} />
          <View style={styles.particle2} />
          <View style={styles.particle3} />
          <View style={styles.particle4} />

          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* Logo with Pulse */}
            <Animated.View 
              style={[
                styles.logoContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.logoOuter}>
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  {/* Shimmer effect */}
                  <Animated.View 
                    style={[
                      styles.shimmer,
                      {
                        transform: [{ translateX: shimmerTranslate }]
                      }
                    ]}
                  />
                  <Ionicons name="eye" size={90} color="#fff" />
                </LinearGradient>
              </View>
            </Animated.View>

            {/* App Name with Gradient Text Effect */}
            <View style={styles.textContainer}>
              <LinearGradient
                colors={['#fff', '#e0e7ff', '#ddd6fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.textGradient}
              >
                <Text style={styles.appName}>EyeCare AI</Text>
              </LinearGradient>
            </View>

            {/* Tagline */}
            <View style={styles.taglineContainer}>
              <Ionicons name="sparkles" size={16} color="#fbbf24" />
              <Text style={styles.tagline}>Advanced Retinal Disease Detection</Text>
              <Ionicons name="sparkles" size={16} color="#fbbf24" />
            </View>

            {/* Loading Indicator */}
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBarBg}>
                <Animated.View 
                  style={[
                    styles.loadingBar,
                    {
                      opacity: fadeAnim,
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#6366f1', '#8b5cf6', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loadingFill}
                  />
                </Animated.View>
              </View>
              <Text style={styles.loadingText}>Initializing AI Engine...</Text>
            </View>

            {/* Version Badge */}
            <View style={styles.versionBadge}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.versionGradient}
              >
                <Text style={styles.versionText}>v1.0.0 • Powered by AI</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  particle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    top: '15%',
    left: '10%',
  },
  particle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    top: '60%',
    right: '15%',
  },
  particle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    bottom: '25%',
    left: '20%',
  },
  particle4: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    top: '30%',
    right: '20%',
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoOuter: {
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 30,
  },
  logoGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    width: 50,
    height: '150%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ rotate: '15deg' }],
  },
  textContainer: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 10,
  },
  textGradient: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  appName: {
    fontSize: 56,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    marginBottom: 60,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tagline: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    width: 250,
    alignItems: "center",
  },
  loadingBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  loadingBar: {
    width: '100%',
    height: '100%',
  },
  loadingFill: {
    width: '70%',
    height: '100%',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    letterSpacing: 1,
  },
  versionBadge: {
    position: 'absolute',
    bottom: 50,
    borderRadius: 20,
    overflow: 'hidden',
  },
  versionGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  versionText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "700",
  },
});