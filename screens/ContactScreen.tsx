import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Linking, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/ContactScreenStyle';

import LocationIcon from '../assets/mdi_location.png';
import OpenIcon from '../assets/streamline-ultimate_shop-sign-open-bold.png';
import PhoneIcon from '../assets/ion_call.png';
import WebsiteIcon from '../assets/streamline-plump_web-solid.png';

import FacebookIcon from '../assets/fe_facebook.png';
import LineIcon from '../assets/fa6-brands_line.png';
import InstagramIcon from '../assets/streamline_instagram-solid.png';
import YoutubeIcon from '../assets/mdi_youtube.png';

const { height } = Dimensions.get('window');

export default function ContactScreen() {
  const navigation = useNavigation<any>();
  const handleBack = () => navigation.goBack();
  const openLink = (url: string) => Linking.openURL(url).catch(err => console.error(err));
  const makeCall = (number: string) => Linking.openURL(`tel:${number}`).catch(err => console.error(err));

  return (
    <View style={{flex:1, backgroundColor:'#fff'}}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ติดต่อห้องสมุด</Text>
      </View>

      {/* เนื้อหา + Social + Back */}
      <View style={{flex:1, justifyContent:'space-between'}}>
        {/* เนื้อหา */}
        <View style={styles.contentContainer}>
          <Pressable style={styles.row} onPress={() => openLink('https://maps.app.goo.gl/Ty7q2Nj2W3HNN7p87')}>
            <Image source={LocationIcon} style={styles.icon} />
            <Text style={styles.text}>
              อาคาร 14 อาคารหอสมุดอนุสรณ์ 10 ปี{'\n'}
              เลขที่ 199 หมู่ 6 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230
            </Text>
          </Pressable>

          <View style={styles.row}>
            <Image source={OpenIcon} style={styles.icon} />
            <Text style={[styles.text, styles.openText]}>
              เปิดให้บริการ{'\n'}
              จ. - ศ. เวลา 8.30 - 18.30 น.{'\n'}
              ส. เวลา 8.30 - 16.30 น.
            </Text>
          </View>

          <Text style={[styles.text, styles.closeText]}>
            ปิดทำการ{'\n'}วันอาทิตย์ และวันหยุดนักขัตฤกษ์
          </Text>

          <Pressable style={styles.row} onPress={() => makeCall('0383545804')}>
            <Image source={PhoneIcon} style={styles.icon} />
            <Text style={styles.text}>โทรศัพท์ : 038-354580-4 ต่อ 666901</Text>
          </Pressable>

          <Pressable onPress={() => makeCall('0657162632')}>
            <Text style={styles.text}>มือถือ : 065-7162632</Text>
          </Pressable>
        </View>

        {/* Social + Website + Back */}
        <View style={styles.footer}>
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialItem} onPress={() => openLink('https://facebook.com/libsiracha/')}>
              <Image source={FacebookIcon} style={styles.socialIcon} />
              <Text style={styles.socialText}>libsiracha</Text>
            </Pressable>

            <Pressable style={styles.socialItem} onPress={() => openLink('https://line.me/page.line.me/034mfskq')}>
              <Image source={LineIcon} style={styles.socialIcon} />
              <Text style={styles.socialText}>@kusrc_library</Text>
            </Pressable>

            <Pressable style={styles.socialItem} onPress={() => openLink('https://instagram.com/kusrc_library/')}>
              <Image source={InstagramIcon} style={styles.socialIcon} />
              <Text style={styles.socialText}>kusrc_library</Text>
            </Pressable>

            <Pressable style={styles.socialItem} onPress={() => openLink('https://www.youtube.com/channel/UC4mP6a2YitdZtxZbTVzISVA')}>
              <Image source={YoutubeIcon} style={styles.socialIcon} />
              <Text style={styles.socialText}>KUSRC Library</Text>
            </Pressable>

            <Pressable style={styles.socialItem} onPress={() => openLink('https://lib.src.ku.ac.th/')}>
              <Image source={WebsiteIcon} style={styles.socialIcon} />
              <Text style={styles.socialText}>lib.src.ku.ac.th</Text>
            </Pressable>
          </View>

          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>ย้อนกลับ</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
