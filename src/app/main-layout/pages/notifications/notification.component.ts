import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { AuthService } from 'src/app/@shared/services/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notificationList: any[] = [];
  activePage = 1;
  hasMoreData = false;
  userData: any;

  constructor(
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) { }
  
  ngOnInit(): void {
    this.authService.loggedInUser$.subscribe((data) => {
      this.userData = data.profileId;
      this.getNotificationList();
    });
  }

  getNotificationList() {
    this.spinner.show();
    const id = this.userData;
    const data = {
      page: this.activePage,
      size: 30,
    };
    this.commonService.getNotificationList(parseInt(id), data).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (this.activePage < res.pagination.totalPages) {
          this.hasMoreData = true;
        }
        this.notificationList = [...this.notificationList, ...res?.data];
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  viewUserPost(id) {
    this.router.navigate([`post/${id}`]);
  }

  removeNotification(id: number): void {
    this.commonService.deleteNotification(id).subscribe({
      next: (res: any) => {
        this.toastService.success(
          res.message || 'Notification delete successfully'
        );
        this.notificationList = this.notificationList.filter(
          (notification) => notification.id !== id
        );
        if (this.notificationList.length <= 6 && this.hasMoreData) {
          this.notificationList = [];
          this.loadMoreNotification();
        }
      },
    });
  }

  readUnreadNotification(notification, isRead): void {
    this.commonService
      .readUnreadNotification(notification.id, isRead)
      .subscribe({
        next: (res) => {
          this.toastService.success(res.message);
          notification.isRead = isRead;
        },
      });
  }

  loadMoreNotification(): void {
    this.activePage = this.activePage + 1;
    this.getNotificationList();
  }
}
