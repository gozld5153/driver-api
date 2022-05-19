import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderDetails1652965062599 implements MigrationInterface {
    name = 'addOrderDetails1652965062599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`places\` ADD \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`places\` ADD \`roadAdress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`clientPhoneNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`patientName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`patientPhoneNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`companionName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`companionPhoneNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`gear\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`etc\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`status\` \`status\` enum ('pending', 'accepted', 'rejected', 'timeout', 'cancled') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`status\` \`status\` enum ('pending', 'accepted', 'rejected', 'timeout') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`etc\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`gear\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`companionPhoneNumber\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`companionName\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`patientPhoneNumber\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`patientName\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`clientPhoneNumber\``);
        await queryRunner.query(`ALTER TABLE \`places\` DROP COLUMN \`roadAdress\``);
        await queryRunner.query(`ALTER TABLE \`places\` DROP COLUMN \`address\``);
    }

}
