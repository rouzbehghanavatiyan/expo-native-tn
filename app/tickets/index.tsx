import BaseButton from "@/src/components/BaseButtom";
import { Icon } from "@/src/components/Icon";
import { useAppTheme } from "@/src/hook/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  H2,
  Input,
  Paragraph,
  Text,
  Theme,
  XStack,
  YStack,
} from "tamagui";

const API_URL = "https://your-api.com";

const WALLET_ADDRESSES = {
  bsc: "YOUR_TRUST_WALLET_BSC_ADDRESS",
  tron: "YOUR_TRUST_WALLET_TRON_ADDRESS",
};

interface CryptoNetwork {
  id: "bsc" | "tron";
  label: string;
  note: string;
  asset: string;
}

const NETWORKS: CryptoNetwork[] = [
  {
    id: "bsc",
    label: "USDT (BEP20)",
    note: "BNB Smart Chain - low fee",
    asset: "c20000714_t0x55d398326f99059fF775485246999027B3197955",
  },
  {
    id: "tron",
    label: "USDT (TRC20)",
    note: "TRON network",
    asset: "GAPGPTMASKTOKENmu2uzdc8xh8X0X",
  },
];

interface TicketPackage {
  id: string;
  count: number;
  price: number;
  discountBadge?: string;
  isPopular?: boolean;
}

const TICKET_PACKAGES: TicketPackage[] = [
  { id: "1", count: 10, price: 4.99 },
  { id: "2", count: 20, price: 8.99, discountBadge: "10% OFF" },
  {
    id: "3",
    count: 50,
    price: 19.99,
    isPopular: true,
    discountBadge: "20% OFF",
  },
  { id: "4", count: 100, price: 34.99, discountBadge: "30% OFF" },
];

type PaymentMethod = "paypal" | "crypto";
type Step = "select" | "pay";

interface Order {
  orderId: string;
  amount: string;
}

