import { MigrationInterface, QueryRunner } from "typeorm";

export class addPhoneNumberToProfile1653168978964 implements MigrationInterface {
    name = 'addPhoneNumberToProfile1653168978964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`phoneNumber\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`address\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`phoneNumber\``);
    }

}
