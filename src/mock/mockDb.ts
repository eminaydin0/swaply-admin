import { fakerTR as faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import type {
  User,
  Product,
  SwapOffer,
  ChatThread,
  ChatMessage,
  NotificationItem,
  ReportItem,
  NotificationSettings,
  LocationSettings,
  TrustScore,
  Category,
  NotificationType,
  ReportCategory,
} from '../types/models';

export interface MockDb {
  seed: number;
  categories: Category[];
  users: User[];
  products: Product[];
  offers: SwapOffer[];
  threads: ChatThread[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  notificationSettingsByUserId: Record<string, NotificationSettings>;
  locationSettingsByUserId: Record<string, LocationSettings>;
  trustScoresByUserId: Record<string, TrustScore>;
  recentSearchTerms: Array<{ term: string; count: number }>;
}

const SEED = 20260109;

const TURKISH_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];
const COUNTRY = 'Türkiye';

const CATEGORY_SEED: Category[] = [
  { id: 1, name: 'Elektronik', icon: 'phone', color: '#00aae4', slug: 'elektronik' },
  { id: 2, name: 'Moda', icon: 'shirt', color: '#5E35B1', slug: 'moda' },
  { id: 3, name: 'Ev & Yaşam', icon: 'home', color: '#4CAF50', slug: 'ev-yasam' },
  { id: 4, name: 'Araç', icon: 'car', color: '#F44336', slug: 'arac' },
  { id: 5, name: 'Emlak', icon: 'building', color: '#8884d8', slug: 'emlak' },
  { id: 6, name: 'Spor', icon: 'dumbbell', color: '#82ca9d', slug: 'spor' },
  { id: 7, name: 'Oyun', icon: 'gamepad', color: '#cf1322', slug: 'oyun' },
  { id: 8, name: 'Anne & Bebek', icon: 'baby', color: '#ff85c0', slug: 'anne-bebek' },
];

const TURKISH_SENTENCES = [
  "Merhaba, bu ürün hala satılık mı?",
  "Son fiyat ne olur?",
  "Takas düşünür müsünüz?",
  "Ürünün garantisi devam ediyor mu?",
  "Bugün kargoya verebilir misiniz?",
  "İstanbul içi elden teslim alabilirim.",
  "Biraz indirim yapabilirseniz hemen alacağım.",
  "Ürünün daha net fotoğraflarını gönderebilir misiniz?",
  "Teşekkürler, iyi satışlar.",
  "Tam aradığım model, ayırabilir misiniz?",
  "Merhaba, takas teklifimi gördünüz mü?",
  "Kutusu ve faturası var mı?",
  "Neden satıyorsunuz acaba?",
  "Ciddi alıcıyım, dönüş yapar mısınız?",
  "Profilimdeki ürünlerle takas olur mu?"
];

const TURKISH_DESCRIPTIONS = [
  "Ürün çok temiz kullanılmıştır, hiçbir çiziği yoktur. Kutusu ve faturası mevcuttur. İhtiyaç fazlası olduğu için satıyorum.",
  "Sıfır ayarında, sadece birkaç kez kullanıldı. Garantisi devam etmektedir. Alıcısına şimdiden hayırlı olsun.",
  "Ufak tefek kullanım izleri mevcuttur ancak çalışmasına engel değildir. Fiyatı bu yüzden uygun tuttum.",
  "Yurtdışından hediye geldi, pasaport kaydı yapılmıştır. Yanında kılıfı hediye edilecektir. Pazarlık payı vardır.",
  "Acil nakit ihtiyacından dolayı satılıktır. Takas teklif etmeyiniz. Sadece ciddi alıcılar yazsın.",
  "Kozmetik olarak 10/9 durumdadır. Bataryası yeni değişti. Sorunsuz çalışıyor.",
  "Taşınma sebebiyle eşyalarımı satıyorum. Diğer ilanlarıma da bakabilirsiniz. Toplu alımda indirim yaparım.",
  "Ürünü anlatmaya gerek yok, bilen bilir. Tertemiz collectors item."
];

const TURKISH_REPORT_MESSAGES = [
  "Bu kullanıcı dolandırıcı olabilir, ödemeyi yaptım ama ürünü göndermedi.",
  "İlandaki fotoğraflar ürünün kendisine ait değil, internetten alınmış.",
  "Uygunsuz içerik ve küfürlü konuşmalar içeriyor.",
  "Ürün açıklamasında yanıltıcı bilgiler var.",
  "Sürekli spam mesajlar atıyor, rahatsız ediliyorum.",
  "Kargo ücretini ben ödememe rağmen karşı ödemeli gönderdi.",
  "Ürün orijinal değil, replika ürün satmaya çalışıyor."
];

const TURKISH_SUGGESTION_MESSAGES = [
  "Uygulamaya karanlık mod gelmeli, akşamları göz yoruyor.",
  "Mesajlarda sesli mesaj özelliği olsa çok iyi olur.",
  "İlanlara video ekleme özelliği getirilmeli.",
  "Kargo entegrasyonu yapılarak takip numarası otomatik düşmeli.",
  "Daha fazla kategori eklenmeli, mesela enstrümanlar.",
  "Favoriye eklediğim ürünlerin fiyatı düşünce bildirim gelsin.",
  "Profilime kapak fotoğrafı eklemek istiyorum.",
  "Harita üzerinden ilan arama özelliği çok kullanışlı olurdu."
];

const TURKISH_BIOS = [
  "Teknoloji meraklısı, dürüst satıcı.",
  "Sadece İstanbul içi elden teslim.",
  "Takas tekliflerine açığım.",
  "Her türlü elektronik ürün alınır satılır.",
  "Güvenilir alışveriş.",
  "Hızlı kargo, özenli paketleme.",
  "Bana sormadan ürün almayın.",
  "Öğrenciyim, uygun fiyata bırakıyorum."
];

function pick<T>(arr: T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })]!;
}

