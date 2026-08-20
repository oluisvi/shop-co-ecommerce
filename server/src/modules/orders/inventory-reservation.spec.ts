import {
  availableQuantity,
  finalizeReservation,
  releaseReservation,
  reserveInventory,
} from './inventory-reservation.js';

describe('inventory reservation domain', () => {
  it('reserves only currently available stock', () => {
    expect(reserveInventory({ quantity: 1, reservedQuantity: 0 }, 1)).toEqual({
      quantity: 1,
      reservedQuantity: 1,
    });
    expect(() => reserveInventory({ quantity: 1, reservedQuantity: 1 }, 1)).toThrow(
      'INSUFFICIENT_STOCK',
    );
  });

  it('finalizes a reservation without double-decrementing available stock', () => {
    expect(finalizeReservation({ quantity: 1, reservedQuantity: 1 }, 1)).toEqual({
      quantity: 0,
      reservedQuantity: 0,
    });
  });

  it('releases reserved stock without changing physical quantity', () => {
    const released = releaseReservation({ quantity: 1, reservedQuantity: 1 }, 1);
    expect(released).toEqual({ quantity: 1, reservedQuantity: 0 });
    expect(availableQuantity(released)).toBe(1);
  });

  it('rejects invalid and duplicate reservation transitions', () => {
    expect(() => finalizeReservation({ quantity: 1, reservedQuantity: 0 }, 1)).toThrow(
      'INVALID_RESERVATION',
    );
    expect(() => releaseReservation({ quantity: 1, reservedQuantity: 0 }, 1)).toThrow(
      'INVALID_RESERVATION',
    );
  });
});
