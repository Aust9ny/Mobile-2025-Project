// styles/LoginScreenStyle.tsx
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // --- Container ---
  container: {
    flex: 1,
    backgroundColor: "#F7F7F0",
  },
  headerContainer: {
    height: 500,
    backgroundColor: "#0A4851",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  // --- Text styles ---
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A4851",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  otpInfo: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  // --- Input ---
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#E8E8E8",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
  },

  // --- Button ---
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#0A4851",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#A9C6CB",
  },
  resendButton: {
    marginTop: 10,
  },

  // --- OTP ---
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A4851",
  },
});

export default styles;
