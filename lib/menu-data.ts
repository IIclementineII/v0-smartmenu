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
    name: 'Kung Pao Chicken',
    category: 'Main Course',
    price: 18.99,
    stock: 25,
    available: true,
    isVegetarian: false,
    isSpicy: true,
    emoji: '🍗',
    description: 'Classic Sichuan dish with chicken, peanuts, and dried chilies',
    allergens: ['peanuts']
  },
  {
    id: '2',
    name: 'Mapo Tofu',
    category: 'Main Course',
    price: 12.99,
    stock: 30,
    available: true,
    isVegetarian: true,
    isSpicy: true,
    emoji: '🥢',
    description: 'Silky tofu in spicy fermented bean sauce',
    allergens: ['soy']
  },
  {
    id: '3',
    name: 'Vegetable Spring Rolls',
    category: 'Appetizer',
    price: 7.99,
    stock: 40,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🥟',
    description: 'Crispy rolls filled with fresh vegetables',
    allergens: ['gluten']
  },
  {
    id: '4',
    name: 'Peking Duck',
    category: 'Specialty',
    price: 28.99,
    stock: 12,
    available: true,
    isVegetarian: false,
    isSpicy: false,
    emoji: '🦆',
    description: 'Traditional roast duck served with pancakes and hoisin sauce',
    allergens: ['gluten']
  },
  {
    id: '5',
    name: 'Steamed Jasmine Rice',
    category: 'Side',
    price: 3.99,
    stock: 100,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🍚',
    description: 'Fragrant jasmine rice, perfectly steamed',
    allergens: []
  },
  {
    id: '6',
    name: 'Edamame',
    category: 'Appetizer',
    price: 5.99,
    stock: 50,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🫛',
    description: 'Steamed soybeans with sea salt',
    allergens: ['soy']
  },
  {
    id: '7',
    name: 'Buddha Delight',
    category: 'Main Course',
    price: 13.99,
    stock: 20,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🥬',
    description: 'Assorted vegetables with tofu in light sauce',
    allergens: ['soy']
  },
  {
    id: '8',
    name: 'Mango Pudding',
    category: 'Dessert',
    price: 5.99,
    stock: 35,
    available: true,
    isVegetarian: true,
    isSpicy: false,
    emoji: '🥭',
    description: 'Creamy mango pudding with fresh fruit',
    allergens: ['dairy']
  }
]

export const getVegetarianDishes = () => menuItems.filter(item => item.isVegetarian)
export const getSpicyDishes = () => menuItems.filter(item => item.isSpicy)
export const getNonSpicyDishes = () => menuItems.filter(item => !item.isSpicy)
export const getDishesWithoutAllergen = (allergen: string) => 
  menuItems.filter(item => !item.allergens.includes(allergen))
