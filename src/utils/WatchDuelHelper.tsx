import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STORAGE_KEY = "watch_helper_seen_v1";
const DIM = "rgba(0,0,0,0.82)";
const ACCENT = "#4F46E5";

const TEXTS = {
    top: { title: "Top User", desc: "The top video belongs to the top user." },
    bottom: {
        title: "Bottom User",
        desc: "The bottom video belongs to the bottom user.",
    },
    important: {
        title: "Very Important",
        matchTimeText: "During the match, ",
        descRest: "affects the ranking of users.\nSo please vote carefully and choose the right one.",
    },
    next: "Next",
    done: "Got it",
    skip: "Skip",
};

type Props = { enabled: boolean };

export default function WatchDuelHelper({ enabled }: Props) {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);

    useEffect(() => {
        if (!enabled) return;
        let mounted = true;
        AsyncStorage.getItem(STORAGE_KEY)
            .then((seen) => {
                if (mounted && !seen) {
                    setStep(1);
                    setVisible(true);
                }
            })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, [enabled]);

    const finish = () => {
        setVisible(false);
        AsyncStorage.setItem(STORAGE_KEY, "1").catch(() => { });
    };

    if (!visible) return null;

    return (
        <View style={styles.root}>
            {step === 1 ? (
                <>
                    {/* Top half */}
                    <View style={[styles.half, styles.halfTop]}>
                        <Text style={styles.arrow}>↑</Text>
                        <Text style={styles.title}>{TEXTS.top.title}</Text>
                        <Text style={styles.desc}>{TEXTS.top.desc}</Text>
                    </View>

                    {/* Middle line */}
                    <View style={styles.lineWrap} pointerEvents="box-none">
                        <View style={styles.line} />
                        <Pressable style={styles.button} onPress={() => setStep(2)}>
                            <Text style={styles.buttonText}>{TEXTS.next}</Text>
                        </Pressable>
                    </View>

                    {/* Bottom half */}
                    <View style={[styles.half, styles.halfBottom]}>
                        <Text style={styles.title}>{TEXTS.bottom.title}</Text>
                        <Text style={styles.desc}>{TEXTS.bottom.desc}</Text>
                        <Text style={styles.arrow}>↓</Text>
                    </View>

                    <Pressable style={styles.skipWrap} onPress={finish} hitSlop={10}>
                        <Text style={styles.skip}>{TEXTS.skip}</Text>
                    </Pressable>
                </>
            ) : (
                <View style={styles.center}>
                    <View style={styles.card}>
                        <Text style={styles.warnIcon}>⚠️</Text>

                        <View style={styles.inlineRow}>
                            <MaterialIcons name="thumb-up" size={18} color="#EF4444" />
                            <Text style={styles.highlightRedText}> Your vote </Text>
                        </View>

                        <Text style={styles.cardDesc}>
                            <Text style={styles.boldBlackText}>{TEXTS.important.matchTimeText}</Text>
                            {TEXTS.important.descRest}
                        </Text>

                        <Pressable style={styles.buttonWide} onPress={finish}>
                            <Text style={styles.buttonText}>{TEXTS.done}</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: DIM,
        zIndex: 9000,
    },
    highlightRedText: {
        color: "#EF4444",
        fontWeight: "bold",
        fontSize: 14,
    },
    boldBlackText: {
        color: "#111111",
        fontWeight: "bold",
    },
    half: {
        position: "absolute",
        left: 0,
        right: 0,
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    halfTop: { height: "40%", top: 0 },
    halfBottom: { height: "52%", bottom: 0 },
    arrow: { color: "#fff", fontSize: 36, marginVertical: 6 },
    title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 6 },
    desc: { color: "#fff", fontSize: 14, textAlign: "center", lineHeight: 20 },

    lineWrap: {
        position: "absolute",
        top: "47%",
        left: 0,
        right: 0,
        height: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    line: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 0,
        borderTopWidth: 2,
        borderStyle: "dashed",
        borderColor: "rgba(255,255,255,0.8)",
    },
    button: {
        backgroundColor: ACCENT,
        paddingHorizontal: 20,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonWide: {
        backgroundColor: ACCENT,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "stretch",
        marginTop: 18,
    },
    buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },

    skipWrap: { position: "absolute", top: 16, right: 20 },
    skip: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" },

    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    card: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 22,
        alignItems: "center",
    },
    warnIcon: { fontSize: 20, marginBottom: 8 },
    cardTitle: { fontSize: 19, fontWeight: "800", color: "#111", marginBottom: 8 },
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 14,
        color: "#4B5563",
        lineHeight: 21,
        textAlign: "center",
    },
    highlightText: {
        color: "#EF4444",
        fontWeight: "bold",
        fontSize: 14,
        marginLeft: 6,
    },
});
