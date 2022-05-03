import { MigrationInterface, QueryRunner } from "typeorm";

export class addStatusToUsesTable1651540071095 implements MigrationInterface {
    name = 'addStatusToUsesTable1651540071095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
    }

}
