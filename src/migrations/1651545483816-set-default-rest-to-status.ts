import { MigrationInterface, QueryRunner } from "typeorm";

export class setDefaultRestToStatus1651545483816 implements MigrationInterface {
    name = 'setDefaultRestToStatus1651545483816'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'rest'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`status\` \`status\` varchar(255) NOT NULL`);
    }

}
