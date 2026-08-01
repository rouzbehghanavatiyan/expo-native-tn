import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, Text as RNText, StyleSheet } from "react-native";
import { Text, View } from "tamagui";

const Started = require("../assets/ranks/starter.png");
const bronseBase1 = require("../assets/ranks/bronze1.png");
const bronseBase2 = require("../assets/ranks/bronze2.png");
const bronseBase3 = require("../assets/ranks/bronze3.png");
const silver1 = require("../assets/ranks/silver1.png");
const silver2 = require("../assets/ranks/silver2.png");
const silver3 = require("../assets/ranks/silver3.png");
const gold1 = require("../assets/ranks/gold1.png");
const gold2 = require("../assets/ranks/gold2.png");
const gold3 = require("../assets/ranks/gold3.png");
const ruby1 = require("../assets/ranks/ruby1.png");
const ruby2 = require("../assets/ranks/ruby2.png");
const ruby3 = require("../assets/ranks/ruby3.png");
const gem1 = require("../assets/ranks/gem1.png");
const gem2 = require("../assets/ranks/gem2.png");
const gem3 = require("../assets/ranks/gem3.png");
const word = require("../assets/ranks/worldMain.png");

interface ProfileWithRankProps {
  userInfo?: any;
  imgSrc?: string | any;
  userName?: string;
  score?: number;
  imgSize?: number;
  userNameStyle?: object;
  positionVideo?: number;
  showProfile?: boolean;
  iconClass?: string;
}

const rankPositionSettings = {
  bronse: { bottom: -15, left: -10 },
  silver: { bottom: -15, left: -10 },
  gold: { bottom: -15, left: -10 },
  gem: { bottom: -15, left: -10 },
  ruby: { bottom: -15, left: -10 },
  word: { bottom: -15, left: -10 },
};

