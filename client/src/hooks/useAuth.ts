// 完全移除 useQuery 導入和使用

export function useAuth() {
  // 完全不使用任何查詢機制
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}