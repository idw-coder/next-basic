import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Quiz } from './Quiz';

@Entity('quiz_choice')
export class QuizChoice {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true, name: 'quiz_id' })
  quizId!: number;

  @Column({ type: 'text', name: 'choice_text' })
  choiceText!: string;

  @Column({ type: 'tinyint', name: 'is_correct' })
  isCorrect!: boolean;

  @Column({ type: 'int', nullable: true, name: 'display_order' })
  displayOrder?: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('Quiz', 'choices', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;
}
