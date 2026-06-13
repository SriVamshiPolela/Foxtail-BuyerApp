import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PressableScale } from './pressable-scale';
import { useCartStore } from '@/store/cart';
import type { Product } from '@/types';

type Props = {
  product: Product;
  variant?: 'list' | 'grid'; // list = compact (Home/Search), grid = full-width (Explore)
};

export function CartButton({ product, variant = 'list' }: Props) {
  const addItem   = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty  = useCartStore((s) => s.updateQty);
  const qty = useCartStore(
    (s) => s.items.find((i) => i.product.id === product.id)?.quantity ?? 0,
  );

  const decrement = () =>
    qty === 1 ? removeItem(product.id) : updateQty(product.id, -1);

  // Out of stock — grid only (list cards don't show disabled state)
  if (!product.inStock) {
    if (variant !== 'grid') return null;
    return (
      <View style={[s.addGrid, s.outOfStock]}>
        <Text style={s.addGridTxt}>Out of Stock</Text>
      </View>
    );
  }

  // Not in cart yet
  if (qty === 0) {
    return variant === 'grid' ? (
      <PressableScale style={s.addGrid} scale={0.97} onPress={() => addItem(product)}>
        <Text style={s.addGridTxt}>+ Add to Cart</Text>
      </PressableScale>
    ) : (
      <PressableScale style={s.addList} scale={0.94} onPress={() => addItem(product)}>
        <Text style={s.addListTxt}>+ Add</Text>
      </PressableScale>
    );
  }

  // In cart — show stepper
  const stepperStyle = variant === 'grid' ? s.stepperGrid : s.stepperList;

  return (
    <View style={stepperStyle}>
      <Pressable
        style={({ pressed }) => [s.stepBtn, pressed && { opacity: 0.6 }]}
        onPress={decrement}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={s.stepBtnTxt}>−</Text>
      </Pressable>

      <View style={s.stepCountWrap}>
        <Text style={s.stepCountTxt}>{qty}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [s.stepBtn, pressed && { opacity: 0.6 }]}
        onPress={() => updateQty(product.id, 1)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={s.stepBtnTxt}>+</Text>
      </Pressable>
    </View>
  );
}

const ORANGE = '#c75a28';

const s = StyleSheet.create({
  // ─── Add button ───────────────────────────────────────────────
  addList: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addListTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },

  addGrid: {
    backgroundColor: ORANGE,
    borderRadius: 10,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addGridTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  outOfStock: { backgroundColor: '#9ca3af', shadowOpacity: 0, elevation: 0 },

  // ─── Stepper ─────────────────────────────────────────────────
  stepperList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepperGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderRadius: 10,
    height: 34,
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 18 },

  stepCountWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingVertical: 4,
    minWidth: 26,
  },
  stepCountTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
