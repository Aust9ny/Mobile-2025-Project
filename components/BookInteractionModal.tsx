import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

type Props = {
  visible: boolean;
  book: any;
  onClose: () => void;
  onReturn: (id: string) => void;
  onExtend: (id: string) => void;
  canExtend: boolean;
};

export default function BookInteractionModal({
  visible,
  book,
  onClose,
  onReturn,
  onExtend,
  canExtend,
}: Props) {
  if (!book) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 350,
            padding: 25,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 20,
              textAlign: 'center',
              color: '#333',
            }}
          >
            {book.title}
          </Text>

          {/* ปุ่มคืนหนังสือ */}
          <Pressable
            onPress={() => onReturn(book.id)}
            android_ripple={{ color: '#d32f2f' }}
            style={{
              paddingVertical: 14,
              borderRadius: 10,
              backgroundColor: '#f44336',
              marginBottom: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              คืนหนังสือ
            </Text>
          </Pressable>

          {/* ปุ่มยืมต่อ */}
          <Pressable
            onPress={() => onExtend(book.id)}
            disabled={!canExtend}
            android_ripple={{ color: canExtend ? '#1976d2' : 'transparent' }}
            style={{
              paddingVertical: 14,
              borderRadius: 10,
              backgroundColor: canExtend ? '#2196f3' : '#B0C4DE',
              marginBottom: 15,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              ยืมต่อ
            </Text>
          </Pressable>

          {/* ปุ่มปิด */}
          <Pressable
            onPress={onClose}
            style={{
              paddingVertical: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#555', fontSize: 14 }}>ปิด</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
