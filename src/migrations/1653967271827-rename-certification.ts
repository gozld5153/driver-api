import { MigrationInterface, QueryRunner } from "typeorm";

export class renameCertification1653967271827 implements MigrationInterface {
    name = 'renameCertification1653967271827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`certifications\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL DEFAULT 'hero'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`certifications\` CHANGE \`type\` \`type\` enum ('driver', 'hero', 'agency', 'client', 'client-manager', 'client-public', 'admin', 'none') NOT NULL DEFAULT 'none'`);
    }

}
