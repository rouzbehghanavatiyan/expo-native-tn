import { useNavigation } from "@react-navigation/native";
import {
    Box,
    Divider,
    HStack,
    Pressable,
    Text,
    useColorModeValue,
    VStack,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface DropdownItem<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick?: (data?: T) => void;
  href?: string | ((data?: T) => string);
  className?: string;
  divider?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  switchIcon?: boolean;
  label?: string;
  buttonIcon?: React.ReactNode;
  position?: "left" | "right";
  className?: string;
  iconOnly?: boolean;
  setIsOpenOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isOpenOptions?: boolean;
  itemData?: any;
  openDropdowns?: boolean;
  setOpenDropdowns?: React.Dispatch<React.SetStateAction<boolean>>;
  showRank?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  items = [],
  showRank = false,
  setIsOpenOptions,
  isOpenOptions,
  switchIcon = false,
  label,
  buttonIcon,
  position = "right",
  className = "",
  itemData,
  iconOnly = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const buttonRef = useRef<View>(null);
  const navigation = useNavigation();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");

  const handleItemClick = async (item: DropdownItem) => {
    setIsOpenOptions(false);
    setModalVisible(false);

    if (item.onClick) {
      item.onClick(itemData);
    } else if (item.href) {
      const href =
        typeof item.href === "function" ? item.href(itemData) : item.href;

      // Check if it's an internal navigation or external link
      if (href.startsWith("/")) {
        // @ts-ignore - navigation types may vary
        navigation.navigate(href);
      } else if (href.startsWith("http")) {
        // Open external links
        const canOpen = await Linking.canOpenURL(href);
        if (canOpen) {
          await Linking.openURL(href);
        } else {
          Alert.alert("Error", "Cannot open this link");
        }
      }
    }
  };

  const measureButton = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
      });
    }
  };

  useEffect(() => {
    if (isOpenOptions) {
      measureButton();
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [isOpenOptions]);

  const rankScoreItem = items.find((item) => item.label === "rankScore");
  const rankItems = items.filter((item) => item.label !== "rankScore");

  const getModalPosition = () => {
    const modalTop = buttonLayout.y + buttonLayout.height + 8;
    const modalLeft =
      position === "right"
        ? buttonLayout.x + buttonLayout.width - (showRank ? 320 : 224)
        : buttonLayout.x;

    return {
      top: modalTop,
      left: modalLeft,
    };
  };

  return (
    <Box position="relative" className={className}>
      <Pressable
        ref={buttonRef}
        onPress={() => {
          setIsOpenOptions(!isOpenOptions);
        }}
        flexDirection="row"
        alignItems="center"
      >
        {buttonIcon && <Box mr={!iconOnly && label ? 1 : 0}>{buttonIcon}</Box>}
        {!iconOnly && label && <Text color={textColor}>{label}</Text>}
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => {
          setIsOpenOptions(false);
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setIsOpenOptions(false);
            setModalVisible(false);
          }}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
            <View
              style={{
                position: "absolute",
                ...getModalPosition(),
                width: showRank ? 320 : 224,
                backgroundColor: bgColor,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <ScrollView>
                <VStack space={1} py={1}>
                  {!showRank ? (
                    items.map((item, index) => (
                      <React.Fragment key={index}>
                        {item.divider ? (
                          <Divider my={1} />
                        ) : (
                          <Pressable
                            onPress={() => handleItemClick(item)}
                            px={4}
                            py={2}
                            _pressed={{ bg: hoverBgColor }}
                          >
                            <HStack space={2} alignItems="center">
                              {item.icon && <Box mr={2}>{item.icon}</Box>}
                              <Text
                                color={textColor}
                                fontSize="sm"
                                className={item.className}
                              >
                                {item.label}
                              </Text>
                            </HStack>
                          </Pressable>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <Box p={3}>
                      {rankScoreItem && (
                        <Box
                          mb={4}
                          pb={3}
                          borderBottomWidth={1}
                          borderBottomColor="gray.200"
                        >
                          <Pressable
                            onPress={() => handleItemClick(rankScoreItem)}
                            p={3}
                            bg="gray.50"
                            borderRadius="lg"
                            alignItems="center"
                          >
                            <Box mb={1}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="gray.800"
                              >
                                {rankScoreItem.icon}
                              </Text>
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.700"
                            >
                              Your rank
                            </Text>
                          </Pressable>
                        </Box>
                      )}

                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          marginHorizontal: -6,
                        }}
                      >
                        {rankItems.map((item, index) => (
                          <View
                            key={index}
                            style={{
                              width: "33.33%",
                              paddingHorizontal: 6,
                              marginBottom: 12,
                            }}
                          >
                            <Pressable
                              onPress={() => handleItemClick(item)}
                              alignItems="center"
                              p={2}
                              borderRadius="lg"
                              _pressed={{ bg: hoverBgColor }}
                            >
                              <Box
                                alignItems="center"
                                justifyContent="center"
                                width={12}
                                height={12}
                                mb={1}
                              >
                                {item.icon}
                              </Box>
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                color={textColor}
                                textAlign="center"
                              >
                                {item.label}
                              </Text>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </Box>
                  )}
                </VStack>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Box>
  );
};

export default Dropdown;
