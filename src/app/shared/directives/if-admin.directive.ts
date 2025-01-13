import {DestroyRef, Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef,} from "@angular/core";
import {UserService} from "../../core/_service/user.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Role} from '../../core/models/user.model';

@Directive({
  selector: "[ifAdminRole]",
  standalone: true,
})
export class IfAdminRoleDirective<T> implements OnInit {
  destroyRef = inject(DestroyRef);

  @Input() ifAdminRole: boolean = true;
  hasView = false;

  constructor(
    private templateRef: TemplateRef<T>,
    private userService: UserService,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit() {
    this.userService.currentUser
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const shouldShow = this.ifAdminRole ? user?.role === Role.ADMIN : user?.role !== Role.ADMIN;
        if (shouldShow && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!shouldShow && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }
}
