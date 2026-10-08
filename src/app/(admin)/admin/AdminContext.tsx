'use client';

import React, { createContext, useContext } from 'react';

export interface AdminContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AdminContext = createContext<AdminContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});

export const useAdminLayout = () => useContext(AdminContext);
