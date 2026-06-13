import { Pressable, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useWishlistStore } from '@/store/wishlist';

type Props = {
  productId: string;
  style?: StyleProp<ViewStyle>;
  size?: number;
};

export function WishlistButton({ productId, style, size = 14 }: Props) {
  const isFav = useWishlistStore((s) => s.favoriteIds.includes(productId));
  const toggle = useWishlistStore((s) => s.toggleFavorite);

  return (
    <Pressable
      onPress={() => toggle(productId)}
      style={({ pressed }) => [style, pressed && { opacity: 0.6, transform: [{ scale: 0.85 }] }]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={{ fontSize: size }}>{isFav ? '❤️' : '🤍'}</Text>
    </Pressable>
  );
}
