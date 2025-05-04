import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Document } from './document.entity';
import { Signer } from './signer.entity';

@Entity()
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column({ nullable: true })
  signerId: string;

  @Column()
  type: 'signature' | 'date' | 'initials' | 'text';

  @Column()
  page: number;

  @Column('float')
  x: number;

  @Column('float')
  y: number;

  @Column('float')
  width: number;

  @Column('float')
  height: number;

  @Column({ default: true })
  required: boolean;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  signedAt: Date;

  @ManyToOne(() => Document, document => document.fields)
  document: Document;

  @ManyToOne(() => Signer, signer => signer.fields)
  signer: Signer;
}