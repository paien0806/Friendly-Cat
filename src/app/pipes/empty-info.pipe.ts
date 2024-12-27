import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyInfo'
})
export class EmptyInfoPipe implements PipeTransform {

  transform(value: string): string {
    // 如果字串為空，回傳 "暫無資訊"
    return value === '' ? '暫無資訊' : value;
  }

}
