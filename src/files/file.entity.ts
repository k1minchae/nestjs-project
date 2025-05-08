import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("File")
export class File {
  @PrimaryGeneratedColumn({ type: "bigint" })
  file_id: number;

  @Column()
  post_id: number;

  @Column({ length: 56 })
  file_title: string;

  @Column({ length: 2048 })
  file_path: string;

  @Column()
  file_size: number;

  @Column({ length: 126 })
  file_type: string;

  @Column({ default: false })
  is_delete: boolean;
}
