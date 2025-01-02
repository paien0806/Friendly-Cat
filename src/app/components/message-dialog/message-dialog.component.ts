import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  message: string;

  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // 接收傳遞的數據
  ) {
    // 設置傳遞的訊息
    this.message = data.message || '請稍後再試';
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
