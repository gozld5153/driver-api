import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrganizationDetails1653148464461 implements MigrationInterface {
    name = 'addOrganizationDetails1653148464461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`licenseNumber\` varchar(255) NOT NULL DEFAULT 'not-registered'`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`profileImage\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`phoneNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`address\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`isVerified\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`isVerified\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`phoneNumber\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`profileImage\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`licenseNumber\``);
    }

}
