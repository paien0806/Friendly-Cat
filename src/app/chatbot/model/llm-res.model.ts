export interface Store {
    storeName: string;    // 商店名稱
    distance: number;     // 距離（公尺）
    items: string[];      // 這間店的商品列表
}

export interface StoreResponse {
    stores: Store[];      // 商店陣列
    error: string;
}
