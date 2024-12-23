export interface Location {
    Latitude: number;
    Longitude: number;
}

export interface LocationData {
    CurrentLocation: Location;
    SearchLocation: Location;
}

export interface CategoryStockItem {
    NodeID: number;                 // 與FoodSubCategory的ID是對照
    Name: string;                   // 食物子分類名稱
    RemainingQty: number;           // 剩餘數量
}

export interface StoreStockItem {
    StoreNo: string;                // 商店編號
    StoreName: string;              // 商店名稱
    Distance: number;               // 與輸入位址的距離
    IsOperateTime: boolean;         //目前是否營業
    RemainingQty: number;           // 該店總剩餘數量
    CategoryStockItems: CategoryStockItem[];
}

export interface StoreStockResponse {
    element: {
        StoreStockItemList: StoreStockItem[];
    };
}


export interface FoodCategory {
    ID: number;                     // 分類 ID
    Name: string;                   // 食物分類名稱
    ImageUrl: string;               // 圖片 URL
    IsEnabled: boolean;             // 是否啟用
    Children: FoodSubCategory[];    // 子分類列表
    PCSCCategeroyNo: string[];      // 相關商品分類編號
}

export interface FoodSubCategory {
    ID: number;                     // 子分類 ID
    Name: string;                   // 子分類名稱
    IsEnabled: boolean;             // 是否啟用
    PCSCCategeroyNo: string[];      // 子分類編號
}