function isoDaysAgo(days: number) {
  return dayjs().subtract(days, 'day').toISOString();
}

function makeUsername(firstName: string, lastName: string) {
  const base = `${firstName}.${lastName}`
    .toLowerCase()
    .replaceAll('ı', 'i')
    .replaceAll('ş', 's')
    .replaceAll('ğ', 'g')
    .replaceAll('ç', 'c')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .replace(/[^a-z0-9.]/g, '');
  return `@${base}${faker.number.int({ min: 0, max: 999 })}`;
}

function makeNotificationSettings(): NotificationSettings {
  return {
    pushEnabled: true,
    swapOffers: true,
    swapAccepted: true,
    swapRejected: true,
    newMessages: true,
    productViewed: true,
    newFollowers: true,

    emailEnabled: false,
    emailSwapUpdates: false,
    emailWeeklyDigest: false,
    emailPromotions: false,

    quietHoursEnabled: false,
    quietHoursStart: '23:00',
    quietHoursEnd: '08:00',
  };
}

function makeLocationSettings(city: string): LocationSettings {
  const districts = ['Merkez', 'Kadıköy', 'Beşiktaş', 'Çankaya', 'Konak', 'Nilüfer'];
  const defaultLocation = {
    id: faker.number.int({ min: 1, max: 9999 }),
    city,
    district: pick(districts),
  };

  const historyCount = faker.number.int({ min: 3, max: 12 });
  const history = Array.from({ length: historyCount }).map((_, i) => {
    const d = dayjs().subtract(i, 'day');
    return {
      id: faker.number.int({ min: 1, max: 9999 }),
      city,
      district: pick(districts),
      date: d.format('YYYY-MM-DD'),
      time: d.format('HH:mm'),
    };
  });

  return {
    locationPermission: true,
    defaultLocation,
    nearbyRadiusKm: pick([5, 10, 20, 50] as const),
    history,
  };
}

function makeTrustScore(userId: string | number): TrustScore {
  // Keep overall in 0-5 and factors consistent.
  const factors = [
    { id: 'completed-swaps' as const, maxScore: 1 },
    { id: 'ratings' as const, maxScore: 1 },
    { id: 'response-time' as const, maxScore: 1 },
    { id: 'profile-completeness' as const, maxScore: 1 },
    { id: 'verification' as const, maxScore: 1 },
  ].map((f) => ({
    ...f,
    score: faker.number.float({ min: 0.2, max: f.maxScore, fractionDigits: 2 }),
  }));

  const overallScore = Number(
    (factors.reduce((sum, f) => sum + f.score, 0) / factors.length).toFixed(2),
  );

  return {
    userId,
    overallScore,
    factors,
  };
}

