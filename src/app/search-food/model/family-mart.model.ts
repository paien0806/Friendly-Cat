export interface RequestModel {
    latitude: number;          // 緯度
    longitude: number;         // 經度
    oldPKeys: string[];        // 店鋪的舊主鍵列表
    postInfo: string;          // 郵遞區號或相關信息
    projectCode: "202106302";  // 專案代碼
}

export interface StoreModel {
    oldPKey: string;
    name: string;
    tel: string | null;
    post: string | null;
    city: string | null;
    areaCode: string | null;
    periodType: number;
    longitude: number;
    latitude: number;
    distance: number;
    address: string;
    updateDate: string;
    info: ProductCategoryModel[];
}

export interface ProductCategoryModel {
    code: string;
    name: string;
    iconURL: string;
    qty: number;
    categories: SubCategoryModel[];
}

export interface SubCategoryModel {
    code: string;
    name: string;
    qty: number;
    products: ProductModel[];
}

export interface ProductModel {
    code: string;
    name: string;
    qty: number;
}

export interface fStore {
  Name: string;           // 店名
  Tel: string;            // 電話
  addr: string;           // 地址
  pkeynew: string;        // 新的 PKey
  px_wgs84: string;       // 經度
  py_wgs84: string;       // 緯度
  serid: string;
}
