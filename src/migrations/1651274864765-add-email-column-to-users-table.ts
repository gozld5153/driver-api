import {MigrationInterface, QueryRunner} from "typeorm";

export class addEmailColumnToUsersTable1651274864765 implements MigrationInterface {
    name = 'addEmailColumnToUsersTable1651274864765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email\``);
    }

}
