export type InventoryState = Readonly<{
  quantity: number;
  reservedQuantity: number;
}>;

function assertAmount(amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('INVALID_QUANTITY');
}

export function availableQuantity(state: InventoryState) {
  return Math.max(0, state.quantity - state.reservedQuantity);
}

export function reserveInventory(state: InventoryState, amount: number): InventoryState {
  assertAmount(amount);
  if (availableQuantity(state) < amount) throw new Error('INSUFFICIENT_STOCK');
  return { ...state, reservedQuantity: state.reservedQuantity + amount };
}

export function finalizeReservation(state: InventoryState, amount: number): InventoryState {
  assertAmount(amount);
  if (state.reservedQuantity < amount || state.quantity < amount) {
    throw new Error('INVALID_RESERVATION');
  }
  return {
    quantity: state.quantity - amount,
    reservedQuantity: state.reservedQuantity - amount,
  };
}

export function releaseReservation(state: InventoryState, amount: number): InventoryState {
  assertAmount(amount);
  if (state.reservedQuantity < amount) throw new Error('INVALID_RESERVATION');
  return { ...state, reservedQuantity: state.reservedQuantity - amount };
}