function makeProductTitle(categoryName: string) {
  const examples: Record<string, string[]> = {
    Elektronik: ['iPhone 13 Pro Max', 'AirPods Pro', 'PlayStation 5', 'MacBook Air M1', 'Samsung Galaxy S23'],
    Moda: ['Nike Air Force', 'Deri Ceket', 'Kışlık Mont', 'Çanta', 'Saat'],
    'Ev & Yaşam': ['Kahve Makinesi', 'Robot Süpürge', 'Airfryer', 'Masa Lambası', 'Halı'],
    Araç: ['Araç Multimedya', 'Kask', 'Araç Kamera', 'Lastik Seti', 'Akü'],
    Emlak: ['Kiralık Daire İlanı', 'Satılık Arsa', 'Ofis', 'Depo', 'Villa'],
    Spor: ['Dambıl Seti', 'Koşu Bandı', 'Bisiklet', 'Pilates Matı', 'Spor Çantası'],
    Oyun: ['Nintendo Switch', 'Oyun Kolu', 'RGB Klavye', 'Gaming Mouse', 'Monitor'],
    'Anne & Bebek': ['Bebek Arabası', 'Ana Kucağı', 'Biberon Seti', 'Mama Sandalyesi', 'Beşik'],
  };
  const list = examples[categoryName] ?? ['Ürün'];
  return pick(list);
}

function makeImageUrls(count: number) {
  // Use picsum with deterministic query parts.
  return Array.from({ length: count }).map(() => {
    const id = faker.number.int({ min: 1, max: 1000 });
    return `https://picsum.photos/seed/${id}/640/480`;
  });
}