export default function TicketScreen() {
  const { isDark } = useAppTheme();
  const [selectedPackage, setSelectedPackage] = useState<TicketPackage>(
    TICKET_PACKAGES[2],
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("crypto");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [network, setNetwork] = useState<CryptoNetwork>(NETWORKS[0]);
  const [order, setOrder] = useState<Order | null>(null);
  const [txHash, setTxHash] = useState("");

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const bg = isDark ? "#121212" : "#F8FAFC";
  const cardBg = isDark ? "#1E1E1E" : "#FFFFFF";
  const borderColor = isDark ? "#2C2C2C" : "#E2E8F0";
  const textPrimary = isDark ? "#F8FAFC" : "#0F172A";
  const textMuted = isDark ? "#94A3B8" : "#64748B";
  const activeColor = "#6366F1";

  const address = WALLET_ADDRESSES[network.id];

  const showFeedback = (title: string, message: string, success: boolean) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setIsSuccess(success);
    setFeedbackOpen(true);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Share.share({
        message: text,
      });
    } catch {
      showFeedback("Notice", `${label} is ready to select:\n${text}`, true);
    }
  };

  const createOrder = async (): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders/crypto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: selectedPackage.id,
        network: network.id,
      }),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  };

  const handlePayment = async () => {
    if (paymentMethod !== "crypto") return;
    try {
      setLoading(true);
      const o = await createOrder();
      setOrder(o);
      setStep("pay");
    } catch {
      showFeedback(
        "Order Error",
        "Could not start payment. Please check your connection and try again.",
        false,
      );
    } finally {
      setLoading(false);
    }
  };

  const submitTx = async () => {
    if (!order || txHash.trim().length < 10) {
      showFeedback(
        "Validation",
        "Please paste a valid transaction hash (TxID).",
        false,
      );
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/crypto/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          txHash: txHash.trim(),
          network: network.id,
        }),
      });
      if (!res.ok) throw new Error();
      showFeedback(
        "Payment Received",
        "We're confirming your transaction. Tickets will be credited to your account shortly.",
        true,
      );
      setStep("select");
      setOrder(null);
      setTxHash("");
    } catch {
      showFeedback(
        "Verification Failed",
        "Could not verify transaction. Please check the hash and try again.",
        false,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        {step === "pay" && order ? (
          /* ================= PAY STEP ================= */
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => setStep("select")}>
              <XStack ai="center" gap="$2" mb="$3">
                <Ionicons name="arrow-back" size={20} color={textMuted} />
                <Text color={textMuted}>Back</Text>
              </XStack>
            </TouchableOpacity>

            <YStack ai="center" mb="$4">
              <H2 color={textPrimary} fontWeight="800" fontSize={24}>
                Complete Payment
              </H2>
              <Paragraph color={textMuted} fontSize={14} mt="$1" ta="center">
                Send the exact amount below. Do not change the amount.
              </Paragraph>
            </YStack>

            <XStack gap="$3" mb="$4">
              {NETWORKS.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={{ flex: 1 }}
                  onPress={() => setNetwork(n)}
                >
                  <YStack
                    bg={cardBg}
                    p="$3"
                    br="$4"
                    borderWidth={1.5}
                    borderColor={
                      network.id === n.id ? activeColor : borderColor
                    }
                    ai="center"
                    gap="$1"
                  >
                    <Text color={textPrimary} fontWeight="700" fontSize={14}>
                      {n.label}
                    </Text>
                    <Text color={textMuted} fontSize={11}>
                      {n.note}
                    </Text>
                  </YStack>
                </TouchableOpacity>
              ))}
            </XStack>

            {/* Amount */}
            <YStack
              bg={cardBg}
              p="$3.5"
              br="$4"
              borderWidth={1}
              borderColor={borderColor}
              gap="$2"
              mb="$3"
            >
              <Text color={textMuted} fontSize={12}>
                Amount
              </Text>
              <XStack ai="center" jc="space-between">
                <Text color={textPrimary} fontSize={22} fontWeight="800">
                  {order.amount} USDT
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.amount, "Amount")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="content-copy" color={activeColor} size={20} />
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Address */}
            <YStack
              bg={cardBg}
              p="$3.5"
              br="$4"
              borderWidth={1}
              borderColor={borderColor}
              gap="$2"
              mb="$4"
            >
              <Text color={textMuted} fontSize={12}>
                Wallet address ({network.label})
              </Text>
              <XStack ai="center" jc="space-between" gap="$3">
                <Text
                  color={textPrimary}
                  fontSize={13}
                  fontWeight="600"
                  flex={1}
                  selectable={true}
                >
                  {address}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(address, "Address")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon name="content-copy" color={activeColor} size={20} />
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* TxHash */}
            <Text
              color={textMuted}
              fontSize={13}
              fontWeight="600"
              textTransform="uppercase"
              mb="$2"
            >
              After sending
            </Text>
            <Input
              value={txHash}
              onChangeText={setTxHash}
              placeholder="Paste transaction hash (TxID)"
              placeholderTextColor={isDark ? "#757575" : "#9E9E9E"}
              autoCapitalize="none"
              autoCorrect={false}
              bg={cardBg}
              color={textPrimary}
              borderColor={borderColor}
              mb="$3"
              h={48}
            />
            <Button
              h={50}
              bg={activeColor}
              br="$4"
              pressStyle={{ opacity: 0.8 }}
              onPress={submitTx}
              disabled={loading}
            >
              <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                {loading ? "Verifying..." : "I've paid"}
              </Text>
            </Button>
          </ScrollView>
        ) : (
          /* ================= SELECT STEP ================= */
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            <YStack mb="$4" ai="center">
              <H2 color={textPrimary} fontWeight="800" fontSize={24}>
                Buy Tickets
              </H2>
              <Paragraph color={textMuted} fontSize={14} mt="$1" ta="center">
                Choose a ticket package and your preferred payment method
              </Paragraph>
            </YStack>

            <YStack gap="$3" mb="$6">
              <Text
                color={textMuted}
                fontSize={13}
                fontWeight="600"
                textTransform="uppercase"
              >
                Select Package
              </Text>

              {TICKET_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <XStack
                      bg={cardBg}
                      p="$3.5"
                      br="$4"
                      borderWidth={1.5}
                      borderColor={isSelected ? activeColor : borderColor}
                      ai="center"
                      jc="space-between"
                      pos="relative"
                    >
                      <XStack ai="center" gap="$3">
                        <YStack
                          w={44}
                          h={44}
                          br={22}
                          bg={
                            isSelected
                              ? "$indigo5"
                              : isDark
                                ? "#2C2C2C"
                                : "#EEF2F6"
                          }
                          ai="center"
                          jc="center"
                        >
                          <Ionicons
                            name="ticket"
                            size={22}
                            color={isSelected ? activeColor : textMuted}
                          />
                        </YStack>
                        <YStack>
                          <XStack ai="center" gap="$2">
                            <Text
                              color={textPrimary}
                              fontSize={17}
                              fontWeight="700"
                            >
                              {pkg.count} Tickets
                            </Text>
                            {pkg.isPopular && (
                              <YStack bg="#10B981" px="$2" py={2} br="$2">
                                <Text
                                  color="#fff"
                                  fontSize={10}
                                  fontWeight="800"
                                >
                                  POPULAR
                                </Text>
                              </YStack>
                            )}
                          </XStack>
                          {pkg.discountBadge && (
                            <Text
                              color="#10B981"
                              fontSize={12}
                              fontWeight="600"
                              mt={2}
                            >
                              Save {pkg.discountBadge}
                            </Text>
                          )}
                        </YStack>
                      </XStack>

                      <XStack ai="center" gap="$3">
                        <Text
                          color={textPrimary}
                          fontSize={18}
                          fontWeight="800"
                        >
                          ${pkg.price}
                        </Text>
                        <YStack
                          w={20}
                          h={20}
                          br={10}
                          borderWidth={2}
                          borderColor={isSelected ? activeColor : textMuted}
                          ai="center"
                          jc="center"
                        >
                          {isSelected && (
                            <YStack w={10} h={10} br={5} bg={activeColor} />
                          )}
                        </YStack>
                      </XStack>
                    </XStack>
                  </TouchableOpacity>
                );
              })}
            </YStack>

            {/* Payment Methods */}
            <YStack gap="$3" mb="$6">
              <Text
                color={textMuted}
                fontSize={13}
                fontWeight="600"
                textTransform="uppercase"
              >
                Payment Method
              </Text>

              <XStack gap="$3">
                {/* Crypto */}
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={0.8}
                  onPress={() => setPaymentMethod("crypto")}
                >
                  <YStack
                    bg={cardBg}
                    p="$3"
                    br="$4"
                    borderWidth={1.5}
                    borderColor={
                      paymentMethod === "crypto" ? activeColor : borderColor
                    }
                    ai="center"
                    gap="$2"
                  >
                    <Ionicons name="logo-bitcoin" size={26} color="#F59E0B" />
                    <Text color={textPrimary} fontSize={14} fontWeight="700">
                      Crypto
                    </Text>
                    <Text color={textMuted} fontSize={11}>
                      USDT (BEP20 / TRC20)
                    </Text>
                  </YStack>
                </TouchableOpacity>

                {/* PayPal - DISABLED */}
                <TouchableOpacity
                  style={{ flex: 1 }}
                  activeOpacity={1}
                  disabled
                >
                  <YStack
                    bg={cardBg}
                    p="$3"
                    br="$4"
                    borderWidth={1.5}
                    borderColor={borderColor}
                    ai="center"
                    gap="$2"
                    opacity={0.4}
                  >
                    <Ionicons name="logo-paypal" size={26} color={textMuted} />
                    <Text color={textPrimary} fontSize={14} fontWeight="700">
                      PayPal
                    </Text>
                    <Text color={textMuted} fontSize={11}>
                      Coming soon
                    </Text>
                  </YStack>
                </TouchableOpacity>
              </XStack>
            </YStack>

            <Button
              h={50}
              bg={activeColor}
              pressStyle={{ opacity: 0.8 }}
              br="$4"
              onPress={handlePayment}
              disabled={loading}
            >
              <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                {loading
                  ? "Connecting..."
                  : `Pay $${selectedPackage.price} with Crypto`}
              </Text>
            </Button>
          </ScrollView>
        )}

        {/* Feedback Modal */}
        <Modal
          visible={feedbackOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setFeedbackOpen(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.6)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
            onPress={() => setFeedbackOpen(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 320 }}
            >
              <YStack
                bg={isDark ? "#1E1E1E" : "#FFFFFF"}
                borderRadius="$4"
                p="$5"
                gap={15}
                alignItems="center"
                elevation={6}
                borderWidth={isDark ? 1 : 0}
                borderColor={borderColor}
              >
                <Icon
                  name={isSuccess ? "check-circle" : "error-outline"}
                  size={40}
                  color={isSuccess ? "#2e7d32" : "#d32f2f"}
                />
                <Text
                  fontSize="$4"
                  fontWeight="800"
                  color={textPrimary}
                  textAlign="center"
                >
                  {feedbackTitle}
                </Text>
                <Text fontSize="$3" color={textMuted} textAlign="center">
                  {feedbackMessage}
                </Text>

                <BaseButton
                  onPress={() => setFeedbackOpen(false)}
                  bg={isSuccess ? "$primaryMain" : textPrimary}
                  w="100%"
                >
                  <Text color="white" fontWeight="600">
                    OK
                  </Text>
                </BaseButton>
              </YStack>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </Theme>
  );
}
