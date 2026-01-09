import type { Product, SwapOffer, ChatThread, NotificationItem } from '../types/models';

export function computeListingStatus(product: Product): 'active' | 'draft' | 'exchanged' {
  if (product.status === 'draft') return 'draft';
  if (product.isExchanged) return 'exchanged';
  return 'active';
}

export function computeKpis(args: {
  products: Product[];
  offers: SwapOffer[];
  threads: ChatThread[];
  notifications: NotificationItem[];
  nowIso?: string;
}) {
  const { products, offers, threads, notifications, nowIso } = args;
  const now = nowIso ? new Date(nowIso) : new Date();

  const activeListings = products.filter((p) => p.status !== 'draft' && !p.isExchanged).length;
  const draftListings = products.filter((p) => p.status === 'draft').length;
  const exchangedListings = products.filter((p) => p.isExchanged).length;
  const premiumListings = products.filter((p) => p.premium === true).length;
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const unreadNotifications = notifications.filter((n) => n.isRead === false).length;

  const activeChats = threads.filter((t) => {
    const dt = new Date(t.lastMessageTime);
    const diffDays = (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  return {
    activeListings,
    draftListings,
    exchangedListings,
    premiumListings,
    pendingOffers,
    unreadNotifications,
    activeChats,
  };
}