export function createMockDb(options?: {
  seed?: number;
  usersCount?: number;
  productsCount?: number;
  offersCount?: number;
  threadsCount?: number;
  messagesCount?: number;
  notificationsCount?: number;
  reportsCount?: number;
}): MockDb {
  const seed = options?.seed ?? SEED;
  faker.seed(seed);

  const usersCount = options?.usersCount ?? 80;
  const productsCount = options?.productsCount ?? 400;
  const offersCount = options?.offersCount ?? 300;
  const threadsCount = options?.threadsCount ?? 180;
  const messagesCount = options?.messagesCount ?? 4000;
  const notificationsCount = options?.notificationsCount ?? 1200;
  const reportsCount = options?.reportsCount ?? 120;

  const categories = CATEGORY_SEED;

  const users: User[] = Array.from({ length: usersCount }).map((_, idx) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const city = pick(TURKISH_CITIES);
    const fullName = `${firstName} ${lastName}`;
    const role = idx === 0 ? 'admin' : faker.helpers.weightedArrayElement([
      { weight: 92, value: 'user' },
      { weight: 6, value: 'moderator' },
      { weight: 2, value: 'admin' },
    ]);

    return {
      id: idx + 1,
      firstName,
      lastName,
      fullName,
      username: makeUsername(firstName, lastName),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `+90 5${faker.number.int({ min: 0, max: 9 })}${faker.number.int({ min: 100, max: 999 })} ${faker.number.int({ min: 100, max: 999 })} ${faker.number.int({ min: 10, max: 99 })} ${faker.number.int({ min: 10, max: 99 })}`,
      avatar: faker.image.avatar(),
      bio: pick(TURKISH_BIOS),
      location: `${city}, ${COUNTRY}`,
      city,
      country: COUNTRY,
      address: faker.location.streetAddress(),
      verified: faker.datatype.boolean({ probability: 0.25 }),
      role,
      onlineStatus: faker.datatype.boolean({ probability: 0.35 }),
      isPremium: faker.datatype.boolean({ probability: 0.18 }),
      joinDate: isoDaysAgo(faker.number.int({ min: 0, max: 900 })),
      lastActive: isoDaysAgo(faker.number.int({ min: 0, max: 10 })),
      rating: faker.number.float({ min: 3.2, max: 5, fractionDigits: 1 }),
      responseRate: faker.number.int({ min: 40, max: 100 }),
      favoritesProductIds: [],
      followersCount: faker.number.int({ min: 0, max: 20000 }),
      followingCount: faker.number.int({ min: 0, max: 5000 }),
    };
  });

  // Products
  const products: Product[] = Array.from({ length: productsCount }).map((_, idx) => {
    const owner = pick(users);
    const category = pick(categories);
    const imageCount = faker.number.int({ min: 1, max: 6 });
    const images = makeImageUrls(imageCount);
    const premium = faker.datatype.boolean({ probability: 0.08 });
    const premiumType = premium
      ? faker.helpers.weightedArrayElement([
          { weight: 55, value: 'featured' },
          { weight: 45, value: 'vitrin' },
        ])
      : 'none';

    const isExchanged = faker.datatype.boolean({ probability: 0.15 });
    const isDraft = faker.datatype.boolean({ probability: 0.10 });
    const condition = pick(['new', 'slightly-used', 'used'] as const);

    const status = isDraft ? 'draft' : condition;

    return {
      id: idx + 1000,
      ownerId: owner.id,
      userId: owner.id,
      name: makeProductTitle(category.name),
      description: pick(TURKISH_DESCRIPTIONS),
      price: faker.datatype.boolean({ probability: 0.35 }) ? null : faker.number.int({ min: 200, max: 60000 }),
      currency: 'TL',
      categoryId: category.id,
      categoryName: category.name,
      hashTags: faker.helpers.arrayElements(['telefon', 'apple', 'takas', 'moda', 'elektronik', 'oyun', 'ev', 'spor'], faker.number.int({ min: 1, max: 4 })),
      tags: [],
      condition,
      status,
      isExchanged,
      changeProduct: faker.helpers.arrayElements(['MacBook Pro', 'iPad Pro', 'Bisiklet', 'PlayStation', 'Kamera'], faker.number.int({ min: 0, max: 3 })),
      imageUrl: images[0] ?? null,
      images,
      location: owner.location,
      premium,
      isAd: premium,
      premiumType,
      premiumExpiryDate: premium ? dayjs().add(premiumType === 'vitrin' ? 7 : 14, 'day').toISOString() : null,
      viewCount: faker.number.int({ min: 0, max: 6500 }),
      likeCount: 0,
      favoritesCount: 0,
      createdAt: isoDaysAgo(faker.number.int({ min: 0, max: 60 })),
      updatedAt: isoDaysAgo(faker.number.int({ min: 0, max: 15 })),
      owner: {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        name: owner.fullName,
        username: owner.username,
        phone: owner.phone,
        avatar: owner.avatar,
        rating: owner.rating,
      },
      hidden: faker.datatype.boolean({ probability: 0.03 }),
    };
  });

  // Normalize tags from hashtags
  for (const p of products) {
    p.tags = p.hashTags.map((t) => (t.startsWith('#') ? t : `#${t}`));
  }

  // Favorites: each user favorites 0-60 products not owned by themselves
  const productById = new Map(products.map((p) => [String(p.id), p]));
  for (const user of users) {
    const candidates = products.filter((p) => p.ownerId !== user.id);
    const count = faker.number.int({ min: 0, max: 60 });
    const favorites = faker.helpers.arrayElements(candidates, Math.min(count, candidates.length));
    user.favoritesProductIds = favorites.map((p) => p.id);
    for (const fav of favorites) {
      const prod = productById.get(String(fav.id));
      if (prod) prod.favoritesCount += 1;
    }
  }
  for (const p of products) {
    p.likeCount = p.favoritesCount;
  }

  // Offers: ensure two products from different owners
  const offers: SwapOffer[] = [];
  const acceptedOfferPairs: Array<{ initiatorId: string | number; targetUserId: string | number; productId: string | number; otherProductId: string | number }> = [];

  const offerStatusWeighted = [
    { weight: 55, value: 'pending' as const },
    { weight: 18, value: 'accepted' as const },
    { weight: 15, value: 'rejected' as const },
    { weight: 10, value: 'cancelled' as const },
    { weight: 2, value: 'completed' as const },
  ];

  for (let i = 0; i < offersCount; i += 1) {
    const targetProduct = pick(products);
    const targetUserId = targetProduct.ownerId;
    const initiator = pick(users.filter((u) => u.id !== targetUserId));
    const initiatorProducts = products.filter((p) => p.ownerId === initiator.id);
    if (initiatorProducts.length === 0) {
      i -= 1;
      continue;
    }

    const offeredProduct = pick(initiatorProducts);

    if (offeredProduct.ownerId === targetUserId) {
      // fallback safety
      i -= 1;
      continue;
    }

    const status = faker.helpers.weightedArrayElement(offerStatusWeighted);
    const createdAt = isoDaysAgo(faker.number.int({ min: 0, max: 30 }));

    const offer: SwapOffer = {
      id: 9000 + i + 1,
      initiatorId: initiator.id,
      targetUserId,
      targetProductId: targetProduct.id,
      offeredProductId: offeredProduct.id,
      status,
      message: pick(TURKISH_SENTENCES),
      createdAt,
      updatedAt: createdAt,
      initiatorOnline: initiator.onlineStatus,
      targetOnline: !!users.find((u) => u.id === targetUserId)?.onlineStatus,
    };

    offers.push(offer);

    if (status === 'accepted' || status === 'completed') {
      acceptedOfferPairs.push({
        initiatorId: initiator.id,
        targetUserId,
        productId: targetProduct.id,
        otherProductId: offeredProduct.id,
      });
    }
  }

  // Threads: create from accepted offers then fill up to threadsCount
  const threads: ChatThread[] = [];
  const threadKeySet = new Set<string>();

  function addThreadFromPair(pair: { initiatorId: string | number; targetUserId: string | number; productId: string | number; otherProductId: string | number }) {
    const a = String(pair.initiatorId);
    const b = String(pair.targetUserId);
    const key = [a, b].sort().join('-') + `:${pair.productId}`;
    if (threadKeySet.has(key)) return;
    threadKeySet.add(key);

    const otherUser = users.find((u) => String(u.id) === b)!;
    const product = products.find((p) => String(p.id) === String(pair.productId));

    threads.push({
      id: `t_${threads.length + 1}`,
      type: 'individual',
      userIds: [pair.initiatorId, pair.targetUserId],
      otherUserId: otherUser.id,
      otherName: otherUser.fullName,
      otherUsername: otherUser.username,
      otherAvatar: otherUser.avatar,
      isOnline: otherUser.onlineStatus,
      lastMessageText: '',
      lastMessageTime: isoDaysAgo(faker.number.int({ min: 0, max: 7 })),
      unreadCount: faker.number.int({ min: 0, max: 12 }),
      productId: product?.id ?? null,
      productName: product?.name ?? null,
      productImage: product?.imageUrl ?? null,
    });
  }

  for (const pair of acceptedOfferPairs) addThreadFromPair(pair);
  while (threads.length < threadsCount) {
    const u1 = pick(users);
    const u2 = pick(users.filter((u) => u.id !== u1.id));
    const product = faker.datatype.boolean({ probability: 0.6 }) ? pick(products) : null;
    const key = [String(u1.id), String(u2.id)].sort().join('-') + `:${product?.id ?? 'none'}`;
    if (threadKeySet.has(key)) continue;
    threadKeySet.add(key);

    threads.push({
      id: `t_${threads.length + 1}`,
      type: 'individual',
      userIds: [u1.id, u2.id],
      otherUserId: u2.id,
      otherName: u2.fullName,
      otherUsername: u2.username,
      otherAvatar: u2.avatar,
      isOnline: u2.onlineStatus,
      lastMessageText: '',
      lastMessageTime: isoDaysAgo(faker.number.int({ min: 0, max: 14 })),
      unreadCount: faker.number.int({ min: 0, max: 20 }),
      productId: product?.id ?? null,
      productName: product?.name ?? null,
      productImage: product?.imageUrl ?? null,
    });
  }

  // Messages
  const messages: ChatMessage[] = [];
  const threadIds = threads.map((t) => t.id);

  for (let i = 0; i < messagesCount; i += 1) {
    const threadId = pick(threadIds);
    const thread = threads.find((t) => t.id === threadId)!;
    const senderUserId = pick(thread.userIds);
    const hasImage = faker.datatype.boolean({ probability: 0.08 });
    const time = isoDaysAgo(faker.number.int({ min: 0, max: 14 }));

    messages.push({
      id: `m_${i + 1}`,
      threadId,
      senderUserId,
      text: pick(TURKISH_SENTENCES),
      images: hasImage ? makeImageUrls(faker.number.int({ min: 1, max: 2 })) : undefined,
      time,
      isRead: faker.datatype.boolean({ probability: 0.75 }),
      status: faker.helpers.weightedArrayElement([
        { weight: 20, value: 'sent' as const },
        { weight: 35, value: 'delivered' as const },
        { weight: 45, value: 'read' as const },
      ]),
    });
  }

  // Thread last message fields
  const messagesByThread = new Map<string | number, ChatMessage[]>();
  for (const msg of messages) {
    const key = String(msg.threadId);
    const list = messagesByThread.get(key) ?? [];
    list.push(msg);
    messagesByThread.set(key, list);
  }
  for (const t of threads) {
    const list = (messagesByThread.get(String(t.id)) ?? []).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const last = list[list.length - 1];
    if (last) {
      t.lastMessageText = last.text;
      t.lastMessageTime = last.time;
      t.unreadCount = list.filter((m) => !m.isRead).length;
    }
  }

  // Notifications (and viewCount increments for product_viewed)
  const notifications: NotificationItem[] = [];
  const notificationTypes: NotificationType[] = ['swap_offer', 'swap_accepted', 'swap_rejected', 'product_viewed', 'new_message', 'favorite_updated'];

  for (let i = 0; i < notificationsCount; i += 1) {
    const type = pick(notificationTypes);
    const user = pick(users);
    const product = faker.datatype.boolean({ probability: 0.55 }) ? pick(products) : undefined;

    if (type === 'product_viewed' && product) {
      product.viewCount += 1;
    }

    notifications.push({
      id: `n_${i + 1}`,
      type,
      title:
        type === 'swap_offer'
          ? 'Yeni Takas Teklifi'
          : type === 'swap_accepted'
            ? 'Takas Kabul Edildi'
            : type === 'swap_rejected'
              ? 'Takas Reddedildi'
              : type === 'product_viewed'
                ? 'Ürünün Görüntülendi'
                : type === 'new_message'
                  ? 'Yeni Mesaj'
                  : 'Favori Güncellendi',
      message: pick(TURKISH_SENTENCES),
      time: isoDaysAgo(faker.number.int({ min: 0, max: 10 })),
      isRead: faker.datatype.boolean({ probability: 0.6 }),
      userId: user.id,
      userPhoto: user.avatar,
      productId: product?.id,
      productPhoto: product?.imageUrl ?? null,
    });
  }

  // Reports
  const reports: ReportItem[] = [];
  const reportCategories: ReportCategory[] = ['bug', 'user', 'product', 'payment', 'other', 'suggestion'];

  for (let i = 0; i < reportsCount; i += 1) {
    const category = pick(reportCategories);
    const reporter = pick(users);
    const targetUser = faker.datatype.boolean({ probability: 0.55 }) ? pick(users.filter((u) => u.id !== reporter.id)) : undefined;
    const targetProduct = faker.datatype.boolean({ probability: 0.45 }) ? pick(products) : undefined;
    
    let messageStr = faker.lorem.paragraph();
    if (category === 'suggestion') messageStr = pick(TURKISH_SUGGESTION_MESSAGES);
    else messageStr = pick(TURKISH_REPORT_MESSAGES);

    reports.push({
      id: `r_${i + 1}`,
      category,
      message: messageStr,
      createdAt: isoDaysAgo(faker.number.int({ min: 0, max: 40 })),
      reporterUserId: reporter.id,
      targetUserId: targetUser?.id,
      targetProductId: targetProduct?.id,
      status: faker.helpers.weightedArrayElement([
        { weight: 55, value: 'open' as const },
        { weight: 25, value: 'in_review' as const },
        { weight: 12, value: 'resolved' as const },
        { weight: 8, value: 'rejected' as const },
      ]),
      resolutionNote: undefined,
    });
  }

  const notificationSettingsByUserId: Record<string, NotificationSettings> = {};
  const locationSettingsByUserId: Record<string, LocationSettings> = {};
  const trustScoresByUserId: Record<string, TrustScore> = {};
  for (const u of users) {
    notificationSettingsByUserId[String(u.id)] = makeNotificationSettings();
    locationSettingsByUserId[String(u.id)] = makeLocationSettings(u.city ?? pick(TURKISH_CITIES));
    trustScoresByUserId[String(u.id)] = makeTrustScore(u.id);
  }

  const recentSearchTerms = ['iphone', 'takas', 'bisiklet', 'playstation', 'airpods', 'mont', 'robot süpürge', 'macbook'].map((term) => ({
    term,
    count: faker.number.int({ min: 5, max: 140 }),
  }));

  return {
    seed,
    categories,
    users,
    products,
    offers,
    threads,
    messages,
    notifications,
    reports,
    notificationSettingsByUserId,
    locationSettingsByUserId,
    trustScoresByUserId,
    recentSearchTerms,
  };
}
