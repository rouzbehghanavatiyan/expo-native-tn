import { getImageUrl } from "@/src/utils/fileHelper";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Icon } from "./Icon";
const VideoGroup = ({ group, onPress }: any) => {
  const imageTop = getImageUrl(group?.attachmentInserted);
  const imageBottom = getImageUrl(group?.attachmentMatched);

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {group?.icon && (
        <View style={styles.iconWrapper}>
          <Icon name={group?.icon} size={20} color="white" />
        </View>
      )}
      <Image
        source={imageTop ? { uri: imageTop } : undefined}
        style={styles.imageTop}
      />
      <Image
        source={imageBottom ? { uri: imageBottom } : undefined}
        style={styles.imageBottom}
      />
    </TouchableOpacity>
    // </SafeAreaView>
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
  },
  imageTop: {
    width: "100%",
    height: 140,
  },
  imageBottom: {
    width: "100%",
    height: 140,
  },
  username: {
    fontSize: 12,
  },
  iconWrapper: {
    position: "absolute",
    top: "45%",
    left: "45%",
    zIndex: 10,

    borderRadius: 20,
    borderColor: "#ffffff",
    borderWidth: 2,
    padding: 5,
  },
});
