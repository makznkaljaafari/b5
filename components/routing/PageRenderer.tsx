
import React, { Suspense, lazy } from 'react';
import { Page } from '../../types';

const Dashboard = lazy(() => import('../Dashboard'));
const SalesList = lazy(() => import('../SalesList'));
const AddSale = lazy(() => import('../AddSale'));
const PurchasesList = lazy(() => import('../PurchasesList'));
const AddPurchase = lazy(() => import('../AddPurchase'));
const CustomersList = lazy(() => import('../CustomersList'));
const AddCustomer = lazy(() => import('../AddCustomer'));
const SuppliersList = lazy(() => import('../SuppliersList'));
const AddSupplier = lazy(() => import('../AddSupplier'));
const CategoriesList = lazy(() => import('../CategoriesList'));
const AddCategory = lazy(() => import('../AddCategory'));
const VouchersList = lazy(() => import('../VouchersList'));
const AddVoucher = lazy(() => import('../AddVoucher'));
const VoucherDetails = lazy(() => import('../VoucherDetails'));
const AIAdvisor = lazy(() => import('../AIAdvisor'));
const NotificationsPage = lazy(() => import('../NotificationsPage'));
const ExpensesList = lazy(() => import('../ExpensesList'));
const AddExpense = lazy(() => import('../AddExpense'));
const DebtsReport = lazy(() => import('../DebtsReport'));
const AddOpeningBalance = lazy(() => import('../AddOpeningBalance'));
const Reports = lazy(() => import('../Reports'));
const SettingsPage = lazy(() => import('../SettingsPage'));
const VisualInvoice = lazy(() => import('../VisualInvoice'));
const VisualPurchaseInvoice = lazy(() => import('../VisualPurchaseInvoice'));
const WasteList = lazy(() => import('../WasteList'));
const AddWaste = lazy(() => import('../AddWaste'));
const ActivitiesList = lazy(() => import('../ActivitiesList'));
const ReturnsList = lazy(() => import('../ReturnsList'));
const AccountStatement = lazy(() => import('../AccountStatement'));
const LoginPage = lazy(() => import('../LoginPage'));

interface PageRendererProps {
  currentPage: Page;
  isLoggedIn: boolean;
}

export const PageRenderer: React.FC<PageRendererProps> = ({ currentPage, isLoggedIn }) => {
  if (!isLoggedIn) return <LoginPage />;

  switch (currentPage) {
    case 'dashboard': return <Dashboard />;
    case 'sales': return <SalesList />;
    case 'add-sale': return <AddSale />;
    case 'purchases': return <PurchasesList />;
    case 'add-purchase': return <AddPurchase />;
    case 'customers': return <CustomersList />;
    case 'add-customer': return <AddCustomer />;
    case 'suppliers': return <SuppliersList />;
    case 'add-supplier': return <AddSupplier />;
    case 'categories': return <CategoriesList />;
    case 'add-category': return <AddCategory />;
    case 'vouchers': return <VouchersList />;
    case 'add-voucher': return <AddVoucher />;
    case 'voucher-details': return <VoucherDetails />;
    case 'expenses': return <ExpensesList />;
    case 'add-expense': return <AddExpense />;
    case 'waste': return <WasteList />;
    case 'add-waste': return <AddWaste />;
    case 'returns': return <ReturnsList />;
    case 'debts': return <DebtsReport />;
    case 'add-opening-balance': return <AddOpeningBalance />;
    case 'reports': return <Reports />;
    case 'settings': return <SettingsPage />;
    case 'ai-advisor': return <AIAdvisor />;
    case 'notifications': return <NotificationsPage />;
    case 'invoice-view': return <VisualInvoice />;
    case 'purchase-invoice-view': return <VisualPurchaseInvoice />;
    case 'activity-log': return <ActivitiesList />;
    case 'account-statement': return <AccountStatement />;
    default: return <Dashboard />;
  }
};
