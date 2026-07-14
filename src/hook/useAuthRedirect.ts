import { usePathname, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

type UseAuthRedirectParams = {
  isInitializing: boolean;
  token: string | null;
  userId: any;
  userLoginId: any;
};

export function useAuthRedirect({
  isInitializing,
  token,
  userId,
  userLoginId,
}: UseAuthRedirectParams) {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";
    const isLoggedIn = Boolean(token);

    if (!isLoggedIn && !inAuthGroup && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    // if (isLoggedIn && inAuthGroup && pathname !== "/(tabs)/watch") {
    //   router.replace("/(tabs)/watch");
    // }
  }, [isInitializing, segments, token, userId, userLoginId, pathname, router]);
}
