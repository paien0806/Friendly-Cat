import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { StoreStockItem, FoodCategory, FoodSubCategory, Item, CategoryStockItem, FoodDetail  } from '../../model/seven-eleven.model';  // 根據你的實際路徑導入模型
import { SevenElevenRequestService } from '../services/seven-eleven-request.service';  // 確保這個服務有方法可以查詢商店商品數量
import { HttpClient } from '@angular/common/http';

import Fuse from 'fuse.js';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnChanges, OnInit {
  @Input() store!: StoreStockItem;  // 接收父組件傳遞的 store
  @Input() category!: FoodCategory;  // 接收父組件傳遞的 category

  subCategories: FoodSubCategory[] = [];
  totalSubCategoryQty: number = 0;
  itemsBySubCategory: { [key: string]: Item[] } = {};  // 儲存每個子分類的商品列表

  foodDetails: FoodDetail[] = [];

  constructor(
    private sevenElevenRequestService: SevenElevenRequestService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.sevenElevenRequestService.getFoodDetails().subscribe((data) => {
      this.foodDetails = data;
      console.log(this.foodDetails);
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] || changes['store']) {
      this.loadSubCategories();  // 重新加載子分類資料
    }
  }

  loadSubCategories() {
    if (this.store && this.category) {
      this.subCategories = this.category.Children;  // 更新子分類列表
      this.calculateTotalQty();  // 重新計算子分類的數量
      this.loadItemsBySubCategory();  // 載入子分類下的所有商品資料
    }
  }

  loadItemsBySubCategory() {
    if (this.store) {
      this.sevenElevenRequestService.getItemsByStoreNo(this.store.StoreNo).subscribe(response => {
        if (response.isSuccess && response.element.StoreStockItem) {
          const categoryStockItems: CategoryStockItem[] = response.element.StoreStockItem.CategoryStockItems;

          this.subCategories.forEach(subCategory => {
            const items: Item[] = [];

            // 遍歷 CategoryStockItems，根據子分類名稱過濾並提取 ItemList
            categoryStockItems.forEach(category => {
              if (category.Name === subCategory.Name) {
                items.push(...category.ItemList);
              }
            });

            // 把結果保存到 itemsBySubCategory
            this.itemsBySubCategory[subCategory.Name] = items || [];
          });
          this.calculateTotalQty(); // 更新總數量
        }
      });
    }
  }

  calculateTotalQty() {
    this.totalSubCategoryQty = 0;
    this.subCategories.forEach(subCategory => {
      const items = this.itemsBySubCategory[subCategory.Name];
      if (items) {
        items.forEach(item => {
          this.totalSubCategoryQty += item.RemainingQty;
        });
      }
    });
  }

  getSubCategoryQty(subCategoryName: string): number {
    let qty = 0;
    const items = this.itemsBySubCategory[subCategoryName];
    if (items) {
      items.forEach(item => {
        qty += item.RemainingQty;
      });
    }
    return qty;
  }

  getDiscountedPrice(originalPrice: string): string {
    // 解析原價
    const price = parseFloat(originalPrice.replace('NT$', '').trim());
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let discountedPrice = price;

    // 設定折扣邏輯
    if (currentHour >= 19 && currentHour < 20) {
      discountedPrice *= 0.8; // 19:00~19:59 八折
    } else if ((currentHour >= 10 && currentHour < 18) || (currentHour >= 20 || currentHour < 3)) {
      discountedPrice *= 0.65; // 10:00~17:59 以及 20:00~03:00 六五折
    }
    else {
      // 待查清其餘時段是幾折==，目前假設八折
      discountedPrice *= 0.8;
    }
    return discountedPrice.toString();
  }

  getFoodDetail(item: Item): FoodDetail {
    // 設置 Fuse.js 配置選項
    const options = {
      includeScore: true, // 需要包含匹配度分數
      threshold: 0.3, // 設置模糊搜尋的閾值，0.3 表示較為寬鬆的匹配
      keys: ['name'] // 搜尋的欄位是 'name'
    };

    // 初始化 Fuse 進行模糊搜尋
    const fuse = new Fuse(this.foodDetails, options);

    // 查找最匹配的項目
    const result = fuse.search(item.ItemName);

    // 如果找到匹配項，則返回最相似的那個
    const foodDetail = result.length > 0 ? result[0].item : {
      category: '',
      content: '',
      image: 'assets/此商品暫無圖片.png', // 默認圖片
      kcal: '',
      name: '',
      new: 'False',
      price: '',
      special_sale: 'False'
    };

    // 計算折扣後的價格
    const discountedPrice = this.getDiscountedPrice(foodDetail.price);

    // 將計算結果新增到 foodDetail 物件中
    foodDetail['discountedPrice'] = discountedPrice;
    foodDetail['originalPrice'] = foodDetail.price; // 原價

    return foodDetail;
  }
}
