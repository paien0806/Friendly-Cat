export const environment = {
  production: true,
  familyMartUrl: {
    icon: 'https://www.family.com.tw/NewEnterprise/CSR/images/favicon.ico',
    base: 'https://stamp.family.com.tw/api/maps',
    storeQuery: 'https://family.map.com.tw/famiport/api/dropdownlist/Select_StoreName',
    endpoint: {
      mapClassificationInfo: '/MapClassificationInfo',
      mapProductInfo: '/MapProductInfo'
    }
  },
  sevenElevenUrl: {
    icon: 'https://www.7-11.com.tw/favicon.ico',
    base: 'https://lovefood.openpoint.com.tw/LoveFood/api/',
    endpoint: {
      accessToken: 'Auth/FrontendAuth/AccessToken',
      getList: 'Master/FrontendItemCategory/GetList',
      getStoreByAddress: 'Master/FrontendStore/GetStoreByAddress',
      getNearbyStoreList: 'Search/FrontendStoreItemStock/GetNearbyStoreList',
      getStoreDetail: 'Search/FrontendStoreItemStock/GetStoreDetail'
    },
    params: {
      mid_v: 'W0_DiF4DlgU5OeQoRswrRcaaNHMWOL7K3ra3389ocJQv-rdOWS6Zu4AtGa7-7pjiccl0C5gm0u5UNONXuVUXcJCidRjIv9dsUd8PocNr5moiuJJ8hZla5iV0H3-8dZfASc7GgEm74679LYK2hBB-Sam6D0LAnYK9Lb0DZjaSctnHS5yYugtrYNdWoWk'
    }
  },
  firebaseConfig: {
    apiKey: "AIzaSyA3i_YLXpXuHNrmrHULrqnsIj5Z919aCfw",
    authDomain: "friendly-cat-for-you.firebaseapp.com",
    databaseURL: "https://friendly-cat-for-you-default-rtdb.firebaseio.com",
    projectId: "friendly-cat-for-you",
    storageBucket: "friendly-cat-for-you.firebasestorage.app",
    messagingSenderId: "614210455616",
    appId: "1:614210455616:web:cedabfd68dca95ae4337a5",
    measurementId: "G-3V3740GPG7"
  }
};
