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
      return value; // 如果不是有效的數字，返回原始輸入
    }
  
    // 判斷數值是否小於 1000
    if (numericValue < 1000) {
      const factor = Math.pow(10, precision); // 計算小數位數
      const roundedValue = Math.round(numericValue * factor) / factor; // 四捨五入到指定精度
      return `${roundedValue} 公尺`; // 返回數字加 ' 公尺'
    } else {
      const kilometers = numericValue / 1000; // 將數字轉換為公里
      const roundedKilometers = Math.round(kilometers * 10) / 10; // 四捨五入到小數點後一位
      return `${roundedKilometers} 公里`; // 返回數字加 ' 公里'
    }
  }  
}
