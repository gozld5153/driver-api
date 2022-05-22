import { MigrationInterface, QueryRunner } from "typeorm";

export class organizationsIsVerifiedDefaultFalse1653151892612 implements MigrationInterface {
    name = 'organizationsIsVerifiedDefaultFalse1653151892612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` CHANGE \`isVerified\` \`isVerified\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`organizations\` CHANGE \`isVerified\` \`isVerified\` tinyint NOT NULL`);
    }

}
