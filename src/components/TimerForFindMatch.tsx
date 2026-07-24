let timer: ReturnType<typeof setTimeout> | null = null;

export const startMatchTimer = (callback: () => void) => {
    stopMatchTimer();

    timer = setTimeout(callback, 120000);
};

export const stopMatchTimer = () => {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};