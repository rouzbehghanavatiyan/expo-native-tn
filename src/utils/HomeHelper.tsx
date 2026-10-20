import React, { useEffect, useRef, useState } from "react";
import {
    LayoutChangeEvent,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { introTour, Rect, useIntroTour } from "./introTourStore";

const TEXTS = {
    roles: {
        top: { title: "Top User", desc: "The top video belongs to the top user." },
        bottom: {
            title: "Bottom User",
            desc: "The bottom video belongs to the bottom user.",
        },
        // likes: "Number of likes for each user",
        // result: "Winner or loser of each match!",
    },
    follow: {
        title: "Follow",
        desc: "You can follow or unfollow this user anytime.",
    },
    gotIt: "Got it",
    done: "Finish",
    skip: "Skip",
};

const PAD = 6;
const DIM = "rgba(0,0,0,0.78)";
const TOOLTIP_HEIGHT_ESTIMATE = 170;

type Props = { enabled: boolean };

export default function HomeHelper({ enabled }: Props) {
    const { step, rects } = useIntroTour();
    const [visible, setVisible] = useState(true);

    const rootRef = useRef<View>(null);
    const [root, setRoot] = useState({ x: 0, y: 0, w: 0, h: 0 });

    useEffect(() => {
        if (enabled) {
            setVisible(true);
            introTour.start();
        }
    }, [enabled]);

    useEffect(() => {
        if (step) setVisible(true);
    }, [step]);

    const close = () => {
        setVisible(false);
        introTour.finish();
    };

    const onRootLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        rootRef.current?.measureInWindow((x, y) =>
            setRoot({ x, y, w: width, h: height }),
        );
    };

    if (!step || !visible || (step !== "roles" && step !== "follow")) return null;

    const rawRect = step === "follow" ? rects.follow : undefined;
    const local =
        rawRect && root.w > 0
            ? { ...rawRect, x: rawRect.x - root.x, y: rawRect.y - root.y }
            : undefined;

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={close}
        >
            <View
                ref={rootRef}
                collapsable={false}
                style={StyleSheet.absoluteFill}
                onLayout={onRootLayout}
            >
                {step === "roles" ? (
                    <RolesStep onNext={() => introTour.next()} />
                ) : (
                    <SpotlightStep
                        rect={local}
                        ready={root.w > 0}
                        screenW={root.w}
                        screenH={root.h}
                        title={TEXTS.follow.title}
                        desc={TEXTS.follow.desc}
                        onFinish={close}
                    />
                )}
            </View>
        </Modal>
    );
}


function RolesStep({ onNext }: { onNext: () => void }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.rolesRoot}>
                <View style={[styles.half, styles.halfTop]}>
                    {/* <View style={styles.likesBadge} pointerEvents="none">
                        <Text style={styles.likesText}>{TEXTS.roles.likes}</Text>
                        <View style={styles.likesBottomRow}>
                            <View style={styles.likesIconCenter}>
                                <Icon name={"thumb-up"} size={16} color={"#fff"} />
                            </View>
                            <Text style={styles.likeArrow}>↓</Text>
                        </View>
                    </View> */}

                    <Text style={styles.arrow}>↑</Text>
                    <Text style={styles.title}>{TEXTS.roles.top.title}</Text>
                    <Text style={styles.desc}>{TEXTS.roles.top.desc}</Text>

                    {/* <View style={[styles.resultBadge, styles.resultBadgeTop]} pointerEvents="none">
                        <Text style={styles.resultBadgeText}>{TEXTS.roles.result}</Text>
                    </View> */}
                </View>

                <View style={[styles.half, styles.halfBottom]}>
                    <Text style={styles.title}>{TEXTS.roles.bottom.title}</Text>
                    <Text style={styles.desc}>{TEXTS.roles.bottom.desc}</Text>
                    <Text style={styles.arrow}>↓</Text>

                    {/* <View style={[styles.resultBadge, styles.resultBadgeBottom]} pointerEvents="none">
                        <Text style={styles.resultBadgeText}>{TEXTS.roles.result}</Text>
                    </View> */}
                </View>

                <View style={styles.centerButtonWrap} pointerEvents="box-none">
                    <Pressable style={styles.button} onPress={onNext}>
                        <Text style={styles.buttonText}>{TEXTS.gotIt}</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}


/* ------------------------- Step 2: Follow Spotlight ----------------------- */

type SpotProps = {
    rect?: Rect;
    ready: boolean;
    screenW: number;
    screenH: number;
    title: string;
    desc: string;
    onFinish: () => void;
};

