import React, { useEffect, useRef, useState } from "react";
import {
    LayoutChangeEvent,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    ORDER,
    ProfileTourKey,
    profileTour,
    useProfileTour,
} from "./profileTourStore";

const TEXTS: Record<ProfileTourKey, { title: string; desc: string }> = {
    match: {
        title: "Your Matches",
        desc: "If you record a video and a rival user is found, your match appears among the top videos, and you can see the live vote count in real time!",
    },
    rank: {
        title: "Your Rank",
        desc: "This bar shows your progress in the current rank. Tap it to see all ranks and your score.",
    },
};

const UI = { next: "Next", done: "OK", skip: "Skip" };

const STEP_STYLE: Record<ProfileTourKey, { pad: number; round: boolean }> = {
    match: { pad: 4, round: false },
    bio: { pad: 4, round: false },
    badge: { pad: 2, round: true },
    rank: { pad: 4, round: false },
};

const DIM = "rgba(0,0,0,0.78)";
const TOOLTIP_HEIGHT_ESTIMATE = 200;

export default function ProfileHelper({ enabled }: { enabled: boolean }) {
    const { step, rects } = useProfileTour();
    const [visible, setVisible] = useState(true);
    const rootRef = useRef<View>(null);
    const [root, setRoot] = useState({ x: 0, y: 0, w: 0, h: 0 });

    useEffect(() => {
        if (enabled) profileTour.start();
    }, [enabled]);

    const rect = step ? rects[step] : undefined;

    useEffect(() => {
        // استپ match نیازی به منتظر ماندن برای تارگت ندارد
        if (step && step !== "match" && !rect) {
            const t = setTimeout(() => profileTour.next(), 2000);
            return () => clearTimeout(t);
        }
    }, [step, rect]);

    const close = () => {
        setVisible(false);
        profileTour.finish();
    };

    const onRootLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        rootRef.current?.measureInWindow((x, y) =>
            setRoot({ x, y, w: width, h: height }),
        );
    };

    if (!step || !visible) return null;

    const local =
        rect && root.w > 0
            ? { ...rect, x: rect.x - root.x, y: rect.y - root.y }
            : null;

    const index = ORDER.indexOf(step);
    const isLast = index === ORDER.length - 1;

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
                {step === "match" ? (
                    <FullScreenMatchModal
                        title={TEXTS.match.title}
                        desc={TEXTS.match.desc}
                        index={index}
                        total={ORDER.length}
                        isLast={isLast}
                        onNext={() => (isLast ? close() : profileTour.next())}
                        onSkip={close}
                    />
                ) : !local ? (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />
                ) : (
                    <Spotlight
                        rect={local}
                        screenW={root.w}
                        screenH={root.h}
                        title={TEXTS[step].title}
                        desc={TEXTS[step].desc}
                        pad={STEP_STYLE[step].pad}
                        round={STEP_STYLE[step].round}
                        index={index}
                        total={ORDER.length}
                        isLast={isLast}
                        onNext={() => (isLast ? close() : profileTour.next())}
                        onSkip={close}
                    />
                )}
            </View>
        </Modal>
    );
}

// کامپوننت تمام صفحه و دکمه فیکس شده برای استپ match
function FullScreenMatchModal({
    title,
    desc,
    index,
    total,
    isLast,
    onNext,
    onSkip,
}: {
    title: string;
    desc: string;
    index: number;
    total: number;
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
}) {
    return (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenContainer]}>
            <View style={styles.fullScreenContent}>
                <Text style={styles.fullScreenTitle}>{title}</Text>
                <Text style={styles.fullScreenDesc}>{desc}</Text>
            </View>

            <View style={styles.fixedBottomBar}>
                <View style={styles.row}>
                    {!isLast ? (
                        <Pressable onPress={onSkip} hitSlop={8}>
                            <Text style={styles.skipLight}>{UI.skip}</Text>
                        </Pressable>
                    ) : (
                        <View />
                    )}

                    <View style={styles.dots}>
                        {Array.from({ length: total }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    styles.dotLight,
                                    i === index && styles.dotActiveLight,
                                ]}
                            />
                        ))}
                    </View>

                    <Pressable style={styles.button} onPress={onNext}>
                        <Text style={styles.buttonText}>{isLast ? UI.done : UI.next}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

