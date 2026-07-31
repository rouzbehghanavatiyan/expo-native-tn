import { Icon } from "@/src/components/Icon";
import MainTitle from "@/src/components/MainTitle";
import { allStore } from "@/src/services/nestServices";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// import * as Clipboard from "expo-clipboard";
import BaseButton from "@/src/components/BaseButtom";
import { logger } from "@/src/utils/logger";
import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Text, XStack, YStack } from "tamagui";

const StoreScreen: React.FC<any> = () => {
  const [allStoreList, setAllStoreList] = useState<any>([]);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const router = useRouter();

  const MY_USDT_WALLET = "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

  const handleGetAllList = async () => {
    try {
      const res = await allStore();
      logger.info("ressssssssssss", res);
      const { data, status } = res?.data || {};
      if (status === 0) {
        setAllStoreList(data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  useEffect(() => {
    handleGetAllList();
  }, []);

  const handleSelectPlan = (store: any) => {
    setSelectedItem(store);
    setShowPaymentModal(true);
  };

  const copyToClipboard = async () => {
    Alert.alert(
      "Copied",
      "Wallet address copied successfully. You can now paste it into your exchange or wallet.",
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <YStack flex={1} backgroundColor="#f9fafb">
          <MainTitle title="Store" handleBack={() => router.back()} />

          <YStack paddingHorizontal={16}>
            {allStoreList?.map((store: any, index: number) => (
              <YStack
                key={store?.id}
                onPress={() => handleSelectPlan(store)}
                pressStyle={{ opacity: 0.7 }}
                paddingVertical={12}
                borderBottomWidth={index !== allStoreList.length - 1 ? 1 : 0}
                borderBottomColor="#d1d5db"
              >
                <XStack
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop={8}
                >
                  <Text color="#1f2937" fontSize={18} fontWeight="600">
                    {store?.name}
                  </Text>
                  <Icon name="ticket" size={24} color="#059669" />
                </XStack>
                <YStack marginTop={8}>
                  <Text color="#1f2937" fontSize={14}>
                    {store?.des}
                  </Text>
                </YStack>

                <Text
                  color="#111827"
                  fontSize={16}
                  marginTop={12}
                  fontWeight="500"
                >
                  ${store?.price}
                </Text>
              </YStack>
            ))}
          </YStack>
        </YStack>
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <YStack
            flex={1}
            justifyContent="flex-end"
            backgroundColor="rgba(0,0,0,0.5)"
          >
            <YStack
              backgroundColor="white"
              borderTopLeftRadius={20}
              borderTopRightRadius={20}
              padding={24}
              alignItems="center"
              gap={16}
            >
              <Text fontSize={20} fontWeight="bold" color="#1f2937">
                USDT Payment
              </Text>

              <XStack
                backgroundColor="#fef3c7"
                padding={12}
                borderRadius={8}
                width="100%"
                justifyContent="center"
              >
                <Text color="#d97706" fontWeight="bold">
                  Network: TRC20 (Tron)
                </Text>
              </XStack>

              <Text fontSize={16} textAlign="center" color="#4b5563">
                Please send exactly{" "}
                <Text fontWeight="bold" color="#059669">
                  ${selectedItem?.price}
                </Text>{" "}
                USDT to the address below:
              </Text>

              {/* QR Code */}
              <YStack
                padding={12}
                backgroundColor="white"
                borderRadius={8}
                borderColor="#e5e7eb"
                borderWidth={1}
              >
                <QRCode
                  value={MY_USDT_WALLET}
                  size={180}
                  color="black"
                  backgroundColor="white"
                />
              </YStack>

              {/* Wallet Address & Copy Button */}
              <YStack width="100%" gap={8}>
                <Text fontSize={12} color="#6b7280" textAlign="center">
                  Wallet Address:
                </Text>
                <XStack
                  backgroundColor="#f3f4f6"
                  padding={12}
                  borderRadius={8}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text
                    fontSize={13}
                    color="#374151"
                    numberOfLines={1}
                    flex={1}
                  >
                    {MY_USDT_WALLET}
                  </Text>
                </XStack>

                <BaseButton
                  bg="$black"
                  chromeless
                  onPress={copyToClipboard}
                  marginTop={8}
                >
                  Copy Address
                </BaseButton>
              </YStack>
              <XStack gap={12} marginTop={8} width="100%">
                <BaseButton
                  flex={1}
                  bg="$orangeMain"
                  onPress={() => setShowPaymentModal(false)}
                >
                  Cancel
                </BaseButton>
                <BaseButton
                  flex={1}
                  bg="#22c55e"
                  onPress={() => {
                    Alert.alert(
                      "Processing",
                      "Your account will be updated once the transaction is confirmed on the network.",
                    );
                    setShowPaymentModal(false);
                  }}
                >
                  I Have Paid
                </BaseButton>
              </XStack>
            </YStack>
          </YStack>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default StoreScreen;
