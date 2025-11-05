interface UserSyncData {
  userId: string;
  email: string | null;
  name: string | null;
  firebaseToken: string;
}

/**
 * Sends user data to your backend to be saved or updated in the MySQL database.
 * Your backend would then verify the token and perform the database operation.
 * @param userData - The user data to sync.
 */
export const syncUserToBackend = async (userData: UserSyncData) => {
  console.log("SYNCING USER TO BACKEND:", userData);

  // This should be the address of your local backend server.
  // For Android emulator, '10.0.2.2' points to your computer's localhost.
  const backendApiUrl = "http://10.0.2.2:3000/api/user/sync";

  try {
    const response = await fetch(backendApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send the token for backend verification
        Authorization: `Bearer ${userData.firebaseToken}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to sync user with backend.");
    }

    console.log("User synced successfully with backend.");
  } catch (error) {
    console.error("Error syncing user to backend:", error);
    // Here you might want to implement a retry mechanism or flag for later sync
  }
};
