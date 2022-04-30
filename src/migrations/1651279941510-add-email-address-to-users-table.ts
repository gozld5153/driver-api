import { MigrationInterface, QueryRunner } from "typeorm";

export class addEmailAddressToUsersTable1651279941510 implements MigrationInterface {
    name = 'addEmailAddressToUsersTable1651279941510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email\``);
    }

}
