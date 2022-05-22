import { MigrationInterface, QueryRunner } from "typeorm";

export class addLicenseNumberToProfile1653168209230 implements MigrationInterface {
    name = 'addLicenseNumberToProfile1653168209230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`licenseNumber\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`licenseNumber\``);
    }

}
