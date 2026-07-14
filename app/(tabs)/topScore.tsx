import Notification from "@/src/components/Notification";
import TopScoreItem from "@/src/components/TopScoreItem";
import { topScoreList } from "@/src/services/masterServices";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { ScrollView, XStack, YStack } from "tamagui";

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  users: any[];
}

export default function TopScoreScreen() {
  // مدیریت تب فعال - پیش‌فرض روی topscore
  const [activeTab, setActiveTab] = useState<"topScore" | "notification">(
    "topScore",
  );

  const [categories, setCategories] = useState<Category[]>([
    {
      id: "music",
      title: "Music",
      icon: <MaterialIcons name="music-note" size={22} color="black" />,
      users: [],
    },
    {
      id: "sport",
      title: "Sport",
      icon: <FontAwesome5 name="running" size={20} color="black" />,
      users: [],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleGetAllScore = async () => {
    setIsLoading(true);

    try {
      const res = await topScoreList();
      const { data, status } = res?.data;

      if (status === 0) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            users: data,
          })),
        );
      }
    } catch (error) {
      console.log("Error fetching scores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetAllScore();
  }, []);

  return (
    <YStack flex={1} bg="$background">
      {/* <MainTitle
        title={activeTab === "topScore" ? "Top Score" : "Notification"}
        showBack={false}
      /> */}

      <XStack style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "topScore" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("topScore")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "topScore" && styles.activeTabText,
            ]}
          >
            Top Score
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "notification" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("notification")}
        >
          <XStack ai="center" gap="$2">
            <YStack style={styles.redDot} />
            <Text
              style={[
                styles.tabText,
                activeTab === "notification" && styles.activeTabText,
              ]}
            >
              Notification
            </Text>
          </XStack>
        </TouchableOpacity>
      </XStack>

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {activeTab === "topScore" ? (
          <YStack>
            <TopScoreItem categories={categories} />
            {isLoading && (
              <YStack ai="center" py="$4">
                <ActivityIndicator size="large" />
              </YStack>
            )}
          </YStack>
        ) : (
          <Notification />
        )}
      </ScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#333", // رنگ زیرخط تب فعال
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "red",
  },
  tabText: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
  activeTabText: {
    color: "#333", // رنگ متن تب فعال
  },
});
