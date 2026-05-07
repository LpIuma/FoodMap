// Mock data for Changchun restaurants
export const categories = [
  { id: 1, name: '东北菜', slug: 'dongbei', icon: '🥘', color: '#FF6B35' },
  { id: 2, name: '烧烤', slug: 'bbq', icon: '🍢', color: '#E94560' },
  { id: 3, name: '火锅', slug: 'hotpot', icon: '🍲', color: '#FF4757' },
  { id: 4, name: '韩餐', slug: 'korean', icon: '🥬', color: '#6C5CE7' },
  { id: 5, name: '日料', slug: 'japanese', icon: '🍣', color: '#00B894' },
  { id: 6, name: '西餐', slug: 'western', icon: '🥩', color: '#0984E3' },
  { id: 7, name: '小吃', slug: 'snack', icon: '🥟', color: '#FDCB6E' },
  { id: 8, name: '咖啡甜品', slug: 'cafe', icon: '☕', color: '#A29BFE' },
  { id: 9, name: '面食', slug: 'noodles', icon: '🍜', color: '#E17055' },
];

export const restaurants = [
  {
    id: 1, name: '老昌春饼（重庆路店）', slug: 'lao-chang-chun-bing',
    category_id: 1, address: '长春市朝阳区重庆路1688号', district: '朝阳区',
    latitude: 43.8868, longitude: 125.3245,
    phone: '0431-88888001', avg_price: 55,
    rating: { taste: 4.5, environment: 4.0, service: 4.2 },
    recommended_dishes: ['春饼', '锅包肉', '尖椒干豆腐', '酱骨头'],
    business_hours: '10:00-21:30',
    description: '长春最具代表性的春饼老店，薄如纸的春饼配上各式炒菜，是长春人心中的经典味道。锅包肉外酥里嫩，酸甜适口。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 2, name: '东方饺子王（桂林路店）', slug: 'dongfang-jiaozi',
    category_id: 1, address: '长春市朝阳区桂林路15号', district: '朝阳区',
    latitude: 43.8635, longitude: 125.3128,
    phone: '0431-88888002', avg_price: 45,
    rating: { taste: 4.3, environment: 3.8, service: 4.0 },
    recommended_dishes: ['三鲜水饺', '黄瓜虾仁水饺', '锅贴', '凉拌菜'],
    business_hours: '09:30-21:00',
    description: '东北风味饺子连锁品牌，皮薄馅大汁多，三鲜水饺和黄瓜虾仁饺子是招牌。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 3, name: '权金城韩国烤肉', slug: 'quan-jin-cheng',
    category_id: 4, address: '长春市南关区大经路98号', district: '南关区',
    latitude: 43.8756, longitude: 125.3380,
    phone: '0431-88888003', avg_price: 98,
    rating: { taste: 4.6, environment: 4.5, service: 4.3 },
    recommended_dishes: ['雪花牛肉', '五花肉', '石锅拌饭', '冷面'],
    business_hours: '11:00-22:00',
    description: '正宗韩式烤肉，肉质新鲜，腌制入味。环境典雅，适合聚餐。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 4, name: '串说烧烤（红旗街店）', slug: 'chuan-shuo-bbq',
    category_id: 2, address: '长春市朝阳区红旗街万达广场B1', district: '朝阳区',
    latitude: 43.8580, longitude: 125.3050,
    phone: '0431-88888004', avg_price: 75,
    rating: { taste: 4.4, environment: 4.2, service: 3.9 },
    recommended_dishes: ['烤羊肉串', '烤板筋', '烤生蚝', '东北拉皮'],
    business_hours: '16:00-02:00',
    description: '长春知名烧烤品牌，羊肉串鲜嫩多汁，板筋烤得恰到好处。夜宵首选。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 5, name: '海底捞火锅（欧亚店）', slug: 'haidilao-ouya',
    category_id: 3, address: '长春市朝阳区欧亚卖场4楼', district: '朝阳区',
    latitude: 43.8720, longitude: 125.2980,
    phone: '0431-88888005', avg_price: 120,
    rating: { taste: 4.2, environment: 4.7, service: 5.0 },
    recommended_dishes: ['牛油麻辣锅底', '虾滑', '毛肚', '捞面表演'],
    business_hours: '10:00-次日07:00',
    description: '海底捞的服务不用多说，长春欧亚店环境宽敞，等位区有美甲和小吃。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 6, name: '鼎丰真糕点', slug: 'ding-feng-zhen',
    category_id: 7, address: '长春市南关区大马路1198号', district: '南关区',
    latitude: 43.8802, longitude: 125.3420,
    phone: '0431-88888006', avg_price: 25,
    rating: { taste: 4.7, environment: 3.5, service: 3.8 },
    recommended_dishes: ['萨其马', '传统月饼', '绿豆糕', '大麻花'],
    business_hours: '08:00-18:00',
    description: '百年老字号糕点铺，萨其马和绿豆糕是几代长春人的甜蜜记忆。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 7, name: '回宝珍饺子馆', slug: 'hui-bao-zhen',
    category_id: 1, address: '长春市宽城区长春大街72号', district: '宽城区',
    latitude: 43.8940, longitude: 125.3290,
    phone: '0431-88888007', avg_price: 40,
    rating: { taste: 4.5, environment: 3.6, service: 3.7 },
    recommended_dishes: ['蒸饺', '煎饺', '小米粥', '东北大拌菜'],
    business_hours: '06:30-20:00',
    description: '长春老字号清真饺子馆，饺子皮薄馅足，蒸饺尤其出名。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 8, name: '禾风家日本料理', slug: 'he-feng-jia',
    category_id: 5, address: '长春市朝阳区建设街899号', district: '朝阳区',
    latitude: 43.8700, longitude: 125.3150,
    phone: '0431-88888008', avg_price: 150,
    rating: { taste: 4.8, environment: 4.6, service: 4.5 },
    recommended_dishes: ['三文鱼刺身', '鳗鱼饭', '天妇罗', '味噌汤'],
    business_hours: '11:00-14:00, 17:00-21:30',
    description: '长春口碑最好的日料店之一，食材新鲜，摆盘精美，环境清雅。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 9, name: '漫咖啡（南湖店）', slug: 'maan-coffee',
    category_id: 8, address: '长春市朝阳区湖西路与南湖大路交汇', district: '朝阳区',
    latitude: 43.8550, longitude: 125.3200,
    phone: '0431-88888009', avg_price: 55,
    rating: { taste: 4.0, environment: 4.8, service: 4.2 },
    recommended_dishes: ['拿铁', '提拉米苏', '华夫饼', '抹茶蛋糕'],
    business_hours: '09:00-23:00',
    description: '南湖边上的网红咖啡厅，落地窗可以看到南湖风景，适合下午茶约会。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 10, name: '大冷面（桂林路）', slug: 'da-leng-mian',
    category_id: 9, address: '长春市朝阳区桂林路与同志街交汇', district: '朝阳区',
    latitude: 43.8618, longitude: 125.3100,
    phone: '0431-88888010', avg_price: 20,
    rating: { taste: 4.3, environment: 3.2, service: 3.5 },
    recommended_dishes: ['朝鲜冷面', '拌冷面', '辣白菜', '打糕'],
    business_hours: '09:00-21:00',
    description: '地道的朝鲜冷面小店，汤汁酸甜爽口，夏天来一碗特别过瘾。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 11, name: '铁锅炖鱼村', slug: 'tie-guo-dun',
    category_id: 1, address: '长春市二道区吉林大路与乐群街交汇', district: '二道区',
    latitude: 43.8830, longitude: 125.3620,
    phone: '0431-88888011', avg_price: 68,
    rating: { taste: 4.6, environment: 3.8, service: 4.0 },
    recommended_dishes: ['铁锅炖大鱼', '铁锅炖大鹅', '贴饼子', '酸菜粉'],
    business_hours: '10:30-21:30',
    description: '正宗东北铁锅炖，大铁锅现炖，贴饼子焦香酥脆，冬天围着大锅吃最过瘾。',
    cover_image: '', images: [], status: 'approved'
  },
  {
    id: 12, name: '百味面道', slug: 'bai-wei-mian',
    category_id: 9, address: '长春市绿园区景阳大路888号', district: '绿园区',
    latitude: 43.8780, longitude: 125.2850,
    phone: '0431-88888012', avg_price: 22,
    rating: { taste: 4.1, environment: 3.5, service: 3.8 },
    recommended_dishes: ['红烧牛肉面', '炸酱面', '刀削面', '小菜'],
    business_hours: '06:00-20:00',
    description: '实惠的面馆，分量足味道好，红烧牛肉面牛肉给得很实在。',
    cover_image: '', images: [], status: 'approved'
  }
];