function Spotlight({
    rect,
    screenW,
    screenH,
    title,
    desc,
    pad,
    round,
    index,
    total,
    isLast,
    onNext,
    onSkip,
}: {
    rect: { x: number; y: number; width: number; height: number };
    screenW: number;
    screenH: number;
    title: string;
    desc: string;
    pad: number;
    round: boolean;
    index: number;
    total: number;
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
}) {
    const top = Math.max(rect.y - pad, 0);
    const left = Math.max(rect.x - pad, 0);
    const w = rect.width + pad * 2;
    const h = rect.height + pad * 2;
    const bottom = top + h;
    const right = left + w;

    const placeAbove = bottom + TOOLTIP_HEIGHT_ESTIMATE > screenH;
    const tooltipPos = placeAbove
        ? { bottom: screenH - top + 14 }
        : { top: bottom + 14 };
    const arrowLeft = Math.min(Math.max(left + w / 2 - 8, 28), screenW - 44);

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
                    { top, left, width: w, height: h, borderRadius: round ? 999 : 12 },
                ]}
            />

            <View style={[styles.tooltip, tooltipPos]}>
                <View
                    style={[
                        styles.arrow,
                        placeAbove ? { bottom: -8 } : { top: -8 },
                        { left: arrowLeft - 20 },
                    ]}
                />
                <Text style={styles.tooltipTitle}>{title}</Text>
                <Text style={styles.tooltipDesc}>{desc}</Text>

                <View style={styles.row}>
                    {!isLast ? (
                        <Pressable onPress={onSkip} hitSlop={8}>
                            <Text style={styles.skip}>{UI.skip}</Text>
                        </Pressable>
                    ) : (
                        <View />
                    )}

                    <View style={styles.dots}>
                        {Array.from({ length: total }).map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, i === index && styles.dotActive]}
                            />
                        ))}
                    </View>

                    <Pressable style={styles.button} onPress={onNext}>
                        <Text style={styles.buttonText}>{isLast ? UI.done : UI.next}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dim: { position: "absolute", backgroundColor: DIM },
    ring: { position: "absolute", borderWidth: 2, borderColor: "#fff" },

    // استایل‌های حالت فول‌اسکرین برای استپ match
    fullScreenContainer: {
        backgroundColor: DIM,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    fullScreenContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    fullScreenTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#111",
        marginBottom: 12,
        textAlign: "center",
    },
    fullScreenDesc: {
        fontSize: 16,
        color: "#4B5563",
        lineHeight: 24,
        textAlign: "center",
    },
    fixedBottomBar: {
        position: "absolute",
        bottom: 90,
        left: 24,
        right: 24,
    },
    skipLight: { color: "#E5E7EB", fontSize: 15, fontWeight: "600" },
    dotLight: { backgroundColor: "rgba(255,255,255,0.4)" },
    dotActiveLight: { backgroundColor: "#fff" },

    // تولتیپ‌های اسپات‌لایت
    tooltip: {
        position: "absolute",
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
    },
    arrow: {
        position: "absolute",
        width: 16,
        height: 16,
        backgroundColor: "#fff",
        transform: [{ rotate: "45deg" }],
        marginLeft: 20,
    },
    tooltipTitle: { fontSize: 17, fontWeight: "700", color: "#111", marginBottom: 4 },
    tooltipDesc: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
    row: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    skip: { color: "#6B7280", fontSize: 14, fontWeight: "600" },
    dots: { flexDirection: "row", gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
    dotActive: { backgroundColor: "#4F46E5" },
    button: {
        backgroundColor: "#4F46E5",
        paddingHorizontal: 22,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});