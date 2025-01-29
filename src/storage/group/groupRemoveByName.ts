import AsyncStorage from "@react-native-async-storage/async-storage";
import { GROUP_COLLECTION, PLAYER_COLLECTION } from "@storage/storageConfig";
import { AppError } from "@utils/AppError";
import { groupsGetAll } from "./groupsGetAll";

export async function groupRemoveByName(groupName: string) {
  try {
    const storagedGroups = await groupsGetAll();
    const filtered = storagedGroups.filter((group) => group !== groupName);
    const updated = JSON.stringify(filtered);

    await AsyncStorage.setItem(GROUP_COLLECTION, updated);
    await AsyncStorage.removeItem(`${PLAYER_COLLECTION}-${groupName}`);
  } catch (error) {
    throw error;
  }
}
