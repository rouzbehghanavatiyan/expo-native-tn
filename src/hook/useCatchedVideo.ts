import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

export const useCachedVideo = (videoUrl: string | null | undefined) => {
  const [cachedSource, setCachedSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkAndCacheVideo = async () => {
      if (!videoUrl) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) setIsLoading(true);

      try {
        const urlWithoutQuery = videoUrl.split("?")[0];

        let filename = urlWithoutQuery.substring(
          urlWithoutQuery.lastIndexOf("/") + 1,
        );

        if (!filename) {
          filename = `video_${Date.now()}.mp4`;
        }

        const cacheDir = `${FileSystem.cacheDirectory}video_cache/`;
        const fileUri = `${cacheDir}${filename}`;

        const dirInfo = await FileSystem.getInfoAsync(cacheDir);

        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, {
            intermediates: true,
          });
        }

        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (fileInfo.exists) {
          if (isMounted) setCachedSource(fileUri);
        } else {
          if (isMounted) setCachedSource(videoUrl);

          FileSystem.downloadAsync(videoUrl, fileUri).catch((err) => {
            console.error("Download error:", err);
          });
        }
      } catch (error) {
        console.error("CACHE_TEST: cache error:", error);

        if (isMounted) setCachedSource(videoUrl);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkAndCacheVideo();

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  return { url: cachedSource, isLoading };
};
