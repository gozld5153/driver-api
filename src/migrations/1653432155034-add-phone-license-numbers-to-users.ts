import { MigrationInterface, QueryRunner } from "typeorm";

export class addPhoneLicenseNumbersToUsers1653432155034 implements MigrationInterface {
    name = 'addPhoneLicenseNumbersToUsers1653432155034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phoneNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`licenseNumber\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`licenseNumber\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phoneNumber\``);
    }

}
