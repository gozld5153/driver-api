import { MigrationInterface, QueryRunner } from "typeorm";

export class roadAddressFromRoadAdress1653077905609 implements MigrationInterface {
    name = 'roadAddressFromRoadAdress1653077905609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`places\` CHANGE \`roadAdress\` \`roadAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE \`places\` DROP COLUMN \`roadAddress\``);
        await queryRunner.query(`ALTER TABLE \`places\` ADD \`roadAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`offer\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'none') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`places\` DROP COLUMN \`roadAddress\``);
        await queryRunner.query(`ALTER TABLE \`places\` ADD \`roadAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`role\` \`role\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'none') NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE \`places\` CHANGE \`roadAddress\` \`roadAdress\` varchar(255) NULL`);
    }

}
