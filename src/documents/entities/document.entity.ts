import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany,
  ManyToOne
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Signer } from './signer.entity';
import { Field } from './field.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  userId: string;

  @Column()
  originalFilename: string;

  @Column()
  storagePath: string;

  @Column({ nullable: true })
  flattenedPath: string;

  @Column({ default: 'draft' })
  status: 'draft' | 'sent' | 'completed';

  @OneToMany(() => Signer, signer => signer.document)
  signers: Signer[];

  @OneToMany(() => Field, field => field.document)
  fields: Field[];

  @ManyToOne(() => User, user => user.documents)
  user: User; 

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}