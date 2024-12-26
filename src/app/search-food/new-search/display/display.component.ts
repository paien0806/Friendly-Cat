import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { StoreStockItem, FoodCategory, FoodSubCategory, Item, CategoryStockItem } from '../../model/seven-eleven.model';  // 根據你的實際路徑導入模型
import { SevenElevenRequestService } from '../services/seven-eleven-request.service';  // 確保這個服務有方法可以查詢商店商品數量
import { HttpClient } from '@angular/common/http';

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

  FoodPrices: any = [];

  constructor(
    private sevenElevenRequestService: SevenElevenRequestService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.sevenElevenRequestService.getFoodDetails().subscribe((data) => {
      this.FoodPrices = data;
      console.log(this.FoodPrices);
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
}
