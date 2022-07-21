import { MigrationInterface, QueryRunner } from "typeorm";

export class addFriendToUsersTable1658406694745 implements MigrationInterface {
    name = 'addFriendToUsersTable1658406694745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`friendId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_4f3e4d2bd7c70f828e02233316\` (\`friendId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_4f3e4d2bd7c70f828e02233316\` ON \`users\` (\`friendId\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4f3e4d2bd7c70f828e022333166\` FOREIGN KEY (\`friendId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4f3e4d2bd7c70f828e022333166\``);
        await queryRunner.query(`DROP INDEX \`REL_4f3e4d2bd7c70f828e02233316\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_4f3e4d2bd7c70f828e02233316\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`friendId\``);
    }

}
