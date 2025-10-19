import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "../assets/Icon.png";
import styles from "../styles/LoginScreenStyle";

// --- Mock Auth Hook ---
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  const sendOtp = (phone: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (phone && phone.length > 9) {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 5 * 60 * 1000);
        setConfirmation({ phone, expiry: expiryDate });
      } else setError("เบอร์โทรศัพท์ไม่ถูกต้อง");
      setLoading(false);
    }, 2000);
  };

  const confirmOtp = (code: string) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (confirmation && code === "123456") {
        const newUserId = `uid_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(newUserId);
        setConfirmation(null);
      } else setError("รหัส OTP ไม่ถูกต้อง");
      setLoading(false);
    }, 2000);
  };

  return { sendOtp, confirmOtp, userId, loading, error, confirmation };
};

// --- Format OTP Expiry ---
const formatExpiry = (date: Date) => {
  const thaiMonths = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `วันหมดอายุ ${day} ${month} ${year}\nเวลา ${hours}:${minutes} น.`;
};

// --- Login Form ---
const LoginForm = ({ onSendOtp, loading, error }: any) => {
  const [phone, setPhone] = useState("");
  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>เข้าสู่ระบบผ่าน OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="กรุณากรอกเบอร์โทรศัพท์"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, (loading || !phone) && styles.buttonDisabled]}
        onPress={() => onSendOtp(phone)}
        disabled={loading || !phone}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>}
      </TouchableOpacity>
    </View>
  );
};

// --- OTP Form ---
const OtpForm = ({ onConfirmOtp, loading, error, confirmation, onResendOtp }: any) => {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputs = useRef<any[]>([]);

  useEffect(() => {
    if (confirmation) {
      const expiryTime = confirmation.expiry.getTime();
      const updateTime = () => {
        const now = new Date().getTime();
        const diff = Math.max(Math.floor((expiryTime - now)/1000),0);
        setTimeLeft(diff);
      };
      updateTime();
      const interval = setInterval(updateTime,1000);
      return () => clearInterval(interval);
    }
  }, [confirmation]);

  const formatCountdown = (seconds:number) => {
    const min = Math.floor(seconds/60).toString().padStart(2,"0");
    const sec = (seconds%60).toString().padStart(2,"0");
    return `${min}:${sec}`;
  };

  const handleOtpChange = (text:string,index:number) => {
    if (/^[0-9]$/.test(text) || text==="") {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text!=="" && index<5) inputs.current[index+1].focus();
    }
  };

  const handleKeyPress = (e:any,index:number) => {
    if(e.nativeEvent.key==="Backspace" && otp[index]==="" && index>0){
      inputs.current[index-1].focus();
    }
  };

  const otpCode = otp.join("");
  const isOtpComplete = otpCode.length===6;

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Verify OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit,index)=>(
          <TextInput
            key={index}
            ref={(ref)=>(inputs.current[index]=ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text)=>handleOtpChange(text,index)}
            onKeyPress={(e)=>handleKeyPress(e,index)}
            value={digit}
          />
        ))}
      </View>

      {confirmation && (
        <>
          <Text style={styles.otpInfo}>{formatExpiry(confirmation.expiry)}</Text>
          <Text style={[styles.otpInfo,{fontWeight:"bold",color:"#0A4851"}]}>
            เวลาเหลือ: {formatCountdown(timeLeft)}
          </Text>
        </>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button,(loading || !isOtpComplete || timeLeft===0) && styles.buttonDisabled]}
        onPress={()=>onConfirmOtp(otpCode)}
        disabled={loading || !isOtpComplete || timeLeft===0}
      >
        {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>ยืนยัน</Text>}
      </TouchableOpacity>

      {timeLeft===0 && (
        <TouchableOpacity style={[styles.button,styles.resendButton]} onPress={onResendOtp}>
          <Text style={styles.buttonText}>ส่ง OTP ใหม่</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- Main Component ---
const LoginScreen = () => {
  const { sendOtp, confirmOtp, userId, loading, error, confirmation } = useAuth();
  const [phoneNumber,setPhoneNumber] = useState("");

  const handleSendOtp = (phone:string) => { setPhoneNumber(phone); sendOtp(phone); };
  const handleResendOtp = () => sendOtp(phoneNumber);

  if(userId){
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}/>
        <View style={styles.formContainer}>
          <Text style={styles.title}>เข้าสู่ระบบสำเร็จ!</Text>
          <Text style={styles.subtitle}>UserID: {userId}</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.container}>
      <StatusBar barStyle="light-content"/>
      <View style={styles.headerContainer}>
        <Image source={Icon} style={styles.logo}/>
      </View>
      {!confirmation ? (
        <LoginForm onSendOtp={handleSendOtp} loading={loading} error={error}/>
      ):(
        <OtpForm
          onConfirmOtp={confirmOtp}
          loading={loading}
          error={error}
          confirmation={confirmation}
          onResendOtp={handleResendOtp}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