const ImageRank: React.FC<ProfileWithRankProps> = ({
  imgSrc,
  showProfile = true,
  userNameStyle,
  positionVideo,
  userName,
  iconClass = "text-gray-200",
  score = -1,
  imgSize = 40,
  userInfo,
}) => {
  const [rankData, setRankData] = useState<{
    base: any;
    stars: number;
    starType: "bronse" | "silver" | "gold" | "gem" | "ruby" | "word" | "";
    displayNumber?: number;
  }>({ base: Started, stars: 0, starType: "" });
  const rankSize = Math.floor(imgSize * 0.6);
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);

  const determineRank = () => {
    if (score === 0) {
      return { base: bronseBase1, stars: 1, starType: "bronse" as const };
    } else if (score > 0 && score < 100) {
      return { base: bronseBase1, stars: 1, starType: "bronse" as const };
    } else if (score >= 100 && score < 200) {
      return { base: bronseBase2, stars: 2, starType: "bronse" as const };
    } else if (score >= 200 && score < 300) {
      return { base: bronseBase3, stars: 3, starType: "bronse" as const };
    } else if (score >= 300 && score < 400) {
      return { base: silver1, stars: 1, starType: "silver" as const };
    } else if (score >= 400 && score < 500) {
      return { base: silver2, stars: 2, starType: "silver" as const };
    } else if (score >= 500 && score < 600) {
      return { base: silver3, stars: 3, starType: "silver" as const };
    } else if (score >= 600 && score < 700) {
      return { base: gold1, stars: 1, starType: "gold" as const };
    } else if (score >= 700 && score < 800) {
      return { base: gold2, stars: 2, starType: "gold" as const };
    } else if (score >= 800 && score < 900) {
      return { base: gold3, stars: 3, starType: "gold" as const };
    } else if (score >= 900 && score < 1000) {
      return { base: gem1, stars: 1, starType: "ruby" as const };
    } else if (score >= 1000 && score < 1100) {
      return { base: gem2, stars: 2, starType: "ruby" as const };
    } else if (score >= 1100 && score < 1200) {
      return { base: gem3, stars: 3, starType: "ruby" as const };
    } else if (score >= 1200 && score < 1300) {
      return { base: ruby1, stars: 1, starType: "ruby" as const };
    } else if (score >= 1300 && score < 1400) {
      return { base: ruby2, stars: 2, starType: "ruby" as const };
    } else if (score >= 1400 && score < 1500) {
      return { base: ruby3, stars: 3, starType: "ruby" as const };
    } else if (score >= 1500 && score < 1600) {
      return {
        base: word,
        stars: 1,
        starType: "word" as const,
        displayNumber: 900,
      };
    } else if (score >= 1600 && score < 1700) {
      return {
        base: word,
        stars: 1,
        starType: "word" as const,
        displayNumber: 850,
      };
    } else if (score >= 1700 && score < 1800) {
      return {
        base: word,
        stars: 2,
        starType: "word" as const,
        displayNumber: 800,
      };
    } else if (score >= 1800 && score < 1850) {
      return {
        base: word,
        stars: 2,
        starType: "word" as const,
        displayNumber: 750,
      };
    } else if (score >= 1850 && score < 1900) {
      return {
        base: word,
        stars: 3,
        starType: "word" as const,
        displayNumber: 700,
      };
    } else if (score >= 1900 && score < 1950) {
      return {
        base: word,
        stars: 3,
        starType: "word" as const,
        displayNumber: 650,
      };
    } else if (score >= 1950 && score < 2000) {
      return {
        base: word,
        stars: 3,
        starType: "word" as const,
        displayNumber: 600,
      };
    } else if (score >= 2000) {
      return {
        base: word,
        stars: 3,
        starType: "word" as const,
        displayNumber: 550,
      };
    } else {
      return { base: Started, stars: 0, starType: "" as const };
    }
  };

  useEffect(() => {
    setRankData(determineRank());
  }, [score]);

  const shortenUserName = (name: string | undefined): string => {
    if (!name) return "";
    return name.length > 15 ? `${name.slice(0, 15)}...` : name;
  };

  const handleClick = () => {
    if (!showProfile) return;

    const userData = {
      profile:
        positionVideo === 0
          ? userInfo?.profileInserted
          : positionVideo === 1
            ? userInfo?.profileMatched
            : userInfo?.userProfile,
      user:
        positionVideo === 0
          ? userInfo?.userInserted
          : positionVideo === 1
            ? userInfo?.userMatched
            : userInfo?.user,
      score:
        positionVideo === 0
          ? userInfo?.scoreInserted
          : positionVideo === 1
            ? userInfo?.scoreMatched
            : userInfo?.score,
    };
    // @ts-ignore - navigation types may vary
    navigation.navigate("profile", {
      userData,
    });
  };

  const userImg = typeof imgSrc === "string" ? imgSrc : "";
  const hasValidImage =
    userImg &&
    !userImg?.includes("undefined") &&
    imgSrc !== "" &&
    !imageError &&
    imgSrc !== null;

  const getRankPosition = () => {
    const settings =
      rankPositionSettings[
        rankData.starType as keyof typeof rankPositionSettings
      ];
    if (!settings) return { bottom: -20, left: -20 };
    return settings;
  };

  return (
    <View
      onPress={handleClick}
      flexDirection="row"
      alignItems="center"
      m={1}
      style={{ height: imgSize }}
    >
      <View position="relative" style={{ width: imgSize, height: imgSize }}>
        {!hasValidImage ? (
          <Ionicons
            name="person-circle"
            size={imgSize}
            color="#e5e7eb"
            style={styles.iconStyle}
          />
        ) : (
          <Image
            source={{ uri: userImg }}
            style={[
              styles.profileImage,
              { width: imgSize, height: imgSize, borderRadius: imgSize / 2 },
            ]}
            onError={() => setImageError(true)}
          />
        )}

        {score >= 0 && rankData.starType && (
          <View
            position="absolute"
            style={[
              styles.rankContainer,
              {
                bottom: getRankPosition().bottom,
                left: getRankPosition().left,
                width: rankSize,
                height: rankSize,
                zIndex: 10,
              },
            ]}
          >
            <Image
              source={rankData.base}
              style={styles.rankImage}
              resizeMode="contain"
            />
            {rankData.starType === "word" && rankData.displayNumber && (
              <View
                style={[
                  styles.rankNumberContainer,
                  {
                    width: rankSize * 0.35,
                    height: rankSize * 0.35,
                  },
                ]}
              >
                <RNText
                  style={[
                    styles.rankNumberText,
                    {
                      fontSize: rankSize * 0.16,
                    },
                  ]}
                >
                  {rankData.displayNumber}
                </RNText>
              </View>
            )}
          </View>
        )}
      </View>

      {userName && (
        <Text
          ml={2}
          fontWeight="bold"
          style={[!userNameStyle && styles.defaultUserName, userNameStyle]}
        >
          {shortenUserName(userName)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  rankContainer: {
    position: "absolute",
  },
  rankImage: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  rankNumberContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
  },
  rankNumberText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  defaultUserName: {
    color: "#bbbbbb",
    marginLeft: 6,
  },
});

export default ImageRank;
