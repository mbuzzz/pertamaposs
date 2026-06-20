// User & Auth Types
export type UserRole = 'admin' | 'manager' | 'supervisor' | 'kasir';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  outletId?: string;
  division?: string; // e.g., 'Es Teh' | 'Tahu' | 'Roti Bakar'
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  outletId: string;
  token: string;
  expiresAt: string;
}

// Outlet Types
export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  invoiceHeader?: string;
  invoiceFooter?: string;
  createdAt: string;
}

// Ingredient Types
export interface Ingredient {
  id: string;
  name: string;
  unit: string; // gr, ml, pcs, pack, liter
  costPerUnit: number;
  stock: number;
  minStock: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

// Recipe Types
export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  cost: number; // calculated: quantity * ingredient.costPerUnit
}

export interface Recipe {
  id: string;
  productId: string;
  ingredients: RecipeIngredient[];
  totalCOGS: number; // calculated from ingredients
  yieldPerBatch: number; // Jumlah porsi/cup yang dihasilkan dari satu batch seduh
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  targetMargin: number; // percentage
  imageUrl?: string;
  stock: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  recipeId?: string;
  division?: string; // e.g., 'Es Teh' | 'Tahu' | 'Roti Bakar'
  outletIds?: string[]; // Multi-select outlets assignment
  createdAt: string;
  updatedAt: string;
}

// Shift Types
export type ShiftNumber = 1 | 2 | 3;

export interface Shift {
  id: string;
  shiftNumber: ShiftNumber;
  kasirId: string;
  kasirName: string;
  outletId: string;
  openingBalance: number;
  closingBalance?: number;
  actualBalance?: number;
  variance?: number;
  openedAt: string;
  closedAt?: string;
  notes?: string;
  status: 'open' | 'closed';
}

// Transaction Types
export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cogs: number;
  margin: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  shiftId: string;
  kasirId: string;
  kasirName: string;
  outletId: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  totalCOGS: number;
  totalMargin: number;
  marginPercentage: number;
  paymentMethod: PaymentMethod;
  paymentAmount: number;
  changeAmount: number;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  margin: number;
  cogs: number;
}

// Report Types
export interface DailySummary {
  date: string;
  outletId: string;
  totalSales: number;
  totalTransactions: number;
  totalProfit: number;
  averageMargin: number;
}

export interface ProductSales {
  productId: string;
  productName: string;
  quantity: number;
  sales: number;
  profit: number;
  margin: number;
}

// Expense & Purchase Types
export interface Expense {
  id: string;
  description: string;
  amount: number;
  outletId: string;
  category: string;
  date: string;
  createdBy: string;
}

export interface Purchase {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  outletId: string;
  supplier?: string;
  date: string;
  createdBy: string;
}

export interface BrewLog {
  id: string;
  recipeId: string;
  productName: string;
  batches: number;
  yieldAmount: number;
  date: string;
  createdBy: string;
  outletId: string;
}

// Permission Types
export type Permission = 
  | 'pos.view'
  | 'pos.transaction'
  | 'shift.open'
  | 'shift.close'
  | 'inventory.view'
  | 'inventory.edit'
  | 'reports.view'
  | 'reports.export'
  | 'recipe.view'
  | 'recipe.edit'
  | 'masterdata.view'
  | 'masterdata.edit'
  | 'users.manage'
  | 'settings.manage'
  | 'finance.view'
  | 'finance.edit';

export const RolePermissions: Record<UserRole, Permission[]> = {
  kasir: ['pos.view', 'pos.transaction', 'shift.open', 'inventory.view'],
  supervisor: [
    'pos.view',
    'pos.transaction',
    'shift.open',
    'shift.close',
    'inventory.view',
    'reports.view',
  ],
  manager: [
    'pos.view',
    'inventory.view',
    'inventory.edit',
    'reports.view',
    'reports.export',
    'recipe.view',
    'recipe.edit',
    'finance.view',
    'finance.edit',
  ],
  admin: [
    'pos.view',
    'pos.transaction',
    'shift.open',
    'shift.close',
    'inventory.view',
    'inventory.edit',
    'reports.view',
    'reports.export',
    'recipe.view',
    'recipe.edit',
    'masterdata.view',
    'masterdata.edit',
    'users.manage',
    'settings.manage',
    'finance.view',
    'finance.edit',
  ],
};
