import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuizCategory } from './QuizCategory';
import type { QuizChoice } from './QuizChoice';

@Entity('quiz')
export class Quiz {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'category_id' })
  categoryId!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'author_id' })
  authorId!: number;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToOne(() => QuizCategory, (category) => category.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: QuizCategory;

  @OneToMany('QuizChoice', 'quiz')
  choices!: QuizChoice[];
}
