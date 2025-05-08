import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum NotificationType {
  LIKE = "like",
  COMMENT = "comment",
  POST_UPDATE = "post_update",
}

@Entity("Notifications")
export class Notification {
  @PrimaryGeneratedColumn({ type: "bigint" })
  notification_id: number;

  @Column({ nullable: true })
  like_id: number;

  @Column({ nullable: true })
  post_id: number;

  @Column({ nullable: true })
  comment_id: number;

  @Column()
  source_user_id: number;

  @Column()
  recipient_id: number;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  notification_type: NotificationType;

  @Column({ length: 126 })
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @Column()
  created_at: Date;
}
