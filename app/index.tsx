import { getToken } from "@/src/services/tokenServices";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLogin = async () => {
    const token = await getToken();
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);

  if (isLoading) return null;

  return isLoggedIn ? (
    <Redirect href="/(tabs)/watch" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