function SpotlightStep({
    rect,
    ready,
    screenW,
    screenH,
    title,
    desc,
    onFinish,
}: SpotProps) {
    useEffect(() => {
        if (ready && !rect) {
            const t = setTimeout(() => onFinish(), 400);
            return () => clearTimeout(t);
        }
    }, [rect, ready]);

    if (!rect) return <View style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />;

    const top = Math.max(rect.y - PAD, 0);
    const left = Math.max(rect.x - PAD, 0);
    const w = rect.width + PAD * 2;
    const h = rect.height + PAD * 2;
    const bottom = top + h;
    const right = left + w;

    const placeAbove = bottom + TOOLTIP_HEIGHT_ESTIMATE > screenH;
    const tooltipPos = placeAbove
        ? { bottom: screenH - top + 14 }
        : { top: bottom + 14 };
    const arrowLeft = Math.min(Math.max(left + w / 2 - 8, 24), screenW - 40);

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[styles.dim, { top: 0, left: 0, right: 0, height: top }]} />
            <View style={[styles.dim, { top: bottom, left: 0, right: 0, bottom: 0 }]} />
            <View style={[styles.dim, { top, left: 0, width: left, height: h }]} />
            <View style={[styles.dim, { top, left: right, right: 0, height: h }]} />

            <View
                pointerEvents="none"
                style={[
                    styles.ring,
                    { top, left, width: w, height: h, borderRadius: Math.min(w, h) / 2 },
                ]}
            />

            <View style={[styles.tooltip, tooltipPos]}>
                <View
                    style={[
                        styles.tooltipArrow,
                        placeAbove ? { bottom: -8 } : { top: -8 },
                        { left: arrowLeft - 20 },
                    ]}
                />
                <Text style={styles.tooltipTitle}>{title}</Text>
                <Text style={styles.tooltipDesc}>{desc}</Text>
                <View style={styles.tooltipRow}>
                    <Pressable onPress={onFinish} hitSlop={8}>
                        <Text style={styles.skip}>{TEXTS.skip}</Text>
                    </Pressable>
                    <Pressable style={styles.buttonSmall} onPress={onFinish}>
                        <Text style={styles.buttonText}>{TEXTS.done}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dim: { position: "absolute", backgroundColor: DIM },
    rolesRoot: {
        flex: 1,
        backgroundColor: DIM, 
    },
    half: {
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "rgba(255,255,255,0.7)",
        backgroundColor: "transparent", 
    },
    halfTop: { height: "48%", borderBottomWidth: 1 },
    halfBottom: { height: "52%", borderTopWidth: 1 },
    arrow: {
        color: "#fff",
        fontSize: 36,
        marginVertical: 6,
    },
    likeArrow: {
        position: "absolute",
        right: 0,
        color: "#FFD54A",
        fontSize: 18,
        fontWeight: "bold",
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 6,
    },
    desc: {
        color: "#ffffff",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
    likesBadge: {
        position: "absolute",
        bottom: 48,
        right: 12,
        maxWidth: "58%",
        backgroundColor: "transparent", 
        borderWidth: 1.5,
        borderColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 6,
    },
    likesText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 4,
    },
    resultBadge: {
        position: "absolute",
        alignSelf: "center",
        backgroundColor: "transparent", 
        borderWidth: 1.5,
        borderColor: "#FFD54A",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    resultBadgeTop: {
        bottom: 34,
    },
    resultBadgeBottom: {
        bottom: 14,
    },
    resultBadgeText: {
        color: "#FFD54A",
        fontSize: 11,
        fontWeight: "700",
        textAlign: "center",
    },
    centerButtonWrap: {
        position: "absolute",
        top: "48%",
        left: 0,
        right: 0,
        alignItems: "center",
        transform: [{ translateY: -16 }],
    },
    button: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 18,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    likesBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        marginTop: 2,
    },
    likesIconCenter: {
        alignItems: "center",
        justifyContent: "center",
    },
    buttonSmall: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 14,
        height: 30,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
    ring: { position: "absolute", borderWidth: 2, borderColor: "#fff" },
    tooltip: {
        position: "absolute",
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
    },
    tooltipArrow: {
        position: "absolute",
        width: 16,
        height: 16,
        backgroundColor: "#fff",
        transform: [{ rotate: "45deg" }],
        marginLeft: 20,
    },
    tooltipTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 4 },
    tooltipDesc: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
    tooltipRow: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skip: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
});
