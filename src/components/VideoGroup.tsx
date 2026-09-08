import { getImageUrl } from "@/src/utils/fileHelper";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "./Icon";

const VideoGroup = ({ group, onPress }: any) => {
  const imageTop = getImageUrl(group?.attachmentInserted);
  const imageBottom = getImageUrl(group?.attachmentMatched);

  const matchedInsertDate = group?.inviteMatched?.insertDate;
  const insertedInsertDate = group?.inviteInserted?.insertDate;

  const hasValidInsertDate = (value: unknown) =>
    value !== undefined && value !== null && value !== -1 && value !== "";

  const matchTime =
    hasValidInsertDate(matchedInsertDate) ||
    hasValidInsertDate(insertedInsertDate);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.centerContainer} pointerEvents="none">
        {matchTime ? (
          <>
            <View style={styles.iconCircle}>
              <Icon name="hourglassBottom" size={20} color="white" />
            </View>
            {group?.icon && (
              <View style={styles.iconCircle}>
                <Icon name={group.icon} size={20} color="white" />
              </View>
            )}
          </>
        ) : (
          group?.icon && (
            <View style={styles.iconCircle}>
              <Icon name={group.icon} size={20} color="white" />
            </View>
          )
        )}
      </View>

      <Image
        source={imageTop ? { uri: imageTop } : undefined}
        style={styles.imageTop}
      />
      <Image
        source={imageBottom ? { uri: imageBottom } : undefined}
        style={styles.imageBottom}
      />
    </TouchableOpacity>
  );
};

export default VideoGroup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 2,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imageTop: {
    width: "100%",
    height: 140,
  },
  imageBottom: {
    width: "100%",
    height: 140,
  },
  centerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  iconCircle: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderRadius: 20,
    borderColor: "#ffffff",
    borderWidth: 2,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1.35,
    shadowRadius: 4.65,

    elevation: 2,
  },
});
