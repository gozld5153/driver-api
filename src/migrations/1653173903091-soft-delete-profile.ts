import { MigrationInterface, QueryRunner } from "typeorm";

export class softDeleteProfile1653173903091 implements MigrationInterface {
    name = 'softDeleteProfile1653173903091'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`profiles\` DROP COLUMN \`deletedAt\``);
    }

}
