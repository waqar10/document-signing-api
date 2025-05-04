import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Document } from './document.entity';
import { Field } from './field.entity';

@Entity()
export class Signer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed';

  @ManyToOne(() => Document, document => document.signers)
  document: Document;

  @OneToMany(() => Field, field => field.signer)
  fields: Field[];
}