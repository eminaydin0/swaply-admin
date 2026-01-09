import { create } from 'zustand';
import type {
  MockDb,
} from '../mock/mockDb';
import { createMockDb } from '../mock/mockDb';
import type { Product, SwapOffer, User } from '../types/models';

interface MockState {
  db: MockDb;

  // actions (mock moderation/admin operations)
  regenerate: () => void;
  toggleUserVerified: (userId: string | number) => void;
  banUser: (userId: string | number) => void;
  unbanUser: (userId: string | number) => void;

  toggleProductPremium: (productId: string | number, premiumType?: 'featured' | 'vitrin' | 'none') => void;
  markProductExchanged: (productId: string | number, exchanged: boolean) => void;
  toggleProductHidden: (productId: string | number) => void;

  forceCancelOffer: (offerId: string | number) => void;
  forceRejectOffer: (offerId: string | number) => void;
  forceAcceptOffer: (offerId: string | number) => void;
}

function updateUser(users: User[], userId: string | number, patch: Partial<User>): User[] {
  return users.map((u) => (String(u.id) === String(userId) ? { ...u, ...patch } : u));
}

function updateProduct(products: Product[], productId: string | number, patch: Partial<Product>): Product[] {
  return products.map((p) => (String(p.id) === String(productId) ? { ...p, ...patch } : p));
}

function updateOffer(offers: SwapOffer[], offerId: string | number, patch: Partial<SwapOffer>): SwapOffer[] {
  return offers.map((o) => (String(o.id) === String(offerId) ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o));
}

export const useMockStore = create<MockState>((set) => ({
  db: createMockDb(),

  regenerate: () => set({ db: createMockDb() }),

  toggleUserVerified: (userId) =>
    set((state) => ({
      db: {
        ...state.db,
        users: state.db.users.map((u) =>
          String(u.id) === String(userId) ? { ...u, verified: !u.verified } : u,
        ),
      },
    })),

  banUser: (userId) =>
    set((state) => ({
      db: {
        ...state.db,
        users: updateUser(state.db.users, userId, { role: 'user', onlineStatus: false }),
      },
    })),

  unbanUser: (userId) =>
    set((state) => ({
      db: {
        ...state.db,
        users: updateUser(state.db.users, userId, { onlineStatus: true }),
      },
    })),

  toggleProductPremium: (productId, premiumType) =>
    set((state) => {
      const current = state.db.products.find((p) => String(p.id) === String(productId));
      if (!current) return state;

      const nextPremium = premiumType ? premiumType !== 'none' : !current.premium;
      const nextType = premiumType ?? (nextPremium ? (current.premiumType === 'vitrin' ? 'featured' : 'vitrin') : 'none');

      return {
        db: {
          ...state.db,
          products: updateProduct(state.db.products, productId, {
            premium: nextPremium,
            isAd: nextPremium,
            premiumType: nextPremium ? nextType : 'none',
            premiumExpiryDate: nextPremium ? current.premiumExpiryDate ?? new Date(Date.now() + 7 * 864e5).toISOString() : null,
          }),
        },
      };
    }),

  markProductExchanged: (productId, exchanged) =>
    set((state) => ({
      db: {
        ...state.db,
        products: updateProduct(state.db.products, productId, { isExchanged: exchanged }),
      },
    })),

  toggleProductHidden: (productId) =>
    set((state) => {
      const current = state.db.products.find((p) => String(p.id) === String(productId));
      if (!current) return state;
      return {
        db: {
          ...state.db,
          products: updateProduct(state.db.products, productId, { hidden: !current.hidden }),
        },
      };
    }),

  forceCancelOffer: (offerId) =>
    set((state) => ({
      db: {
        ...state.db,
        offers: updateOffer(state.db.offers, offerId, { status: 'cancelled' }),
      },
    })),

  forceRejectOffer: (offerId) =>
    set((state) => ({
      db: {
        ...state.db,
        offers: updateOffer(state.db.offers, offerId, { status: 'rejected' }),
      },
    })),

  forceAcceptOffer: (offerId) =>
    set((state) => ({
      db: {
        ...state.db,
        offers: updateOffer(state.db.offers, offerId, { status: 'accepted' }),
      },
    })),
}));
