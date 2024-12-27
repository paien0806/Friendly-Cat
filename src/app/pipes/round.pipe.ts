import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'round'
})
export class RoundPipe implements PipeTransform {

  transform(value: any, precision: number = 0): any {
    // 嘗試將輸入轉換為數字
    const numericValue = parseFloat(value);

    // 檢查是否是有效的數字
    if (isNaN(numericValue)) {
      return value;  // 如果不是有效的數字，返回原始輸入
    }

    // 使用 Math.round() 進行四捨五入
    const factor = Math.pow(10, precision); // 計算小數位數
    return Math.round(numericValue * factor) / factor; // 四捨五入到指定的精度
  }

}
