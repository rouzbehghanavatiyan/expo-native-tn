import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";

export const useCachedVideo = (videoUrl: string | null | undefined) => {
  const [cachedSource, setCachedSource] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAndCacheVideo = async () => {
      if (!videoUrl) {
        console.log("CACHE_TEST: no video url");
        return;
      }

      try {
        console.log("CACHE_TEST: input url:", videoUrl);

        const urlWithoutQuery = videoUrl.split("?")[0];

        let filename = urlWithoutQuery.substring(
          urlWithoutQuery.lastIndexOf("/") + 1,
        );

        if (!filename) {
          filename = `video_${Date.now()}.mp4`;
        }

        const cacheDir = `${FileSystem.cacheDirectory}video_cache/`;
        const fileUri = `${cacheDir}${filename}`;

        console.log("CACHE_TEST: cacheDir:", cacheDir);
        console.log("CACHE_TEST: fileUri:", fileUri);

        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        console.log("CACHE_TEST: dir exists:", dirInfo.exists);

        if (!dirInfo.exists) {
          console.log("CACHE_TEST: creating cache directory...");
          await FileSystem.makeDirectoryAsync(cacheDir, {
            intermediates: true,
          });
        }

        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        console.log("CACHE_TEST: file exists:", fileInfo.exists);

        if (fileInfo.exists) {
          console.log("CACHE_TEST: ✅ using cached local file");
          console.log("CACHE_TEST: cached uri:", fileUri);

          if (isMounted) setCachedSource(fileUri);
        } else {
          console.log("CACHE_TEST: ❌ file not cached yet");
          console.log("CACHE_TEST: using remote url now:", videoUrl);

          if (isMounted) setCachedSource(videoUrl);

          console.log("CACHE_TEST: downloading video in background...");

          const downloadResult = await FileSystem.downloadAsync(
            videoUrl,
            fileUri,
          );

          console.log("CACHE_TEST: ✅ download finished");
          console.log("CACHE_TEST: downloaded uri:", downloadResult.uri);
          console.log("CACHE_TEST: status:", downloadResult.status);

          const downloadedFileInfo = await FileSystem.getInfoAsync(fileUri);
          console.log(
            "CACHE_TEST: downloaded file exists:",
            downloadedFileInfo.exists,
          );

          if (downloadedFileInfo.exists && "size" in downloadedFileInfo) {
            console.log(
              "CACHE_TEST: downloaded file size:",
              downloadedFileInfo.size,
            );
          }
        }
      } catch (error) {
        console.error("CACHE_TEST: cache error:", error);

        if (isMounted) setCachedSource(videoUrl);
      }
    };

    checkAndCacheVideo();

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  return cachedSource;
};
// import * as FileSystem from "expo-file-system/legacy";
// import { useEffect, useState } from "react";

// export const useCachedVideo = (videoUrl: string | null | undefined) => {
//   const [cachedSource, setCachedSource] = useState<string | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     const checkAndCacheVideo = async () => {
//       if (!videoUrl) return;

//       try {
//         // ۱. ساخت یک نام فایل امن و یکتا از روی URL (برای جلوگیری از تداخل نام‌ها)
//         // می‌توانید از توابع Hash هم استفاده کنید، اما اینجا نام فایل و پارامترها را استخراج می‌کنیم
//         const urlWithoutQuery = videoUrl.split("?")[0];
//         const filename = urlWithoutQuery.substring(
//           urlWithoutQuery.lastIndexOf("/") + 1,
//         );

//         // مسیر پوشه کش برای ویدیوها
//         const cacheDir = `${FileSystem.cacheDirectory}video_cache/`;
//         const fileUri = `${cacheDir}${filename}`;

//         // ۲. اطمینان از وجود پوشه کش
//         const dirInfo = await FileSystem.getInfoAsync(cacheDir);
//         if (!dirInfo.exists) {
//           await FileSystem.makeDirectoryAsync(cacheDir, {
//             intermediates: true,
//           });
//         }

//         // ۳. بررسی وجود فایل ویدیو در حافظه
//         const fileInfo = await FileSystem.getInfoAsync(fileUri);

//         if (fileInfo.exists) {
//           // ویدیو در کش موجود است، آدرس لوکال را برمی‌گردانیم
//           if (isMounted) setCachedSource(fileUri);
//         } else {
//           // ویدیو در کش نیست.
//           // برای جلوگیری از تاخیر در پخش، ابتدا آدرس اینترنتی را به پلیر می‌دهیم تا کاربر منتظر نماند
//           if (isMounted) setCachedSource(videoUrl);

//           // سپس در پس‌زمینه آن را برای دفعات بعد (مثلاً برگشتن دوباره به تب پروفایل) دانلود می‌کنیم
//           await FileSystem.downloadAsync(videoUrl, fileUri);
//         }
//       } catch (error) {
//         console.error("Error in caching video:", error);
//         // در صورت بروز هرگونه خطا، از همان آدرس اینترنتی استفاده می‌کنیم
//         if (isMounted) setCachedSource(videoUrl);
//       }
//     };

//     checkAndCacheVideo();

//     return () => {
//       isMounted = false; // برای جلوگیری از آپدیت استیت در کامپوننت‌های Unmount شده
//     };
//   }, [videoUrl]);

//   return cachedSource;
// };
