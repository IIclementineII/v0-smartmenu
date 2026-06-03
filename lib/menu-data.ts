export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  stock: number
  available: boolean
  isVegetarian: boolean
  isSpicy: boolean
  emoji: string
  description: string
  allergens: string[]
}

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: '宫保鸡丁',
    category: '主菜',
    price: 16.99,
    stock: 25,
    available: true,
    isVegetarian: false,
    isSpicy: true,
    emoji: '🍗',
    description: '经典川菜，鸡肉搭配花生和干辣椒',
    allergens: ['花生']
  },
  {
    id: '2',
    name: '麻婆豆腐',
    category: '主菜',
    price: 13.99,
    stock: 30,
    available: true,
    isVegetarian: true,
    isSpicy: true,
    emoji: '🥢',
    description: '香辣豆腐配肉末酱料',
    allergens: ['大豆']
  },
  {
    id: '3',
    name: '炒时蔬',
    category: '素菜',
    price: 11.99,
    stock: 40,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🥬',
    description: '时令蔬菜搭配蒜蓉清炒',
    allergens: []
  },
  {
    id: '4',
    name: '糖醋里脊',
    category: '主菜',
    price: 15.99,
    stock: 20,
    available: true,
    isVegetarian: false,
    isSpicy: false,
    emoji: '🍖',
    description: '香脆猪肉搭配酸甜酱汁',
    allergens: []
  },
  {
    id: '5',
    name: '蛋炒饭',
    category: '主食',
    price: 9.99,
    stock: 50,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🍚',
    description: '鸡蛋和蔬菜炒饭',
    allergens: ['鸡蛋']
  },
  {
    id: '6',
    name: '春卷',
    category: '小吃',
    price: 7.99,
    stock: 35,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🥟',
    description: '酥脆春卷配蔬菜馅',
    allergens: ['麸质']
  },
  {
    id: '7',
    name: '北京烤鸭',
    category: '特色菜',
    price: 32.99,
    stock: 10,
    available: true,
    isVegetarian: false,
    isSpicy: false,
    emoji: '🦆',
    description: '正宗北京烤鸭配薄饼',
    allergens: ['麸质']
  },
  {
    id: '8',
    name: '酸辣汤',
    category: '汤类',
    price: 6.99,
    stock: 45,
    available: true,
    isVegetarian: false,
    isSpicy: true,
    emoji: '🥣',
    description: '酸辣口味的经典中式汤品',
    allergens: ['鸡蛋', '大豆']
  }
]

export const getVegetarianDishes = () => menuItems.filter(item => item.isVegetarian)
export const getSpicyDishes = () => menuItems.filter(item => item.isSpicy)
export const getNonSpicyDishes = () => menuItems.filter(item => !item.isSpicy)
export const getDishesWithoutAllergen = (allergen: string) => 
  menuItems.filter(item => !item.allergens.includes(allergen))
