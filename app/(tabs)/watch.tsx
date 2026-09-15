import { DeactivatedModal } from "@/src/common/DeactivatedModal";
import { MatchTimeoutModal } from "@/src/common/MatchTimeoutModal";
import { stopMatchTimer } from "@/src/components/TimerForFindMatch";
import VideoGroup from "@/src/components/VideoGroup";
import { attachmentList, subCategoryList } from "@/src/services/masterServices";
import {
  appendWatchData,
  resetWatchState,
  setPaginationWatch,
  setWatchData,
} from "@/src/slices/main";
import { useAppDispatch, useAppSelector } from "@/src/store/reduxHookType";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function WatchScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pagination, data } = useAppSelector((state) => state.main.watchVideo);
  const [skills, setSkills] = useState<any[]>([]);
  const [selectFiltered, setSelectFiltered] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const showTimeout = useAppSelector((state) => state?.video?.showTimeout);
  const [seed, setSeed] = useState<number>(() =>
    Math.floor(Math.random() * 1000000),
  );

  const showDeactivatedModal = useAppSelector(
    (state) => state?.video?.showDeactivatedModal,
  );

  const handleGetFiltered = async () => {
    try {
      const res = await subCategoryList(1);
      const { data: skillData } = res?.data;
      const temp = [{ id: 0, name: "All" }, ...skillData];
      setSkills(temp);
    } catch (err) {
      console.log(err);
    }
  };
  const generateNewSeed = () => Math.floor(Math.random() * 1000000);

  const handleGetAllMatch = async (
    skillId: number,
    reset = false,
    customSeed?: number,
  ) => {
    if (loading) return;
    if (!reset && !pagination.hasMore) return;

    try {
      setLoading(true);

      const skip = reset ? 0 : pagination.skip;
      const take = pagination.take || 6;
      const activeSeed = customSeed ?? seed;

      const res = await attachmentList({
        skip,
        take,
        subCatId: skillId,
        seed: activeSeed,
      });

      const newData = res?.data || [];

      if (reset) {
        dispatch(setWatchData(newData));
      } else {
        dispatch(appendWatchData(newData));
      }

      dispatch(
        setPaginationWatch({
          take,
          skip: skip + take,
          hasMore: newData.length === take,
        }),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const newSeed = generateNewSeed();
    setSeed(newSeed);

    dispatch(resetWatchState());
    dispatch(
      setPaginationWatch({
        take: 10,
        skip: 0,
        hasMore: true,
      }),
    );

    await handleGetAllMatch(selectFiltered, true, newSeed);
    setRefreshing(false);
  };

  const handleFilterChange = (skillId: number) => {
    setSelectFiltered(skillId);

    const newSeed = generateNewSeed();
    setSeed(newSeed);

    dispatch(resetWatchState());

    dispatch(
      setPaginationWatch({
        take: 10,
        skip: 0,
        hasMore: true,
      }),
    );

    handleGetAllMatch(skillId, true, newSeed);
  };

  useEffect(() => {
    stopMatchTimer();
    handleGetFiltered();
  }, []);

  const handleShowMatch = (item: any) => {
    const inviteId = item?.inviteInserted?.id;

    if (!inviteId) {
      console.log("inviteId is missing", item);
      return;
    }

    router.push({
      pathname: "/watch/showWatch/[inviteId]",
      params: {
        inviteId: String(inviteId),
      },
    });
  };

  return (
    <>
      <View style={styles.container}>
        <FlatList
          // ListHeaderComponent={
          //   <>
          //     {skills && (
          //       <>
          //         <MainTitle title="Filtered" />
          //         <FilteredWatch
          //           skills={skills}
          //           handleGetAllMatch={handleFilterChange}
          //           selectFiltered={selectFiltered}
          //           setSelectFiltered={setSelectFiltered}
          //         />
          //       </>
          //     )}
          //   </>
          // }
          data={data}
          numColumns={2}
          keyExtractor={(item, index) =>
            item?.inviteInserted?.id
              ? String(item.inviteInserted.id)
              : index.toString()
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item, index }) => (
            <VideoGroup
              group={item}
              index={index}
              onPress={() => handleShowMatch(item)}
            />
          )}
          onEndReached={() => handleGetAllMatch(selectFiltered, false)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && !refreshing ? <ActivityIndicator size="large" /> : null
          }
        />
      </View>
      {showTimeout && <MatchTimeoutModal />}
      {showDeactivatedModal && <DeactivatedModal />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
