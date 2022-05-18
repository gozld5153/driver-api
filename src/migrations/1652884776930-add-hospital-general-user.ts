import { MigrationInterface, QueryRunner } from "typeorm";

export class addHospitalGeneralUser1652884776930 implements MigrationInterface {
    name = 'addHospitalGeneralUser1652884776930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`identifier\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'none') NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'none') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'none') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'none') NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`password\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`identifier\``);
    }

}
