import { MigrationInterface, QueryRunner } from "typeorm";

export class addPushTokenToUsersTable1651466272784 implements MigrationInterface {
    name = 'addPushTokenToUsersTable1651466272784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`pushToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`pushToken\``);
    }

}
