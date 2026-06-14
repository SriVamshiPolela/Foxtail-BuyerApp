import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
  type TabListProps,
} from 'expo-router/ui';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCartStore, cartItemCount } from '@/store/cart';

type TabButtonProps = TabTriggerSlotProps & { icon?: string; badge?: number };

function TabButton({ icon = '', badge, isFocused, children, ...props }: TabButtonProps) {
  const labelColor = isFocused ? '#c75a28' : '#9ca3af';
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [s.tab, pressed && { opacity: 0.6 }]}
      hitSlop={{ top: 4, bottom: 4, left: 8, right: 8 }}
    >
      <View style={[s.iconWrap, isFocused && s.iconWrapActive]}>
        <Text style={[s.icon, isFocused && s.iconActive]}>{icon}</Text>
        {!!badge && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge > 9 ? '9+' : String(badge)}</Text>
          </View>
        )}
      </View>
      <Text style={[s.label, { color: labelColor }]}>{children as string}</Text>
    </Pressable>
  );
}

function BottomBar({ children, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  return (
    <View {...props} style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {children}
    </View>
  );
}

export default function AppTabs() {
  const count = useCartStore(cartItemCount);
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <BottomBar>
          {/* @ts-ignore icon is a custom prop passed through asChild */}
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="🏠">Home</TabButton>
          </TabTrigger>
          {/* @ts-ignore */}
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="🔍">Explore</TabButton>
          </TabTrigger>
          {/* @ts-ignore */}
          <TabTrigger name="cart" href="/cart" asChild>
            <TabButton icon="🛒" badge={count > 0 ? count : undefined}>Cart</TabButton>
          </TabTrigger>
          {/* @ts-ignore */}
          <TabTrigger name="orders" href="/orders" asChild>
            <TabButton icon="📦">Orders</TabButton>
          </TabTrigger>
          {/* @ts-ignore */}
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon="👤">Profile</TabButton>
          </TabTrigger>
        </BottomBar>
      </TabList>
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingBottom: 4,
    paddingTop: 2,
  },
  iconWrap: {
    position: 'relative',
    width: 48,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  iconWrapActive: {
    backgroundColor: '#fff3ef',
  },
  icon: { fontSize: 20 },
  iconActive: {},
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: '#c75a28',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },
  label: { fontSize: 10, fontWeight: '600' },
});
