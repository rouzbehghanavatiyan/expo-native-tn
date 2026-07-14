import { Icon } from "@/src/components/Icon";
import { setPaginationWatch } from "@/src/slices/main";
import { useAppDispatch } from "@/src/store/reduxHookType";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PropsTypes {
  handleGetAllMatch: (id: number) => void;
  skills?: { id: number; name: string; icon?: string }[];
  selectFiltered: number | null;
  setSelectFiltered: any;
}

const Filtered: React.FC<PropsTypes> = ({
  skills,
  handleGetAllMatch,
  selectFiltered,
  setSelectFiltered,
}) => {
  const dispatch = useAppDispatch();

  const handleIconClick = (id: number) => {
    if (selectFiltered === id) return;

    setSelectFiltered(id);
    dispatch(
      setPaginationWatch({
        take: 6,
        skip: 0,
        hasMore: true,
      }),
    );

    handleGetAllMatch(id);
  };

  return (
    <View style={styles.container}>
      {skills?.map((item) => {
        const isSelected = selectFiltered === item.id;
        return (
          <View key={item.id} style={styles.itemWrapper}>
            <TouchableOpacity
              style={[styles.circle, isSelected && styles.selectedCircle]}
              onPress={() => handleIconClick(item.id)}
            >
              {item.id !== 0 && item.icon && (
                <Icon
                  name={item?.icon || "star"}
                  size={20}
                  color={isSelected ? "#3953" : "#999"}
                />
              )}
            </TouchableOpacity>

            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {item.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default Filtered;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
  },
  itemWrapper: {
    display: "flex",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    borderColor: "#3953",
    backgroundColor: "#f0f8ff",
  },
  label: {
    marginTop: 4,
    fontSize: 8,
    color: "#999",
    fontWeight: "bold",
    textAlign: "center", // وسط‌چین کردن متن زیر دایره
  },
  selectedLabel: {
    color: "#3953",
  },
});
