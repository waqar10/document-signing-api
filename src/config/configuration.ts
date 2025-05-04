export default () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'documentsigning',
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secretKey',
      expiresIn: '1d',
    },
    storage: {
      type: process.env.STORAGE_TYPE || 'local',
      localPath: process.env.STORAGE_PATH || './storage',
    },
  });