import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PUMPPORTAL_KEY = "memepulse.pumpportal.api-key";

export async function loadPumpPortalKey() {
  if (Platform.OS === "web") return AsyncStorage.getItem(PUMPPORTAL_KEY);
  return SecureStore.getItemAsync(PUMPPORTAL_KEY);
}

export async function savePumpPortalKey(value: string) {
  const key = value.trim();
  if (Platform.OS === "web") {
    if (key) await AsyncStorage.setItem(PUMPPORTAL_KEY, key);
    else await AsyncStorage.removeItem(PUMPPORTAL_KEY);
    return;
  }
  if (key) await SecureStore.setItemAsync(PUMPPORTAL_KEY, key);
  else await SecureStore.deleteItemAsync(PUMPPORTAL_KEY);
}
