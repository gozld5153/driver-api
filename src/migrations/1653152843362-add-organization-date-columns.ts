import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrganizationDateColumns1653152843362 implements MigrationInterface {
    name = 'addOrganizationDateColumns1653152843362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`organizations\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`organizations\` DROP COLUMN \`createdAt\``);
    }

}
