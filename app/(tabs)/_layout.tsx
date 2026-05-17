import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { palette } from '@/components/shop/shop-ui';
import { useCartCount } from '@/contexts/cart-count-context';
import { Ionicons } from '@expo/vector-icons';

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { count } = useCartCount();
  const visibleCount = Math.min(count, 99);

  return (
    <View style={styles.cartIconWrap}>
      <Ionicons size={23} name="cart-outline" color={color} />
      {!focused && count > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{visibleCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#c8b5f6',
        tabBarStyle: {
          backgroundColor: palette.primary,
          borderRadius: 18,
          borderTopWidth: 0,
          bottom: 22,
          height: 66,
          left: 24,
          paddingBottom: 12,
          paddingTop: 10,
          position: 'absolute',
          right: 24,
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={23} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons size={23} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, focused }) => <CartTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons size={23} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartIconWrap: {
    position: 'relative',
  },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: 'absolute',
    right: -12,
    top: -9,
  },
  cartBadgeText: {
    color: palette.primary,
    fontSize: 10,
    fontWeight: '900',
  },
});
