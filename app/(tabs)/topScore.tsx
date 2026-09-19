import MainTitle from "@/src/components/MainTitle";
import Notification from "@/src/components/Notification";
import TopScoreItem from "@/src/components/TopScoreItem";
import React, { useState } from "react";
import { ScrollView, YStack } from "tamagui";

export default function TopScoreScreen() {
  const [activeTab, setActiveTab] = useState<"topScore" | "notification">(
    "topScore",
  );

  return (
    <YStack flex={1} bg="$background">
      {/* <XStack style={styles.tabContainer}>
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
      </XStack> */}

      <ScrollView flex={1} showsVerticalScrollIndicator={false}>
        {activeTab === "topScore" ? (
          <YStack>
            <MainTitle title="Top score" />
            <TopScoreItem />
          </YStack>
        ) : (
          <Notification />
        )}
      </ScrollView>
    </YStack>
  );
}
