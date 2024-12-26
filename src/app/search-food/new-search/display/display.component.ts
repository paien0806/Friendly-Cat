import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StoreStockItem, FoodCategory, FoodSubCategory } from '../../model/seven-eleven.model';  // 根據你的實際路徑導入模型

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

  ngOnChanges(changes: SimpleChanges): void {
    // 當 @Input 屬性發生變化時觸發此方法
    if (changes['category'] || changes['store']) {
      this.loadSubCategories();  // 重新加載子分類資料
    }
  }

  loadSubCategories() {
    if (this.store && this.category) {
      this.subCategories = this.category.Children;  // 更新子分類列表
      this.calculateTotalQty();  // 重新計算子分類的數量
    }
  }

  calculateTotalQty() {
    this.totalSubCategoryQty = 0;
    this.subCategories.forEach(subCategory => {
      this.totalSubCategoryQty += this.getSubCategoryQty(subCategory.Name);
    });
  }

  getSubCategoryQty(subCategoryName: string): number {
    let qty = 0;
    if (this.store && this.store.CategoryStockItems) {
      this.store.CategoryStockItems.forEach(item => {
        if (item.Name === subCategoryName) {
          qty = item.RemainingQty;
        }
      });
    }
    return qty;
  }
}
