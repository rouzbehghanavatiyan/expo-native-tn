import React, { useEffect, useRef, useState } from "react";
import {
    LayoutChangeEvent,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useWatchTour, watchTour } from "./watchTourStore";

const TEXTS = {
    title: "Watch Matches",
    desc: "In this page, you can watch the match of any of the users.",
    done: "OK",
};

const PAD = 2;
const DIM = "rgba(0,0,0,0.78)";
const TOOLTIP_HEIGHT_ESTIMATE = 170;

type Props = { enabled: boolean };

export default function WatchHelper({ enabled }: Props) {
    const { step, rect } = useWatchTour();
    const [visible, setVisible] = useState(true);

    const rootRef = useRef<View>(null);
    const [root, setRoot] = useState({ x: 0, y: 0, w: 0, h: 0 });

    useEffect(() => {
        if (enabled) watchTour.start();
    }, [enabled]);

    useEffect(() => {
        if (step && !rect) {
            const t = setTimeout(() => watchTour.finish(), 2500);
            return () => clearTimeout(t);
        }
    }, [step, rect]);

    const handleClose = () => {
        setVisible(false);
        watchTour.finish();
    };

    const onRootLayout = (e: LayoutChangeEvent) => {
        const { width, height } = e.nativeEvent.layout;
        rootRef.current?.measureInWindow((x, y) => {
            setRoot({ x, y, w: width, h: height });
        });
    };

    if (!step || !visible) return null;

    const local =
        rect && root.w > 0
            ? { ...rect, x: rect.x - root.x, y: rect.y - root.y }
            : null;

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={handleClose}
        >
            <View
                ref={rootRef}
                collapsable={false}
                style={StyleSheet.absoluteFill}
                onLayout={onRootLayout}
            >
                {!local ? (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: DIM }]} />
                ) : (
                    <Spotlight
                        rect={local}
                        screenW={root.w}
                        screenH={root.h}
                        onClose={handleClose}
                    />
                )}
            </View>
        </Modal>
    );
}

function Spotlight({
    rect,
    screenW,
    screenH,
    onClose,
}: {
    rect: { x: number; y: number; width: number; height: number };
    screenW: number;
    screenH: number;
    onClose: () => void;
}) {
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

    const arrowLeft = Math.min(Math.max(left + w / 2 - 8, 28), screenW - 44);

    return (
        <View style={StyleSheet.absoluteFill}>
            <View style={[styles.dim, { top: 0, left: 0, right: 0, height: top }]} />
            <View style={[styles.dim, { top: bottom, left: 0, right: 0, bottom: 0 }]} />
            <View style={[styles.dim, { top, left: 0, width: left, height: h }]} />
            <View style={[styles.dim, { top, left: right, right: 0, height: h }]} />

            {/* حلقه دور دو عکس */}
            <View
                pointerEvents="none"
                style={[styles.ring, { top, left, width: w, height: h }]}
            />

            <View style={[styles.tooltip, tooltipPos]}>
                <View
                    style={[
                        styles.arrow,
                        placeAbove ? { bottom: -8 } : { top: -8 },
                        { left: arrowLeft - 20 },
                    ]}
                />
                <Text style={styles.tooltipTitle}>{TEXTS.title}</Text>
                <Text style={styles.tooltipDesc}>{TEXTS.desc}</Text>
                <View style={styles.row}>
                    <Pressable style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{TEXTS.done}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dim: { position: "absolute", backgroundColor: DIM },
    ring: {
        position: "absolute",
        borderWidth: 2,
        borderColor: "#fff",
        borderTopRightRadius: 14,
        borderBottomLeftRadius: 14,
    },
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
    row: { marginTop: 14, flexDirection: "row", justifyContent: "flex-end" },
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