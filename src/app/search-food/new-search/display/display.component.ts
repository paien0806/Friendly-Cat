import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StoreStockItem, FoodCategory, FoodSubCategory, Item } from '../../model/seven-eleven.model';  // 根據你的實際路徑導入模型
import { SevenElevenRequestService } from '../services/seven-eleven-request.service';  // 確保這個服務有方法可以查詢商店商品數量

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnChanges {
  @Input() store!: StoreStockItem;  // 接收父組件傳遞的 store
  @Input() category!: FoodCategory;  // 接收父組件傳遞的 category

  subCategories: FoodSubCategory[] = [];
  totalSubCategoryQty: number = 0;
  itemsBySubCategory: { [key: string]: Item[] } = {};  // 儲存每個子分類的商品列表

  constructor(private sevenElevenRequestService: SevenElevenRequestService) {}

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
      // 根據 storeNo 查詢商品資料
      this.sevenElevenRequestService.getItemsByStoreNo(this.store.StoreNo).subscribe(response => {
        if (response.isSuccess && response.element.StoreStockItemList) {
          // 處理返回的數據並分類
          this.subCategories.forEach(subCategory => {
            const items: Item[] = [];

            // 循環所有商店的庫存項目，根據子分類名稱過濾
            response.element.StoreStockItemList.forEach((storeItem: StoreStockItem) => {  // 顯式聲明 storeItem 類型
              storeItem.CategoryStockItems.forEach(category => {
                if (category.Name === subCategory.Name) {
                  // 合併所有對應的商品
                  items.push(...category.ItemList);
                }
              });
            });

            // 把每個子分類的商品資料保存到 itemsBySubCategory
            this.itemsBySubCategory[subCategory.Name] = items;
          });
          this.calculateTotalQty();  // 重新計算累計數量
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
}
